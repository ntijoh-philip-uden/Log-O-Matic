import { defineStore } from "pinia";
import { API_BASE_URL } from "../../config";
import { useAuthStore } from "./authStore";

const authStore = useAuthStore();

export interface IFetchData {
  data: IInnerFetchData;
}

export interface IInnerFetchData {
  logs: IPreLog[];
  answers: IAnswer[];
  questions: IQuestion[];
  comments: IComment[];
  readcomments: IReadComment[];
}

export interface IPreLog {
  id: number;
  user_id: number;
  timestamp: string;
}

export interface ILog {
  id: number;
  user_id: number;
  timestamp: Date;
}

export interface IAnswer {
  id: number;
  log_id: number;
  question_id: number;
  answer: string;
}

export interface IQuestion {
  id: number;
  question: string;
}

export interface IComment {
  id: number;
  log_id: number;
  user_id: number;
  comment: string;
}

export interface IReadComment {
  id: number;
  user_id: number;
  comment_id: number;
}

export const useLogStore = defineStore("logStore", {
  state: () => ({
    logs: [] as ILog[],
    answers: [] as IAnswer[],
    questions: [] as IQuestion[],
    comments: [] as IComment[],
    readComments: [] as IReadComment[],
    error: null as string | null,
    loading: false,
  }),

  getters: {
    commentsByLogId(state) {
      return (id: number): IComment[] => {
        return state.comments.filter((comment) => comment.log_id === id);
      };
    },
    userHasUnreadComment(state) {
      return (userId: number, logId: number): boolean => {
        const logComments = state.comments.filter(
          (comment) => comment.log_id === logId
        );
        const userReadComments = state.readComments.filter(
          (readComment) => readComment.user_id === userId
        );
        return logComments.some(
          (comment) =>
            !userReadComments.some(
              (readComment) => comment.id === readComment.comment_id
            )
        );
      };
    },
    getLogById(state) {
      return (id: number): ILog | undefined => {
        return state.logs.find((log) => log.id === id);
      };
    },
    getLogsByWeek(state) {
      return (week: string): ILog[] => {
        return state.logs.filter(
          (log) =>
            new Date(log.timestamp).toISOString().slice(0, 10).split("-")[1] ===
            week
        );
      };
    },
    getLogsByDate(state) {
      return (date: string): ILog[] => {
        return state.logs.filter(
          (log) => new Date(log.timestamp).toISOString().split("T")[0] === date
        );
      };
    },
    getLogsByStudentId(state) {
      return (studentId: number): ILog[] => {
        return state.logs.filter((log) => log.user_id === studentId);
      };
    },
    getLogsByStudentIdAndWeek(state) {
      return (studentId: number, week: string): ILog[] => {
        return state.logs.filter(
          (log) =>
            log.user_id === studentId &&
            new Date(log.timestamp).toISOString().slice(0, 10).split("-")[1] ===
              week
        );
      };
    },
    getLogsByStudentIdWeekAndDay(state) {
      return (studentId: number, week: string, day: string): ILog[] => {
        return state.logs.filter((log) => {
          const logDate = new Date(log.timestamp);
          const logWeek = logDate.toISOString().slice(0, 10).split("-")[1];
          const logDay = logDate.getDay().toString(); // Converts day (0-6) to string
          return (
            log.user_id === studentId && logWeek === week && logDay === day
          );
        });
      };
      //console.log("This is the logs ", this.logs)
    },
    getQuestionsByLogId(state) {
      return (logId: number): IQuestion[] => {
        const logAnswers = state.answers.filter(
          (answer) => answer.log_id === logId
        );
        return state.questions.filter((question) =>
          logAnswers.some((answer) => answer.question_id === question.id)
        );
      };
    },
    getAnswersByLogId(state) {
      return (logId: number): IAnswer[] => {
        return state.answers.filter((answer) => answer.log_id === logId);
      };
    },
    getAnswersByQuestionId(state) {
      return (questionId: number): IAnswer[] => {
        return state.answers.filter(
          (answer) => answer.question_id === questionId
        );
      };
    },
  },

  actions: {
    pushData(data: IInnerFetchData) {
      const newLogs = (data.logs || []).map((log) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));

      this.logs = [
        ...this.logs.filter(
          (log) => !newLogs.some((newLog) => newLog.id === log.id)
        ),
        ...newLogs,
      ];

      const newAnswers = data.answers || [];
      this.answers = [
        ...this.answers.filter(
          (answer) =>
            !newAnswers.some((newAnswer) => newAnswer.id === answer.id)
        ),
        ...newAnswers,
      ];

      const newQuestions = data.questions || [];
      this.questions = [
        ...this.questions.filter(
          (question) =>
            !newQuestions.some((newQuestion) => newQuestion.id === question.id)
        ),
        ...newQuestions,
      ];

      const newComments = data.comments || [];
      this.comments = [
        ...this.comments.filter(
          (comment) =>
            !newComments.some((newComment) => newComment.id === comment.id)
        ),
        ...newComments,
      ];

      const newReadComments = data.readcomments || [];
      this.readComments = [
        ...this.readComments.filter(
          (readComment) =>
            !newReadComments.some(
              (newReadComment) => newReadComment.id === readComment.id
            )
        ),
        ...newReadComments,
      ];
    },

    async fetchLogsByWeek(week: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/log?week=${week}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }

        const data = (await response.json()) as IFetchData;
        console.log("This is the log from store, here is data: ", data.data)
        this.pushData(data.data);
      } catch (error: any) {
        this.error = error.message || "An unknown error occurred";
      } finally {
        this.loading = false;
      }
    },

    async fetchLogsByWeekAndUser(
      userId: number,
      week: string,
      year: string = new Date().getFullYear().toString()
    ) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/log?user=${userId}&week=${week}&year=${year}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch logs for the week");
        }

        const data = (await response.json()) as IFetchData;
        //console.log("this is data", data) // debugging log 
        this.pushData(data.data);
      } catch (error: any) {
        this.error = error.message || "An unknown error occurred";
      } finally {
        this.loading = false;
      }
    },

    async fetchLogsByWeekDayAndUser(
      userId: number,
      week: string,
      weekDay: string,
      year: string = new Date().getFullYear().toString()
    ) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/log?user=${userId}&week=${week}&weekDay=${weekDay}&year=${year}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch logs for the week");
        }

        const data = (await response.json()) as IFetchData;
        this.pushData(data.data);
      } catch (error: any) {
        this.error = error.message || "An unknown error occurred";
      } finally {
        this.loading = false;
      }
    },

    async fetchLogById(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/log?id=${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch log by ID");
        }

        const data = await response.json();
        console.log("This is the data of the log fetched by id: ", data)
        this.logs = [data];
      } catch (error: any) {
        this.error = error.message || "An unknown error occurred";
      } finally {
        this.loading = false;
      }
    },

    async addNew(logData: ILog) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/log/new`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore.token}`,
          },
          body: JSON.stringify(logData),
        });

        if (!response.ok) {
          throw new Error("Failed to add log");
        }

        await this.fetchLogsByWeek("47");
      } catch (error: any) {
        this.error = error.message || "An unknown error occurred";
      } finally {
        this.loading = false;
      }
    },
  },
});
