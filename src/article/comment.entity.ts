import { ArticleEntity } from '@app/article/article.entity';
import { UserEntity } from '@app/user/user.entity';
import {
    BeforeUpdate,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'comments' })
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column()
    body: string;

    @BeforeUpdate()
    updateTimeStamp() {
        this.updatedAt = new Date();
    }

    @ManyToOne(() => UserEntity, (author) => author.comments)
    author: UserEntity;

    @ManyToOne(() => ArticleEntity, (article) => article.comments)
    article: ArticleEntity;
}
