<!-- pages/appointments/my.vue -->
<script setup lang="ts">
// All pages inside `/appointments` will use the default layout
// definePageMeta({
//   layout: 'default',
// });

// Fetch appointments from your API
// Note: Your API needs a way to get appointments for the logged-in user.
// The auth middleware should be sending the token.
const { data: appointments, pending, error } = await useFetch('http://localhost:8080/api/appointments', {
  headers: {
    Authorization: `Bearer ${useAuthStore().token}` // Send the auth token
  }
});

// Separate appointments into upcoming and past for better UX
const upcomingAppointments = computed(() => {
  const apts = Array.isArray(appointments.value) ? appointments.value : [];
  return apts.filter(apt => new Date(apt.endTime) > new Date() && apt.status !== 'Cancelled');
});

const pastAppointments = computed(() => {
  const apts = Array.isArray(appointments.value) ? appointments.value : [];
  return apts.filter(apt => new Date(apt.endTime) <= new Date() || apt.status === 'Cancelled');
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">My Appointments</h1>
        <NuxtLink 
            to="/appointments/new" 
            class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Book New Appointment
        </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="mt-8 text-center text-gray-500">
      <p>Loading your appointments...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="mt-8 rounded-md bg-red-50 p-4">
       <p class="text-sm font-medium text-red-800">Could not load appointments. Please try again later.</p>
    </div>

    <!-- Content -->
    <div v-else>
        <!-- Upcoming Appointments Section -->
        <section class="mt-8">
            <h2 class="text-xl font-semibold text-gray-800">Upcoming</h2>
            <div v-if="upcomingAppointments.length > 0" class="mt-4 grid gap-4 md:grid-cols-2">
                <AppointmentCard v-for="apt in upcomingAppointments" :key="apt.id" :appointment="apt" />
            </div>
            <div v-else class="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <p class="text-gray-500">You have no upcoming appointments.</p>
            </div>
        </section>

        <!-- Past Appointments Section -->
        <section class="mt-12">
            <h2 class="text-xl font-semibold text-gray-800">History</h2>
             <div v-if="pastAppointments.length > 0" class="mt-4 grid gap-4 md:grid-cols-2">
                <AppointmentCard v-for="apt in pastAppointments" :key="apt.id" :appointment="apt" />
            </div>
            <div v-else class="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <p class="text-gray-500">You have no past appointments.</p>
            </div>
        </section>
    </div>
  </div>
</template>