<template>
  <div>
    <!-- Header Section - Always Visible -->
    <div ref="headerSection" class="text-center mb-8 transition-all duration-700 ease-in-out"
      :class="showForm ? 'transform -translate-y-4 opacity-70 scale-95' : 'transform translate-y-0 opacity-100 scale-100'">
      <transition name="pop-float" appear>
        <div class="flex justify-center mb-6" key="logo">
          <div class="relative flex items-center justify-center">
            <div class="absolute inset-0 rounded-full backdrop-blur-md bg-black/30 shadow-2xl z-0"></div>
            <div class="relative z-10 animate-float">
              <Icon name="twemoji:tooth" class="logo-big drop-shadow-lg"
                style="filter: drop-shadow(0 2px 12px #00dc82cc);" />
            </div>
          </div>
        </div>
      </transition>
      <transition name="fade-slide" appear>
        <TextPressure text="DentaCare Pro" fontFamily="Compressa VF"
          fontUrl="https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2" :width="true"
          :weight="true" :italic="false" :alpha="false" :flex="true" :stroke="false" :scale="false" textColor="#38bdf8"
          className="mb-2 text-4xl font-semibold" :minFontSize="78" />
      </transition>
      <BlurText text="Professional Dental Care Management"
        class="text-gray-600 font-medium text-lg text-center w-full flex justify-center" animateBy="words"
        direction="top" />
    </div>

    <!-- Expand Button -->
    <div class="flex justify-center mb-8">
      <button @click="toggleForm"
        class="group flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#00dc82] to-[#38bdf8] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#38bdf8]"
        :class="showForm ? 'rotate-180' : 'rotate-0'">
        <Icon name="heroicons:chevron-down" class="h-6 w-6 text-white transition-transform duration-300" />
      </button>
    </div>

    <!-- Form Container -->
    <transition enter-active-class="transition-all duration-700 ease-out"
      enter-from-class="opacity-0 transform translate-y-8 scale-95"
      enter-to-class="opacity-100 transform translate-y-0 scale-100"
      leave-active-class="transition-all duration-500 ease-in"
      leave-from-class="opacity-100 transform translate-y-0 scale-100"
      leave-to-class="opacity-0 transform -translate-y-4 scale-95">
      <div v-if="showForm" ref="formSection"
        class="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-[#38bdf8]/20 max-w-4xl mx-auto">
        <!-- Form Content -->
        <div class="space-y-6">
          <!-- Header -->
          <div class="text-center mb-6" ref="formHeader">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p class="text-gray-600 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form class="space-y-6" @submit.prevent="onSubmit">
            <!-- Two Column Layout for Form Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column -->
              <div class="space-y-5">
                <FormInput name="fullName" type="text" label="Full Name" placeholder="John Doe" icon="heroicons:user"
                  :rules="{ required: true }" />

                <FormInput name="email" type="email" label="Email Address" placeholder="you@example.com"
                  icon="heroicons:envelope" :rules="{ required: true, email: true }" />

                <FormInput name="phone" type="tel" label="Phone Number" placeholder="+1 (555) 123-4567"
                  icon="heroicons:phone" :rules="{ required: true, min: 10 }" />
              </div>

              <!-- Right Column -->
              <div class="space-y-5">
                <PasswordInput name="password" label="Password" placeholder="Create a strong password"
                  icon="heroicons:lock-closed" :rules="{ required: true, min: 8 }" />

                <PasswordInput name="confirmPassword" label="Confirm Password" placeholder="Confirm your password"
                  icon="heroicons:lock-closed" :rules="{ required: true, confirmed: '@password' }"
                  confirm-field="password" />
              </div>
            </div>

            <!-- Full Width Elements -->
            <div class="space-y-5">
              <!-- Submit Button -->
              <button :disabled="isSubmitting" type="submit"
                class="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-[#00dc82] to-[#38bdf8] hover:from-[#38bdf8] hover:to-[#00dc82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#38bdf8] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl">
                <span class="flex items-center">
                  <Icon name="heroicons:user-plus"
                    class="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
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
              <GoogleAuthButton />

              <!-- Login Link -->
              <p class="text-center text-sm text-gray-600">
                Already have an account?
                <NuxtLink to="/auth/login?from=register"
                  class="font-semibold text-[#00dc82] hover:text-[#38bdf8] transition-colors duration-200">
                  Sign in here
                </NuxtLink>
              </p>

              <!-- Back to Top Button -->
              <div class="flex justify-center pt-4">
                <button type="button" @click="hideForm"
                  class="flex items-center text-sm text-[#0e1628] hover:text-[#00dc82] transition-colors duration-200">
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
import { useNotificationStore } from '~/stores/notification';
import TextPressure from '~/components/ui/Text/TextPressure.vue';
import BlurText from '~/components/ui/Text/BlurText.vue';
import GoogleAuthButton from '~/components/ui/button/GoogleAuthButton.vue';

defineRule('required', required);
defineRule('min', min);
defineRule('email', email);
defineRule('confirmed', confirmed);

definePageMeta({
  layout: 'auth',
});

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();

const showForm = ref(true);
const headerSection = ref<HTMLElement | null>(null);
const formSection = ref<HTMLElement | null>(null);
const formHeader = ref<HTMLElement | null>(null);

const { handleSubmit, isSubmitting } = useForm();

// Always show form on mount with your specific nested checks
onMounted(() => {
  showForm.value = true;
  nextTick(() => {
    if (formSection.value) {
      setTimeout(() => {
        if (formSection.value) {
          formSection.value.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    }
  });
});

const toggleForm = async () => {
  showForm.value = !showForm.value;
  await nextTick();

  if (showForm.value && formHeader.value) {
    setTimeout(() => {
      formHeader.value?.scrollIntoView({
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
    // Error handling is now done in the auth store
    console.error('Registration error:', error);
  }
});
</script>

<style scoped>
@keyframes ping {

  75%,
  100% {
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

@keyframes slide-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }

  100% {
    background-position: 400px 0;
  }
}

.animate-shimmer {
  background-size: 200% auto;
  animation: shimmer 2.5s linear infinite;
}

/* Platform-specific adjustments */
@media screen and (-webkit-min-device-pixel-ratio: 2) {
  .text-4xl {
    font-size: 2.5rem;
    line-height: 1.2;
  }

  .h-12 {
    height: 3rem;
  }

  .w-12 {
    width: 3rem;
  }
}

.logo-big {
  width: 5em;
  height: 5em;
  max-width: 100px;
  max-height: 100px;
  margin-bottom: 0.5em;
}
</style>
