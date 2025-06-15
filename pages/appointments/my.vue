<!-- pages/appointments/my.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { format, isSameMonth, addDays } from 'date-fns'; // Removed isPast, isFuture as they are implicitly handled

// Define Appointment interface
interface Appointment {
  id: string;
  service: string;
  startTime: string;
  endTime: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  notes?: string;
  dentist?: string;
}

// Define ProcessedAppointment interface (includes derived properties)
interface ProcessedAppointment extends Appointment {
  startDate: Date;
  endDate: Date;
  isUpcoming: boolean;
  isPast: boolean;
  isToday: boolean;
  isThisWeek: boolean;
  isThisMonth: boolean;
}

const authStore = useAuthStore();
const router = useRouter();

// Reactive states for filters and UI
const selectedTab = ref('upcoming');
const searchQuery = ref('');
const dateFilter = ref('all'); // 'all', 'today', 'week', 'month'
const statusFilter = ref('all'); // 'all', 'confirmed', 'pending', 'cancelled', 'completed'
const isLoading = ref(false); // Manages loading state for the data fetch
const showFilters = ref(false); // Controls visibility of the expanded filter options

// Function to fetch appointments from the API
const fetchAppointments = async () => {
  isLoading.value = true; // Set loading to true before the fetch
  try {
    const response = await useFetch<Appointment[]>(`https://dentistapi-production-92f7.up.railway.app/api/appointment/user/${authStore.user?.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      // You can add a `lazy: true` if you want to initially render the page without waiting for data,
      // but for a core data display page, waiting for data is often preferred for initial load.
      // `server: false` might be needed if this is purely client-side rendering with no SSR.
    });

    if (response.error.value) {
      // If there's an error from useFetch, throw it to be caught by the outer try/catch
      throw response.error.value;
    }
    return response;
  } catch (err) {
    console.error('Error fetching appointments:', err);
    // Return null or rethrow based on desired error handling
    throw err; // Re-throwing ensures the outer v-else-if="error" correctly catches it
  } finally {
    isLoading.value = false; // Always set loading to false after fetch attempt
  }
};

// Use `await` to fetch data on component setup (SSR or initial client load)
const { data: rawAppointments, pending: fetchPending, error: fetchError, refresh } = await fetchAppointments();

// Computed property for the raw appointments array
const appointments = computed(() => rawAppointments.value || []);

// Combined loading state: either initial fetch is pending or manual isLoading is true
const overallPending = computed(() => fetchPending.value || isLoading.value);

// Process raw appointments to add derived date properties and flags
const processedAppointments = computed(() => {
  const apts = Array.isArray(appointments.value) ? appointments.value : [];
  const now = new Date(); // Current date for comparison
  const todayNormalized = format(now, 'yyyy-MM-dd'); // Normalized date for 'today' comparison

  return apts.map((apt: Appointment): ProcessedAppointment => ({
    ...apt,
    startDate: new Date(apt.startTime), // Convert start time string to Date object
    endDate: new Date(apt.endTime),     // Convert end time string to Date object
    // Determine if appointment is upcoming (ends in future and not cancelled/completed)
    isUpcoming: new Date(apt.endTime) > now && apt.status !== 'Cancelled' && apt.status !== 'Completed',
    // Determine if appointment is past (has ended or is cancelled/completed)
    isPast: new Date(apt.endTime) <= now || apt.status === 'Cancelled' || apt.status === 'Completed',
    // Check if appointment date is today
    isToday: format(new Date(apt.startTime), 'yyyy-MM-dd') === todayNormalized,
    // Check if appointment date is within the current week
    isThisWeek: isSameWeek(new Date(apt.startTime), now),
    // Check if appointment date is within the current month
    isThisMonth: isSameMonth(new Date(apt.startTime), now)
  }));
});

// Primary filtered list that applies global search, date range, and status filters
const globallyFilteredAppointments = computed(() => {
  let filtered = [...processedAppointments.value]; // Start with all processed appointments

  // Apply search query filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((apt: ProcessedAppointment) =>
      apt.service.toLowerCase().includes(query) || // Search by service name
      (apt.notes && apt.notes.toLowerCase().includes(query)) || // Search by notes (if present)
      (apt.dentist && apt.dentist.toLowerCase().includes(query)) // Search by dentist name (if present)
    );
  }

  // Apply status filter (if a specific status is selected)
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter((apt: ProcessedAppointment) =>
      apt.status.toLowerCase() === statusFilter.value.toLowerCase()
    );
  }

  // Apply date range filter (if a specific date range is selected)
  if (dateFilter.value !== 'all') {
    filtered = filtered.filter((apt: ProcessedAppointment) => {
      switch (dateFilter.value) {
        case 'today': return apt.isToday;
        case 'week': return apt.isThisWeek;
        case 'month': return apt.isThisMonth;
        default: return true; // Should not be reached with current select options
      }
    });
  }
  return filtered;
});

// Upcoming appointments list based on `globallyFilteredAppointments`
const upcomingAppointmentsList = computed(() => {
  return globallyFilteredAppointments.value
    .filter((apt: ProcessedAppointment) => apt.isUpcoming) // Filter for upcoming appointments
    .sort((a: ProcessedAppointment, b: ProcessedAppointment) => a.startDate.getTime() - b.startDate.getTime()); // Sort by earliest date
});

// Past appointments list based on `globallyFilteredAppointments`
const pastAppointmentsList = computed(() => {
  return globallyFilteredAppointments.value
    .filter((apt: ProcessedAppointment) => apt.isPast) // Filter for past appointments
    .sort((a: ProcessedAppointment, b: ProcessedAppointment) => b.startDate.getTime() - a.startDate.getTime()); // Sort by most recent date
});

// Determine the current ongoing appointment from the *overall* processed list (not filtered by filters)
const currentAppointment = computed(() => {
  const now = new Date();
  return processedAppointments.value.find((apt: ProcessedAppointment) =>
    apt.startDate <= now && apt.endDate >= now && apt.status === 'Confirmed'
  );
});

// Determine the next upcoming appointment (excluding the current one, and not affected by filters)
const nextAppointment = computed(() => {
  return processedAppointments.value // Check all appointments
    .filter(apt => apt.isUpcoming && apt.id !== currentAppointment.value?.id) // Filter for upcoming and not the current one
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0] || null; // Get the earliest one
});


// Statistics computed property: these reflect the counts *after* all global filters are applied
const stats = computed(() => ({
  total: globallyFilteredAppointments.value.length, // Total appointments matching all filters
  upcoming: upcomingAppointmentsList.value.length, // Count of upcoming appointments based on current filters
  // Count of completed appointments from the filtered past list
  completed: pastAppointmentsList.value.filter((apt: ProcessedAppointment) => apt.status === 'Completed').length,
  // Count of cancelled appointments from the filtered past list
  cancelled: pastAppointmentsList.value.filter((apt: ProcessedAppointment) => apt.status === 'Cancelled').length,
  // Count of 'Today' appointments from the globally filtered list
  today: globallyFilteredAppointments.value.filter((apt: ProcessedAppointment) => apt.isToday).length,
  // Count of 'This Week' appointments from the globally filtered list
  thisWeek: globallyFilteredAppointments.value.filter((apt: ProcessedAppointment) => apt.isThisWeek).length,
}));

// Utility functions for date/time formatting and status colors
function formatDate(date: Date): string {
  return format(date, 'MMMM d, yyyy'); // e.g., "June 15, 2025"
}

function formatTime(date: Date): string {
  return format(date, 'p'); // e.g., "8:00 AM" or "3:30 PM"
}

function getStatusColor(status: Appointment['status']): string {
  const colors = {
    'Confirmed': 'bg-green-100 text-green-800 border-green-200',
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
    'Completed': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'; // Default gray if status is not matched
}

function getServiceIcon(service: string): string {
  // A mapping of service names to emoji icons for visual representation
  const icons: Record<string, string> = {
    'Annual Check-up and Cleaning': '🦷',
    'Teeth Whitening': '✨',
    'Cavity Filling': '🔧',
    'Root Canal Therapy': '🩺',
    'Wisdom Tooth Extraction': '⚕️',
    'Dental Implant Consultation': '🦴',
    'Orthodontic Consultation': '🦿', // Using a prosthesis emoji for braces/orthodontics
    'Veneers Placement': '💎'
  };
  return icons[service] || '🦷'; // Default icon if service not found
}

function getDaysUntil(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date to midnight for accurate day calculation
  const apptDate = new Date(date);
  apptDate.setHours(0, 0, 0, 0); // Normalize appointment date to midnight

  const diffTime = apptDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Calculate difference in days

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return `In ${diffDays} days`;
  return 'Past'; // For appointments that are in the past
}

// Helper function for week comparison (custom implementation)
// Note: For more robust week handling (e.g., ISO weeks vs. Sunday/Monday start),
// consider using `startOfWeek` from date-fns directly.
function isSameWeek(date1: Date, date2: Date): boolean {
  const startOfWeek1 = addDays(date1, -date1.getDay()); // Sunday as start of week
  const startOfWeek2 = addDays(date2, -date2.getDay());
  return format(startOfWeek1, 'yyyy-MM-dd') === format(startOfWeek2, 'yyyy-MM-dd');
}

// Function to reset all filters to their default values
function resetFilters() {
  dateFilter.value = 'all';
  statusFilter.value = 'all';
  searchQuery.value = '';
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4 sm:px-6 lg:px-8 font-inter">
    <div class="max-w-7xl mx-auto">
      <!-- Header Section with enhanced animation -->
      <div class="mb-8 animate-fade-in-down">
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

      <!-- Loading State with enhanced animation -->
      <div v-if="overallPending" class="flex flex-col items-center justify-center py-20">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <div class="absolute top-0 left-0 w-full h-full animate-pulse">
            <div class="h-full w-full rounded-full bg-blue-100 opacity-50"></div>
          </div>
        </div>
        <p class="text-xl text-gray-600 font-semibold mt-6 animate-pulse">Loading your appointments...</p>
        <p class="text-gray-500 mt-2">Please wait a moment while we load your dental journey.</p>
      </div>

      <!-- Error State with retry option -->
      <div v-else-if="fetchError" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-md animate-fade-in">
        <div class="animate-bounce mb-4">
          <svg class="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-red-800 mb-2">Oops! Something Went Wrong</h3>
        <p class="text-red-600 mb-4">We couldn't retrieve your appointments at the moment. This might be a network issue or a problem with our server. Please try again.</p>
        <button @click="refresh()" class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors transform hover:scale-105 shadow-md">
          <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12v.01"></path>
          </svg>
          Retry Loading
        </button>
      </div>

      <!-- Main Content when data is loaded -->
      <div v-else class="animate-fade-in-up delay-100">
        <!-- Dynamic Statistics Cards based on applied filters -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center transform hover:scale-105 transition-transform duration-200">
            <div class="p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Filtered</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center transform hover:scale-105 transition-transform duration-200">
            <div class="p-3 bg-green-100 rounded-lg flex-shrink-0">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Upcoming Filtered</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.upcoming }}</p>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center transform hover:scale-105 transition-transform duration-200">
            <div class="p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Matching Today</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.today }}</p>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center transform hover:scale-105 transition-transform duration-200">
            <div class="p-3 bg-indigo-100 rounded-lg flex-shrink-0">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Matching This Week</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.thisWeek }}</p>
            </div>
          </div>
        </div>

        <!-- Current Appointment Highlight (not affected by filters, always shows true current) -->
        <div v-if="currentAppointment" class="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-8 text-white shadow-xl animate-fade-in-up">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center mb-4 sm:mb-0">
              <div class="text-4xl mr-4 animate-bounce-icon">{{ getServiceIcon(currentAppointment.service) }}</div>
              <div>
                <h3 class="text-xl font-bold mb-1">Your Current Appointment</h3>
                <p class="text-purple-100 mb-2 text-lg">{{ currentAppointment.service }}</p>
                <div class="flex items-center text-sm text-purple-100">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {{ formatDate(currentAppointment.startDate) }}
                  <svg class="w-4 h-4 ml-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ formatTime(currentAppointment.startDate) }} - {{ formatTime(currentAppointment.endDate) }}
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold mb-1">Happening Now!</div>
              <div class="text-purple-100 text-sm">{{ currentAppointment.status }}</div>
            </div>
          </div>
        </div>

        <!-- Next Appointment Highlight (not affected by filters, always shows true next) -->
        <div v-else-if="nextAppointment" class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white shadow-xl animate-fade-in-up">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center mb-4 sm:mb-0">
              <div class="text-4xl mr-4">{{ getServiceIcon(nextAppointment.service) }}</div>
              <div>
                <h3 class="text-xl font-bold mb-1">Your Next Appointment</h3>
                <p class="text-blue-100 mb-2 text-lg">{{ nextAppointment.service }}</p>
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

        <!-- Search and Filters Section -->
        <div class="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Search Bar -->
            <div class="flex-1">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search appointments by service, dentist, or notes..."
                  class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm">
              </div>
            </div>

            <!-- Filter Toggle Button -->
            <button
              @click="showFilters = !showFilters"
              class="inline-flex items-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <svg class="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              Filters
            </button>
          </div>

          <!-- Expanded Filters (conditionally rendered with animation) -->
          <Transition name="fade-slide-y">
            <div v-if="showFilters" class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <!-- Date Filter -->
              <div>
                <label for="date-filter" class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  id="date-filter"
                  v-model="dateFilter"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              <!-- Status Filter -->
              <div>
                <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  id="status-filter"
                  v-model="statusFilter"
                  class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <!-- Reset Filters Button -->
              <div class="flex items-end">
                <button
                  @click="resetFilters"
                  class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm">
                  Reset Filters
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Tab Navigation (Upcoming vs History) -->
        <div class="flex bg-gray-100 rounded-xl p-1 shadow-sm mb-6">
          <button
            @click="selectedTab = 'upcoming'"
            :class="selectedTab === 'upcoming' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'"
            class="flex-1 px-6 py-2 rounded-lg font-medium transition-all duration-200">
            Upcoming ({{ upcomingAppointmentsList.length }})
          </button>
          <button
            @click="selectedTab = 'history'"
            :class="selectedTab === 'history' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'"
            class="flex-1 px-6 py-2 rounded-lg font-medium transition-all duration-200">
            History ({{ pastAppointmentsList.length }})
          </button>
        </div>

        <!-- Appointments List Display -->
        <div class="space-y-4">
          <!-- Upcoming Appointments List -->
          <div v-if="selectedTab === 'upcoming'">
            <TransitionGroup name="list" tag="div" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div v-for="appointment in upcomingAppointmentsList" :key="appointment.id"
                   class="appointment-card bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group flex flex-col">

                <!-- Service Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center space-x-3 flex-grow min-w-0">
                    <div class="text-3xl bg-gray-50 p-2 rounded-lg flex-shrink-0">{{ getServiceIcon(appointment.service) }}</div>
                    <div class="min-w-0">
                      <h3 class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {{ appointment.service }}
                      </h3>
                      <span :class="getStatusColor(appointment.status)"
                            class="inline-block px-2 py-1 text-xs font-medium rounded-full border mt-1">
                        {{ appointment.status }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0 ml-4">
                    <div class="text-sm font-semibold text-blue-600 whitespace-nowrap">{{ getDaysUntil(appointment.startDate) }}</div>
                  </div>
                </div>

                <!-- Appointment Details -->
                <div class="space-y-3 mt-auto">
                  <div class="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <svg class="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span class="line-clamp-1">{{ formatDate(appointment.startDate) }}</span>
                  </div>

                  <div class="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <svg class="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="line-clamp-1">{{ formatTime(appointment.startDate) }} - {{ formatTime(appointment.endDate) }}</span>
                  </div>

                  <!-- Dentist Info -->
                  <div v-if="appointment.dentist" class="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <svg class="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span class="line-clamp-1">Dr. {{ appointment.dentist }}</span>
                  </div>

                  <!-- Notes -->
                  <div v-if="appointment.notes" class="flex items-start text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <svg class="w-4 h-4 mr-2 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span class="line-clamp-2">{{ appointment.notes }}</span>
                  </div>
                </div>

                <!-- Action Buttons (Removed as per request - Placeholder for future actions if needed) -->
                <!-- <div class="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                  <button class="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    View Details
                  </button>
                </div> -->
              </div>
            </TransitionGroup>

            <!-- Empty State for Upcoming -->
            <div v-if="upcomingAppointmentsList.length === 0" class="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in">
              <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No Upcoming Appointments</h3>
              <p class="text-gray-600 mb-6">You don't have any scheduled appointments yet. Book one now!</p>
              <NuxtLink
                to="/appointments/new"
                class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md transform hover:-translate-y-0.5">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Book Your First Appointment
              </NuxtLink>
            </div>
          </div>

          <!-- Past Appointments List -->
          <div v-if="selectedTab === 'history'">
            <TransitionGroup name="list" tag="div" class="space-y-3">
              <div v-for="appointment in pastAppointmentsList" :key="appointment.id"
                   class="appointment-card bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-center mb-4 sm:mb-0">
                    <div class="text-2xl mr-4 opacity-75 flex-shrink-0">{{ getServiceIcon(appointment.service) }}</div>
                    <div class="min-w-0">
                      <h3 class="font-semibold text-gray-900 mb-1 line-clamp-1">{{ appointment.service }}</h3>
                      <div class="flex flex-wrap items-center text-sm text-gray-600 gap-x-4">
                        <span>{{ formatDate(appointment.startDate) }}</span>
                        <span>{{ formatTime(appointment.startDate) }}</span>
                        <span v-if="appointment.dentist" class="line-clamp-1">• Dr. {{ appointment.dentist }}</span>
                        <span v-if="appointment.notes" class="line-clamp-1">• {{ appointment.notes }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center space-x-3 flex-shrink-0">
                    <span :class="getStatusColor(appointment.status)"
                          class="px-3 py-1 text-sm font-medium rounded-full border whitespace-nowrap">
                      {{ appointment.status }}
                    </span>
                  </div>
                </div>
              </div>
            </TransitionGroup>

            <!-- Empty State for History -->
            <div v-if="pastAppointmentsList.length === 0" class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in">
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
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes bounceIcon {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
.animate-fade-in-down { animation: fadeInDown 0.5s ease-out forwards; }
.animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
.animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.animate-bounce-icon { animation: bounceIcon 1.5s infinite ease-in-out; }

/* Delay for sequential animations */
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }

/* List transition for adding/removing items */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.list-leave-active {
  position: absolute; /* Ensures elements don't collapse before animating out */
}

/* Transition for the filter dropdown */
.fade-slide-y-enter-active,
.fade-slide-y-leave-active {
  transition: all 0.3s ease-in-out;
}
.fade-slide-y-enter-from,
.fade-slide-y-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}


/* Smooth transitions for all elements */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #a0aec0;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #718096;
}

/* Focus styles */
button:focus, input:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.45);
}

/* Hover effects */
.group:hover .group-hover\:text-blue-600 {
  color: #2563eb;
}
</style>
