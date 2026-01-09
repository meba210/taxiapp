import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type CreateTaxiPayload = {
  DriversName: string;
  PhoneNo: string;
  LicenceNo: string;
  PlateNo: string;
  route: string;
};

const createTaxi = async (token: string, payload: CreateTaxiPayload) => {
  await api.post('/taxis', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const useCreateTaxi = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaxiPayload) => createTaxi(token!, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxiQueue'] });
      queryClient.invalidateQueries({ queryKey: ['availableTaxis'] });
      queryClient.invalidateQueries({ queryKey: ['currentPassengers'] });
    },
  });
};
