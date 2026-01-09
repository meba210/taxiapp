import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useQuery } from '@tanstack/react-query';

const fetchAssignedTaxis = async (token: string, route: string) => {
  const res = await api.get(
    `/assignTaxis/assignedTaxis?route=${encodeURIComponent(route)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const useAssignedTaxis = (route?: string) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['assignedTaxis', token, route],
    queryFn: () => fetchAssignedTaxis(token!, route!),
    enabled: !!token && !!route,
    staleTime: 10_000,
    retry: 1,
  });
};
