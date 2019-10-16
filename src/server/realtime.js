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

    var auth = subNamespaces[1]['auth']['realTime'] || false;
    var realTime = subNamespaces[1]['realTime'] || false;

    if (subNamespaces[1]['handlers']) {
      subRegs.push([new RegExp(reg + '$'), auth, realTime]);
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
    var realTime = false;
    for (let i = 0; i < subNamespaces.length; i++) {
      if (subNamespaces[i][0] === 'auth') {
        auth = subNamespaces[i][1]['realTime'];
      }
      if (subNamespaces[i][0] === 'realTime') {
        realTime = subNamespaces[i][1];
      }
    }
    regs[0] = [new RegExp(reg + '$'), auth, realTime];
    for (let i = 0; i < subNamespaces.length; i++) {
      if (subNamespaces[i][0] && (subNamespaces[i][0].includes('/') && subNamespaces[i][0].length > 1)) {
        regs = regs.concat(_recCreateRegExp(subNamespaces[i][0], reg, subNamespaces[i]));
      }
    }
  }
  return regs;
}

async function connectCallback(regExp, socket, auth, handlers, environment) {
  var roomId = 0;

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
            const decoded = jwt.verify(token, environment.jwtSecret);
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

      setTimeout(function () {
        if (!socket.authenticated) {
          socket.emit('unauthorized', {
            message: 'failed to authenticate'
          });

          socket.disconnect(); //if the user takes to much time to authenticate
        }
      }, 5000);

      if (socket.authenticated) {
        var query = {};
        var name  = socket.nsp.name;

        name = name.split('/')[1]; //get the "collection" name, the name use in model

        for (elem in socket.handshake.query) {
          if (elem != 'EIO' && elem != 'transport' && elem != 't') {
            query[elem] = socket.handshake.query[elem];
          }
        }

        socket.join(roomId); //create a unique room for the socket

        var sockets = [];
        sockets.push(socket); //the socket needs to be in an array to be used in an extern callback

        /*******
        Connection handling
        */
        if (handlers['connect']) {
          var res;
          for (let i = 0; i < handlers['connect'].length; i++) {
            res = handlers['connect'][i](res, environment.db, name, query, sockets);
          }
        }
      }
    });

    /*******
    Message handling
    */
    if (handlers['message']) {
      var message = '';

      for (let i = 0; i < handlers['message'].length; i++) {
        message = handlers['message'][i](message);
      }
    }

    /*******
    Disconnection handling
    */
    socket.on('disconnect', () => {
      if (handlers['disconnect']) {
        var res;

        for (let i = 0; i < handlers['disconnect'].length; i++) {
          res = handlers['disconnect'][i](res);
        }
      }
    });
  });
}

async function realtimeHandlers(apiModel, http, environment) {
  var socket = io(http);
  const fields = Object.entries(apiModel);
  for (let i = 0; i < fields.length; i++) {
    const model = fields[i];
    if (model[0].includes('/')) {
      const regExpNamespaceSubs = createRegExp(model[0], Object.entries(model[1]));

      for (let i = 0; i < regExpNamespaceSubs.length; i++) {
        const reg  = regExpNamespaceSubs[i][0];
        const auth = regExpNamespaceSubs[i][1];
        const handlers = regExpNamespaceSubs[i][2];
        connectCallback(reg, socket, auth, handlers, environment);
      }
    }
  }
}

module.exports = realtimeHandlers
