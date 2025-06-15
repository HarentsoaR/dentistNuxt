<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 px-4 sm:px-6 lg:px-8 font-inter">
    <div class="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 animate-fade-in-down">Appointment Calendar</h1>
            <p class="text-lg text-gray-600 animate-fade-in-down delay-100">View and manage all patient appointments in a calendar format</p>
          </div>
          <div class="flex items-center gap-3 animate-fade-in-down delay-200">
            <!-- Month/Year Picker Button -->
            <div class="relative">
              <button @click="showDatePicker = !showDatePicker"
                      class="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center shadow-sm">
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="font-medium">{{ format(currentDate, 'MMM yyyy') }}</span>
                <svg class="h-4 w-4 ml-2 transform transition-transform duration-200" :class="{ 'rotate-180': showDatePicker }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <!-- Compact Date Picker Dropdown -->
              <div v-if="showDatePicker"
                   class="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-64 z-50 animate-scale-in origin-top-right">
                <!-- Year and Month Selection -->
                <div class="flex items-center justify-between mb-3">
                  <button @click="previousMonth" class="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">
                    <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>
                  <div class="flex items-center gap-2">
                    <select v-model="selectedYear"
                            class="text-sm font-semibold bg-transparent border-none focus:ring-0 text-gray-800 p-1 rounded-md">
                      <option v-for="year in availableYears" :key="year" :value="year">
                        {{ year }}
                      </option>
                    </select>
                    <select v-model="selectedMonth"
                            class="text-sm font-semibold bg-transparent border-none focus:ring-0 text-gray-800 p-1 rounded-md">
                      <option v-for="(month, index) in months" :key="month" :value="index">
                        {{ month }}
                      </option>
                    </select>
                  </div>
                  <button @click="nextMonth" class="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200">
                    <svg class="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>

                <!-- Days Grid -->
                <div class="grid grid-cols-7 gap-1">
                  <!-- Day Headers -->
                  <div v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']"
                       :key="day"
                       class="text-xs text-center text-gray-500 font-medium py-1">
                    {{ day }}
                  </div>
                  
                  <!-- Days -->
                  <div v-for="day in calendarDays" :key="day.date"
                       @click="selectDateFromPicker(day)"
                       class="aspect-square flex items-center justify-center text-sm font-semibold rounded-lg cursor-pointer transition-colors duration-200 hover:bg-blue-50"
                       :class="{
                         'text-gray-400': !day.isCurrentMonth,
                         'bg-blue-600 text-white shadow-md hover:bg-blue-700': isSelectedDate(day.date),
                         'text-teal-600 font-bold': day.isToday && !isSelectedDate(day.date),
                         'bg-blue-100 text-blue-700': day.hasAppointments && !day.isToday && !isSelectedDate(day.date)
                       }">
                    {{ day.day }}
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="flex justify-between mt-4 pt-3 border-t border-gray-100">
                  <button @click="goToToday"
                          class="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                    Today
                  </button>
                  <button @click="closeDatePicker"
                          class="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200">
                    Close
                  </button>
                </div>
              </div>
            </div>

            <button @click="previousMonth" class="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center shadow-sm">
              <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Previous
            </button>
            <button @click="goToToday" class="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center shadow-sm">
              Today
            </button>
            <button @click="nextMonth" class="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center shadow-sm">
              Next
              <svg class="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar View -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up delay-300">
        <!-- Calendar Header -->
        <div class="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-white">{{ currentMonthYear }}</h2>
            <div class="flex items-center gap-2">
              <button @click="previousMonth" class="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <button @click="nextMonth" class="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="p-6">
          <!-- Days of Week -->
          <div class="grid grid-cols-7 gap-2 mb-4">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day"
                 class="p-3 text-center text-sm font-bold text-gray-700">
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-2">
            <div v-for="day in calendarDays" :key="day.date"
                 @click="selectDay(day)"
                 class="min-h-[100px] sm:min-h-[140px] p-2 sm:p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer relative group-hover:scale-[1.02]"
                 :class="{
                   'bg-gray-50/50 text-gray-400': !day.isCurrentMonth,
                   'bg-teal-50 border-teal-200 shadow-sm': day.isToday,
                   'bg-blue-50 border-blue-200 shadow-sm': day.hasAppointments && !day.isToday,
                   'ring-2 ring-blue-500 ring-offset-2': selectedDate === day.date,
                   'hover:shadow-md': day.isCurrentMonth
                 }">
              <!-- Day Number -->
              <div class="text-xs sm:text-sm font-bold mb-1"
                   :class="{
                     'text-teal-600': day.isToday,
                     'text-gray-400': !day.isCurrentMonth
                   }">
                {{ day.day }}
              </div>

              <!-- Appointments -->
              <div v-if="day.appointments?.length" class="space-y-1">
                <div v-for="apt in day.appointments.slice(0, 2)" :key="apt.id"
                     class="text-[10px] sm:text-xs bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate hover:bg-blue-200 transition-colors shadow-xs"
                     @click.stop="showAppointmentDetails(apt)">
                  <div class="flex items-center justify-between">
                    <span class="font-medium">{{ formatTime(apt.startTime) }}</span>
                    <span class="ml-1 sm:ml-2 text-blue-600 truncate">{{ apt.patientName }}</span>
                  </div>
                </div>
                <div v-if="day.appointments.length > 2"
                     class="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 cursor-pointer bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-blue-100 transition-colors shadow-xs"
                     @click.stop="showDayDetails(day)">
                  <div class="flex items-center justify-between">
                    <span>+{{ day.appointments.length - 2 }} more</span>
                    <svg class="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Today Indicator -->
              <div v-if="day.isToday && !isSelectedDate(day.date)"
                   class="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full ring-1 ring-white"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Day Appointments -->
      <div v-if="selectedDate"
           ref="appointmentsListRef"
           class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-fade-in-up delay-400">
        <h3 class="text-xl font-bold text-gray-900 mb-4">
          Appointments for {{ formatSelectedDate }}
        </h3>
        <div v-if="selectedDayAppointments.length === 0" class="text-center py-8 text-gray-500">
          No appointments scheduled for this day.
        </div>
        <div v-else class="space-y-3">
          <div v-for="apt in sortedDayAppointments" :key="apt.id"
               class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group shadow-sm hover:shadow-md"
               @click="showAppointmentDetails(apt)">
            <div class="w-16 h-16 bg-blue-100 rounded-xl flex flex-col items-center justify-center shrink-0">
              <span class="text-sm font-medium text-blue-600">{{ formatTime(apt.startTime) }}</span>
              <span class="text-xs text-blue-500">{{ formatTime(apt.endTime) }}</span>
            </div>
            <div class="flex-1">
              <p class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base">{{ apt.service }}</p>
              <p class="text-sm text-gray-700">Patient: <span class="font-medium">{{ apt.patientName }}</span></p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span :class="getStatusClasses(apt.status)" class="px-3 py-1 rounded-full text-sm font-medium status-badge">
                {{ apt.status }}
              </span>
              <svg class="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Details Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="selectedAppointment"
           class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
           @click.self="closeAppointmentDetails">
        <div class="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl transform transition-all duration-300 animate-scale-in">
          <!-- Header Section -->
          <div class="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 mb-1">{{ selectedAppointment.service }}</h3>
              <p class="text-sm text-gray-500">Appointment Details</p>
            </div>
            <button @click="closeAppointmentDetails"
                    class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-full">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Content Section -->
          <div class="space-y-6">
            <!-- Date & Time Section -->
            <div class="flex items-start gap-5 group">
              <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shrink-0">
                <svg class="h-7 w-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="flex-1 pt-1">
                <p class="text-sm font-medium text-gray-500 mb-1">Date & Time</p>
                <p class="text-lg font-semibold text-gray-900 mb-1">
                  {{ formatDate(selectedAppointment.startTime) }}
                </p>
                <p class="text-base text-gray-600">
                  {{ formatTime(selectedAppointment.startTime) }} - {{ formatTime(selectedAppointment.endTime) }}
                  <span class="text-gray-500 ml-2">({{ formatDuration(selectedAppointment.startTime, selectedAppointment.endTime) }})</span>
                </p>
              </div>
            </div>

            <!-- Patient Section -->
            <div class="flex items-start gap-5 group">
              <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shrink-0">
                <svg class="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div class="flex-1 pt-1">
                <p class="text-sm font-medium text-gray-500 mb-1">Patient</p>
                <p class="text-lg font-semibold text-gray-900">{{ selectedAppointment.patientName }}</p>
              </div>
            </div>

            <!-- Status Section -->
            <div class="flex items-start gap-5 group">
              <div class="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shrink-0">
                <svg class="h-7 w-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7l10 10m0-10L7 17"></path>
                </svg>
              </div>
              <div class="flex-1 pt-1">
                <p class="text-sm font-medium text-gray-500 mb-1">Status</p>
                <span :class="getStatusClasses(selectedAppointment.status)"
                      class="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 status-badge">
                  {{ selectedAppointment.status }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
            <button @click="closeAppointmentDetails"
                    class="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium shadow-sm">
              Close
            </button>
            <button v-if="selectedAppointment.status === 'Confirmed' || selectedAppointment.status === 'Pending'"
                    @click="openCompleteModal(selectedAppointment)"
                    class="flex-1 px-6 py-3 text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium shadow-sm">
              Mark as Complete
            </button>
            <button v-if="selectedAppointment.status === 'Confirmed' || selectedAppointment.status === 'Pending'"
                    @click="openCancelModal(selectedAppointment)"
                    class="flex-1 px-6 py-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] font-medium shadow-sm">
              Cancel Appointment
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- All Day Appointments Modal -->
    <div v-if="showAllDayAppointments && selectedDay"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
         @click.self="closeAllDayAppointments">
      <div class="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl transform animate-scale-in">
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h3 class="text-xl font-bold text-gray-900">
              All Appointments for {{ formatDate(selectedDay.date) }}
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ allDayAppointments.length }} appointment{{ allDayAppointments.length !== 1 ? 's' : '' }} scheduled
            </p>
          </div>
          <button @click="closeAllDayAppointments" class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-3">
          <div v-for="apt in allDayAppointments" :key="apt.id"
               class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group shadow-sm hover:shadow-md"
               @click="showAppointmentDetails(apt)">
            <div class="w-16 h-16 bg-blue-100 rounded-xl flex flex-col items-center justify-center shrink-0">
              <span class="text-sm font-medium text-blue-600">{{ formatTime(apt.startTime) }}</span>
              <span class="text-xs text-blue-500">{{ formatTime(apt.endTime) }}</span>
            </div>
            <div class="flex-1">
              <p class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base">{{ apt.service }}</p>
              <p class="text-sm text-gray-700">Patient: <span class="font-medium">{{ apt.patientName }}</span></p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span :class="getStatusClasses(apt.status)" class="px-3 py-1 rounded-full text-sm font-medium status-badge">
                {{ apt.status }}
              </span>
              <svg class="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button @click="closeAllDayAppointments"
                  class="px-5 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Modals for Cancel/Complete - Reusing logic from manage.vue -->
    <!-- Cancel Appointment Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform scale-95 animate-scale-in">
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Cancel Appointment</h3>
          <p class="text-gray-600">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
        </div>

        <div v-if="appointmentToCancel" class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
          <div class="flex items-center">
            <div class="text-2xl mr-3">{{ getServiceIcon(appointmentToCancel.service) }}</div>
            <div>
              <div class="font-semibold text-gray-900">{{ appointmentToCancel.service }}</div>
              <div class="text-sm text-gray-700">Patient: {{ appointmentToCancel.patientName || 'N/A' }}</div>
              <div class="text-sm text-gray-600">
                {{ formatDate(appointmentToCancel.startDate) }} at {{ formatTime(appointmentToCancel.startDate) }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="closeCancelModal"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-sm"
          >
            Keep Appointment
          </button>
          <button
            @click="confirmCancelAppointment"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            <svg v-if="isLoading" class="animate-spin w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isLoading">Cancelling...</span>
            <span v-else>Yes, Cancel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mark as Complete Modal -->
    <div v-if="showCompleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform scale-95 animate-scale-in">
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Complete Appointment</h3>
          <p class="text-gray-600">Are you sure you want to mark this appointment as completed?</p>
        </div>

        <div v-if="appointmentToComplete" class="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
          <div class="flex items-center">
            <div class="text-2xl mr-3">{{ getServiceIcon(appointmentToComplete.service) }}</div>
            <div>
              <div class="font-semibold text-gray-900">{{ appointmentToComplete.service }}</div>
              <div class="text-sm text-gray-700">Patient: {{ appointmentToComplete.patientName || 'N/A' }}</div>
              <div class="text-sm text-gray-600">
                {{ formatDate(appointmentToComplete.startDate) }} at {{ formatTime(appointmentToComplete.startDate) }}
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="closeCompleteModal"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-sm"
          >
            No, Keep Pending
          </button>
          <button
            @click="confirmCompleteAppointment"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center shadow-md hover:shadow-lg"
          >
            <svg v-if="isLoading" class="animate-spin w-5 h-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isLoading">Completing...</span>
            <span v-else>Yes, Mark as Complete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isToday, isSameDay, getDay, addDays } from 'date-fns';
