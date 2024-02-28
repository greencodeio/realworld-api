import { UserEntity } from '@app/user/user.entity';
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async getProfile(userId, username): Promise<UserEntity> {
        const currentUser = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['followers'],
        });
        const user = await this.userRepository.findOne({ where: { username } });

        if (!user) throw new NotFoundException('User not found');

        const isFollower = currentUser.followers.some((follower) => {
            if (follower.id === user.id) {
                return true;
            }
        });

        if (isFollower) {
            Object.assign(user, { following: true });
        } else {
            Object.assign(user, { following: false });
        }

        return user;
    }

    async followUser(userId, username) {
        const currentUser = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['followers'],
        });
        const follower = await this.userRepository.findOne({
            where: { username },
        });

        if (currentUser.id === follower.id)
            throw new BadRequestException('Following impossible');

        const isFollowing = currentUser.followers.some(
            (item) => follower.id === item.id,
        );

        if (!isFollowing) {
            currentUser.followers.push(
                Object.assign(follower, { following: true }),
            );

            await this.userRepository.save(currentUser);
        } else {
            throw new BadRequestException('Following impossible');
        }

        return follower;
    }

    async unfollowUser(userId, username) {
        const currentUser = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['followers'],
        });
        const follower = await this.userRepository.findOne({
            where: { username },
        });

        if (currentUser.id === follower.id)
            throw new BadRequestException('Unfollowing impossible');

        const followerIndex = currentUser.followers.findIndex((item) => {
            return item.id === follower.id;
        });

        if (followerIndex >= 0) {
            currentUser.followers.splice(followerIndex, 1);

            await this.userRepository.save(currentUser);

            Object.assign(follower, { following: false });
        } else {
            throw new BadRequestException('Unfollowing impossible');
        }

        return follower;
    }
}
