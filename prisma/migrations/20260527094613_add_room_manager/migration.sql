-- AlterTable
ALTER TABLE "inspections" ADD COLUMN     "room_manager_id" INTEGER;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_room_manager_id_fkey" FOREIGN KEY ("room_manager_id") REFERENCES "Maneger"("id") ON DELETE SET NULL ON UPDATE CASCADE;
