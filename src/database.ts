import { Repository } from "typeorm"
import { User } from "./entity/User"
import { AppDataSource } from "./data-source";
import { RefreshToken } from "./entity/RefreshToken";

export class Database {
    public static userRepository: Repository<User>;
    public static refershTokenRepository: Repository<RefreshToken>;

    public static initialize(): void {
        this.userRepository = AppDataSource.getRepository(User);
        this.refershTokenRepository = AppDataSource.getRepository(RefreshToken);
    }
}