import { definePageMeta } from '#imports';
import { useAuthStore } from '~/stores/auth'; // Assuming your auth store is correctly path-aliased

definePageMeta({
  layout: 'default'
});

// Define the Appointment interface with added patientName
interface Appointment {
  id: string;
  service: string;
  patientName: string; // Added for dentist's view
  startTime: string;
  endTime: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  startDate: Date; // These will be populated in fetchAppointments
  endDate: Date;   // These will be populated in fetchAppointments
}

// Define CalendarDay interface for computed calendarDays
interface CalendarDay {
  day: number;
  date: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasAppointments: boolean;
  appointments: Appointment[];
}

const authStore = useAuthStore();
const currentDate = ref(new Date()); // The date currently being displayed by the calendar
const selectedDate = ref<string | null>(null); // The specific date selected by the user (e.g., by clicking a day cell)
const selectedAppointment = ref<Appointment | null>(null); // The appointment selected for details
const appointments = ref<Appointment[]>([]); // All appointments fetched for the current month view
const isLoading = ref(false);
const showAllDayAppointments = ref(false); // Controls visibility of modal showing all appointments for a selected day
const selectedDay = ref<CalendarDay | null>(null); // The full day object when "show all" is clicked

// Modals for actions (reused from manage.vue concept)
const showCancelModal = ref(false);
const showCompleteModal = ref(false);
const appointmentToCancel = ref<Appointment | null>(null);
const appointmentToComplete = ref<Appointment | null>(null);

