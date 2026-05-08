import { Box, IconButton, Input, InputGroup, Text } from "@chakra-ui/react";
import { ArrowDownUp, BanknoteX } from "lucide-react";
import { LuSearch } from "react-icons/lu";


export default function ChecksList() {

    return (<Box display="flex" flexDirection="column" gap={4} p={4}>
        <Text fontSize="2xl" fontWeight="bold">Listado de Cheques</Text>
        {/* Filters n actions */}
        <Box display="flex" flexDirection="row" gap={2} justifyContent="space-between" alignItems="center">
            <InputGroup flex="1" startElement={<LuSearch />} >
                <Input placeholder="Buscar Cheques..." />
            </InputGroup>
            <IconButton padding={2} variant="outline" >
                <BanknoteX />
                Rechazar Cheque
            </IconButton>

            <IconButton padding={2} bgColor="brand.primary" >
                <ArrowDownUp />
                Coinciliar
            </IconButton>

        </Box>

        
    </Box>

    );
}