export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Initialize auth state
  authStore.initializeAuth()

  const publicPaths = ['/auth/login', '/auth/register']

  // If the path is not found (404), let it pass through to [...slug].vue
  if (to.matched.length === 0) {
    return
  }

  // Check if user is authenticated
  // Redirect to login only if not authenticated AND not on a public path
  if (!authStore.isLoggedIn && !publicPaths.includes(to.path)) {
    return navigateTo('/auth/login')
  }

  // If user is authenticated and tries to access auth pages, redirect to home
  if (authStore.isLoggedIn && publicPaths.includes(to.path)) {
    return navigateTo('/')
  }
})