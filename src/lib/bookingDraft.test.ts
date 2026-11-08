import { describe, it, expect, vi } from "vitest";
import { saveDraft, loadDraft, clearDraft } from "./bookingDraft";
import type { BookingDraftCard } from "../../../supabase/functions/_shared/contracts";

const sampleCard: BookingDraftCard = {
  type: "booking_draft",
  boatId: "44444444-4444-4444-4444-444444444444",
  boatName: "Speedboat Benawa 70",
  boatType: "speedboat",
  date: "2026-11-14",
  time: "09:00",
  passengers: 4,
  totalPrice: 180000,
  dpPrice: 54000,
  verdict: "aman",
  reasons: [],
};

class MockStorage implements Storage {
  private store = new Map<string, string>();
  get length(): number {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe("bookingDraft", () => {
  it("saveDraft lalu loadDraft mengembalikan objek yang sama", () => {
    const storage = new MockStorage();
    const currentTime = 1000000;
    const now = () => currentTime;

    saveDraft(sampleCard, storage, now);
    const loaded = loadDraft(storage, now);

    expect(loaded).toEqual(sampleCard);
  });

  it("setelah 31 menit (waktu disuntik) → null karena kedaluwarsa", () => {
    const storage = new MockStorage();
    let currentTime = 1000000;
    const now = () => currentTime;

    saveDraft(sampleCard, storage, now);

    // Maju 31 menit (31 * 60 * 1000 ms)
    currentTime += 31 * 60 * 1000;

    const loaded = loadDraft(storage, now);
    expect(loaded).toBeNull();
  });

  it("storage yang melempar (mode privat) → saveDraft tidak melempar, loadDraft mengembalikan null", () => {
    const throwingStorage = {
      getItem: vi.fn(() => {
        throw new Error("SecurityError: Access denied in private mode");
      }),
      setItem: vi.fn(() => {
        throw new Error("QuotaExceededError: Private browsing limit");
      }),
      removeItem: vi.fn(() => {
        throw new Error("SecurityError");
      }),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    } as unknown as Storage;

    expect(() => saveDraft(sampleCard, throwingStorage)).not.toThrow();
    expect(loadDraft(throwingStorage)).toBeNull();
    expect(() => clearDraft(throwingStorage)).not.toThrow();
  });

  it("clearDraft menghapus draf yang tersimpan", () => {
    const storage = new MockStorage();
    saveDraft(sampleCard, storage);
    expect(loadDraft(storage)).not.toBeNull();

    clearDraft(storage);
    expect(loadDraft(storage)).toBeNull();
  });
});
