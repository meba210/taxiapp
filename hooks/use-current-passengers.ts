import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useQuery } from '@tanstack/react-query';

const fetchCurrentPassengers = async (token: string) => {
  const res = await api.get('/passengerqueue/current', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data.count;
};

export const useCurrentPassengers = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['currentPassengers', token],
    queryFn: () => fetchCurrentPassengers(token!),
    enabled: !!token,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
};
