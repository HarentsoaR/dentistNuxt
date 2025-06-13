<!-- pages/appointments/new.vue -->
<script setup lang="ts">
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

// Available services with descriptions and durations
const availableServices = [
    { 
      name: 'Annual Check-up and Cleaning', 
      duration: '60 min',
      description: 'Complete oral examination and professional cleaning',
      icon: '🦷',
      price: '$120'
    },
    { 
      name: 'Teeth Whitening', 
      duration: '90 min',
      description: 'Professional whitening treatment for brighter smile',
      icon: '✨',
      price: '$280'
    },
    { 
      name: 'Cavity Filling', 
      duration: '45 min',
      description: 'Composite or amalgam filling treatment',
      icon: '🔧',
      price: '$180'
    },
    { 
      name: 'Root Canal Therapy', 
      duration: '120 min',
      description: 'Complete root canal treatment and restoration',
      icon: '🩺',
      price: '$450'
    },
    { 
      name: 'Wisdom Tooth Extraction', 
      duration: '75 min',
      description: 'Surgical removal of wisdom teeth',
      icon: '⚕️',
      price: '$320'
    },
    { 
      name: 'Dental Implant Consultation', 
      duration: '45 min',
      description: 'Initial consultation for dental implant procedure',
      icon: '🦴',
      price: '$150'
    }
];

// Get today's date for min date validation
const today = new Date().toISOString().split('T')[0];

// Available time slots
const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

const selectedServiceDetails = computed(() => {
  return availableServices.find(s => s.name === service.value);
});

// Progress calculation
const progressPercentage = computed(() => {
  return (currentStep.value / totalSteps) * 100;
});

// Step validation
const canProceedToStep2 = computed(() => {
  return service.value !== '';
});

const canProceedToStep3 = computed(() => {
  return appointmentDate.value !== '' && appointmentTime.value !== '';
});

function clearErrors() {
  errors.value = {
    service: '',
    date: '',
    time: ''
  };
  errorMessage.value = null;
}

