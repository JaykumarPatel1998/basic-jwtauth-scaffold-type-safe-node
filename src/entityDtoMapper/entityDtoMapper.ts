import { UserDto } from "../dto/response/user.dto";
import { User } from "../entity/User";

export class EntityDtoMapper {
    public static userToDto(user: User) {
        const userDto = new UserDto();
        userDto.id = user.id;
        userDto.username = user.username;
        userDto.email = user.email;
        userDto.age = user.age;

        return userDto;
    }
}