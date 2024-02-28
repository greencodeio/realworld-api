import { ArticleEntity } from '@app/article/article.entity';

export interface IArticle {
    articles: ArticleEntity[] & { favorited: boolean };
}
