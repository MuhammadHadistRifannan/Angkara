// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTypewriter } from "./useTypewriter";

describe("useTypewriter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("never renders cursor when 0 characters are typed", () => {
    const { result } = renderHook(() =>
      useTypewriter(
        { line1: "Halo Dunia" },
        { active: true, msPerChar: 30 }
      )
    );

    // Initial state before any timer ticks: 0 chars, NO cursor!
    expect(result.current.typedLine1).toBe("");
    expect(result.current.showCursor).toBe(false);

    // Advance 1 tick -> 1 char typed, cursor appears
    act(() => {
      vi.advanceTimersByTime(30);
    });

    expect(result.current.typedLine1).toBe("H");
    expect(result.current.showCursor).toBe(true);
  });

  it("handles line1 and line2 sequencing and fires onLine2Start", () => {
    const onLine2Start = vi.fn();
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useTypewriter(
        { line1: "Hai", line2: "Yo" },
        { active: true, msPerChar: 20, lineDelay: 50, onLine2Start, onComplete }
      )
    );

    // Line 1: 3 chars * 20ms = 60ms
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.typedLine1).toBe("Hai");
    expect(result.current.typedLine2).toBe("");
    expect(onLine2Start).not.toHaveBeenCalled();

    // Line delay 50ms
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(onLine2Start).toHaveBeenCalledTimes(1);

    // Line 2: 2 chars * 20ms = 40ms
    act(() => {
      vi.advanceTimersByTime(40);
    });
    expect(result.current.typedLine2).toBe("Yo");

    // Next tick reaches completion
    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.isTyping).toBe(false);

    // Cursor stays for 1200ms after completion
    expect(result.current.showCursor).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current.showCursor).toBe(false);
  });

  it("keeps text visible during fade-out when active becomes false and resets safely", () => {
    const { result, rerender } = renderHook(
      ({ active }) =>
        useTypewriter(
          { line1: "Teks Uji" },
          { active, msPerChar: 20, fadeOutDuration: 300 }
        ),
      { initialProps: { active: true } }
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.typedLine1.length).toBeGreaterThan(0);
    const textBeforeFade = result.current.typedLine1;

    // Active becomes false -> text is NOT erased immediately
    rerender({ active: false });
    expect(result.current.typedLine1).toBe(textBeforeFade);
    expect(result.current.showCursor).toBe(false); // cursor hides immediately on deactivate

    // Advance 300ms (fade-out completes)
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.typedLine1).toBe("");
  });

  it("is safe under StrictMode (unmount & remount doesn't leave stray timers or cursor)", () => {
    const { result, unmount } = renderHook(() =>
      useTypewriter(
        { line1: "StrictMode Test" },
        { active: true, msPerChar: 20 }
      )
    );

    unmount();
    // Advancing timers after unmount shouldn't throw or update
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.showCursor).toBe(false);
  });
});
