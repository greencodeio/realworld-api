import { User } from '@app/user/decorators/user.decorator';
import { CreateUserDto } from '@app/user/dto/create-user.dto';
import { LoginUserDto } from '@app/user/dto/login-user.dto';
import { UpdateUserDto } from '@app/user/dto/update-user.dto';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserResponse } from '@app/user/user-response.interceptor';
import { UserEntity } from '@app/user/user.entity';
import { UserService } from '@app/user/user.service';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Patch,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';

@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(UserResponse)
@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('users')
    async createUser(
        @Body('user') createUserDto: CreateUserDto,
    ): Promise<UserEntity> {
        return await this.userService.createUser(createUserDto);
    }

    @Post('users/login')
    async loginUser(
        @Body('user') loginUserDto: LoginUserDto,
    ): Promise<UserEntity> {
        return await this.userService.loginUser(loginUserDto);
    }

    @Get('user')
    @UseGuards(AuthGuard)
    async getCurrentUser(@User() user: UserEntity) {
        return await user;
    }

    @Patch('user')
    @UseGuards(AuthGuard)
    async updateUser(
        @User('id') userId: number,
        @Body('user') updateUserDto: UpdateUserDto,
    ) {
        return await this.userService.updateUser(userId, updateUserDto);
    }
}
