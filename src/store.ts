import { randomUUID } from "node:crypto";
import type { Letter } from "./types";

/**
 * In-Memory-Ablage für Briefe.
 * Für Produktion durch Supabase ersetzen (gleiche Schnittstelle, Tabelle `letters`
 * mit Spalten wie in Letter; PDF nach Storage, nicht in die DB).
 */
export interface LetterStore {
  create(letter: Omit<Letter, "id" | "createdAt" | "status">): Promise<Letter>;
  get(customer: string, id: string): Promise<Letter | undefined>;
  update(letter: Letter): Promise<Letter>;
  list(customer: string, limit?: number): Promise<Letter[]>;
  findByCarrierRef(carrierRef: string): Promise<Letter | undefined>;
}

class MemoryStore implements LetterStore {
  private letters = new Map<string, Letter>();

  async create(data: Omit<Letter, "id" | "createdAt" | "status">): Promise<Letter> {
    const letter: Letter = {
      ...data,
      id: "ltr_" + randomUUID().replace(/-/g, "").slice(0, 16),
      createdAt: new Date().toISOString(),
      status: "draft",
    };
    this.letters.set(letter.id, letter);
    return letter;
  }

  async get(customer: string, id: string): Promise<Letter | undefined> {
    const l = this.letters.get(id);
    return l && l.customer === customer ? l : undefined;
  }

  async update(letter: Letter): Promise<Letter> {
    this.letters.set(letter.id, letter);
    return letter;
  }

  async list(customer: string, limit = 50): Promise<Letter[]> {
    return [...this.letters.values()]
      .filter((l) => l.customer === customer)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, limit);
  }

  async findByCarrierRef(carrierRef: string): Promise<Letter | undefined> {
    return [...this.letters.values()].find((l) => l.carrierRef === carrierRef);
  }
}

export const store: LetterStore = new MemoryStore();
