import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useQuery } from '@tanstack/react-query';

const fetchAvailableTaxis = async (token: string, route: string) => {
  const res = await api.get('/taxi-queue/available', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      currentRoute: route,
    },
  });

  return res.data;
};

export const useAvailableTaxis = (route?: string) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['availableTaxis', token, route],
    queryFn: () => fetchAvailableTaxis(token!, route!),
    enabled: !!token && !!route,
    staleTime: 5_000,
    retry: 1,
  });
};
