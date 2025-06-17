<template>
  <p
    ref="paragraphRef"
    :class="className"
    style="display: flex; flex-wrap: wrap;"
  >
    <span
      v-for="(segment, index) in elements"
      :key="index"
      ref="setSpanRef"
      :style="getSpanStyle(index)"
      class="blur-text-span"
    >
      {{ segment === ' ' ? '\u00A0' : segment }}
      <template v-if="animateBy === 'words' && index < elements.length - 1">
        &nbsp;
      </template>
    </span>
  </p>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'

interface BlurTextProps {
  text?: string
  delay?: number
  className?: string
  animateBy?: 'words' | 'letters'
  direction?: 'top' | 'bottom'
  threshold?: number
  rootMargin?: string
  animationFrom?: Record<string, string | number>
  animationTo?: Array<Record<string, string | number>>
  easing?: (t: number) => number
  onAnimationComplete?: () => void
  stepDuration?: number
}

const props = withDefaults(defineProps<BlurTextProps>(), {
  text: '',
  delay: 200,
  className: '',
  animateBy: 'words',
  direction: 'top',
  threshold: 0.1,
  rootMargin: '0px',
  easing: (t: number) => t,
  stepDuration: 0.35,
})

const paragraphRef = ref<HTMLElement | null>(null)
const spanRefs = ref<HTMLElement[]>([])
const inView = ref(false)

const elements = computed(() =>
  props.animateBy === 'words' ? props.text.split(' ') : props.text.split('')
)

function setSpanRef(el: HTMLElement | null) {
  if (el) spanRefs.value.push(el)
}

function buildKeyframes(
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> {
  const keys = new Set<string>([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ])
  const keyframes: Record<string, Array<string | number>> = {}
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])]
  })
  return keyframes
}

const defaultFrom = computed(() =>
  props.direction === 'top'
    ? { filter: 'blur(10px)', opacity: 0, transform: 'translateY(-50px)' }
    : { filter: 'blur(10px)', opacity: 0, transform: 'translateY(50px)' }
)

const defaultTo = computed(() => [
  {
    filter: 'blur(5px)',
    opacity: 0.5,
    transform: props.direction === 'top'
      ? 'translateY(5px)'
      : 'translateY(-5px)',
  },
  { filter: 'blur(0px)', opacity: 1, transform: 'translateY(0)' },
])

const fromSnapshot = computed(() => props.animationFrom ?? defaultFrom.value)
const toSnapshots = computed(() => props.animationTo ?? defaultTo.value)

const stepCount = computed(() => toSnapshots.value.length + 1)
const totalDuration = computed(() => props.stepDuration * (stepCount.value - 1))
const times = computed(() =>
  Array.from({ length: stepCount.value }, (_, i) =>
    stepCount.value === 1 ? 0 : i / (stepCount.value - 1)
  )
)

function getSpanStyle(index: number) {
  // If not in view, show fromSnapshot
  if (!inView.value) {
    return {
      ...fromSnapshot.value,
      display: 'inline-block',
      willChange: 'transform, filter, opacity',
      transition: 'none',
    }
  }
  // Animate through keyframes
  const animateKeyframes = buildKeyframes(fromSnapshot.value, toSnapshots.value)
  // Calculate animation delay
  const delay = (index * props.delay) / 1000
  // Compose keyframes as CSS animation
  const animationName = `blurTextAnim${index}`
  // Dynamically inject keyframes
  injectKeyframes(animationName, animateKeyframes, times.value)
  return {
    display: 'inline-block',
    willChange: 'transform, filter, opacity',
    animation: `${animationName} ${totalDuration.value}s cubic-bezier(0.4,0,0.2,1) ${delay}s both`,
  }
}

// Helper to inject keyframes into the document
function injectKeyframes(
  name: string,
  keyframes: Record<string, Array<string | number>>,
  times: number[]
) {
  if (document.getElementById(name)) return
  let keyframeStr = `@keyframes ${name} {`
  times.forEach((t, i) => {
    keyframeStr += `${Math.round(t * 100)}% {`
    Object.entries(keyframes).forEach(([k, v]) => {
      keyframeStr += `${k}: ${v[i]};`
    })
    keyframeStr += '}'
  })
  keyframeStr += '}'
  const style = document.createElement('style')
  style.id = name
  style.innerHTML = keyframeStr
  document.head.appendChild(style)
}

onMounted(() => {
  if (!paragraphRef.value) return
  const observer = new window.IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        inView.value = true
        observer.unobserve(paragraphRef.value as Element)
        if (props.onAnimationComplete) {
          setTimeout(props.onAnimationComplete, totalDuration.value * 1000)
        }
      }
    },
    { threshold: props.threshold, rootMargin: props.rootMargin }
  )
  observer.observe(paragraphRef.value)
  // Clean up
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<style scoped>
.blur-text-span {
  /* No extra style, just for targeting */
}
</style>