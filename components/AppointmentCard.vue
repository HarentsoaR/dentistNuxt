<!-- components/AppointmentCard.vue -->
<script setup lang="ts">
import { format } from 'date-fns';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  appointment: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();

// Helper to format dates nicely, e.g., "May 25, 2024"
const formattedDate = computed(() => {
  return format(new Date(props.appointment.startTime), 'MMMM d, yyyy');
});

// Helper to format times, e.g., "10:00 AM - 11:00 AM"
const formattedTime = computed(() => {
  const start = format(new Date(props.appointment.startTime), 'p');
  const end = format(new Date(props.appointment.endTime), 'p');
  return `${start} - ${end}`;
});

// A computed property for status styling
const statusClasses = computed(() => {
  switch (props.appointment.status) {
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
});

const statusIcon = computed(() => {
  switch (props.appointment.status) {
    case 'Scheduled':
      return 'heroicons:calendar-days-20-solid';
    case 'Completed':
      return 'heroicons:check-circle-20-solid';
    case 'Cancelled':
      return 'heroicons:x-circle-20-solid';
    default:
      return 'heroicons:question-mark-circle-20-solid';
  }
});
</script>

<template>
  <div class="rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
    <div class="p-5">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-800">{{ appointment.service }}</h3>
        <span
          class="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium"
          :class="statusClasses"
        >
          <Icon :name="statusIcon" class="h-4 w-4" />
          {{ t('appointments.status.' + appointment.status.toLowerCase()) }}
        </span>
      </div>
      <p class="mt-1 text-sm text-gray-500">{{ t('component.appointmentCard.withDoctor', { doctorName: 'Smiles' }) }}</p>
    </div>
    <div class="border-t border-gray-200 bg-gray-50 px-5 py-3">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <Icon name="heroicons:calendar-20-solid" class="h-5 w-5 text-gray-400" />
          <span>{{ formattedDate }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="heroicons:clock-20-solid" class="h-5 w-5 text-gray-400" />
          <span>{{ formattedTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>