import { prisma } from "@/lib/prisma";
import { ArchitectureMode, Prisma } from "@prisma/client";

/**
 * Get all architectures, optionally filtered by mode (educator / developer)
 */
export async function getArchitectures(mode?: ArchitectureMode) {
  return prisma.architecture.findMany({
    where: mode ? { mode } : undefined,
    include: {
      slots: {
        include: { component: true },
        orderBy: [{ layer: "asc" }, { slotIndex: "asc" }],
      },
      wires: {
        include: { conditionerComponent: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Get single architecture by ID with full slots and wires hierarchy
 */
export async function getArchitectureById(id: string) {
  return prisma.architecture.findUnique({
    where: { id },
    include: {
      slots: {
        include: { component: true },
        orderBy: [{ layer: "asc" }, { slotIndex: "asc" }],
      },
      wires: {
        include: { conditionerComponent: true },
      },
    },
  });
}

/**
 * Create a new architecture canvas session
 */
export async function createArchitecture(data: Prisma.ArchitectureCreateInput) {
  return prisma.architecture.create({
    data,
    include: {
      slots: { include: { component: true } },
      wires: { include: { conditionerComponent: true } },
    },
  });
}

/**
 * Update an existing architecture
 */
export async function updateArchitecture(id: string, data: Prisma.ArchitectureUpdateInput) {
  return prisma.architecture.update({
    where: { id },
    data,
    include: {
      slots: { include: { component: true } },
      wires: { include: { conditionerComponent: true } },
    },
  });
}

/**
 * Delete an architecture (cascades to slots and wires)
 */
export async function deleteArchitecture(id: string) {
  return prisma.architecture.delete({
    where: { id },
  });
}
