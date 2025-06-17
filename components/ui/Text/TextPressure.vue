<template>
  <span
    ref="containerRef"
    class="inline-block w-auto h-auto overflow-visible"
    @mousemove="handleMouseMove"
    @touchmove="handleTouchMove"
    @mouseleave="handleMouseLeave"
    @touchend="handleMouseLeave"
  >
    <component :is="'style'">
      @font-face {
        font-family: '{{ fontFamily }}';
        src: url('{{ fontUrl }}');
        font-style: normal;
        font-display: swap;
      }
      .text-pressure-title {
        color: {{ textColor }};
      }
      .text-pressure-stroke span {
        position: relative;
        color: {{ textColor }};
      }
      .text-pressure-stroke span::after {
        content: attr(data-char);
        position: absolute;
        left: 0;
        top: 0;
        color: transparent;
        z-index: -1;
        -webkit-text-stroke-width: {{ strokeWidth }}px;
        -webkit-text-stroke-color: {{ strokeColor }};
      }
    </component>
    <h1
      ref="titleRef"
      :class="[
        'text-pressure-title',
        className,
        { 'flex justify-between': flex },
        { 'text-pressure-stroke': stroke },
        'uppercase',
        'text-center',
        'whitespace-nowrap',
        'font-bold'
      ]"
      :style="{
        fontFamily: fontFamily,
        fontSize: fontSize + 'px',
        lineHeight: lineHeight,
        transform: `scale(1, ${scaleY})`,
        transformOrigin: 'center top',
        margin: 0,
        fontWeight: 100,
        color: stroke ? undefined : textColor,
        display: flex ? 'flex' : 'block',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        textRendering: 'optimizeLegibility',
      }"
    >
      <span
        v-for="(char, i) in chars"
        :key="i"
        :ref="(el) => (spansRef[i] = el as HTMLSpanElement)"
        :data-char="char"
        class="inline-block transition-all duration-75 ease-out"
        :style="{
            opacity: alpha ? 0 : 1,
            fontVariationSettings: ``,
        }"
      >
        {{ char }}
      </span>
    </h1>
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  scale?: boolean;
  textColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
  minFontSize?: number;
}

const props = withDefaults(defineProps<TextPressureProps>(), {
  text: 'Compressa',
  fontFamily: 'Compressa VF',
  fontUrl: 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2',
  width: true,
  weight: true,
  italic: true,
  alpha: false,
  flex: true,
  stroke: false,
  scale: false,
  textColor: '#38bdf8',
  strokeColor: '#FF0000',
  strokeWidth: 2,
  className: '',
  minFontSize: 24,
});

const containerRef = ref<HTMLSpanElement | null>(null);
const titleRef = ref<HTMLHeadingElement | null>(null);
const spansRef = ref<(HTMLSpanElement | null)[]>([]);

const mousePosition = ref({ x: 0, y: 0 });
const cursorPosition = ref({ x: 0, y: 0 });

const fontSize = ref(props.minFontSize);
const scaleY = ref(1);
const lineHeight = ref(1);

const chars = computed(() => props.text.split(''));

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

const handleMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  const x = clamp(e.clientX - rect.left, 0, rect.width);
  const y = clamp(e.clientY - rect.top, 0, rect.height);
  cursorPosition.value.x = x;
  cursorPosition.value.y = y;
};

const handleTouchMove = (e: TouchEvent) => {
  if (!containerRef.value || e.touches.length === 0) return;
  const t = e.touches[0];
  const rect = containerRef.value.getBoundingClientRect();
  const x = clamp(t.clientX - rect.left, 0, rect.width);
  const y = clamp(t.clientY - rect.top, 0, rect.height);
  cursorPosition.value.x = x;
  cursorPosition.value.y = y;
  e.preventDefault();
};

const handleMouseLeave = () => {
  if (containerRef.value) {
    const { width, height } = containerRef.value.getBoundingClientRect();
    cursorPosition.value.x = width / 2;
    cursorPosition.value.y = height / 2;
  }
};

const setSize = () => {
  if (!containerRef.value || !titleRef.value) return;
  const { width: containerW, height: containerH } = containerRef.value.getBoundingClientRect();
  let newFontSize = containerW / (chars.value.length / 1.5);
  newFontSize = Math.max(newFontSize, props.minFontSize);
  fontSize.value = newFontSize;
  scaleY.value = 1;
  lineHeight.value = 1;
  nextTick(() => {
    requestAnimationFrame(() => {
      if (!titleRef.value) return;
      const textRect = titleRef.value.getBoundingClientRect();
      if (props.scale && textRect.height > 0) {
        const yRatio = containerH / textRect.height;
        scaleY.value = yRatio;
        lineHeight.value = yRatio;
      }
    });
  });
};

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
};

let rafId: number;

const animate = () => {
  mousePosition.value.x += (cursorPosition.value.x - mousePosition.value.x) / 8;
  mousePosition.value.y += (cursorPosition.value.y - mousePosition.value.y) / 8;

  if (titleRef.value && containerRef.value) {
    const titleRect = titleRef.value.getBoundingClientRect();
    const maxInfluenceDist = titleRect.width / 2;

    spansRef.value.forEach((span) => {
      if (!span || !containerRef.value) return;
      const rect = span.getBoundingClientRect();
      const charCenter = {
        x: rect.x - containerRef.value.getBoundingClientRect().left + rect.width / 2,
        y: rect.y - containerRef.value.getBoundingClientRect().top + rect.height / 2,
      };
      const d = dist(mousePosition.value, charCenter);
      const getAttr = (distance: number, minVal: number, maxVal: number) => {
        const normalizedDistance = Math.min(distance, maxInfluenceDist) / maxInfluenceDist;
        const val = maxVal - (normalizedDistance * (maxVal - minVal));
        return Math.max(minVal, val);
      };
      const wdth = props.width ? Math.floor(getAttr(d, 5, 200)) : 100;
      const wght = props.weight ? Math.floor(getAttr(d, 100, 900)) : 400;
      const italVal = props.italic ? getAttr(d, 0, 1).toFixed(2) : '0';
      const alphaVal = props.alpha ? getAttr(d, 0, 1).toFixed(2) : '1';

      span.style.opacity = alphaVal;
      span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
    });
  }

  rafId = requestAnimationFrame(animate);
};

onMounted(() => {
  setSize();
  window.addEventListener('resize', setSize);

  nextTick(() => {
    if (containerRef.value) {
      const { width, height } = containerRef.value.getBoundingClientRect();
      mousePosition.value.x = width / 2;
      mousePosition.value.y = height / 2;
      cursorPosition.value.x = width / 2;
      cursorPosition.value.y = height / 2;
    }
  });

  animate();
});

onUnmounted(() => {
  window.removeEventListener('resize', setSize);
  cancelAnimationFrame(rafId);
});

watch(() => [props.text, props.scale], setSize);
</script>

<style scoped>
/* No background, no box, no shadow */
.text-pressure-title {
  white-space: nowrap;
  line-height: 1;
  letter-spacing: -0.05em;
  background: none !important;
  box-shadow: none !important;
}
.text-pressure-title span {
  background: none !important;
  box-shadow: none !important;
}
@media (prefers-reduced-motion: reduce) {
  .text-pressure-title span {
    animation: none !important;
    transition: none !important;
    font-variation-settings: 'wght' 400, 'wdth' 100, 'ital' 0 !important;
    opacity: 1 !important;
  }
}
</style>
