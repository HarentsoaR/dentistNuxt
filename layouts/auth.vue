<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden">
    <!-- Dynamic Gradient Background -->
    <div
      class="fixed inset-0 -z-10 pointer-events-none"
      :style="gradientStyle"
    ></div>

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
      <p>&copy; 2025 HarentsoaR DentaCare Pro. All rights reserved.</p>
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

// --- Dynamic Gradient State ---
const mouseX = ref(0.5)
const mouseY = ref(0.3)
const gradientStyle = computed(() => {
  // Restore to original large, immersive radial gradient
  const x = (mouseX.value * 100).toFixed(1)
  const y = (mouseY.value * 100).toFixed(1)
  return {
    background: `radial-gradient(circle at ${x}% ${y}%, #00dc82 0%, #38bdf8 40%, #0e1628 80%, #090a1a 100%)`,
    transition: 'background 0.3s cubic-bezier(0.4,0,0.2,1)',
    width: '100vw',
    height: '100vh',
  }
})

function handleMouseMove(e) {
  const w = window.innerWidth
  const h = window.innerHeight
  mouseX.value = e.clientX / w
  mouseY.value = e.clientY / h
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  // Show welcome notification when coming from logout
  if (route.query.from === 'logout') {
    notificationStore.success(
      'Déconnexion réussie',
      'Vous avez été déconnecté avec succès. Veuillez vous reconnecter pour continuer.',
      5000
    )
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('scroll', handleScroll)
})
// --- End Dynamic Gradient ---

// Provide the toggle function to child components
const toggleForm = async () => {
  if (!showForm.value) {
    showForm.value = true
    await nextTick()
    setTimeout(() => {
      if (formSection.value) {
        formSection.value.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }, 100)
  } else {
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
  if (showForm.value && scrollY < windowHeight * 0.1) {
    isScrolling = true
    showForm.value = false
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
    return 'max-w-7xl'
  } else if (currentPath === '/auth/login') {
    return 'max-w-sm'
  } else {
    return 'max-w-md'
  }
}
</script>

<style scoped>
/* No more background blobs or pulse animation */
</style>
