import { Box, Table } from "@chakra-ui/react"
import React, { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { LoadingScreen } from "./screens/loading-screen";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Text } from "@chakra-ui/react"
export interface label<T extends { id: number }> {
    labelName: string,
    propName?: keyof T
    textIfNull?: string
    isSortable?: boolean
    sortFunction?: (a: T, b: T) => number
    isComponent?: boolean
    render?: ( item: T) => React.ReactNode
}

export interface tableSelectProps<T extends { id: number }> {
    labels: label<T>[]
    data: T[]
    onSelect: (item: T | null) => void
    onDoubleClick?: (item: T) => void
    noItemsComponent?: React.ReactNode
    height?: string
    minheight?: string
    loadingMessage?: string
    loading: boolean
}

/**
 * Generic Table, works with a type T
 * labels: list of label(label name = name of the finalData in table header, prop name = the name of the object property, textIfNull: Text shown if the object finalData was null ej:
 *  obj : {name : "Peristocles"}
 *  his label should be {labelName: "Nombre", propName: "name" ,textIfNull: "Sin nombre"}
 * onSelect: do smth when the row is selected
 * onDoubleClick: do smth when you press Enter having a selected row or when you double click a row
 * noItemsComponent: Component shown when there aren't finalData to show in the table( i recommend EmptyState component from chakra ui)
 * height & minHeight : customize the table height and minHeight
 * loading message: message shown in the loading screen component
 * loading: loading state, if true, LoadingScreen is showed with the loading message
 * if you want a scroll you must pass he height arg
 * Pagination must be managed outside of this component
 * 
 */
export default function TableSelect<T extends { id: number }>(
    { labels, data, onSelect, onDoubleClick, noItemsComponent,
        height, minheight, loading, loadingMessage = "Cargando datos, espere un momento...."
    }: tableSelectProps<T>) {

    const sortIcon = {
        "Asc": ArrowUp,
        "Desc": ArrowDown
    }

    const [selected, setSelected] = React.useState<T | null>(null);
    const selectedRowRef = React.useRef<HTMLTableRowElement | null>(null);
    const [sortDirection, setSortDirection] = useState<"Asc" | "Desc">("Desc")
    const [sortHeader, setSortHeader] = useState<number | null>(null);
    const [finalData, setFinalData] = useState(data);

    const moverArriba = () => {
        if (!selected) { setSelected(finalData[0]); onSelect(finalData[0]); return; }
        const currentIndex = finalData.findIndex((s: T) => selected.id === s.id)
        if (currentIndex === -1) {
            setSelected(null);
            onSelect(null);
            return;
        }
        const newSelected = finalData[Math.max(currentIndex - 1, 0)]
        setSelected(newSelected);
        onSelect(newSelected)
    };

    const moverAbajo = () => {
        if (!selected) { if (finalData.length !== 0) { setSelected(finalData[finalData.length - 1]); onSelect(finalData[finalData.length - 1]) }; return; }
        const currentIndex = finalData.findIndex((s: T) => selected.id === s.id)
        if (currentIndex === -1) {
            setSelected(null);
            onSelect(null);
            return;
        }
        const newSelected = finalData[Math.min(currentIndex + 1, finalData.length - 1)]
        setSelected(newSelected);
        onSelect(newSelected)
    };

    useHotkeys('up', (event) => {
        event.preventDefault();
        moverArriba();
    });
    useHotkeys('down', (event) => {
        event.preventDefault();
        moverAbajo();
    });

    useHotkeys('enter', (event) => {
        event.preventDefault();
        if (!selected || !onDoubleClick) return;
        onDoubleClick(selected);
    });

    useEffect(() => {
        if (selectedRowRef.current) {
            setTimeout(() => {
                selectedRowRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 200);
        }
    }, [selected]);
    useEffect(() => {
        setFinalData(data);
    }, [data]);

    function getSorticon() {
        const Icon = sortIcon[sortDirection]
        return <Icon size="16px" />
    }
    function sortfinalData(sortFunction: ((a: T, b: T) => number)) {
        setFinalData(finalData.sort(sortFunction))
        if (sortDirection === "Desc") {
            setFinalData(finalData.reverse())
        }
    }
    return (
        <Table.ScrollArea borderWidth="1px" rounded="md" height={height || "40vh"} minHeight={minheight || "auto"} >
            <Table.Root size="sm" stickyHeader >
                <Table.Header >
                    <Table.Row bg="bg.subtle" hidden={loading}>
                        {labels && labels.map((label: label<T>, index: number) =>
                            <Table.ColumnHeader
                                key={index}
                                bgColor={sortHeader === index ? "gray.200" : ""}
                                paddingX={5}
                                textAlign="left"
                                onClick={() => {
                                    if (!label.isSortable) return;
                                    if (sortHeader === index) { setSortDirection(sortDirection === "Asc" ? "Desc" : "Asc") }
                                    else { setSortHeader(index) }
                                    if (label.sortFunction) sortfinalData(label.sortFunction)
                                }
                                }
                                _hover={{
                                    bg: "gray.100"
                                }}
                            >
                                <Box
                                    display="flex"
                                    flexDirection="row"
                                    gap={3}
                                    alignContent="center"
                                >

                                    <Text>{label.labelName}</Text>
                                    <Box width="20px" visibility={label.isSortable && sortHeader === index ? "visible" : "hidden"}>
                                        {label.isSortable && sortHeader === index && getSorticon()}
                                    </Box>
                                </Box>
                            </Table.ColumnHeader>)}
                    </Table.Row>
                </Table.Header>

                <Table.Body >
                    {loading &&
                        <Table.Row>
                            <Table.Cell
                                colSpan={labels.length}
                                height={`calc(${height} - 1vh)`}
                                border="hidden"
                                verticalAlign="middle"
                                textAlign="center"

                            >
                                <LoadingScreen message={loadingMessage} />
                            </Table.Cell>
                        </Table.Row>
                    }
                    {finalData && !loading && finalData.length > 0 && finalData.sort().map((item: T) =>
                        <Table.Row
                            key={item.id}
                            onClick={() => {
                                setTimeout(() => {
                                    if (selected && selected.id === item.id) {
                                        setSelected(null);
                                        onSelect(null)
                                    } else {
                                        setSelected(item);
                                        onSelect(item);
                                    }
                                }, 200)

                            }}
                            ref={selected?.id === item.id ? selectedRowRef : null}
                            bg={selected?.id === item.id ? "green.subtle" : "transparent"}
                            _hover={{
                                bg: selected?.id === item.id ? "green.subtle" : "gray.100"
                            }}
                            _focus={{
                                bg: "green.subtle",
                                outline: "none"
                            }}
                            cursor="pointer"
                            onDoubleClick={() => onDoubleClick && onDoubleClick(item)
                            }

                        >
                            {labels && labels.map((label: label<T>, index: number) =>
                                <Table.Cell key={index} onDoubleClick={() => onDoubleClick && onDoubleClick(item)}>
                                    {label.isComponent && label.render ?
                                        label.render(item) :
                                        String(label.propName && (item[label.propName] || label.textIfNull || "-"))
                                    }</Table.Cell>)}
                        </Table.Row>
                    )}
                    {!loading && noItemsComponent && finalData && finalData.length === 0 &&
                        <Table.Row>
                            <Table.Cell colSpan={labels.length} p={8} height="full" border="hidden">
                                {noItemsComponent}
                            </Table.Cell>
                        </Table.Row>}
                </Table.Body>
            </Table.Root>

        </Table.ScrollArea>
    )
}
