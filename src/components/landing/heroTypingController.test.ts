import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runHeroTypingAnimation } from "./heroTypingController";

describe("runHeroTypingAnimation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("types line1 then line2 character by character and calls onComplete", () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();

    const cancel = runHeroTypingAnimation({
      line1: "Halo.",
      line2: "Dunia.",
      charDelay: 40,
      lineDelay: 100,
      onUpdate,
      onComplete,
    });

    expect(onUpdate).toHaveBeenCalledWith({ line1: "", line2: "", isTyping: true });

    // Advance 40ms * 5 chars (Halo.)
    vi.advanceTimersByTime(40 * 5);
    expect(onUpdate).toHaveBeenLastCalledWith({ line1: "Halo.", line2: "", isTyping: true });

    // Line gap
    vi.advanceTimersByTime(100);

    // Advance 40ms * 6 chars (Dunia.)
    vi.advanceTimersByTime(40 * 6);
    expect(onUpdate).toHaveBeenLastCalledWith({ line1: "Halo.", line2: "Dunia.", isTyping: false });
    expect(onComplete).toHaveBeenCalledTimes(1);

    cancel();
  });

  it("calls onLine2Start right when line 2 starts typing (teks ke-2 pada title)", () => {
    const onUpdate = vi.fn();
    const onLine2Start = vi.fn();

    const cancel = runHeroTypingAnimation({
      line1: "Halo.",
      line2: "Dunia.",
      charDelay: 40,
      lineDelay: 100,
      onUpdate,
      onLine2Start,
    });

    expect(onLine2Start).not.toHaveBeenCalled();

    // Advance during line 1
    vi.advanceTimersByTime(40 * 5);
    expect(onLine2Start).not.toHaveBeenCalled();

    // Line gap triggers line 2
    vi.advanceTimersByTime(100);
    expect(onLine2Start).toHaveBeenCalledTimes(1);

    cancel();
  });

  it("can be cancelled immediately without triggering further callbacks", () => {
    const onUpdate = vi.fn();
    const onComplete = vi.fn();

    const cancel = runHeroTypingAnimation({
      line1: "Berlayar lebih tenang.",
      line2: "Cuaca sudah dihitung.",
      charDelay: 40,
      lineDelay: 100,
      onUpdate,
      onComplete,
    });

    vi.advanceTimersByTime(80); // only 2 chars typed
    cancel();

    const callCount = onUpdate.mock.calls.length;
    vi.advanceTimersByTime(5000);
    expect(onUpdate.mock.calls.length).toBe(callCount);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
