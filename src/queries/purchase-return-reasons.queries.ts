import { useQuery } from "@tanstack/react-query";
import { purchaseReturnReasonsApi } from "@/api/purchaseReturnReasons.api";

export const purchaseReturnReasonsKeys = {
    all: ["purchaseReturnReasons"] as const,
};

export const useGetAllPurchaseReturnReasons = () => {
    return useQuery({
        queryKey: purchaseReturnReasonsKeys.all,
        queryFn: () => purchaseReturnReasonsApi.getAll(),
    });
};
