// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import { HeroTitle } from "./HeroTitle";
import { HERO_TITLES } from "./heroStep";

describe("HeroTitle title readability transition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reveals full text of current title when user scrolls before typing completes", () => {
    const { container, rerender } = render(
      React.createElement(HeroTitle, { step: 1, isReducedMotion: false })
    );

    // After 90ms (3 chars typed), title 1 is only partially typed
    act(() => {
      vi.advanceTimersByTime(90);
    });

    const animatedLine1 = container.querySelector(".text-white");
    const animatedLine2 = container.querySelector(".text-white\\/70");

    expect(animatedLine1?.textContent).toContain("Ber");
    expect(animatedLine1?.textContent).not.toContain(HERO_TITLES[0].line1);

    // User scrolls to step 2 while typing Title 1 is still in progress!
    act(() => {
      rerender(React.createElement(HeroTitle, { step: 2, isReducedMotion: false }));
    });

    // IMMEDIATELY: Full text of Title 1 must be shown!
    expect(animatedLine1?.textContent).toContain(HERO_TITLES[0].line1);
    expect(animatedLine2?.textContent).toContain(HERO_TITLES[0].line2);

    // After 450ms hold (reading time) + 300ms fade-out = 750ms:
    act(() => {
      vi.advanceTimersByTime(750);
    });

    // Now it transitions to Title 2 and begins typing Title 2
    act(() => {
      vi.advanceTimersByTime(120);
    });
    // First characters of Title 2 appear
    expect(animatedLine1?.textContent).toContain(HERO_TITLES[1].line1.slice(0, 3));
  });

  it("transitions without hold delay when typing was already completed", () => {
    const { container, rerender } = render(
      React.createElement(HeroTitle, { step: 1, isReducedMotion: false })
    );

    // Let title 1 finish typing completely (line1 ~23 chars, line2 ~21 chars => ~1500ms)
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const animatedLine1 = container.querySelector(".text-white");
    expect(animatedLine1?.textContent).toContain(HERO_TITLES[0].line1);

    // Now user scrolls to step 2
    act(() => {
      rerender(React.createElement(HeroTitle, { step: 2, isReducedMotion: false }));
    });

    // After only 300ms (fade-out without 450ms hold), switches to Title 2
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Advances to typing Title 2
    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(animatedLine1?.textContent).toContain(HERO_TITLES[1].line1.slice(0, 3));
  });

  it("skips intermediate step when user scrolls rapidly", () => {
    const { container, rerender } = render(
      React.createElement(HeroTitle, { step: 1, isReducedMotion: false })
    );

    // After 90ms, title 1 is partially typed
    act(() => {
      vi.advanceTimersByTime(90);
    });

    // Rapid scroll from step 1 to step 2, then immediately to step 3
    act(() => {
      rerender(React.createElement(HeroTitle, { step: 2, isReducedMotion: false }));
    });
    act(() => {
      rerender(React.createElement(HeroTitle, { step: 3, isReducedMotion: false }));
    });

    // Title 1 is forced complete
    const animatedLine1 = container.querySelector(".text-white");
    expect(animatedLine1?.textContent).toContain(HERO_TITLES[0].line1);

    // Complete hold (450ms) + fade-out (300ms)
    act(() => {
      vi.advanceTimersByTime(750);
    });

    // Advance 120ms: Lands directly on Title 3 ("Tanya Juru Mudi.") without queueing Title 2!
    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(animatedLine1?.textContent).toContain(HERO_TITLES[2].line1.slice(0, 3));
  });
});
