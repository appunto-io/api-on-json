const chai     = require('chai');
const chaiHTTP = require('chai-http');
var io         = require('socket.io-client');
const jwt      = require('jsonwebtoken');

const { DataModel }  = require('../../index.js');

const { Rethink } = require('../databases.js');

const expect = chai.expect;
chai.use(chaiHTTP);

const jwtSecret = "--default-jwt-secret--";

const token_request = 'Bearer ' + jwt.sign({ role: 'admin' }, jwtSecret);
/**********************************************
  Generic HTTP requests based on chai HTTP
*/
async function post(collection, data) {
  return chai.request('http://localhost:3000')
    .post(`/${collection}`)
    .set('Authorization', token_request)
    .send(data);
}

async function patch(collection, id, data) {
  return chai.request('http://localhost:3000')
    .patch(`/${collection}/` + id)
    .set('Authorization', token_request)
    .send(data);
}

const dataModels = {
  'cars': {
    schema: {
      'brand' : {type : 'String', 'required' : true},
      'model' : {type: 'String', 'default' : 'Default Model'},
      'serial': {type: 'String', 'unique': true}
    }
  },
  'fruits' : {
    options : {
      timestamps : {
        createdAt : 'creationDate',
        updatedAt : 'modificationDate'
      }
    },
    schema : {
      name : 'String'
    }
  },
  'users' : {
    options : {
      timestamps : false
    },
    schema : {
      'name' : {type: 'String', 'unique': true}
    }
  },
  'flowers' : {
    schema : {
      name : {type: 'String', 'required': true},
      age_in_days: 'Number'
    }
  }
};


