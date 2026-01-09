import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useQuery } from '@tanstack/react-query';

const fetchTaxis = async (token: string, route: string) => {
  const res = await api.get(`/taxis?route=${encodeURIComponent(route)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const useTaxis = (route?: string) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['taxis', token, route],
    queryFn: () => fetchTaxis(token!, route!),
    enabled: !!token && !!route,
    staleTime: 10_000,
    retry: 1,
  });
};
