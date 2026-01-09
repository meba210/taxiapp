type Taxi = { PlateNo: string };

let queue: Taxi[] = [];

export const getQueue = (): Taxi[] => queue;

export const addTaxi = (taxi: Taxi) => {
  queue.push(taxi);
};

export const clearQueue = () => {
  queue = [];
};
