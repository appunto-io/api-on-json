async function dataModelToRethink(model, database) {
  const models = {};
  const tableList = await database.tableList().run();
  const entries = Object.entries(model);

  for (var i = 0; i < entries.length; i = i + 1) {
    const name       = entries[i][0];
    const definition = entries[i][1];
    const schema     = definition['schema'];
    const fields     = Object.entries(schema);

    //If the table already exists with the same name no error raised but the dBModel will take the new def
    if (!tableList.includes(name)) {
      await database.tableCreate(name).run();
    }

    const indexList = await database.table(name).indexList().run();
    for (var j = 0; j < fields.length; j = j + 1) {
      const field = fields[j][0];
      const spec  = fields[j][1];

      if (!indexList.includes(field) && ('index' in spec || 'unique' in spec)) {
          await database.table(name).indexCreate(field).run();
          await database.table(name).indexWait(field).run();
      }
    }
    models[name] = definition;
  }
  return models;
}

class Rethink {
  constructor(host, port, dbName, options) {
    this.host     = host;
    this.port     = port;
    this.dbName   = dbName;
    this.options  = options;
    this.database = null;
    this.models   = null;
  }

  async connect() {
    this.database = require('rethinkdbdash')({
      port: this.port,
      host: this.host,
      db:   this.dbName
    });
  }

  async init(dataModel) {
    const dbList = await this.database.dbList().run();

    if (!dbList.includes(this.dbName)) {
      await this.database.dbCreate(this.dbName).run();
    }

    var models = await dataModelToRethink(dataModel, this.database);
    this.models = models;
  }

  /*------------------------------------------------------------
    CRUD
  */


  /************
  Create: Handle POST request
  */
  async create(collection, data = {}) {
    const obj     = {};
    const model   = this.models[collection]['schema'];
    const options = this.models[collection]['options'];
    const fields = Object.entries(model);

    for (var i = 0; i < fields.length; i = i + 1) {
      const field = fields[i][0];
      const spec  = fields[i][1];

      let { required, unique, default: defaultValue } = spec;

      required      = !!required;
      unique        = !!unique;


      if (field in data) {
        obj[field] = data[field];
      }
      else if ('default' in spec) {
          obj[field] = defaultValue;
      }

      if (required) {
        if (!obj[field]) {
          const message = `This field: ${field} is required.`;

          console.error(message);
          throw new Error(message);
        }
      }

      if (unique) {
        const fieldExist = await this.database.table(collection).getAll(obj[field], { index: field }).run();
        if (fieldExist.length > 0) {
          const message = `This field: ${field} already exist with this value: ${obj[field]} and is meant to be unique.`;

          console.error(message);
          throw new Error(message);
        }
      }
    }

    if (options['timestamps']) {
      const createdAt = options['timestamps']['createdAt'] ? options['timestamps']['createdAt'] : 'createdAt';
      const updatedAt = options['timestamps']['updatedAt'] ? options['timestamps']['updatedAt'] : 'updatedAt';
      obj[createdAt] = new Date();
      obj[updatedAt] = new Date();
    }

    var changes = await this.database.table(collection)
      .changes({ includeInitial: false })
      .run();

    await this.database.table(collection).insert(obj).run();

    return changes['_data'][0][0]['new_val'];
  }


  /************
  Remove: Handle DELETE request
  */
  async remove(collection, id) {
    return await this.database.table(collection).get(id).delete().run();
  }


  /************
  ReadOne: Handle GET request on specific ID
  */
  async readOne(collection, id) {
    return await this.database.table(collection).get(id).run();
  }


