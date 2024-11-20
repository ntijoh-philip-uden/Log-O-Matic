import { defineStore } from "pinia";

export interface ILog {
  id: number;
  user_id: number;
  timestamp: Date;
}

export const useStudentsStore = defineStore("Logs", {
  state: () => ({
    Logs: [
      {
        id: 0,
        user_id: 4,
        timestamp: new Date("2024-11-20T14:20:00Z"),
      },
      {
        id: 1,
        user_id: 2,
        timestamp: new Date("2024-11-15T14:20:00Z"),
      },
      {
        id: 2,
        user_id: 4,
        timestamp: new Date("2024-11-10T14:20:00Z"),
      },
      {
        id: 3,
        user_id: 1,
        timestamp: new Date("2024-11-20T14:20:00Z"),
      },
    ] as ILog[],
    nextId: 4,
  }),
  getters: {
    byId(state) {
      return (id: number): ILog | undefined => {
        return state.Logs.find((log) => log.id === id);
      };
    },
    byUserId(state) {
      return (user_id: number): ILog[] => {
        return state.Logs.filter((log) => log.user_id === user_id);
      };
    },
    byWeekNumber() {
      return (timestamp: Date): number => {
        // Clone the date and set it to UTC to ensure consistent calculation
        const d: Date = new Date(Date.UTC(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate()));

        // Shift the date to the nearest Thursday (ISO weeks start on Monday)
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

        // Calculate the start of the year
        const startOfYear: Date = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

        // Calculate the week number
        const weekNumber = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + 1) / 7);

        return weekNumber;
      };
    },
  },
  actions: {
    async addNew(user_id: number, timestamp: Date) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Replace this with actual async operation
      this.Logs.push({
        id: this.nextId++,
        user_id: user_id,
        timestamp: timestamp,
      });
    },
  },
});
