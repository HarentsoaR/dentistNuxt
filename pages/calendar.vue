<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Calendar</h1>
        <p class="mt-2 text-gray-600">View and manage your appointments in calendar format</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="previousMonth" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center">
          <Icon name="heroicons:arrow-left" class="h-4 w-4 mr-2" />
          Previous
        </button>
        <button @click="goToToday" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center">
          Today
        </button>
        <button @click="nextMonth" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center">
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
          <h2 class="text-xl font-semibold text-white">{{ currentMonthYear }}</h2>
          <div class="flex items-center gap-2">
            <button @click="previousMonth" class="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
              <Icon name="heroicons:chevron-left" class="h-5 w-5" />
            </button>
            <button @click="nextMonth" class="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
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
               @click="selectDay(day)"
               class="min-h-24 p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
               :class="{
                 'bg-gray-50 text-gray-400': !day.isCurrentMonth,
                 'bg-teal-50 border-teal-200': day.isToday,
                 'bg-blue-50 border-blue-200': day.hasAppointments,
                 'ring-2 ring-teal-500': selectedDate === day.date
               }">
            <div class="text-sm font-medium mb-1" :class="{ 'text-teal-600': day.isToday }">
              {{ day.day }}
            </div>
            <div v-if="day.appointments?.length" class="space-y-1">
              <div v-for="apt in day.appointments.slice(0, 3)" :key="apt.id"
                   class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate hover:bg-blue-200 transition-colors"
                   @click.stop="showAppointmentDetails(apt)">
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ formatTime(apt.startTime) }}</span>
                  <span class="ml-2 text-blue-600">{{ apt.service }}</span>
                </div>
              </div>
              <div v-if="day.appointments.length > 3" 
                   class="text-xs text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                   @click.stop="scrollToDayAppointments(day)">
                <div class="flex items-center justify-between">
                  <span>+{{ day.appointments.length - 3 }} more appointments</span>
                  <Icon name="heroicons:chevron-right" class="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Day Appointments -->
    <div v-if="selectedDate" 
         ref="appointmentsListRef"
         class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Appointments for {{ formatSelectedDate }}
      </h3>
      <div v-if="selectedDayAppointments.length === 0" class="text-center py-8 text-gray-500">
        No appointments scheduled for this day
      </div>
      <div v-else class="space-y-3">
        <div v-for="apt in sortedDayAppointments" :key="apt.id"
             class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
             @click="showAppointmentDetails(apt)">
          <div class="w-16 h-16 bg-blue-100 rounded-xl flex flex-col items-center justify-center">
            <span class="text-sm font-medium text-blue-600">{{ formatTime(apt.startTime) }}</span>
            <span class="text-xs text-blue-500">{{ formatTime(apt.endTime) }}</span>
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{{ apt.service }}</p>
            <p class="text-sm text-gray-600">{{ apt.patientName }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span :class="getStatusClasses(apt.status)" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ apt.status }}
            </span>
            <Icon name="heroicons:chevron-right" class="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Details Modal -->
    <div v-if="selectedAppointment" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
         @click.self="closeAppointmentDetails">
      <div class="bg-white rounded-2xl p-6 max-w-lg w-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">{{ selectedAppointment.service }}</h3>
          <button @click="closeAppointmentDetails" class="text-gray-400 hover:text-gray-600">
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:calendar-days" class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Date & Time</p>
              <p class="font-medium text-gray-900">
                {{ formatDate(selectedAppointment.startTime) }}
              </p>
              <p class="text-sm text-gray-600">
                {{ formatTime(selectedAppointment.startTime) }} - {{ formatTime(selectedAppointment.endTime) }}
                <span class="text-gray-500">({{ formatDuration(selectedAppointment.startTime, selectedAppointment.endTime) }})</span>
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:user" class="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Patient</p>
              <p class="font-medium text-gray-900">{{ selectedAppointment.patientName }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:tag" class="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <span :class="getStatusClasses(selectedAppointment.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                {{ selectedAppointment.status }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex gap-3">
          <button @click="closeAppointmentDetails"
                  class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Close
          </button>
          <button v-if="selectedAppointment.status === 'Scheduled'"
                  @click="cancelAppointment"
                  class="flex-1 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
            Cancel Appointment
          </button>
        </div>
      </div>
    </div>

    <!-- All Day Appointments Modal -->
    <div v-if="showAllDayAppointments && selectedDay" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
         @click.self="closeAllDayAppointments">
      <div class="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-900">
              All Appointments for {{ formatDate(selectedDay.date) }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ allDayAppointments.length }} appointment{{ allDayAppointments.length !== 1 ? 's' : '' }} scheduled
            </p>
          </div>
          <button @click="closeAllDayAppointments" class="text-gray-400 hover:text-gray-600">
            <Icon name="heroicons:x-mark" class="h-6 w-6" />
          </button>
        </div>

        <div class="space-y-3">
          <div v-for="apt in allDayAppointments" :key="apt.id"
               class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
               @click="showAppointmentDetails(apt)">
            <div class="w-16 h-16 bg-blue-100 rounded-xl flex flex-col items-center justify-center">
              <span class="text-sm font-medium text-blue-600">{{ formatTime(apt.startTime) }}</span>
              <span class="text-xs text-blue-500">{{ formatTime(apt.endTime) }}</span>
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{{ apt.service }}</p>
              <p class="text-sm text-gray-600">{{ apt.patientName }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span :class="getStatusClasses(apt.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                {{ apt.status }}
              </span>
              <Icon name="heroicons:chevron-right" class="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button @click="closeAllDayAppointments"
                  class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns'
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'default'
})

