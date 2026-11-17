export interface TypingAnimationOptions {
  line1: string;
  line2: string;
  charDelay?: number;
  lineDelay?: number;
  initialDelay?: number;
  onUpdate: (state: { line1: string; line2: string; isTyping: boolean }) => void;
  onLine2Start?: () => void;
  onComplete?: () => void;
}

export type CancelAnimation = () => void;

export function runHeroTypingAnimation(options: TypingAnimationOptions): CancelAnimation {
  const {
    line1,
    line2,
    charDelay = 40,
    lineDelay = 120,
    initialDelay = 0,
    onUpdate,
    onLine2Start,
    onComplete,
  } = options;

  let isCancelled = false;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let hasTriggeredLine2Start = false;

  let currentLine1 = "";
  let currentLine2 = "";

  onUpdate({ line1: "", line2: "", isTyping: true });

  let idx1 = 0;
  let idx2 = 0;

  const typeLine2 = () => {
    if (isCancelled) return;

    if (!hasTriggeredLine2Start) {
      hasTriggeredLine2Start = true;
      if (onLine2Start) {
        onLine2Start();
      }
    }

    if (idx2 < line2.length) {
      idx2++;
      currentLine2 = line2.slice(0, idx2);
      onUpdate({ line1: currentLine1, line2: currentLine2, isTyping: true });
      timerId = setTimeout(typeLine2, charDelay);
    } else {
      onUpdate({ line1: currentLine1, line2: currentLine2, isTyping: false });
      if (onComplete) {
        onComplete();
      }
    }
  };

  const typeLine1 = () => {
    if (isCancelled) return;
    if (idx1 < line1.length) {
      idx1++;
      currentLine1 = line1.slice(0, idx1);
      onUpdate({ line1: currentLine1, line2: currentLine2, isTyping: true });
      timerId = setTimeout(typeLine1, charDelay);
    } else {
      timerId = setTimeout(typeLine2, lineDelay);
    }
  };

  if (initialDelay > 0) {
    timerId = setTimeout(typeLine1, initialDelay);
  } else {
    typeLine1();
  }

  return () => {
    isCancelled = true;
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
}
