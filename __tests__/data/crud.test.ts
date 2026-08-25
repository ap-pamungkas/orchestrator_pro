import { describe, it, expect, vi, beforeEach } from "vitest";
import { upsertSlot, clearSlot } from "@/lib/data/architectureSlots";
import { createWire } from "@/lib/data/wireConnections";
import { deleteComponent } from "@/lib/data/components";
import { prisma } from "@/lib/prisma";
import { Component, ArchitectureSlot, WireConnection } from "@prisma/client";

vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      component: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        delete: vi.fn(),
      },
      architectureSlot: {
        upsert: vi.fn(),
        update: vi.fn(),
      },
      wireConnection: {
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    },
  };
});

describe("Data Access Layer & Business Rule Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ArchitectureSlot - Category Placement Validation (AGENTS.md §7-8)", () => {
    it("should accept valid placement (input component in input slot)", async () => {
      vi.mocked(prisma.component.findUnique).mockResolvedValue({
        id: "tactile-button",
        name: "Tactile Button",
        category: "input",
      } as unknown as Component);

      vi.mocked(prisma.architectureSlot.upsert).mockResolvedValue({
        id: "slot-1",
        architectureId: "arch-1",
        layer: "input",
        slotIndex: 0,
        componentId: "tactile-button",
      } as unknown as ArchitectureSlot);

      const result = await upsertSlot({
        architectureId: "arch-1",
        layer: "input",
        slotIndex: 0,
        componentId: "tactile-button",
      });

      expect(result.componentId).toBe("tactile-button");
    });

    it("should REJECT invalid placement: output component in input slot", async () => {
      vi.mocked(prisma.component.findUnique).mockResolvedValue({
        id: "led",
        name: "LED",
        category: "output",
      } as unknown as Component);

      await expect(
        upsertSlot({
          architectureId: "arch-1",
          layer: "input",
          slotIndex: 0,
          componentId: "led",
        })
      ).rejects.toThrow(/Cannot place 'LED' \(output\) into 'input' slot/);
    });

    it("should REJECT invalid placement: board component in output slot", async () => {
      vi.mocked(prisma.component.findUnique).mockResolvedValue({
        id: "esp32",
        name: "ESP32 Core",
        category: "board",
      } as unknown as Component);

      await expect(
        upsertSlot({
          architectureId: "arch-1",
          layer: "output",
          slotIndex: 0,
          componentId: "esp32",
        })
      ).rejects.toThrow(/Cannot place 'ESP32 Core' \(board\) into 'output' slot/);
    });

    it("should reject invalid slot index outside 0..2", async () => {
      await expect(
        upsertSlot({
          architectureId: "arch-1",
          layer: "input",
          slotIndex: 5,
          componentId: "tactile-button",
        })
      ).rejects.toThrow(/Invalid slot index/);
    });

    it("should allow clearing a slot", async () => {
      vi.mocked(prisma.architectureSlot.update).mockResolvedValue({
        id: "slot-1",
        architectureId: "arch-1",
        layer: "input",
        slotIndex: 0,
        componentId: null,
      } as unknown as ArchitectureSlot);

      const result = await clearSlot("arch-1", "input", 0);
      expect(result.componentId).toBeNull();
    });
  });

  describe("WireConnection - Pipeline Routing Validation", () => {
    it("should allow valid input -> board wire connection", async () => {
      vi.mocked(prisma.wireConnection.create).mockResolvedValue({
        id: "wire-1",
        architectureId: "arch-1",
        fromCategory: "input",
        fromSlot: 0,
        toCategory: "board",
        toSlot: 1,
      } as unknown as WireConnection);

      const result = await createWire({
        architectureId: "arch-1",
        fromCategory: "input",
        fromSlot: 0,
        toCategory: "board",
        toSlot: 1,
      });

      expect(result.id).toBe("wire-1");
    });

    it("should REJECT direct input -> output wire connection", async () => {
      await expect(
        createWire({
          architectureId: "arch-1",
          fromCategory: "input",
          fromSlot: 0,
          toCategory: "output",
          toSlot: 0,
        })
      ).rejects.toThrow(/Input category must connect to Board, not directly to Output/);
    });

    it("should REJECT invalid conditioner category on wire", async () => {
      vi.mocked(prisma.component.findUnique).mockResolvedValue({
        id: "esp32",
        name: "ESP32 Core",
        category: "board",
      } as unknown as Component);

      await expect(
        createWire({
          architectureId: "arch-1",
          fromCategory: "input",
          fromSlot: 0,
          toCategory: "board",
          toSlot: 1,
          conditionerComponentId: "esp32",
        })
      ).rejects.toThrow(/expected 'conditioner'/);
    });
  });

  describe("Component - Deletion Integrity Guards", () => {
    it("should prevent deleting a component required as conditioner by other components", async () => {
      vi.mocked(prisma.component.findMany).mockResolvedValue([
        { id: "led", name: "LED (Red / Blue)" },
      ] as unknown as Component[]);

      await expect(deleteComponent("resistor-220")).rejects.toThrow(
        /Cannot delete component 'resistor-220' because it is required as a conditioner by: LED/
      );
    });

    it("should prevent deleting a component assigned as conditioner on active wires", async () => {
      vi.mocked(prisma.component.findMany).mockResolvedValue([]);
      vi.mocked(prisma.wireConnection.count).mockResolvedValue(2);

      await expect(deleteComponent("resistor-220")).rejects.toThrow(
        /currently assigned as a conditioner on 2 wire connection/
      );
    });

    it("should allow deleting unreferenced component", async () => {
      vi.mocked(prisma.component.findMany).mockResolvedValue([]);
      vi.mocked(prisma.wireConnection.count).mockResolvedValue(0);
      vi.mocked(prisma.component.delete).mockResolvedValue({ id: "custom-comp" } as unknown as Component);

      const res = await deleteComponent("custom-comp");
      expect(res.id).toBe("custom-comp");
    });
  });
});
