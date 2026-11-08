-- Unifica todas las tablas en inglés snake_case plural, agrega comentarios
-- a los tickets y la fecha de cierre. Usa RENAME para no perder datos.

-- users (antes "User")
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";
ALTER INDEX "User_email_key" RENAME TO "users_email_key";

-- tickets (antes "Ticket")
ALTER TABLE "Ticket" RENAME TO "tickets";
ALTER TABLE "tickets" RENAME CONSTRAINT "Ticket_pkey" TO "tickets_pkey";
ALTER TABLE "tickets" RENAME CONSTRAINT "Ticket_createdById_fkey" TO "tickets_createdById_fkey";
ALTER TABLE "tickets" RENAME CONSTRAINT "Ticket_assigneeId_fkey" TO "tickets_assigneeId_fkey";
ALTER TABLE "tickets" ADD COLUMN "closedAt" TIMESTAMP(3);
CREATE INDEX "tickets_status_idx" ON "tickets"("status");
CREATE INDEX "tickets_createdById_idx" ON "tickets"("createdById");
CREATE INDEX "tickets_assigneeId_idx" ON "tickets"("assigneeId");

-- knowledge_articles (antes "Knowledge")
ALTER TABLE "Knowledge" RENAME TO "knowledge_articles";
ALTER TABLE "knowledge_articles" RENAME CONSTRAINT "Knowledge_pkey" TO "knowledge_articles_pkey";

-- brands (antes "marcas")
ALTER TABLE "marcas" RENAME TO "brands";
ALTER TABLE "brands" RENAME CONSTRAINT "marcas_pkey" TO "brands_pkey";
ALTER INDEX "marcas_name_key" RENAME TO "brands_name_key";

-- categories (antes "categorias")
ALTER TABLE "categorias" RENAME TO "categories";
ALTER TABLE "categories" RENAME CONSTRAINT "categorias_pkey" TO "categories_pkey";
ALTER INDEX "categorias_name_key" RENAME TO "categories_name_key";

-- products (antes "productos")
ALTER TABLE "productos" RENAME TO "products";
ALTER TABLE "products" RENAME CONSTRAINT "productos_pkey" TO "products_pkey";
ALTER TABLE "products" RENAME CONSTRAINT "productos_brandId_fkey" TO "products_brandId_fkey";
ALTER INDEX "productos_sku_key" RENAME TO "products_sku_key";
ALTER INDEX "productos_sku_idx" RENAME TO "products_sku_idx";
ALTER INDEX "productos_brandId_idx" RENAME TO "products_brandId_idx";
ALTER INDEX "productos_status_idx" RENAME TO "products_status_idx";
ALTER INDEX "productos_name_idx" RENAME TO "products_name_idx";

-- product_categories (antes "producto_categoria")
ALTER TABLE "producto_categoria" RENAME TO "product_categories";
ALTER TABLE "product_categories" RENAME CONSTRAINT "producto_categoria_pkey" TO "product_categories_pkey";
ALTER TABLE "product_categories" RENAME CONSTRAINT "producto_categoria_productId_fkey" TO "product_categories_productId_fkey";
ALTER TABLE "product_categories" RENAME CONSTRAINT "producto_categoria_categoryId_fkey" TO "product_categories_categoryId_fkey";

-- comments (nueva)
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "comments_ticketId_idx" ON "comments"("ticketId");
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");
CREATE INDEX "comments_ticketId_createdAt_idx" ON "comments"("ticketId", "createdAt");
ALTER TABLE "comments" ADD CONSTRAINT "comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
