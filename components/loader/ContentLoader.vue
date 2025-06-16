<template>
  <div class="content-loader" :class="[`content-loader--${type}`, { 'content-loader--animated': animated }]">
    <!-- Card Loader -->
    <template v-if="type === 'card'">
      <div class="content-loader__card">
        <div class="content-loader__header">
          <div class="content-loader__avatar"></div>
          <div class="content-loader__title"></div>
        </div>
        <div class="content-loader__content">
          <div class="content-loader__line"></div>
          <div class="content-loader__line"></div>
          <div class="content-loader__line"></div>
        </div>
      </div>
    </template>

    <!-- List Loader -->
    <template v-else-if="type === 'list'">
      <div v-for="i in count" :key="i" class="content-loader__list-item">
        <div class="content-loader__avatar"></div>
        <div class="content-loader__content">
          <div class="content-loader__line"></div>
          <div class="content-loader__line"></div>
        </div>
      </div>
    </template>

    <!-- Table Loader -->
    <template v-else-if="type === 'table'">
      <div class="content-loader__table">
        <div v-for="i in count" :key="i" class="content-loader__table-row">
          <div class="content-loader__line"></div>
          <div class="content-loader__line"></div>
          <div class="content-loader__line"></div>
        </div>
      </div>
    </template>

    <!-- Default Loader -->
    <template v-else>
      <div class="content-loader__default">
        <div class="content-loader__line"></div>
        <div class="content-loader__line"></div>
        <div class="content-loader__line"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'card', 'list', 'table'].includes(value)
  },
  count: {
    type: Number,
    default: 3
  },
  animated: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.content-loader {
  width: 100%;
}

.content-loader--animated .content-loader__line,
.content-loader--animated .content-loader__avatar {
  position: relative;
  overflow: hidden;
}

.content-loader--animated .content-loader__line::after,
.content-loader--animated .content-loader__avatar::after {
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

.content-loader__line {
  height: 12px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.content-loader__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
}

/* Card Variant */
.content-loader--card {
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-loader__header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.content-loader__title {
  margin-left: 12px;
  flex: 1;
}

.content-loader__title .content-loader__line {
  width: 60%;
}

/* List Variant */
.content-loader__list-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.content-loader__list-item .content-loader__content {
  flex: 1;
  margin-left: 12px;
}

/* Table Variant */
.content-loader__table {
  width: 100%;
}

.content-loader__table-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

/* Default Variant */
.content-loader__default {
  padding: 16px;
}

.content-loader__default .content-loader__line {
  width: 100%;
}
</style> 