describe('realTime test suite', async function() {

  var db = new Rethink("localhost", "28015", 'realTime');

  const opt = {
    realTime: true
  };

  const env = {
    db,
    jwtSecret
  }

  var roleApiModel = {
    '/cars': {
      auth: {
        realTime: {requiresRoles: ['admin']}
      }
    },
    '/flowers': {
      auth: {
        realTime: {requiresAuth:false}
      }
    },
    '/users': {
      auth: {
        realTime: false
      }
    }
  };

  const admin  = jwt.sign({ role: 'admin' }, env.jwtSecret);
  const user   = jwt.sign({ role: 'user' }, env.jwtSecret);

  before(async() => {
    const dataModel = new DataModel(dataModels);

    await db.connect();
    await db.init(dataModel.get());
    const apiModel  = dataModel.toApi(opt);
    apiModel.addApiModel(roleApiModel);


    this.server  = apiModel.toServer(env);
    await this.server.listen(3000);
  });

  after(async () => {
    await this.server.close();
  });

  it('Testing connection', function(done) {
    var socket = io.connect('http://localhost:3000', {forceNew: true});
    socket.on('connect', () => {
      expect(socket.connected).to.be.true;
      done();
    });
  });

  it('Testing authentication', function(done) {
    var socket = io.connect('http://localhost:3000/cars?brand=tesla&model=S', {forceNew: true});

    socket.on('need authentication', function() {
      socket.emit('authenticate', {token: admin});

      socket.on('succeed', function() {
        expect(socket.connected).to.be.true;
        expect(socket.id).to.not.be.null;
        done();
      });
    });
  });

  it('Testing if the socket receives a message on update', function(done) {
    var socket = io.connect('http://localhost:3000/cars?brand=tesla&model=S', {forceNew: true});

    socket.on('need authentication', function() {
      socket.emit('authenticate', {token: admin});

      socket.on('succeed', function() {
        expect(socket.connected).to.be.true;
        expect(socket.id).to.not.be.null;
      });

      socket.on('update', function(message) {
        expect(socket.connected).to.be.true;
        expect(socket.id).to.not.be.null;
        expect(message).to.not.be.null;
        socket.disconnect();
        done();
      });

      post('cars', {
        brand : 'tesla',
        model : 'S'
      });
    });
  });

  it('Testing if the socket receives a message on update', async function() {
    const response = await post('cars', {
      brand : 'tesla',
      model : 'S'
    });

    var socket = io.connect('http://localhost:3000/cars/' + response.body.id, {forceNew: true});

    socket.on('need authentication', function() {
      socket.emit('authenticate', {token: admin});

      socket.on('succeed', function() {
        expect(socket.connected).to.be.true;
        expect(socket.id).to.not.be.null;
      });

      socket.on('update', function(message) {
        expect(socket.connected).to.be.true;
        expect(socket.id).to.not.be.null;
        expect(message).to.not.be.null;
        socket.disconnect();
      });

      patch('cars', {
        brand : 'tesla',
        model : 'X'
      });
    });
  });

  it('Testing if the socket dont receives a message on update he doesnt observe', function(done) {
    var socket1 = io.connect('http://localhost:3000/cars?brand=tesla&model=S', {forceNew: true});
    var socket2 = io.connect('http://localhost:3000/cars?brand=tesla&model=X', {forceNew: true});


    var socket_1_received = false;

    socket1.on('need authentication', function() {
      socket1.emit('authenticate', {token: admin});

      socket1.on('succeed', function() {
        expect(socket1.connected).to.be.true;
        expect(socket1.id).to.not.be.null;
      });

      socket1.on('update', function() {
        socket_1_received = true;
        socket1.disconnect();
      });
    });

    socket2.on('need authentication', function() {
      socket2.emit('authenticate', {token: admin});

      socket2.on('succeed', function() {
        expect(socket2.connected).to.be.true;
        expect(socket2.id).to.not.be.null;
      });

      socket2.on('update', function(message) {
        expect(socket2.connected).to.be.true;
        expect(socket2.id).to.not.be.null;
        expect(message).to.not.be.null;
        expect(socket_1_received).to.be.false;
        socket2.disconnect();
        done();
      });

      post('cars', {
        brand : 'tesla',
        model : 'X'
      });
    });
  });

  it('Testing if the socket dont receives a message when he dont have the rights', function(done) {
    var socket1 = io.connect('http://localhost:3000/cars?brand=tesla&model=S', {forceNew: true});
    var socket2 = io.connect('http://localhost:3000/cars?brand=tesla&model=S', {forceNew: true});


    var socket_1_received = false;

    socket1.on('need authentication', function() {
      socket1.emit('authenticate', {token: user});

      socket1.on('update', function() {
        socket_1_received = true;
        socket1.disconnect();
      });
    });

    socket2.on('need authentication', function() {
      socket2.emit('authenticate', {token: admin});

      socket2.on('succeed', function() {
        expect(socket2.connected).to.be.true;
        expect(socket2.id).to.not.be.null;
      });

      socket2.on('update', function(message) {
        expect(socket2.connected).to.be.true;
        expect(socket2.id).to.not.be.null;
        expect(message).to.not.be.null;
        expect(socket_1_received).to.be.false;
        socket2.disconnect();
        done();
      });

      post('cars', {
        brand : 'tesla',
        model : 'S'
      });
    });
  });

  it('Testing if the client can observe all updates on a route', function(done) {
    var socket = io.connect('http://localhost:3000/cars', {forceNew: true});

    var cpt = 0;

    socket.on('need authentication', function() {
      socket.emit('authenticate', {token: admin});

      socket.on('succeed', function() {
        expect(socket.connected).to.be.true;
        expect(socket.id).to.not.be.null;
      });

      socket.on('update', function(message) {
        expect(socket.connected).to.be.true;
        expect(socket.id).to.not.be.null;
        expect(message).to.not.be.null;

        cpt = cpt + 1;
        if (cpt === 6) {
          socket.disconnect();
          done();
        }
      });

      post('cars', {
        brand : 'tesla',
        model : '1'
      });

      post('cars', {
        brand : 'tesla',
        model : '2'
      });

      post('cars', {
        brand : 'renault',
        model : '1'
      });

      post('cars', {
        brand : 'renault',
        model : '2'
      });

      post('cars', {
        brand : 'renault',
        model : '3'
      });

      post('cars', {
        brand : 'renault',
        model : '4'
      });
    });
  });

  it('Testing if no authentication needed when requiresAuth is false', function(done) {
    var socket = io.connect('http://localhost:3000/flowers?name=sunflower', {forceNew: true});

    socket.on('update', function(message) {
      expect(socket.connected).to.be.true;
      expect(socket.id).to.not.be.null;
      expect(message).to.not.be.null;
      done();
    });

    post('flowers', {
      name : 'sunflower'
    });
  });

  it('Testing if the client can observe multiple fields and gets updates', function(done) {
    var socket = io.connect('http://localhost:3000/cars?brand=tesla;renault&model=S;X', {forceNew: true});

    var cpt = 0;

    socket.on('need authentication', function() {
      socket.emit('authenticate', {token: admin});

      socket.on('succeed', function() {
        expect(socket.connected).to.be.true;
        expect(socket.id).to.not.be.null;
      });

      socket.on('update', function(message) {
        expect(socket.connected).to.be.true;
        expect(socket.id).to.not.be.null;
        expect(message).to.not.be.null;

        cpt = cpt + 1;
        if (cpt === 4) {
          socket.disconnect();
          done();
        }
      });

      post('cars', {
        brand : 'tesla',
        model : 'S'
      });

      post('cars', {
        brand : 'tesla',
        model : 'X'
      });

      post('cars', {
        brand : 'renault',
        model : 'S'
      });

      post('cars', {
        brand : 'renault',
        model : 'X'
      });

      post('cars', {
        brand : 'renault',
        model : 'Z'
      });

      post('cars', {
        brand : 'renault',
        model : 'Z'
      });
    });
  });

  it('Testing if realTime is no available when auth is false', function(done) {
    var socket = io.connect('http://localhost:3000/users?name=Hugo', {forceNew: true});

    socket.on('unauthorized', function(data) {
      expect(data.message).to.be.equal('realTime is not available on this collection');
      done();
    });
  });

  it('Testing authentication with no token', function(done) {
    var socket = io.connect('http://localhost:3000/cars?brand=tesla&model=S', {forceNew: true});

    socket.on('need authentication', function() {
      socket.emit('authenticate');

      socket.on('unauthorized', function(data) {
        expect(data.message).to.be.equal('failed to authenticate');
        done();
      });
    });
  });

  it('Testing authentication with invalid token', function(done) {
    var socket = io.connect('http://localhost:3000/cars?brand=tesla&model=S', {forceNew: true});

    socket.on('need authentication', function() {
      socket.emit('authenticate', {token: 'invalid'});

      socket.on('unauthorized', function(data) {
        expect(data.message).to.be.equal('failed to authenticate');
        done();
      });
    });
  });

  it('Testing authentication with a wrong role (not enough permissions)', function(done) {
    var socket = io.connect('http://localhost:3000/cars?brand=tesla&model=S', {forceNew: true});

    socket.on('need authentication', function() {
      socket.emit('authenticate', {token: user});

      socket.on('unauthorized', function(data) {
        expect(data.message).to.be.equal('failed to authenticate');
        done();
      });
    });
  });

  it('Testing authentication with good token but takes too much time', function(done) {
    var socket = io.connect('http://localhost:3000/cars?brand=tesla&model=S', {forceNew: true});

    socket.on('need authentication', async function() {
      socket.emit('authenticate');

      setTimeout(function () {
        socket.emit('authenticate', {token: admin});
      }, 6000);

      socket.on('unauthorized', function(data) {
        expect(data.message).to.be.equal('failed to authenticate');
        done();
      });
    });
  });
});
