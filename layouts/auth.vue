<template>
  <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex flex-col relative overflow-hidden">
    <!-- Page Transition Overlay -->
    <Transition
      enter-active-class="transition-all duration-1000 ease-in-out"
      enter-from-class="opacity-0 scale-110"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-1000 ease-in-out"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-90"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50 z-0"></div>
    </Transition>

    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-teal-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/20 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse" style="animation-delay: 4s;"></div>
    </div>

    <!-- Main content area - centered with dynamic width -->
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

    <!-- Footer - always at bottom -->
    <footer class="relative text-center py-6 text-sm text-gray-500 z-10">
      <p>&copy; 2024 DentaCare Pro. All rights reserved.</p>
    </footer>

    <!-- Notifications -->
    <NotificationToast />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { provide } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationStore } from '~/stores/notification'
import NotificationToast from '~/components/NotificationToast.vue'

const route = useRoute()
const notificationStore = useNotificationStore()
const showForm = ref(false)
const headerSection = ref(null)
const formSection = ref(null)
let isScrolling = false

// Show welcome notification when coming from logout
onMounted(() => {
  if (route.query.from === 'logout') {
    notificationStore.success(
      'Déconnexion réussie',
      'Vous avez été déconnecté avec succès. Veuillez vous reconnecter pour continuer.',
      5000
    )
  }
})

// Provide the toggle function to child components
const toggleForm = async () => {
  if (!showForm.value) {
    showForm.value = true
    await nextTick()
    // Smooth scroll to form after it appears
    setTimeout(() => {
      if (formSection.value) {
        formSection.value.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }, 100)
  } else {
    // Scroll back to header before hiding form
    if (headerSection.value) {
      headerSection.value.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }
    setTimeout(() => {
      showForm.value = false
    }, 300)
  }
}

const handleScroll = () => {
  if (isScrolling) return
  
  const scrollY = window.scrollY
  const windowHeight = window.innerHeight
  
  // If we scroll up significantly and form is shown, hide it
  if (showForm.value && scrollY < windowHeight * 0.1) {
    isScrolling = true
    showForm.value = false
    
    // Scroll to top smoothly
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    })
    
    setTimeout(() => {
      isScrolling = false
    }, 1000)
  }
}

provide('toggleForm', toggleForm)
provide('showForm', showForm)

const getContainerClass = () => {
  const currentPath = route.path
  
  if (currentPath === '/auth/register') {
    // Large container for register page with 2-column layout
    return 'max-w-7xl'
  } else if (currentPath === '/auth/login') {
    // Smaller container for login page
    return 'max-w-sm'
  } else {
    // Default size for other auth pages
    return 'max-w-md'
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse 8s ease-in-out infinite;
}
</style>
