<!-- pages/appointments/new.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router'; // Assuming useRouter is from vue-router for Nuxt 3 compatibility
import { useAuthStore } from '~/stores/auth'; // Assuming your auth store is correctly path-aliased

const router = useRouter();
const authStore = useAuthStore();

// Multi-step form state
const currentStep = ref(1);
const totalSteps = 3;

// Form state
const service = ref('');
const appointmentDate = ref('');
const appointmentTime = ref('');
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Form validation states
const errors = ref({
  service: '',
  date: '',
  time: ''
});

// Add state for description expansion
const showFullDescription = ref(false);

// Available services with descriptions and durations
const availableServices = [
  {
    name: 'Annual Check-up and Cleaning',
    duration: '60 min',
    description: 'Complete oral examination and professional cleaning to maintain oral hygiene.',
    icon: '🦷',
    price: '$120'
  },
  {
    name: 'Teeth Whitening',
    duration: '90 min',
    description: 'Achieve a brighter, whiter smile with our professional teeth whitening treatment.',
    icon: '✨',
    price: '$280'
  },
  {
    name: 'Cavity Filling',
    duration: '45 min',
    description: 'Restore teeth damaged by decay with durable and aesthetic fillings.',
    icon: '🔧',
    price: '$180'
  },
  {
    name: 'Root Canal Therapy',
    duration: '120 min',
    description: 'Save an infected tooth from extraction with root canal treatment.',
    icon: '🩺',
    price: '$450'
  },
  {
    name: 'Wisdom Tooth Extraction',
    duration: '75 min',
    description: 'Safe and effective surgical removal of problematic wisdom teeth.',
    icon: '⚕️',
    price: '$320'
  },
  {
    name: 'Dental Implant Consultation',
    duration: '45 min',
    description: 'Discuss options for replacing missing teeth with stable dental implants.',
    icon: '🦴',
    price: '$150'
  },
  {
    name: 'Orthodontic Consultation',
    duration: '30 min',
    description: 'Initial consultation to evaluate your orthodontic needs and discuss treatment options.',
    icon: ' braces', // Using a simple emoji or string for now
    price: '$90'
  },
  {
    name: 'Veneers Placement',
    duration: '180 min',
    description: 'Enhance your smile with custom-made porcelain veneers to cover imperfections.',
    icon: '💎',
    price: '$900'
  }
];

// Get today's date for min date validation
const today = new Date().toISOString().split('T')[0];

// Available time slots (from 08:00 to 17:30, every 30 min)
const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

// State for booked slots
const bookedSlots = ref<string[]>([]);

