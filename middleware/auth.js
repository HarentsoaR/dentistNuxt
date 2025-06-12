export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Initialize auth state
  authStore.initializeAuth()

  const publicPaths = ['/auth/login', '/auth/register']

  // Check if user is authenticated
  // Redirect to login only if not authenticated AND not on a public path
  if (!authStore.isLoggedIn && !publicPaths.includes(to.path)) {
    return navigateTo('/auth/login')
  }
})