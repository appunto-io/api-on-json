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

## Other libraries

- Extensible
- upload-models
- accounts-models
- aoj-admin

## Full features example
```js
const { DataModel } = require('@appunto/api-on-json');
const { Mongo }     = require('@appunto/api-on-json');

const mongoUri = 'http://localhost:27017';

const dataModels = {
    'cars': {
      schema: {
        'brand' : {type : 'String', 'required' : true},
        'model' : {type: 'String', 'default' : 'Default Model'},
        'speed' : {type: 'Number', 'min': 0, 'max': 300},
        'buyable' : {type: 'Boolean'},
        'constructor_id' : {type : 'Id', collection : 'factories'}
      },
      options: {
        searchableFields: ['brand']
      }
    },
    'apples': {
      schema: {
        'color' : {type: 'String'},
        'friends' : [{type : "String"}]
      }
    },
    'factories': {
      schema: {
        'name': {type: "String"},
        'cars_made': [
          {'cars_id': {type: 'Id', collection: 'cars'}}
        ]
      }
    }
};

const db = new Mongo(mongoUri, options);

const opt = {
  realTime: false
};

const dataModel = new DataModel(dataModels);

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


# Recipes

## Simple MongoDB Api

## Extending Api

# References

# Server

## `new Server(apiModel, [environment])`

Creates a new `Server` instance. In practice you will probably prefer to use `ApiModel.toServer(...)`.

### Arguments

- `apiModel` is a instance of `ApiModel`
- `environment` (optional) is an object that can be used to hold environment variables. `environment` object is passed to all Api handlers (see `Api`)

### Example

```js
const { Server } = require('@appunto/api-on-json');

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

- For `String`:
  - `lowercase` apply toLowerCase() to the string value
  - `uppercase` apply toUpperCase() to the string value
  - `trim` apply trim() to the string value
  - `match` add a validator to the string value and a regex
  - `minlength` add a minimum validator to the string length
  - `maxlength` add a maximum validator to the string length


- For `Number`:
  - `min` : indicates the minimum valid number
  - `max` : indicates the maximum valid number


- For `Date`:
  - `min` : indicates the minimum valid date
  - `max` : indicates the maximum valid date


- For `Id`:
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
const db = new Mongo(/*mongoUri*/, options);
```

## `Rethink`

The class which handles rethinkDB Api

### Example
```js
const db = new Rethink("localhost", "28015", "G");
```

## How to create a new database class

Later on, you might want to use your favorite database for your api,
and if we didn't implement it, you will need to add it yourself!

But don't worry, here is how to do it!

### First Step: Make a constructor

First you will need a constructor to create your db instance

You will need 3 things:
- all the parameters you need to connect to your db (an url, options ...)
- a database field where you will put your db object (for mongoDB: mongoose, for rethinkDB: r)
- a models list we will use it later, this will be the array where all the models used in your api will be

```js
class YourDB {
  constructor(url, options) {
    this.url      = url;
    this.options  = { ...options, useNewUrlParser : true, useUnifiedTopology : true, useFindAndModify : false};
    this.database = null;
    this.models   = [];
  }
}
```

### Second Step: Make a connect method

After that you will need a connect method, called by our library when the dataModel is compiled.
You should set `this.database` to its value (return by the connection call of the database you are using).

### Third Step: Make an init method

You will also need an init method, called by our library just after connect.
Here the goal is to setup your database for the dataModel you have created before.
That means if needed create:
- tables
- collection
- schema
- etc

### Fourth Step: Create all CRUD actions

The final step and the hardest, you will have to create each of the following callbacks.
All are required (except for `observe` which handles the realTime).

- `create(collection, data)`

  Your create method is the one called on a POST request to your api.

  You will need to get the model corresponding to the collection first.
  Then verify that the data you received is according to your model (i.e type, options etc).
  If all was validate you can then add it to your database.
  If all went fine, you can return the JSON of the new entry added to your db.

- `remove(collection, id)`

  Your remove method is the one called on a DELETE request to your api.

  You only need to request a deletion of the entry at the given `id` in the database.

- `readOne(collection, id)`

  Your readOne method is the one called on a GET request with an id to your api.

  You need to return the entry at the given `id` in the database.

- `readMany(collection, query)`

  Your readMany method is the one called on a simple GET request or on GET with query request to your api.

  You will first need to parse the query parameter. You will find different object.

  `page` and `pageSize` are used for pagination, the number of page is determined by the number of elements in the db and the pageSize.

  `sort` is a string looking like '`field`,`order`' or an array of those string.
  The results returned by readMany should be sorted according to those strings,
  by field and either in descending or ascending `order`(ascending by default).

  `cursor` is used for pagination too, it is the last `id`
  or a combination of the last `id` and the sorting method used at the previous GET request.

  `q` is used for searching in the db all elements that have a field that match a value.
  For example all elements that have at least one field starting with 'Tar'. We would get 'Tartine', 'Tarami' etc.
  Note that you only have to search in the searchableFields, if the user wants to research an other fields he should
  use the `f` parameter described after.

  `f` allows to have all values between a min and a max, it's an array of a `fieldName`,
  a `comparator` from this list 'lt, le, gt, ge' and a `val` that will be the bound.

- `update(collection, id, data)`

  Your update method is the one called on a PUT request.

  You will need to get the model corresponding to the collection first.
  Then verify that the data you received is according to your model (i.e type, options etc).
  If all was validate, you will have to replace the existing element in the db with the new one.
  Then return the newly created element.

- `patch(collection, id, data)`

  Your update method is the one called on a PATCH request.

  You will need to get the model corresponding to the collection first.
  Then verify that the data you received is according to your model (i.e type, options etc).
  If all was validate, you will have to change the existing element in the db with only the fields in data.
  Meaning that it should not raise an error if a required field is omit in data,
  because this field will just keep its previous value
  Then return the newly created element.

- `observe(collection, query, params, socket, callback)`

  This is the method use to put an observer to your db when you are using the realTime.
  Note that all database are not compatible with that features.
  In this method you will have to set up the way your realtime works (for example changefeeds in rethinkDB).
  Then the callback you will use is here to pair the socket for realTime.

  See observe in `Rethink` class for more information.


# Tests

Different tests exist, to run the tests suite:

```
npm run test
```

You can also run a single test file with:

```
npm run single-test ${path}
```
