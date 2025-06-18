<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const token = route.query.token

if (typeof token === 'string') {
  // Save token (Pinia, cookie, etc.)
  authStore.setToken(token)
  router.replace('/dashboard')
} else {
  // Handle error or show a message
  router.replace('/auth/login?error=oauth')
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <span class="text-lg text-gray-600">Signing you in with Google...</span>
  </div>
</template>