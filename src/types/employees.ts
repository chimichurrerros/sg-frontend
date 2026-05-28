export type MaritalStatusEnum = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type RelationTypeEnum = 1 | 2;
export type GenderEnum = 0 | 1 | 2 | 3;
export const GenderEnum = {
  Unknown: 0,
  Male: 1,
  Female: 2,
  Other: 3,
} as const;

export interface Employee {
  id: number;
  legajo: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  areaId: number;
  branchId: number | null;
  inmediatlyBossId: number | null;
  gender: GenderEnum;
  maritalStatus: MaritalStatusEnum;
  positionId?: number | null;
  scheduleId?: number | null;
  baseSalary: number;
  hireDate: string;
  status: string;
}

export interface EmployeeList {
  employees: Employee[];
  pagination: import("@/types/types").PaginationType | null;
}