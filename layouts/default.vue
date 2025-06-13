<template>
  <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
    <!-- Logout Confirmation Dialog -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-500 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showLogoutConfirm"
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center"
          @click.self="showLogoutConfirm = false"
        >
          <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 transform">
            <div class="text-center">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Icon name="heroicons:arrow-right-on-rectangle" class="h-6 w-6 text-red-600" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p class="text-sm text-gray-500 mb-6">Are you sure you want to log out? You'll need to sign in again to access your account.</p>
              <div class="flex gap-3 justify-center">
                <button
                  @click="showLogoutConfirm = false"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  @click="confirmLogout"
                  class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Mobile Menu Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen && isMobile"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="sidebarOpen || !isMobile"
        class="fixed top-0 left-0 z-50 h-full bg-white/95 backdrop-blur-md shadow-2xl border-r border-white/20 lg:translate-x-0 transition-all duration-300 ease-in-out"
        :class="[
          { 'translate-x-0': sidebarOpen, '-translate-x-full': !sidebarOpen && isMobile },
          isMobile ? 'w-72' : (sidebarCollapsed ? 'w-20' : 'w-72')
        ]"
      >
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200/50" :class="{ 'px-4': sidebarCollapsed && !isMobile }">
          <NuxtLink to="/" class="flex items-center gap-3 group" @click="closeMobileSidebar" :class="{ 'justify-center': sidebarCollapsed && !isMobile }">
            <div class="relative">
              <div class="absolute inset-0 bg-teal-200 rounded-full animate-pulse opacity-30"></div>
              <div class="relative bg-gradient-to-r from-teal-600 to-cyan-600 p-2 rounded-full">
                <Icon name="twemoji:tooth" class="h-8 w-8" />
              </div>
            </div>
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div v-if="!sidebarCollapsed || isMobile">
                <h1 class="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  DentaCare Pro
                </h1>
                <p class="text-xs text-gray-500 font-medium">Dental Management</p>
              </div>
            </Transition>
          </NuxtLink>
          
          <!-- Toggle and Close buttons -->
          <div class="flex items-center gap-2">
            <!-- Sidebar Toggle (Desktop only) -->
            <button
              v-if="!isMobile"
              @click="toggleSidebar"
              class="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
              :title="sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
            >
              <Icon 
                :name="sidebarCollapsed ? 'heroicons:chevron-right' : 'heroicons:chevron-left'" 
                class="h-5 w-5 text-gray-500 group-hover:text-teal-600 transition-colors duration-200" 
              />
            </button>
            
            <!-- Close button for mobile -->
            <button
              v-if="isMobile"
              @click="sidebarOpen = false"
              class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Icon name="heroicons:x-mark" class="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 py-6 space-y-2" :class="sidebarCollapsed && !isMobile ? 'px-2' : 'px-4'">
          <div class="space-y-1">
            <!-- Dashboard -->
            <NuxtLink
              to="/"
              @click="closeMobileSidebar"
              class="flex items-center rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 transition-all duration-200 relative overflow-hidden group"
              :class="[
                $route.path === '/' ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 shadow-sm' : '',
                sidebarCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-3 gap-3'
              ]"
              :title="sidebarCollapsed && !isMobile ? 'Dashboard' : ''"
            >
              <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/50 group-hover:bg-white/80 transition-all duration-200"
                   :class="$route.path === '/' ? 'bg-white shadow-sm' : ''">
                <Icon name="heroicons:home" class="h-5 w-5" />
              </div>
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <span v-if="!sidebarCollapsed || isMobile" class="font-medium">Dashboard</span>
              </Transition>
              <div class="absolute right-2 w-2 h-2 bg-teal-500 rounded-full opacity-0 scale-0 transition-all duration-200"
                   :class="[$route.path === '/' ? 'opacity-100 scale-100' : '', sidebarCollapsed && !isMobile ? 'right-1' : '']"></div>
            </NuxtLink>

            <!-- Appointments -->
            <div class="space-y-1">
              <NuxtLink
                to="/appointments/my"
                @click="closeMobileSidebar"
                class="flex items-center rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 transition-all duration-200 relative overflow-hidden group"
                :class="[
                  $route.path.startsWith('/appointments') ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 shadow-sm' : '',
                  sidebarCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-3 gap-3'
                ]"
                :title="sidebarCollapsed && !isMobile ? 'Appointments' : ''"
              >
                <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/50 group-hover:bg-white/80 transition-all duration-200"
                     :class="$route.path.startsWith('/appointments') ? 'bg-white shadow-sm' : ''">
                  <Icon name="heroicons:calendar-days" class="h-5 w-5" />
                </div>
                <Transition
                  enter-active-class="transition-all duration-300 ease-out"
                  enter-from-class="opacity-0 scale-95"
                  enter-to-class="opacity-100 scale-100"
                  leave-active-class="transition-all duration-200 ease-in"
                  leave-from-class="opacity-100 scale-100"
                  leave-to-class="opacity-0 scale-95"
                >
                  <span v-if="!sidebarCollapsed || isMobile" class="font-medium">Appointments</span>
                </Transition>
                <div class="absolute right-2 w-2 h-2 bg-teal-500 rounded-full opacity-0 scale-0 transition-all duration-200"
                     :class="[$route.path.startsWith('/appointments') ? 'opacity-100 scale-100' : '', sidebarCollapsed && !isMobile ? 'right-1' : '']"></div>
              </NuxtLink>
              
              <!-- Appointment Sub-menu (only show when not collapsed) -->
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-40"
                leave-active-class="transition-all duration-300 ease-in"
                leave-from-class="opacity-100 max-h-40"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-if="$route.path.startsWith('/appointments') && (!sidebarCollapsed || isMobile)" class="ml-6 space-y-1 overflow-hidden">
                  <NuxtLink
                    to="/appointments/my"
                    @click="closeMobileSidebar"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                    :class="$route.path === '/appointments/my' ? 'bg-teal-50 text-teal-700' : ''"
                  >
                    <Icon name="heroicons:eye" class="h-4 w-4" />
                    <span>My Appointments</span>
                  </NuxtLink>
                  <NuxtLink
                    to="/appointments/new"
                    @click="closeMobileSidebar"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                    :class="$route.path === '/appointments/new' ? 'bg-teal-50 text-teal-700' : ''"
                  >
                    <Icon name="heroicons:plus" class="h-4 w-4" />
                    <span>Book New</span>
                  </NuxtLink>
                </div>
              </Transition>
            </div>

            <!-- Calendar -->
            <NuxtLink
              to="/calendar"
              @click="closeMobileSidebar"
              class="flex items-center rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 transition-all duration-200 relative overflow-hidden group"
              :class="[
                $route.path === '/calendar' ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 shadow-sm' : '',
                sidebarCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-3 gap-3'
              ]"
              :title="sidebarCollapsed && !isMobile ? 'Calendar' : ''"
            >
              <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/50 group-hover:bg-white/80 transition-all duration-200"
                   :class="$route.path === '/calendar' ? 'bg-white shadow-sm' : ''">
                <Icon name="heroicons:calendar" class="h-5 w-5" />
              </div>
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <span v-if="!sidebarCollapsed || isMobile" class="font-medium">Calendar</span>
              </Transition>
              <div class="absolute right-2 w-2 h-2 bg-teal-500 rounded-full opacity-0 scale-0 transition-all duration-200"
                   :class="[$route.path === '/calendar' ? 'opacity-100 scale-100' : '', sidebarCollapsed && !isMobile ? 'right-1' : '']"></div>
            </NuxtLink>

            <!-- Patients (for staff) -->
            <NuxtLink
              v-if="authStore.user?.role === 'dentist' || authStore.user?.role === 'staff'"
              to="/patients"
              @click="closeMobileSidebar"
              class="flex items-center rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 transition-all duration-200 relative overflow-hidden group"
              :class="[
                $route.path === '/patients' ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 shadow-sm' : '',
                sidebarCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-3 gap-3'
              ]"
              :title="sidebarCollapsed && !isMobile ? 'Patients' : ''"
            >
              <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/50 group-hover:bg-white/80 transition-all duration-200"
                   :class="$route.path === '/patients' ? 'bg-white shadow-sm' : ''">
                <Icon name="heroicons:user-group" class="h-5 w-5" />
              </div>
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <span v-if="!sidebarCollapsed || isMobile" class="font-medium">Patients</span>
              </Transition>
              <div class="absolute right-2 w-2 h-2 bg-teal-500 rounded-full opacity-0 scale-0 transition-all duration-200"
                   :class="[$route.path === '/patients' ? 'opacity-100 scale-100' : '', sidebarCollapsed && !isMobile ? 'right-1' : '']"></div>
            </NuxtLink>

            <!-- Reports (for staff) -->
            <NuxtLink
              v-if="authStore.user?.role === 'dentist' || authStore.user?.role === 'staff'"
              to="/reports"
              @click="closeMobileSidebar"
              class="flex items-center rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 transition-all duration-200 relative overflow-hidden group"
              :class="[
                $route.path === '/reports' ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 shadow-sm' : '',
                sidebarCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-3 gap-3'
              ]"
              :title="sidebarCollapsed && !isMobile ? 'Reports' : ''"
            >
              <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/50 group-hover:bg-white/80 transition-all duration-200"
                   :class="$route.path === '/reports' ? 'bg-white shadow-sm' : ''">
                <Icon name="heroicons:chart-bar" class="h-5 w-5" />
              </div>
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <span v-if="!sidebarCollapsed || isMobile" class="font-medium">Reports</span>
              </Transition>
              <div class="absolute right-2 w-2 h-2 bg-teal-500 rounded-full opacity-0 scale-0 transition-all duration-200"
                   :class="[$route.path === '/reports' ? 'opacity-100 scale-100' : '', sidebarCollapsed && !isMobile ? 'right-1' : '']"></div>
            </NuxtLink>

            <!-- Settings -->
            <NuxtLink
              to="/settings"
              @click="closeMobileSidebar"
              class="flex items-center rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 hover:text-teal-700 transition-all duration-200 relative overflow-hidden group"
              :class="[
                $route.path === '/settings' ? 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 shadow-sm' : '',
                sidebarCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-3 gap-3'
              ]"
              :title="sidebarCollapsed && !isMobile ? 'Settings' : ''"
            >
              <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-white/50 group-hover:bg-white/80 transition-all duration-200"
                   :class="$route.path === '/settings' ? 'bg-white shadow-sm' : ''">
                <Icon name="heroicons:cog-6-tooth" class="h-5 w-5" />
              </div>
              <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <span v-if="!sidebarCollapsed || isMobile" class="font-medium">Settings</span>
              </Transition>
              <div class="absolute right-2 w-2 h-2 bg-teal-500 rounded-full opacity-0 scale-0 transition-all duration-200"
                   :class="[$route.path === '/settings' ? 'opacity-100 scale-100' : '', sidebarCollapsed && !isMobile ? 'right-1' : '']"></div>
            </NuxtLink>
          </div>
        </nav>

        <!-- User Profile Section -->
        <div class="border-t border-gray-200/50" :class="sidebarCollapsed && !isMobile ? 'p-2' : 'p-4'">
          <div class="flex items-center rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 transition-all duration-300"
               :class="[
                 sidebarCollapsed && !isMobile ? 'p-2 justify-center' : 'p-3 gap-3'
               ]">
            <div class="w-10 h-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                 :title="sidebarCollapsed && !isMobile ? authStore.user?.fullName : ''">
              {{ getUserInitials() }}
            </div>
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div v-if="!sidebarCollapsed || isMobile" class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ authStore.user?.fullName }}</p>
                <p class="text-xs text-gray-500 capitalize">{{ authStore.user?.role || 'User' }}</p>
              </div>
            </Transition>
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <button
                v-if="!sidebarCollapsed || isMobile"
                @click="handleLogout"
                class="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                title="Logout"
              >
                <Icon name="heroicons:arrow-right-on-rectangle" class="h-5 w-5" />
              </button>
            </Transition>
          </div>
        </div>
      </aside>
    </Transition>

    <!-- Main Content Area -->
    <div class="transition-all duration-300 ease-in-out min-h-screen" :class="isMobile ? '' : (sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72')">
      <!-- Top Header Bar -->
      <header class="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-30">
        <div class="px-4 py-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <!-- Mobile Menu Button -->
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <Icon name="heroicons:bars-3" class="h-6 w-6 text-gray-600" />
            </button>

            <!-- Page Title -->
            <div class="flex-1 lg:flex-none">
              <h1 class="text-xl font-semibold text-gray-900 capitalize">
                {{ getPageTitle() }}
              </h1>
              <p class="text-sm text-gray-500">{{ getPageSubtitle() }}</p>
            </div>

            <!-- Header Actions -->
            <div class="flex items-center gap-4">
              <!-- Notifications -->
              <button class="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <Icon name="heroicons:bell" class="h-6 w-6" />
                <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <!-- Theme Toggle -->
              <button class="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                <Icon name="heroicons:sun" class="h-6 w-6" />
              </button>

              <!-- User Avatar (Desktop) -->
              <!-- <div class="hidden lg:flex items-center gap-3">
                <div class="text-right">
                  <p class="text-sm font-semibold text-gray-900">{{ authStore.user?.fullName }}</p>
                  <p class="text-xs text-gray-500 capitalize">{{ authStore.user?.role || 'User' }}</p>
                </div>
                <div class="w-10 h-10 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {{ getUserInitials() }}
                </div>
              </div> -->
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content with Transitions -->
      <main class="relative">
        <Transition
          enter-active-class="transition-all duration-500 ease-out"
          enter-from-class="opacity-0 transform translate-y-8"
          enter-to-class="opacity-100 transform translate-y-0"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="opacity-100 transform translate-y-0"
          leave-to-class="opacity-0 transform -translate-y-4"
          mode="out-in"
        >
          <div class="p-4 sm:p-6 lg:p-8">
            <slot />
          </div>
        </Transition>
      </main>
      <Chatbot />
    </div>

    <!-- Notifications -->
    <NotificationToast />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRoute, navigateTo, useRouter } from '#app'
