const {
  compileDataModel,
  compileTypeDeclaration,
  compileSchemaDeclaration,
  compileOptionsDeclaration,
  compileCollection
} = require('./compiler.js');

/*
Hacky function used for debugging. Since console.log() does
not work with Jest, all debug messages are sent to a file
with the same name of the test script and .testlog extension.
These files should be listed in .gitignore.
Output can be shown on realtime with $tail -f <filename>.
 */
const fs = require('fs');
const log = msg => {
  fs.writeFileSync(__filename + '.testlog', msg+"\n");
};



describe('JSON data model compiler', () => {
  describe('Field type declarations', () => {
    test('Declarations with string literals', () => {

      ["String", "Number", "Date", "Boolean", "Mixed", "Id"].map(literal => {
        expect(compileTypeDeclaration(literal)).toEqual({type:literal});
      });
      expect(compileTypeDeclaration("Unknown")).toEqual({type:"Mixed"});
      expect(compileTypeDeclaration("String", "__type__")).toEqual({__type__:"String"});
    });

    test('Object definition', () => {
      expect(compileTypeDeclaration({type : "String"})).toEqual({type:"String"});
      expect(compileTypeDeclaration({type : "Unknown"})).toEqual({type:"Mixed"});
      expect(compileTypeDeclaration({
        type : "String",
        unknown : 'unknown'
      })).toEqual({
        type : "String",
      });

      expect(compileTypeDeclaration({
        __type__ : "String",
        unknown : 'unknown'
      }, "__type__")).toEqual({
        __type__ : "String",
      });

      // Validation of properties common to all types
      expect(compileTypeDeclaration({
        type : "String",
        "required" : true,
        "index"    : true,
        "unique"   : true,
        "sparse"   : true
      })).toEqual({
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
      })).toEqual({
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
      })).toEqual({
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
      })).toEqual({
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
      })).toEqual({
        type : "Date",
      });
      expect(compileTypeDeclaration({
        type : "Date",
        default : "now",
      })).toEqual({
        type : "Date",
        default : "now",
      });
      expect(compileTypeDeclaration({
        type : "Date",
        default : "2018",
        min : 2010,
        max : "2018"
      })).toEqual({
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
      })).toEqual({
        type : "Number",
      });
      expect(compileTypeDeclaration({
        type : "Number",
        default : 1234,
        min : 0,
        max : 10000
      })).toEqual({
        type : "Number",
        default : 1234,
        min : 0,
        max : 10000
      });

      // Validation of "Boolean" properties
      expect(compileTypeDeclaration({
        type : "Boolean",
        default : "1234",
      })).toEqual({
        type : "Boolean",
      });
      expect(compileTypeDeclaration({
        type : "Boolean",
        default : true,
      })).toEqual({
        type : "Boolean",
        default : true,
      });

      // Validation of "Id" properties
      expect(compileTypeDeclaration({
        type : "Id",
        default : 1234,
        collection : 1234
      })).toEqual({
        type : "Id",
      });
      expect(compileTypeDeclaration({
        type : "Id",
        default : "1234",
        "collection" : "name"
      })).toEqual({
        type : "Id",
        default : "1234",
        collection : "name"
      });

      // Validation of "Mixed" properties
      expect(compileTypeDeclaration({
        type : "Mixed",
        default : 1234,
      })).toEqual({
        type : "Mixed",
        default : 1234,
      });
    });

    test('Nested array declaration', () => {
      expect(compileTypeDeclaration([])).toEqual([{type:"Mixed"}]);
      expect(compileTypeDeclaration([{}])).toEqual([{type:"Mixed"}]);
      expect(compileTypeDeclaration([{type:"Unknown"}])).toEqual([{type:"Mixed"}]);
      expect(compileTypeDeclaration(["String"])).toEqual([{type:"String"}]);
      expect(compileTypeDeclaration(["String", "Mixed"])).toEqual([{type:"String"}]);
      expect(compileTypeDeclaration(["Number"], "__type__")).toEqual([{__type__:"Number"}]);
      expect(compileTypeDeclaration([{type:"String"}, {type:"Number"}])).toEqual([{type:"String"}]);
    });

    test('Nested object declaration', () => {
      expect(compileTypeDeclaration({
        field1 : "Number",
        field2 : "String",
        field3 : "Unknown"
      })).toEqual({
        field1 : {type:"Number"},
        field2 : {type:"String"},
        field3 : {type:"Mixed"}
      });

      expect(compileTypeDeclaration({})).toEqual({type:"Mixed"});
    });

    test('Everything else is replaced by "Mixed"', () => {
      expect(compileTypeDeclaration(() => {})).toEqual({type:"Mixed"});
    });
  });


  describe('Schema declarations', () => {
    test('Compile all fields', () => {
      expect(compileSchemaDeclaration({
        field1 : "String",
        field2 : "Number",
        field3 : {type : "String", default : "value"}
      })).toEqual({
        field1 : {type : "String"},
        field2 : {type : "Number"},
        field3 : {type : "String", default : "value"}
      });
    });

    test('Handle typeKey', () => {
      expect(compileSchemaDeclaration({
        field1 : {type : "String"},
        field3 : {__type__ : "String"}
      }, "__type__")).toEqual({
        field1 : {type : {__type__ : "String"}},
        field3 : {__type__ : "String"}
      });
    })
  });

  describe('Options declarations', () => {
    test('Handle timestamps option', () => {
      expect(compileOptionsDeclaration({
        timestamps : true
      }).timestamps).toEqual(true);
      expect(compileOptionsDeclaration({
        timestamps : false
      }).timestamps).toEqual(false);
      expect(compileOptionsDeclaration({
        timestamps : 'string'
      }).timestamps).toEqual(true);
      expect(compileOptionsDeclaration({
        // timestamps : undefined
      }).timestamps).toEqual(true);
      expect(compileOptionsDeclaration({
        timestamps : {createdAt : "creationDate"}
      }).timestamps).toEqual({createdAt : "creationDate", updatedAt : "updatedAt"});
      expect(compileOptionsDeclaration({
        timestamps : {updatedAt : "string"}
      }).timestamps).toEqual({createdAt : "createdAt", updatedAt : "string"});
      expect(compileOptionsDeclaration({
        timestamps : {createdAt : "creationDate", updatedAt : "string"}
      }).timestamps).toEqual({createdAt : "creationDate", updatedAt : "string"});
    });

    test('Handle typeKey option', () => {
      expect(compileOptionsDeclaration({
        // typeKey : undefined
      }).typeKey).toEqual("type");
      expect(compileOptionsDeclaration({
        typeKey : "__type__"
      }).typeKey).toEqual("__type__");
    });
  });

  describe('Collection declaration', () => {
    test('Collection', () => {
      expect(compileCollection({
        schema : {field1:"String", field2:{type:"Number"}}
      })).toEqual({
        options : {typeKey:"type", timestamps : true},
        schema  : {field1 : {type:"String"}, field2:{type:"Number"}}
      });
      expect(compileCollection({
        options : {typeKey : "__type__"},
        schema  : {field1:"String", field2:{type:"Number"}}
      })).toEqual({
        options : {typeKey:"__type__", timestamps : true},
        schema  : {field1 : {__type__:"String"}, field2:{type:{__type__:"Number"}}}
      });
    });
  });

  describe('Model declaration', () => {
    test('Complete model', () => {
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
      })).toEqual({
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
