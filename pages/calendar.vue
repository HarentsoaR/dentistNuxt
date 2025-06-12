<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Calendar</h1>
        <p class="mt-2 text-gray-600">View and manage your appointments in calendar format</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center">
          <Icon name="heroicons:arrow-left" class="h-4 w-4 mr-2" />
          Previous
        </button>
        <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center">
          Today
        </button>
        <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center">
          <Icon name="heroicons:arrow-right" class="h-4 w-4 ml-2" />
          Next
        </button>
      </div>
    </div>

    <!-- Calendar View -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <!-- Calendar Header -->
      <div class="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-white">December 2024</h2>
          <div class="flex items-center gap-2">
            <button class="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
              <Icon name="heroicons:chevron-left" class="h-5 w-5" />
            </button>
            <button class="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
              <Icon name="heroicons:chevron-right" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="p-6">
        <!-- Days of Week -->
        <div class="grid grid-cols-7 gap-1 mb-4">
          <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" 
               class="p-3 text-center text-sm font-semibold text-gray-600">
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-1">
          <div v-for="day in calendarDays" :key="day.date" 
               class="min-h-24 p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200"
               :class="{
                 'bg-gray-50 text-gray-400': !day.isCurrentMonth,
                 'bg-teal-50 border-teal-200': day.isToday,
                 'bg-blue-50 border-blue-200': day.hasAppointments
               }">
            <div class="text-sm font-medium mb-1" :class="{ 'text-teal-600': day.isToday }">
              {{ day.day }}
            </div>
            <div v-if="day.hasAppointments" class="space-y-1">
              <div class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate">
                10:00 AM - Checkup
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Appointments -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Upcoming This Week</h3>
      <div class="space-y-3">
        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:calendar-days" class="h-6 w-6 text-blue-600" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">Annual Checkup</p>
            <p class="text-sm text-gray-600">Tomorrow, 10:00 AM - 11:00 AM</p>
          </div>
          <button class="text-teal-600 hover:text-teal-700 font-medium text-sm">
            View Details
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'default'
})

// Generate calendar days (simplified example)
const calendarDays = computed(() => {
  const days = []
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  // Generate 42 days (6 weeks)
  for (let i = 1; i <= 31; i++) {
    days.push({
      day: i,
      date: `${currentYear}-${currentMonth + 1}-${i}`,
      isCurrentMonth: true,
      isToday: i === today.getDate(),
      hasAppointments: i === 15 || i === 22 // Example appointments
    })
  }
  
  return days
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
