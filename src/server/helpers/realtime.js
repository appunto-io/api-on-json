const io  = require('socket.io');
const jwt = require('jsonwebtoken');

function createRegExp(name, subNamespaces, regex = '^', paramNames = []) {
  let regs = [];

  if (name !== '') {
    if (name.includes(':')) {
      regex = regex + '/([A-Za-z0-9-]+)';
      paramNames = [...paramNames, name.split(':')[1]];
    }
    else {
      regex = regex + name;
    }

    var auth     = subNamespaces['auth'] && subNamespaces['auth']['realTime'] ? subNamespaces['auth']['realTime'] : false;
    var realTime = subNamespaces['realTime'];

    regs.push({
      regexp : new RegExp(regex + '$'),
      auth,
      realTime,
      paramNames
    });
  }

  Object.entries(subNamespaces).forEach(([element, content]) => {
    if (element.startsWith('/')) {
      regs = [...regs, ...createRegExp(element, content, regex, paramNames)]
    }
  });

  return regs;
}

async function connectCallback(regExp, paramNames, socket, handlers, env) {
  let roomId    = 0;
  let params    = {};
  const paths   = socket.nsp.name;

  let path = paths.split('/')
    .map(v => v.trim())
    .filter(v => v !== '')[0];

  let ids = regExp.exec(paths);

  for (let index = 1; index < ids.length; index++) {
    params[paramNames[index - 1]] = ids[index];
  }

  /* eslint no-unused-vars: 0 */
  const { EIO, transport, t, b64, ...sanitizedQuery } = socket.handshake.query;

  socket.join(roomId); //create a unique room for the socket

  /*******
  Connection handling
  */
  const meta = {
    env,
    query: sanitizedQuery,
    socket,
    path,
    params
  }

  handlers.connect.reduce(
    (res, handler) => handler(res, meta),
    null
  );
}

async function realTimeHandling(regExp, paramNames, socket, auth, handlers, env) {
  socket.of(regExp).on('connection', function (socket) {
    if (!auth) {
      socket.emit('unauthorized', {
        message: 'realTime is not available on this collection'
      });
    }
    if (auth.requiresAuth) {
      socket.authenticated = false;

      socket.emit('need authentication');

      var t = setTimeout(function () {
        if (!socket.authenticated) {
          socket.emit('unauthorized', {
            message: 'failed to authenticate'
          });

          socket.disconnect(); //if the user takes to much time to authenticate
        }
      }, 5000);

      socket.on('authenticate', function (data) {
        if (data) {
          const token = data.token;

          try {
            const decoded = jwt.verify(token, env.jwtSecret);

            if (decoded) {
              if (auth.requiresRoles) {
                if (decoded.roles) {
                  for (let i = 0; i < decoded.roles.length; i++) {
                    socket.authenticated = socket.authenticated || auth.requiresRoles.includes(decoded.roles[i]);
                  }
                }
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

        if (socket.authenticated) {
          socket.emit('succeed');
          clearTimeout(t);
          connectCallback(regExp, paramNames, socket, handlers, env);
        }
      });
    }
    else {
      connectCallback(regExp, paramNames, socket, handlers, env);
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
    ({regexp, auth, realTime, paramNames}) => realTimeHandling(regexp, paramNames, socket, auth, realTime, env)
  );
}

module.exports = realtimeHandlers;
