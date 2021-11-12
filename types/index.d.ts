/*****************************************
 * Data model
 */
export declare type DataModelDeclaration = {
  [collectionName : string] : Collection
}

export declare type Collection = {
  schema : CollectionSchema;
  options ?: CollectionOptions;
}

export declare type CollectionOptions = {
  [optionName : string] : unknown;
}

export declare type CollectionSchema = {
  [fieldName : string] : Field;
};

export declare type Field =
  BasicFieldTypes |
  ExtendedFieldType |
  [Field] |
  {[subfield : string] : Field};
export declare type BasicFieldTypes = 'String' | 'Number' | 'Boolean' | 'Date' | 'Id';
export declare type ExtendedFieldType = {
  type : BasicFieldTypes,
  required ?: boolean,
  unique ?: boolean,
  default ?: unknown
}

export declare class DataModel {
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

export declare type ApiModelDeclaration = {
  auth ?: Auth;
  handlers ?: HandlersDeclaration;
  filters ?: HandlersDeclaration;
  policies ?: PoliciesDeclaration;
} | NestedApiModelDeclaration;

export declare type NestedApiModelDeclaration = {
  [endpointName : Route]: ApiModelDeclaration;
}

export declare type Route = `/${string}`;

export declare type Auth = {
  [method in Method] : boolean | {requiresAuth ?: boolean, requiresRoles ?: string[]}
};

export declare type HandlersDeclaration = {
  [method in Method] : Handler[]
};

export declare type PoliciesDeclaration = {
  [method in Method] : Policy[]
}

export declare type Method = 'GET' | 'OPTIONS' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'read' | 'write';

export declare type Handler = (data : unknown, flow : HandlerFlow, meta : Meta) => unknown;
export declare type Policy = (flow : PolicyFlow, meta : Meta) => PolicyResult

export declare type HandlerFlow = {
  continue : (data : unknown) => unknown,
  stop  : (status : number, data : unknown) => unknown
}
export declare type PolicyFlow = {
  continue : () => unknown,
  stop  : (status : number, data : unknown) => PolicyResult
}
export declare type PolicyResult = {
  satisfied : boolean,
  reason : unknown
};

export declare type Meta = {
  [key : string] : any
}

export declare class ApiModel {
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

export declare class Server {
  server : unknown;
  constructor(apiModel : ApiModel, env : Environment);
  listen(port : number) : Promise<void>;
  close() : void;
}

export declare type Environment = {
  [varName : string] : unknown;
}


/*****************************************
 * Databases
 */

export declare class Database {
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

export declare type DatabaseOptions = {
  [key : string] : unknown
};

export declare type Record = {
  id ?: Identifier,
  [field : string] : unknown
};

export declare type Identifier = string;

export declare type Query = {
  page ?: number;
  pageSize ?: number;
  sort ?: string;
  order ?: SortOrder;
  cursor ?: string;
  q ?: string;
  f ?: QueryFilter | QueryFilter[];
  [field : string] : unknown;
}

export declare type QueryFilter = `${string};${'gt' | 'ge' | 'lt'| 'le'};${string}`;

export declare type SortOrder = 'ASC' | 'asc' | 'DESC' | 'desc' | 1 | '1' | -1 | '-1';


export declare class Mongo extends Database {}

