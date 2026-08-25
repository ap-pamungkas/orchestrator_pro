import { prisma } from "@/lib/prisma";
import { ComponentCategory, Prisma } from "@prisma/client";

/**
 * Get all components, with optional category filtering
 */
export async function getComponents(category?: ComponentCategory) {
  return prisma.component.findMany({
    where: category ? { category } : undefined,
    include: {
      requiredConditioner: true,
      pins: true,
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Get single component by ID with relations
 */
export async function getComponentById(id: string) {
  return prisma.component.findUnique({
    where: { id },
    include: {
      pins: true,
      requiredConditioner: true,
      codeVariations: {
        include: {
          files: { orderBy: { sortOrder: "asc" } },
          explanations: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
}

/**
 * Create a new component
 */
export async function createComponent(data: Prisma.ComponentCreateInput) {
  return prisma.component.create({
    data,
    include: {
      requiredConditioner: true,
      pins: true,
    },
  });
}

/**
 * Update an existing component
 */
export async function updateComponent(id: string, data: Prisma.ComponentUpdateInput) {
  return prisma.component.update({
    where: { id },
    data,
    include: {
      requiredConditioner: true,
      pins: true,
    },
  });
}

/**
 * Delete a component with integrity guards
 */
export async function deleteComponent(id: string) {
  // Guard 1: Check if required as conditioner by other components
  const dependents = await prisma.component.findMany({
    where: { requiredConditionerId: id },
    select: { id: true, name: true },
  });

  if (dependents.length > 0) {
    const names = dependents.map((d: { name: string }) => d.name).join(", ");
    throw new Error(
      `Cannot delete component '${id}' because it is required as a conditioner by: ${names}`
    );
  }

  // Guard 2: Check if used as conditioner in active wire connections
  const activeWires = await prisma.wireConnection.count({
    where: { conditionerComponentId: id },
  });

  if (activeWires > 0) {
    throw new Error(
      `Cannot delete component '${id}' because it is currently assigned as a conditioner on ${activeWires} wire connection(s).`
    );
  }

  return prisma.component.delete({
    where: { id },
  });
}