// Date Picker State
const showDatePicker = ref(false);
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth());

// Ref for the appointments list container for scrolling
const appointmentsListRef = ref<HTMLElement | null>(null);

// Available years (current year ± 2 years) for dropdown
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i); // e.g., current-2, current-1, current, current+1, current+2
});

// Month names for dropdown
const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Computed property for the current month and year string in calendar header
const currentMonthYear = computed(() => {
  return format(currentDate.value, 'MMMM yyyy');
});

// Computed property to generate the array of days to display in the calendar grid
const calendarDays = computed<CalendarDay[]>(() => {
  const startOfCurrentMonth = startOfMonth(currentDate.value);
  const endOfCurrentMonth = endOfMonth(currentDate.value);
  
  // Determine the start day of the week (0 for Sunday, 6 for Saturday)
  const firstDayOfWeekOfMonth = getDay(startOfCurrentMonth);

  const days: CalendarDay[] = [];

  // Add days from the previous month to fill the first week
  const daysToPrepend = firstDayOfWeekOfMonth;
  for (let i = daysToPrepend; i > 0; i--) {
    const date = subMonths(startOfCurrentMonth, 0); // Start from current month's first day
    date.setDate(startOfCurrentMonth.getDate() - i); // Go back 'i' days
    days.push({
      day: date.getDate(),
      date: format(date, 'yyyy-MM-dd'),
      isCurrentMonth: false,
      isToday: isToday(date),
      hasAppointments: false, // Don't show appointments for prev/next month days
      appointments: []
    });
  }
  
  // Add days for the current month
  const totalDaysInMonth = endOfCurrentMonth.getDate();
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const date = new Date(startOfCurrentMonth.getFullYear(), startOfCurrentMonth.getMonth(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Filter appointments for this specific day
    const dayAppointments = appointments.value.filter(apt =>
      isSameDay(new Date(apt.startTime), date)
    );
    
    days.push({
      day: i,
      date: dateStr,
      isCurrentMonth: true,
      isToday: isToday(date),
      hasAppointments: dayAppointments.length > 0,
      appointments: dayAppointments
    });
  }
  
  // Add days from the next month to fill the calendar grid (to make it 6 weeks = 42 cells)
  const totalCells = 42;
  const daysToAppend = totalCells - days.length;
  for (let i = 1; i <= daysToAppend; i++) {
    const date = addDays(endOfCurrentMonth, i);
    days.push({
      day: date.getDate(),
      date: format(date, 'yyyy-MM-dd'),
      isCurrentMonth: false,
      isToday: isToday(date),
      hasAppointments: false, // Don't show appointments for prev/next month days
      appointments: []
    });
  }
  
  return days;
});

// Appointments for the currently selected day (in the list below the calendar)
const selectedDayAppointments = computed(() => {
  if (!selectedDate.value) return [];
  return appointments.value.filter(apt =>
    format(new Date(apt.startTime), 'yyyy-MM-dd') === selectedDate.value
  );
});

// Formatted string for the selected date
const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return '';
  return format(new Date(selectedDate.value), 'MMMM d, yyyy');
});

