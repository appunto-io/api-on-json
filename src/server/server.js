const { createServer } = require('./helpers/helpers.js')

class Server {
  constructor(apiModel, env) {
    const { app, server } = createServer(apiModel, env);
    this.server = server;
    this.app = app;
  }

  async listen(port) {
    this.server = await this.server.listen(port);
  }

  close() {
    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = { Server };
