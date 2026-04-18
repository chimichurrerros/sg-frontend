import { Table } from "@chakra-ui/react"
import React, { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { LoadingScreen } from "./screens/loading-screen";

export interface label<T extends { id: number }> {
    labelName: string,
    propName: keyof T
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
 * labels: list of label(label name = name of the data in table header, prop name = the name of the object property ej:
 *  obj : {name : "Peristocles"}
 *  his label should be {labelName: "Nombre", propName: "name"}
 * onSelect: do smth when the row is selected
 * onDoubleClick: do smth when you press Enter having a selected row or when you double click a row
 * noItemsComponent: Component shown when there aren't data to show in the table( i recommend EmptyState component from chakra ui)
 * height & minHeight : customize the table height and minHeight
 * loading message: message shown in the loading screen component
 * loading: loading state, if true, LoadingScreen is showed with the loading message
 * 
 * Pagination must be managed outside of this component
 */
export default function TableSelect<T extends { id: number }>({ labels, data, onSelect, onDoubleClick, noItemsComponent, height, minheight, loading, loadingMessage = "Cargando datos, espere un momento...." }: tableSelectProps<T>) {

    const [selected, setSelected] = React.useState<T | null>(null);
    const selectedRowRef = React.useRef<HTMLTableRowElement | null>(null);

    const moverArriba = () => {
        if (!selected) { setSelected(data[0]); onSelect(data[0]); return; }
        const currentIndex =data.findIndex((s: T) => selected.id === s.id)
        if (currentIndex === -1) {
            setSelected(null);
            onSelect(null);
            return;
        }
        const newSelected = data[Math.max( currentIndex- 1, 0)]
        setSelected(newSelected);
        onSelect(newSelected)
    };

    const moverAbajo = () => {
        if (!selected) { if (data.length !== 0) { setSelected(data[data.length - 1]); onSelect(data[data.length - 1]) }; return; }
        const currentIndex = data.findIndex((s: T) => selected.id === s.id)
        if (currentIndex === -1) {
            setSelected(null);
            onSelect(null);
            return;
        }
        const newSelected = data[Math.min(currentIndex + 1, data.length - 1)]
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
            selectedRowRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [selected]);

    return (
        <Table.ScrollArea borderWidth="1px" rounded="md" height={height || "fit-content"} minHeight={minheight || "auto"}>

            <Table.Root size="sm" stickyHeader>
                <Table.Header>
                    <Table.Row bg="bg.subtle">
                        {labels && labels.map((label: label<T>, index: number) => <Table.ColumnHeader key={index}>{label.labelName}</Table.ColumnHeader>)}
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {loading &&
                        <Table.Row>
                            <Table.Cell colSpan={labels.length} p={8} >
                                <LoadingScreen message={loadingMessage} height="50%" />
                            </Table.Cell>
                        </Table.Row>}
                    {data && !loading && data.length > 0 && data.map((item: T) =>
                        <Table.Row
                            key={item.id}
                            onClick={() => { if (selected && selected.id === item.id) { setSelected(null); onSelect(null); } else { setSelected(item); onSelect(item); } }}
                            bgColor={selected && selected.id === item.id ? "green.subtle" : "transparent"}
                            ref={selected?.id === item.id ? selectedRowRef : null}
                            onDoubleClick={() => onDoubleClick && onDoubleClick(item)}
                        >
                            {labels && labels.map((label: label<T>, index: number) => <Table.Cell key={index}>{String(item[label.propName])}</Table.Cell>)}
                        </Table.Row>
                    )}
                    {!loading && noItemsComponent && data && data.length === 0 &&
                        <Table.Row>
                            <Table.Cell colSpan={labels.length} p={8} height="full">
                                {noItemsComponent}
                            </Table.Cell>
                        </Table.Row>}
                </Table.Body>
            </Table.Root>

        </Table.ScrollArea>
    )
}
