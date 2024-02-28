export default () => ({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbEntitiesPath: process.env.DB_ENTITIES_PATH,
    dbMigrationPath: process.env.DB_MIGRATIONS_PATH,
});
