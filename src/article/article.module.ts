import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '@app/article/article.entity';
import { ArticleController } from '@app/article/article.controller';
import { ArticleService } from '@app/article/article.service';
import { UserEntity } from '@app/user/user.entity';
import { CommentEntity } from '@app/article/comment.entity';

@Module({
    controllers: [ArticleController],
    providers: [ArticleService],
    imports: [
        TypeOrmModule.forFeature([ArticleEntity, UserEntity, CommentEntity]),
    ],
})
export class ArticleModule {}
