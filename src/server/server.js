const { createServer } = require('./helpers/helpers.js')

class Server {
  constructor(apiModel, env) {
    if (apiModel.hasRealtime && (env.db && typeof env.db.observe != "function")) {
      console.warn('The database you are using can\'t use realTime');
      apiModel.hasRealtime = false;
    }

    const app = createServer(
      apiModel,
      {
        jwtSecret : env.jwtSecret,
        db        : env.db
      }
    );

    this.server = app;
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
