const chai   = require('chai');
const expect = chai.expect;

const { DataModel } = require('./datamodel.js')

const model1 = {
  'cars': {
    schema: {
      'brand' : {type : 'String', 'required' : true},
      'model' : {type: 'String', 'default' : 'Default Model'}
    }
  }
}

const model2 = {
  'apple': {
    schema: {
      'color' : {type : 'String', 'required' : true}
    }
  }
}

describe('Field type declarations', () => {
  it('Test the creation of a data model without model', () => {
    const dataModel = new DataModel();
    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models).to.be.empty;
  });

  it('Test the creation of a data model with one model', () => {
    const dataModel = new DataModel(model1);
    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models[0]).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });
  });

  it('Test the creation of a data model with multiple models', () => {
    const dataModel = new DataModel(model1, model2);
    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models[0]).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });
    expect(dataModel.models[1]).to.be.deep.equal({
      'apple': {
        schema: {
          'color' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });
  });

  it('Test adding Model method', () => {
    const dataModel = new DataModel(model1);
    dataModel.addDataModel(model2)

    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models[0]).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });
    expect(dataModel.models[1]).to.be.deep.equal({
      'apple': {
        schema: {
          'color' : {type : 'String', 'required' : true}
        }
      }
    });
  });

  it('Test getting the merged data model from an empty data model', () => {
    const dataModel = new DataModel();
    const merged = dataModel.get();

    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models).to.be.empty;
    expect(merged).to.be.deep.equal({})
  });

  it('Test getting the merged data model', () => {
    const dataModel = new DataModel(model1);
    const merged = dataModel.get();

    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models[0]).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });
    expect(dataModel.models[0]).to.be.deep.equal(merged);

    dataModel.addDataModel(model2);
    const merged2 = dataModel.get();

    expect(dataModel.models).to.be.an('array');
    expect(merged2).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      },
      'apple': {
        schema: {
          'color' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });
  });

  it('Test adding a new collection to the data model', () => {
    const dataModel = new DataModel(model1);

    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models[0]).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });

    dataModel.addCollection('users', {
      schema: { name: { type: 'String', required: true } }
    });

    const merged = dataModel.get();

    expect(merged).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      },
      'users': {
        schema: {
          'name' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });
  });

  it('Test adding a new field to an existing collection in the data model', () => {
    const dataModel = new DataModel(model1);

    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models[0]).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });

    dataModel.addField('cars', 'serial', { type: 'String', required: true });
    const merged = dataModel.get();

    expect(merged).to.be.deep.equal({
      'cars': {
        schema: {
          'brand'  : {type : 'String', 'required' : true},
          'model'  : {type: 'String', 'default' : 'Default Model'},
          'serial' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });
  });

  it('Test adding a new field to a new collection in the data model', () => {
    const dataModel = new DataModel(model1);

    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models[0]).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });

    dataModel.addField('users', 'name', { type: 'String', required: true });
    const merged = dataModel.get();

    expect(merged).to.be.deep.equal({
      'cars': {
        schema: {
          'brand'  : {type : 'String', 'required' : true},
          'model'  : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      },
      'users': {
        schema: {
          'name' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });
  });

  it('Test removing a collection in the data model', () => {
    const dataModel = new DataModel(model1);
    dataModel.addDataModel(model2);

    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models[0]).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });

    dataModel.removeColleciton('apple');
    const merged = dataModel.get();

    expect(merged).to.be.deep.equal({
      'cars': {
        schema: {
          'brand'  : {type : 'String', 'required' : true},
          'model'  : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });

    dataModel.removeColleciton('cars');
    const merged2 = dataModel.get();

    expect(merged2).to.be.deep.equal({});
  });

  it('Test removing a collection in the data model', () => {
    const dataModel = new DataModel(model1);
    dataModel.addDataModel(model2);

    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models[0]).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });

    dataModel.removeField('apple', 'color');
    const merged = dataModel.get();

    expect(merged).to.be.deep.equal({
      'cars': {
        schema: {
          'brand'  : {type : 'String', 'required' : true},
          'model'  : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      },
      'apple': {
        schema: {},
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });
  });

  it('Test creating an api model from a data model', () => {
    const dataModel = new DataModel(model1);
    dataModel.addDataModel(model2);

    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models[0]).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });

    const options = {};

    const apiModel = dataModel.toApi(options);

    expect(apiModel.models).to.be.an('array');
    const mergedApiModel = apiModel.get();

    expect(mergedApiModel.isApiModel).to.be.true;
    expect(mergedApiModel.hasRealtime).to.be.true;
  });

  it('Test creating an api model from a data model', () => {
    const dataModel = new DataModel(model1);
    dataModel.addDataModel(model2);

    expect(dataModel.models).to.be.an('array');
    expect(dataModel.models[0]).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type'
        }
      }
    });

    const options = {
      realTime: false
    };

    const apiModel = dataModel.toApi(options);
    const mergedApiModel = apiModel.get();

    expect(apiModel.models).to.be.an('array');

    expect(mergedApiModel.isApiModel).to.be.true;
    expect(mergedApiModel.hasRealtime).to.be.false;
  });

});
