import { User } from "../../entity/User";
import { UserDto } from "./user.dto";

export class AuthenticationDto {
    token: string;
    refreshToken: string;
    user: UserDto;
}