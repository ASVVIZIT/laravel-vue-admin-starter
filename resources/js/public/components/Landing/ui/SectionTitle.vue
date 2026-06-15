<template>
  <div class="section-title" :class="{ centered }">
    <span v-if="icon" class="title-icon">{{ icon }}</span>
    <h2 class="title-text">
      <slot />
    </h2>
    <p v-if="subtitle" class="title-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  subtitle: String,
  centered: { type: Boolean, default: true }
})
</script>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.section-title.centered {
  justify-content: center;
  text-align: center;
}

.title-icon {
  font-size: 36px;
}

.title-text {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
}

.title-subtitle {
  width: 100%;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin: 8px 0 0;
}
</style>
