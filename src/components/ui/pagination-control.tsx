"use client"

import type { PaginationType } from "@/types/types";
import { ButtonGroup, IconButton, Pagination, Skeleton } from "@chakra-ui/react"
import { Text, Box } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"

interface paginationControlProps {
    pagination: PaginationType | null
    defaultPage?: number,
    variant: "outline" | "solid" | "subtle" | "surface" | "ghost" | "plain";
    buttonColor: string;
    onPageChange: (page: number) => void;
    btnSize: "sm" | "md" | "lg" | "xl" | "2xl" | "2xs" | "xs";
    showTextRegistros?: boolean
}

export default function PaginationControl({ pagination, defaultPage = 1, showTextRegistros = false, btnSize = "sm", variant = "solid", buttonColor = "brand.primary", onPageChange }: paginationControlProps) {
    if (!pagination) return <Skeleton height="32px" width="full" />

    return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignContent="center">
            <Pagination.Root count={pagination.totalPages} pageSize={pagination.pageSize} defaultPage={defaultPage}>
                <ButtonGroup variant={variant} size={btnSize} alignItems="center" justifyContent="center" width="full">
                    <Pagination.PrevTrigger asChild>
                        <IconButton onClick={() => onPageChange(pagination.currentPage - 1)}>
                            <LuChevronLeft />
                        </IconButton>
                    </Pagination.PrevTrigger>

                    <Pagination.Items
                        render={(page) => (
                            <IconButton variant={{ base: "ghost", _selected: "solid" }} bg={{ _selected: buttonColor }} >
                                {page.value}
                            </IconButton>
                        )}
                    />

                    <Pagination.NextTrigger asChild>
                        <IconButton onClick={() => onPageChange(pagination.currentPage + 1)}>
                            <LuChevronRight />
                        </IconButton>
                    </Pagination.NextTrigger>
                </ButtonGroup>
            </Pagination.Root>
            {showTextRegistros && <Text textAlign= "center" color="gray.500" mt={2} fontSize="sm">Mostrando {pagination.records} de {pagination.totalRecords} registros</Text>}

        </Box>
    )
}
