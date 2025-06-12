// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon'
  ],
  // Optional: Add a global app configuration
  app: {
    head: {
      title: 'DentalCare Appointments',
      meta: [
        { name: 'description', content: 'Modern Dental Appointment System' }
      ]
    }
  }
})