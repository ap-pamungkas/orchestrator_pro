import { prisma } from "@/lib/prisma";
import { WireCategory } from "@prisma/client";

export interface CreateWireParams {
  architectureId: string;
  fromCategory: WireCategory;
  fromSlot: number;
  toCategory: WireCategory;
  toSlot: number;
  conditionerComponentId?: string | null;
}

/**
 * Get all wire connections for an architecture
 */
export async function getWiresByArchitecture(architectureId: string) {
  return prisma.wireConnection.findMany({
    where: { architectureId },
    include: { conditionerComponent: true },
    orderBy: { id: "asc" },
  });
}

/**
 * Create a new wire connection between slots with routing rule validation
 */
export async function createWire({
  architectureId,
  fromCategory,
  fromSlot,
  toCategory,
  toSlot,
  conditionerComponentId,
}: CreateWireParams) {
  // Validate slot bounds
  if (fromSlot < 0 || fromSlot > 2 || toSlot < 0 || toSlot > 2) {
    throw new Error("Invalid wire slot index. Slot numbers must be 0, 1, or 2.");
  }

  // Enforce pipeline routing rules: input -> board, board -> output
  if (fromCategory === "input" && toCategory !== "board") {
    throw new Error(
      "Invalid wire connection: Input category must connect to Board, not directly to Output."
    );
  }

  if (fromCategory === "board" && toCategory !== "output") {
    throw new Error(
      "Invalid wire connection: Board category must connect to Output."
    );
  }

  // If conditioner is provided, check if it's a valid conditioner component
  if (conditionerComponentId) {
    const conditioner = await prisma.component.findUnique({
      where: { id: conditionerComponentId },
      select: { id: true, category: true, name: true },
    });

    if (!conditioner) {
      throw new Error(`Conditioner component '${conditionerComponentId}' not found.`);
    }

    if (conditioner.category !== "conditioner") {
      throw new Error(
        `Component '${conditioner.name}' is of category '${conditioner.category}', expected 'conditioner'.`
      );
    }
  }

  return prisma.wireConnection.create({
    data: {
      architectureId,
      fromCategory,
      fromSlot,
      toCategory,
      toSlot,
      conditionerComponentId: conditionerComponentId ?? null,
    },
    include: {
      conditionerComponent: true,
    },
  });
}

/**
 * Update inline conditioner on an existing wire connection
 */
export async function updateWireConditioner(
  id: string,
  conditionerComponentId: string | null
) {
  if (conditionerComponentId) {
    const conditioner = await prisma.component.findUnique({
      where: { id: conditionerComponentId },
      select: { id: true, category: true, name: true },
    });

    if (!conditioner || conditioner.category !== "conditioner") {
      throw new Error(
        `Invalid conditioner component: '${conditionerComponentId}' must be in the 'conditioner' category.`
      );
    }
  }

  return prisma.wireConnection.update({
    where: { id },
    data: {
      conditionerComponentId: conditionerComponentId ?? null,
    },
    include: {
      conditionerComponent: true,
    },
  });
}

/**
 * Delete a wire connection by ID
 */
export async function deleteWire(id: string) {
  return prisma.wireConnection.delete({
    where: { id },
  });
}
