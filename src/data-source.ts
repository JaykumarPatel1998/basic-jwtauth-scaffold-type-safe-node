import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { RefreshToken } from "./entity/RefreshToken"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "<hostname>",
    port: 5432,
    username: "postgres",
    password: "password",
    database: "dbname",
    synchronize: true,
    logging: false,
    entities: [User, RefreshToken],
    migrations: [],
    subscribers: [],
})
