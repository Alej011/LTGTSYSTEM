import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
    AuthModule,
    UsersModule,
    ProductsModule,
    BrandsModule,
    CategoriesModule,
  ],
})
export class AppModule {}
