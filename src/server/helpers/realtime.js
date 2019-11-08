const io  = require('socket.io');
const jwt = require('jsonwebtoken');

function _recCreateRegExp(name, reg, subNamespaces) {
  var subRegs = [];
  if (name.endsWith(":")) {
    reg = reg + '(/(\\w*\\d*))';
  }
  else {
    reg = reg + `${name}`;
  }

  var auth     = subNamespaces['auth'] && subNamespaces['auth']['realTime'] ? subNamespaces['auth']['realTime'] : false;
  var realTime = subNamespaces['realTime'];

  subRegs.push([new RegExp(reg + '$'), auth, realTime]);

  Object.entries(subNamespaces).forEach(([element, content]) => {
    if (element.startsWith('/')) {
      subRegs = subRegs.concat(_recCreateRegExp(element, reg, content));
    }
  });

  return subRegs;
}

function createRegExp(name, subNamespaces) {
  var regs = [];
  var reg = `^${name}`;

  var auth     = subNamespaces['auth'] && subNamespaces['auth']['realTime'] ? subNamespaces['auth']['realTime'] : false;
  var realTime = subNamespaces['realTime'];

  regs.push([new RegExp(reg + '$'), auth, realTime]);

  Object.entries(subNamespaces).forEach(([element, content]) => {
    if (element.startsWith('/')) {
      regs = regs.concat(_recCreateRegExp(element, reg, content));
    }
  });

  return regs;
}

async function connectCallback(regExp, socket, auth, handlers, env) {
  var roomId = 0;

  socket.of(regExp).on('connection', function (socket) {
    socket.authenticated = false;

    socket.emit('need authentication');

    socket.on('authenticate', function (data) {
      if (auth.requiresAuth) {
        if (data) {
          const token = data.token;

          try {
            const decoded = jwt.verify(token, env.jwtSecret);

            if (decoded) {
              if (auth.requiresRoles) {
                socket.authenticated = auth.requiresRoles.includes(decoded.role);
              }
              else {
                socket.authenticated = true;
              }
            }
          }
          catch (err) {
            socket.authenticated = false;
            if (err) {
              socket.emit('try again', { message: err.message });
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
        socket.emit('succeed');
        var query = {};
        var path  = socket.nsp.name;

        path = path.split('/')[1]; //get the "collection" path, the path use in model

        for (let elem in socket.handshake.query) {
          if (elem != 'EIO' && elem != 'transport' && elem != 't' && elem != 'b64') {
            query[elem] = socket.handshake.query[elem];
          }
        }

        socket.join(roomId); //create a unique room for the socket

        var sockets = [];
        sockets.push(socket); //the socket needs to be in an array to be used in an extern callback

        /*******
        Connection handling
        */

        const meta = {
          env,
          query,
          socket,
          path
        }

        if (handlers['connect']) {
          var res;
          for (let i = 0; i < handlers['connect'].length; i++) {
            res = handlers['connect'][i](res, meta);
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

function realtimeHandlers(apiModel, httpServer, env) {
  const socket = io(httpServer);

  const fields = Object.entries(apiModel).forEach(([element, content]) => {
    if (element.startsWith('/')) {
      const regExpNamespaceSubs = createRegExp(element, content);
      for (let i = 0; i < regExpNamespaceSubs.length; i++) {
        const [reg, auth, handlers]  = regExpNamespaceSubs[i];
        connectCallback(reg, socket, auth, handlers, env);
      }
    }
  });
}

module.exports = realtimeHandlers;
