import { useRegister } from "@/queries/auth.queries";
import { useAuthStore } from "@/stores/auth.store";
import { Navigate } from "react-router-dom";

export const RegisterPage = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const { mutate: register, isPending } = useRegister();

  // Double-check even if the link is hidden
  if (!isAdmin) return <Navigate to="/dash" replace />;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    register({
      name: fd.get("name") as string,
      lastName: fd.get("lastName") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" />
      <input name="lastName" placeholder="Last Name" />
      <input name="email" type="email" placeholder="Email" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit" disabled={isPending}>
        Register
      </button>
    </form>
  );
};
