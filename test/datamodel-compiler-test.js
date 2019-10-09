const {
  compileDataModel,
  compileTypeDeclaration,
  compileSchemaDeclaration,
  compileOptionsDeclaration,
  compileCollection
} = require('../src/dataModel/compiler.js');

const chai   = require('chai');
const expect = chai.expect;


describe('JSON data model compiler', () => {
  describe('Field type declarations', () => {
    it('Declarations with string literals', () => {

      ["String", "Number", "Date", "Boolean", "Mixed", "Id"].map(literal => {
        expect(compileTypeDeclaration(literal)).to.deep.equal({type:literal});
      });
      expect(compileTypeDeclaration("Unknown")).to.deep.equal({type:"Mixed"});
      expect(compileTypeDeclaration("String", "__type__")).to.deep.equal({__type__:"String"});
    });

    it('Object definition', () => {
      expect(compileTypeDeclaration({type : "String"})).to.deep.equal({type:"String"});
      expect(compileTypeDeclaration({type : "Unknown"})).to.deep.equal({type:"Mixed"});
      expect(compileTypeDeclaration({
        type : "String",
        unknown : 'unknown'
      })).to.deep.equal({
        type : "String",
      });

      expect(compileTypeDeclaration({
        __type__ : "String",
        unknown : 'unknown'
      }, "__type__")).to.deep.equal({
        __type__ : "String",
      });

      // Validation of properties common to all types
      expect(compileTypeDeclaration({
        type : "String",
        "required" : true,
        "index"    : true,
        "unique"   : true,
        "sparse"   : true
      })).to.deep.equal({
        type : "String",
        "required" : true,
        "index"    : true,
        "unique"   : true,
        "sparse"   : true
      });
      expect(compileTypeDeclaration({
        type : "String",
        "required" : "true",
        "index"    : "true",
        "unique"   : "true",
        "sparse"   : "true"
      })).to.deep.equal({
        type : "String",
      });

      // Validation of "String" properties
      expect(compileTypeDeclaration({
        type : "String",
        default : 1234,
        lowercase : 1234,
        uppercase : 1234,
        trim      : 1234,
        match     : 1234,
        minlength : "string",
        maxlength : "string"
      })).to.deep.equal({
        type : "String",
      });
      expect(compileTypeDeclaration({
        type : "String",
        default : "1234",
        lowercase : true,
        uppercase : true,
        trim      : true,
        match     : "pattern",
        minlength : 0,
        maxlength : 100
      })).to.deep.equal({
        type : "String",
        default : "1234",
        lowercase : true,
        uppercase : true,
        trim      : true,
        match     : "pattern",
        minlength : 0,
        maxlength : 100
      });

      // Validation of "Date" properties
      expect(compileTypeDeclaration({
        type : "Date",
        default : "invalid",
        min : "invalid",
        max : "invalid"
      })).to.deep.equal({
        type : "Date",
      });
      expect(compileTypeDeclaration({
        type : "Date",
        default : "now",
      })).to.deep.equal({
        type : "Date",
        default : "now",
      });
      expect(compileTypeDeclaration({
        type : "Date",
        default : "2018",
        min : 2010,
        max : "2018"
      })).to.deep.equal({
        type : "Date",
        default : "2018",
        min : 2010,
        max : "2018"
      });

      // Validation of "Number" properties
      expect(compileTypeDeclaration({
        type : "Number",
        default : "1234",
        min : "string",
        max : "string"
      })).to.deep.equal({
        type : "Number",
      });
      expect(compileTypeDeclaration({
        type : "Number",
        default : 1234,
        min : 0,
        max : 10000
      })).to.deep.equal({
        type : "Number",
        default : 1234,
        min : 0,
        max : 10000
      });

      // Validation of "Boolean" properties
      expect(compileTypeDeclaration({
        type : "Boolean",
        default : "1234",
      })).to.deep.equal({
        type : "Boolean",
      });
      expect(compileTypeDeclaration({
        type : "Boolean",
        default : true,
      })).to.deep.equal({
        type : "Boolean",
        default : true,
      });

      // Validation of "Id" properties
      expect(compileTypeDeclaration({
        type : "Id",
        default : 1234,
        collection : 1234
      })).to.deep.equal({
        type : "Id",
      });
      expect(compileTypeDeclaration({
        type : "Id",
        default : "1234",
        "collection" : "name"
      })).to.deep.equal({
        type : "Id",
        default : "1234",
        collection : "name"
      });

      // Validation of "Mixed" properties
      expect(compileTypeDeclaration({
        type : "Mixed",
        default : 1234,
      })).to.deep.equal({
        type : "Mixed",
        default : 1234,
      });
    });

    it('Nested array declaration', () => {
      expect(compileTypeDeclaration([])).to.deep.equal([{type:"Mixed"}]);
      expect(compileTypeDeclaration([{}])).to.deep.equal([{type:"Mixed"}]);
      expect(compileTypeDeclaration([{type:"Unknown"}])).to.deep.equal([{type:"Mixed"}]);
      expect(compileTypeDeclaration(["String"])).to.deep.equal([{type:"String"}]);
      expect(compileTypeDeclaration(["String", "Mixed"])).to.deep.equal([{type:"String"}]);
      expect(compileTypeDeclaration(["Number"], "__type__")).to.deep.equal([{__type__:"Number"}]);
      expect(compileTypeDeclaration([{type:"String"}, {type:"Number"}])).to.deep.equal([{type:"String"}]);
    });

    it('Nested object declaration', () => {
      expect(compileTypeDeclaration({
        field1 : "Number",
        field2 : "String",
        field3 : "Unknown"
      })).to.deep.equal({
        field1 : {type:"Number"},
        field2 : {type:"String"},
        field3 : {type:"Mixed"}
      });

      expect(compileTypeDeclaration({})).to.deep.equal({type:"Mixed"});
    });

    it('Everything else is replaced by "Mixed"', () => {
      expect(compileTypeDeclaration(() => {})).to.deep.equal({type:"Mixed"});
    });
  });


  describe('Schema declarations', () => {
    it('Compile all fields', () => {
      expect(compileSchemaDeclaration({
        field1 : "String",
        field2 : "Number",
        field3 : {type : "String", default : "value"}
      })).to.deep.equal({
        field1 : {type : "String"},
        field2 : {type : "Number"},
        field3 : {type : "String", default : "value"}
      });
    });

    it('Handle typeKey', () => {
      expect(compileSchemaDeclaration({
        field1 : {type : "String"},
        field3 : {__type__ : "String"}
      }, "__type__")).to.deep.equal({
        field1 : {type : {__type__ : "String"}},
        field3 : {__type__ : "String"}
      });
    })
  });

  describe('Options declarations', () => {
    it('Handle timestamps option', () => {
      expect(compileOptionsDeclaration({
        timestamps : true
      }).timestamps).to.deep.equal(true);
      expect(compileOptionsDeclaration({
        timestamps : false
      }).timestamps).to.deep.equal(false);
      expect(compileOptionsDeclaration({
        timestamps : 'string'
      }).timestamps).to.deep.equal(true);
      expect(compileOptionsDeclaration({
        // timestamps : undefined
      }).timestamps).to.deep.equal(true);
      expect(compileOptionsDeclaration({
        timestamps : {createdAt : "creationDate"}
      }).timestamps).to.deep.equal({createdAt : "creationDate", updatedAt : "updatedAt"});
      expect(compileOptionsDeclaration({
        timestamps : {updatedAt : "string"}
      }).timestamps).to.deep.equal({createdAt : "createdAt", updatedAt : "string"});
      expect(compileOptionsDeclaration({
        timestamps : {createdAt : "creationDate", updatedAt : "string"}
      }).timestamps).to.deep.equal({createdAt : "creationDate", updatedAt : "string"});
    });

    it('Handle typeKey option', () => {
      expect(compileOptionsDeclaration({
        // typeKey : undefined
      }).typeKey).to.deep.equal("type");
      expect(compileOptionsDeclaration({
        typeKey : "__type__"
      }).typeKey).to.deep.equal("__type__");
    });
  });

  describe('Collection declaration', () => {
    it('Collection', () => {
      expect(compileCollection({
        schema : {field1:"String", field2:{type:"Number"}}
      })).to.deep.equal({
        options : {typeKey:"type", timestamps : true},
        schema  : {field1 : {type:"String"}, field2:{type:"Number"}}
      });
      expect(compileCollection({
        options : {typeKey : "__type__"},
        schema  : {field1:"String", field2:{type:"Number"}}
      })).to.deep.equal({
        options : {typeKey:"__type__", timestamps : true},
        schema  : {field1 : {__type__:"String"}, field2:{type:{__type__:"Number"}}}
      });
    });
  });

  describe('Model declaration', () => {
    it('Complete model', () => {
      expect(compileDataModel({
        "user" : {
          schema : {
            "username" : "String",
            "password" : "String"
          }
        },
        "login" : {
          options : {
            timestamps : false
          },
          schema : {
            "token" : "String",
            "expiresAt" : "Date"
          }
        }
      })).to.deep.equal({
        "user" : {
          options : {
            timestamps : true,
            typeKey : 'type'
          },
          schema : {
            "username" : {type : "String"},
            "password" : {type : "String"}
          }
        },
        "login" : {
          options : {
            timestamps : false,
            typeKey : 'type'
          },
          schema : {
            "token" : {type : "String"},
            "expiresAt" : {type : "Date"}
          }
        }
      });
    });
  });
});
