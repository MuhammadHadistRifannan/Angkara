import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createTypingController } from "./typingController";

describe("createTypingController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with empty text and cursor active", () => {
    const onUpdate = vi.fn();
    const controller = createTypingController({
      title: "Listing Terverifikasi",
      description: "Semua operator kapal terverifikasi.",
      titleCharMs: 35,
      descCharMs: 18,
      cursorHideDelayMs: 1000,
      onUpdate,
    });

    controller.start();

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        typedTitle: "",
        typedDesc: "",
        isTitleDone: false,
        isDescDone: false,
        showCursor: true,
        cursorTarget: "title",
      })
    );

    controller.cancel();
  });

  it("types title character by character at 35ms/char, then types description at 18ms/char", () => {
    const updates: Array<{
      typedTitle: string;
      typedDesc: string;
      isTitleDone: boolean;
      isDescDone: boolean;
    }> = [];

    const controller = createTypingController({
      title: "Halo",
      description: "Dunia",
      titleCharMs: 35,
      descCharMs: 18,
      cursorHideDelayMs: 1000,
      onUpdate: (state) => {
        updates.push({
          typedTitle: state.typedTitle,
          typedDesc: state.typedDesc,
          isTitleDone: state.isTitleDone,
          isDescDone: state.isDescDone,
        });
      },
    });

    controller.start();

    // Advance 35ms * 4 = 140ms for "Halo"
    vi.advanceTimersByTime(35 * 4);
    const lastTitleUpdate = updates[updates.length - 1];
    expect(lastTitleUpdate.typedTitle).toBe("Halo");
    expect(lastTitleUpdate.isTitleDone).toBe(true);
    expect(lastTitleUpdate.typedDesc).toBe("");

    // Advance 18ms * 5 = 90ms for "Dunia"
    vi.advanceTimersByTime(18 * 5);
    const finalUpdate = updates[updates.length - 1];
    expect(finalUpdate.typedTitle).toBe("Halo");
    expect(finalUpdate.typedDesc).toBe("Dunia");
    expect(finalUpdate.isDescDone).toBe(true);

    controller.cancel();
  });

  it("hides cursor 1000ms after description typing completes", () => {
    let currentShowCursor = true;
    const controller = createTypingController({
      title: "A",
      description: "B",
      titleCharMs: 10,
      descCharMs: 10,
      cursorHideDelayMs: 1000,
      onUpdate: (state) => {
        currentShowCursor = state.showCursor;
      },
    });

    controller.start();
    // Complete title (10ms) and desc (10ms)
    vi.advanceTimersByTime(20);
    expect(currentShowCursor).toBe(true);

    // After 999ms cursor still showing (at t = 1019ms)
    vi.advanceTimersByTime(999);
    expect(currentShowCursor).toBe(true);

    // After 1ms more (at t = 1020ms) cursor hides
    vi.advanceTimersByTime(1);
    expect(currentShowCursor).toBe(false);

    controller.cancel();
  });

  it("can be cancelled immediately, preventing further updates", () => {
    const onUpdate = vi.fn();
    const controller = createTypingController({
      title: "Judul Panjang Sekali",
      description: "Deskripsi Panjang Sekali",
      titleCharMs: 35,
      descCharMs: 18,
      cursorHideDelayMs: 1000,
      onUpdate,
    });

    controller.start();
    vi.advanceTimersByTime(70); // 2 characters
    const callsBeforeCancel = onUpdate.mock.calls.length;

    controller.cancel();

    // Advance timer significantly
    vi.advanceTimersByTime(5000);
    // No new calls should have occurred
    expect(onUpdate.mock.calls.length).toBe(callsBeforeCancel);
  });
});
