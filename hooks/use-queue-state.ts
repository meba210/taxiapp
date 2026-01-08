import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useQuery } from '@tanstack/react-query';

const fetchQueueState = async (token: string, route: string) => {
  const res = await api.get(`/taxi-queue?route=${encodeURIComponent(route)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.map((t: any) => String(t.PlateNo));
};

export const useQueueState = (route?: string) => {
  const { token } = useAuth();

  return useQuery<number[]>({
    queryKey: ['taxiQueueState', token, route],
    queryFn: () => fetchQueueState(token!, route!),
    enabled: !!token && !!route,
    staleTime: 3_000,
    retry: 1,
  });
};
