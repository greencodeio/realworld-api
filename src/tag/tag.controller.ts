import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { TagService } from '@app/tag/tag.service';
import { TagEntity } from '@app/tag/tag.entity';
import { TagNameInterceptor } from '@app/tag/tag.interceptor';

@Controller('tags')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Get()
    @UseInterceptors(TagNameInterceptor)
    async findAll(): Promise<TagEntity[]> {
        return await this.tagService.findAll();
    }
}
