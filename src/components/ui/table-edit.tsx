import { Table, Input, Text, HStack, Box, Flex } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip"
import React, { useState, useEffect, useRef } from "react";
import { LoadingScreen } from "./screens/loading-screen";
import { getSorticon } from "./table-select";
import EmptyDataScreen from "./screens/empty-data-screen";
import { BeanOff, PackageOpenIcon } from "lucide-react";

/**
 * validate => validate function when you press intro to modify a field
 * transform => you get the data as string with this function you transform the data type
 * render => customize how the data looks when you are not editing
 * onDataChange => to get the modified data from the table
 * onEdit => callback function used when a field has just been modified (useful if one field depends on another).
 */
export interface EditableLabel<T extends { id: number }> {
    labelName: string;
    propName?: keyof T;
    textIfNull?: string;
    isEditable?: boolean;
    onEdit?: (item: T, newValue: T[keyof T]) => T
    inputType?: "text" | "number" | "email" | "date";
    validate?: (value: any, item?: T) => boolean;
    transform?: (value: any) => any;
    formatFunction?: (value: any) => string;
    render?: (item: T) => React.ReactNode;
    isComponent?: boolean
    isSortable?: boolean;
    sortFunction?: (a: T, b: T) => number;
}

export interface TableEditableProps<T extends { id: number }> {
    labels: EditableLabel<T>[];
    data: T[];
    onDataChange: (newData: T[]) => void;
    noItemsComponent?: React.ReactNode;
    height?: string;
    minHeight?: string;
    loadingMessage?: string;
    loading?: boolean;
    readOnly?: boolean;
    maxHeight?: string;
    width?: string;
    onRowClick?: (item: T) => void;
    selectedId?: number;
}

