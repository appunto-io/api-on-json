const { createServer } = require('./helpers/helpers.js')

class Server {
  constructor(apiModel, env) {
    this.server = createServer(apiModel, env, this);
    this.app = null;
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
