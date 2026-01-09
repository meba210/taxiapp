import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type AddToQueuePayload = {
  PlateNo: number;
  route: string;
};

const addTaxiToQueue = async (token: string, payload: AddToQueuePayload) => {
  await api.post('/taxi-queue', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const useAddToQueue = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddToQueuePayload) => addTaxiToQueue(token!, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['assignedTaxis', token, variables.route],
      });

      queryClient.invalidateQueries({
        queryKey: ['taxis', token, variables.route],
      });

      queryClient.invalidateQueries({
        queryKey: ['taxiQueue', token, variables.route],
      });

      queryClient.invalidateQueries({
        queryKey: ['availableTaxis', token, variables.route],
      });
    },
  });
};
