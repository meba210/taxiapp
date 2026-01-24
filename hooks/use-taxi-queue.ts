import api from '@/api/axios';
import { useAuth } from '@/auth/auth-context';
import { useQuery } from '@tanstack/react-query';

type Taxi = {
  PlateNo: string;
  [key: string]: any;
};

const fetchTaxiQueue = async (token: string, route: string) => {
  const queueRes = await api.get('/taxi-queue', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const queue: Taxi[] = queueRes.data;

  const queuedPlates = queue.map((taxi) => taxi.PlateNo);

  const assignedRes = await api.get(
    `/assignTaxis/assigned?route=${encodeURIComponent(route)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const assignedList = assignedRes.data.filter((a: any) =>
    queuedPlates.includes(a.PlateNo)
  );

  return queue.map((taxi) => {
    const assignedRecord = assignedList.find(
      (a: any) => a.PlateNo === taxi.PlateNo
    );

    return {
      ...taxi,
      assigned: assignedRecord?.from_route === route,
      to_route: assignedRecord?.to_route ?? null,
    };
  });
};

// export const useTaxiQueue = (route?: string) => {
//   const { token } = useAuth();

//   return useQuery({
//     queryKey: ['taxiQueue', token, route],
//     queryFn: () => fetchTaxiQueue(token!, route!),
//     enabled: !!token && !!route,
//     staleTime: 5_000,
//     retry: 1,
//   });
// };

export const useTaxiQueue = (route?: string) => {
  const { token } = useAuth();

  return useQuery<Taxi[]>({
    queryKey: ['taxiQueue', route],
    queryFn: () => fetchTaxiQueue(token!, route!),
    enabled: !!token && !!route,

    // 🔥 REFRESH AUTOMATICALLY
    refetchInterval: 3000,

    // 🔥 PREVENT UI BLINK
    placeholderData: (previousData) => previousData,

    // 🔥 DO NOT SHOW LOADING ON REFRESH
    refetchOnWindowFocus: false,

    retry: 1,
  });
};
