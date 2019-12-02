# Api On Json

# Installation

```
npm install @appunto/api-on-json
```

# Introduction

Create an API quickly

## Structures

The idea behind API on JSON is to build an entire API service via a JSON configuration file. JSON files can be used to configure API endpoints and data model.

The library is structured around three main classes: `Server`, `ApiModel` and `DataModel`.

`Server` creates an ExpressJS server.

`ApiModel` describes the structure of the API. This is passed to the `Server` to create API routes.

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
await db.init(dataModel);

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

### Arguments

- `apiModel` is a instance of `ApiModel`
- `environment` (optional) is an object that can be used to hold environment variables. `environment` object is passed to all Api handlers (see `Api`)

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

### Arguments

- `port` the port to which the server listen to

### Example

```js
const server = new Server(apiModel, environment);
server.listen(80);
```

## `Server.close()`

Stops a server.

### Arguments

### Example

```js
const server = new Server(apiModel, environment);
server.listen(80);
server.close();
```

# Api

## JSON model

JSON Api model describes the behavior of the API.

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
  - `requiresAuth` boolean, true if an authentication is needed or false if not
  - `requiresRoles` list of string enumerating the roles that can be authenticated
  - `policies` list of function called at the server creation


- `handlers` multiple functions executed for each method
- `filters` multiple functions executed before each method
- `realTime` multiple functions needed for real-time api:
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

### Returns

- `ApiModel` Returns the ApiModel instance newly created


## `ApiModel.get()`

### Arguments

- None

### Returns

- Returns a merged and compiled apiModel of current state


## `ApiModel.addModel(...apiModels)`

Adds apiModels to the ApiModel instance.

### Arguments

- `apiModels` 0 or more apiModels, either in JSON or of ApiModel class

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.addModel(/* your models */);
```



## `ApiModel.addRoute(route, definition)`

Add a new route or modify current route's definition.

### Arguments

- `route` path to where to add the definition
- `definition` different handlers and authentication rules which indicates how the route is handled

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.addRoute('/route1', {/*...*/});
```



## `ApiModel.removeRoute(route)`

Remove the route in the ApiModel instance.

### Arguments

- `route` path to the location to be removed

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.removeRoute('/route1/subRoute1');
```

## `ApiModel.addHandler(route, method, handlers)`

Adds one or more `handlers` to the `route` for the `method`

### Arguments

- `route` path to the location
- `method` method in which the `handlers` will go
- `handlers` a function or an array of functions to handle the route

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.addHandler('/users', 'GET', [handler1, handler2]);
```



## `ApiModel.addFilter(route, method, filters)`

Adds one or more `filters` to the `route` for the `method`

### Arguments

- `route` path to the location
- `method` the `method` in which the `filters` will go
- `filters` a function or an array of functions to filter the `method` at `route`

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.addFilter('/users', 'GET', filter);
```



## `ApiModel.setAuth(route, auth)`

### Arguments

- `route` path to the location
- `auth` definition of the authentication to access `route`

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.setAuth('/users', {requiresAuth: true, requiresRoles: ['admin']});
```


## `ApiModel.setRequiresAuth(route, value)`

### Arguments

- `route` path to the location
- `value` boolean to able authentication or disable it

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.setRequiresAuth('/users', false);
```

## `ApiModel.setRequiresRoles(route, roles)`

### Arguments

- `route` path to the location
- `roles` a string or an array of strings to add roles which can access the `route`

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.setRequiresRoles('/users', ['admin', 'user']);
```


## `ApiModel.addPolicies(route, policies)`

### Arguments

- `route` path to the location
- `policies` a function or an array of functions which will be called at the `Server` creation

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.addPolicies('/users', [policy]);
```




## `ApiModel.addRealTimeHandler(route, realTimeHandlers)`

### Arguments

- `route` path to the location
- `realTimeHandlers` a function or an array of functions which will be called with the `socket` in realTime

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.addRealTimeHandler('/users', {connect: connectHandler, disconnect: disconnectHandler1});
```


## `ApiModel.addConnectHandler(route, connect)`

### Arguments

- `route` path to the location
- `connect` a function or an array of functions which will be called at the `socket` connection in realTime

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.addConnectHandler('/users', connectHandler);
```



## `ApiModel.addMessageHandler(route, message)`

### Arguments

- `route` path to the location
- `message` a function or an array of functions which will be called on `socket` message in realTime

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.addMessageHandler('/users', [messageHandler1]);
```


