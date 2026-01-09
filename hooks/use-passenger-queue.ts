import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const submitPassengerCount = async (
  token: string,
  waitingCount: number
) => {
  const res = await api.post(
    '/passengerqueue',
    { waiting_count: waitingCount },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data; // { id, action }
};

export const usePassengerQueue = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (waitingCount: number) =>
      submitPassengerCount(token!, waitingCount),

    onSuccess: () => {
      // refresh related data if needed
      queryClient.invalidateQueries({ queryKey: ['passengerQueue'] });
      queryClient.invalidateQueries({ queryKey: ['currentPassengers'] });
    },
  });
};
