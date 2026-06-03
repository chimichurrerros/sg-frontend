"use client"

import type { PaginationType } from "@/types/types";
import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react"
import { Box } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu"

interface paginationControlProps {
    pagination: PaginationType | null
    variant?: "outline" | "solid" | "subtle" | "surface" | "ghost" | "plain";
    buttonColor?: string;
    onPageChange: (page: number) => void;
    btnSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "2xs" | "xs";
}

export default function PaginationControl({
    pagination,
    btnSize = "sm",
    buttonColor = "brand.primary",
    onPageChange
}: paginationControlProps) {

    const currentPage = pagination?.currentPage ?? 1;
    const totalElements = pagination?.totalElements ?? 0;
    const pageSize = pagination?.pageSize ?? 1;

    return (
        <Box display="flex" justifyContent="center" alignItems="center">
            <Pagination.Root
                count={totalElements}
                pageSize={pageSize}
                page={currentPage}
                onPageChange={(e) => onPageChange(e.page)}
            >
                <ButtonGroup size={btnSize} alignItems="center" justifyContent="center" width="full">

                      <Pagination.PrevTrigger asChild>
                        <IconButton
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.500"
                            disabled={!pagination || currentPage <= 1}
                            _hover={{ bg: "gray.100", color: "gray.700", borderColor: "gray.400" }}
                            _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                        >
                            <LuChevronLeft />
                        </IconButton>
                    </Pagination.PrevTrigger>

                    <Pagination.Items
                        render={(page) => (
                            <IconButton
                                variant="outline"
                                fontWeight={page.type === "page" ? "semibold" : "normal"}
                                bg={page.type === "page" ? { _selected: buttonColor } : "transparent"}
                                color={page.type === "page" ? { _selected: "white", base: buttonColor } : "gray.400"}
                                borderColor={page.type === "page" ? { _selected: buttonColor, base: buttonColor } : "gray.300"}
                                disabled={!pagination}
                                _hover={page.type === "page" ? { bg: buttonColor, color: "white" } : {}}
                            >
                                {page.value}
                            </IconButton>
                        )}
                    />

                    <Pagination.NextTrigger asChild>
                        <IconButton
                            variant="outline"
                            borderColor="gray.300"
                            color="gray.500"
                            disabled={!pagination || currentPage >= (pagination?.totalPages ?? 1)}
                            _hover={{ bg: "gray.100", color: "gray.700", borderColor: "gray.400" }}
                            _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
                        >
                            <LuChevronRight />
                        </IconButton>
                    </Pagination.NextTrigger>

                </ButtonGroup>
            </Pagination.Root>
        </Box>
    )
}