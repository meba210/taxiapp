import { create } from 'zustand';

type QueueState = {
  queuedPlates: string[];
  setQueuedPlates: (plates: string[]) => void;
  addPlate: (plate: string) => void;
  removePlate: (plate: string) => void;
  reset: () => void;
};

export const useQueueStore = create<QueueState>((set) => ({
  queuedPlates: [],

  setQueuedPlates: (plates) => set({ queuedPlates: plates }),

  addPlate: (plate) =>
    set((state) => ({
      queuedPlates: [...new Set([...state.queuedPlates, plate])],
    })),

  removePlate: (plate) =>
    set((state) => ({
      queuedPlates: state.queuedPlates.filter((p) => p !== plate),
    })),

  reset: () => set({ queuedPlates: [] }),
}));
