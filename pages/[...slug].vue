<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
    <div class="text-center px-4">
      <div class="mb-8">
        <Icon name="twemoji:tooth" class="h-20 w-20 mx-auto text-teal-500" />
      </div>
      <h1 class="text-4xl font-bold text-gray-800 mb-4">{{ t('page.error.title') }}</h1>
      <p class="text-gray-600 mb-8 max-w-md mx-auto">
        {{ t('page.error.message') }}
      </p>
      <div class="space-y-4">
        <button 
          @click="handleDashboardClick"
          class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          <Icon name="heroicons:home" class="h-5 w-5 mr-2" />
          {{ t('page.error.returnToDashboard') }}
        </button>
        <div class="text-sm text-gray-500">
          {{ t('page.error.needHelp') }} <NuxtLink to="/contact" class="text-teal-600 hover:text-teal-500">{{ t('page.error.contactSupport') }}</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useI18n } from 'vue-i18n';

definePageMeta({
  layout: 'auth'
})

const { t } = useI18n();
const authStore = useAuthStore()
const router = useRouter()

async function handleDashboardClick() {
  // Ensure user data is loaded before navigation
  await authStore.initializeAuth()
  router.push('/')
}
</script>