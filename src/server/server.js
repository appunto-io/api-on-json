const { createServer } = require('./helpers/helpers.js')

class Server {
  constructor(apiModel, env) {
    const { server } = createServer(apiModel, env);

    this.server = server;
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
