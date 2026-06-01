import type { PaginationType } from "./types";

export interface AccountPlan {
  id: number;
  code: string;
  order: number;
  name: string;
  parentId: number | null;
  isAcceptor: boolean;
  accountantProcessId: number;
}

export interface AccountPlanWrapper {
  accountPlan: AccountPlan;
}

export interface ListAccountPlansWrapper {
  accountPlans: AccountPlan[];
  pagination: PaginationType | null;
}
