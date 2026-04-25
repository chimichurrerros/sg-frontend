import { EmptyState } from "@chakra-ui/react/empty-state";
import { VStack } from "@chakra-ui/react/stack";



interface emptyDataScreenProps {
    icon?: React.ReactNode;
    title: string;
    message: string;
    children?: React.ReactNode;
}
export default function EmptyDataScreen({ icon, title, message, children }: emptyDataScreenProps) {
    return (<EmptyState.Root size="md">
        <EmptyState.Content>
            <EmptyState.Indicator>
                {icon}
            </EmptyState.Indicator>
            <VStack textAlign="center" gap={1}>
                <EmptyState.Title fontSize="md">{title}</EmptyState.Title>
                <EmptyState.Description fontSize="sm">
                    {message}
                </EmptyState.Description>
                {children}
            </VStack>
        </EmptyState.Content>
    </EmptyState.Root>)
}