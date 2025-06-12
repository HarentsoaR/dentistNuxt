<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      <p class="mt-2 text-gray-600">Manage your account settings and preferences</p>
    </div>

    <!-- Settings Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Settings Navigation -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <nav class="space-y-2">
            <button
              v-for="section in settingSections"
              :key="section.id"
              @click="activeSection = section.id"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200"
              :class="activeSection === section.id 
                ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                : 'text-gray-700 hover:bg-gray-50'"
            >
              <Icon :name="section.icon" class="h-5 w-5" />
              <span class="font-medium">{{ section.name }}</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Settings Content -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <!-- Profile Settings -->
          <div v-if="activeSection === 'profile'" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900">Profile Information</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  :value="authStore.user?.fullName"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  :value="authStore.user?.email"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  :value="authStore.user?.phone"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  :value="authStore.user?.role"
                  disabled
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                />
              </div>
            </div>
            
            <button class="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 flex items-center font-medium">
              Save Changes
            </button>
          </div>

          <!-- Security Settings -->
          <div v-if="activeSection === 'security'" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900">Security Settings</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button class="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 flex items-center font-medium">
              Update Password
            </button>
          </div>

          <!-- Notifications Settings -->
          <div v-if="activeSection === 'notifications'" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 class="font-medium text-gray-900">Email Notifications</h4>
                  <p class="text-sm text-gray-600">Receive appointment reminders via email</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" checked>
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 class="font-medium text-gray-900">SMS Notifications</h4>
                  <p class="text-sm text-gray-600">Receive appointment reminders via SMS</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" checked>
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </div>
          </div>

          <!-- Preferences Settings -->
          <div v-if="activeSection === 'preferences'" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900">Preferences</h3>
            <!-- Add your preferences settings here -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { definePageMeta } from '#imports'

const authStore = useAuthStore()

const activeSection = ref('profile')

const settingSections = [
  { id: 'profile', name: 'Profile', icon: 'heroicons:user' },
  { id: 'security', name: 'Security', icon: 'heroicons:shield-check' },
  { id: 'notifications', name: 'Notifications', icon: 'heroicons:bell' },
  { id: 'preferences', name: 'Preferences', icon: 'heroicons:cog-6-tooth' }
]

definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
