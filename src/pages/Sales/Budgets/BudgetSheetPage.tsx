import type { BudgetForm } from "@/types/budgets";
import { Box, Flex, IconButton, Input, Text } from "@chakra-ui/react";
import { ExternalLink, Printer } from "lucide-react";
import { useState } from "react";




interface budgetSheetPageProps {
    mode: "create" | "edit"
}
export default function BudgetSheetPage({ mode }: budgetSheetPageProps) {

    const [budgetForm, setBudgetForm] = useState<BudgetForm>({
        creationDate: Date.now().toString()
    })

    return (<Box>
        <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="2xl" fontWeight="bold">
                {mode === "create" && "Nuevo"} Presupuesto (N° XXXX)
            </Text>
            <Flex align="center" gap={3}>
                <Text fontWeight="bold" fontSize="sm">FACTURA N°</Text>
                <Input value={budgetForm.invoice?.number || "-"} w="170px" size="sm" readOnly />
                <IconButton size="md" padding={4} variant="outline" disabled={!budgetForm.invoice}>
                    <Printer /> Imprimir Factura Legal
                </IconButton>
                {mode === "edit" && <IconButton size="md" padding={4} variant="ghost" disabled={!budgetForm.invoice}>
                    <ExternalLink /> Ver Factura
                </IconButton>}
            </Flex>
        </Flex>
    </Box>);

}