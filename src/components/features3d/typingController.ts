/**
 * Kontroler Animasi Typing yang Dapat Dibatalkan (Cancelable)
 * Sesuai Revisi 4:
 * - Judul diketik dulu (35 ms/karakter)
 * - Setelah selesai, deskripsi diketik (18 ms/karakter)
 * - Kursor berkedip di ujung teks yang sedang diketik, lalu hilang 1000ms setelah selesai
 * - Jika step berganti sebelum selesai, batalkan typing segera
 */

export interface TypingState {
  typedTitle: string;
  typedDesc: string;
  isTitleDone: boolean;
  isDescDone: boolean;
  showCursor: boolean;
  cursorTarget: "title" | "desc" | "none";
}

export interface TypingControllerOptions {
  title: string;
  description: string;
  titleCharMs?: number;
  descCharMs?: number;
  cursorHideDelayMs?: number;
  onUpdate: (state: TypingState) => void;
}

export interface TypingController {
  start: () => void;
  cancel: () => void;
}

export const createTypingController = ({
  title,
  description,
  titleCharMs = 35,
  descCharMs = 18,
  cursorHideDelayMs = 1000,
  onUpdate,
}: TypingControllerOptions): TypingController => {
  let isCancelled = false;
  let timerId: ReturnType<typeof setTimeout> | null = null;

  let titleIndex = 0;
  let descIndex = 0;

  const clearTimer = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const notify = (
    typedTitle: string,
    typedDesc: string,
    isTitleDone: boolean,
    isDescDone: boolean,
    showCursor: boolean,
    cursorTarget: "title" | "desc" | "none"
  ) => {
    if (isCancelled) return;
    onUpdate({
      typedTitle,
      typedDesc,
      isTitleDone,
      isDescDone,
      showCursor,
      cursorTarget,
    });
  };

  const scheduleNext = () => {
    if (isCancelled) return;

    if (titleIndex < title.length) {
      timerId = setTimeout(() => {
        if (isCancelled) return;
        titleIndex++;
        const currentTitle = title.slice(0, titleIndex);
        const isDone = titleIndex >= title.length;
        notify(
          currentTitle,
          "",
          isDone,
          false,
          true,
          isDone ? "desc" : "title"
        );
        scheduleNext();
      }, titleCharMs);
    } else if (descIndex < description.length) {
      timerId = setTimeout(() => {
        if (isCancelled) return;
        descIndex++;
        const currentDesc = description.slice(0, descIndex);
        const isDone = descIndex >= description.length;
        notify(
          title,
          currentDesc,
          true,
          isDone,
          true,
          isDone ? "none" : "desc"
        );
        scheduleNext();
      }, descCharMs);
    } else {
      // Selesai: jadwalkan hilangnya kursor setelah cursorHideDelayMs
      timerId = setTimeout(() => {
        if (isCancelled) return;
        notify(title, description, true, true, false, "none");
      }, cursorHideDelayMs);
    }
  };

  return {
    start: () => {
      clearTimer();
      isCancelled = false;
      titleIndex = 0;
      descIndex = 0;

      notify("", "", false, false, true, "title");
      scheduleNext();
    },
    cancel: () => {
      isCancelled = true;
      clearTimer();
    },
  };
};
