import { EmptyState } from "@chakra-ui/react/empty-state";
import { VStack } from "@chakra-ui/react/stack";



interface emptyDataScreenProps {
    icon?: React.ReactNode;
    title: string;
    message: string;
    children?: React.ReactNode;
    height?: string;
}
export default function EmptyDataScreen({ icon, title, message, children, height }: emptyDataScreenProps) {
    return (<EmptyState.Root size="md" >
        <EmptyState.Content>
            <EmptyState.Indicator>
                {icon}
            </EmptyState.Indicator>
            <VStack textAlign="center" gap={1} height={height}>
                <EmptyState.Title fontSize="md">{title}</EmptyState.Title>
                <EmptyState.Description fontSize="sm">
                    {message}
                </EmptyState.Description>
                {children}
            </VStack>
        </EmptyState.Content>
    </EmptyState.Root>)
}