<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p class="mt-2 text-gray-600">Insights and analytics for your dental practice</p>
      </div>
      <div class="flex items-center gap-3">
        <select class="px-4 py-2 border border-gray-300 rounded-lg">
          <option>Last 30 days</option>
          <option>Last 3 months</option>
          <option>Last year</option>
        </select>
        <button class="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 flex items-center font-medium">
          <Icon name="heroicons:arrow-down-tray" class="h-4 w-4 mr-2" />
          Export
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
            <p class="text-3xl font-bold text-gray-900">$24,580</p>
            <p class="text-sm text-green-600">+12% from last month</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:currency-dollar" class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Patients</p>
            <p class="text-3xl font-bold text-gray-900">1,247</p>
            <p class="text-sm text-blue-600">+8% from last month</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:user-group" class="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Appointments</p>
            <p class="text-3xl font-bold text-gray-900">342</p>
            <p class="text-sm text-purple-600">+15% from last month</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:calendar-days" class="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Satisfaction</p>
            <p class="text-3xl font-bold text-gray-900">4.8/5</p>
            <p class="text-sm text-yellow-600">+0.2 from last month</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Icon name="heroicons:star" class="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Chart -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
          <p class="text-gray-500">Chart placeholder - Revenue over time</p>
        </div>
      </div>

      <!-- Appointment Types -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Appointment Types</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
          <p class="text-gray-500">Chart placeholder - Appointment distribution</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div class="space-y-4">
        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:check" class="h-5 w-5 text-green-600" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">Appointment completed</p>
            <p class="text-sm text-gray-600">John Smith - Dental Cleaning</p>
          </div>
          <span class="text-sm text-gray-500">2 hours ago</span>
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
