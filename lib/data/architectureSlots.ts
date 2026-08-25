import { prisma } from "@/lib/prisma";
import { SlotLayer } from "@prisma/client";

export interface UpsertSlotParams {
  architectureId: string;
  layer: SlotLayer;
  slotIndex: number;
  componentId?: string | null;
}

/**
 * Upsert component placement in a slot with strict category validation
 */
export async function upsertSlot({
  architectureId,
  layer,
  slotIndex,
  componentId,
}: UpsertSlotParams) {
  // Validate slotIndex range (0, 1, 2 for 3-slot architecture)
  if (slotIndex < 0 || slotIndex > 2) {
    throw new Error(`Invalid slot index ${slotIndex}. Must be 0, 1, or 2.`);
  }

  // If assigning a component, validate that component's category matches the target slot layer
  if (componentId) {
    const component = await prisma.component.findUnique({
      where: { id: componentId },
      select: { id: true, name: true, category: true },
    });

    if (!component) {
      throw new Error(`Component with ID '${componentId}' does not exist.`);
    }

    // Category vs Layer mapping validation (AGENTS.md §7-8)
    const isValid =
      (layer === "input" && component.category === "input") ||
      (layer === "board" && component.category === "board") ||
      (layer === "output" && component.category === "output");

    if (!isValid) {
      throw new Error(
        `Invalid component category placement: Cannot place '${component.name}' (${component.category}) into '${layer}' slot.`
      );
    }
  }

  return prisma.architectureSlot.upsert({
    where: {
      architectureId_layer_slotIndex: {
        architectureId,
        layer,
        slotIndex,
      },
    },
    update: {
      componentId: componentId ?? null,
    },
    create: {
      architectureId,
      layer,
      slotIndex,
      componentId: componentId ?? null,
    },
    include: {
      component: true,
    },
  });
}

/**
 * Clear a specific slot (set componentId to null)
 */
export async function clearSlot(
  architectureId: string,
  layer: SlotLayer,
  slotIndex: number
) {
  return prisma.architectureSlot.update({
    where: {
      architectureId_layer_slotIndex: {
        architectureId,
        layer,
        slotIndex,
      },
    },
    data: {
      componentId: null,
    },
    include: {
      component: true,
    },
  });
}

/**
 * Get all slots for an architecture
 */
export async function getSlotsByArchitecture(architectureId: string) {
  return prisma.architectureSlot.findMany({
    where: { architectureId },
    include: { component: true },
    orderBy: [{ layer: "asc" }, { slotIndex: "asc" }],
  });
}
