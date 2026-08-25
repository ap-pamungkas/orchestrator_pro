import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Get all pins for a specific component
 */
export async function getPinsByComponent(componentId: string) {
  return prisma.componentPin.findMany({
    where: { componentId },
    orderBy: { pinLabel: "asc" },
  });
}

/**
 * Create a new pin definition for a component
 */
export async function createPin(data: Prisma.ComponentPinCreateInput) {
  return prisma.componentPin.create({
    data,
  });
}

/**
 * Update a component pin
 */
export async function updatePin(id: string, data: Prisma.ComponentPinUpdateInput) {
  return prisma.componentPin.update({
    where: { id },
    data,
  });
}

/**
 * Delete a component pin
 */
export async function deletePin(id: string) {
  return prisma.componentPin.delete({
    where: { id },
  });
}
