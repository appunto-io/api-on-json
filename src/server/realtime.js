const io = require('socket.io');

function createRegExp(name, ...subNamespaces) {
  var reg = `^${name}(\/:(\\w*\\d*))*`;
  if (subNamespaces.length > 0) {
    subNamespaces = subNamespaces[0];
    subNamespaces[0][0] = '/model';
    for (let i = 0; i < subNamespaces.length; i++) {
      if (subNamespaces[i][0].includes('/') && !subNamespaces[i][0].includes(':')) {
        reg = reg + `${subNamespaces[i][0]}(\/:(\\w*\\d*))*`;
      }
    }
  }
  reg += '$';
  return new RegExp(reg);
}

async function connectCallback(regExp, socket) {
  socket.of(regExp).on('connection', (socket)=>{

    console.log('user connected to dynamic cars');
    socket.emit('message', 'New connection at: ' + socket.nsp.name);

    var query = {};
    for (field in socket.handshake.query) {
      if (field != 'EIO' && field != 'transport' && field != 't') {
        query[field] = socket.handshake.query[field];
      }
    }
    if (Object.entries(query).length != 0) {
      socket.join(query.cursor); //create a new room with the query as name
      socket.emit('message', 'joined the room with this cursor: ' + query.cursor);
    }

    socket.on('disconnect', ()=>{
      console.log('user disconnected from cars')
    })
  });
}

async function hydrateRealtime(apiModel, http, app) {
  var socket = io(http);
  const fields = Object.entries(apiModel);
  for (let i = 0; i < fields.length; i++) {
    const model = fields[i];
    if (model[0].includes('/')) {
      const regExpNamespace = createRegExp(model[0]);
      const regExpNamespaceSubs = createRegExp(model[0], Object.entries(model[1]));
      connectCallback(regExpNamespace, socket);
      connectCallback(regExpNamespaceSubs, socket);
    }
  }
}

module.exports = hydrateRealtime
