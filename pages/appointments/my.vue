<!-- pages/appointments/my.vue -->
<script setup lang="ts">
interface Appointment {
  id: string;
  service: string;
  startTime: string;
  endTime: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  startDate: Date;
  endDate: Date;
  isUpcoming: boolean;
  isPast: boolean;
}

const authStore = useAuthStore();
const router = useRouter();

// Reactive states
const selectedTab = ref('upcoming');
const showCancelModal = ref(false);
const showRescheduleModal = ref(false);
const appointmentToCancel = ref<Appointment | null>(null);
const appointmentToReschedule = ref<Appointment | null>(null);
const isLoading = ref(false);
const searchQuery = ref('');

// Add reschedule form data
const rescheduleForm = ref({
  startTime: '',
  endTime: ''
});

// Fetch appointments from API
const { data: appointments, pending, error, refresh } = await useFetch(`https://dentistapi-production-92f7.up.railway.app/api/appointment/user/${authStore.user?.id}`, {
  headers: {
    Authorization: `Bearer ${authStore.token}`
  }
});

// Process appointments data
const processedAppointments = computed(() => {
  const apts = Array.isArray(appointments.value) ? appointments.value : [];
  return apts.map(apt => ({
    ...apt,
    startDate: new Date(apt.startTime),
    endDate: new Date(apt.endTime),
    isUpcoming: new Date(apt.endTime) > new Date() && apt.status !== 'Cancelled',
    isPast: new Date(apt.endTime) <= new Date() || apt.status === 'Cancelled'
  }));
});

// Filter appointments
const upcomingAppointments = computed(() => {
  return processedAppointments.value
    .filter(apt => apt.isUpcoming)
    .sort((a, b) => a.startDate - b.startDate);
});

const pastAppointments = computed(() => {
  return processedAppointments.value
    .filter(apt => apt.isPast)
    .sort((a, b) => b.startDate - a.startDate);
});

