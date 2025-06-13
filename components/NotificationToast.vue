<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] space-y-4">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-x-full opacity-0"
        enter-to-class="transform translate-x-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-x-0 opacity-100"
        leave-to-class="transform translate-x-full opacity-0"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="relative flex items-center w-full max-w-sm p-4 rounded-xl shadow-lg border"
          :class="{
            'bg-emerald-50 border-emerald-200': notification.type === 'success',
            'bg-red-50 border-red-200': notification.type === 'error',
            'bg-blue-50 border-blue-200': notification.type === 'info',
            'bg-amber-50 border-amber-200': notification.type === 'warning'
          }"
        >
          <!-- Icon -->
          <div 
            class="flex-shrink-0 mr-3"
            :class="{
              'text-emerald-500': notification.type === 'success',
              'text-red-500': notification.type === 'error',
              'text-blue-500': notification.type === 'info',
              'text-amber-500': notification.type === 'warning'
            }"
          >
            <Icon :name="notification.icon || 'heroicons:information-circle'" class="h-6 w-6" />
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h3 
              class="text-sm font-semibold mb-1"
              :class="{
                'text-emerald-800': notification.type === 'success',
                'text-red-800': notification.type === 'error',
                'text-blue-800': notification.type === 'info',
                'text-amber-800': notification.type === 'warning'
              }"
            >
              {{ notification.title }}
            </h3>
            <p 
              class="text-sm"
              :class="{
                'text-emerald-700': notification.type === 'success',
                'text-red-700': notification.type === 'error',
                'text-blue-700': notification.type === 'info',
                'text-amber-700': notification.type === 'warning'
              }"
            >
              {{ notification.message }}
            </p>
          </div>

          <!-- Close Button -->
          <button
            @click="notificationStore.remove(notification.id)"
            class="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>

          <!-- Progress Bar -->
          <div 
            v-if="notification.duration && notification.duration > 0"
            class="absolute bottom-0 left-0 h-1 rounded-b-xl transition-all duration-100"
            :class="{
              'bg-emerald-500': notification.type === 'success',
              'bg-red-500': notification.type === 'error',
              'bg-blue-500': notification.type === 'info',
              'bg-amber-500': notification.type === 'warning'
            }"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '~/stores/notification'

const notificationStore = useNotificationStore()
const notifications = computed(() => notificationStore.notifications)
const progress = ref(100)

let interval: NodeJS.Timeout

onMounted(() => {
  interval = setInterval(() => {
    progress.value = Math.max(0, progress.value - 1)
  }, 50)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script> 