// Sorts selected day appointments by start time
const sortedDayAppointments = computed(() => {
  return [...selectedDayAppointments.value].sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
});

// All appointments for the day clicked to open the "All Day Appointments" modal
const allDayAppointments = computed(() => {
  if (!selectedDay.value) return [];
  return appointments.value
    .filter(apt => format(new Date(apt.startTime), 'yyyy-MM-dd') === selectedDay.value!.date)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
});

// Methods for calendar navigation
function previousMonth() {
  currentDate.value = subMonths(currentDate.value, 1);
  fetchAppointments();
}

function nextMonth() {
  currentDate.value = addMonths(currentDate.value, 1);
  fetchAppointments();
}

function goToToday() {
  currentDate.value = new Date();
  selectedDate.value = format(currentDate.value, 'yyyy-MM-dd');
  showDatePicker.value = false; // Close date picker when going to today
  fetchAppointments();
}

// Selects a day on the calendar grid
function selectDay(day: CalendarDay) {
  selectedDate.value = day.date;
  // Scroll to the appointments list if it's rendered
  nextTick(() => {
    if (appointmentsListRef.value) {
      appointmentsListRef.value.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
}

// Opens the appointment details modal
function showAppointmentDetails(appointment: Appointment) {
  selectedAppointment.value = {
    ...appointment,
    startDate: new Date(appointment.startTime),
    endDate: new Date(appointment.endTime)
  };
  // Close any other open modals (e.g., all day appointments modal)
  closeAllDayAppointments();
}

// Closes the appointment details modal
function closeAppointmentDetails() {
  selectedAppointment.value = null;
}

// Opens the modal for all appointments on a specific day (when "+X more" is clicked)
function showDayDetails(day: CalendarDay) {
  selectedDay.value = day;
  showAllDayAppointments.value = true;
}

// Closes the modal for all appointments on a specific day
function closeAllDayAppointments() {
  showAllDayAppointments.value = false;
  selectedDay.value = null;
}

// Utility function to format time (e.g., "9:00 AM")
function formatTime(dateString: string): string {
  return format(new Date(dateString), 'h:mm a');
}

// Utility function to format date (e.g., "June 15, 2025")
function formatDate(dateString: string | Date): string {
  return format(new Date(dateString), 'MMMM d, yyyy');
}

// Utility function to format duration (e.g., "1 hour 30 minutes")
function formatDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minutes`;
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (minutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
}

// Utility function to get Tailwind CSS classes for status badges
function getStatusClasses(status: Appointment['status']): string {
  const classes = {
    'Confirmed': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Completed': 'bg-blue-100 text-blue-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
}

// Utility function to get service icons (reused from manage.vue)
function getServiceIcon(service: string): string {
  const icons: Record<string, string> = {
    'Annual Check-up and Cleaning': '🦷',
    'Teeth Whitening': '✨',
    'Cavity Filling': '🔧',
    'Root Canal Therapy': '🩺',
    'Wisdom Tooth Extraction': '⚕️',
    'Dental Implant Consultation': '🦴',
    // Add more icons for other services
  };
  return icons[service] || '🦷';
}

// Fetches appointments for the currently displayed month
async function fetchAppointments() {
  if (!authStore.token) {
    // Optionally redirect to login or show a message
    return;
  }
  
  isLoading.value = true;
  try {
    const startDate = format(startOfMonth(currentDate.value), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(currentDate.value), 'yyyy-MM-dd');
    
    // Assuming this endpoint fetches all appointments for the specified date range
    const data = await $fetch<Appointment[]>(`https://dentistapi-production-92f7.up.railway.app/api/appointments?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    
    // Process the fetched data to include Date objects for easier comparison
    appointments.value = Array.isArray(data) ? data.map(apt => ({
      ...apt,
      startDate: new Date(apt.startTime),
      endDate: new Date(apt.endTime)
    })) : [];

    // Reset selected appointment and day modals if their data is no longer relevant to the new month
    if (selectedAppointment.value && !appointments.value.some(a => a.id === selectedAppointment.value!.id)) {
      selectedAppointment.value = null;
    }
    if (selectedDay.value && !isSameMonth(new Date(selectedDay.value.date), currentDate.value)) {
        closeAllDayAppointments();
    }
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    // Handle error state in UI if needed
  } finally {
    isLoading.value = false;
  }
}

// Cancellation logic (moved to confirm function for clarity with modal)
function openCancelModal(appointment: Appointment) {
  appointmentToCancel.value = appointment;
  closeAppointmentDetails(); // Close details modal first
  showCancelModal.value = true;
}

function closeCancelModal() {
  showCancelModal.value = false;
  appointmentToCancel.value = null;
}

async function confirmCancelAppointment() {
  if (!appointmentToCancel.value) return;
  isLoading.value = true;
  try {
    await $fetch(`https://dentistapi-production-92f7.up.railway.app/api/appointments/${appointmentToCancel.value.id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    await fetchAppointments(); // Re-fetch to update status on calendar
    closeCancelModal();
  } catch (error) {
    console.error('Failed to cancel appointment:', error);
  } finally {
    isLoading.value = false;
  }
}

// Mark as Complete logic
function openCompleteModal(appointment: Appointment) {
  appointmentToComplete.value = appointment;
  closeAppointmentDetails(); // Close details modal first
  showCompleteModal.value = true;
}

function closeCompleteModal() {
  showCompleteModal.value = false;
  appointmentToComplete.value = null;
}

async function confirmCompleteAppointment() {
  if (!appointmentToComplete.value) return;
  isLoading.value = true;
  try {
    await $fetch(`https://dentistapi-production-92f7.up.railway.app/api/appointments/${appointmentToComplete.value.id}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    await fetchAppointments(); // Re-fetch to update status on calendar
    closeCompleteModal();
  } catch (error) {
    console.error('Failed to complete appointment:', error);
  } finally {
    isLoading.value = false;
  }
}


// Methods for date picker interactions
function selectDateFromPicker(day: CalendarDay) {
  if (!day.isCurrentMonth) return; // Only allow selecting days in the current displayed month
  currentDate.value = new Date(day.date); // Update the calendar to the selected month/day
  selectedDate.value = day.date; // Set the specific selected date
  showDatePicker.value = false; // Close the date picker dropdown
  fetchAppointments(); // Re-fetch appointments if month changed
  nextTick(() => {
    if (appointmentsListRef.value) {
      appointmentsListRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

// Checks if a date is the currently selected date (for styling purposes)
function isSelectedDate(date: string): boolean {
  return selectedDate.value === date;
}

function closeDatePicker() {
  showDatePicker.value = false;
}

// Watch for year/month changes in the date picker dropdown
watch([selectedYear, selectedMonth], ([year, month]) => {
  currentDate.value = new Date(year, month, 1); // Update current date to the first day of the new month/year
  fetchAppointments(); // Re-fetch appointments for the new month
});

// Initialize on component mount
onMounted(() => {
  selectedDate.value = format(new Date(), 'yyyy-MM-dd'); // Set initial selected date to today
  fetchAppointments(); // Fetch initial appointments
});
</script>

<style scoped>
/* General fade-in for page content */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Animations for header elements */
.animate-fade-in-down { animation: fadeInDown 0.5s ease-out; }
.animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
.animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }

/* Animation keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Delay for sequential animations */
.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }

/* Custom scrollbar for scrollable modals/sections */
.max-h-\[80vh\] {
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #f1f5f9;
}

.max-h-\[80vh\]::-webkit-scrollbar {
  width: 8px;
}

.max-h-\[80vh\]::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.max-h-\[80vh\]::-webkit-scrollbar-thumb {
  background-color: #94a3b8;
  border-radius: 4px;
  border: 2px solid #f1f5f9;
}

.max-h-\[80vh\]::-webkit-scrollbar-thumb:hover {
  background-color: #64748b;
}

/* Smooth scrolling for the whole page (when clicking a day and scrolling to list) */
html {
  scroll-behavior: smooth;
}

/* Improve select styling (native arrow hidden, custom arrow via background image) */
select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center; /* Adjusted for better spacing */
  background-size: 1.25em 1.25em; /* Smaller arrow */
  padding-right: 2.5rem;
}

select:focus {
  outline: none;
}

/* Add smooth transitions for all interactive elements */
button,
select,
input,
.group-hover\:scale-110,
.group-hover\:text-blue-600,
.hover\:shadow-md,
.status-badge {
  transition: all 0.2s ease-in-out;
}

/* Add hover effects for interactive elements */
button:hover {
  transform: translateY(-1px); /* Subtle lift */
}

button:active {
  transform: translateY(1px); /* Subtle press */
}

/* Add focus styles for better accessibility */
button:focus,
select:focus,
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.45); /* Consistent focus ring with manage.vue */
}

/* Hover effect for status badges */
.status-badge:hover {
  transform: scale(1.05);
}
</style>
