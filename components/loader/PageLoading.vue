<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center custom-gradient-bg relative overflow-hidden">
    <!-- Tooth Icon (matching auth.vue style) -->
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

    <!-- Animated App Name -->
    <div class="mb-4">
      <ShinyText
        text="DentaCare Pro"
        className="text-4xl font-bold tracking-tight text-center"
        :speed="3"
      />
    </div>

    <!-- Animated Loading Text -->
    <BlurText
      text="Loading your professional dental experience..."
      class="text-gray-700 font-medium text-lg text-center w-full flex justify-center"
      animateBy="words"
      direction="top"
    />

    <!-- Optional: Animated Loader Spinner -->
    <div class="mt-8 flex justify-center">
      <svg class="animate-spin h-10 w-10 text-[#38bdf8]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-70" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import ShinyText from '~/components/ui/Text/ShinyText.vue'
import BlurText from '~/components/ui/Text/BlurText.vue'
</script>

<style scoped>
.custom-gradient-bg {
  background: linear-gradient(135deg,
    #FFFFFF 0%,
    #EFE2CE 25%,
    #D5ECEB 50%,
    #E4E4E4 75%,
    #F6FFFF 100%
  );
}
.logo-big {
  width: 5em;
  height: 5em;
  max-width: 100px;
  max-height: 100px;
  margin-bottom: 0.5em;
}
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}
.animate-float {
  animation: float 3s ease-in-out infinite;
}
.pop-float-enter-active,
.pop-float-leave-active {
  transition: all 0.6s cubic-bezier(.22,1,.36,1);
}
.pop-float-enter-from,
.pop-float-leave-to {
  opacity: 0;
  transform: scale(0.7) translateY(30px);
}
</style>