<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p class="mt-2 text-gray-600">View and manage your appointments in calendar format</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <button @click="showDatePicker = !showDatePicker" 
                  class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center">
            <Icon name="heroicons:calendar" class="h-4 w-4 mr-2" />
            {{ format(currentDate, 'MMM yyyy') }}
            <Icon name="heroicons:chevron-down" class="h-4 w-4 ml-2" :class="{ 'transform rotate-180': showDatePicker }" />
          </button>

          <!-- Compact Date Picker Dropdown -->
          <div v-if="showDatePicker" 
               class="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-64 z-50">
            <!-- Year and Month Selection -->
            <div class="flex items-center justify-between mb-3">
              <button @click="previousMonth" class="p-1 hover:bg-gray-100 rounded">
                <Icon name="heroicons:chevron-left" class="h-5 w-5 text-gray-600" />
              </button>
              <div class="flex items-center gap-2">
                <select v-model="selectedYear" 
                        class="text-sm bg-transparent border-none focus:ring-0 text-gray-700">
                  <option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
                <select v-model="selectedMonth" 
                        class="text-sm bg-transparent border-none focus:ring-0 text-gray-700">
                  <option v-for="(month, index) in months" :key="month" :value="index">
                    {{ month }}
                  </option>
                </select>
              </div>
              <button @click="nextMonth" class="p-1 hover:bg-gray-100 rounded">
                <Icon name="heroicons:chevron-right" class="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <!-- Days Grid -->
            <div class="grid grid-cols-7 gap-1">
              <!-- Day Headers -->
              <div v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" 
                   :key="day"
                   class="text-xs text-center text-gray-500 font-medium py-1">
                {{ day }}
              </div>
              
              <!-- Days -->
              <div v-for="day in calendarDays" :key="day.date"
                   @click="selectDateFromPicker(day)"
                   class="aspect-square flex items-center justify-center text-xs rounded cursor-pointer transition-colors"
                   :class="{
                     'text-gray-400': !day.isCurrentMonth,
                     'bg-blue-100 text-blue-700 font-medium': isSelectedDate(day.date),
                     'hover:bg-gray-100': !isSelectedDate(day.date)
                   }">
                {{ day.day }}
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="flex justify-between mt-3 pt-3 border-t border-gray-100">
              <button @click="goToToday" 
                      class="text-xs text-blue-600 hover:text-blue-700">
                Today
              </button>
              <button @click="closeDatePicker" 
                      class="text-xs text-gray-600 hover:text-gray-700">
                Close
              </button>
            </div>
          </div>
        </div>

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
               class="min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer relative"
               :class="{
                 'bg-gray-50/50 text-gray-400': !day.isCurrentMonth,
                 'bg-teal-50 border-teal-200': day.isToday,
                 'bg-blue-50 border-blue-200': day.hasAppointments,
                 'ring-2 ring-teal-500': selectedDate === day.date
               }">
            <!-- Day Number -->
            <div class="text-xs sm:text-sm font-medium mb-1" 
                 :class="{ 
                   'text-teal-600': day.isToday,
                   'text-gray-400': !day.isCurrentMonth
                 }">
              {{ day.day }}
            </div>

            <!-- Appointments -->
            <div v-if="day.appointments?.length" class="space-y-1">
              <div v-for="apt in day.appointments.slice(0, 3)" :key="apt.id"
                   class="text-[10px] sm:text-xs bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate hover:bg-blue-200 transition-colors"
                   @click.stop="showAppointmentDetails(apt)">
                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ formatTime(apt.startTime) }}</span>
                  <span class="ml-1 sm:ml-2 text-blue-600 truncate">{{ apt.service }}</span>
                </div>
              </div>
              <div v-if="day.appointments.length > 3" 
                   class="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-blue-100 transition-colors"
                   @click.stop="scrollToDayAppointments(day)">
                <div class="flex items-center justify-between">
                  <span>+{{ day.appointments.length - 3 }} more</span>
                  <Icon name="heroicons:chevron-right" class="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>
            </div>

            <!-- Today Indicator -->
            <div v-if="day.isToday" 
                 class="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full"></div>
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
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="selectedAppointment" 
           class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
           @click.self="closeAppointmentDetails">
        <div class="bg-white rounded-2xl p-8 max-w-lg w-full transform transition-all duration-300">
          <!-- Header Section -->
          <div class="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ selectedAppointment.service }}</h3>
              <p class="text-sm text-gray-500">Appointment Details</p>
            </div>
            <button @click="closeAppointmentDetails" 
                    class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg">
              <Icon name="heroicons:x-mark" class="h-6 w-6" />
            </button>
          </div>
          
          <!-- Content Section -->
          <div class="space-y-8">
            <TransitionGroup
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-4"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-4"
            >
              <!-- Date & Time Section -->
              <div key="datetime" class="flex items-start gap-5 group">
                <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shrink-0">
                  <Icon name="heroicons:calendar-days" class="h-7 w-7 text-blue-600" />
                </div>
                <div class="flex-1 pt-1">
                  <p class="text-sm font-medium text-gray-500 mb-1">Date & Time</p>
                  <p class="text-lg font-semibold text-gray-900 mb-1">
                    {{ formatDate(selectedAppointment.startTime) }}
                  </p>
                  <p class="text-base text-gray-600">
                    {{ formatTime(selectedAppointment.startTime) }} - {{ formatTime(selectedAppointment.endTime) }}
                    <span class="text-gray-500 ml-2">({{ formatDuration(selectedAppointment.startTime, selectedAppointment.endTime) }})</span>
                  </p>
                </div>
              </div>

              <!-- Patient Section -->
              <div key="patient" class="flex items-start gap-5 group">
                <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shrink-0">
                  <Icon name="heroicons:user" class="h-7 w-7 text-green-600" />
                </div>
                <div class="flex-1 pt-1">
                  <p class="text-sm font-medium text-gray-500 mb-1">Patient</p>
                  <p class="text-lg font-semibold text-gray-900">{{ selectedAppointment.patientName }}</p>
                </div>
              </div>

              <!-- Status Section -->
              <div key="status" class="flex items-start gap-5 group">
                <div class="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shrink-0">
                  <Icon name="heroicons:tag" class="h-7 w-7 text-yellow-600" />
                </div>
                <div class="flex-1 pt-1">
                  <p class="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <span :class="getStatusClasses(selectedAppointment.status)" 
                        class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105">
                    {{ selectedAppointment.status }}
                  </span>
                </div>
              </div>
            </TransitionGroup>
          </div>
          
          <!-- Action Buttons -->
          <div class="mt-10 pt-6 border-t border-gray-100 flex gap-4">
            <button @click="closeAppointmentDetails"
                    class="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium">
              Close
            </button>
            <button v-if="selectedAppointment.status === 'Scheduled'"
                    @click="cancelAppointment"
                    class="flex-1 px-6 py-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium">
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    </Transition>

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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
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

