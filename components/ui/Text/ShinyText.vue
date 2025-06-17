<template>
  <span
    :class="['shiny-text', { disabled }, className]"
    :style="{ animationDuration: `${speed}s` }"
  >
    {{ text }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
}

const props = withDefaults(defineProps<ShinyTextProps>(), {
  text: '',
  disabled: false,
  speed: 5,
  className: '',
})

const text = computed(() => props.text)
const disabled = computed(() => props.disabled)
const speed = computed(() => props.speed)
const className = computed(() => props.className)
</script>

<style scoped>
.shiny-text {
  color: #b5b5b5a4;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 40%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0) 60%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  display: inline-block;
  animation: shine 5s linear infinite;
  /* For text gradient effect */
  -webkit-text-fill-color: transparent;
}

@keyframes shine {
  0% {
    background-position: 100%;
  }
  100% {
    background-position: -100%;
  }
}

.shiny-text.disabled {
  animation: none;
}
</style>