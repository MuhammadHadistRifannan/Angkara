import { describe, it, expect } from "vitest";
import { isEvalForceUnavailable } from "./evalMode";

describe("isEvalForceUnavailable test flag helper", () => {
  it("(a) EVAL_MODE=1 + header=1 -> unavailable (true)", () => {
    expect(isEvalForceUnavailable("1", "1")).toBe(true);
  });

  it("(b) EVAL_MODE tidak disetel + header=1 -> perilaku normal (false)", () => {
    expect(isEvalForceUnavailable(undefined, "1")).toBe(false);
  });

  it("(c) EVAL_MODE=0 + header=1 -> perilaku normal (false)", () => {
    expect(isEvalForceUnavailable("0", "1")).toBe(false);
  });

  it("EVAL_MODE=1 namun header tidak ada atau bukan 1 -> perilaku normal (false)", () => {
    expect(isEvalForceUnavailable("1", null)).toBe(false);
    expect(isEvalForceUnavailable("1", undefined)).toBe(false);
    expect(isEvalForceUnavailable("1", "true")).toBe(false);
    expect(isEvalForceUnavailable("1", "0")).toBe(false);
  });
});
