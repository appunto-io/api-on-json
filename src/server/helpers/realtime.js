const io  = require('socket.io');
const jwt = require('jsonwebtoken');

function createRegExp(name, subNamespaces, regex = '^') {
  var regs    = [];

  if (name !== '') {
    if (name.includes(':')) {
      regex = regex + '/([A-Za-z0-9-]+)';
      var nameId = name.split(':')[1];
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
      nameId}
    );
  }

  Object.entries(subNamespaces).forEach(([element, content]) => {
    if (element.startsWith('/')) {
      regs = [...regs, ...createRegExp(element, content, regex)]
    }
  });

  return regs;
}

async function execConnectHandlers(regExp, namesId, socket, handlers, env) {
  var roomId    = 0;
  var params    = {};
  const paths   = socket.nsp.name;

  var path = paths.split('/')
    .map(v => v.trim())
    .filter(v => v !== '')[0];

  var ids = regExp.exec(paths);

  for (let index = 1; index < ids.length; index++) {
    params[namesId[index - 1]] = ids[index];
  }

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
    path,
    params
  }

  handlers.connect.reduce(
    (res, handler) => handler(res, meta),
    null
  );
}

async function connectCallback(regExp, namesId, socket, auth, handlers, env) {
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
          execConnectHandlers(regExp, namesId, socket, handlers, env);
        }
      });
    }
    else {
      execConnectHandlers(regExp, namesId, socket, handlers, env);
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

  var namesId = [];
  var reg  = '';

  realTimeDefs.forEach(
    ({regexp, auth, realTime, nameId}) => {
      if (reg === '') {
        reg = regexp.toString().split('$')[0];
      }

      if (regexp.toString().includes(reg)) {
        if (nameId) {
          namesId.push(nameId);
        }
      }
      else {
        namesId = [];
        reg = regexp.toString().split('$')[0];
      }

      return connectCallback(regexp, namesId, socket, auth, realTime, env);
    }
  );
}

module.exports = realtimeHandlers;
