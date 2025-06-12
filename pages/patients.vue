<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Patients</h1>
        <p class="mt-2 text-gray-600">Manage patient records and information</p>
      </div>
      <button class="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 flex items-center font-medium">
        <Icon name="heroicons:plus" class="h-4 w-4 mr-2" />
        Add New Patient
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
        <select class="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent">
          <option>All Patients</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>
    </div>

    <!-- Patients List -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">Patient Records</h3>
      </div>
      
      <div class="divide-y divide-gray-200">
        <div v-for="patient in patients" :key="patient.id" 
             class="p-6 hover:bg-gray-50 transition-colors duration-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {{ patient.initials }}
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">{{ patient.name }}</h4>
                <p class="text-sm text-gray-600">{{ patient.email }}</p>
                <p class="text-sm text-gray-500">Last visit: {{ patient.lastVisit }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="patient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                {{ patient.status }}
              </span>
              <button class="text-teal-600 hover:text-teal-700 font-medium text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { definePageMeta } from '#imports';

definePageMeta({
  layout: 'default'
})

// Sample patient data
const patients = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    initials: 'JS',
    lastVisit: 'Dec 10, 2024',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    initials: 'SJ',
    lastVisit: 'Dec 8, 2024',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike.w@email.com',
    initials: 'MW',
    lastVisit: 'Nov 25, 2024',
    status: 'Inactive'
  }
]
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
