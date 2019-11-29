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
  it('Test getting the merged data model from an empty data model', () => {
    const dataModel = new DataModel();

    expect(dataModel.get()).to.be.deep.equal({})
  });

  it('Test getting the merged data model', () => {
    const dataModel = new DataModel(model1);

    dataModel.addModel(model2);

    expect(dataModel.get()).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type',
          'searchableFields' : []
        }
      },
      'apple': {
        schema: {
          'color' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type',
          'searchableFields' : []
        }
      }
    });
  });

  it('Test adding a new collection to the data model', () => {
    const dataModel = new DataModel(model1);

    dataModel.addCollection('users', {
      schema: { name: { type: 'String', required: true } }
    });

    expect(dataModel.get()).to.be.deep.equal({
      'cars': {
        schema: {
          'brand' : {type : 'String', 'required' : true},
          'model' : {type: 'String', 'default' : 'Default Model'}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type',
          'searchableFields' : []
        }
      },
      'users': {
        schema: {
          'name' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type',
          'searchableFields' : []
        }
      }
    });
  });

  it('Test adding a new field to an existing collection in the data model', () => {
    const dataModel = new DataModel(model1);

    dataModel.addField('cars', 'serial', { type: 'String', required: true });

    expect(dataModel.get()).to.be.deep.equal({
      'cars': {
        schema: {
          'brand'  : {type : 'String', 'required' : true},
          'model'  : {type: 'String', 'default' : 'Default Model'},
          'serial' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type',
          'searchableFields' : []
        }
      }
    });
  });

  it('Test adding a new field to a new collection in the data model', () => {
    const dataModel = new DataModel(model1);

    dataModel.addField('users', 'name', { type: 'String', required: true });

    expect(dataModel.get()).to.be.deep.equal({
      'cars': {
        schema: {
          'brand'  : {type : 'String', 'required' : true},
          'model'  : {type: 'String', 'default' : 'Default Model'},
          'serial' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type',
          'searchableFields' : []
        }
      },
      'users': {
        schema: {
          'name' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type',
          'searchableFields' : []
        }
      }
    });
  });

  it('Test removing a collection in the data model', () => {
    const dataModel = new DataModel(model1);
    dataModel.addModel(model2);

    dataModel.removeCollection('apple');

    expect(dataModel.get()).to.be.deep.equal({
      'cars': {
        schema: {
          'brand'  : {type : 'String', 'required' : true},
          'model'  : {type: 'String', 'default' : 'Default Model'},
          'serial' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type',
          'searchableFields' : []
        }
      }
    });

    dataModel.removeCollection('cars');

    expect(dataModel.get()).to.be.deep.equal({});
  });

  it('Test removing a collection in the data model', () => {
    const dataModel = new DataModel(model1);
    dataModel.addModel(model2);

    dataModel.removeField('apple', 'color');

    expect(dataModel.get()).to.be.deep.equal({
      'cars': {
        schema: {
          'brand'  : {type : 'String', 'required' : true},
          'model'  : {type: 'String', 'default' : 'Default Model'},
          'serial' : {type : 'String', 'required' : true}
        },
        options: {
          'timestamps' : true,
          'typeKey'   : 'type',
          'searchableFields' : []
        }
      },
      'apple': {
        schema: {},
        options: {
          'timestamps' : true,
          'typeKey'   : 'type',
          'searchableFields' : []
        }
      }
    });
  });

  it('Test creating an api model from a data model', () => {
    const dataModel = new DataModel(model1);
    dataModel.addModel(model2);

    const options = {realTime : ['cars', 'boats']};

    const apiModel = dataModel.toApi(options);

    const mergedApiModel = apiModel.get();

    expect(mergedApiModel.isApiModel).to.be.true;
    expect(mergedApiModel.hasRealtime).to.be.true;
  });

  it('Test creating an api model from a data model', () => {
    const dataModel = new DataModel(model1);
    dataModel.addModel(model2);

    const options = {
      realTime: false
    };

    const apiModel = dataModel.toApi(options);
    const mergedApiModel = apiModel.get();

    expect(mergedApiModel.isApiModel).to.be.true;
    expect(mergedApiModel.hasRealtime).to.be.false;
  });

});
