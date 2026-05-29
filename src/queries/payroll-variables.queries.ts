import { useQuery } from "@tanstack/react-query";
import { RETRIES } from "@/constants/queryConstants";
import { payrollVariablesApi } from "@/api/payroll-variables.api";

export const payrollVariableKeys = {
  all: ["payroll-variables"] as const,
};

export const useGetPayrollVariables = () => {
  return useQuery({
    queryKey: payrollVariableKeys.all,
    queryFn: () => payrollVariablesApi.getPayrollVariables(),
    retry: RETRIES,
  });
};