import Chatbot from '~/components/ChatBot.vue'
import NotificationToast from '~/components/NotificationToast.vue'
import { useNotificationStore } from '~/stores/notification'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()

// Sidebar state
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const isMobile = ref(false)
const showLogoutConfirm = ref(false)
const isLoggingOut = ref(false)

// User methods
const getUserInitials = () => {
  if (!authStore.user?.fullName) return 'U'
  const names = authStore.user.fullName.split(' ')
  return names.length >= 2
    ? `${names[0][0]}${names[1][0]}`.toUpperCase()
    : names[0][0].toUpperCase()
}

const handleLogout = () => {
  showLogoutConfirm.value = true
}

const confirmLogout = async () => {
  try {
    isLoggingOut.value = true
    showLogoutConfirm.value = false
    
    // Add a delay to show the transition
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Perform logout
    await authStore.logout()
    
    // Add another delay before navigation
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Navigate to login page with transition parameter
    await router.push({
      path: '/auth/login',
      query: { from: 'logout' }
    })
  } catch (error) {
    console.error('Logout error:', error)
    notificationStore.error(
      'Logout Failed',
      'There was an error logging out. Please try again.',
      5000
    )
  } finally {
    isLoggingOut.value = false
  }
}

// Sidebar methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  // Store preference in localStorage
  if (process.client) {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
  }
}

// Page title helpers
const getPageTitle = () => {
  const path = route.path
  if (path === '/') return 'Dashboard'
  if (path.startsWith('/appointments')) return 'Appointments'
  if (path === '/calendar') return 'Calendar'
  if (path === '/patients') return 'Patients'
  if (path === '/reports') return 'Reports'
  if (path === '/settings') return 'Settings'
  return 'DentaCare Pro'
}

const getPageSubtitle = () => {
  const path = route.path
  if (path === '/') return 'Overview of your dental care management'
  if (path === '/appointments/my') return 'Manage your appointments'
  if (path === '/appointments/new') return 'Schedule a new appointment'
  if (path === '/calendar') return 'View your schedule'
  if (path === '/patients') return 'Manage patient records'
  if (path === '/reports') return 'Analytics and insights'
  if (path === '/settings') return 'Account and preferences'
  return 'Professional dental care management'
}

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

// Close mobile sidebar
const closeMobileSidebar = () => {
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Restore sidebar collapsed state from localStorage
  if (process.client) {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      sidebarCollapsed.value = savedState === 'true'
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
</style>