## `ApiModel.addDisconnectHandler(route, disconnect)`

### Arguments

- `route` path to the location
- `disconnect` a function or an array of functions which will be called at the `socket` disconnection in realTime

### Returns

- `ApiModel` Returns the ApiModel instance

### Example
```js
const apiModel = new ApiModel();
apiModel.addDisconnectHandler('/users', [disconnectHandler1, disconnectHandler2]);
```


## `ApiModel.toServer(env)`

Merges and compiles the model to create a `Server` from an ApiModel instance.

### Arguments

- `env` object which contains if needed the db and a secret key for JWT

### Returns

- `Server` Returns the server created

### Example
```js
const server = apiModel.toServer(environment);
server.listen(80);
server.close();
```


# Data

## JSON data model

JSON Data model describes the shape of the data in the database.

A JSON Data model is composed by a set of schema and options.

```js
const model = {
  'collection1' : {
    schema: {/* definition */},
    options: {/* definition */}
  },
  'collection2' : {
    schema: {/* definition */},
    options: {/* definition */}
  }
};
```

Each collection can contain a `schema` and some `options`.

A schema is composed of multiple fields which are made from a `name` and some `specifications`

Specifications can contain:

- `type` the type of the field, it can be:
  - `String` indicates that the field is a string
  - `Number` indicates that the field is a number, integer or float
  - `Date` indicates that the field is a date
  - `Boolean` indicates that the field is a boolean, either true or false
  - `Id` indicates that the field is an id pointing to another collection
  - `Mixed` indicates that the field is not one of the above


- For all types:
  - `required` boolean which indicates either this field is required or not for validation
  - `default` an object of the same type that in `type`, use when no value is set for this field
  - `unique` indicates that this field can't have duplicate value
  - `index` indicates that the field can be used as an index in the database
  - `sparse`


- For `String` only:
  - `lowercase`
  - `uppercase`
  - `trim`
  - `match`
  - `minlength`
  - `maxlength`


- For `Number` only:
  - `min` : indicates the minimum valid number
  - `max` : indicates the maximum valid number


- For `Date` only:
  - `min` : indicates the minimum valid date
  - `max` : indicates the maximum valid date


- For `Id` only:
  - `collection` : string which indicates the collection in which the id is pointing


Options can contain :


- `timestamps` allows to disable or modify the dates `createdAt` and `updatedAt` of the data
- `typeKey` indicates the key used as `type` in the schema.
- `searchableFields` an array of collection's name that are searchable. An empty array means you can't do research in the database.

### Example

```js
const dataModels = {
    'collection1': {
      schema: {
        'field1' : {type : 'String', 'required' : true},
        'field2' : {type: 'String', 'default' : 'Default Model'},
        'field3' : {type: 'Number', 'min': 0, 'max': 300},
        'field4' : {type : 'Id', collection : 'collection3'}
      },
      options: {
        searchableFields: ['field1']
      }
    },
    'collection2': {
      schema: {
        'field1' : {type: 'String'},
        'field2' : [{type : "String"}]
      }
    },
    'collection3': {
      schema: {
        'field1': {type: "String"},
        'field2': [
          {'subField1': {type: 'Id', collection: 'cars'}}
        ]
      }
    }
};
```

## `new DataModel(...dataModels)`

Creates a new `DataModel` instance.

### Arguments

- `dataModels` 0 or more dataModels, either in JSON or from DataModel class

### Returns

- `DataModel` Returns the DataModel instance newly created

### Example
```js
const dataModel = new DataModel(/* your models */);
```


## `DataModel.get()`

### Arguments

- None

### Returns

- Returns a merged and compiled data model of current state

### Example
```js
const dataModel = new DataModel(/* your models */);
const merged = dataModel.get();
```


## `DataModel.addModel(...dataModels)`

Adds data models to the `DataModel` instance.

### Arguments

- `dataModels` 0 or more data models, either in JSON or in DataModel class

### Returns

- `DataModel` Returns the DataModel instance

### Example
```js
const dataModel = new DataModel(/* your models */);
dataModel.addModel(/* your models */);
```


## `DataModel.addCollection(collection, definition)`

Adds a new collection to the `DataModel` instance.

