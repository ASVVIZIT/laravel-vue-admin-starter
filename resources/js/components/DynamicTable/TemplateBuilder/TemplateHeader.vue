<!-- resources/js/components/DynamicTable/TemplateBuilder/TemplateHeader.vue -->
<template>
  <div class="builder-header">
    <h2>{{ template.id ? `Редактирование шаблона: ${template.name}` : 'Создание нового шаблона' }}</h2>
    <div class="builder-actions">
      <el-button
          type="primary"
          @click="emit('save')"
          :loading="saving"
          :disabled="!canSave"
      >
        <el-icon v-if="saving"><Loading /></el-icon>
        <span v-else>
          <el-icon><Edit /></el-icon>
          {{ template.id ? 'Обновить шаблон' : 'Создать шаблон' }}
        </span>
      </el-button>
      <el-button @click="emit('reset')">
        <el-icon><Refresh /></el-icon>Сбросить
      </el-button>
      <el-button @click="emit('refresh-preview')">
        <el-icon><Refresh /></el-icon>Обновить предпросмотр
      </el-button>
      <el-button @click="emit('cancel')">
        <el-icon><Close /></el-icon>Отмена
      </el-button>
    </div>
  </div>
</template>

<script setup>
/**
 * @component TemplateHeader
 *
 * Компонент заголовка и панели действий для редактора шаблонов.
 * Отображает название шаблона (при редактировании) и кнопки действий.
 *
 * @props {Object} template - Объект шаблона с полями id и name
 * @props {boolean} saving - Флаг состояния сохранения (показывает индикатор загрузки)
 * @props {boolean} canSave - Флаг возможности сохранения шаблона
 *
 * @emits {Event} save - Событие запроса на сохранение шаблона
 * @emits {Event} reset - Событие запроса на сброс формы
 * @emits {Event} refresh-preview - Событие запроса на обновление предпросмотра
 * @emits {Event} cancel - Событие запроса на отмену редактирования
 */
import { Edit, Close, Refresh, Loading } from '@element-plus/icons-vue';

const props = defineProps({
  /**
   * Объект шаблона с полями id и name
   * @type {Object}
   */
  template: {
    type: Object,
    required: true,
    default: () => ({ id: null, name: '' })
  },
  /**
   * Флаг состояния сохранения (показывает индикатор загрузки)
   * @type {boolean}
   */
  saving: {
    type: Boolean,
    default: false
  },
  /**
   * Флаг возможности сохранения шаблона
   * @type {boolean}
   */
  canSave: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  /**
   * Событие запроса на сохранение шаблона
   */
  'save',
  /**
   * Событие запроса на сброс формы
   */
  'reset',
  /**
   * Событие запроса на обновление предпросмотра
   */
  'refresh-preview',
  /**
   * Событие запроса на отмену редактирования
   */
  'cancel'
]);
</script>

<style lang="scss" scoped>
.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-shrink: 0;

  h2 {
    margin: 0;
    font-size: 1.5em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60%;
  }

  .builder-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    .el-button {
      height: 32px;
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon {
        margin-right: 5px;
      }

      &.is-circle {
        padding: 0;
        width: 28px;
        height: 28px;
      }
    }
  }
}
</style>
