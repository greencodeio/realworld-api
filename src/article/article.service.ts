import { ArticleEntity } from '@app/article/article.entity';
import { CommentEntity } from '@app/article/comment.entity';
import { CreateArticleDto } from '@app/article/dto/create-article.dto';
import { CreateCommentDto } from '@app/comments/dto/create-comment.dto';
import { UpdateArticleDto } from '@app/article/dto/update-article.dto';
import { UserEntity } from '@app/user/user.entity';
import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, Repository } from 'typeorm';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>,
        private dataSource: DataSource,
    ) {}

    async findAll(userId: number | null, query) {
        const queryBuilder = this.dataSource
            .getRepository(ArticleEntity)
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author');

        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const articlesCount = await queryBuilder.getCount();

        if (query.author) {
            const author = await this.userRepository.findOne({
                where: {
                    username: query.author,
                },
            });

            if (author) {
                queryBuilder.andWhere('articles.authorId = :id', {
                    id: author.id,
                });
            } else {
                queryBuilder.andWhere('1=0');
            }
        }

        if (query.tag) {
            queryBuilder.andWhere('articles.tagList LIKE :tag', {
                tag: `%${query.tag}%`,
            });
        }

        if (query.limit) {
            queryBuilder.limit(query.limit);
        }

        if (query.offset) {
            queryBuilder.offset(query.offset);
        }

        if (query.favorited) {
            const author = await this.userRepository.findOne({
                where: { username: query.favorited },
                relations: ['favorites'],
            });
            const ids = author.favorites.map((item) => item.id);

            if (ids.length) {
                queryBuilder.andWhere('articles.id IN (:...ids)', {
                    ids,
                });
            } else {
                queryBuilder.andWhere('1=0');
            }
        }

        let favoriteArticleIds: number[] = [];

        if (userId) {
            const currentUser = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['favorites'],
            });
            favoriteArticleIds = currentUser.favorites.map((item) => item.id);
        }

        const articles = await queryBuilder.getMany();
        const articlesWithFavorites = articles.map((article) => {
            const favorited = favoriteArticleIds.includes(article.id);

            return { ...JSON.parse(JSON.stringify(article)), favorited };
        });

        return { articles: articlesWithFavorites, articlesCount };
    }

    async getFeed(userId: number, query) {
        const follows = (
            await this.userRepository.findOne({
                where: { id: userId },
                relations: ['followers'],
            })
        ).followers;

        if (!follows.length) {
            return {
                articles: [],
                articleCount: 0,
            };
        }

        const followingUserIds = follows.map((follow) => follow.id);

        const queryBuilder = this.dataSource
            .getRepository(ArticleEntity)
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author')
            .where('articles.authorId IN (:...ids)', { ids: followingUserIds });

        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const articlesCount = await queryBuilder.getCount();

        if (query.limit) {
            queryBuilder.limit(query.limit);
        }

        if (query.offset) {
            queryBuilder.offset(query.offset);
        }

        const articles = await queryBuilder.getMany();

        return { articles, articlesCount };
    }

    async addArticleToFavorite(id: number, slug: string) {
        const article = await this.getArticle(slug);
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['favorites'],
        });

        const isFavorited = user.favorites.some(
            (articleInFavorites) => articleInFavorites.id === article.id,
        );

        if (!isFavorited) {
            user.favorites.push(article);
            article.favoritesCount++;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
    }

    async deleteArticleToFavorite(id: number, slug: string) {
        const article = await this.getArticle(slug);
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['favorites'],
        });

        const articleIndex = user.favorites.findIndex(
            (articleInFavorites) => articleInFavorites.id === article.id,
        );

        if (articleIndex >= 0) {
            user.favorites.splice(articleIndex, 1);
            article.favoritesCount--;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
    }

    async createArticle(
        currentUser: UserEntity,
        createArticleDto: CreateArticleDto,
    ): Promise<ArticleEntity> {
        const article = new ArticleEntity();

        Object.assign(article, createArticleDto);

        article.slug = this.generateSlug(article.title);

        if (!article.tagList) {
            article.tagList = [];
        }

        article.author = currentUser;

        return await this.articleRepository.save(article);
    }

    async getArticle(slug: string): Promise<ArticleEntity> {
        const article = await this.articleRepository.findOne({
            where: { slug },
        });

        if (!article) throw new NotFoundException('Article not found');

        return article;
    }

    async deleteArticle(userId: number, slug: string): Promise<DeleteResult> {
        const article = await this.getArticle(slug);

        if (article.author.id !== userId)
            throw new ForbiddenException('Access denied');

        return await this.articleRepository.delete({ slug });
    }

    async updateArticle(
        userId: number,
        slug: string,
        updateArticleDto: UpdateArticleDto,
    ): Promise<ArticleEntity> {
        const article = await this.getArticle(slug);

        if (article.author.id !== userId)
            throw new ForbiddenException('Access denied');

        Object.assign(article, updateArticleDto);
        article.slug = this.generateSlug(updateArticleDto.title);

        return await this.articleRepository.save(article);
    }

    async createComment(
        userId: number,
        createCommentDto: CreateCommentDto,
        slug: string,
    ): Promise<CommentEntity> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        const article = await this.articleRepository.findOne({
            where: {
                slug,
            },
        });
        const comment = await this.commentRepository.create(createCommentDto);

        comment.article = article;
        comment.author = user;

        return await this.commentRepository.save(comment);
    }

    async getComments(slug: string): Promise<CommentEntity[]> {
        const article = await this.articleRepository.findOne({
            where: { slug },
        });
        const queryBuilder = await this.dataSource
            .getRepository(CommentEntity)
            .createQueryBuilder('comments')
            .leftJoinAndSelect('comments.article', 'article')
            .leftJoinAndSelect('comments.author', 'author')
            .where('comments.article = :id', { id: article.id });

        return [...(await queryBuilder.getMany())] as any;
    }

    async deleteComment(
        userId: number,
        slug: string,
        commentId,
    ): Promise<DeleteResult> {
        if (!userId) {
            throw new UnauthorizedException('User not found');
        }

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: ['author', 'article'],
        });
        const article = await this.articleRepository.findOne({
            where: { slug },
        });

        if (!comment) throw new NotFoundException('Comment not found');
        if (!article) throw new NotFoundException('Article not found');

        if (
            comment.author.id !== user.id &&
            comment.article.slug !== article.slug
        ) {
            throw new ForbiddenException('Access denied');
        }

        return await this.commentRepository.delete({ id: commentId });
    }

    private generateSlug(title) {
        return (
            title
                .split(' ')
                .map((item) => item.toLowerCase())
                .join('-') +
            '-' +
            ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
        );
    }
}
