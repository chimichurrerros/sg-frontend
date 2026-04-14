import { ErrorDialog } from "@/components/ui/screens/error-dialog";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { useMe } from "@/queries/auth.queries";
import { useAuthStore }     from "@/stores/auth.store";
import { Heading, Box,Button} from "@chakra-ui/react";
import { Link }             from "react-router-dom";

export const HomePage = () => {
  const { data: user, isLoading } = useMe();
  const isAdmin  = useAuthStore((s) => s.isAdmin);
  if (isLoading) return <LoadingScreen message="Cargando HomePage, espere un momento por favor..."/>;

  return (
    <Box>
      <Heading size="lg">Bienvenido, {user?.name} {user?.lastName}</Heading>
      {/* <p>{user?.email} — {user?.roleName}</p> */}
      {isAdmin && <Link to="/register">Register new user</Link>}
      <ErrorDialog trigger={<Button mt={4}>Mostrar error</Button>}  />
    </Box>
  );
};``