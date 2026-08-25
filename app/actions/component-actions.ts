"use server";

import {
  getComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent,
} from "@/lib/data/components";
import { ComponentCategory, Prisma } from "@prisma/client";
import { KitComponent } from "@/types";

function toKitComponent(comp: {
  id: string;
  name: string;
  category: ComponentCategory;
  type: string;
  description?: string | null;
  imageUrl?: string | null;
  pinInfo?: string | null;
  defaultGpio?: string | null;
  statusBadge?: string | null;
  requiredConditionerId?: string | null;
  requiredConditionerName?: string | null;
  isCustom: boolean;
}): KitComponent {
  return {
    id: comp.id,
    name: comp.name,
    category: comp.category as KitComponent["category"],
    type: comp.type,
    description: comp.description || undefined,
    image: comp.imageUrl || undefined,
    pinInfo: comp.pinInfo || undefined,
    defaultGpio: comp.defaultGpio || undefined,
    statusBadge: comp.statusBadge || undefined,
    requiredConditionerId: comp.requiredConditionerId || undefined,
    requiredConditionerName: comp.requiredConditionerName || undefined,
    isCustom: comp.isCustom,
  };
}

export async function fetchComponents(category?: ComponentCategory) {
  try {
    const rawList = await getComponents(category);
    const data: KitComponent[] = rawList.map(toKitComponent);
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch components";
    return { success: false, error: message };
  }
}

export async function fetchComponentById(id: string) {
  try {
    const raw = await getComponentById(id);
    if (!raw) return { success: false, error: "Component not found" };
    return { success: true, data: toKitComponent(raw) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch component";
    return { success: false, error: message };
  }
}

export async function saveKitComponentAction(component: KitComponent) {
  try {
    const payload: Prisma.ComponentCreateInput = {
      id: component.id,
      name: component.name,
      category: component.category as ComponentCategory,
      type: component.type,
      description: component.description || null,
      imageUrl: component.image || null,
      pinInfo: component.pinInfo || null,
      defaultGpio: component.defaultGpio || null,
      statusBadge: component.statusBadge || null,
      requiredConditionerName: component.requiredConditionerName || null,
      isCustom: component.isCustom ?? true,
      ...(component.requiredConditionerId
        ? { requiredConditioner: { connect: { id: component.requiredConditionerId } } }
        : {}),
    };

    const created = await createComponent(payload);
    return {
      success: true,
      data: toKitComponent(created),
      message: `Komponen "${component.name}" berhasil disimpan ke database.`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menyimpan komponen ke database";
    return { success: false, error: message };
  }
}

export async function deleteKitComponentAction(id: string) {
  try {
    const deleted = await deleteComponent(id);
    return {
      success: true,
      data: toKitComponent(deleted),
      message: `Komponen "${deleted.name}" berhasil dihapus dari database.`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus komponen dari database";
    return { success: false, error: message };
  }
}

export async function createNewComponent(data: Prisma.ComponentCreateInput) {
  try {
    return { success: true, data: await createComponent(data) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create component";
    return { success: false, error: message };
  }
}

export async function updateComponentDetails(id: string, data: Prisma.ComponentUpdateInput) {
  try {
    return { success: true, data: await updateComponent(id, data) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update component";
    return { success: false, error: message };
  }
}

export async function removeComponent(id: string) {
  try {
    return { success: true, data: await deleteComponent(id) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete component";
    return { success: false, error: message };
  }
}
