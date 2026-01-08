import { useAuth } from '@/auth/auth-context';
import { useQuery } from '@tanstack/react-query';

import api from '@/api/axios';

export const fetchTaxiByPlate = async (token: string, plateNo: number) => {
  const res = await api.get(`/taxis/plate/${plateNo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const useTaxiByPlate = (plateNo?: number) => {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['taxiByPlate', plateNo],
    queryFn: async () => {
      return fetchTaxiByPlate(token!, plateNo!);
    },
    enabled: !!plateNo,
    // enabled: plateNo !== null && plateNo !== undefined,
  });
};