### Arguments

- `collection` the name of the collection
- `definition` the fields of the collection

### Returns

- `DataModel` Returns the DataModel instance

### Example
```js
const dataModel = new DataModel();
dataModel.addCollection('cars', {
  schema: {
    'model' : { type: 'String' }
  },
  options: {
    searchableFields: ['model']
  }
});
```


## `DataModel.addField(collection, field, definition)`

Adds a new field at collection in the `DataModel` instance.

### Arguments

- `collection` the name of the collection in which the field will be added
- `field` the name of the field
- `definition` the specifications of the field

### Returns

- `DataModel` Returns the DataModel instance

### Example
```js
const dataModel = new DataModel();
dataModel.addField('cars', 'brand', {type: String, required: true});
```


## `DataModel.removeCollection(collection)`

Removes a collection in the `DataModel` instance.

### Arguments

- `collection` the name of the collection to be removed

### Returns

- `DataModel` Returns the DataModel instance

### Example
```js
const dataModel = new DataModel();
dataModel.removeCollection('cars');
```


## `DataModel.removeField(collection, field)`

Removes a collection in the `DataModel` instance.

### Arguments

- `collection` the name of the collection in which the field will be removed
- `field` the name of the field to be removed

### Returns

- `DataModel` Returns the DataModel instance

### Example
```js
const dataModel = new DataModel();
dataModel.removeField('users', 'old_username');
```


## `DataModel.setOptions(collection, options)`

Sets the options of the collection in the `DataModel` instance.

If the collection doesn't exist it creates it.

### Arguments

- `collection` the name of the collection
- `options` the options to be set

### Returns

- `DataModel` Returns the DataModel instance

### Example
```js
const dataModel = new DataModel();
dataModel.setOptions('users', {searchableFields: ['username', 'name']});
```


## `DataModel.setType(collection, field, type)`

Sets the type of a field in the given collection in the `DataModel` instance.

### Arguments

- `collection` the name of the collection
- `field` the name of the field
- `type` the new type of the field

### Returns

- `DataModel` Returns the DataModel instance

### Example
```js
const dataModel = new DataModel();
dataModel.setType('users', 'username', 'String');
```

## `DataModel.setRequired(collection, field, value)`

Sets if the field in collection is required or not in the `DataModel` instance.

### Arguments

- `collection` the name of the collection
- `field` the name of the field
- `value` boolean, true if it is required, false if it is not required

### Returns

- `DataModel` Returns the DataModel instance

### Example
```js
const dataModel = new DataModel();
dataModel.setRequired('users', 'username', true);
```


## `DataModel.setUnique(collection, field, value)`

Sets if the field in collection is unique or not in the `DataModel` instance.

### Arguments

- `collection` the name of the collection
- `field` the name of the field
- `value` boolean, true if it is unique, false if it is not unique

### Returns

- `DataModel` Returns the DataModel instance

### Example
```js
const dataModel = new DataModel();
dataModel.setUnique('users', 'username', true);
```

## `DataModel.toApi(opt)`

Merges and compiles the model to create an `ApiModel` from a DataModel instance.

### Arguments

- `opt` object which contains if needed the collections with realTime

### Returns

- `ApiModel` Returns the ApiModel created

### Example
```js
const apiModel = dataModel.toApi({realTime: ['collection1', 'collection3']});
```

# Database

In api-on-json you can add the handling of your database.

By default the library handle MongoDB and RethinkDB.

You can add a DB of your own, you just have to create a new DB class and write those methods:
- `connect` handle the connection with your db
- `init` init the list of data models
- `create` for POST request
- `remove` for DELETE request
- `readOne` for GET id request
- `readMany` for GET request with queries
- `update` for PUT request
- `patch` for PATCH request
- `observe` for realTime (if your db handle it)

## `Mongo`

The class which handles mongoDB Api

### Example
```js
const options = {
                  useNewUrlParser : true,
                  useUnifiedTopology: true,
                  useFindAndModify: false};

const db = new Mongo(/*mongoUri*/, options);
```

## `Rethink`

The class which handles rethinkDB Api

### Example
```js
const db = new Rethink("localhost", "28015", "G");
```

# Tests

Different tests exist, to run the tests suite:

```
npm run test
```

You can also run a single test file with:

```
npm run single-test ${path}
```
