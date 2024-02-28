import { AppModule } from '@app/app.module';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    app.setGlobalPrefix('api');
    const configService = app.get(ConfigService);
    const port = configService.get('PORT');
    await app.listen(port);
}
bootstrap();
