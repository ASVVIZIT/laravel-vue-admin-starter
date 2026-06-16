<template>
  <div class="settings-section">
    <h3>🎨 Выбор лендинга</h3>
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>Загрузка списка...</p></div>
    <div v-else-if="error" class="error-state"><p>{{ error }}</p><button class="btn-retry" @click="$emit('retry')">Повторить</button></div>
    <div v-else-if="landings.length === 0" class="empty-state"><span class="empty-icon">📭</span><p>Нет опубликованных лендингов</p></div>
    <div v-else class="landing-grid">
      <div v-for="landing in landings" :key="landing.id" class="landing-card" :class="{ selected: selectedId === landing.id }" @click="$emit('select', landing.id)">
        <div class="card-header">
          <span class="type-badge" :class="`type-${landing.type}`">{{ typeLabels[landing.type] || landing.type }}</span>
          <span v-if="selectedId === landing.id" class="check-icon">✓</span>
        </div>
        <h4 class="card-title">{{ landing.title }}</h4>
        <p class="card-slug">/{{ landing.slug }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ landings: { type: Array, required: true }, selectedId: { type: [Number, String], default: null }, loading: { type: Boolean, default: false }, error: { type: String, default: null } })
defineEmits(['select', 'retry'])
const typeLabels = { personal_brand: '👤 Личный бренд', shop: '🛒 Магазин', portfolio: '🎨 Портфолио', custom: '⚙️ Кастомный' }
</script>

<style scoped>
.settings-section h3 { font-size: 1.25rem; margin: 0 0 20px 0; color: #fff; }
.loading-state, .error-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; gap: 12px; color: rgba(255, 255, 255, 0.6); }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(255, 255, 255, 0.1); border-left-color: #ff6b35; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.btn-retry { padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #fff; cursor: pointer; }
.empty-icon { font-size: 3rem; opacity: 0.5; }
.landing-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
.landing-card { padding: 20px; background: rgba(255, 255, 255, 0.03); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 14px; cursor: pointer; transition: all 0.3s ease; }
.landing-card:hover { background: rgba(255, 255, 255, 0.06); transform: translateY(-2px); }
.landing-card.selected { border-color: #3498db; background: rgba(52, 152, 219, 0.1); box-shadow: 0 8px 24px rgba(52, 152, 219, 0.2); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.type-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: rgba(255, 107, 53, 0.1); color: #ff6b35; }
.type-personal_brand { background: rgba(102, 126, 234, 0.1); color: #667eea; }
.type-shop { background: rgba(17, 153, 142, 0.1); color: #11998e; }
.type-portfolio { background: rgba(79, 172, 254, 0.1); color: #4facfe; }
.check-icon { width: 24px; height: 24px; border-radius: 50%; background: #3498db; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 700; }
.card-title { margin: 0 0 6px 0; font-size: 1.1rem; color: #fff; }
.card-slug { margin: 0; font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); font-family: monospace; }
</style>
