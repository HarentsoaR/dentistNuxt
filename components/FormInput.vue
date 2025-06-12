<template>
  <div class="relative group">
    <label 
      :for="name" 
      class="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-teal-600"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
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
        :type="type"
        :placeholder="placeholder"
        :required="required"
        @blur="handleBlur"
        @focus="onFocus"
        class="block w-full py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 hover:border-gray-300 bg-gray-50/50 focus:bg-white shadow-sm focus:shadow-md"
        :class="{
          'pl-10': icon,
          'pl-4': !icon,
          'pr-10': !errorMessage && value && isTouched,
          'pr-4': !(!errorMessage && value && isTouched),
          'border-red-300 focus:ring-red-500 bg-red-50': errorMessage,
          'focus:ring-teal-500': !errorMessage,
        }"
      />

      <!-- Success indicator -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-75"
        enter-to-class="opacity-100 scale-100"
      >
        <div 
          v-if="!errorMessage && value && isTouched"
          class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
        >
          <Icon name="heroicons:check-circle" class="h-5 w-5 text-emerald-500" />
        </div>
      </Transition>
    </div>

    <!-- Error message with animation -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 transform -translate-y-1"
      enter-to-class="opacity-100 transform translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 transform translate-y-0"
      leave-to-class="opacity-0 transform -translate-y-1"
    >
      <p v-if="errorMessage" class="mt-2 text-sm text-red-600 flex items-center gap-1">
        <Icon name="heroicons:exclamation-circle" class="h-4 w-4 flex-shrink-0" />
        {{ errorMessage }}
      </p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import { ref } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  type: { type: String, default: 'text' },
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  icon: { type: String, default: '' },
  required: { type: Boolean, default: false },
});

const isTouched = ref(false);
const { value, errorMessage, handleBlur } = useField(props.name);

const onFocus = () => {
  isTouched.value = true;
};
</script>
