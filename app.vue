<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { onErrorCaptured } from 'vue'

// Global error handling
const handleError = (error) => {
  console.error('Global error:', error)
}

// Set up global error handler
onErrorCaptured(handleError)
</script>
