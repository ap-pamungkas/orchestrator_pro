import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * Get all files for a code variation, ordered by sortOrder
 */
export async function getFilesByVariation(variationId: string) {
  return prisma.codeFile.findMany({
    where: { variationId },
    orderBy: { sortOrder: "asc" },
  });
}

/**
 * Create a new code file in a variation
 */
export async function createFile(data: Prisma.CodeFileCreateInput) {
  return prisma.codeFile.create({
    data,
  });
}

/**
 * Update a code file content / name
 */
export async function updateFile(id: string, data: Prisma.CodeFileUpdateInput) {
  return prisma.codeFile.update({
    where: { id },
    data,
  });
}

/**
 * Delete a code file
 */
export async function deleteFile(id: string) {
  return prisma.codeFile.delete({
    where: { id },
  });
}
