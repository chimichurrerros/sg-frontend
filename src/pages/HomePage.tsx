import { useMe, useLogout } from "@/queries/auth.queries";
import { useAuthStore }     from "@/stores/auth.store";
import { Heading, Box} from "@chakra-ui/react";
import { Link }             from "react-router-dom";

export const HomePage = () => {
  const { data: user, isLoading } = useMe();
  const isAdmin  = useAuthStore((s) => s.isAdmin);

  if (isLoading) return <p>Loading…</p>;

  return (
    <Box>
      <Heading size="lg">Bienvenido, {user?.name} {user?.lastName}</Heading>
      {/* <p>{user?.email} — {user?.roleName}</p> */}
      {isAdmin && <Link to="/register">Register new user</Link>}
    </Box>
  );
};