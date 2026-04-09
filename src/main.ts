import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://tonsite.com']
        : ['http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Anorake API')
    .setDescription('API de gestion de restaurant Anorake')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentification')
    .addTag('Users', 'Gestion des utilisateurs')
    .addTag('Tenant', 'Gestion des tenants (restaurants)')
    .addTag('Organization', 'Gestion des organisations')
    .addTag('Menu Category', 'Catégories du menu')
    .addTag('Menu Item', 'Articles du menu')
    .addTag('Menu Combo', 'Combos du menu')
    .addTag('Order', 'Gestion des commandes')
    .addTag('Table', 'Gestion des tables')
    .addTag('Reservation', 'Gestion des réservations')
    .addTag('Product', 'Gestion des produits/stock')
    .addTag('Recipe', 'Gestion des recettes')
    .addTag('Stock Entry', 'Entrées de stock')
    .addTag('Inventory', "Ajustements d'inventaire")
    .addTag('Finance', 'Gestion financière')
    .addTag('Settings', 'Paramètres')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