  /************
  ReadMany: Handle GET request with query
  */
  async readMany(collection, query = {}, options = {}) {
    const model = this.models[collection]['schema'];
    let { page, pageSize, sort, order, cursor, ...restOfQuery } = query;
    order      = (order + '').toLowerCase() === 'desc' ? 'desc' : 'asc';
    sort       = sort ? sort : [];
    page       = page * 1     || 0;
    pageSize   = pageSize * 1 || 30;

    const delimiter = ';';
    let results;
    var orderingBy = [];

    var filters = [];

    for (let elem in restOfQuery) {
      if (elem in model) {
        var values = restOfQuery[elem].split(',');
        var filter = this.database.row(elem).eq(values[0]);

        for (let i = 1; i < values.length; i++) {
          filter = filter.or(this.database.row(elem).eq(values[i]));
        }

        filters.push(filter);
      }
    }
    if (filters.length > 0) {
      for (let i = 1; i < filters.length; i++) {
        filters[0] = filters[0].and(filters[i]);
      }
    }
    else {
      filters[0] = true;
    }

    if (Array.isArray(sort)) {
      for (let i = 0; i < sort.length; i++) {
        var [ elem_sort, elem_order ] = sort[i].split(',');
        elem_order = (elem_order + '').toLowerCase() === 'desc' ? 'desc' : order;
        if (model[elem_sort]) {
          orderingBy.push(this.database[elem_order](elem_sort));
        }
      }
    }
    else {
      var [ elem_sort, elem_order ] = sort.split(',');
      elem_order = (elem_order + '').toLowerCase() === 'desc' ? 'desc' : order;
      if (model[elem_sort]) {
        orderingBy.push(this.database[elem_order](elem_sort));
      }
    }

    orderingBy.push(this.database[order]('id'));

    if (cursor) {
      if (cursor.includes(delimiter)) {
        const [ fieldSort_encoded, nextSort_encoded, nextId ] = cursor.split(delimiter);

        const fieldSort = fieldSort_encoded;
        const nextSort  = nextSort_encoded;
        if (order === 'asc') {
          results = await this.database.table(collection)
            .filter(filters[0])
            .filter(
              this.database.row(fieldSort).gt(nextSort).or(
                this.database.row(fieldSort).eq(nextSort).and(
                  this.database.row('id').gt(nextId)
                )
              )
            )
            .orderBy(...orderingBy)
            .skip(page * pageSize)
            .limit(pageSize)
            .run();
        }
        else {
          results = await this.database.table(collection)
            .filter(filters[0])
            .filter(
              this.database.row(fieldSort).lt(nextSort).or(
                this.database.row(fieldSort).eq(nextSort).and(
                  this.database.row('id').lt(nextId)
                )
              )
            )
            .orderBy(...orderingBy)
            .skip(page * pageSize)
            .limit(pageSize)
            .run();
        }
      }
      else {
        if (order === 'asc') {
          results = await this.database.table(collection)
            .between(cursor, this.database.maxval, { leftBound: "open" })
            .filter(filters[0])
            .orderBy(...orderingBy)
            .skip(page * pageSize)
            .limit(pageSize)
            .run();
        }
        else {
          results = await this.database.table(collection)
            .between(this.database.minval, cursor, { rightBound: "open" })
            .filter(filters[0])
            .orderBy(...orderingBy)
            .skip(page * pageSize)
            .limit(pageSize)
            .run();
        }
      }
    }
    else {
      results = await this.database.table(collection)
        .filter(filters[0])
        .orderBy(...orderingBy)
        .skip(page * pageSize)
        .limit(pageSize)
        .run();
    }
    const count = await this.database.table(collection).count().run();
    var last = results.length > 0 ? results[results.length - 1].id : '';

    if (sort.length > 0) {
      const data       = results.length > 0 ? results[results.length - 1][sort] : '';
      let encoded_data = encodeURIComponent(data);

      let encoded_field = encodeURIComponent(sort);

      last = encoded_field + delimiter + encoded_data + delimiter + last;
    }

    return {
      documents: results,
      count: count,
      cursor: last
    };
  }


