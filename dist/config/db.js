"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const appProperties_1 = __importDefault(require("./appProperties"));
const isProd = appProperties_1.default.production === true;
const entitiesPath = isProd ? "dist/entities/*.js" : "src/entities/*.ts";
// Decide which DB config to use
let dbConfig = null;
switch (appProperties_1.default.DB_TYPE) {
    case "postgres":
        dbConfig = {
            type: "postgres",
            host: appProperties_1.default.POSTGRES.HOST,
            port: appProperties_1.default.POSTGRES.PORT,
            username: appProperties_1.default.POSTGRES.USER,
            password: appProperties_1.default.POSTGRES.PASSWORD,
            database: appProperties_1.default.POSTGRES.DATABASE,
        };
        break;
    case "mysql":
        dbConfig = {
            type: "mysql",
            host: appProperties_1.default.MYSQL.HOST,
            port: appProperties_1.default.MYSQL.PORT,
            username: appProperties_1.default.MYSQL.USER,
            password: appProperties_1.default.MYSQL.PASSWORD,
            database: appProperties_1.default.MYSQL.DATABASE,
        };
        break;
    case "mssql":
        dbConfig = {
            type: "mssql",
            host: appProperties_1.default.MSSQL.HOST,
            port: appProperties_1.default.MSSQL.PORT,
            username: appProperties_1.default.MSSQL.USER,
            password: appProperties_1.default.MSSQL.PASSWORD,
            database: appProperties_1.default.MSSQL.DATABASE,
        };
        break;
    default:
        throw new Error(`Unsupported DB_TYPE: ${appProperties_1.default.DB_TYPE}`);
}
exports.AppDataSource = new typeorm_1.DataSource({
    ...dbConfig,
    synchronize: true,
    logging: true,
    logger: "advanced-console",
    entities: [entitiesPath],
});
