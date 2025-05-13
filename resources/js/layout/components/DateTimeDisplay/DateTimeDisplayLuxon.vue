<template>
  <div class="datetime-container">
    <div class="title">
      <h3>Luxon Timer - Время в разных форматах</h3>
    </div>
    <div class="card">
      <div class="controls">
        <div class="control-group">
          <label>Часовой пояс: </label>
          <select v-model="store.selectedTimezone">
            <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
          </select>
        </div>

        <div class="control-group">
          <label>Формат даты времени: </label>
          <select v-model="store.dateLuxonFormat">
            <option v-for="fmt in dateFormats" :key="fmt.value" :value="fmt.value">
              {{ fmt.label }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label>
            <input
                type="checkbox"
                v-model="store.showLuxonSeconds"
                :disabled="!canShowSeconds"
            />
            Показать секунды
            <span v-if="!canShowSeconds" class="hint">(недоступно для текущего формата)</span>
          </label>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="time-display">
        {{ formattedTime }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useDateTimeStore } from '@store/datetime';
import { DateTime, Settings } from 'luxon';

// Константы и настройки / Constants and settings
const TIME_ZONE = 'Asia/Yekaterinburg';
Settings.defaultLocale = 'ru'; // Устанавливаем локаль один раз / Set locale once

// Кастомный форматтер времени / Custom time formatter
const getDayPeriod = (hour) => {
  // Логика определения периода дня / Day period detection logic
  if (hour >= 5 && hour < 12) return 'утро';
  if (hour >= 12 && hour < 17) return 'день';
  if (hour >= 17 && hour < 23) return 'вечер';
  return 'ночь';
};

const ruTimeFormat = {
  format: (dt) => {
    const period = getDayPeriod(dt.hour);
    console.log('[Formatter] Custom format applied:', period);
    return `${dt.toFormat('HH:mm')} (${period})`;
  }
};

// Настройки хранилища / Store setup
const store = useDateTimeStore();
const currentTime = ref(DateTime.now().setZone(TIME_ZONE));
console.log('[Init] Initial time:', currentTime.value.toString());

// Данные компонента / Component data
const timezones = ref([
  'UTC',
  TIME_ZONE,
  'Europe/Moscow',
  'America/New_York',
  'Asia/Tokyo',
  'Europe/London'
]);

const dateFormats = ref([
  { value: 'HH:mm', label: '24-часовой формат' },
  { value: 'hh:mm a', label: '12-часовой формат' },
  { value: 'hh:mm:ss a', label: '12-часовой с секундами' },
  { value: 'custom', label: 'Русские периоды дня' }, // Флаг для кастомного формата
  { value: 'cccc, d MMMM', label: 'День недели, число Месяц' },
  { value: 'cccc, d MMMM, HH:mm', label: 'День недели, число Месяц, час:минута' },
  { value: 'd MMMM yyyy, HH:mm', label: 'Полный формат' },
  { value: 't', label: 'Короткое время' },
]);

// Форматы с поддержкой секунд
const supportedSecondsFormats = [
  'HH:mm',
  'hh:mm a',
  'hh:mm: ss a',
  'cccc, d MMMM, HH:mm',
  'd MMMM yyyy, HH:mm',
];

// Проверка возможности показа секунд
const canShowSeconds = computed(() => {
  return supportedSecondsFormats.includes(store.dateLuxonFormat);
});

// Логика обновления времени / Time update logic
const updateTime = () => {
  currentTime.value = DateTime.now().setZone(store.selectedTimezone);
  //console.log('[Update] New time:', currentTime.value.toString());
};

// Вычисляемое свойство для формата / Computed format
const formattedTime = computed(() => {
  try {
    let format = store.dateLuxonFormat;

    // Обработка кастомного формата / Handle custom format
    if (format === 'custom') {
      return ruTimeFormat.format(currentTime.value);
    }

    // Добавляем секунды только если разрешено и нужно
    // Новая логика добавления/удаления секунд
    if (canShowSeconds.value) {
      if (store.showLuxonSeconds && !format.includes('ss')) {
        format = format.replace(/(:mm)(?!:ss)/, '$1:ss');
      } else if (!store.showLuxonSeconds && format.includes('ss')) {
        format = format.replace(/:ss/g, '');
      }
    }

    const result = currentTime.value
        .setZone(store.selectedTimezone)
        .toFormat(format);

    //console.log('[Format] Result:', result);
    return result;
  } catch (e) {
    console.error('[Error] Formatting failed:', e);
    return 'Некорректный формат';
  }
});

// Наблюдатели и хранение состояния / Watchers and state persistence
watch(() => store.selectedTimezone, (newVal) => {
  localStorage.setItem('preferredTimezone', newVal);
  //console.log('[Watch] Timezone saved:', newVal);
});

watch(() => store.dateLuxonFormat, (newVal) => {
  localStorage.setItem('preferredLuxonFormat', newVal);
  //console.log('[Watch] Format saved:', newVal);
});

watch(() => store.showLuxonSeconds, (newVal) => {
  localStorage.setItem('preferredShowLuxonSeconds', newVal);
  //console.log('[Watch] Show seconds saved:', newVal);
});

// Автоматическое отключение секунд при смене формата
watch(() => store.dateLuxonFormat, (newFormat) => {
  if (!supportedSecondsFormats.includes(newFormat)) {
    store.showLuxonSeconds = false;
    //console.log('[Format Change] Seconds auto-disabled');
  }
});

// Хуки жизненного цикла / Lifecycle hooks
onMounted(() => {
  console.log('[Lifecycle] Component mounted');

  // Восстановление состояния / Restore state
  store.$patch({
    selectedTimezone: localStorage.getItem('preferredTimezone') || TIME_ZONE,
    dateLuxonFormat: localStorage.getItem('preferredLuxonFormat') || 'HH:mm',
    showLuxonSeconds: localStorage.getItem('preferredShowLuxonSeconds') === 'true'
  });

  const timer = setInterval(updateTime, 1000);
  onUnmounted(() => {
    console.log('[Lifecycle] Component unmounted');
    clearInterval(timer);
  });
});
</script>


<style lang="scss" scoped>
.datetime-container {
  max-width: 600px;
  margin: 0.0rem auto;
  padding: 0.0rem;
  border: 2px solid rgba(221, 221, 221, 0.79);
  border-radius: 0px;

  .title {
    text-align: center;
    margin: 0.0rem auto;
    background-color: #1890ff;
    padding: inherit;
    color: #eaeaea;
    h3 {
      margin: 0.2rem auto;
    }
  }
}

.controls {
  margin-bottom: 1rem;
}

.control-group {
  margin: 0.5rem 0;
}

select {
  margin-left: 0.5rem;
  padding: 0.25rem;
}

.time-display {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
}

/* Базовые стили чекбокса */
input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin-right: 8px;
  accent-color: #409eff; /* Цвет акцента Element Plus */
  position: relative;
  top: 2px;
}

/* Состояние disabled */
input[type="checkbox"]:disabled {
  accent-color: #c0c4cc; /* Серый цвет из палитры Element */
  cursor: not-allowed;
  opacity: 0.7;
}

/* Обертка для чекбокса */
.control-group label {
  display: flex;
  align-items: center;
  padding: 6px 0;
  transition: opacity 0.3s;
}

/* Текст при disabled состоянии */
.control-group label:has(input:disabled) {
  opacity: 0.7;
}

/* Подсказка о недоступности */
.hint {
  color: #909399; /* Серый цвет текста Element */
  font-size: 0.8em;
  margin-left: 8px;
  font-style: italic;
}

/* Анимация изменения состояния */
input[type="checkbox"] {
  transition:
      accent-color 0.3s ease,
      opacity 0.3s ease;
}
</style>
