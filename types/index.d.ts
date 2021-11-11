/*****************************************
 * Data model
 */
export type DataModelDeclaration = {
  [collectionName : string] : Collection
}

export type Collection = {
  schema : CollectionSchema;
  options ?: CollectionOptions;
}

export type CollectionOptions = {
  [optionName : string] : unknown;
}

export type CollectionSchema = {
  [fieldName : string] : Field;
};

export type Field =
  BasicFieldTypes |
  ExtendedFieldType |
  [Field] |
  {[subfield : string] : Field};
export type BasicFieldTypes = 'String' | 'Number' | 'Boolean' | 'Date' | 'Id';
export type ExtendedFieldType = {
  type : BasicFieldTypes,
  required ?: boolean,
  unique ?: boolean,
  default ?: unknown
}

export class DataModel {
  constructor(...dataModels : DataModel[] | DataModelDeclaration[]);
  get() : DataModelDeclaration;
  addModel(...dataModels : DataModel[] | DataModelDeclaration[]);
  addCollection(collection : string, definition : Collection) : DataModel;
  addField(collection : string, field : string, definition : Field) : DataModel;
  removeCollection(collection : string) : DataModel;
  removeField(collection : string, field : string) : DataModel;
  setOptions(collection : string, options : CollectionOptions) : DataModel;
  setType(collection : string, field : string, type : Field) : DataModel;
  setRequired(collection : string, field : string, value : boolean) : DataModel;
  setUnique(collection : string, field : string, value : boolean) : DataModel;
  toApi(options ?: {realTime ?: boolean}) : ApiModel;
}


/*****************************************
 * Api model
 */

export type ApiModelDeclaration = {
  auth ?: Auth;
  handlers ?: HandlersDeclaration;
  filters ?: HandlersDeclaration;
  policies ?: PoliciesDeclaration;
} | NestedApiModelDeclaration;

export type NestedApiModelDeclaration = {
  [endpointName : Route]: ApiModelDeclaration;
}

export type Route = `/${string}`;

export type Auth = {
  [method in Method] : boolean | {requiresAuth ?: boolean, requiresRoles ?: string[]}
};

export type HandlersDeclaration = {
  [method in Method] : Handler[]
};

export type PoliciesDeclaration = {
  [method in Method] : Policy[]
}

export type Method = 'GET' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'read' | 'write';

export type Handler = (data : unknown, flow : HandlerFlow, meta : Meta) => unknown;
export type Policy = (flow : PolicyFlow, meta : Meta) => PolicyResult

export type HandlerFlow = {
  continue : (data : unknown) => unknown,
  stop  : (status : number, data : unknown) => unknown
}
export type PolicyFlow = {
  continue : () => unknown,
  stop  : (status : number, data : unknown) => PolicyResult
}
export type PolicyResult = {
  satisfied : boolean,
  reason : unknown
};

export type Meta = {
  [key : string] : any
}

export class ApiModel {
  constructor(...apiModels : ApiModel[] | ApiModelDeclaration[]);
  get() : ApiModelDeclaration;
  addModel(...apiModels : ApiModel[] | ApiModelDeclaration[]) : ApiModel;
  addRoute(route : string, definition : ApiModelDeclaration) : ApiModel;
  removeRoute(route : string) : ApiModel;
  addHandler(route : string, method : Method, handler : Handler) : ApiModel;
  addFilter(route : string, method : Method, filter : Handler) : ApiModel;
  setAuth(route: string, auth : Auth)
  addPolicies(route : string, policies : Policy | Policy[]) : ApiModel;
  toServer(env : Environment) : Server;
}


/*****************************************
 * Server
 */

export class Server {
  server : unknown;
  constructor(apiModel : ApiModel, env : Environment);
  listen(port : number) : Promise<void>;
  close() : void;
}

export type Environment = {
  [varName : string] : unknown;
}


/*****************************************
 * Databases
 */

export class Database {
  database : any;

  constructor(url : string, options ?: DatabaseOptions);
  connect() : Promise<Database>;
  init(dataModel : DataModel) : Promise<void>;
  // getModel(collection : string) : Promise<Collection>;

  create(collection : string, data : Record) : Promise<Record>;
  remove(collection : string, id : Identifier) : Promise<Record | null>;
  readOne(collection : string, id : Identifier) : Promise<Record | null>;
  readMany(collection : string, query : Query) : Promise<{documents : Record[], count : number, cursor : string}>;
  update(collection : string, id : Identifier, data : Record) : Promise<Record>;
  patch(collection : string, id : Identifier, data : Record) : Promise<Record | null>;
  observe() : Promise<Database>;
}

export type DatabaseOptions = {
  [key : string] : unknown
};

export type Record = {
  id ?: Identifier,
  [field : string] : unknown
};

export type Identifier = string;

export type Query = {
  page ?: number;
  pageSize ?: number;
  sort ?: string;
  order ?: SortOrder;
  cursor ?: string;
  q ?: string;
  f ?: QueryFilter | QueryFilter[];
  [field : string] : unknown;
}

export type QueryFilter = `${string};${'gt' | 'ge' | 'lt'| 'le'};${string}`;

export type SortOrder = 'ASC' | 'asc' | 'DESC' | 'desc' | 1 | '1' | -1 | '-1';


export class Mongo extends Database {}

