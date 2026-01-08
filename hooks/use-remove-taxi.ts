import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useQueueStore } from '@/store/queue-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useRemoveTaxi = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const removePlate = useQueueStore((s) => s.removePlate);

  return useMutation({
    mutationFn: async (plateNo: string) => {
      await api.delete(`/taxi-queue/${plateNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await api.delete(`/assignTaxis/${plateNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignedTaxis'] });
      queryClient.invalidateQueries({ queryKey: ['availableTaxis'] });
    },

    onMutate: async (plateNo) => {
      removePlate(plateNo.toString());
    },

    onError: (_err, plateNo) => {
      useQueueStore.getState().addPlate(plateNo.toString());
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['taxiQueue'] });
      queryClient.invalidateQueries({ queryKey: ['taxis'] });
    },
  });
};
