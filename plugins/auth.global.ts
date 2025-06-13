export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()

  // Initialize auth state when the app starts
  await authStore.initializeAuth()

  // Add the auth middleware to all routes
  nuxtApp.vueApp.use((app) => {
    app.mixin({
      async beforeRouteEnter(to, from, next) {
        // Get the auth_token cookie
        const authToken = useCookie('auth_token').value

        // Check for root route
        if (to.path === '/') {
          // If no auth_token cookie or it's empty, redirect to login
          if (!authToken || authToken === '') {
            console.log('No auth token found, redirecting to login')
            return next('/auth/login')
          }
        }

        // Ensure user data is loaded before proceeding
        if (authToken && !authStore.user) {
          await authStore.initializeAuth()
        }

        next()
      }
    })
  })
})