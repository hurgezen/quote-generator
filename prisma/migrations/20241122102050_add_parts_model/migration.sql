/*
  Warnings:

  - A unique constraint covering the columns `[quoteNumber]` on the table `Quote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currency` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryPlace` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryTerms` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTerms` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preTaxTotal` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quoteNumber` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingHandling` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxRate` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalTax` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatIncluded` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warrantyTerms` to the `Quote` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Quote` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'MODIFIED');

-- DropIndex
DROP INDEX "Customer_shorthand_key";

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "deliveryPlace" TEXT NOT NULL,
ADD COLUMN     "deliveryTerms" TEXT NOT NULL,
ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentTerms" TEXT NOT NULL,
ADD COLUMN     "preTaxTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "preparedBy" TEXT,
ADD COLUMN     "quoteNumber" TEXT NOT NULL,
ADD COLUMN     "shippingHandling" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "taxRate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalTax" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "validUntil" TIMESTAMP(3),
ADD COLUMN     "vatIncluded" BOOLEAN NOT NULL,
ADD COLUMN     "warrantyTerms" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "QuoteStatus" NOT NULL;

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "estimatedDelivery" TIMESTAMP(3) NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "dealerPrice" DOUBLE PRECISION NOT NULL,
    "listPrice" DOUBLE PRECISION NOT NULL,
    "hsCode" TEXT,

    CONSTRAINT "LineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tax" (
    "id" TEXT NOT NULL,
    "lineItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Tax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "vat" DOUBLE PRECISION NOT NULL,
    "bankInformation" TEXT NOT NULL,
    "termsAndLiability" TEXT NOT NULL,

    CONSTRAINT "CompanyInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceList" (
    "id" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dealerPrice" DOUBLE PRECISION NOT NULL,
    "listPrice" DOUBLE PRECISION NOT NULL,
    "hsCode" TEXT NOT NULL,

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "category" TEXT,
    "manufacturer" TEXT,
    "attributes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSVMapping" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mapping" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CSVMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PriceList_partNumber_key" ON "PriceList"("partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Part_partNumber_key" ON "Part"("partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CSVMapping_name_key" ON "CSVMapping"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteNumber_key" ON "Quote"("quoteNumber");

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tax" ADD CONSTRAINT "Tax_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "LineItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
