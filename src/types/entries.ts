import type { PaginationType } from "./types";

export interface EntryDetail {
  id?: number;
  entryId?: number;
  accountPlanId: number;
  debit: number;
  credit: number;
}

export interface Entry {
  id: number;
  date: string;
  description: string | null;
  module: number; // enum (0: Sales, 1: Purchases, 2: Inventory, 3: Salary)
  accountantProcessId: number;
  entryDetails: EntryDetail[];
}

export interface EntryWrapper {
  entry: Entry;
}

export interface ListEntriesWrapper {
  entries: Entry[];
  pagination: PaginationType | null;
}