const authStore = useAuthStore()
const currentDate = ref(new Date())
const selectedDate = ref(null)
const selectedAppointment = ref(null)
const appointments = ref([])
const isLoading = ref(false)
const showAllDayAppointments = ref(false)
const selectedDay = ref(null)

// Computed properties
const currentMonthYear = computed(() => {
  return format(currentDate.value, 'MMMM yyyy')
})

const calendarDays = computed(() => {
  const start = startOfMonth(currentDate.value)
  const end = endOfMonth(currentDate.value)
  const days = eachDayOfInterval({ start, end })
  
  // Add padding days for the start of the month
  const firstDayOfWeek = start.getDay()
  const paddingStart = Array(firstDayOfWeek).fill(null).map((_, i) => {
    const date = subMonths(start, 1)
    return {
      day: format(date, 'd'),
      date: format(date, 'yyyy-MM-dd'),
      isCurrentMonth: false,
      isToday: false,
      appointments: []
    }
  })
  
  // Add padding days for the end of the month
  const lastDayOfWeek = end.getDay()
  const paddingEnd = Array(6 - lastDayOfWeek).fill(null).map((_, i) => {
    const date = addMonths(end, 1)
    return {
      day: format(date, 'd'),
      date: format(date, 'yyyy-MM-dd'),
      isCurrentMonth: false,
      isToday: false,
      appointments: []
    }
  })
  
  // Map the current month's days
  const currentMonthDays = days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayAppointments = appointments.value.filter(apt => 
      isSameDay(new Date(apt.startTime), date)
    )
    
    return {
      day: format(date, 'd'),
      date: dateStr,
      isCurrentMonth: true,
      isToday: isToday(date),
      hasAppointments: dayAppointments.length > 0,
      appointments: dayAppointments
    }
  })
  
  return [...paddingStart, ...currentMonthDays, ...paddingEnd]
})

const selectedDayAppointments = computed(() => {
  if (!selectedDate.value) return []
  return appointments.value.filter(apt => 
    format(new Date(apt.startTime), 'yyyy-MM-dd') === selectedDate.value
  )
})

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  return format(new Date(selectedDate.value), 'MMMM d, yyyy')
})

// Add this computed property for sorted appointments
const sortedDayAppointments = computed(() => {
  return [...selectedDayAppointments.value].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )
})

// Add this computed property for all appointments of selected day
const allDayAppointments = computed(() => {
  if (!selectedDay.value) return []
  return appointments.value
    .filter(apt => format(new Date(apt.startTime), 'yyyy-MM-dd') === selectedDay.value.date)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
})

