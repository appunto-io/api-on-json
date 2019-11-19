const io  = require('socket.io');
const jwt = require('jsonwebtoken');

function createRegExp(name, subNamespaces, regex = '^') {
  var regs = [];
  if (name !== '') {
    if (name.includes(':')) {
      regex = regex + '(/(\\w*\\d*))';
    }
    else {
      regex = regex + name;
    }
  }

  var auth     = subNamespaces['auth'] && subNamespaces['auth']['realTime'] ? subNamespaces['auth']['realTime'] : false;
  var realTime = subNamespaces['realTime'];

  regs.push({
    regexp : new RegExp(regex + '$'),
    auth,
    realTime}
  );

  Object.entries(subNamespaces).forEach(([element, content]) => {
    if (element.startsWith('/')) {
      regs = [...regs, ...createRegExp(element, content, regex)]
    }
  });

  return regs;
}

async function execConnectHandlers(socket, handlers, env) {
  var roomId = 0;
  var path   = socket.nsp.name;

  path = path.split('/')[1]; //get the "collection" path, the path use in model

  // LINT
  const { EIO, transport, t, b64, ...sanitizedQuery } = socket.handshake.query;

  socket.join(roomId); //create a unique room for the socket


  /*******
  Connection handling
  */

  const meta = {
    env,
    query: sanitizedQuery,
    socket,
    path
  }

  handlers.connect.reduce(
    (res, handler) => handler(res, meta),
    null
  );
}

async function connectCallback(regExp, socket, auth, handlers, env) {
  socket.of(regExp).on('connection', function (socket) {
    if (!auth) {
      socket.emit('unauthorized', {
        message: 'realTime is not available on this collection'
      });
    }
    if (auth.requiresAuth) {
      socket.authenticated = false;

      socket.emit('need authentication');

      socket.on('authenticate', function (data) {
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
          execConnectHandlers(socket, handlers, env);
        }
      });
    }
    else {
      execConnectHandlers(socket, handlers, env);
    }

    /*******
    Message handling
    */
    handlers.message.reduce(
      (res, handler) => handler(res),
      ''
    );

    /*******
    Disconnection handling
    */
    socket.on('disconnect', () => {
      handlers.disconnect.reduce(
        (res, handler) => handler(res),
        null
      );
    });
  });
}

function realtimeHandlers(apiModel, httpServer, env) {
  const socket = io(httpServer);

  const realTimeDefs = createRegExp('', apiModel);

  realTimeDefs.forEach(
    ({regexp, auth, realTime}) => connectCallback(regexp, socket, auth, realTime, env)
  );
}

module.exports = realtimeHandlers;
