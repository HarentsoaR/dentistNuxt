<!-- components/ui/Button/GoogleAuthButton.vue -->
<template>
  <button
    type="button"
    class="group w-full flex items-center justify-center px-4 py-3.5 border border-[#38bdf8]/30 rounded-xl text-base font-semibold text-[#0e1628] bg-white hover:bg-[#f0f9ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#38bdf8] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
    @click="onGoogleAuth"
    :aria-label="'Sign in with Google'"
  >
    <Icon name="flat-color-icons:google" class="h-5 w-5 mr-3" />
    <span>Continue with Google</span>
  </button>
</template>

<script setup lang="ts">
const GOOGLE_AUTH_URL = 'https://dentistapi-production-92f7.up.railway.app/auth/google'

function onGoogleAuth() {
  // Open in same tab for SPA, or use window.location.href for full redirect
  window.location.href = GOOGLE_AUTH_URL
}
</script>