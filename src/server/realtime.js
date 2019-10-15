const io            = require('socket.io');
const jwt           = require('jsonwebtoken');

function _recCreateRegExp(name, reg, ...subNamespaces) {
  var subRegs = [];
  if (name[1] === ':') {
    reg = reg + '(\/(\\w*\\d*))';
  }
  else {
    reg = reg + `${name}`;
  }

  if (Array.isArray(subNamespaces[0])) {
    subNamespaces = subNamespaces[0];

    var auth = subNamespaces[1]['auth'] || false;

    if (subNamespaces[1]['handlers']) {
      subRegs.push([new RegExp(reg + '$'), auth]);
    }
    for (let i = 0; i < subNamespaces.length; i++) {
      if (subNamespaces[i][0]) {
        subRegs = subRegs.concat(_recCreateRegExp(subNamespaces[i][0], reg, subNamespaces[i]));
      }
    }
  }
  return subRegs;
}

function createRegExp(name, ...subNamespaces) {
  var regs = [];
  var reg = `^${name}`;

  if (subNamespaces.length > 0) {
    subNamespaces = subNamespaces[0];
    var auth = false;
    for (let i = 0; i < subNamespaces.length; i++) {
      if (subNamespaces[i][0] === 'auth') {
        auth = subNamespaces[i][1];
      }
    }
    regs[0] = [new RegExp(reg + '$'), auth];
    for (let i = 0; i < subNamespaces.length; i++) {
      if (subNamespaces[i][0] && (subNamespaces[i][0].includes('/') && subNamespaces[i][0].length > 1)) {
        regs = regs.concat(_recCreateRegExp(subNamespaces[i][0], reg, subNamespaces[i]));
      }
    }
  }
  return regs;
}

async function connectCallback(regExp, auth, socket) {
  socket.of(regExp).on('connection', function (socket) {
    socket.authenticated = false;

    socket.emit('need authentication');

    socket.on('authenticate', function (data) {
      if (auth === false) {
        socket.authenticated = true;
      }
      else {
        if (data) {
          const token = data.token;

          try {
            const decoded = jwt.verify(token, '--default-jwt-secret--');
            if (decoded) {
              socket.authenticated = true;
            }
          }
          catch (err) {
            socket.authenticated = false;
            if (err) {
              socket.emit('unauthorized', { message: err.message });
            }
          }
        }
      }

      if (socket.authenticated) {
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
      }
    });

    socket.on('read', function() {
      socket.emit('message', 'You are reading');
    });

    socket.on('create', function() {
      socket.emit('message', 'You are creating');
    });

    socket.on('updating', function() {
      socket.emit('message', 'You are updating');
    });

    socket.on('patch', function() {
      socket.emit('message', 'You are patching');
    });

    socket.on('delete', function() {
      socket.emit('message', 'You are deleting');
    });

    setTimeout(function () {
      if (!socket.authenticated) {
        socket.emit('unauthorized', {
          message: 'failed to authenticate'
        });

        socket.disconnect();
      }
    }, 5000);

    socket.on('disconnect', ()=>{
      console.log('user disconnected from cars');
    });
  });
}

async function realtimeHandlers(apiModel, http, app) {
  var socket = io(http);
  const fields = Object.entries(apiModel);
  for (let i = 0; i < fields.length; i++) {
    const model = fields[i];
    if (model[0].includes('/')) {
      const regExpNamespaceSubs = createRegExp(model[0], Object.entries(model[1]));
      for (let i = 0; i < regExpNamespaceSubs.length; i++) {
        const reg  = regExpNamespaceSubs[i][0];
        const auth = regExpNamespaceSubs[i][1];
        connectCallback(reg, auth, socket);
      }
    }
  }
}

module.exports = realtimeHandlers
