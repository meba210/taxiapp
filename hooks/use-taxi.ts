import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useQuery } from '@tanstack/react-query';

const fetchTaxi = async (token: string, plateNo: number) => {
  const res = await api.get(`/assignTaxis/fetch-taxi/${plateNo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const useTaxi = (plateNo?: number) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['taxi', token, plateNo],
    queryFn: () => fetchTaxi(token!, plateNo!),
    enabled: token !== undefined && plateNo !== undefined,
    staleTime: 0,
    retry: 1,
  });
};
