"use server";

import {
  getVariationsByComponent,
  getVariationById,
  createVariation,
  updateVariation,
  deleteVariation,
} from "@/lib/data/codeVariations";
import { prisma } from "@/lib/prisma";
import { Difficulty, Prisma } from "@prisma/client";
import { CodeVariation, DifficultyLevel } from "@/types";

function toCodeVariation(variation: {
  id: string;
  componentId: string;
  title: string;
  description?: string | null;
  difficulty: Difficulty;
  inputCount: number;
  outputCount: number;
  command?: string | null;
  setupSummary?: string | null;
  logicSummary?: string | null;
  sourceCode: string;
  isCustom: boolean;
  files?: Array<{ fileName: string; fileContent: string; isReadOnly: boolean }>;
  explanations?: Array<{ symbol: string; description: string }>;
}): CodeVariation {
  return {
    id: variation.id,
    componentId: variation.componentId,
    title: variation.title,
    description: variation.description || "",
    difficulty: variation.difficulty as DifficultyLevel,
    inputCount: variation.inputCount,
    outputCount: variation.outputCount,
    command: variation.command || "",
    setupSummary: variation.setupSummary || "",
    logicSummary: variation.logicSummary || "",
    codeExplanation: (variation.explanations || []).map((e) => ({
      symbol: e.symbol,
      description: e.description,
    })),
    sourceCode: variation.sourceCode,
    isCustom: variation.isCustom,
    files:
      variation.files && variation.files.length > 0
        ? variation.files.map((f) => ({
            name: f.fileName,
            content: f.fileContent,
            isReadOnly: f.isReadOnly,
          }))
        : [
            {
              name: "sketch.ino",
              content: variation.sourceCode,
            },
          ],
  };
}

export async function fetchAllVariationsAction() {
  try {
    const rawList = await prisma.codeVariation.findMany({
      include: {
        files: { orderBy: { sortOrder: "asc" } },
        explanations: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { id: "asc" },
    });
    return { success: true, data: rawList.map(toCodeVariation) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch variations";
    return { success: false, error: message };
  }
}

export async function fetchVariationsByComponent(componentId: string) {
  try {
    const rawList = await getVariationsByComponent(componentId);
    return { success: true, data: rawList.map(toCodeVariation) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch variations";
    return { success: false, error: message };
  }
}

export async function fetchVariationById(id: string) {
  try {
    const data = await getVariationById(id);
    if (!data) return { success: false, error: "Variation not found" };
    return { success: true, data: toCodeVariation(data) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch variation";
    return { success: false, error: message };
  }
}

export async function saveCodeVariationAction(variation: CodeVariation) {
  return updateCodeVariationAction(variation);
}

export async function updateCodeVariationAction(variation: CodeVariation) {
  try {
    const filesToCreate =
      variation.files && variation.files.length > 0
        ? variation.files.map((f, idx) => ({
            fileName: f.name,
            fileContent: f.content,
            isReadOnly: !!f.isReadOnly,
            sortOrder: idx,
          }))
        : [
            {
              fileName: "sketch.ino",
              fileContent: variation.sourceCode,
              isReadOnly: false,
              sortOrder: 0,
            },
          ];

    const explanationsToCreate = (variation.codeExplanation || []).map((exp, idx) => ({
      symbol: exp.symbol,
      description: exp.description,
      sortOrder: idx,
    }));

    // Update in atomic transaction: upsert parent record then recreate children
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Ensure target componentId exists in DB
      let targetComponentId = variation.componentId;
      const existingComp = await tx.component.findUnique({
        where: { id: targetComponentId },
        select: { id: true },
      });

      if (!existingComp) {
        const fallbackComp = await tx.component.findFirst({ select: { id: true } });
        if (fallbackComp) {
          targetComponentId = fallbackComp.id;
        } else {
          const createdFallback = await tx.component.create({
            data: {
              id: targetComponentId,
              name: targetComponentId,
              category: "input",
              type: "Input Module",
            },
          });
          targetComponentId = createdFallback.id;
        }
      }

      // 2. Upsert parent CodeVariation record
      const parent = await tx.codeVariation.upsert({
        where: { id: variation.id },
        create: {
          id: variation.id,
          componentId: targetComponentId,
          title: variation.title,
          description: variation.description || null,
          difficulty: (variation.difficulty as Difficulty) || Difficulty.Beginner,
          inputCount: variation.inputCount || 1,
          outputCount: variation.outputCount || 1,
          command: variation.command || null,
          setupSummary: variation.setupSummary || null,
          logicSummary: variation.logicSummary || null,
          sourceCode: variation.sourceCode,
          isCustom: variation.isCustom ?? true,
        },
        update: {
          title: variation.title,
          description: variation.description || null,
          difficulty: (variation.difficulty as Difficulty) || Difficulty.Beginner,
          inputCount: variation.inputCount || 1,
          outputCount: variation.outputCount || 1,
          command: variation.command || null,
          setupSummary: variation.setupSummary || null,
          logicSummary: variation.logicSummary || null,
          sourceCode: variation.sourceCode,
        },
      });

      // 3. Clear existing files and explanations
      await tx.codeFile.deleteMany({ where: { variationId: parent.id } });
      await tx.codeExplanation.deleteMany({ where: { variationId: parent.id } });

      // 4. Create current files
      for (const file of filesToCreate) {
        await tx.codeFile.create({
          data: {
            variationId: parent.id,
            fileName: file.fileName,
            fileContent: file.fileContent,
            isReadOnly: file.isReadOnly,
            sortOrder: file.sortOrder,
          },
        });
      }

      // 5. Create current explanations
      for (const exp of explanationsToCreate) {
        await tx.codeExplanation.create({
          data: {
            variationId: parent.id,
            symbol: exp.symbol,
            description: exp.description,
            sortOrder: exp.sortOrder,
          },
        });
      }

      // 6. Return fully populated record with relations
      return tx.codeVariation.findUnique({
        where: { id: parent.id },
        include: {
          files: { orderBy: { sortOrder: "asc" } },
          explanations: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    if (!updated) {
      return { success: false, error: "Gagal menyimpan variasi kode" };
    }

    return {
      success: true,
      data: toCodeVariation(updated),
      message: `Perubahan "${variation.title}" berhasil disimpan ke database.`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui variasi kode di database";
    return { success: false, error: message };
  }
}

export async function deleteCodeVariationAction(id: string) {
  try {
    const deleted = await deleteVariation(id);
    return {
      success: true,
      data: { id: deleted.id, title: deleted.title },
      message: `Kasus "${deleted.title}" berhasil dihapus dari database.`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus variasi kode dari database";
    return { success: false, error: message };
  }
}

export async function createNewVariation(data: Prisma.CodeVariationCreateInput) {
  try {
    return { success: true, data: await createVariation(data) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create variation";
    return { success: false, error: message };
  }
}

export async function updateVariationDetails(id: string, data: Prisma.CodeVariationUpdateInput) {
  try {
    return { success: true, data: await updateVariation(id, data) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update variation";
    return { success: false, error: message };
  }
}

export async function removeVariation(id: string) {
  try {
    return { success: true, data: await deleteVariation(id) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete variation";
    return { success: false, error: message };
  }
}
