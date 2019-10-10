const io = require('socket.io');
var socket;

async function connectCallback() {
  io.on('connection', function (socket) {
    console.log('user connected');
  });
}



async function hydrateRealtime(apiModel, http, app) {
  socket = io(http);
  console.log(apiModel);
}

module.exports = hydrateRealtime
