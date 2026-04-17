import { usersApi, type UserRequest } from "@/api/users.api";
import { useQuery } from "@tanstack/react-query";

export const usersKeys = {
  users: ["users"] as const,
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: usersKeys.users,
    queryFn: usersApi.getAll,
  })
}

export const useUser = (data: UserRequest) => {
  return useQuery({
    queryKey: [...usersKeys.users, data.id],
    queryFn: () => usersApi.get(data),
  })
}