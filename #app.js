export const defineNuxtRouteMiddleware = () => {}
export const useAuthStore = () => {}
export const navigateTo = () => {}
export const useRuntimeConfig = () => {
  return {
    public: {
      apiBase: process.env.API_BASE_URL || "http://localhost:8080",
    },
  }
}
