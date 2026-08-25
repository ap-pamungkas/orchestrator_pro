"use server";

import {
  getWiresByArchitecture,
  createWire,
  updateWireConditioner,
  deleteWire,
  CreateWireParams,
} from "@/lib/data/wireConnections";

export async function fetchWires(architectureId: string) {
  try {
    return { success: true, data: await getWiresByArchitecture(architectureId) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch wires";
    return { success: false, error: message };
  }
}

export async function connectWire(params: CreateWireParams) {
  try {
    return { success: true, data: await createWire(params) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to connect wire";
    return { success: false, error: message };
  }
}

export async function attachWireConditioner(id: string, conditionerComponentId: string | null) {
  try {
    return { success: true, data: await updateWireConditioner(id, conditionerComponentId) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update wire conditioner";
    return { success: false, error: message };
  }
}

export async function disconnectWire(id: string) {
  try {
    return { success: true, data: await deleteWire(id) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to disconnect wire";
    return { success: false, error: message };
  }
}
