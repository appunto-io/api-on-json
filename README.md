# Api On Json

# Installation

```
npm install @appunto/api-on-json
```

# Library usage examples

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
})

const apiModel = dataModel.toApi();

const env = {
  db : new Mongo(connectionOptions)    
}

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
}

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
})

const apiModel = dataModel.toApi();

const env = {
  db : new Mongo(connectionOptions)    
}

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
}

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
}

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
}

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

//...

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

//...

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
  realTime : ['cars', 'trucs', 'boats']
});

const mongo = new Mongo(mongoUri, options);

const server = apiModel.toServer({db: mongo});
server.listen(port)

```
