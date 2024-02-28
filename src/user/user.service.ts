import { CreateUserDto } from '@app/user/dto/create-user.dto';
import { UserEntity } from '@app/user/user.entity';
import {
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginUserDto } from '@app/user/dto/login-user.dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from '@app/user/dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (userByEmail) {
            throw new HttpException(
                'This email already used',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const userByUsername = await this.userRepository.findOne({
            where: { username: createUserDto.username },
        });

        if (userByUsername) {
            throw new HttpException(
                'This username already used',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);
        return await this.userRepository.save(newUser);
    }

    async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: {
                email: loginUserDto.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException(
                'User not found please check your email',
            );
        }

        const isPasswordMatch = await compare(
            loginUserDto.password,
            user.password,
        );

        if (!isPasswordMatch) {
            throw new UnauthorizedException(
                'Password incorect, please check it',
            );
        }

        return user;
    }

    async getUserById(id: number): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { id } });

        return user;
    }

    async updateUser(userId: number, updateUserDto: UpdateUserDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        Object.assign(user, updateUserDto);

        return await this.userRepository.save(user);
    }
}
