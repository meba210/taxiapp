import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useQuery } from '@tanstack/react-query';

const fetchAssignedRoute = async (token: string) => {
  const res = await api.get('/dispacher-route', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.route;
};

export const useAssignedRoute = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['assignedRoute', token],
    queryFn: () => fetchAssignedRoute(token!),
    enabled: !!token,
    staleTime: 60_000,
    retry: 1,
  });
};
