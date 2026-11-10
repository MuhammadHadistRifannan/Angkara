import type { ToolDef } from "../../_shared/contracts.ts";
import { searchBoatsTool } from "./searchBoats.ts";
import { getMarineTool } from "./getMarine.ts";
import { evaluateWindowsTool } from "./evaluateWindows.ts";
import { checkAvailabilityTool } from "./checkAvailability.ts";
import { permitChecklistTool } from "./permitChecklist.ts";
import { quoteFareTool } from "./quoteFare.ts";
import { proposeBookingTool } from "./proposeBooking.ts";

export {
  searchBoatsTool,
  getMarineTool,
  evaluateWindowsTool,
  checkAvailabilityTool,
  permitChecklistTool,
  quoteFareTool,
  proposeBookingTool,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TOOLS: ToolDef<any, any>[] = [
  searchBoatsTool,
  getMarineTool,
  evaluateWindowsTool,
  checkAvailabilityTool,
  permitChecklistTool,
  quoteFareTool,
  proposeBookingTool,
];
