export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // Initialize auth state
  authStore.initializeAuth()
  
  // Check if user is authenticated
  if (!authStore.isLoggedIn) {
    return navigateTo('/auth/login')
  }
})