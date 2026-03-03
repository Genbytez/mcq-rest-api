"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppProperties = {
    // Server
    PORT: 4002,
    production: false,
    JWT_SECRET: "F8b9!xPq7$wZ3vR2mL1sT0kUeQ",
    DB_TYPE: "postgres",
    PWD: "Admin@1234",
    URL: "https://rooms.finetrends.com",
    // PostgreSQL
    POSTGRES: {
        HOST: "localhost",
        PORT: 5432,
        USER: "postgres",
        PASSWORD: "admin@123",
        DATABASE: "mcq",
    },
    // MySQL
    MYSQL: {
        HOST: "server-mysql-1",
        PORT: 3306,
        USER: "root",
        PASSWORD: "Root@2025",
        DATABASE: "rooms",
    },
    // MSSQL
    MSSQL: {
        HOST: "localhost",
        PORT: 1433,
        USER: "sa",
        PASSWORD: "mssql_pass",
        DATABASE: "my_mssql_db",
    },
};
exports.default = AppProperties;
