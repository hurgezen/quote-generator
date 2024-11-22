/*
  Warnings:

  - A unique constraint covering the columns `[customerId,email]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contact_customerId_email_key" ON "Contact"("customerId", "email");