export default function TableEditable<T extends { id: number }>({
    labels,
    data,
    onDataChange,
    noItemsComponent,
    height,
    minHeight = "auto",
    loadingMessage = "Cargando datos...",
    loading = false,
    readOnly = false,
    maxHeight,
    width,
    onRowClick,
    selectedId
}: TableEditableProps<T>) {
    const [editingCell, setEditingCell] = useState<{ rowId: number; propName: string } | null>(null);
    const [editValue, setEditValue] = useState<any>("");
    const [isValid, setIsValid] = useState(true);
    const [sortHeader, setSortHeader] = useState<number | null>(null);
    const [sortDirection, setSortDirection] = useState<"Asc" | "Desc">("Asc");
    const [finalData, setFinalData] = useState<T[]>(data);

    useEffect(() => {
        setFinalData(data);
    }, [data]);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingCell && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingCell]);

    const startEditing = (item: T, propName: string, currentValue: any) => {
        const label = labels.find(l => l.propName === propName);
        if (!label?.isEditable) return;

        setEditingCell({ rowId: item.id, propName });
        setEditValue(currentValue ?? "");
        setIsValid(true);
    };

    const validateValue = (value: any, label: EditableLabel<T>, item?: T): boolean => {
        if (label.validate) {
            return label.validate(value, item);
        }
        return true;
    };

    const saveEdit = (item?: T) => {
    
        if (!editingCell) return;

        const label = labels.find(l => l.propName === editingCell.propName);
        if (!label) return;

        let newValue: any = editValue;

        if (label.transform) {
            newValue = label.transform(newValue);
        }

        if (!validateValue(newValue, label, item)) {
            setIsValid(false);
            setEditingCell(null)
            return;
        }

        const newData = finalData.map(item => {
            if (item.id === editingCell.rowId) {
                if (label.onEdit) return label.onEdit(item, newValue);
                return { ...item, [editingCell.propName]: newValue };
            }
            return item;
        });
        onDataChange(newData);
        setEditingCell(null);
        setEditValue("");
        setIsValid(true);
    };

    const cancelEdit = () => {
        setEditingCell(null);
        setEditValue("");
        setIsValid(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (editingCell) saveEdit(finalData.find(item => item.id === editingCell.rowId));
        } else if (e.key === "Escape") {
            e.preventDefault();
            cancelEdit();
        }
    };

    const handleValueChange = (newValue: string, label: EditableLabel<T>, item: T) => {
        setEditValue(newValue);

        let valueToValidate: any = newValue;
        if (label.transform) {
            valueToValidate = label.transform(newValue);
        }
        setIsValid(validateValue(valueToValidate, label, item));
    };

    const renderCellContent = (item: T, label: EditableLabel<T>) => {
        if (label.isComponent && label.render) return label.render(item)
        if (!label.propName) return;
        const isEditing = editingCell?.rowId === item.id && editingCell?.propName === label.propName;
        const value = item[label.propName];
        const displayValue = value ?? label.textIfNull ?? "-";
        if (isEditing && !readOnly) {
            return (
                <Box
                    position="relative"
                    w="full"
                    h="full"
                    display="flex"
                    alignItems="center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => handleValueChange(e.target.value, label, item)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => saveEdit(finalData.find(item => item.id === editingCell.rowId))}
                        type={label.inputType || "text"}
                        px={0}
                        py={0}
                        variant="flushed"
                        height="28px"
                        width={`clamp(60px, ${String(item[label.propName]).length + 2}ch, 200px)`} border="1px"
                        color={!isValid ? "red" : ""}
                        disabled={readOnly}
                    />
                </Box>
            );
        }
        const finalVal = displayValue === null || displayValue === undefined  || displayValue === "" ? label.textIfNull : String(displayValue)
        return (
            <HStack
                justify="space-between"
                w="full"
                onClick={(e) => {
                    if (label.isEditable) {
                        e.stopPropagation();
                        startEditing(item, String(label.propName), value);
                    }
                }}
                cursor={label.isEditable ? "pointer" : "default"}
                minH="28px"
            >
                <Text fontSize="sm">{label.formatFunction ? label.formatFunction(finalVal) : finalVal}</Text>

            </HStack>
        );
    };

    const sortData = (sortFunction: (a: T, b: T) => number) => {
        const sortedData = [...finalData].sort((a, b) => {
            const result = sortFunction(a, b);
            return sortDirection === "Asc" ? result : -result;
        });
        setFinalData(sortedData);
    };

    if (loading) {
        return (
            <Box 
                borderWidth="1px" 
                rounded="md" 
                height={height || "100%"} 
                minHeight={minHeight} 
                maxHeight={maxHeight || "60vh"} 
                width="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <LoadingScreen message={loadingMessage} />
            </Box>
        );
    }

    if (!loading && finalData.length === 0) {
        return (
            <Box 
                borderWidth="1px" 
                rounded="md" 
                height={height || "100%"} 
                minHeight={minHeight} 
                maxHeight={maxHeight || "60vh"} 
                width="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                {noItemsComponent ? noItemsComponent : (
                    <EmptyDataScreen
                        title={"Sin productos"}
                        icon={<PackageOpenIcon />}
                        message={"Selecciona una venta para agregar productos a devolver"}
                    />
                )}
            </Box>
        );
    }

    return (
        <Table.ScrollArea borderWidth="1px" rounded="md" tableLayout="fixed" height={height || "100%"} minHeight={minHeight} maxHeight={maxHeight || "60vh"} width={width || "100%"}>
            <Table.Root size="sm" stickyHeader>
                <Table.Header>
                    <Table.Row bg="bg.subtle" userSelect="none">
                        {labels.map((label, index) => (
                            <Table.ColumnHeader key={index} paddingX={5} textAlign="left"
                                _hover={{
                                    bg: label.isSortable ? "gray.100" : "transparent",
                                }}
                                onClick={() => {
                                    if (label.isSortable) {
                                        if (sortHeader === index) { { setSortDirection(sortDirection === "Asc" ? "Desc" : "Asc") } }
                                        else { setSortHeader(index) }
                                        if (label.sortFunction) sortData(label.sortFunction)
                                    }
                                }}>
                                <Box
                                    display="flex"
                                    flexDirection="row"
                                    gap={3}
                                    alignContent="center"
                                >
                                    <Text fontWeight="bold">{label.labelName}</Text>
                                    {label.isEditable && <Text fontSize="sm" color="brand.secondary">*</Text>}
                                    <Box width="16px" visibility={label.isSortable && sortHeader === index ? "visible" : "hidden"}>
                                        {label.isSortable && sortHeader === index && getSorticon(sortDirection)}
                                    </Box>
                                </Box>
                            </Table.ColumnHeader>
                        ))}
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {finalData.map((item) => (
                        <Table.Row
                            key={item.id}
                            _hover={{ bg: "gray.50" }}
                            bg={selectedId === item.id ? "green.subtle" : "transparent"}
                            cursor={onRowClick ? "pointer" : "default"}
                            onClick={() => onRowClick?.(item)}
                            minH="40px"
                            h="40px"
                        >
                            {labels.map((label, idx) => (
                                <Table.Cell
                                    key={idx}
                                    paddingY={1}
                                    paddingX={5}
                                    height="40px"
                                    verticalAlign="middle"
                                >
                                    <Tooltip showArrow={true} content={label.propName && label.labelName + ":" + String(item[label.propName])} disabled={!label.propName || !item[label.propName]}>
                                        <Box w="full" h="full">
                                            {renderCellContent(item, label)}
                                        </Box>
                                    </Tooltip>
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Table.ScrollArea>
    );
}