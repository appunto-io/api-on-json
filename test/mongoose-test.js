const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const { compileDataModel }    = require('../src/dataModel/compiler.js');
const { dataModelToMongoose } = require('../src/dataModel/mongoose.js');

const Model = mongoose.Model;

const chai   = require('chai');
const expect = chai.expect;


describe('Mongoose data model compiler', () => {
  it('Create mongoose models', () => {
    const model = dataModelToMongoose(compileDataModel({
      "collection1" : {
        schema : {
          "field1" : "String",
          "field2" : {type : "Number", "default" : 1234}
        }
      },
      "collection2" : {
        options : {
          typeKey : "__type__",
          timestamps : {createdAt : "ca", updatedAt : "ua"}
        },
        schema : {
          "field1" : {__type__ : "String", "default" : "default_string"},
          "field2" : {type : "String"},
        }
      }
    }), mongoose);

    expect(model["collection1"]).to.not.be.undefined;
    expect(model["collection2"]).to.not.be.undefined;

    const collection1Document = new model["collection1"]({
      field1 : "value"
    });
    expect(collection1Document.field1).to.be.equal("value");
    expect(collection1Document.field2).to.be.equal(1234);

    const collection2Document = new model["collection2"]({
      field2 : {type:'value'}
    });
    expect(collection2Document.field1).to.be.equal("default_string");
  });

  it("Testing nested arrays", () => {
    const model = dataModelToMongoose(compileDataModel({
      "collection3" : {
        schema : {
          "field1" : ["String"],
        }
      },
    }), mongoose);

    const collection3Document = new model["collection3"]({
      field1 : ["Foo", "Bar"]
    });

    expect(collection3Document.field1[0]).to.deep.equal("Foo");
    expect(collection3Document.field1[1]).to.deep.equal("Bar");
    expect(collection3Document.field1.length).to.deep.equal(2);
  });
});
