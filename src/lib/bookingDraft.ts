import type { BookingDraftCard } from "../../supabase/functions/_shared/contracts";

export interface StoredBookingDraft {
  card: BookingDraftCard;
  savedAt: number;
}

const STORAGE_KEY = "angkara_booking_draft";
const DRAFT_EXPIRY_MS = 30 * 60 * 1000; // 30 menit

function getStorage(storage?: Storage): Storage | null {
  if (storage !== undefined) return storage;
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return window.sessionStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function saveDraft(
  card: BookingDraftCard,
  storage?: Storage,
  now = () => Date.now()
): void {
  try {
    const s = getStorage(storage);
    if (!s) return;
    const payload: StoredBookingDraft = {
      card,
      savedAt: now(),
    };
    s.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Mode privat atau batasan storage tidak boleh melempar
  }
}

export function loadDraft(
  storage?: Storage,
  now = () => Date.now()
): BookingDraftCard | null {
  try {
    const s = getStorage(storage);
    if (!s) return null;
    const raw = s.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredBookingDraft;
    if (!parsed || !parsed.card || !parsed.savedAt) return null;

    if (now() - parsed.savedAt > DRAFT_EXPIRY_MS) {
      clearDraft(storage);
      return null;
    }

    return parsed.card;
  } catch {
    return null;
  }
}

export function clearDraft(storage?: Storage): void {
  try {
    const s = getStorage(storage);
    if (!s) return;
    s.removeItem(STORAGE_KEY);
  } catch {
    // Mode privat atau kesalahan akses diabaikan
  }
}
