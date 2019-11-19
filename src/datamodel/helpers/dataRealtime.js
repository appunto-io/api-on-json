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
  socket.emit('update', 'Update: ' + JSON.stringify(item, null, 2));
}

function createConnectCallback(data, meta) {
  const { query, socket, env, path } = meta;
  const { db } = env;

  db.observe(path, query, socket, callback);
}

const createRealtimeApiFromDataModel = (dataModel, realTimePaths) => {

  const apiModel = {};
  const allRealTime = realTimePaths === true;

  Object.keys(dataModel).forEach(name => {
    if (allRealTime || realTimePaths.includes(name)) {
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
    }
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
