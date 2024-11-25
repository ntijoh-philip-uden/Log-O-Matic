import { defineStore } from 'pinia';

// Define the ILog interface
export interface ILog {
  id: number;
  user_id: number;
  timestamp: Date;
}

export const useLogStore = defineStore('logStore', {
  state: () => ({
    logs: [] as ILog[], // List of logs
    error: null as string | null, // Error messages
    loading: false, // Loading state
  }),
  actions: {
    // Fetch all logs based on query parameters (like user_id, week, etc.)
    async fetchLogs(params: Record<string, string | number>) {
      this.loading = true;
      this.error = null;

      const queryString = new URLSearchParams(params as Record<string, string>).toString(); // Build the query string
      try {
        const response = await fetch(`http://localhost:9292/api/v1/log?${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Fetch the token from localStorage
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }

        const data = await response.json();
        this.logs = data.data.logs || []; // Store the logs in the state
      } catch (error: any) {
        this.error = error.message || 'An unknown error occurred'; // Safely access message
      } finally {
        this.loading = false;
      }
    },

    // Fetch log by ID
    async fetchLogById(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`http://localhost:9292/api/v1/log?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Directly use the token here
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch log by ID');
        }

        const data = await response.json();
        this.logs = [data]; // Assuming a single log is returned by ID
      } catch (error: any) {
        this.error = error.message || 'An unknown error occurred';
      } finally {
        this.loading = false;
      }
    },

    // Fetch logs for a specific week
    async fetchLogsByWeekAndUser(userId: number, week: string, year: string = new Date().getFullYear().toString()) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`http://127.0.0.1:9292/api/v1/log?user=${userId}&week=${week}&year=${year}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Fetch the token from localStorage
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch logs for the week');
        }

        const data = await response.json();
        this.logs = data.data.log || []; // Store the logs in the state
      } catch (error: any) {
        this.error = error.message || 'An unknown error occurred';
      } finally {
        this.loading = false;
      }
    },

    async fetchLogsByWeek(week: string) {
      this.loading = true;
      this.error = null;

      await fetch('http://127.0.0.1:9292/api/v1/log?week=47', {  
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiaXNzdWVkX2F0IjoiMjAyNC0xMS0yMSAwOTo0Njo0MiArMDEwMCJ9.juPSVxmmvl-0xwaT0L8v-WFdJOxccKoAwcgnXjqd1rE`, // Include the token directly here
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Log Data:', data);  // The response will be displayed here
      })
      .catch(error => console.error('Error:', error));
    },

    // Add a new log
    async addNew(logData: ILog) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('http://localhost:4567/api/v1/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include the JWT token
          },
          body: JSON.stringify(logData), // Send the new log data
        });

        if (!response.ok) {
          throw new Error('Failed to add log');
        }

        // Optionally, you can re-fetch logs to update the state
        await this.fetchLogs({ user_id: logData.user_id }); // Example: refetch logs for the user
      } catch (error: any) {
        this.error = error.message || 'An unknown error occurred';
      } finally {
        this.loading = false;
      }
    },
  },
});