// Watch for date selection and fetch appointments for that date
watch(appointmentDate, async (newDate) => {
  bookedSlots.value = [];
  appointmentTime.value = '';
  if (!newDate) return;
  try {
    // Fetch all appointments for the selected date
    const response = await $fetch('https://dentistapi-production-92f7.up.railway.app/api/appointments', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    // Filter appointments for the selected date
    const selectedDay = new Date(newDate);
    const appointments = Array.isArray(response) ? response : [];
    bookedSlots.value = appointments
      .filter(appt => {
        const apptDate = new Date(appt.startTime);
        return apptDate.getFullYear() === selectedDay.getFullYear() &&
               apptDate.getMonth() === selectedDay.getMonth() &&
               apptDate.getDate() === selectedDay.getDate();
      })
      .map(appt => {
        // Return the time in HH:mm format
        const d = new Date(appt.startTime);
        return d.toTimeString().slice(0,5);
      });
  } catch (e) {
    bookedSlots.value = [];
  }
});

// Helper to check if a slot is booked
function isSlotBooked(time: string) {
  return bookedSlots.value.includes(time);
}

// Computed property to get details of the selected service
const selectedServiceDetails = computed(() => {
  return availableServices.find(s => s.name === service.value);
});

// Progress calculation for progress bar
const progressPercentage = computed(() => {
  return (currentStep.value / totalSteps) * 100;
});

// Step validation logic
const canProceedToStep2 = computed(() => {
  return service.value !== '';
});

const canProceedToStep3 = computed(() => {
  return appointmentDate.value !== '' && appointmentTime.value !== '';
});

// Function to clear form validation errors and messages
function clearErrors() {
  errors.value = {
    service: '',
    date: '',
    time: ''
  };
  errorMessage.value = null;
}

// Navigate to the next step of the form
function nextStep() {
  // Validate current step before proceeding
  if (currentStep.value === 1 && !canProceedToStep2.value) {
    errors.value.service = 'Please select a service to continue';
    return;
  }

  if (currentStep.value === 2 && !canProceedToStep3.value) {
    if (!appointmentDate.value) errors.value.date = 'Please select a date';
    if (!appointmentTime.value) errors.value.time = 'Please select a time';
    return;
  }

  clearErrors();
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
}

// Navigate to the previous step of the form
function previousStep() {
  clearErrors();
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

// Validate all form fields before final submission
function validateForm() {
  clearErrors();
  let isValid = true;

  if (!service.value) {
    errors.value.service = 'Please select a service';
    isValid = false;
  }

  if (!appointmentDate.value) {
    errors.value.date = 'Please select a date';
    isValid = false;
  } else {
    const selectedDate = new Date(appointmentDate.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to midnight for accurate comparison

    if (selectedDate < today) {
      errors.value.date = 'Please select a future date';
      isValid = false;
    }
  }

  if (!appointmentTime.value) {
    errors.value.time = 'Please select a time';
    isValid = false;
  }

  return isValid;
}

// Handle the final booking submission
async function handleBooking() {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  // Combine date and time and format to ISO string for the backend
  const startTime = new Date(`${appointmentDate.value}T${appointmentTime.value}`);
  // Get duration from selected service or default to 60 minutes
  const duration = selectedServiceDetails.value?.duration || '60 min';
  const durationMinutes = parseInt(duration.split(' ')[0]);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000); // Add duration to start time

  try {
    await $fetch('https://dentistapi-production-92f7.up.railway.app/api/appointments', {
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

    successMessage.value = 'Appointment booked successfully!';

    // Show success message briefly then redirect to my appointments
    setTimeout(() => {
      router.push('/appointments/my');
    }, 3000);

  } catch (error: any) {
    console.error('Booking error:', error);
    errorMessage.value = error.data?.error || "Could not book appointment. Please try again.";
  } finally {
    isLoading.value = false;
  }
}

// Helper function to format date for display
function formatDate(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to format time for display
function formatTime(timeString: string): string {
  if (!timeString) return '';
  // Use a dummy date to parse time correctly
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Calendar state for compact calendar
const calendarMonth = ref(new Date().getMonth());
const calendarYear = ref(new Date().getFullYear());

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function selectCalendarDate(day: number) {
  const m = (calendarMonth.value + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  appointmentDate.value = `${calendarYear.value}-${m}-${d}`;
  clearErrors();
}
function prevMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11;
    calendarYear.value--;
  } else {
    calendarMonth.value--;
  }
}
function nextMonth() {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0;
    calendarYear.value++;
  } else {
    calendarMonth.value++;
  }
}
const todayDate = new Date();
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8 font-inter">
    <div class="max-w-3xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-4">
        <div class="mx-auto w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-lg animate-scale-in">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-1 animate-fade-in-down">Book Your Appointment</h1>
        <p class="text-base text-gray-600 max-w-2xl mx-auto animate-fade-in-down delay-100">Schedule your visit with our experienced dental team in just a few simple steps.</p>
      </div>

      <!-- Progress Bar -->
      <div class="mb-8 animate-fade-in-up delay-200">
        <div class="flex items-center justify-between max-w-md mx-auto mb-4">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                 :class="currentStep >= 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'">
              1
            </div>
            <span class="ml-3 text-sm font-medium" :class="currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'">
              Service
            </span>
          </div>

          <div class="flex-1 h-2 bg-gray-200 mx-4 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                 :style="{ width: currentStep >= 2 ? '100%' : '0%' }"></div>
          </div>

          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                 :class="currentStep >= 2 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'">
              2
            </div>
            <span class="ml-3 text-sm font-medium" :class="currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'">
              Schedule
            </span>
          </div>

          <div class="flex-1 h-2 bg-gray-200 mx-4 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                 :style="{ width: currentStep >= 3 ? '100%' : '0%' }"></div>
          </div>

          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                 :class="currentStep >= 3 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'">
              3
            </div>
            <span class="ml-3 text-sm font-medium" :class="currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'">
              Confirm
            </span>
          </div>
        </div>

        <!-- Progress percentage indicator -->
        <div class="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
               :style="{ width: `${progressPercentage}%` }"></div>
        </div>
      </div>

      <!-- Main Form Card with Step Transitions -->
      <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up delay-300">
        <Transition name="fade-slide-x" mode="out-in">
          <!-- Step 1: Service Selection -->
          <div v-if="currentStep === 1" :key="1" class="p-8">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Choose Your Service</h2>
              <p class="text-gray-600">Select the dental service you need</p>
            </div>

            <!-- Horizontally scrollable 2-row grid -->
            <div class="overflow-x-auto pb-2">
              <div class="grid grid-rows-2 auto-cols-max gap-3 min-w-max" style="grid-auto-flow: column;">
                <div v-for="serviceOption in availableServices"
                     :key="serviceOption.name"
                     class="w-44 flex flex-col relative group">
                  <input type="radio"
                         :id="`service-${serviceOption.name.replace(/\s+/g, '-')}`"
                         :value="serviceOption.name"
                         v-model="service"
                         @change="clearErrors"
                         class="sr-only peer">
                  <label :for="`service-${serviceOption.name.replace(/\s+/g, '-')}`"
                         class="flex flex-col items-center p-2 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-100 transition-all duration-200 group-hover:shadow-md h-full text-center">
                    <div class="text-xl mb-2">{{ serviceOption.icon }}</div>
                    <div class="flex-1">
                      <div class="font-bold text-base text-gray-900 mb-0.5">{{ serviceOption.name }}</div>
                      <div class="text-xs text-gray-600 mb-1 line-clamp-2">{{ serviceOption.description }}</div>
                      <div class="flex items-center justify-center space-x-2 text-xs mt-auto pt-1">
                        <span class="text-blue-600 font-semibold">{{ serviceOption.duration }}</span>
                        <span class="text-green-600 font-bold">{{ serviceOption.price }}</span>
                      </div>
                    </div>
                    <div class="mt-2">
                      <div class="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200 flex items-center justify-center">
                        <div class="w-2.5 h-2.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                             :class="service === serviceOption.name ? 'opacity-100' : 'opacity-0'"></div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <p v-if="errors.service" class="text-sm text-red-600 mt-4 text-center flex items-center justify-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {{ errors.service }}
            </p>
          </div>

          <!-- Step 2: Date and Time Selection -->
          <div v-else-if="currentStep === 2" :key="2" class="p-8">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Choose Date & Time</h2>
              <p class="text-gray-600">Select your preferred appointment slot</p>
            </div>

            <div class="max-w-2xl mx-auto space-y-8">
              <!-- Compact Calendar Date Selection -->
              <div class="space-y-2">
                <label class="block text-base font-semibold text-gray-900 text-center mb-1">Preferred Date</label>
                <div class="flex flex-col items-center">
                  <div class="flex items-center justify-between w-64 mb-1">
                    <button @click="prevMonth" class="px-2 py-1 text-gray-500 hover:text-blue-600 text-xs">&#8592;</button>
                    <span class="font-medium text-sm">{{ new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' }) }}</span>
                    <button @click="nextMonth" class="px-2 py-1 text-gray-500 hover:text-blue-600 text-xs">&#8594;</button>
                  </div>
                  <div class="grid grid-cols-7 gap-1 w-64 text-xs">
                    <span v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d" class="text-gray-400 text-center">{{ d }}</span>
                    <span v-for="n in getFirstDayOfWeek(calendarYear, calendarMonth)" :key="'empty'+n"></span>
                    <button
                      v-for="day in getDaysInMonth(calendarYear, calendarMonth)"
                      :key="day"
                      :class="[
                        'rounded-full w-7 h-7 flex items-center justify-center',
                        appointmentDate === `${calendarYear}-${(calendarMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}` ? 'bg-blue-600 text-white' : 'hover:bg-blue-100',
                        (new Date(calendarYear, calendarMonth, day) < todayDate) ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'
                      ]"
                      :disabled="new Date(calendarYear, calendarMonth, day) < todayDate"
                      @click="selectCalendarDate(day)"
                    >
                      {{ day }}
                    </button>
                  </div>
                </div>
                <p v-if="errors.date" class="text-xs text-red-600 text-center flex items-center justify-center mt-1">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ errors.date }}
                </p>
              </div>

              <!-- Compact Time Selection -->
              <div class="space-y-2">
                <label class="block text-base font-semibold text-gray-900 text-center mb-1">Available Time Slots</label>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-w-lg mx-auto">
                  <div v-for="time in timeSlots" :key="time" class="relative">
                    <input type="radio"
                           :id="`time-${time}`"
                           :value="time"
                           v-model="appointmentTime"
                           @change="clearErrors"
                           class="sr-only peer"
                           :disabled="isSlotBooked(time)">
                    <label :for="`time-${time}`"
                           :class="[
                             'block w-full py-1 px-1 text-center text-xs font-medium border-2 rounded-lg transition-all duration-200',
                             isSlotBooked(time)
                               ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed line-through'
                               : 'bg-gray-50 border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-checked:text-white'
                           ]">
                      {{ formatTime(time) }}
                    </label>
                  </div>
                </div>
                <p v-if="errors.time" class="text-xs text-red-600 text-center flex items-center justify-center mt-1">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ errors.time }}
                </p>
              </div>
            </div>
          </div>

          <!-- Step 3: Confirmation -->
          <div v-else-if="currentStep === 3" :key="3" class="p-8">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Confirm Your Appointment</h2>
              <p class="text-gray-600">Please review your appointment details</p>
            </div>

            <!-- Ergonomic Appointment Card -->
            <div class="max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
              <div class="flex flex-row items-center gap-6 p-6">
                <!-- Left: Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center mb-1">
                    <span class="font-bold text-lg text-gray-900 truncate">{{ service }}</span>
                  </div>
                  <div class="flex items-center mb-2">
                    <span class="text-gray-900 font-bold mr-3">{{ selectedServiceDetails?.price }}</span>
                    <span class="flex items-center text-yellow-500 text-sm">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                      4.3
                    </span>
                  </div>
                  <div class="text-gray-600 text-sm mb-2 leading-snug">
                    <template v-if="selectedServiceDetails?.description">
                      <span v-if="!showFullDescription && selectedServiceDetails.description.length > 50">
                        {{ selectedServiceDetails.description.slice(0, 50) }}... 
                        <a href="#" class="text-blue-500 underline" @click.prevent="showFullDescription = true">more</a>
                      </span>
                      <span v-else>
                        {{ selectedServiceDetails.description }}
                        <template v-if="selectedServiceDetails.description.length > 50">
                          <a href="#" class="text-blue-500 underline ml-1" @click.prevent="showFullDescription = false">less</a>
                        </template>
                      </span>
                    </template>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 mt-3">
                    <div class="font-medium">Date:</div>
                    <div class="text-right">{{ formatDate(appointmentDate) }}</div>
                    <div class="font-medium">Time:</div>
                    <div class="text-right">{{ formatTime(appointmentTime) }}</div>
                    <div class="font-medium">Duration:</div>
                    <div class="text-right">{{ selectedServiceDetails?.duration }}</div>
                  </div>
                </div>
                <!-- Right: Image -->
                <div class="flex-shrink-0">
                  <div class="w-20 h-20 rounded-xl overflow-hidden border bg-gray-100 flex items-center justify-center">
                    <span class="text-4xl">{{ selectedServiceDetails?.icon }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Success/Error Messages -->
            <div v-if="successMessage" class="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 max-w-lg mx-auto animate-fade-in">
              <div class="flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-green-800 font-semibold">{{ successMessage }}</p>
              </div>
            </div>

            <div v-if="errorMessage" class="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 max-w-lg mx-auto animate-fade-in">
              <div class="flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-red-800 font-semibold">{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Navigation Buttons -->
        <div class="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-100">
          <button
            v-if="currentStep > 1"
            @click="previousStep"
            class="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 rounded-lg">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
          </button>
          <div v-else></div>

          <div class="text-sm text-gray-500 font-medium">
            Step {{ currentStep }} of {{ totalSteps }}
          </div>

          <button
            v-if="currentStep < totalSteps"
            @click="nextStep"
            :disabled="(currentStep === 1 && !canProceedToStep2) || (currentStep === 2 && !canProceedToStep3)"
            class="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md">
            Next
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>

          <button
            v-if="currentStep === totalSteps"
            @click="handleBooking"
            :disabled="isLoading"
            class="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg">
            <svg v-if="isLoading" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isLoading">Booking...</span>
            <span v-else>Confirm Booking</span>
          </button>
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

/* Transition for steps (custom fade-slide-x) */
.fade-slide-x-enter-active,
.fade-slide-x-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-x-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.fade-slide-x-leave-to {
  opacity: 0;
  transform: translateX(-30px);
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
  background: #a0aec0; /* Darker thumb */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #718096; /* Even darker on hover */
}

/* Focus styles */
input:focus, select:focus, button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.45); /* More prominent focus ring */
}

/* Date input styling */
input[type="date"]::-webkit-calendar-picker-indicator {
  background: transparent;
  bottom: 0;
  color: transparent;
  cursor: pointer;
  height: auto;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: auto;
}

/* Hover effects (general, specific classes take precedence) */
.group:hover .group-hover\:shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
