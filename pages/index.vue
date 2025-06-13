<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { format } from 'date-fns';

// Use the default layout for logged-in users and protect the route
definePageMeta({
  layout: 'default'
});

const authStore = useAuthStore();
const router = useRouter();

// --- DATA FETCHING using onMounted logic ---
const appointments = ref<any[]>([]);
const loadingAppointments = ref(true);
const errorAppointments = ref<string | null>(null);

onMounted(async () => {
  if (authStore.token) {
    try {
      const data = await $fetch<any[]>('https://dentistapi-production-92f7.up.railway.app/api/appointments', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });
      appointments.value = Array.isArray(data) ? data : [];
    } catch (err: any) {
      console.error("Failed to fetch appointments:", err);
      errorAppointments.value = err.data?.error || "An unknown error occurred.";
    } finally {
      loadingAppointments.value = false;
    }
  } else {
    loadingAppointments.value = false;
  }
});

// --- COMPUTED PROPERTIES for dynamic stats ---
const upcomingAppointments = computed(() => {
  return appointments.value
    .filter(apt => new Date(apt.endTime) > new Date() && apt.status !== 'Cancelled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
});

const totalAppointments = computed(() => appointments.value.length);
const thisMonthAppointmentsCount = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  return appointments.value.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
  }).length;
});

// Formatting helpers for the template
const formatDate = (dateString: string) => format(new Date(dateString), 'MMMM d, yyyy');
const formatTime = (dateString: string) => format(new Date(dateString), 'p');
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Welcome Section -->
    <div class="text-center mb-8">
      <h2 class="text-4xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard</h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">Manage your dental care appointments and access all the tools you need for a healthy smile.</p>
    </div>

    <!-- Background decorations -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 right-10 w-32 h-32 bg-teal-200/20 rounded-full blur-2xl"></div>
      <div class="absolute bottom-20 left-10 w-40 h-40 bg-cyan-200/20 rounded-full blur-2xl"></div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Appointments</p>
            <p class="text-3xl font-bold text-gray-900">{{ totalAppointments }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:calendar-days" class="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Upcoming</p>
            <p class="text-3xl font-bold text-gray-900">{{ upcomingAppointments.length }}</p>
          </div>
          <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:clock" class="h-6 w-6 text-emerald-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">This Month</p>
            <p class="text-3xl font-bold text-gray-900">{{ thisMonthAppointmentsCount }}</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:chart-bar" class="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Role-based Content -->
    <transition
      enter-active-class="transition ease-out duration-500"
      enter-from-class="opacity-0 transform translate-y-4"
      enter-to-class="opacity-100 transform translate-y-0"
    >
      <div>
        <!-- Content for Dentists/Staff -->
        <div v-if="authStore.user?.role === 'dentist' || authStore.user?.role === 'staff'" class="space-y-8">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <Icon name="heroicons:user-group" class="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">Staff Dashboard</h3>
                <p class="text-gray-600">Manage all patient appointments and schedules</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NuxtLink 
                to="/appointments/manage" 
                class="group flex items-center gap-4 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 transform hover:scale-105"
              >
                <div class="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Icon name="heroicons:clipboard-document-list" class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 group-hover:text-emerald-700">View All Appointments</h4>
                  <p class="text-sm text-gray-600">Manage patient schedules</p>
                </div>
                <Icon name="heroicons:arrow-right" class="h-5 w-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200 ml-auto" />
              </NuxtLink>
              
              <div class="group flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 transform hover:scale-105 cursor-pointer">
                <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Icon name="heroicons:chart-pie" class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 group-hover:text-blue-700">Analytics</h4>
                  <p class="text-sm text-gray-600">View reports & insights</p>
                </div>
                <Icon name="heroicons:arrow-right" class="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 ml-auto" />
              </div>
            </div>
          </div>
        </div>

        <!-- Content for Clients -->
        <div v-if="authStore.user?.role === 'client'" class="space-y-8">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Icon name="heroicons:calendar-days" class="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">Your Appointments</h3>
                <p class="text-gray-600">Manage your dental care schedule</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NuxtLink 
                to="/appointments/my" 
                class="group flex items-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:from-gray-100 hover:to-slate-100 transition-all duration-200 transform hover:scale-105"
              >
                <div class="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                  <Icon name="heroicons:eye" class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 group-hover:text-gray-700">View My Appointments</h4>
                  <p class="text-sm text-gray-600">See your schedule</p>
                </div>
                <Icon name="heroicons:arrow-right" class="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200 ml-auto" />
              </NuxtLink>
              
              <NuxtLink 
                to="/appointments/new" 
                class="group flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 transform hover:scale-105"
              >
                <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Icon name="heroicons:plus" class="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 group-hover:text-blue-700">Book New Appointment</h4>
                  <p class="text-sm text-gray-600">Schedule your visit</p>
                </div>
                <Icon name="heroicons:arrow-right" class="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 ml-auto" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Upcoming Appointments Section -->
    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:clock" class="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900">Upcoming Appointments</h3>
            <p class="text-sm text-gray-600">Your next scheduled visits</p>
          </div>
        </div>
        <NuxtLink to="/appointments/my" class="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1 transition-colors duration-200">
          View All
          <Icon name="heroicons:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
      
      <div class="space-y-4">
        <div v-if="loadingAppointments" class="text-center py-8 text-gray-500">Loading upcoming appointments...</div>
        <div v-else-if="errorAppointments" class="text-center text-red-500 py-8">Failed to load appointments: {{ errorAppointments }}</div>
        <div v-else-if="upcomingAppointments.length === 0" class="text-center py-12 text-gray-600">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="heroicons:calendar-days" class="h-8 w-8 text-gray-400" />
          </div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h4>
          <p class="text-gray-600 mb-4">You don't have any appointments scheduled yet.</p>
          <NuxtLink 
            to="/appointments/new" 
            class="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
          >
            <Icon name="heroicons:plus" class="h-4 w-4" />
            Book Appointment
          </NuxtLink>
        </div>
        <div v-else>
          <div v-for="appointment in upcomingAppointments.slice(0, 3)" :key="appointment.id"
            class="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition">
            <div>
              <p class="font-semibold text-gray-900">{{ formatDate(appointment.startTime) }} at {{ formatTime(appointment.startTime) }}</p>
              <p class="text-sm text-gray-600">Service: {{ appointment.service }}</p>
            </div>
            <div :class="{
                'text-blue-600': appointment.status === 'Scheduled', 
                'text-green-600': appointment.status === 'Completed',
                'text-red-600': appointment.status === 'Cancelled'
              }" class="text-sm font-medium">{{ appointment.status }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

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
