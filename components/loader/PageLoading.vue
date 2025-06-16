<template>
  <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center font-inter" :style="gradientStyle">
    <div class="flex flex-col items-center">
      <!-- Animated Logo (Tooth Icon) -->
      <div class="relative mb-6">
        <svg class="logo-big animate-float" fill="none" viewBox="0 0 48 48" style="filter: drop-shadow(0 4px 16px #00dc82cc);">
          <circle cx="24" cy="24" r="22" fill="#38bdf8"/>
          <path d="M24 10c-4.418 0-8 3.582-8 8 0 7 8 20 8 20s8-13 8-20c0-4.418-3.582-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" fill="#fff"/>
        </svg>
        <div class="absolute inset-0 rounded-full bg-[#00dc82] opacity-20 animate-pulse-logo"></div>
      </div>

      <!-- Animated Title (DentaCare Pro) -->
      <h1 class="text-4xl md:text-5xl font-semibold bg-gradient-to-r from-[#00dc82] via-[#38bdf8] to-[#0e1628] bg-clip-text text-transparent animate-shimmer-text text-center mb-2 stunning-title" style="text-shadow: 0 2px 16px #0e1628, 0 1px 0 #fff, 0 0 8px #38bdf8;">
        <span class="inline-block animate-fade-in-up-stagger" style="animation-delay: 0.1s">Denta</span>
        <span class="inline-block animate-fade-in-up-stagger" style="animation-delay: 0.2s">Care</span>
        <span class="inline-block animate-fade-in-up-stagger" style="animation-delay: 0.3s">Pro</span>
      </h1>

      <!-- Animated Slogan -->
      <p class="text-gray-100 font-medium text-lg md:text-xl animate-fade-in-slogan stunning-slogan">Professional Dental Care Management</p>

      <!-- Progress Indicator (Optional, but good for UX) -->
      <div class="mt-10 w-64 h-2 bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <div class="h-full bg-gradient-to-r from-blue-400 to-teal-400 rounded-full animate-progress-bar"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const gradientStyle = computed(() => ({
  // A professional, deep blue-indigo radial gradient
  background: 'radial-gradient(circle at 50% 30%, #1a2a4b 0%, #2a3a60 35%, #0e1628 70%, #090a1a 100%)',
  width: '100vw',
  height: '100vh',
  transition: 'background 0.5s cubic-bezier(0.4,0,0.2,1)',
  // transform: 'scale(1.05)', // Slight scale to hide edges if needed, but not necessary with full vw/vh
  // transformOrigin: 'center',
}));
</script>

<style scoped>
.logo-big {
  width: 5em;
  height: 5em;
  max-width: 100px; /* Ensure responsiveness on smaller screens */
  max-height: 100px;
}

/* Floating Animation for Logo */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-12px) rotate(3deg); /* Slightly more pronounced float */
  }
}
.animate-float {
  animation: float 4s ease-in-out infinite; /* Slightly slower float */
}

/* Pulse Animation for Logo */
@keyframes pulse-logo {
  0%, 100% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
}
.animate-pulse-logo {
  animation: pulse-logo 2.5s ease-out infinite;
}

/* Text Shimmer Effect */
@keyframes shimmer-text {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}
.animate-shimmer-text {
  background-size: 200% auto;
  animation: shimmer-text 2.5s linear infinite;
  -webkit-background-clip: text; /* For gradient text effect */
  background-clip: text;
  text-fill-color: transparent; /* For gradient text effect */
}

/* Staggered Fade-in-up Animation for Title Words */
@keyframes fade-in-up-stagger {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up-stagger {
  animation: fade-in-up-stagger 0.6s ease-out forwards;
  opacity: 0; /* Hidden by default until animation runs */
}

/* Fade-in for Slogan */
@keyframes fade-in-slogan {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.animate-fade-in-slogan {
  animation: fade-in-slogan 1s ease-out forwards;
  animation-delay: 0.7s; /* Delayed after title animation */
  opacity: 0;
}

/* Progress Bar Animation */
@keyframes progress-bar {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}
.animate-progress-bar {
  animation: progress-bar 3s linear forwards;
}

/* Ensure font-inter is applied */
.font-inter {
  font-family: 'Inter', sans-serif;
}

.stunning-title {
  font-family: 'Inter', 'Segoe UI', 'Arial', sans-serif;
  font-size: 2.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: linear-gradient(90deg, #00dc82, #38bdf8, #0e1628, #38bdf8, #00dc82);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: shimmer-text 2.5s linear infinite;
  text-shadow:
    0 2px 24px #00dc82cc,
    0 1px 0 #fff,
    0 0 8px #38bdf8,
    0 0 2px #0e1628;
  transition: text-shadow 0.3s;
}
.stunning-slogan {
  font-size: 1.25rem;
  font-weight: 500;
  color: #e0f7fa;
  text-shadow: 0 1px 8px #38bdf8;
}
</style>
