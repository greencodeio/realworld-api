import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { UserResponse } from '@app/user/user-response.interceptor';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
    controllers: [UserController],
    providers: [UserService, UserResponse, AuthGuard],
    imports: [TypeOrmModule.forFeature([UserEntity]), ConfigModule],
    exports: [UserService],
})
export class UserModule {}
