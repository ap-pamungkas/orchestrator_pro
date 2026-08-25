-- CreateEnum
CREATE TYPE "ComponentCategory" AS ENUM ('input', 'board', 'output', 'conditioner');

-- CreateEnum
CREATE TYPE "ArchitectureMode" AS ENUM ('educator', 'developer');

-- CreateEnum
CREATE TYPE "SlotLayer" AS ENUM ('input', 'board', 'output');

-- CreateEnum
CREATE TYPE "WireCategory" AS ENUM ('input', 'board', 'output');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- CreateTable
CREATE TABLE "components" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ComponentCategory" NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "pin_info" TEXT,
    "default_gpio" TEXT,
    "status_badge" TEXT,
    "required_conditioner_id" TEXT,
    "required_conditioner_name" TEXT,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "component_pins" (
    "id" TEXT NOT NULL,
    "component_id" TEXT NOT NULL,
    "pin_label" TEXT NOT NULL,
    "pin_type" TEXT NOT NULL,
    "default_gpio_num" TEXT,

    CONSTRAINT "component_pins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "architectures" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mode" "ArchitectureMode" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "architectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "architecture_slots" (
    "id" TEXT NOT NULL,
    "architecture_id" TEXT NOT NULL,
    "layer" "SlotLayer" NOT NULL,
    "slot_index" INTEGER NOT NULL,
    "component_id" TEXT,

    CONSTRAINT "architecture_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wire_connections" (
    "id" TEXT NOT NULL,
    "architecture_id" TEXT NOT NULL,
    "from_category" "WireCategory" NOT NULL,
    "from_slot" INTEGER NOT NULL,
    "to_category" "WireCategory" NOT NULL,
    "to_slot" INTEGER NOT NULL,
    "conditioner_component_id" TEXT,

    CONSTRAINT "wire_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_variations" (
    "id" TEXT NOT NULL,
    "component_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "Difficulty" NOT NULL,
    "input_count" INTEGER NOT NULL,
    "output_count" INTEGER NOT NULL,
    "command" TEXT,
    "setup_summary" TEXT,
    "logic_summary" TEXT,
    "source_code" TEXT NOT NULL,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "code_variations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_files" (
    "id" TEXT NOT NULL,
    "variation_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_content" TEXT NOT NULL,
    "is_read_only" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "code_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_explanations" (
    "id" TEXT NOT NULL,
    "variation_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "code_explanations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "architecture_slots_architecture_id_layer_slot_index_key" ON "architecture_slots"("architecture_id", "layer", "slot_index");

-- AddForeignKey
ALTER TABLE "components" ADD CONSTRAINT "components_required_conditioner_id_fkey" FOREIGN KEY ("required_conditioner_id") REFERENCES "components"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "component_pins" ADD CONSTRAINT "component_pins_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "architecture_slots" ADD CONSTRAINT "architecture_slots_architecture_id_fkey" FOREIGN KEY ("architecture_id") REFERENCES "architectures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "architecture_slots" ADD CONSTRAINT "architecture_slots_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "components"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wire_connections" ADD CONSTRAINT "wire_connections_architecture_id_fkey" FOREIGN KEY ("architecture_id") REFERENCES "architectures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wire_connections" ADD CONSTRAINT "wire_connections_conditioner_component_id_fkey" FOREIGN KEY ("conditioner_component_id") REFERENCES "components"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_variations" ADD CONSTRAINT "code_variations_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_files" ADD CONSTRAINT "code_files_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "code_variations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_explanations" ADD CONSTRAINT "code_explanations_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "code_variations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
