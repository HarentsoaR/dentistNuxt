<template>  
  <NuxtLink  
    :to="to"  
    class="group relative flex items-center gap-3 rounded-lg p-3 text-gray-700 hover:bg-teal-100 transition-colors duration-200"  
    :class="collapsed ? 'justify-center' : 'justify-start'"  
    @click="$emit('navigate')"  
  >  
    <component :is="icon" class="h-6 w-6 shrink-0" />  
    <span  
      class="whitespace-nowrap text-sm font-medium transition-opacity duration-200"  
      :class="collapsed ? 'opacity-0' : 'opacity-100'"  
    >  
      {{ label }}  
    </span>  
  
    <!-- Tooltip when collapsed -->  
    <span  
      v-if="collapsed"  
      class="pointer-events-none absolute left-full ml-2 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block"  
    >  
      {{ label }}  
    </span>  
  </NuxtLink>  
</template>  
  
<script setup lang="ts">  
defineProps({  
  to: String,  
  icon: [String, Object],  
  label: String,  
  collapsed: Boolean,  
})  
defineEmits(['navigate'])  
</script>  