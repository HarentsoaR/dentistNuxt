<template>
  <div>
    <transition name="fade-loader" appear>
      <CustomLoading v-if="showLoader" />
    </transition>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CustomLoading from '~/components/loader/PageLoading.vue'

const showLoader = ref(false)
const router = useRouter()
let minTimer = null
let navDone = false
let minTimeDone = false

function shouldShowLoader(to, from) {
  // Show loader only for login/logout transitions
  if (to.path === '/auth/login' ||
      to.query.from === 'logout' ||
      to.query.registered === 'true' ||
      from.path === '/auth/login' ||
      from.query.from === 'logout' ||
      from.query.registered === 'true') {
    return true
  }
  return false
}

function startLoader() {
  showLoader.value = true
  navDone = false
  minTimeDone = false
  if (minTimer) clearTimeout(minTimer)
  minTimer = setTimeout(() => {
    minTimeDone = true
    maybeHideLoader()
  }, 3000) // 3s to match progress bar
}

function maybeHideLoader() {
  if (navDone && minTimeDone) {
    showLoader.value = false
  }
}

router.beforeEach((to, from, next) => {
  if (shouldShowLoader(to, from)) {
    startLoader()
  }
  next()
})
router.afterEach((to, from) => {
  if (shouldShowLoader(to, from)) {
    navDone = true
    maybeHideLoader()
  }
})

import { onErrorCaptured } from 'vue'

// Global error handling
const handleError = (error) => {
  console.error('Global error:', error)
}

// Set up global error handler
onErrorCaptured(handleError)
</script>

<style>
.fade-loader-enter-active, .fade-loader-leave-active {
  transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1);
}
.fade-loader-enter-from, .fade-loader-leave-to {
  opacity: 0;
}
.fade-loader-enter-to, .fade-loader-leave-from {
  opacity: 1;
}
</style>
