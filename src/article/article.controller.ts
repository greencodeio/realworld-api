import { ArticleResponseInterceptor } from '@app/article/article-response.interceptor';
import { ArticleEntity } from '@app/article/article.entity';
import { ArticleService } from '@app/article/article.service';
import { CreateArticleDto } from '@app/article/dto/create-article.dto';
import { CreateCommentDto } from '@app/comments/dto/create-comment.dto';
import { UpdateArticleDto } from '@app/article/dto/update-article.dto';
import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { CommentResponseInterceptor } from '@app/article/comment-response.interceptor';
import { CommentEntity } from '@app/article/comment.entity';

@UsePipes(new ValidationPipe())
@UseInterceptors(ClassSerializerInterceptor)
@Controller('articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Get()
    async findAll(@User('id') userId: number | null, @Query() query) {
        return await this.articleService.findAll(userId, query);
    }

    @Get('feed')
    @UseGuards(AuthGuard)
    async getFeed(@User('id') userId: number, @Query() query) {
        return await this.articleService.getFeed(userId, query);
    }

    @Post(':slug/favorite')
    @UseGuards(AuthGuard)
    @UseInterceptors(ArticleResponseInterceptor)
    async addArticleToFavorite(
        @User('id') id: number,
        @Param('slug') slug: string,
    ): Promise<ArticleEntity> {
        return await this.articleService.addArticleToFavorite(id, slug);
    }

    @Delete(':slug/favorite')
    @UseGuards(AuthGuard)
    @UseInterceptors(ArticleResponseInterceptor)
    async deleteArticleFromFavorite(
        @User('id') id: number,
        @Param('slug') slug: string,
    ): Promise<ArticleEntity> {
        return await this.articleService.deleteArticleToFavorite(id, slug);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UseInterceptors(ArticleResponseInterceptor)
    async createArticle(
        @User() currentUser: UserEntity,
        @Body('article') createArticleDto: CreateArticleDto,
    ): Promise<ArticleEntity> {
        return await this.articleService.createArticle(
            currentUser,
            createArticleDto,
        );
    }

    @Get(':slug')
    @UseInterceptors(ArticleResponseInterceptor)
    async getArticle(@Param('slug') slug: string): Promise<ArticleEntity> {
        return await this.articleService.getArticle(slug);
    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticle(
        @User('id') userId: number,
        @Param('slug') slug: string,
    ): Promise<DeleteResult> {
        return await this.articleService.deleteArticle(userId, slug);
    }

    @Put(':slug')
    @UseGuards(AuthGuard)
    @UseInterceptors(ArticleResponseInterceptor)
    async updateArticle(
        @User('id') userId: number,
        @Param('slug') slug: string,
        @Body('article') updateArticleDto: UpdateArticleDto,
    ): Promise<ArticleEntity> {
        return await this.articleService.updateArticle(
            userId,
            slug,
            updateArticleDto,
        );
    }

    @Post(':slug/comments')
    @UseGuards(AuthGuard)
    @UseInterceptors(CommentResponseInterceptor)
    async createComment(
        @User('id') userId: number,
        @Body('comment') createCommentDto: CreateCommentDto,
        @Param('slug') slug: string,
    ) {
        return await this.articleService.createComment(
            userId,
            createCommentDto,
            slug,
        );
    }

    @Get(':slug/comments')
    @UseInterceptors(CommentResponseInterceptor)
    async getComments(@Param('slug') slug: string): Promise<CommentEntity[]> {
        return await this.articleService.getComments(slug);
    }

    @Delete(':slug/comments/:id')
    @UseGuards(AuthGuard)
    async deleteComment(
        @User('id') userId: number,
        @Param('slug') slug: string,
        @Param('id') commentId: number,
    ): Promise<DeleteResult> {
        return await this.articleService.deleteComment(userId, slug, commentId);
    }
}