  /************
  Update: Handle PUT request
  */
  async update(collection, id, data) {
    const obj   = {id: id};
    const model = this.models[collection]['schema'];
    const options = this.models[collection]['options'];
    const entries = Object.entries(model);


    for (var i = 0; i < entries.length; i = i + 1) {
      const field = entries[i][0];
      const spec  = entries[i][1];

      let { required, unique, default: default_value } = spec;

      required      = required      ? required      : false;
      unique        = unique        ? unique        : false;
      default_value = default_value ? default_value : false;

      if (field in data) {
        obj[field] = data[field];
      }
      else if (default_value) {
          obj[field] = default_value;
      }
      if (required) {
        if (!obj[field]) {
          const message = `This field: ${field} is required.`;

          console.error(message);
          throw new Error(message);
        }
      }
      if (unique) {
        const fieldExist = await this.database.table(collection).getAll(obj[field], { index: field }).run();
        if (fieldExist.length > 0) {
          const message = `This field: ${field} already exist with this value: ${obj[field]} and is meant to be unique.`;

          console.error(message);
          throw new Error(message);
        }
      }
    }

    if (options['timestamps']) {
      const createdAt = options['timestamps']['createdAt'] ? options['timestamps']['createdAt'] : 'createdAt';
      const updatedAt = options['timestamps']['updatedAt'] ? options['timestamps']['updatedAt'] : 'updatedAt';
      obj[createdAt] = new Date();
      obj[updatedAt] = new Date();
    }

    var changes = await this.database.table(collection)
      .changes({ includeInitial: false })
      .run();

    await this.database.table(collection).get(id).replace(obj).run();

    return changes['_data'][0][0]['new_val'];
  }


  /************
  Patch: Handle PATCH request
  */
  async patch(collection, id, data) {
    const obj   = {};
    const model = this.models[collection]['schema'];
    const options = this.models[collection]['options'];
    const entries = Object.entries(model);


    for (var i = 0; i < entries.length; i = i + 1) {
      const field = entries[i][0];
      const spec  = entries[i][1];

      let { required, unique, default: default_value } = spec;

      required      = required      ? required      : false;
      unique        = unique        ? unique        : false;
      default_value = default_value ? default_value : false;

      if (field in data) {
        obj[field] = data[field];
      }
      else if (default_value) {
          obj[field] = default_value;
      }

      if (required) {
        if (!obj[field]) {
          const message = `This field: ${field} is required.`;

          console.error(message);
          throw new Error(message);
        }
      }
      if (unique && obj[field]) {
        const fieldExist = await this.database.table(collection).getAll(obj[field], { index: field }).run();
        if (fieldExist.length > 0) {
          const message = `This field: ${field} already exist with this value: ${obj[field]} and is meant to be unique.`;

          console.error(message);
          throw new Error(message);
        }
      }
    }

    if (options['timestamps']) {

      const createdAt = options['timestamps']['createdAt'] ? options['timestamps']['createdAt'] : 'createdAt';
      const updatedAt = options['timestamps']['updatedAt'] ? options['timestamps']['updatedAt'] : 'updatedAt';
      obj[createdAt] = obj[createdAt] ? obj[createdAt] : new Date();
      obj[updatedAt] = new Date();
    }

    var changes = await this.database.table(collection)
      .changes({ includeInitial: false })
      .run();

    await this.database.table(collection).get(id).update(obj).run();

    return changes['_data'][0][0]['new_val'];
  }


  /************
  Observe: Allow to get changes on a selection in realtime
  */
  async observe(collection, query = {}, options = {}, socket, callback) {
    const model = this.models[collection]['schema'];
    let { page, pageSize, sort, order, cursor, ...restOfQuery } = query;

    var results;
    var filters = [];

    for (let elem in restOfQuery) {
      if (elem in model) {
        var values = restOfQuery[elem].split(',');
        var filter = this.database.row(elem).eq(values[0]);

        for (let i = 1; i < values.length; i++) {
          filter = filter.or(this.database.row(elem).eq(values[i]));
        }

        filters.push(filter);
      }
    }
    if (filters.length > 0) {
      for (let i = 1; i < filters.length; i++) {
        filters[0] = filters[0].and(filters[i]);
      }
      results = await this.database.table(collection)
        .filter(filters[0])
        .changes()
        .run(function(err, iterator) {
          iterator.each(function (err, item) {
            callback(socket, item);
          });
        });
    }

    if (query.length === 0) {
      results = await this.database.table(collection)
        .changes()
        .run(function(err, cursor) {
          cursor.each(function (err, item) {
            callback(socket, item);
          });
        });
    }
  }
}

module.exports = Rethink