// Search functionality
const filteredUpcoming = computed(() => {
  if (!searchQuery.value) return upcomingAppointments.value;
  return upcomingAppointments.value.filter(apt => 
    apt.service.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const filteredPast = computed(() => {
  if (!searchQuery.value) return pastAppointments.value;
  return pastAppointments.value.filter(apt => 
    apt.service.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Statistics
const stats = computed(() => ({
  total: processedAppointments.value.length,
  upcoming: upcomingAppointments.value.length,
  completed: pastAppointments.value.filter(apt => apt.status === 'Completed').length,
  cancelled: pastAppointments.value.filter(apt => apt.status === 'Cancelled').length
}));

// Next appointment
const nextAppointment = computed(() => {
  return upcomingAppointments.value[0] || null;
});

// Utility functions
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
}

function getStatusColor(status: Appointment['status']): string {
  const colors = {
    'Confirmed': 'bg-green-100 text-green-800 border-green-200',
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    'Completed': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

function getServiceIcon(service: string): string {
  const icons: Record<string, string> = {
    'Annual Check-up and Cleaning': '🦷',
    'Teeth Whitening': '✨',
    'Cavity Filling': '🔧',
    'Root Canal Therapy': '🩺',
    'Wisdom Tooth Extraction': '⚕️',
    'Dental Implant Consultation': '🦴'
  };
  return icons[service] || '🦷';
}

function getDaysUntil(date: Date): string {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return `In ${diffDays} days`;
  return 'Past';
}

// Cancel appointment functionality
function openCancelModal(appointment: Appointment) {
  appointmentToCancel.value = appointment;
  showCancelModal.value = true;
}

function closeCancelModal() {
  showCancelModal.value = false;
  appointmentToCancel.value = null;
}

async function cancelAppointment() {
  if (!appointmentToCancel.value) return;
  
  isLoading.value = true;
  try {
    await $fetch(`https://dentistapi-production-92f7.up.railway.app/api/appointments/${appointmentToCancel.value.id}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    await refresh();
    closeCancelModal();
  } catch (error) {
    console.error('Failed to cancel appointment:', error);
  } finally {
    isLoading.value = false;
  }
}

// Reschedule appointment functionality
function openRescheduleModal(appointment: Appointment) {
  appointmentToReschedule.value = appointment;
  // Pre-fill the form with current appointment times
  const startDate = new Date(appointment.startTime);
  rescheduleForm.value = {
    startTime: startDate.toISOString().split('T')[0],
    endTime: startDate.toISOString().split('T')[1].slice(0, 5)
  };
  showRescheduleModal.value = true;
}

function closeRescheduleModal() {
  showRescheduleModal.value = false;
  appointmentToReschedule.value = null;
  rescheduleForm.value = {
    startTime: '',
    endTime: ''
  };
}

async function rescheduleAppointment() {
  if (!appointmentToReschedule.value) return;
  
  isLoading.value = true;
  try {
    // Combine date and time into ISO string
    const newStartTime = new Date(`${rescheduleForm.value.startTime}T${rescheduleForm.value.endTime}`);
    const newEndTime = new Date(newStartTime.getTime() + 60 * 60 * 1000); // Add 1 hour for appointment duration
    
    await $fetch(`https://dentistapi-production-92f7.up.railway.app/api/appointments/${appointmentToReschedule.value.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      body: {
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString()
      }
    });
    
    await refresh();
    closeRescheduleModal();
  } catch (error) {
    console.error('Failed to reschedule appointment:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Appointments</h1>
            <p class="text-lg text-gray-600">Manage your dental appointments and view your history</p>
          </div>
          <NuxtLink 
            to="/appointments/new" 
            class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Book New Appointment
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600 font-medium">Loading your appointments...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-lg font-semibold text-red-800 mb-2">Unable to Load Appointments</h3>
        <p class="text-red-600 mb-4">We couldn't fetch your appointments. Please try again later.</p>
        <button @click="refresh()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Try Again
        </button>
      </div>

      <!-- Main Content -->
      <div v-else>
        
        <!-- Statistics Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center">
              <div class="p-3 bg-green-100 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Upcoming</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.upcoming }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center">
              <div class="p-3 bg-purple-100 rounded-lg">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Completed</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.completed }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center">
              <div class="p-3 bg-red-100 rounded-lg">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Cancelled</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.cancelled }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Next Appointment Highlight -->
        <div v-if="nextAppointment" class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center mb-4 sm:mb-0">
              <div class="text-4xl mr-4">{{ getServiceIcon(nextAppointment.service) }}</div>
              <div>
                <h3 class="text-xl font-bold mb-1">Next Appointment</h3>
                <p class="text-blue-100 mb-2">{{ nextAppointment.service }}</p>
                <div class="flex items-center text-sm text-blue-100">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {{ formatDate(nextAppointment.startDate) }}
                  <svg class="w-4 h-4 ml-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ formatTime(nextAppointment.startDate) }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold mb-1">{{ getDaysUntil(nextAppointment.startDate) }}</div>
              <div class="text-blue-100 text-sm">{{ nextAppointment.status }}</div>
            </div>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Search appointments by service..."
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
            </div>
          </div>
          
          <!-- Tab Navigation -->
          <div class="flex bg-gray-100 rounded-xl p-1">
            <button 
              @click="selectedTab = 'upcoming'"
              :class="selectedTab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              class="px-6 py-2 rounded-lg font-medium transition-all duration-200">
              Upcoming ({{ filteredUpcoming.length }})
            </button>
            <button 
              @click="selectedTab = 'history'"
              :class="selectedTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              class="px-6 py-2 rounded-lg font-medium transition-all duration-200">
              History ({{ filteredPast.length }})
            </button>
          </div>
        </div>

        <!-- Appointments List -->
        <div class="space-y-4">
          
          <!-- Upcoming Appointments -->
          <div v-if="selectedTab === 'upcoming'">
            <div v-if="filteredUpcoming.length > 0" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div v-for="appointment in filteredUpcoming" :key="appointment.id" 
                   class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group">
                
                <!-- Appointment Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center">
                    <div class="text-3xl mr-3">{{ getServiceIcon(appointment.service) }}</div>
                    <div>
                      <h3 class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {{ appointment.service }}
                      </h3>
                      <span :class="getStatusColor(appointment.status)" 
                            class="inline-block px-2 py-1 text-xs font-medium rounded-full border mt-1">
                        {{ appointment.status }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-semibold text-blue-600">{{ getDaysUntil(appointment.startDate) }}</div>
                  </div>
                </div>

                <!-- Appointment Details -->
                <div class="space-y-2 mb-4">
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {{ formatDate(appointment.startDate) }}
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {{ formatTime(appointment.startDate) }} - {{ formatTime(appointment.endDate) }}
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2">
                  <button 
                    @click="openCancelModal(appointment)"
                    class="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    Cancel
                  </button>
                  <button 
                    @click="openRescheduleModal(appointment)"
                    class="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Empty State for Upcoming -->
            <div v-else class="text-center py-12">
              <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No Upcoming Appointments</h3>
              <p class="text-gray-600 mb-6">You don't have any scheduled appointments yet.</p>
              <NuxtLink 
                to="/appointments/new"
                class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Book Your First Appointment
              </NuxtLink>
            </div>
          </div>

          <!-- Past Appointments -->
          <div v-if="selectedTab === 'history'">
            <div v-if="filteredPast.length > 0" class="space-y-3">
              <div v-for="appointment in filteredPast" :key="appointment.id" 
                   class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-center mb-4 sm:mb-0">
                    <div class="text-2xl mr-4 opacity-75">{{ getServiceIcon(appointment.service) }}</div>
                    <div>
                      <h3 class="font-semibold text-gray-900 mb-1">{{ appointment.service }}</h3>
                      <div class="flex items-center text-sm text-gray-600 space-x-4">
                        <span>{{ formatDate(appointment.startDate) }}</span>
                        <span>{{ formatTime(appointment.startDate) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <span :class="getStatusColor(appointment.status)" 
                          class="px-3 py-1 text-sm font-medium rounded-full border">
                      {{ appointment.status }}
                    </span>
                    <button class="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Empty State for History -->
            <div v-else class="text-center py-12">
              <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No Appointment History</h3>
              <p class="text-gray-600">Your completed and cancelled appointments will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Appointment Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full">
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Cancel Appointment</h3>
          <p class="text-gray-600">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
        </div>
        
        <div v-if="appointmentToCancel" class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <div class="text-2xl mr-3">{{ getServiceIcon(appointmentToCancel.service) }}</div>
            <div>
              <div class="font-semibold text-gray-900">{{ appointmentToCancel.service }}</div>
              <div class="text-sm text-gray-600">
                {{ formatDate(appointmentToCancel.startDate) }} at {{ formatTime(appointmentToCancel.startDate) }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button 
            @click="closeCancelModal"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
            Keep Appointment
          </button>
          <button 
            @click="cancelAppointment"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center">
            <svg v-if="isLoading" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isLoading">Cancelling...</span>
            <span v-else>Yes, Cancel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Reschedule Appointment Modal -->
    <div v-if="showRescheduleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full">
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Reschedule Appointment</h3>
          <p class="text-gray-600">Please select a new time for your appointment.</p>
        </div>
        
        <div v-if="appointmentToReschedule" class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <div class="text-2xl mr-3">{{ getServiceIcon(appointmentToReschedule.service) }}</div>
            <div>
              <div class="font-semibold text-gray-900">{{ appointmentToReschedule.service }}</div>
              <div class="text-sm text-gray-600">
                {{ formatDate(appointmentToReschedule.startDate) }} at {{ formatTime(appointmentToReschedule.startDate) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Date and Time Selection -->
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Date</label>
            <input 
              type="date" 
              v-model="rescheduleForm.startTime"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :min="new Date().toISOString().split('T')[0]"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Time</label>
            <input 
              type="time" 
              v-model="rescheduleForm.endTime"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
        </div>
        
        <div class="flex gap-3">
          <button 
            @click="closeRescheduleModal"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button 
            @click="rescheduleAppointment"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center">
            <svg v-if="isLoading" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isLoading">Rescheduling...</span>
            <span v-else>Yes, Reschedule</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.appointment-card {
  animation: fadeIn 0.3s ease-out;
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Focus styles */
button:focus, input:focus {
  outline: none;
}

/* Hover effects */
.group:hover .group-hover\:text-blue-600 {
  color: #2563eb;
}
</style>