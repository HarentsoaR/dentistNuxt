<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // Assuming useRouter is from vue-router for Nuxt 3 compatibility
import { useAuthStore } from '~/stores/auth'; // Assuming your auth store is correctly path-aliased

// Define the Appointment interface with added patientName
interface Appointment {
  id: string;
  service: string;
  patientName: string; // Added for dentist's view
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
const showCompleteModal = ref(false); // New modal for completing appointments
const appointmentToCancel = ref<Appointment | null>(null);
const appointmentToReschedule = ref<Appointment | null>(null);
const appointmentToComplete = ref<Appointment | null>(null); // State for appointment to complete
const isLoading = ref(false);

// Filter states
const searchQuery = ref(''); // Search by service or patient name
const filterStartDate = ref(''); // Filter by date range start
const filterEndDate = ref('');   // Filter by date range end
const filterStatus = ref('All'); // Filter by appointment status (All, Confirmed, Pending, Cancelled, Completed)

// Reschedule form data
const rescheduleForm = ref({ date: '', time: '' }); // Separate date and time for better UX

// Reactive data for all appointments fetched
const allAppointments = ref<Appointment[]>([]);
const pending = ref(true);
const error = ref<any>(null);

// Fetch appointments from API
const fetchAppointments = async () => {
  isLoading.value = true;
  pending.value = true;
  error.value = null;
  try {
    // Fetch ALL appointments, assuming this endpoint is for dentists
    const response = await $fetch<Appointment[]>(`https://dentistapi-production-92f7.up.railway.app/api/appointments`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });

    // Process appointments data
    allAppointments.value = Array.isArray(response) ? response.map(apt => ({
      ...apt,
      startDate: new Date(apt.startTime),
      endDate: new Date(apt.endTime),
      isUpcoming: new Date(apt.endTime) > new Date() && apt.status !== 'Cancelled' && apt.status !== 'Completed',
      isPast: new Date(apt.endTime) <= new Date() || apt.status === 'Cancelled' || apt.status === 'Completed'
    })) : [];
  } catch (err) {
    console.error('Failed to fetch appointments:', err);
    error.value = err;
  } finally {
    isLoading.value = false;
    pending.value = false;
  }
};

// Call fetchAppointments on component mount
onMounted(() => {
  if (authStore.token) {
    fetchAppointments();
  } else {
    // Redirect to login or show error if not authenticated
    router.push('/login'); // Adjust as per your authentication flow
  }
});

// Computed property to apply all filters
const filteredAppointments = computed(() => {
  let filtered = allAppointments.value;

  // 1. Search by service or patient name
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(apt =>
      apt.service.toLowerCase().includes(query) ||
      apt.patientName.toLowerCase().includes(query) // Search by patient name
    );
  }

  // 2. Filter by date range
  if (filterStartDate.value) {
    const start = new Date(filterStartDate.value);
    // Set time to beginning of the day for accurate comparison
    start.setHours(0, 0, 0, 0);
    filtered = filtered.filter(apt => apt.startDate >= start);
  }
  if (filterEndDate.value) {
    const end = new Date(filterEndDate.value);
    // Set time to end of the day for accurate comparison
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter(apt => apt.startDate <= end);
  }

  // 3. Filter by status
  if (filterStatus.value !== 'All') {
    filtered = filtered.filter(apt => apt.status === filterStatus.value);
  }

  return filtered;
});

// Separate upcoming and past appointments based on current time and status
const upcomingAppointments = computed(() => {
  return filteredAppointments.value
    .filter(apt => apt.isUpcoming)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime()); // Sort by ascending date
});

const pastAppointments = computed(() => {
  return filteredAppointments.value
    .filter(apt => apt.isPast)
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime()); // Sort by descending date
});

// Statistics
const stats = computed(() => ({
  total: allAppointments.value.length,
  upcoming: allAppointments.value.filter(apt => apt.isUpcoming).length,
  completed: allAppointments.value.filter(apt => apt.status === 'Completed').length,
  cancelled: allAppointments.value.filter(apt => apt.status === 'Cancelled').length
}));