// Date Picker State
const showDatePicker = ref(false)
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth())

// Available years (current year ± 2 years)
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
})

// Month names
const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

// Computed properties
const currentMonthYear = computed(() => {
  return format(currentDate.value, 'MMMM yyyy')
})

const calendarDays = computed(() => {
  const start = startOfMonth(currentDate.value)
  const end = endOfMonth(currentDate.value)
  
  // Get the first day of the month and the last day
  const firstDay = start.getDay() // 0-6 (Sunday-Saturday)
  const lastDay = end.getDate() // 1-31
  
  // Calculate the total number of days to display
  const totalDays = 42 // 6 rows × 7 days
  
  // Create array for all days
  const days = []
  
  // Add previous month's days
  const prevMonthEnd = new Date(start)
  prevMonthEnd.setDate(0) // Last day of previous month
  const prevMonthLastDay = prevMonthEnd.getDate()
  
  for (let i = firstDay - 1; i >= 0; i--) {
    const date = new Date(start)
    date.setDate(-i)
    days.push({
      day: date.getDate(),
      date: format(date, 'yyyy-MM-dd'),
      isCurrentMonth: false,
      isToday: isToday(date),
      hasAppointments: false,
      appointments: []
    })
  }
  
  // Add current month's days
  for (let i = 1; i <= lastDay; i++) {
    const date = new Date(start)
    date.setDate(i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayAppointments = appointments.value.filter(apt => 
      isSameDay(new Date(apt.startTime), date)
    )
    
    days.push({
      day: i,
      date: dateStr,
      isCurrentMonth: true,
      isToday: isToday(date),
      hasAppointments: dayAppointments.length > 0,
      appointments: dayAppointments
    })
  }
  
  // Add next month's days
  const remainingDays = totalDays - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(end)
    date.setDate(end.getDate() + i)
    days.push({
      day: date.getDate(),
      date: format(date, 'yyyy-MM-dd'),
      isCurrentMonth: false,
      isToday: isToday(date),
      hasAppointments: false,
      appointments: []
    })
  }
  
  return days
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

// Methods for date picker
function selectDateFromPicker(day) {
  if (!day.isCurrentMonth) return
  currentDate.value = new Date(day.date)
  selectedDate.value = day.date
  showDatePicker.value = false
  fetchAppointments()
}

function isSelectedDate(date) {
  return selectedDate.value === date
}

function closeDatePicker() {
  showDatePicker.value = false
}

// Watch for year/month changes
watch([selectedYear, selectedMonth], ([year, month]) => {
  currentDate.value = new Date(year, month, 1)
  fetchAppointments()
})

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

/* Add click outside handler */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.absolute {
  animation: slideDown 0.2s ease-out;
}

/* Improve select styling */
select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

select:focus {
  outline: none;
}

/* Modal animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Add smooth transitions for all interactive elements */
button, 
select,
input {
  transition: all 0.2s ease-in-out;
}

/* Add hover effects for interactive elements */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(1px);
}

/* Add focus styles for better accessibility */
button:focus,
select:focus,
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
}

/* Add smooth transitions for icons */
.icon {
  transition: transform 0.2s ease-in-out;
}

/* Add hover effect for status badges */
.status-badge {
  transition: all 0.2s ease-in-out;
}

.status-badge:hover {
  transform: scale(1.05);
}
</style>