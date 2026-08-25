"use server";

import {
  getArchitectures,
  getArchitectureById,
  createArchitecture,
  updateArchitecture,
  deleteArchitecture,
} from "@/lib/data/architectures";
import {
  upsertSlot,
  clearSlot,
  getSlotsByArchitecture,
  UpsertSlotParams,
} from "@/lib/data/architectureSlots";
import { ArchitectureMode, Prisma, SlotLayer } from "@prisma/client";

export async function fetchArchitectures(mode?: ArchitectureMode) {
  try {
    return { success: true, data: await getArchitectures(mode) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch architectures";
    return { success: false, error: message };
  }
}

export async function fetchArchitectureById(id: string) {
  try {
    const data = await getArchitectureById(id);
    if (!data) return { success: false, error: "Architecture not found" };
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch architecture";
    return { success: false, error: message };
  }
}

export async function createNewArchitecture(data: Prisma.ArchitectureCreateInput) {
  try {
    return { success: true, data: await createArchitecture(data) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create architecture";
    return { success: false, error: message };
  }
}

export async function updateArchitectureDetails(id: string, data: Prisma.ArchitectureUpdateInput) {
  try {
    return { success: true, data: await updateArchitecture(id, data) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update architecture";
    return { success: false, error: message };
  }
}

export async function removeArchitecture(id: string) {
  try {
    return { success: true, data: await deleteArchitecture(id) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete architecture";
    return { success: false, error: message };
  }
}

export async function placeComponentInSlot(params: UpsertSlotParams) {
  try {
    return { success: true, data: await upsertSlot(params) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to place component in slot";
    return { success: false, error: message };
  }
}

export async function removeComponentFromSlot(
  architectureId: string,
  layer: SlotLayer,
  slotIndex: number
) {
  try {
    return { success: true, data: await clearSlot(architectureId, layer, slotIndex) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to clear slot";
    return { success: false, error: message };
  }
}

export async function fetchSlots(architectureId: string) {
  try {
    return { success: true, data: await getSlotsByArchitecture(architectureId) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch slots";
    return { success: false, error: message };
  }
}
