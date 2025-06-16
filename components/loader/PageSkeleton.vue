<template>
  <div class="page-skeleton" :class="{ 'page-skeleton--animated': animated }">
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  animated: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.page-skeleton {
  width: 100%;
}

.page-skeleton--animated :deep(*) {
  position: relative;
  overflow: hidden;
}

.page-skeleton--animated :deep(*)::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.2) 20%,
    rgba(255, 255, 255, 0.5) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Skeleton element styles */
.page-skeleton :deep(.skeleton) {
  background: #e0e0e0;
  border-radius: 4px;
}

.page-skeleton :deep(.skeleton-circle) {
  border-radius: 50%;
}

.page-skeleton :deep(.skeleton-text) {
  height: 1em;
  margin-bottom: 0.5em;
}

.page-skeleton :deep(.skeleton-text:last-child) {
  margin-bottom: 0;
}

.page-skeleton :deep(.skeleton-avatar) {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
}

.page-skeleton :deep(.skeleton-button) {
  height: 36px;
  border-radius: 6px;
  background: #e0e0e0;
}

.page-skeleton :deep(.skeleton-card) {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}
</style> 