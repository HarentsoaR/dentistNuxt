<!-- pages/appointments/new.vue -->
<script setup lang="ts">
// definePageMeta({
//   layout: 'default',
// });

const router = useRouter();
const authStore = useAuthStore();

// Form state
const service = ref('');
const appointmentDate = ref('');
const appointmentTime = ref('');
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

// List of available services (in a real app, this might come from an API)
const availableServices = [
    'Annual Check-up and Cleaning',
    'Teeth Whitening',
    'Cavity Filling',
    'Root Canal Therapy',
    'Wisdom Tooth Extraction'
];

async function handleBooking() {
    isLoading.value = true;
    errorMessage.value = null;

    if (!service.value || !appointmentDate.value || !appointmentTime.value) {
        errorMessage.value = "Please fill out all fields.";
        isLoading.value = false;
        return;
    }

    // Combine date and time and format to RFC3339 for the backend
    const startTime = new Date(`${appointmentDate.value}T${appointmentTime.value}`);
    // Assume appointments are 1 hour long for simplicity
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    try {
        await $fetch('http://localhost:8080/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`
            },
            body: {
                service: service.value,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            }
        });

        // On success, redirect to the "My Appointments" page
        router.push('/appointments/my');

    } catch (error: any) {
        errorMessage.value = error.data?.error || "Could not book appointment. Please try again.";
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
  <div class="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900">Book a New Appointment</h1>
    <p class="mt-2 text-sm text-gray-600">Fill in the details below to schedule your visit.</p>

    <form @submit.prevent="handleBooking" class="mt-8 space-y-6">
      <!-- Service Selection -->
      <div>
        <label for="service" class="block text-sm font-medium text-gray-700">Select a Service</label>
        <select id="service" v-model="service" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option disabled value="">Please select a service</option>
            <option v-for="s in availableServices" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- Date and Time Selection -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="date" v-model="appointmentDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          </div>
          <div>
            <label for="time" class="block text-sm font-medium text-gray-700">Time (e.g., 9:00 AM)</label>
            <input type="time" id="time" v-model="appointmentTime" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="rounded-md bg-red-50 p-3">
        <p class="text-sm text-red-700">{{ errorMessage }}</p>
      </div>

      <!-- Submit Button -->
      <div class="pt-4">
        <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full flex justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50">
            <span v-if="isLoading">Scheduling...</span>
            <span v-else>Confirm Booking</span>
        </button>
      </div>
    </form>
  </div>
</template>