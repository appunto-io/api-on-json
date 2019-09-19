const { dataModelToMongoose,
        compileDataModel }            = require('./dataModel/index.node.js');
const {
        createLibraryFromDataModel,
        createApiFromDataModel,
        compileApiModel,
        hydrate }                     = require('./apiModel/index.node.js');

function apiFromJson(dataModel, mongoose)
{
    const compiledDataModel = compileDataModel(dataModel);
    const mongooseModel = dataModelToMongoose(compiledDataModel, mongoose);
    const library = createLibraryFromDataModel(mongooseModel);
    const apiModel = compileApiModel(createApiFromDataModel(compiledDataModel));
    return  hydrate(apiModel, library);
};

module.exports = { apiFromJson }
