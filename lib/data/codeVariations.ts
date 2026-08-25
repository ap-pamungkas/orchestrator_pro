import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Get all code variations for a component with basic info
 */
export async function getVariationsByComponent(componentId: string) {
  return prisma.codeVariation.findMany({
    where: { componentId },
    include: {
      files: { orderBy: { sortOrder: "asc" } },
      explanations: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { id: "asc" },
  });
}

/**
 * Get a single code variation by ID with nested files & explanations
 */
export async function getVariationById(id: string) {
  return prisma.codeVariation.findUnique({
    where: { id },
    include: {
      component: true,
      files: { orderBy: { sortOrder: "asc" } },
      explanations: { orderBy: { sortOrder: "asc" } },
    },
  });
}

/**
 * Create a new code variation
 */
export async function createVariation(data: Prisma.CodeVariationCreateInput) {
  return prisma.codeVariation.create({
    data,
    include: {
      files: { orderBy: { sortOrder: "asc" } },
      explanations: { orderBy: { sortOrder: "asc" } },
    },
  });
}

/**
 * Update an existing code variation
 */
export async function updateVariation(
  id: string,
  data: Prisma.CodeVariationUpdateInput
) {
  return prisma.codeVariation.update({
    where: { id },
    data,
    include: {
      files: { orderBy: { sortOrder: "asc" } },
      explanations: { orderBy: { sortOrder: "asc" } },
    },
  });
}

/**
 * Delete a code variation (cascades to files and explanations)
 */
export async function deleteVariation(id: string) {
  return prisma.codeVariation.delete({
    where: { id },
  });
}
