export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  // Initialize auth state when the page loads/reloads
  await authStore.initializeAuth()

  // Add event listener for page visibility changes
  if (process.client) {
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        // Re-initialize auth when page becomes visible again
        await authStore.initializeAuth()
      }
    })
  }
})
