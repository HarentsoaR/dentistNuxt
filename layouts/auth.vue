<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden custom-gradient-bg">
    <!-- Removed SVG tools overlay -->
    <!-- Tooltip for feedback (if needed) -->
    <transition name="fade">
      <div
        v-if="tooltip"
        class="fixed left-1/2 top-24 transform -translate-x-1/2 bg-white/90 text-blue-900 px-4 py-2 rounded shadow-lg z-20 text-sm font-medium"
        style="pointer-events:none;"
      >
        {{ tooltip }}
      </div>
    </transition>

    <!-- Main content area -->
    <div class="flex-1 flex items-center justify-center px-4 py-12">
      <Transition
        enter-active-class="transition-all duration-1000 ease-out"
        enter-from-class="opacity-0 transform translate-y-8 scale-95"
        enter-to-class="opacity-100 transform translate-y-0 scale-100"
        leave-active-class="transition-all duration-500 ease-in"
        leave-from-class="opacity-100 transform translate-y-0 scale-100"
        leave-to-class="opacity-0 transform -translate-y-8 scale-95"
      >
        <div class="relative w-full mx-auto z-10" :class="getContainerClass()">
          <slot />
        </div>
      </Transition>
    </div>

    <!-- Footer -->
    <footer class="relative text-center py-6 text-sm text-gray-500 z-10">
      <p>&copy; 2025 HarentsoaR DentaCare Pro. All rights reserved.</p>
    </footer>

    <!-- Notifications -->
    <NotificationToast />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { provide } from 'vue'
import { useRoute } from 'vue-router'
import NotificationToast from '~/components/NotificationToast.vue'

const route = useRoute()
const showForm = ref(false)
const activeBg = ref(null)
const tooltip = ref('')

function onBgClick(item) {
  // No SVG tool logic needed
}

provide('toggleForm', () => {})
provide('showForm', showForm)

const getContainerClass = () => {
  const currentPath = route.path
  if (currentPath === '/auth/register') {
    return 'max-w-7xl'
  } else if (currentPath === '/auth/login') {
    return 'max-w-sm'
  } else {
    return 'max-w-md'
  }
}
</script>

<style scoped>
.custom-gradient-bg {
  background: linear-gradient(135deg,
    #FFFFFF 0%,
    #EFE2CE 25%,
    #D5ECEB 50%,
    #E4E4E4 75%,
    #F6FFFF 100%
  );
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
