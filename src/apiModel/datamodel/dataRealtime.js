var kebabCase = require('lodash.kebabcase');


function createDisconnectCallback() {
  var res = 'DisconnectLog: user disconnected';
  console.log(res);
  return res;
}

function createMessageCallback(message) {
  return message + ' changed';
}

function callback(socket, item) {
  socket.emit('message', 'Update: ' + JSON.stringify(item, null, 2));
}

function createConnectCallback(data, meta) {
  const { query, socket, env, path } = meta;
  const { db } = env;

  db.observe(path, query, null, socket, callback);
}

const createRealtimeApiFromDataModel = (dataModel) => {
  const apiModel = {};

  Object.keys(dataModel).forEach(name => {
    const kebabName = kebabCase(name);

    apiModel[`/${kebabName}`] = {
      realTime : {
        'connect'    : `::connect`,
        'message'    : `::message`,
        'disconnect' : `::disconnect`,
      },
      '/:id' : {
        realTime : {
          'connect'    : `::connect`,
          'message'    : `::message`,
          'disconnect' : `::disconnect`,
        }
      }
    };
  });

  return apiModel;
};

const createRealtimeLibraryFromDataModel = (dbModels) => {
  const library = {};
  Object.entries(dbModels).forEach(() => {

    library[`connect`]    = [createConnectCallback];
    library[`message`]    = [createMessageCallback];
    library[`disconnect`] = [createDisconnectCallback];
  });

  return library;
};


module.exports = {
  createRealtimeApiFromDataModel,
  createRealtimeLibraryFromDataModel
};
