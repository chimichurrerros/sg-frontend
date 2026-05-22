import { useQuery } from "@tanstack/react-query";
import { purchaseOrdersApi } from "@/api/purchaseOrders.api";

export const purchaseOrdersKeys = {
    all: ["purchaseOrders"] as const,
};

export const useGetAllPurchaseOrders = () => {
    return useQuery({
        queryKey: purchaseOrdersKeys.all,
        queryFn: () => purchaseOrdersApi.get({ page: 1, pageSize: 1000 }),
        select: (data) => data.purchaseOrders,
    });
};
