import { AlertDialog } from "@/components/ui/dialogs/alert-dialog";
import { ConfirmActionDialog } from "@/components/ui/dialogs/confirm-dialog";
import { DestructiveActionDialog } from "@/components/ui/dialogs/destructive-action-dialog";
import { ErrorDialog } from "@/components/ui/dialogs/error-dialog";
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
      <DestructiveActionDialog trigger={<Button mt={4}>Mostrar dialog destructivo</Button>} title="ELIMINAR A FULANO DEL SISTEMA" description="Estas a punto de eliminar a FULANO del sistema, esta acción es irreversible"/>
      <AlertDialog trigger={<Button mt={4}>Mostrar dialog de alerta</Button>} title="Este es un dialogo de alerta" description="No estas autorizado a realizar esa acción, no tienes los persmisos necesarios"/>
      <ConfirmActionDialog trigger={<Button mt={4}>Mostrar dialog de confirmación</Button>} title="Confirmar acción" description="Estas a punto de realizar esta acción, ¿deseas continuar?"/>

    </Box>
  );
};