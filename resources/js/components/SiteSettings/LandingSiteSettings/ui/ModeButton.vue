<template>
  <button
      class="mode-button"
      :class="{
      active: isActive,
      [`mode-${mode.value}`]: true
    }"
      @click="$emit('select', mode.value)"
      :disabled="disabled"
  >
    <div class="button-content">
      <span class="mode-icon">{{ mode.icon }}</span>
      <span class="mode-label">{{ mode.label }}</span>
      <span class="mode-description">{{ mode.description }}</span>
    </div>
  </button>
</template>

<script setup>
defineProps({
  mode: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

defineEmits(['select'])
</script>

<style scoped>
.mode-button {
  position: relative;
  padding: 18px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.mode-button:hover:not(:disabled) {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.mode-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mode-button.active {
  transform: translateY(-4px);
  border-width: 3px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

/* Цвета режимов */
.mode-button.mode-maintenance {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.08));
  border-color: rgba(245, 158, 11, 0.5);
}

.mode-button.mode-maintenance.active {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(245, 158, 11, 0.2));
  border-color: #f59e0b;
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.mode-button.mode-landing {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.08));
  border-color: rgba(59, 130, 246, 0.5);
}

.mode-button.mode-landing.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(59, 130, 246, 0.2));
  border-color: #3b82f6;
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.mode-button.mode-production {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.08));
  border-color: rgba(16, 185, 129, 0.5);
}

.mode-button.mode-production.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(16, 185, 129, 0.2));
  border-color: #10b981;
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.mode-button.mode-preview {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.08));
  border-color: rgba(139, 92, 246, 0.5);
}

.mode-button.mode-preview.active {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(139, 92, 246, 0.2));
  border-color: #8b5cf6;
  box-shadow: 0 12px 32px rgba(139, 92, 246, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
  width: 100%;
}

.mode-icon {
  font-size: 2.2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  transition: transform 0.3s ease;
  line-height: 1;
}

.mode-button.active .mode-icon {
  transform: scale(1.15);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.mode-label {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
  line-height: 1.2;
  white-space: nowrap;
}

.mode-description {
  font-size: 0.72rem;
  color: #4b5563;
  line-height: 1.3;
  max-width: 160px;
  text-align: center;
}
</style>