// Add ref for the appointments list container
const appointmentsListRef = ref(null)

// Methods
function previousMonth() {
  currentDate.value = subMonths(currentDate.value, 1)
  fetchAppointments()
}

function nextMonth() {
  currentDate.value = addMonths(currentDate.value, 1)
  fetchAppointments()
}

function goToToday() {
  currentDate.value = new Date()
  selectedDate.value = format(currentDate.value, 'yyyy-MM-dd')
  fetchAppointments()
}

function selectDay(day) {
  selectedDate.value = day.date
}

function showAppointmentDetails(appointment) {
  selectedAppointment.value = appointment
}

function closeAppointmentDetails() {
  selectedAppointment.value = null
}

function showDayDetails(day) {
  selectedDay.value = day
  showAllDayAppointments.value = true
}

function closeAllDayAppointments() {
  showAllDayAppointments.value = false
  selectedDay.value = null
}

function formatTime(dateString) {
  return format(new Date(dateString), 'h:mm a')
}

function formatDate(dateString) {
  return format(new Date(dateString), 'MMMM d, yyyy')
}

function formatDuration(startTime, endTime) {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffMinutes = Math.round((end - start) / (1000 * 60))
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minutes`
  }
  
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  if (minutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`
}

function getStatusClasses(status) {
  const classes = {
    'Scheduled': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

async function fetchAppointments() {
  if (!authStore.token) return
  
  isLoading.value = true
  try {
    const startDate = format(startOfMonth(currentDate.value), 'yyyy-MM-dd')
    const endDate = format(endOfMonth(currentDate.value), 'yyyy-MM-dd')
    
    const data = await $fetch(`https://dentistapi-production-92f7.up.railway.app/api/appointments?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    appointments.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch appointments:', error)
  } finally {
    isLoading.value = false
  }
}

async function cancelAppointment() {
  if (!selectedAppointment.value) return
  
  try {
    await $fetch(`https://dentistapi-production-92f7.up.railway.app/api/appointments/${selectedAppointment.value.id}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    
    await fetchAppointments()
    closeAppointmentDetails()
  } catch (error) {
    console.error('Failed to cancel appointment:', error)
  }
}

// Add function to scroll to day's appointments
function scrollToDayAppointments(day) {
  selectedDate.value = day.date
  // Wait for the next tick to ensure the DOM is updated
  nextTick(() => {
    if (appointmentsListRef.value) {
      appointmentsListRef.value.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
}

// Initialize
onMounted(() => {
  selectedDate.value = format(new Date(), 'yyyy-MM-dd')
  fetchAppointments()
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

/* Custom scrollbar for appointment list */
.max-h-\[120px\] {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E0 #F7FAFC;
}

.max-h-\[120px\]::-webkit-scrollbar {
  width: 4px;
}

.max-h-\[120px\]::-webkit-scrollbar-track {
  background: #F7FAFC;
  border-radius: 2px;
}

.max-h-\[120px\]::-webkit-scrollbar-thumb {
  background-color: #CBD5E0;
  border-radius: 2px;
}

.max-h-\[120px\]::-webkit-scrollbar-thumb:hover {
  background-color: #A0AEC0;
}

/* Add smooth scrolling to the modal */
.max-h-\[80vh\] {
  scrollbar-width: thin;
  scrollbar-color: #CBD5E0 #F7FAFC;
}

.max-h-\[80vh\]::-webkit-scrollbar {
  width: 8px;
}

.max-h-\[80vh\]::-webkit-scrollbar-track {
  background: #F7FAFC;
  border-radius: 4px;
}

.max-h-\[80vh\]::-webkit-scrollbar-thumb {
  background-color: #CBD5E0;
  border-radius: 4px;
  border: 2px solid #F7FAFC;
}

.max-h-\[80vh\]::-webkit-scrollbar-thumb:hover {
  background-color: #A0AEC0;
}

/* Add smooth scrolling to the page */
html {
  scroll-behavior: smooth;
}
</style>