function nextStep() {
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

function previousStep() {
  clearErrors();
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

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
    today.setHours(0, 0, 0, 0);
    
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

async function handleBooking() {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  // Combine date and time and format to RFC3339 for the backend
  const startTime = new Date(`${appointmentDate.value}T${appointmentTime.value}`);
  // Get duration from selected service or default to 1 hour
  const duration = selectedServiceDetails.value?.duration || '60 min';
  const durationMinutes = parseInt(duration.split(' ')[0]);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

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
    
    // Show success message for 3 seconds then redirect
    setTimeout(() => {
      router.push('/appointments/my');
    }, 3000);

  } catch (error: any) {
    errorMessage.value = error.data?.error || "Could not book appointment. Please try again.";
  } finally {
    isLoading.value = false;
  }
}
// Format date for display
function formatDate(dateString: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Format time for display
function formatTime(timeString: any) {
  if (!timeString) return '';
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-3">Book Your Appointment</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">Schedule your visit with our experienced dental team in just a few simple steps.</p>
      </div>

      <!-- Progress Bar -->
      <div class="mb-8">
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
        
        <!-- Progress percentage -->
        <div class="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
               :style="{ width: `${progressPercentage}%` }"></div>
        </div>
      </div>

      <!-- Main Form Card -->
      <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        
        <!-- Step 1: Service Selection -->
        <div v-if="currentStep === 1" class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Choose Your Service</h2>
            <p class="text-gray-600">Select the dental service you need</p>
          </div>
          
          <div class="grid gap-4 max-w-3xl mx-auto">
            <div v-for="serviceOption in availableServices" 
                 :key="serviceOption.name"
                 class="relative group">
              <input type="radio" 
                     :id="serviceOption.name" 
                     :value="serviceOption.name" 
                     v-model="service"
                     @change="clearErrors"
                     class="sr-only peer">
              <label :for="serviceOption.name" 
                     class="flex items-center p-6 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:ring-4 peer-checked:ring-blue-100 transition-all duration-200 group-hover:shadow-md">
                <div class="text-3xl mr-6">{{ serviceOption.icon }}</div>
                <div class="flex-1">
                  <div class="font-bold text-lg text-gray-900 mb-1">{{ serviceOption.name }}</div>
                  <div class="text-sm text-gray-600 mb-2">{{ serviceOption.description }}</div>
                  <div class="flex items-center space-x-4 text-sm">
                    <span class="text-blue-600 font-semibold">{{ serviceOption.duration }}</span>
                    <span class="text-green-600 font-bold">{{ serviceOption.price }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="w-6 h-6 border-2 border-gray-300 rounded-full peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-all duration-200 flex items-center justify-center">
                    <div class="w-3 h-3 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200" 
                         :class="service === serviceOption.name ? 'opacity-100' : 'opacity-0'"></div>
                  </div>
                </div>
              </label>
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
        <div v-if="currentStep === 2" class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Choose Date & Time</h2>
            <p class="text-gray-600">Select your preferred appointment slot</p>
          </div>

          <div class="max-w-2xl mx-auto space-y-8">
            <!-- Date Selection -->
            <div class="space-y-4">
              <label class="block text-lg font-semibold text-gray-900 text-center">Preferred Date</label>
              <div class="relative max-w-sm mx-auto">
                <input type="date" 
                       v-model="appointmentDate"
                       :min="today"
                       @change="clearErrors"
                       class="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-center font-medium"
                       :class="errors.date ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''">
              </div>
              <p v-if="errors.date" class="text-sm text-red-600 text-center flex items-center justify-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ errors.date }}
              </p>
            </div>

            <!-- Time Selection -->
            <div class="space-y-4">
              <label class="block text-lg font-semibold text-gray-900 text-center">Available Time Slots</label>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                <div v-for="time in timeSlots" :key="time" class="relative">
                  <input type="radio" 
                         :id="time" 
                         :value="time" 
                         v-model="appointmentTime"
                         @change="clearErrors"
                         class="sr-only peer">
                  <label :for="time" 
                         class="block w-full py-3 px-2 text-center text-sm font-medium bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-checked:text-white transition-all duration-200">
                    {{ formatTime(time) }}
                  </label>
                </div>
              </div>
              <p v-if="errors.time" class="text-sm text-red-600 text-center flex items-center justify-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ errors.time }}
              </p>
            </div>
          </div>
        </div>

        <!-- Step 3: Confirmation -->
        <div v-if="currentStep === 3" class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">Confirm Your Appointment</h2>
            <p class="text-gray-600">Please review your appointment details</p>
          </div>

          <!-- Appointment Ticket -->
          <div class="max-w-lg mx-auto">
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl p-6 text-white">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold">Appointment Ticket</h3>
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="text-center">
                <div class="text-3xl mb-2">{{ selectedServiceDetails?.icon }}</div>
                <div class="text-lg font-semibold">{{ service }}</div>
              </div>
            </div>
            
            <div class="bg-white border-2 border-gray-100 rounded-b-2xl p-6 space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600 font-medium">Service:</span>
                <span class="font-bold text-gray-900">{{ service }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600 font-medium">Date:</span>
                <span class="font-bold text-gray-900">{{ formatDate(appointmentDate) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600 font-medium">Time:</span>
                <span class="font-bold text-gray-900">{{ formatTime(appointmentTime) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-600 font-medium">Duration:</span>
                <span class="font-bold text-gray-900">{{ selectedServiceDetails?.duration }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-gray-600 font-medium">Price:</span>
                <span class="font-bold text-green-600 text-lg">{{ selectedServiceDetails?.price }}</span>
              </div>
            </div>
          </div>

          <!-- Success/Error Messages -->
          <div v-if="successMessage" class="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 max-w-lg mx-auto">
            <div class="flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-green-800 font-semibold">{{ successMessage }}</p>
            </div>
          </div>

          <div v-if="errorMessage" class="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 max-w-lg mx-auto">
            <div class="flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-red-800 font-semibold">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="bg-gray-50 px-8 py-6 flex justify-between items-center">
          <button 
            v-if="currentStep > 1"
            @click="previousStep"
            class="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
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
            class="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
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
            <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.step-leave-active {
  animation: slideInLeft 0.3s ease-out reverse;
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
input:focus, select:focus, button:focus {
  outline: none;
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

/* Hover effects */
.group:hover .group-hover\:shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>