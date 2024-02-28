import { ProfileResponse } from '@app/profile/profile-response.interceptor';
import { ProfileService } from '@app/profile/profile.service';
import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import {
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';

@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(ProfileResponse)
@Controller('profiles')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get(':username')
    async getProfile(
        @User('id') userId: number,
        @Param('username') username: string,
    ) {
        return await this.profileService.getProfile(userId, username);
    }

    @UseGuards(AuthGuard)
    @Post(':username/follow')
    async followUser(
        @User('id') id: number,
        @Param('username') username: string,
    ): Promise<UserEntity> {
        return await this.profileService.followUser(id, username);
    }

    @UseGuards(AuthGuard)
    @Delete(':username/follow')
    async unfollowUser(
        @User('id') id: number,
        @Param('username') username: string,
    ): Promise<UserEntity> {
        return await this.profileService.unfollowUser(id, username);
    }
}
