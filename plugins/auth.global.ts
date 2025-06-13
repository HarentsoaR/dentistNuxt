export default defineNuxtPlugin((nuxtApp) => {
  // Add the auth middleware to all routes
  nuxtApp.vueApp.use((app) => {
    app.mixin({
      beforeRouteEnter(to, from, next) {
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

        next()
      }
    })
  })
})