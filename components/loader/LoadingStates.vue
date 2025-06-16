<template>
  <div>
    <!-- List Skeleton -->
    <template v-if="type === 'list'">
      <div v-for="i in count" :key="i" class="flex items-center space-x-4 py-4 animate-pulse">
        <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div class="flex-1">
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-gray-100 rounded w-1/3"></div>
        </div>
      </div>
    </template>
    <!-- Card Skeleton -->
    <template v-else>
      <div v-for="i in count" :key="i" class="p-6 bg-white rounded-2xl shadow mb-4 animate-pulse">
        <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div class="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
        <div class="h-4 bg-gray-100 rounded w-1/2"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'list' },
  count: { type: Number, default: 3 }
})
</script>
