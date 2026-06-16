<template>
  <div class="feature-card" :class="statusClass">
    <div class="feature-header">
      <div class="feature-icon">
        <span class="icon">{{ icon }}</span>
      </div>
      <div class="feature-title-block">
        <h4 class="feature-title">{{ title }}</h4>
        <span class="feature-status-badge" :class="status">
          <span class="status-dot"></span>
          {{ statusLabel }}
        </span>
      </div>
    </div>

    <p class="feature-description">{{ description }}</p>

    <div class="feature-details">
      <div v-if="done?.length" class="detail-row done">
        <span class="detail-label">✅ Реализовано</span>
        <ul class="detail-list" :class="{ 'two-columns': done.length > 3 }">
          <li v-for="(item, i) in done" :key="i">{{ item }}</li>
        </ul>
      </div>

      <div v-if="todo?.length" class="detail-row todo">
        <span class="detail-label">🔧 В планах</span>
        <ul class="detail-list" :class="{ 'two-columns': todo.length > 3 }">
          <li v-for="(item, i) in todo" :key="i">{{ item }}</li>
        </ul>
      </div>

      <div v-if="bugs?.length" class="detail-row bugs">
        <span class="detail-label"> Баги</span>
        <ul class="detail-list">
          <li v-for="(item, i) in bugs" :key="i">{{ item }}</li>
        </ul>
      </div>

      <div v-if="untested?.length" class="detail-row untested">
        <span class="detail-label">🧪 Не проверено</span>
        <ul class="detail-list">
          <li v-for="(item, i) in untested" :key="i">{{ item }}</li>
        </ul>
      </div>
    </div>

    <div v-if="stack" class="feature-footer">
      <span class="footer-icon">⚡</span>
      <span class="footer-text">{{ stack }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: 'alpha', validator: v => ['stable', 'beta', 'alpha', 'planned'].includes(v) },
  done: { type: Array, default: () => [] },
  todo: { type: Array, default: () => [] },
  bugs: { type: Array, default: () => [] },
  untested: { type: Array, default: () => [] },
  stack: { type: String, default: '' }
})

const statusClass = computed(() => `status-${props.status}`)
const statusLabel = computed(() => {
  const labels = { stable: 'Релиз', beta: 'Бета', alpha: 'Альфа', planned: 'Планируется' }
  return labels[props.status] || props.status
})
</script>

<style scoped>
.feature-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(20px);
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--card-accent, linear-gradient(90deg, #ff6b35, #f7931e));
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card.status-stable {
  --card-accent: linear-gradient(90deg, #00d084, #00e89d);
  border-color: rgba(0, 208, 132, 0.2);
}

.feature-card.status-beta {
  --card-accent: linear-gradient(90deg, #ff9900, #ffb347);
  border-color: rgba(255, 153, 0, 0.2);
}

.feature-card.status-alpha {
  --card-accent: linear-gradient(90deg, #ff4757, #ff6b81);
  border-color: rgba(255, 71, 87, 0.2);
}

.feature-card.status-planned {
  --card-accent: linear-gradient(90deg, #a29bfe, #6c5ce7);
  border-color: rgba(162, 155, 254, 0.2);
}

.feature-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feature-icon {
  flex-shrink: 0;
  font-size: 28px;
  line-height: 1;
}

.feature-title-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.feature-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.feature-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

.feature-status-badge.stable {
  background: rgba(0, 208, 132, 0.15);
  color: #00d084;
  border: 1px solid rgba(0, 208, 132, 0.3);
}

.feature-status-badge.beta {
  background: rgba(255, 153, 0, 0.15);
  color: #ff9900;
  border: 1px solid rgba(255, 153, 0, 0.3);
}

.feature-status-badge.alpha {
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.feature-status-badge.planned {
  background: rgba(162, 155, 254, 0.15);
  color: #a29bfe;
  border: 1px solid rgba(162, 155, 254, 0.3);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.feature-description {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  line-height: 1.5;
}

.feature-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-row.done .detail-label { color: #00d084; }
.detail-row.todo .detail-label { color: #ff9900; }
.detail-row.bugs .detail-label { color: #ff4757; }
.detail-row.untested .detail-label { color: #a29bfe; }

.detail-list {
  margin: 0;
  padding: 0 0 0 16px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-list.two-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 16px;
  padding: 0;
}

.detail-list li {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  position: relative;
  padding-left: 12px;
}

.detail-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: rgba(255, 255, 255, 0.3);
}

.detail-row.bugs .detail-list li::before { color: #ff4757; }
.detail-row.untested .detail-list li::before { color: #a29bfe; }

.feature-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  margin-top: auto;
}

.footer-icon {
  font-size: 14px;
}

.footer-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'SF Mono', 'Monaco', monospace;
  line-height: 1.4;
}
</style>
