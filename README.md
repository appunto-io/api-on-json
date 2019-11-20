# Api On Json

# Installation

```
npm install @appunto/api-on-json
```

# Introduction

Create an API quickly

## Structures

The idea behind API on JSON is to build an entire API service via a JSON configuration file. JSON files can be used to configure API endpoints and datamodel.

The library is structured around three main classes: `Server`, `ApiModel` and `DataModel`.

`Server` creates an ExpressJS server.

`ApiModel` describes the structure of the API. This is passed to server to create API routes.

`DataModel` is used for the particular (yet common) case where you need to create a API that access data stored in a DB.

## Example
```js
const { DataModel } = require('@appunto/rigatoni');
const { Mongo }     = require('@appunto/rigatoni');

const mongoUri = 'http://localhost:27017';

const connectionOptions = { useNewUrlParser : true ,
                  useUnifiedTopology: true,
                  useFindAndModify: false};

const db = new Mongo(mongoUri, options);

const opt = {
  realTime: true
};

const dataModel = new DataModel(/* your dataModel in JSON */);

await db.connect();
await db.init(dataModel.get());

const apiModel = dataModel.toApi(opt);

const env = {
  db        : db,
  jwtSecret : "--your-jwt-secret-key--"
}

const server = apiModel.toServer(env);
await server.listen(8081);
```

# Library API

# Server

## `new Server(apiModel, [environment])`

Creates a new `Server` instance. In practice you will probably prefer to use `ApiModel.toServer(...)`.

### Aguments

- `apiModel` is a instance of `ApiModel`
- `environment` (optional) is an object that can be used to hold environment variables. `environment` object is passed to all Api handlers (see XXX)

### Example

```js
import { Server } from '@appunto/api-on-json';

const apiModel = new ApiModel(/* see ApiModel doc */);
const environment = {
  VARIABLE : 'value'
};

const server = new Server(apiModel, environment);

```

## `Server.listen(port)`

Starts a server.

### Aguments

- `port` the port to which the server listen to

### Example

```js
const server = new Server(apiModel, environment);
server.listen(80);
```

## `Server.close()`

Stops a server.

### Aguments

### Example

```js
const server = new Server(apiModel, environment);
server.listen(80);
server.close();x
```

# Api

## JSON model

JSON Api model describes the behaviour of the API.

A JSON Api model is composed by a set of route definitions

```js
const model = {
  '/route1' : {/* definition */},
  '/route2' : {/* definition */},
};
```

Each route should begin with a `'/'`.

Route can contain :

- `isApiModel`
- `handlers`
-


## Database

### Create a database

```js
const { Mongo } = require('@appunto/rigatoni');

const mongoUri = 'http://localhost:27017'
const connectionOptions = { useNewUrlParser : true ,
                  useUnifiedTopology: true,
                  useFindAndModify: false};

const db = new Mongo(mongoUri, options);
```

### Init the database

```js
db.init(dataModel);
```

### Connect to the database

```js
db.connect();
```

### Do a POST request to the database

```js
db.create(collection, data);
```

### Do a GET id request to the database

```js
db.readOne(collection, id);
```

### Do a GET request with a query to the database

```js
db.readMany(collection, query);
```

### Do a PUT request to the database

```js
db.update(collection, id, data);
```

### Do a PATCH request to the database

```js
db.patch(collection, id, data);
```

### Do a DELETE request to the database

```js
db.remove(collection, id);
```

### Activate the realtime in the database

```js
db.observe(collection, query, socket, callback);
```
## DataModel

```js
const { Server, DataModel, Mongo } = require('@appunto/rigatoni');

const dataModel = new DataModel({
  'example' : {
    options : {
      timestamps : false
    },
    schema : {
      'name' : 'String'
    }
  }
});

const apiModel = dataModel.toApi();

const env = {
  db : new Mongo(connectionOptions)    
};

const server = apiModel.toServer(env);
server.listen(port);
```

### Multiple data model definitions

```js
const { Server, DataModel, Mongo } = require('@appunto/rigatoni');

const dm1   = new DataModel({model1: {}});
const dm2   = new DataModel({model2: {}});
const dm3n4 = new DataModel({model3: {}}, {model4: {}});
const mergedDataModel = new DataModel(dm1, dm2, dm3n4);

const apiModel = mergedDataModel.toApi();

const env = {
  db,
  secretKey
};

const server = apiModel.toServer(env);
server.listen(port);
```

