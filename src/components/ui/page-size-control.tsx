import type { PaginationParams } from "@/types/types";
import { NumberInput } from "@chakra-ui/react"


interface pageSizeControlParams { 
    defaultValue?:string;
    paramsChangeFunction:(params:PaginationParams)=>void;
    params:PaginationParams;
    max:number;
    min:number;
}

export default function PageSizeControl({defaultValue = "10",paramsChangeFunction, max=30,min=5,params}:pageSizeControlParams){

    return <NumberInput.Root defaultValue={defaultValue} width="70px" max={max} min={min} 
                        onValueCommit={(value) => {
                            if(value.valueAsNumber < 5 || value.valueAsNumber >30) return;
                            paramsChangeFunction({...params,pageSize:value.valueAsNumber})
                            }}>
                            <NumberInput.Control />
                            <NumberInput.Input />
                        </NumberInput.Root>
}