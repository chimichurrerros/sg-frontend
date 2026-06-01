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

export interface LibroMayorMovement {
  entryId: number;
  date: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface LibroMayorAccount {
  accountId: number;
  accountCode: string;
  accountName: string;
  initialBalance: number;
  movements: LibroMayorMovement[];
  totalDebit: number;
  totalCredit: number;
  finalBalance: number;
}

export interface LibroMayorResponse {
  accounts: LibroMayorAccount[];
}

export interface BalanceGeneralItem {
  accountId: number;
  accountCode: string;
  accountName: string;
  balance: number;
  isAcceptor: boolean;
}

export interface BalanceGeneralResponse {
  assets: BalanceGeneralItem[];
  liabilities: BalanceGeneralItem[];
  equity: BalanceGeneralItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
}