### Add a new collection
```js
const { Server, DataModel, Mongo } = require('@appunto/rigatoni');

const dataModel = new DataModel({
  'example' : {
    options : {
      timestamps : false
    },
    schema : {
      'name' : 'String'
    }
  }
});

dataModel.addCollection(collectionName, {
  options : {/* ... */},
  schema  : {/* ... */}
});

const apiModel = dataModel.toApi();

const env = {
  db : new Mongo(connectionOptions)    
};

const server = apiModel.toServer(env);
server.listen(port);
```

### Add a new field at a given collection
```js
const { Server, DataModel, Mongo } = require('@appunto/rigatoni');

const dataModel = new DataModel({
  'example' : {
    options : {
      timestamps : false
    },
    schema : {
      'name' : 'String'
    }
  }
});

dataModel.addField(collectionName, fieldName, {
  type     : 'String',
  required : true
});

const apiModel = dataModel.toApi();

const env = {
  db : new Mongo(connectionOptions)    
};

const server = apiModel.toServer(env);
server.listen(port);
```

### Add a new field at a given collection
```js
const { Server, DataModel, Mongo } = require('@appunto/rigatoni');

const dataModel = new DataModel({
  'example' : {
    options : {
      timestamps : false
    },
    schema : {
      'name' : 'String'
    }
  }
});

dataModel.addField(collectionName, fieldName, {
  type     : 'String',
  required : true
});

const apiModel = dataModel.toApi();

const env = {
  db : new Mongo(connectionOptions)    
};

const server = apiModel.toServer(env);
server.listen(port);
```

### Remove a collection
```js

dataModel.removeCollection(collectionName);

```

### Remove a field
```js

dataModel.removeField(collectionName, fieldName);

```

### Add Options
```js

dataModel.removeField(collectionName, options);

```


## ApiModel
```js
const { Server, ApiModel } = require('@appunto/rigatoni');

const apiModel = new ApiModel({
  '/random-numbers' : {
    auth : {
      'READ'  : {requiresAuth : true, requiresRoles : ['user']},
      'WRITE' : false
    },
    handlers : {
      'GET' : (data, flow, meta) => {return flow.continue(Math.random() * meta.env.max);}
    }
  }
});

const env = {
  max : 10
};

const server = new Server(apiMode, env);
server.listen();
```


### ApiModel from multiple models
```js
const { ApiModel } = require('@appunto/rigatoni');

const am1   = new ApiModel({model1: {}});
const am2   = new ApiModel({model2: {}});
const am3n4 = new ApiModel({model3: {}}, {model4: {}});
const mergedApiModel = new ApiModel(am1, am2, am3n4);

```

### DataModels and Custom Api
```js
const { Server, DataModel, ApiModel, Mongo } = require('@appunto/rigatoni');

const dm1 = new DataModel({model1});
const dm2 = new DataModel({model2});
const mergedDataModel = new DataModel(dm1, dm2);


const amFromDm = mergedDataModel.toApi();

const am1 = new ApiModel({model3});
const am2 = new ApiModel({model4});

const mergedApiModel = new ApiModel(amFromDm, am1, am2);

```

### Add a new route in an Api Model
```js
const { ApiModel } = require('@appunto/rigatoni');

const apiModel = new ApiModel({model1: {}});

apiModel.addRoute('/path/of/the/route', {
  auth : {/* ... */}
  handlers : {/* ... */}
});
```

### Remove route in an Api Model
```js
const { ApiModel } = require('@appunto/rigatoni');

const apiModel = new ApiModel({model1: {}});

apiModel.removeRoute('/path');
```

### Add handlers in a route in an Api Model
```js
const { ApiModel } = require('@appunto/rigatoni');

const apiModel = new ApiModel({model1: {}});

apiModel.addHandlers('/path', {
  'GET' : handler
});
```

### Add filters in a route in an Api Model
```js
const { ApiModel } = require('@appunto/rigatoni');

const apiModel = new ApiModel({model1: {}});

apiModel.addFilters('/path', {
  'GET' : handler
});
```

## RealTime

### Global RealTime
```js
const { Server, DataModel, Mongo } = require('@appunto/rigatoni');

const dataModel = new DataModel({model1});

const options = {
  realTime: true
};

const apiModel = dataModel.toApi(options);


```

### Partial RealTime
```js

const apiModel = dataModel.toApi({
  realTime : ['cars', 'boats']
});

const mongo = new Mongo(mongoUri, options);

const server = apiModel.toServer({db: mongo});
server.listen(port);

```
