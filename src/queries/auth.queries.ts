import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, type LoginRequest, type RegisterRequest } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";

export const authKeys = {
  me: ["auth", "me"] as const,
};

/**
 * useMe — calls GET /api/profile (cookie is sent automatically)
 * Runs when the user object exists in the store.
 * This is what populates the dashboard on hard refresh.
 */
export const useMe = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: authKeys.me,
    queryFn:  async () => {
      const wrapper = await authApi.me();
      return wrapper.user;           // unwrap so consumers get UserDto directly
    },
    enabled:   !!user,               // only fetch if we think we're logged in
    staleTime: 1000 * 60 * 5,
  });
};

export const useLogin = () => {
  const setAuth     = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (wrapper) => {
      setAuth(wrapper.user);         // unwrap UserWrapperDto → UserDto
      queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
  });
};

export const useLogout = () => {
  const clearAuth   = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
};