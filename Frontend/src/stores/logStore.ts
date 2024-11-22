import { defineStore } from 'pinia';

export interface ILog {
  id: number;
  user_id: number;
  timestamp: Date;
}

export const useLogStore = defineStore('logStore', {
  state: () => ({
    logs: [] as ILog[],
    error: null as string | null,
    loading: false,
  }),

  actions: {
    async fetchLogsByWeek(week: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`http://localhost:9292/api/v1/log?week=${week}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }

        const data = await response.json();
        this.logs = data.data.logs || [];
      } catch (error: any) {
        this.error = error.message || 'An unknown error occurred';
      } finally {
        this.loading = false;
      }
    },

    async fetchLogsByWeekAndUser(userId: number, week: string, year: string = new Date().getFullYear().toString()) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`http://localhost:9292/api/v1/log?id=${userId}&week=${week}&year=${year}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch logs for the week');
        }

        const data = await response.json();
        this.logs = data.data.logs || [];
      } catch (error: any) {
        this.error = error.message || 'An unknown error occurred';
      } finally {
        this.loading = false;
      }
    },

    async fetchLogById(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`http://localhost:9292/api/v1/log?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch log by ID');
        }

        const data = await response.json();
        this.logs = [data];
      } catch (error: any) {
        this.error = error.message || 'An unknown error occurred';
      } finally {
        this.loading = false;
      }
    },

    async addNew(logData: ILog) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('http://localhost:4567/api/v1/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(logData),
        });

        if (!response.ok) {
          throw new Error('Failed to add log');
        }

        await this.fetchLogsByWeek('47');
      } catch (error: any) {
        this.error = error.message || 'An unknown error occurred';
      } finally {
        this.loading = false;
      }
    },
  },
});
