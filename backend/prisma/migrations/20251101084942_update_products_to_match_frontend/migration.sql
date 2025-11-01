/*
  Warnings:

  - The primary key for the `categorias` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `marcas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `producto_categoria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `productos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `active` on the `productos` table. All the data in the column will be lost.
  - Made the column `description` on table `productos` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('active', 'inactive', 'discontinued');

-- DropForeignKey
ALTER TABLE "producto_categoria" DROP CONSTRAINT "producto_categoria_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "producto_categoria" DROP CONSTRAINT "producto_categoria_productId_fkey";

-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_brandId_fkey";

-- DropIndex
DROP INDEX "productos_active_idx";

-- AlterTable
ALTER TABLE "categorias" DROP CONSTRAINT "categorias_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "categorias_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "categorias_id_seq";

-- AlterTable
ALTER TABLE "marcas" DROP CONSTRAINT "marcas_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "marcas_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "marcas_id_seq";

-- AlterTable
ALTER TABLE "producto_categoria" DROP CONSTRAINT "producto_categoria_pkey",
ALTER COLUMN "productId" SET DATA TYPE TEXT,
ALTER COLUMN "categoryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "producto_categoria_pkey" PRIMARY KEY ("productId", "categoryId");

-- AlterTable
ALTER TABLE "productos" DROP CONSTRAINT "productos_pkey",
DROP COLUMN "active",
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'active',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "brandId" SET DATA TYPE TEXT,
ADD CONSTRAINT "productos_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "productos_id_seq";

-- CreateIndex
CREATE INDEX "productos_status_idx" ON "productos"("status");

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_categoria" ADD CONSTRAINT "producto_categoria_productId_fkey" FOREIGN KEY ("productId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_categoria" ADD CONSTRAINT "producto_categoria_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
