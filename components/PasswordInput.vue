<template>
  <div class="relative group">
    <label 
      :for="name" 
      class="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-teal-600"
    >
      {{ label }}
      <span class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <!-- Icon inside the input field -->
      <div 
        v-if="icon" 
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200"
        :class="errorMessage ? 'text-red-400' : 'text-gray-400 group-focus-within:text-teal-500'"
      >
        <Icon :name="icon" class="h-5 w-5" />
      </div>

      <input
        :id="name"
        v-model="value"
        :name="name"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        required
        @blur="handleBlur"
        @focus="onFocus"
        @input="checkPasswordStrength"
        class="block w-full py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white shadow-sm focus:shadow-md"
        :class="{
          'pl-10': icon,
          'pl-4': !icon,
          'pr-12': true,
          'border-red-300 focus:ring-red-500 bg-red-50': errorMessage,
          'focus:ring-teal-500': !errorMessage,
        }"
      />

      <!-- Password toggle button -->
      <button
        type="button"
        @click="showPassword = !showPassword"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
      >
        <Icon :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'" class="h-5 w-5" />
      </button>
    </div>

    <!-- Password Strength Indicator -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 transform -translate-y-2"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform -translate-y-2"
    >
      <div v-if="value && isTouched && !confirmField" class="mt-3 space-y-2">
        <!-- Strength Bar -->
        <div class="flex space-x-1">
          <div 
            v-for="i in 4" 
            :key="i"
            class="h-2 flex-1 rounded-full transition-all duration-300"
            :class="getStrengthBarColor(i)"
          ></div>
        </div>
        
        <!-- Strength Text -->
        <p class="text-sm font-medium" :class="getStrengthTextColor()">
          {{ getStrengthText() }}
        </p>

        <!-- Requirements List -->
        <div class="space-y-1">
          <div class="flex items-center space-x-2 text-sm">
            <Icon 
              :name="hasMinLength ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
              class="h-4 w-4 flex-shrink-0"
              :class="hasMinLength ? 'text-emerald-500' : 'text-gray-400'"
            />
            <span :class="hasMinLength ? 'text-emerald-700' : 'text-gray-500'">
              At least 8 characters
            </span>
          </div>
          
          <div class="flex items-center space-x-2 text-sm">
            <Icon 
              :name="hasNumber ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
              class="h-4 w-4 flex-shrink-0"
              :class="hasNumber ? 'text-emerald-500' : 'text-gray-400'"
            />
            <span :class="hasNumber ? 'text-emerald-700' : 'text-gray-500'">
              Contains a number
            </span>
          </div>
          
          <div class="flex items-center space-x-2 text-sm">
            <Icon 
              :name="hasSymbol ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
              class="h-4 w-4 flex-shrink-0"
              :class="hasSymbol ? 'text-emerald-500' : 'text-gray-400'"
            />
            <span :class="hasSymbol ? 'text-emerald-700' : 'text-gray-500'">
              Contains a symbol
            </span>
          </div>
          
          <div class="flex items-center space-x-2 text-sm">
            <Icon 
              :name="hasUppercase ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
              class="h-4 w-4 flex-shrink-0"
              :class="hasUppercase ? 'text-emerald-500' : 'text-gray-400'"
            />
            <span :class="hasUppercase ? 'text-emerald-700' : 'text-gray-500'">
              Contains uppercase letter
            </span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Confirm Password Match Indicator -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 transform -translate-y-2"
      enter-to-class="opacity-100 transform translate-y-0"
    >
      <div v-if="confirmField && value && isTouched" class="mt-2">
        <div class="flex items-center space-x-2 text-sm">
          <Icon 
            :name="passwordsMatch ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
            class="h-4 w-4 flex-shrink-0"
            :class="passwordsMatch ? 'text-emerald-500' : 'text-red-500'"
          />
          <span :class="passwordsMatch ? 'text-emerald-700' : 'text-red-600'">
            {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
          </span>
        </div>
      </div>
    </Transition>

    <!-- Error message -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 transform -translate-y-1"
      enter-to-class="opacity-100 transform translate-y-0"
    >
      <p v-if="errorMessage" class="mt-2 text-sm text-red-600 flex items-center gap-1">
        <Icon name="heroicons:exclamation-circle" class="h-4 w-4 flex-shrink-0" />
        {{ errorMessage }}
      </p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useField, useFormValues } from 'vee-validate';
import { ref, computed } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  icon: { type: String, default: '' },
  confirmField: { type: String, default: '' },
});

const showPassword = ref(false);
const isTouched = ref(false);
const passwordStrength = ref(0);

const { value, errorMessage, handleBlur } = useField(() => props.name);
const formValues = useFormValues();

// Password requirements
const hasMinLength = computed(() => value.value && value.value.length >= 8);
const hasNumber = computed(() => value.value && /\d/.test(value.value));
const hasSymbol = computed(() => value.value && /[!@#$%^&*(),.?":{}|<>]/.test(value.value));
const hasUppercase = computed(() => value.value && /[A-Z]/.test(value.value));

// Password match for confirm password
const passwordsMatch = computed(() => {
  if (!props.confirmField) return true;
  return value.value === formValues.value[props.confirmField];
});

const onFocus = () => {
  isTouched.value = true;
};

const checkPasswordStrength = () => {
  if (!value.value) {
    passwordStrength.value = 0;
    return;
  }

  let strength = 0;
  if (hasMinLength.value) strength++;
  if (hasNumber.value) strength++;
  if (hasSymbol.value) strength++;
  if (hasUppercase.value) strength++;

  passwordStrength.value = strength;
};

const getStrengthBarColor = (index: number) => {
  if (index <= passwordStrength.value) {
    switch (passwordStrength.value) {
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-emerald-500';
      default:
        return 'bg-gray-200';
    }
  }
  return 'bg-gray-200';
};

const getStrengthTextColor = () => {
  switch (passwordStrength.value) {
    case 1:
      return 'text-red-600';
    case 2:
      return 'text-orange-600';
    case 3:
      return 'text-yellow-600';
    case 4:
      return 'text-emerald-600';
    default:
      return 'text-gray-500';
  }
};

const getStrengthText = () => {
  switch (passwordStrength.value) {
    case 1:
      return 'Weak password';
    case 2:
      return 'Fair password';
    case 3:
      return 'Good password';
    case 4:
      return 'Strong password';
    default:
      return 'Enter a password';
  }
};
</script>
