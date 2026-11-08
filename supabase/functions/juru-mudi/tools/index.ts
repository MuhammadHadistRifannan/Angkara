import type { ToolDef } from "../../_shared/contracts";
import { searchBoatsTool } from "./searchBoats";
import { getMarineTool } from "./getMarine";
import { evaluateWindowsTool } from "./evaluateWindows";
import { checkAvailabilityTool } from "./checkAvailability";
import { permitChecklistTool } from "./permitChecklist";
import { quoteFareTool } from "./quoteFare";
import { proposeBookingTool } from "./proposeBooking";

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
