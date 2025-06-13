export default defineNuxtRouteMiddleware((to) => {
  // Get the auth_token cookie
  const authToken = useCookie('auth_token').value

  // If accessing root path and no auth token, redirect to login
  if (to.path === '/') {
    if (!authToken || authToken === '') {
      console.log('No auth token found, redirecting to login')
      return navigateTo('/auth/login')
    }
  }
}) 