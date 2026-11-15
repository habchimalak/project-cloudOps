-- DropForeignKey
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_serverId_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_environmentId_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_serverId_fkey";

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "environments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "servers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
