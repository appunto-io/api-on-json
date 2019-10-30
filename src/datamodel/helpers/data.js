var kebabCase = require('lodash.kebabcase');

const writeInputFilter = (data, flow, meta) => flow.continue(meta.request.body);


/*
Create POST callback
Add a new document in the collection. Document validation
is performed by mongoose.
 */
const createPostCallback = (name) => async (data = {}, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const { db } = meta.environment;

  try {
    const saved = await db.create(name, data);
    emit('created', {
      collection : name,
      data       : [saved]
    });

    return flow.continue(saved);
  }
  catch (error) {
    return flow.stop(400, error);
  }
};

/*
Create PUT callback
 */
const createPutCallback = (name) => async (data = {}, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const { db } = meta.environment;
  const id  = meta.request.params['id'];

  try {
    const saved = await db.update(name, id, data);

    emit('replaced', {
      collection : name,
      data       : [saved]
    });

    return flow.continue(saved);
  }
  catch (error) {
    return flow.stop(400, error);
  }
};

/*
Create PATCH callback
 */
const createPatchCallback = (name) => async (data = {}, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const { db } = meta.environment;
  const id   = meta.request.params['id'];

  try {
    const saved = await db.patch(name, id, data);

    if (!saved) {
      /*
      TBD: Generate consistent error messaging
       */
      return flow.stop(404, {error : 'DocumentNotFound'});
    }

    emit('updated', {
      collection : name,
      data       : [saved]
    });

    return flow.continue(saved);
  }
  catch (error) {
    return flow.stop(400, error);
  }
};

/*
Create GET callback retireving a paginated list of documents
 */
const createGetManyCallback = (name) => async (data, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const { db } = meta.environment;
  const { request, response } = meta;
  let { page, pageSize } = request.query;
  page     = page * 1     || 0;
  pageSize = pageSize * 1 || 30;

  try {
    const { documents, count, cursor } = await db.readMany(name, request.query);

    emit('read', {
      collection : name,
      data       : documents
    });

    response.headers['X-Total-Count'] = count;
    return flow.continue({
      data       : documents,
      pagination : {
        page,
        pageSize,
        pagesCount : Math.ceil(count / pageSize),
        itemsCount : count,
        cursor
      }
    });
  }
  catch (error) {
    console.error(error);
    return flow.stop(400, error);
  }
};

/*
Create GET callback that retrieves one object
 */
const createGetCallback = (name) => async (data, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const { db } = meta.environment;
  const id = meta.request.params['id'];

  try {
    const document = await db.readOne(name, id);

    if (document) {

      emit('read', {
        collection : name,
        data       : [document]
      });

      return flow.continue(document);
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
const createDeleteCallback = (name) => async (data, flow, meta) => {
  const { emit = ()=>{}} = meta.environment || {};
  const { db } = meta.environment;
  const id = meta.request.params['id'];

  try {
    const deletedDocument = await db.remove(name, id);

    if (deletedDocument) {

      emit('deleted', {
        collection : name,
        data       : [deletedDocument]
      });

      return flow.continue(deletedDocument);
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

const createLibraryFromDataModel = (dbModels) => {
  const library = {};
  Object.entries(dbModels).forEach(([name]) => {

    library[`get-many-${name}`]    = createGetManyCallback(name);
    library[`post-${name}`]        = createPostCallback(name);
    library[`get-one-${name}`]     = createGetCallback(name);
    library[`put-${name}`]         = createPutCallback(name);
    library[`delete-${name}`]      = createDeleteCallback(name);
    library[`patch-${name}`]       = createPatchCallback(name);
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
