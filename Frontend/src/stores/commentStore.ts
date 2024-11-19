import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";
import { API_BASE_URL } from "config";

const authStore = useAuthStore();

export interface IComment {
  id: number;
  logId: number;
  userId: number;
  comment: string;
}

export const useCommentStore = defineStore("comments", {
  state: () => ({
    loadedComments: [] as IComment[],
    error: null as string | null,
  }),

  getters: {
    getCommentsByLogId: (state) => (logId: number) =>
      state.loadedComments.filter((comment) => comment.logId === logId),
  },

  actions: {
    async fetchWithAuth(url: string, options: RequestInit = {}) {
      const token = authStore.token;
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return response.json();
    },
    async loadComments(logId: number) {
      try {
        const data = await this.fetchWithAuth(
          `${API_BASE_URL}/api/v1/comments?logId=${logId}`
        );

        const newComments = data as IComment[];
        newComments.forEach((comment) => {
          if (!this.loadedComments.some((c) => c.id === comment.id)) {
            this.loadedComments.push(comment);
          }
        });
      } catch (err: any) {
        this.error = err.message || "An error occurred";
      }
    },
    async getUnreadCommentCount(logId: number) {
      try {
        const data = await this.fetchWithAuth(
          `${API_BASE_URL}/api/v1/comments/unread/count?logId=${logId}`
        );
        return data.count;
      } catch (err: any) {
        this.error = err.message || "An error occurred";
      }
    },
    async addComment(logId: number, comment: string) {
      try {
        await this.fetchWithAuth(`${API_BASE_URL}/api/v1/comments`, {
          method: "POST",
          body: JSON.stringify({ logId, comment }),
        });
        await this.loadComments(logId);
      } catch (err: any) {
        this.error = err.message || "An error occurred";
      }
    },
    async markCommentAsRead(commentId: number) {
      try {
        await this.fetchWithAuth(`${API_BASE_URL}/api/v1/comments/read`, {
          method: "POST",
          body: JSON.stringify({ commentId }),
        });
      } catch (err: any) {
        this.error = err.message || "An error occurred";
      }
    },
    async markCommentsAsReadByLogId(logId: number) {
      try {
        await this.fetchWithAuth(`${API_BASE_URL}/api/v1/comments/read/all`, {
          method: "POST",
          body: JSON.stringify({ logId }),
        });
      } catch (err: any) {
        this.error = err.message || "An error occurred";
      }
    },
  },
});
