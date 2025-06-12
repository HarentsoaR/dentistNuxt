<template>
  <div>
    <!-- Header Section - Always Visible -->
    <div 
      ref="headerSection"
      class="text-center mb-8 transition-all duration-700 ease-in-out"
      :class="showForm ? 'transform -translate-y-4 opacity-70 scale-95' : 'transform translate-y-0 opacity-100 scale-100'"
    >
      <div class="flex justify-center mb-6">
        <div class="relative">
          <div class="absolute inset-0 bg-teal-200 rounded-full animate-ping opacity-75"></div>
          <div class="relative bg-white p-4 rounded-full shadow-xl border border-teal-100">
            <Icon name="twemoji:tooth" class="h-10 w-10" />
          </div>
        </div>
      </div>
      <h1 class="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
        DentaCare Pro
      </h1>
      <p class="text-gray-600 font-medium">
        Professional Dental Care Management
      </p>
    </div>

    <!-- Expand Button -->
    <div class="flex justify-center mb-8">
      <button
        @click="toggleForm"
        class="group flex items-center justify-center w-14 h-14 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-teal-200"
        :class="showForm ? 'rotate-180' : 'rotate-0'"
      >
        <Icon 
          name="heroicons:chevron-down" 
          class="h-6 w-6 text-white transition-transform duration-300"
        />
      </button>
    </div>

    <!-- Form Container -->
    <transition
      enter-active-class="transition-all duration-700 ease-out"
      enter-from-class="opacity-0 transform translate-y-8 scale-95"
      enter-to-class="opacity-100 transform translate-y-0 scale-100"
      leave-active-class="transition-all duration-500 ease-in"
      leave-from-class="opacity-100 transform translate-y-0 scale-100"
      leave-to-class="opacity-0 transform -translate-y-4 scale-95"
    >
      <div 
        v-if="showForm" 
        ref="formSection"
        class="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/20 max-w-4xl mx-auto"
      >
        <!-- Form Content -->
        <div class="space-y-6">
          <!-- Header -->
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h2>
            <p class="text-gray-600 text-sm">
              Join DentaCare Pro today
            </p>
          </div>

          <form class="space-y-6" @submit.prevent="onSubmit">
            <!-- Two Column Layout for Form Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column -->
              <div class="space-y-5">
                <FormInput
                  name="fullName"
                  type="text"
                  label="Full Name"
                  placeholder="John Doe"
                  icon="heroicons:user"
                  :rules="{ required: true }"
                />

                <FormInput
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  icon="heroicons:envelope"
                  :rules="{ required: true, email: true }"
                />

                <FormInput
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  placeholder="+1 (555) 123-4567"
                  icon="heroicons:phone"
                  :rules="{ required: true, min: 10 }"
                />
              </div>

              <!-- Right Column -->
              <div class="space-y-5">
                <PasswordInput
                  name="password"
                  label="Password"
                  placeholder="Create a strong password"
                  icon="heroicons:lock-closed"
                  :rules="{ required: true, min: 8 }"
                />

                <PasswordInput
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  icon="heroicons:lock-closed"
                  :rules="{ required: true, confirmed: '@password' }"
                  confirm-field="password"
                />
              </div>
            </div>

            <!-- Full Width Elements -->
            <div class="space-y-5">
              <!-- Submit Button -->
              <button
                :disabled="isSubmitting"
                type="submit"
                class="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <span v-if="isSubmitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
                <span v-else class="flex items-center">
                  <Icon name="heroicons:user-plus" class="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Create Account
                </span>
              </button>

              <!-- Divider -->
              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-200" />
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="bg-white px-4 text-gray-500 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <!-- Google Auth Button -->
              <button 
                type="button" 
                class="group w-full flex items-center justify-center px-4 py-3.5 border border-gray-200 rounded-xl text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <Icon name="flat-color-icons:google" class="h-5 w-5 mr-3" />
                <span>Continue with Google</span>
              </button>

              <!-- Login Link -->
              <p class="text-center text-sm text-gray-600">
                Already have an account?
                <NuxtLink 
                  to="/auth/login" 
                  class="font-semibold text-teal-600 hover:text-teal-500 transition-colors duration-200"
                >
                  Sign in here
                </NuxtLink>
              </p>

              <!-- Back to Top Button -->
              <div class="flex justify-center pt-4">
                <button
                  type="button"
                  @click="hideForm"
                  class="flex items-center text-sm text-gray-500 hover:text-teal-600 transition-colors duration-200"
                >
                  <Icon name="heroicons:chevron-up" class="h-4 w-4 mr-1" />
                  Back to top
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useForm } from 'vee-validate';
import { required, min, email, confirmed } from '@vee-validate/rules';
import { defineRule } from 'vee-validate';

defineRule('required', required);
defineRule('min', min);
defineRule('email', email);
defineRule('confirmed', confirmed);

definePageMeta({
  layout: 'auth',
});

const authStore = useAuthStore();
const router = useRouter();

const showForm = ref(true); // Default to true so form is always shown
const headerSection = ref<HTMLElement | null>(null);
const formSection = ref<HTMLElement | null>(null);

const { handleSubmit, isSubmitting } = useForm();

// Always show form on mount with your specific nested checks
onMounted(() => {
  showForm.value = true;
  nextTick(() => {
    if (formSection.value) {
      setTimeout(() => {
        if (formSection.value) {
          if (formSection.value) {
            if (formSection.value) {
              if (formSection.value) {
                if (formSection.value) {
                  formSection.value.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                  });
                }
              }
            }
          }
        }
      }, 100);
    }
  });
});

const toggleForm = async () => {
  showForm.value = !showForm.value;
  await nextTick();
  
  if (showForm.value && formSection.value) {
    setTimeout(() => {
      formSection.value.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
  } else if (!showForm.value && headerSection.value) {
    headerSection.value.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }
};

const hideForm = () => {
  window.scrollTo({ 
    top: 0, 
    behavior: 'smooth' 
  });
  setTimeout(() => {
    showForm.value = false;
  }, 300);
};

const onSubmit = handleSubmit(async (values) => {
  try {
    await authStore.register({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });
    
    router.push({ path: '/auth/login', query: { registered: 'true' } });
  } catch (error: any) {
    if (error.data && error.data.error) {
      alert(`Registration failed: ${error.data.error}`);
    } else {
      alert('An unknown error occurred during registration.');
    }
  }
});
</script>

<style scoped>
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
