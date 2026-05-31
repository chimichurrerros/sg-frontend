export interface LibroDiarioDetail {
  accountId: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface LibroDiarioEntry {
  entryId: number;
  date: string;
  description: string;
  moduleName: string;
  details: LibroDiarioDetail[];
}

export interface LibroDiarioResponse {
  entries: LibroDiarioEntry[];
}
