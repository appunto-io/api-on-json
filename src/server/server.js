const { createServer } = require('./helpers/helpers.js')

class Server {
  constructor(apiModel, env) {
    const { app, http } = createServer(apiModel, env);
    this.server = http;
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