// Next appointment (from unfiltered upcoming)
const nextAppointment = computed(() => {
  return allAppointments.value
    .filter(apt => apt.isUpcoming)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0] || null;
});

// Utility functions
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
    'Dental Implant Consultation': '🦴',
    // Add more icons for other services
  };
  return icons[service] || '🦷';
}

function getDaysUntil(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to start of day
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0); // Normalize target date to start of day

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return `In ${diffDays} days`;
  return 'Past';
}

function clearFilters() {
  searchQuery.value = '';
  filterStartDate.value = '';
  filterEndDate.value = '';
  filterStatus.value = 'All';
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
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    await fetchAppointments(); // Re-fetch to update status
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
  // Pre-fill the form with current appointment date and time
  const startDate = new Date(appointment.startTime);
  rescheduleForm.value = {
    date: startDate.toISOString().split('T')[0],
    time: startDate.toTimeString().slice(0, 5) // HH:mm
  };
  showRescheduleModal.value = true;
}

function closeRescheduleModal() {
  showRescheduleModal.value = false;
  appointmentToReschedule.value = null;
  rescheduleForm.value = { date: '', time: '' };
}

async function rescheduleAppointment() {
  if (!appointmentToReschedule.value) return;
  isLoading.value = true;
  try {
    // Combine date and time into ISO string
    const newStartTime = new Date(`${rescheduleForm.value.date}T${rescheduleForm.value.time}`);
    // Calculate new endTime based on original appointment duration
    const originalDurationMs = appointmentToReschedule.value.endDate.getTime() - appointmentToReschedule.value.startDate.getTime();
    const newEndTime = new Date(newStartTime.getTime() + originalDurationMs);

    await $fetch(`https://dentistapi-production-92f7.up.railway.app/api/appointments/${appointmentToReschedule.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString()
      }
    });
    await fetchAppointments(); // Re-fetch to update data
    closeRescheduleModal();
  } catch (error) {
    console.error('Failed to reschedule appointment:', error);
  } finally {
    isLoading.value = false;
  }
}

// Mark as Complete functionality
function openCompleteModal(appointment: Appointment) {
  appointmentToComplete.value = appointment;
  showCompleteModal.value = true;
}

function closeCompleteModal() {
  showCompleteModal.value = false;
  appointmentToComplete.value = null;
}

async function completeAppointment() {
  if (!appointmentToComplete.value) return;
  isLoading.value = true;
  try {
    await $fetch(`https://dentistapi-production-92f7.up.railway.app/api/appointments/${appointmentToComplete.value.id}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    await fetchAppointments(); // Re-fetch to update status
    closeCompleteModal();
  } catch (error) {
    console.error('Failed to complete appointment:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4 sm:px-6 lg:px-8 font-inter">
    <div class="max-w-7xl mx-auto">

      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 animate-fade-in-down">Manage Appointments</h1>
            <p class="text-lg text-gray-600 animate-fade-in-down delay-100">Oversee all dental appointments and patient history</p>
          </div>
          <!-- No 'Book New Appointment' for dentist here, as they manage existing ones or use a different flow to create -->
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600 font-medium">Loading all appointments...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-lg">
        <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 class="text-lg font-semibold text-red-800 mb-2">Unable to Load Appointments</h3>
        <p class="text-red-600 mb-4">We couldn't fetch the appointment data. Please ensure the API is running and try again.</p>
        <button @click="fetchAppointments()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md">
          Try Again
        </button>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Statistics Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Appointments</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
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
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
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
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
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

        <!-- Next Appointment Highlight (from overall appointments, not filtered) -->
        <div v-if="nextAppointment" class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-xl animate-fade-in-up delay-200">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center mb-4 sm:mb-0">
              <div class="text-4xl mr-4">{{ getServiceIcon(nextAppointment.service) }}</div>
              <div>
                <h3 class="text-xl font-bold mb-1">Next Patient Appointment</h3>
                <p class="text-blue-100 text-sm mb-1">Patient: {{ nextAppointment.patientName || 'N/A' }}</p>
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

        <!-- Filters Section -->
        <div class="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6 animate-fade-in-up delay-300">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Filter Appointments</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Search Input -->
            <div>
              <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search by Patient/Service</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  v-model="searchQuery"
                  type="text"
                  id="search"
                  placeholder="Patient name or service..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
              </div>
            </div>
            <!-- Start Date Filter -->
            <div>
              <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                id="startDate"
                v-model="filterStartDate"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
            </div>
            <!-- End Date Filter -->
            <div>
              <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                id="endDate"
                v-model="filterEndDate"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
            </div>
            <!-- Status Filter -->
            <div>
              <label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="statusFilter"
                v-model="filterStatus"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <button
              @click="clearFilters"
              class="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="flex bg-gray-100 rounded-xl p-1 mb-6 animate-fade-in-up delay-400">
          <button
            @click="selectedTab = 'upcoming'"
            :class="selectedTab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            class="flex-1 px-6 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Upcoming ({{ upcomingAppointments.length }})
          </button>
          <button
            @click="selectedTab = 'history'"
            :class="selectedTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            class="flex-1 px-6 py-2 rounded-lg font-medium transition-all duration-200"
          >
            History ({{ pastAppointments.length }})
          </button>
        </div>

        <!-- Appointments List -->
        <div class="space-y-4">
          <!-- Upcoming Appointments -->
          <div v-if="selectedTab === 'upcoming'">
            <transition-group name="list" tag="div" v-if="upcomingAppointments.length > 0" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div v-for="appointment in upcomingAppointments" :key="appointment.id"
                    class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group animate-fade-in appointment-card">
                <!-- Appointment Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center">
                    <div class="text-3xl mr-3">{{ getServiceIcon(appointment.service) }}</div>
                    <div>
                      <h3 class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {{ appointment.service }}
                      </h3>
                      <p class="text-sm text-gray-700 font-medium mt-1">Patient: {{ appointment.patientName || 'N/A' }}</p>
                      <span :class="getStatusColor(appointment.status)"
                            class="inline-block px-2 py-1 text-xs font-medium rounded-full border mt-2">
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
                    class="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors shadow-sm hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    @click="openRescheduleModal(appointment)"
                    class="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors shadow-sm hover:shadow-md"
                  >
                    Reschedule
                  </button>
                  <button
                    v-if="appointment.status === 'Confirmed'"
                    @click="openCompleteModal(appointment)"
                    class="flex-1 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors shadow-sm hover:shadow-md"
                  >
                    Complete
                  </button>
                </div>
              </div>
            </transition-group>

            <!-- Empty State for Upcoming -->
            <div v-else class="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100 animate-fade-in">
              <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No Upcoming Appointments Found</h3>
              <p class="text-gray-600 mb-6">There are no upcoming appointments matching your current filters.</p>
              <button
                @click="clearFilters"
                class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          <!-- Past Appointments -->
          <div v-if="selectedTab === 'history'">
            <transition-group name="list" tag="div" v-if="pastAppointments.length > 0" class="space-y-3">
              <div v-for="appointment in pastAppointments" :key="appointment.id"
                    class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 animate-fade-in appointment-card">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-center mb-4 sm:mb-0">
                    <div class="text-2xl mr-4 opacity-75">{{ getServiceIcon(appointment.service) }}</div>
                    <div>
                      <h3 class="font-semibold text-gray-900 mb-1">{{ appointment.service }}</h3>
                      <p class="text-sm text-gray-700 font-medium mb-1">Patient: {{ appointment.patientName || 'N/A' }}</p>
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
                    <!-- More options for past appointments could go here, e.g., view details -->
                  </div>
                </div>
              </div>
            </transition-group>

            <!-- Empty State for History -->
            <div v-else class="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100 animate-fade-in">
              <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No Appointment History Found</h3>
              <p class="text-gray-600">Your completed and cancelled appointments will appear here based on your filters.</p>
              <button
                @click="clearFilters"
                class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Appointment Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform scale-95 animate-scale-in">
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Cancel Appointment</h3>
          <p class="text-gray-600">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
        </div>

        <div v-if="appointmentToCancel" class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
          <div class="flex items-center">
            <div class="text-2xl mr-3">{{ getServiceIcon(appointmentToCancel.service) }}</div>
            <div>
              <div class="font-semibold text-gray-900">{{ appointmentToCancel.service }}</div>
              <div class="text-sm text-gray-700">Patient: {{ appointmentToCancel.patientName || 'N/A' }}</div>
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
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-sm"
          >
            Keep Appointment
          </button>
          <button
            @click="cancelAppointment"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            <svg v-if="isLoading" class="animate-spin w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
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
    <div v-if="showRescheduleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform scale-95 animate-scale-in">
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Reschedule Appointment</h3>
          <p class="text-gray-600">Please select a new date and time for this appointment.</p>
        </div>

        <div v-if="appointmentToReschedule" class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
          <div class="flex items-center">
            <div class="text-2xl mr-3">{{ getServiceIcon(appointmentToReschedule.service) }}</div>
            <div>
              <div class="font-semibold text-gray-900">{{ appointmentToReschedule.service }}</div>
              <div class="text-sm text-gray-700">Patient: {{ appointmentToReschedule.patientName || 'N/A' }}</div>
              <div class="text-sm text-gray-600">
                Current: {{ formatDate(appointmentToReschedule.startDate) }} at {{ formatTime(appointmentToReschedule.startDate) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Date and Time Selection -->
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="rescheduleDate">New Date</label>
            <input
              type="date"
              id="rescheduleDate"
              v-model="rescheduleForm.date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              :min="new Date().toISOString().split('T')[0]"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="rescheduleTime">New Time</label>
            <input
              type="time"
              id="rescheduleTime"
              v-model="rescheduleForm.time"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="closeRescheduleModal"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            @click="rescheduleAppointment"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            <svg v-if="isLoading" class="animate-spin w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isLoading">Rescheduling...</span>
            <span v-else>Yes, Reschedule</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mark as Complete Modal -->
    <div v-if="showCompleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform scale-95 animate-scale-in">
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Complete Appointment</h3>
          <p class="text-gray-600">Are you sure you want to mark this appointment as completed?</p>
        </div>

        <div v-if="appointmentToComplete" class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
          <div class="flex items-center">
            <div class="text-2xl mr-3">{{ getServiceIcon(appointmentToComplete.service) }}</div>
            <div>
              <div class="font-semibold text-gray-900">{{ appointmentToComplete.service }}</div>
              <div class="text-sm text-gray-700">Patient: {{ appointmentToComplete.patientName || 'N/A' }}</div>
              <div class="text-sm text-gray-600">
                {{ formatDate(appointmentToComplete.startDate) }} at {{ formatTime(appointmentToComplete.startDate) }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="closeCompleteModal"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-sm"
          >
            No, Keep Pending
          </button>
          <button
            @click="completeAppointment"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            <svg v-if="isLoading" class="animate-spin w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isLoading">Completing...</span>
            <span v-else>Yes, Mark as Complete</span>
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

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fade-in { animation: fadeIn 0.4s ease-out; }
.animate-fade-in-down { animation: fadeInDown 0.5s ease-out; }
.animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
.animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }

/* Delay for sequential animations */
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }

/* Transition for list items (e.g., when filtering changes) */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-active {
  position: absolute; /* Helps prevent layout shift during removal */
}

/* Smooth transitions for general elements */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms; /* Slightly longer for smoother feel */
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px; /* Slightly wider for better visibility */
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px; /* More rounded */
}
::-webkit-scrollbar-thumb {
  background: #94a3b8; /* Darker thumb */
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #64748b; /* Even darker on hover */
}

/* Focus styles */
button:focus, input:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.45); /* More prominent focus ring */
}

/* Hover effects */
.group:hover .group-hover\:text-blue-600 {
  color: #2563eb;
}
</style>
