<template>
  <section class="stackSection">
    <div class="stackPanel">
      <div class="stackHeader">
        <span class="stackIcon">🛠️</span>
        <h2 class="stackTitle">{{ settings.title }}</h2>
        <span v-if="settings.showCount" class="stackCount">{{ totalTechs }} технологий</span>
      </div>
      <div class="stackCategories">
        <div v-for="category in settings.categories" :key="category.title" class="stackCategory">
          <div class="categoryHeader" :style="{ '--cat-color': category.color }">
            <span class="categoryIcon">{{ category.icon }}</span>
            <h3 class="categoryTitle">{{ category.title }}</h3>
            <span class="categoryCount">{{ category.items.length }}</span>
          </div>
          <div class="techGrid">
            <div v-for="tech in category.items" :key="tech.name" class="techChip">
              <span class="techIcon">{{ tech.icon }}</span>
              <div class="techInfo">
                <div class="techName">{{ tech.name }}</div>
                <div class="techVersion">{{ tech.version }}</div>
              </div>
              <div v-if="tech.note" class="techNote">{{ tech.note }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  settings: { type: Object, default: () => ({}) },
  blockId: String
})

const totalTechs = computed(() => (props.settings.categories || []).reduce((sum, cat) => sum + cat.items.length, 0))
</script>

<style scoped>
.stackSection {
  margin-bottom: 4px;
}
.stackPanel {
  background: rgba(10, 14, 39, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 4px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.stackHeader {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
}
.stackIcon { font-size: 20px; }
.stackTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  flex: 1;
}
.stackCount {
  padding: 2px 6px;
  background: rgba(255, 107, 53, 0.15);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 100px;
  font-size: 10px;
  font-weight: 600;
  color: #ff6b35;
}
.stackCategories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 4px;
}
.stackCategory {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 4px;
}
.categoryHeader {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.categoryIcon { font-size: 16px; }
.categoryTitle {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--cat-color, #fff);
  flex: 1;
}
.categoryCount {
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 100px;
  font-size: 9px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}
.techGrid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.techChip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  transition: all 0.2s ease;
}
.techChip:hover {
  background: rgba(255, 107, 53, 0.08);
  border-color: rgba(255, 107, 53, 0.2);
  transform: translateX(4px);
}
.techIcon { font-size: 14px; width: 16px; text-align: center; }
.techInfo { flex: 1; min-width: 0; }
.techName {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.techVersion {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'SF Mono', monospace;
}
.techNote {
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
</style>
