import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Get all syntax/symbol explanations for a variation, ordered by sortOrder
 */
export async function getExplanationsByVariation(variationId: string) {
  return prisma.codeExplanation.findMany({
    where: { variationId },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Create a new explanation entry
 */
export async function createExplanation(data: Prisma.CodeExplanationCreateInput) {
  return prisma.codeExplanation.create({
    data,
  });
}

/**
 * Update an explanation entry
 */
export async function updateExplanation(
  id: string,
  data: Prisma.CodeExplanationUpdateInput
) {
  return prisma.codeExplanation.update({
    where: { id },
    data,
  });
}

/**
 * Delete an explanation entry
 */
export async function deleteExplanation(id: string) {
  return prisma.codeExplanation.delete({
    where: { id },
  });
}
