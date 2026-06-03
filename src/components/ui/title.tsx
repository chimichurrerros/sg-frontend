import {Text} from "@chakra-ui/react"
interface props{
    children:React.ReactNode;
}
export default function PageTitle({children}:props) {
    
    return <Text fontWeight="bold" fontSize="3xl">{children}</Text>

}