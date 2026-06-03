<template>
  <header class="training-dashboard-header">
    <!-- 🔹 СТРОКА 1: Заголовок + Кнопки (жёстко зафиксированы) -->
    <div class="header-top">
      <div class="header-title">
        <span class="title-icon">🏆</span>
        <span class="title-text">Мои тренировки</span>
      </div>

      <div class="header-actions">
        <el-button
            type="primary"
            size="small"
            @click="$emit('toggle-form')"
            class="btn-add"
        >
          <el-icon><EditPen /></el-icon>
          <span class="btn-label">{{ showForm ? 'Скрыть' : 'Добавить' }}</span>
        </el-button>

        <el-button
            size="small"
            @click="$emit('refresh')"
            :loading="loading"
            circle
            class="btn-refresh"
            title="Обновить данные"
        >
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 🔹 СТРОКА 2: Статистика (независимый блок, не влияет на кнопки) -->
    <div class="header-bottom">
      <TrainingStatsBar :summary="summary" :stats="stats" />
    </div>
  </header>
</template>

<script setup>
import { EditPen, Refresh } from '@element-plus/icons-vue'
import TrainingStatsBar from './TrainingStatsBar.vue'

/**
 * Props
 */
const props = defineProps({
  summary: { type: Object, required: true },
  stats: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  showForm: { type: Boolean, default: false }
})

/**
 * Emits
 */
const emit = defineEmits(['toggle-form', 'refresh'])
</script>

<style scoped>
/* ============================================================================
   ШАПКА ДАШБОРДА: ДВУХУРОВНЕВАЯ, БЕЗ "МАГНИТНОГО" ЭФФЕКТА
   ============================================================================ */
.training-dashboard-header {
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

/*  Верхняя строка: Заголовок слева, Кнопки справа */
.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap; /* 🔑 Запрещаем перенос */
  gap: 12px;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.title-icon { font-size: 18px; }
.title-text { line-height: 1; }

/* 🔹 Кнопки: зафиксированы справа, не сжимаются */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0; /* 🔑 Кнопки никогда не уменьшаются */
  margin-left: auto; /* Гарантируем прижатие вправо */
}

.btn-add {
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  border-radius: 6px;
}

.btn-refresh {
  width: 28px;
  height: 28px;
  padding: 0;
}

.btn-label { margin-left: 5px; }

/* 🔹 Нижняя строка: Статистика */
.header-bottom {
  width: 100%;
  overflow: hidden; /* Статистика скроллится внутри себя */
}

/* ============================================================================
   АДАПТИВНОСТЬ
   ============================================================================ */
@media (max-width: 768px) {
  .training-dashboard-header {
    padding: 8px 12px;
    gap: 8px;
  }

  .header-top {
    flex-wrap: wrap;
    gap: 8px;
  }

  .header-title { font-size: 14px; }
  .title-icon { font-size: 16px; }

  .header-actions {
    width: 100%;
    justify-content: flex-end; /* Кнопки уходят в правый край */
  }

  .btn-label { display: none; } /* На мобильном только иконки */
  .btn-add { padding: 0 8px; }
}

@media (max-width: 480px) {
  .training-dashboard-header { padding: 6px 8px; }
  .header-title { font-size: 13px; }
}
</style>
