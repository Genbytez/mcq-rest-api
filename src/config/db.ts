import { DataSource } from "typeorm";
import AppProperties from "./appProperties";

const isProd = AppProperties.production === true;
const entitiesPath = isProd ? "dist/entities/*.js" : "src/entities/*.ts";

// Decide which DB config to use
let dbConfig: any = null;

switch (AppProperties.DB_TYPE) {
  case "postgres":
    dbConfig = {
      type: "postgres",
      host: AppProperties.POSTGRES.HOST,
      port: AppProperties.POSTGRES.PORT,
      username: AppProperties.POSTGRES.USER,
      password: AppProperties.POSTGRES.PASSWORD,
      database: AppProperties.POSTGRES.DATABASE,
    };
    break;

  case "mysql":
    dbConfig = {
      type: "mysql",
      host: AppProperties.MYSQL.HOST,
      port: AppProperties.MYSQL.PORT,
      username: AppProperties.MYSQL.USER,
      password: AppProperties.MYSQL.PASSWORD,
      database: AppProperties.MYSQL.DATABASE,
    };
    break;

  case "mssql":
    dbConfig = {
      type: "mssql",
      host: AppProperties.MSSQL.HOST,
      port: AppProperties.MSSQL.PORT,
      username: AppProperties.MSSQL.USER,
      password: AppProperties.MSSQL.PASSWORD,
      database: AppProperties.MSSQL.DATABASE,
    };
    break;

  default:
    throw new Error(`Unsupported DB_TYPE: ${AppProperties.DB_TYPE}`);
}

export const AppDataSource = new DataSource({
  ...dbConfig,
  synchronize: true,
logging: true,
logger: "advanced-console",
  entities: [entitiesPath],
});
