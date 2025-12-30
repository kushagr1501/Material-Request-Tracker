import { z } from "zod";

export const materialRequestSchema  = z.object({
  material_name: z.string().min(2, "Material name is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  notes: z.string().optional(),
});

export type MaterialRequestForm = z.infer<typeof materialRequestSchema>;