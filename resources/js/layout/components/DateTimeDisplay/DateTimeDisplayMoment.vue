<template>
  <div class="datetime-container">
    <div class="title">
      <h3>Moment.js Timer - Время в разных форматах</h3>
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
          <select v-model="store.dateFormat">
            <option v-for="fmt in dateFormats" :key="fmt.value" :value="fmt.value">
              {{ fmt.label }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label>
            <input type="checkbox" v-model="store.showSeconds" />
            Показать Секунды
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
import moment from 'moment-timezone';
const TIME_ZONE = 'Asia/Yekaterinburg';

// Store initialization
// Инициализация хранилища
const store = useDateTimeStore();

// Reactive current time reference
// Реактивная ссылка на текущее время
const currentTime = ref(moment());

moment.locale('ru');
/*moment.updateLocale('ru', {
    months : 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_')
});*/
// Timezone options
// Опции часовых поясов
const timezones = ref([
  'UTC',
  TIME_ZONE,
  'Europe/Moscow',
  'America/New_York',
  'Asia/Tokyo',
  'Europe/London'
]);

currentTime.value.tz(timezones[2])

// Date format options
// Опции форматов даты
const dateFormats = ref([
  { value: 'HH:mm', label: '24-hour format' },
  { value: 'hh:mm A', label: '12-hour format' },
  { value: 'dddd, MMMM Do', label: 'День, Месяц 5th' },
  { value: 'MMMM Do YYYY, HH:mm', label: 'Long format' },
  { value: 'LT', label: 'Локализация' },
]);

// Update time every second
// Обновление времени каждую секунду
const updateTime = () => {
  currentTime.value = moment();
};

// Formatted time with dynamic seconds
// Форматированное время с динамическими секундами
const formattedTime = computed(() => {
  let format = store.dateFormat;
  if (store.showSeconds) {
    format = format.includes('ss') ? format : format.replace(/(:mm|:MM)/, '$1:ss');
  }
  return currentTime.value.tz(store.selectedTimezone).format(format);
});

// Watchers for persistent storage
// Наблюдатели для сохранения в localStorage

// Track timezone changes
// Отслеживание изменений часового пояса
watch(() => store.selectedTimezone, (newTz) => {
  localStorage.setItem('preferredTimezone', newTz);
});

// Track date format changes
// Отслеживание изменений формата даты
watch(() => store.dateFormat, (newFormat) => {
  localStorage.setItem('preferredFormat', newFormat);
});

// Track seconds visibility changes
// Отслеживание изменения видимости секунд
watch(() => store.showSeconds, (newVal) => {
  localStorage.setItem('preferredShowSeconds', newVal);
});

// Component lifecycle hooks
// Хуки жизненного цикла компонента
onMounted(() => {
  // Restore preferences from localStorage
  // Восстановление настроек из localStorage
  const savedFormat = localStorage.getItem('preferredFormat');
  const savedTimezone = localStorage.getItem('preferredTimezone');
  const savedShowSeconds = localStorage.getItem('preferredShowSeconds');

  if (savedFormat) store.dateFormat = savedFormat;
  if (savedTimezone) store.selectedTimezone = savedTimezone;
  if (savedShowSeconds) store.showSeconds = savedShowSeconds === 'true';

  // Setup update interval
  // Настройка интервала обновления
  const timer = setInterval(updateTime, 1000);

  // Cleanup on unmount
  // Очистка при размонтировании
  onUnmounted(() => clearInterval(timer));
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
</style>
