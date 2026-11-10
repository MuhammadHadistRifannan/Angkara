import { z } from "zod";
import type { ToolDef, ToolResult, ToolCtx } from "../../_shared/contracts.ts";
import permitsData from "../../_shared/data/permits.json" with { type: "json" };

export const permitChecklistSchema = z.object({
  category: z.string().optional(),
});

export type PermitChecklistInput = z.infer<typeof permitChecklistSchema>;

export interface PermitChecklistOutput {
  permits: typeof permitsData.permits;
  requirements: typeof permitsData.requirements;
}

export const permitChecklistTool: ToolDef<PermitChecklistInput, PermitChecklistOutput> = {
  name: "permit_checklist",
  description: "Melihat daftar persyaratan izin berlayar, dokumen regulasi, dan checklist kepatuhan untuk operator kapal.",
  schema: permitChecklistSchema,
  async run(_input: PermitChecklistInput, _ctx: ToolCtx): Promise<ToolResult<PermitChecklistOutput>> {
    return {
      ok: true,
      data: {
        permits: permitsData.permits,
        requirements: permitsData.requirements,
      },
    };
  },
};
