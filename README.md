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

- `auth` multiple authentication rules for each method:
  - `requiresAuth` boolean, true if an authentication is needed or else if not
  - `requiresRoles` list of string enumerating the roles that can be authenticated
  - `policies` list of function called at the server creation


- `handlers` multiple callbacks executed for each method
- `filters` multiple callbacks executed before each method
- `realTime` multiple handlers needed for real time api:
  - `connect` list of function called at socket connection
  - `message` list of function called at socket update
  - `disconnect` list of function called at socket disconnection


- `cors` multiple options pass to HelmetJS (see Helmet doc for more information)

### Example

```js
const model = {
  '/route1' : {
    auth     : {
      "GET"     : {requiresAuth:false, requiresRoles:false, policies:[policy1]},
      "HEAD"    : {requiresAuth:true, requiresRoles:['role1'], policies:[policy1]},
      "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[policy1]},
      "POST"    : {requiresAuth:true, requiresRoles:false, policies:[policy1]},
      "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[policy1]},
      "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[policy1]},
      "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[policy1]},
      realTime  : {requiresAuth:true, requiresRoles:false, policies:[policy1]}
    },
    handlers : {
      "GET" : [handler1]
    },
    filters  : {
      "POST" : [filter1]
    },
    realTime : {
      "connect" : [connectHandler1, connectHandler2],
      "message" : [messageHandler1, messageHandler2],
      "disconnect" : [disconnectHandler1, disconnectHandler2]
    },
    cors     : {
      methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
      optionsSuccessStatus : 204,
      origin               : "*",
      preflightContinue    : false
    }
  }
};
```


## `new ApiModel(...apiModels)`

Creates a new `ApiModel` instance.

### Arguments

- `apiModels` 0 or more apiModels, either in JSON or of ApiModel class


## `ApiModel.get()`

### Arguments

- None

### Returns

- Returns a merged and compiled apiModel of current state


## `ApiModel.addApiModel(...apiModels)`

Adds apiModels to the ApiModel instance.

### Arguments

- `apiModels` 0 or more apiModels, either in JSON or of ApiModel class



## `ApiModel.addRoute(route, definition)`

Add a new route or modify current route's definition.

### Arguments

- `route` path to the location to add
- `definition` object to place at route



## `ApiModel.removeRoute(route)`

Remove the route in the ApiModel instance.

### Arguments

- `route` path to the location to remove


## `ApiModel.addHandler(route, method, handlers)`

Adds one or more `handlers` to the `route` for the `method`

### Arguments

- `route` path to the location
- `method` method in which the `handlers` will go
- `handlers` a function or an array of functions to add at route for method


## `ApiModel.addFilter(route, method, filters)`

Adds one or more `filters` to the `route` for the `method`

### Arguments

- `route` path to the location
- `method` the `method` in which the `filters` will go
- `filters` a function or an array of functions to add at `route` for `method`



## `ApiModel.setAuth(route, auth)`

### Arguments

- `route` path to the location
- `auth` definition of the authentication you need

## `ApiModel.setRequiresAuth(route, value)`

### Arguments

- `route` path to the location
- `value` boolean to able authentication or disable it

## `ApiModel.setRequiresRoles(route, roles)`

### Arguments

- `route` path to the location
- `roles` boolean to able authentication or disable it

## `ApiModel.setRequiresRoles(route, roles)`

### Arguments

- `route` path to the location
- `roles` boolean to able authentication or disable it

## `ApiModel.toServer(env)`

Merges and compiles the model to create a `Server` from an ApiModel instance.

### Arguments

- `env` object which contains if needed the db and a secret key for JWT

### Returns

- `Server` Returns the server created
