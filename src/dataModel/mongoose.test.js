const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const { compileDataModel } = require('./compiler');
const { dataModelToMongoose } = require('./mongoose');

const Model = mongoose.Model;


describe('Mongoose data model compiler', () => {
  test('Create mongoose models', () => {
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

    expect(model["collection1"]).toBeDefined();
    expect(model["collection2"]).toBeDefined();

    const collection1Document = new model["collection1"]({
      field1 : "value"
    });
    expect(collection1Document.field1).toStrictEqual("value");
    expect(collection1Document.field2).toStrictEqual(1234);

    const collection2Document = new model["collection2"]({
      field2 : {type:'value'}
    });
    expect(collection2Document.field1).toStrictEqual("default_string");
    expect(collection2Document.field2).toEqual({type:"value"});
  });

  test("Testing nested arrays", () => {
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

    expect(collection3Document.field1[0]).toEqual("Foo");
    expect(collection3Document.field1[1]).toEqual("Bar");
    expect(collection3Document.field1.length).toEqual(2);
  });
});
