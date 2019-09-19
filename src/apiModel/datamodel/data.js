var kebabCase = require('lodash.kebabcase');

/*
Changes _id to id and removes __v from retrieved documents
 */
const convertDocumentToObject = (document) =>
  document.toObject({
    transform : (doc, ret, options) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;

      return ret;
    }
  });

const convertAPIFieldToMongo = field => {
  switch (field) {
    case 'id':
      return '_id';
    default:
      return field;
  }
};


const writeInputFilter = (data, flow, meta) => flow.continue(meta.request.body);


/*
Create POST callback
Add a new document in the collection. Document validation
is performed by mongoose.
 */
const createPostCallback = (name, Model) => async (data, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const document = new Model();

  Model.schema.eachPath(field => {
    if (field in data) {
      document.set(field, data[field]);
    }
  });

  try {
    const saved     = await document.save();
    const converted = convertDocumentToObject(saved);

    emit('created', {
      collection : name,
      data       : [converted]
    });

    return flow.continue(converted);
  }
  catch (error) {
    return flow.stop(400, error);
  }
};

/*
Create PUT callback
 */
const createPutCallback = (name, Model) => async (data, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const id  = meta.request.params['id'];
  const obj = {};

  Model.schema.eachPath(field => {
    if (field in data) {
      obj[field] = data[field];
    }
  });

  try {
    await new Model(obj).validate();
    const saved = await Model.findByIdAndUpdate(id, obj, {
      new                 : true,
      upsert              : true,
      runValidators       : true,
      setDefaultsOnInsert : true
    });
    const converted = convertDocumentToObject(saved);

    emit('replaced', {
      collection : name,
      data       : [converted]
    });

    return flow.continue(converted);
  }
  catch (error) {
    return flow.stop(400, error);
  }
};

/*
Create PATCH callback
 */
const createPatchCallback = (name, Model) => async (data, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const id   = meta.request.params['id'];
  const obj  = {};

  Model.schema.eachPath(field => {
    if (field in data) {
      obj[field] = data[field];
    }
  });

  try {
    const saved = await Model.findByIdAndUpdate(id, obj, {
      new           : true,
      upsert        : false,
      runValidators : true
    });

    if (!saved) {
      /*
      TBD: Generate consistent error messaging
       */
      return flow.stop(404, {error : 'DocumentNotFound'});
    }

    const converted = convertDocumentToObject(saved);

    emit('updated', {
      collection : name,
      data       : [converted]
    });

    return flow.continue(converted);
  }
  catch (error) {
    return flow.stop(400, error);
  }
};


/*
Create GET callback retireving a paginated list of documents
 */
const createGetManyCallback = (name, Model) => async (data, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const { request, response } = meta;
  let { page, pageSize, sort, order, ...restOfQuery } = request.query;

  page     = page * 1     || 0;
  pageSize = pageSize * 1 || 30;
  sort     = convertAPIFieldToMongo(sort) || null;
  order    = (order + '').toLowerCase() === 'asc' ? 'asc' : 'desc';

  const mongoQuery = {};

  Object.entries(restOfQuery).forEach(([field, values]) => {
    const valuesArray = values.split(',').map(val => decodeURIComponent(val));
    const mongoValue  = valuesArray.length > 1 ?
      {'$in' : valuesArray} :
      decodeURIComponent(values);

    mongoQuery[convertAPIFieldToMongo(field)] = mongoValue;
  });

  try {
    const documents = await Model.find(mongoQuery)
      .sort(sort ? {[sort] : order} : {})
      .skip(page * pageSize)
      .limit(pageSize);
    const count     = await Model.countDocuments();
    const converted = documents.map(document => convertDocumentToObject(document));

    emit('read', {
      collection : name,
      data       : converted
    });

    response.headers['X-Total-Count'] = count;
    return flow.continue({
      data       : converted,
      pagination : {
        page,
        pageSize,
        pagesCount : Math.ceil(count / pageSize),
        itemsCount : count
      }
    });
  }
  catch (error) {
    return flow.stop(400, error);
  }
};

/*
Create GET callback that retrieves one object
 */
const createGetCallback = (name, Model) => async (data, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const id = meta.request.params['id'];

  try {
    const document = await Model.findById(id);

    if (document) {
      const converted = convertDocumentToObject(document);

      emit('read', {
        collection : name,
        data       : [converted]
      });

      return flow.continue(converted);
    }

    return flow.stop(404);
  }
  catch (error) {
    return flow.stop(400, error);
  }
};


/*
Create DELETE callback
 */
const createDeleteCallback = (name, Model) => async (data, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const id = meta.request.params['id'];

  try {
    const deletedDocument = await Model.findByIdAndDelete(id);

    if (deletedDocument) {
      const converted = convertDocumentToObject(deletedDocument);

      emit('deleted', {
        collection : name,
        data       : [converted]
      });

      return flow.continue(converted);
    }

    return flow.stop(404);
  }
  catch (error) {
    return flow.stop(400, error);
  }
};


const createApiFromDataModel = (dataModel) => {
  const apiModel = {};

  Object.keys(dataModel).forEach(name => {
    const kebabName = kebabCase(name);

    apiModel[`/${kebabName}`] = {
      handlers : {
        'GET'  : `::get-many-${name}`,
        'POST' : `::post-${name}`
      },
      filters : {
        'POST' : `::post-${name}-input`
      },

      '/:id' : {
        handlers : {
          'GET'    : `::get-one-${name}`,
          'PUT'    : `::put-${name}`,
          'DELETE' : `::delete-${name}`,
          'PATCH'  : `::patch-${name}`
        },
        filters : {
          'PUT'   : `::put-${name}-input`,
          'PATCH' : `::patch-${name}-input`
        }
      }
    };
  });

  return apiModel;
};

const createLibraryFromDataModel = (mongooseModels) => {
  const library = {};

  Object.entries(mongooseModels).forEach(([name, model]) => {
    library[`get-many-${name}`]    = createGetManyCallback(name, model);
    library[`post-${name}`]        = createPostCallback(name, model);
    library[`get-one-${name}`]     = createGetCallback(name, model);
    library[`put-${name}`]         = createPutCallback(name, model);
    library[`delete-${name}`]      = createDeleteCallback(name, model);
    library[`patch-${name}`]       = createPatchCallback(name, model);
    library[`post-${name}-input`]  = writeInputFilter;
    library[`put-${name}-input`]   = writeInputFilter;
    library[`patch-${name}-input`] = writeInputFilter;
  });

  return library;
};


module.exports = {
  createApiFromDataModel,
  createLibraryFromDataModel
};
