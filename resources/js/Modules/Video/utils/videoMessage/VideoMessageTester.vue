<template>
  <div
      :class="['tester-container', { floating, generating: isGenerating }]"
      :style="floating ? { top: floatingPosition.y + 'px', left: floatingPosition.x + 'px' } : {}"
      ref="container"
  >
    <div class="tester-header" ref="header" @mousedown="startDrag">
      <h2>[Тестер] Генератор всплывающих сообщений</h2>
      <div class="header-controls">
        <button
            class="drag-handle"
            title="Перетащить"
            v-if="floating"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M16 8l-3-3v2h-4v-4h2l-3-3-3 3h2v4h-4v-2l-3 3 3 3v-2h4v4h-2l3 3 3-3h-2v-4h4v2z"></path>
          </svg>
        </button>
        <button
            class="toggle-float"
            @click="toggleFloating"
            :title="floating ? 'Встроить в интерфейс' : 'Открепить'"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 15H21V17H3V15ZM3 7H21V9H3V7Z" fill="currentColor"/>
          </svg>
        </button>
        <button
            class="do-not-disturb-toggle"
            @click="doNotDisturb = !doNotDisturb"
            :class="{ active: doNotDisturb }"
            :title="doNotDisturb ? 'Уведомления включены' : 'Не беспокоить'"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 17C10.8954 17 10 16.1046 10 15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15C14 16.1046 13.1046 17 12 17ZM19 10H17V7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7V10H5C3.89543 10 3 10.8954 3 12V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V12C21 10.8954 20.1046 10 19 10ZM12 4C13.6569 4 15 5.34315 15 7V10H9V7C9 5.34315 10.3431 4 12 4Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="controls">
      <div class="position-control">
        <label class="control-label">Позиционирование</label>
        <div class="mode-switcher">
          <button
              :class="{ active: currentMode === 'manual' }"
              @click="currentMode = 'manual'"
          >
            Ручной
          </button>
          <button
              :class="{ active: currentMode === 'auto' }"
              @click="currentMode = 'auto'"
          >
            Авто
          </button>
          <div
              class="mode-slider"
              :class="currentMode"
              :style="sliderStyle"
          ></div>
        </div>
        <div class="position-grid">
          <button
              v-for="pos in positions"
              :key="pos.value"
              :class="{
              active: currentMode === 'manual'
                ? currentPosition === pos.value
                : activeGroups.includes(pos.value),
              blocked: isGenerating
            }"
              @click="handlePositionClick(pos.value)"
              :disabled="isGenerating"
          >
            <span class="position-icon">{{ pos.icon }}</span>
            <span class="position-label">{{ pos.label }}</span>
          </button>
        </div>

        <!-- Ручной режим -->
        <div v-if="currentMode === 'manual'" class="offset-controls">
          <label class="control-label">Отступы от левого края и верха экрана</label>
          <div class="offset-row">
            <div class="offset-input x">
              <label class="control-label">X:</label>
              <div class="input-with-unit" :class="{ blocked: isGenerating }">
                <input type="number" v-model.number="offsetXValue" min="0" max="500" :disabled="isGenerating">
                <span class="unit">px</span>
                <div class="number-controls">
                  <button
                      class="number-up"
                      @click="offsetXValue = Math.min(500, offsetXValue + 1)"
                      :disabled="isGenerating"
                  >▲</button>
                  <button
                      class="number-down"
                      @click="offsetXValue = Math.max(0, offsetXValue - 1)"
                      :disabled="isGenerating"
                  >▼</button>
                </div>
              </div>
            </div>
            <div class="offset-input y">
              <label class="control-label">Y:</label>
              <div class="input-with-unit" :class="{ blocked: isGenerating }">
                <input type="number" v-model.number="offsetYValue" min="0" max="500" :disabled="isGenerating">
                <span class="unit">px</span>
                <div class="number-controls">
                  <button
                      class="number-up"
                      @click="offsetYValue = Math.min(500, offsetYValue + 1)"
                      :disabled="isGenerating"
                  >▲</button>
                  <button
                      class="number-down"
                      @click="offsetYValue = Math.max(0, offsetYValue - 1)"
                      :disabled="isGenerating"
                  >▼</button>
                </div>
              </div>
            </div>
            <div class="offset-input wide">
              <label class="control-label">Ширина:</label>
              <div class="input-with-unit" :class="{ blocked: isGenerating }">
                <input type="number" v-model.number="widthValue" min="100" max="1000" :disabled="isGenerating">
                <span class="unit">px</span>
                <div class="number-controls">
                  <button
                      class="number-up"
                      @click="widthValue = Math.min(1000, widthValue + 10)"
                      :disabled="isGenerating"
                  >▲</button>
                  <button
                      class="number-down"
                      @click="widthValue = Math.max(100, widthValue - 10)"
                      :disabled="isGenerating"
                  >▼</button>
                </div>
              </div>
            </div>
          </div>
          <div class="animation-mode">
            <label class="control-label">Анимация перемещения сообщения:</label>
            <div class="animation-options">
              <button
                  :class="{
                    active: animationMode === 'inside',
                    blocked: isGenerating
                  }"
                  @click="!isGenerating && setAnimationMode('inside')"
                  :disabled="isGenerating"
              >
                Внутри группы
              </button>
              <button
                  :class="{
                    active: animationMode === 'screen',
                    blocked: isGenerating
                  }"
                  @click="!isGenerating && setAnimationMode('screen')"
                  :disabled="isGenerating"
              >
                По Экрану
              </button>
            </div>
          </div>
          <div class="offset-row">
            <button
                class="apply-btn"
                @click="applyOffset"
                :disabled="isGenerating"
            >
              Применить настройки
            </button>
          </div>
        </div>

        <!-- Авто режим -->
        <div v-else class="auto-mode-settings">
          <div class="generate-modes">
            <h4 class="control-label">Режим генерации</h4>
            <div class="mode-options">
              <button
                  :class="{ active: generateMode === 'light' }"
                  @click="setGenerateMode('light')"
              >
                Легкий
              </button>
              <button
                  :class="{ active: generateMode === 'standard' }"
                  @click="setGenerateMode('standard')"
              >
                Стандарт
              </button>
              <button
                  :class="{ active: generateMode === 'spam' }"
                  @click="setGenerateMode('spam')"
              >
                Спам
              </button>
            </div>
          </div>

          <div class="generate-controls">
            <button
                class="generate-btn"
                :class="{ active: isGenerating }"
                @click="toggleGeneration"
            >
              <span v-if="isGenerating">⏹️ Остановить</span>
              <span v-else>▶️ Запустить</span>
            </button>
            <div v-if="isGenerating" class="generate-stats">
              <div class="timer-line">
                <span>Старт {{ formatTime(startTime) }}</span>
                <span>Текущее: {{ formatTime(currentTime) }}</span>
              </div>
              <div class="counters-line">
                <span>Сгенерировано: {{ generatedCount }}</span>
                <span>Групп: {{ stats.groupCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="message-control">
        <label class="control-label">Сообщения</label>
        <div class="message-type-row">
          <div class="message-type-select" :class="[messageType, { blocked: isGenerating }]">
            <select v-model="messageType" :disabled="isGenerating">
              <option value="success" style="background-color: #67c23a; color: white;">Успех</option>
              <option value="warning" style="background-color: #e6a23c; color: white;">Предупреждение</option>
              <option value="error" style="background-color: #f56c6c; color: white;">Ошибка</option>
              <option value="info" style="background-color: #409eff; color: white;">Информация</option>
              <option value="debug" style="background-color: #6c757d; color: white;">Отладка</option>
            </select>
          </div>
          <button
              class="create-button"
              :class="messageType"
              @click="sendMessage(messageType)"
              :disabled="isGenerating"
          >
            Создать
          </button>
        </div>

        <textarea
            v-model="messageText"
            placeholder="Текст сообщения..."
            rows="2"
            :class="{ blocked: isGenerating }"
            :disabled="isGenerating"
        ></textarea>

        <div class="param-controls">
          <div class="param-group">
            <div class="label-row">
              <label class="control-label">Длительность (мс):</label>
              <div class="hint">0 = фиксировано</div>
            </div>
            <div class="control-row">
              <input
                  type="range"
                  v-model="duration"
                  min="0"
                  max="10000"
                  step="100"
                  :disabled="isGenerating"
                  class="duration-slider"
              >
              <div class="input-with-unit" :class="{ blocked: isGenerating }">
                <input
                    type="number"
                    v-model="duration"
                    min="0"
                    max="60000"
                    class="compact-input"
                    :disabled="isGenerating"
                >
                <div class="number-controls">
                  <button
                      class="number-up"
                      @click="duration = Math.min(60000, duration + 100)"
                      :disabled="isGenerating"
                  >▲</button>
                  <button
                      class="number-down"
                      @click="duration = Math.max(0, duration - 100)"
                      :disabled="isGenerating"
                  >▼</button>
                </div>
              </div>
            </div>
          </div>

          <div class="param-group">
            <label class="control-label">Скорость (мс):</label>
            <div class="control-row">
              <input
                  type="range"
                  v-model="animationSpeed"
                  min="100"
                  max="2000"
                  step="100"
                  :disabled="isGenerating"
                  class="speed-slider"
              >
              <div class="input-with-unit" :class="{ blocked: isGenerating }">
                <input
                    type="number"
                    v-model="animationSpeed"
                    min="100"
                    max="2000"
                    class="compact-input"
                    :disabled="isGenerating"
                >
                <div class="number-controls">
                  <button
                      class="number-up"
                      @click="animationSpeed = Math.min(2000, animationSpeed + 100)"
                      :disabled="isGenerating"
                  >▲</button>
                  <button
                      class="number-down"
                      @click="animationSpeed = Math.max(100, animationSpeed - 100)"
                      :disabled="isGenerating"
                  >▼</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button
              v-for="type in ['success', 'warning', 'error', 'info', 'debug']"
              :key="type"
              :class="[type, { blocked: isGenerating }]"
              @click="sendMessage(type)"
              :disabled="isGenerating"
          >
            {{ typeLabels[type] }}
          </button>
        </div>
      </div>
    </div>

    <div class="system-controls">
      <button
          class="system-btn"
          @click="clearMessages"
          :disabled="isGenerating"
      >
        Очистить
      </button>
      <button
          class="system-btn"
          @click="unmountAll"
          :disabled="isGenerating"
      >
        Удалить
      </button>
      <button
          class="system-btn"
          @click="resetConfig"
          :disabled="isGenerating"
      >
        Сбросить
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onUnmounted, onMounted, nextTick } from 'vue';
import videoMessage from './videoMessage.js';

export default {
  setup() {
    const positions = [
      { value: 'top-left', label: 'Верх-лево', icon: '↖' },
      { value: 'top-center', label: 'Верх-центр', icon: '↑' },
      { value: 'top-right', label: 'Верх-право', icon: '↗' },
      { value: 'bottom-left', label: 'Низ-лево', icon: '↙' },
      { value: 'bottom-center', label: 'Низ-центр', icon: '↓' },
      { value: 'bottom-right', label: 'Низ-право', icon: '↘' },
    ];

    const typeLabels = {
      success: 'Успех',
      warning: 'Предупр.',
      error: 'Ошибка',
      info: 'Инфо',
      debug: 'Отладка'
    };

    const floating = ref(false);
    const currentPosition = ref('top-right');
    const offsetXValue = ref(40);
    const offsetYValue = ref(40);
    const widthValue = ref(240);
    const messageType = ref('success');
    const messageText = ref('Тестовое сообщение');
    const duration = ref(4000);
    const animationMode = ref('inside');
    const animationSpeed = ref(1000);
    const doNotDisturb = ref(false);

    // Генерация сообщений
    const isGenerating = ref(false);
    const generateMode = ref('standard');
    const activeGroups = ref(['top-right', 'bottom-right']);
    const generatedCount = ref(0);
    let generationTimeout = null;

    // Таймер генерации
    const startTime = ref(null);
    const currentTime = ref(null);
    const stats = ref({ groupCount: 0, messageCount: 0 });
    let timerInterval = null;

    // Перетаскивание компонента
    const floatingPosition = ref({ x: 0, y: 0 });
    const isDragging = ref(false);
    const dragStart = ref({ x: 0, y: 0 });
    const container = ref(null);
    const header = ref(null);

    // Индикатор прилипания
    const snapThresholdValue = 20;
    let snapIndicator = null;
    let snapIndicatorTimeout = null;
    let snapIndicatorStyle = null;

    // ======================================
    // Независимые функции для индикатора прилипания
    // ======================================

    /**
     * Создает индикатор прилипания и добавляет его в DOM
     */
    const createSnapIndicator = () => {
      if (snapIndicator) return;

      // Создаем элемент индикатора
      snapIndicator = document.createElement('div');
      snapIndicator.className = 'snap-indicator';
      snapIndicator.style.display = 'none';
      snapIndicator.style.position = 'fixed';
      snapIndicator.style.zIndex = '300000';
      snapIndicator.style.pointerEvents = 'none';
      snapIndicator.style.borderRadius = '10px';
      snapIndicator.style.border = `2px dashed #00c8ff`;
      snapIndicator.style.boxShadow = '0 0 15px rgba(0, 200, 255, 0.7)';
      snapIndicator.style.boxSizing = 'content-box';
      snapIndicator.style.overflow = 'visible';
      snapIndicator.style.opacity = '0';
      snapIndicator.style.transition = 'opacity 0.3s ease';

      // Создаем угловые маркеры
      const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
      positions.forEach(pos => {
        const marker = document.createElement('div');
        marker.className = `snap-marker ${pos}`;
        marker.textContent = `${snapThresholdValue}px`;
        marker.style.position = 'absolute';
        marker.style.fontSize = '10px';
        marker.style.color = '#00c8ff';
        marker.style.background = 'rgba(0, 0, 0, 0.85)';
        marker.style.padding = '2px 6px';
        marker.style.borderRadius = '4px';
        marker.style.fontWeight = 'bold';
        marker.style.pointerEvents = 'none';
        marker.style.textShadow = '0 1px 1px black';
        marker.style.border = '1px solid rgba(0, 200, 255, 0.5)';
        marker.style.boxShadow = '0 1px 3px rgba(0,0,0,0.5)';
        marker.style.zIndex = '2';

        switch(pos) {
          case 'top-left':
            marker.style.top = '-20px';
            marker.style.left = '-20px';
            break;
          case 'top-right':
            marker.style.top = '-20px';
            marker.style.right = '-20px';
            break;
          case 'bottom-left':
            marker.style.bottom = '-20px';
            marker.style.left = '-20px';
            break;
          case 'bottom-right':
            marker.style.bottom = '-20px';
            marker.style.right = '-20px';
            break;
        }

        snapIndicator.appendChild(marker);
      });

      document.body.appendChild(snapIndicator);

      // Добавляем глобальные стили для анимации
      snapIndicatorStyle = document.createElement('style');
      snapIndicatorStyle.textContent = `
        @keyframes snap-pulse {
          0% { opacity: 0.7; box-shadow: 0 0 10px rgba(0, 200, 255, 0.5); }
          50% { opacity: 1; box-shadow: 0 0 20px rgba(0, 200, 255, 0.9); }
          100% { opacity: 0.7; box-shadow: 0 0 10px rgba(0, 200, 255, 0.5); }
        }
        .snap-indicator {
          animation: snap-pulse 1.5s infinite;
        }
      `;
      document.head.appendChild(snapIndicatorStyle);
    };

    /**
     * Обновляет положение и стиль индикатора
     * @param {DOMRect} rect - Размеры и положение контейнера
     * @param {boolean} isSnapping - Флаг прилипания
     */
    const updateSnapIndicator = (rect, isSnapping) => {
      if (!snapIndicator) return;

      // Обновляем положение
      snapIndicator.style.top = `${rect.top - 4}px`;
      snapIndicator.style.left = `${rect.left - 4}px`;
      snapIndicator.style.width = `${rect.width + 8}px`;
      snapIndicator.style.height = `${rect.height + 8}px`;
      snapIndicator.style.opacity = '1';

      // Обновляем цвет
      const color = isSnapping ? '#00ffaa' : '#00c8ff';
      snapIndicator.style.border = `2px dashed ${color}`;
      snapIndicator.style.boxShadow = `0 0 15px ${color}80`;
    };

    /**
     * Показывает индикатор прилипания с задержкой
     */
    const showSnapIndicator = () => {
      if (!snapIndicator) createSnapIndicator();

      if (snapIndicatorTimeout) clearTimeout(snapIndicatorTimeout);
      snapIndicatorTimeout = setTimeout(() => {
        if (snapIndicator && isDragging.value) {
          snapIndicator.style.display = 'block';
        }
      }, 100);
    };

    /**
     * Скрывает индикатор прилипания
     */
    const hideSnapIndicator = () => {
      if (!snapIndicator) return;
      snapIndicator.style.opacity = '0';

      setTimeout(() => {
        if (snapIndicator) {
          snapIndicator.style.display = 'none';
        }
      }, 300);
    };

    /**
     * Удаляет индикатор прилипания из DOM
     */
    const removeSnapIndicator = () => {
      if (snapIndicator && document.body.contains(snapIndicator)) {
        document.body.removeChild(snapIndicator);
        snapIndicator = null;
      }

      if (snapIndicatorStyle && document.head.contains(snapIndicatorStyle)) {
        document.head.removeChild(snapIndicatorStyle);
        snapIndicatorStyle = null;
      }

      if (snapIndicatorTimeout) {
        clearTimeout(snapIndicatorTimeout);
        snapIndicatorTimeout = null;
      }
    };

    // ======================================
    // Основные функции компонента
    // ======================================

    const formatTime = (date) => {
      if (!date) return '00:00:00.000';
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
      return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    };

    // Режимы работы
    const currentMode = ref('manual');
    const sliderPosition = ref(0);
    const sliderStyle = computed(() => ({
      transform: `translateX(${sliderPosition.value}%)`,
      transition: 'transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
    }));

    watch(currentMode, (newMode) => {
      sliderPosition.value = newMode === 'manual' ? 0 : 100;
      if (newMode === 'manual' && isGenerating.value) {
        toggleGeneration();
      }
    });

    const messages = [
      "Система запущена",
      "Новая версия",
      "Проверка связи",
      "Операция выполнена",
      "Внимание: ресурсы",
      "Ошибка обработки",
      "Отладка модуля",
      "Загрузка завершена",
      "Предупреждение: память",
      "Инфо обновлена",
    ];

    const messageTypes = ['success', 'warning', 'error', 'info', 'debug'];

    const toggleGroup = (group) => {
      const index = activeGroups.value.indexOf(group);
      if (index === -1) {
        activeGroups.value.push(group);
      } else {
        activeGroups.value.splice(index, 1);
      }
    };

    const setGenerateMode = (mode) => {
      generateMode.value = mode;
    };

    const getModeSettings = () => {
      const avgDuration = duration.value;
      const avgSpeed = animationSpeed.value;

      switch (generateMode.value) {
        case 'light': return { minInterval: 1500, maxInterval: 4000, minDuration: Math.max(1000, avgDuration - 2000), maxDuration: avgDuration + 2000 };
        case 'standard': return { minInterval: 500, maxInterval: 2000, minDuration: Math.max(500, avgDuration - 1000), maxDuration: avgDuration + 1000 };
        case 'spam': return { minInterval: 50, maxInterval: 300, minDuration: Math.max(0, avgDuration - 500), maxDuration: avgDuration + 500 };
        default: return { minInterval: 500, maxInterval: 2000, minDuration: Math.max(500, avgDuration - 1000), maxDuration: avgDuration + 1000 };
      }
    };

    const handlePositionClick = (position) => {
      if (currentMode.value === 'manual') {
        setPosition(position);
      } else {
        toggleGroup(position);
      }
    };

    const generateRandomMessage = () => {
      if (activeGroups.value.length === 0) return;

      const group = activeGroups.value[Math.floor(Math.random() * activeGroups.value.length)];
      const settings = getModeSettings();

      videoMessage.configure({
        position: group,
        offset: { x: '40px', y: '40px' },
        width: '240px',
        animationMode: animationMode.value,
        animationSpeed: animationSpeed.value
      });

      const type = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      const text = messages[Math.floor(Math.random() * messages.length)];

      let msgDuration = (generateMode.value === 'spam' && Math.random() < 0.2)
          ? 0
          : Math.floor(settings.minDuration + Math.random() * (settings.maxDuration - settings.minDuration));

      videoMessage[type](text, msgDuration);
      generatedCount.value++;

      if (msgDuration === 0) {
        setTimeout(() => videoMessage.clear(), 60000);
      }
    };

    const toggleGeneration = () => {
      isGenerating.value = !isGenerating.value;

      if (isGenerating.value) {
        generatedCount.value = 0;
        startTime.value = new Date();
        currentTime.value = new Date();
        stats.value = videoMessage.getStats();
        timerInterval = setInterval(() => {
          currentTime.value = new Date();
          stats.value = videoMessage.getStats();
        }, 50);

        const settings = getModeSettings();

        const generateWithInterval = () => {
          if (!isGenerating.value) return;
          generateRandomMessage();

          const nextInterval = settings.minInterval +
              Math.random() * (settings.maxInterval - settings.minInterval);

          generationTimeout = setTimeout(generateWithInterval, nextInterval);
        };

        generateRandomMessage();
        generationTimeout = setTimeout(generateWithInterval,
            settings.minInterval + Math.random() * (settings.maxInterval - settings.minInterval));
      } else {
        if (generationTimeout) clearTimeout(generationTimeout);
        if (timerInterval) clearInterval(timerInterval);
      }
    };

    onUnmounted(() => {
      if (generationTimeout) clearTimeout(generationTimeout);
      if (timerInterval) clearInterval(timerInterval);
      removeSnapIndicator();
    });

    const offsetX = computed(() => `${offsetXValue.value}px`);
    const offsetY = computed(() => `${offsetYValue.value}px`);
    const width = computed(() => `${widthValue.value}px`);

    watch(duration, (newVal) => duration.value = parseInt(newVal) || 0);
    watch(animationSpeed, (newVal) => animationSpeed.value = parseInt(newVal) || 1000);

    const toggleFloating = () => {
      floating.value = !floating.value;
      if (floating.value) {
        const containerEl = document.querySelector('.tester-container.floating');
        if (containerEl) containerEl.style.zIndex = '200000';

        const containerRect = container.value.getBoundingClientRect();
        floatingPosition.value = {
          x: Math.max(0, window.innerWidth / 2 - containerRect.width / 2),
          y: Math.max(0, window.innerHeight / 2 - containerRect.height / 2)
        };
      }
    };

    const startDrag = (e) => {
      if (!floating.value) return;
      if (e.target.classList.contains('drag-handle') || e.target.closest('.drag-handle')) return;

      isDragging.value = true;
      dragStart.value = {
        x: e.clientX - floatingPosition.value.x,
        y: e.clientY - floatingPosition.value.y
      };

      // Создаем индикатор прилипания
      createSnapIndicator();
      showSnapIndicator();

      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', stopDrag);
    };

    const onDrag = (e) => {
      if (!isDragging.value) return;

      // Рассчитываем новые координаты
      let newX = e.clientX - dragStart.value.x;
      let newY = e.clientY - dragStart.value.y;

      // Получаем размеры контейнера и окна
      const containerRect = container.value.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Определяем состояние прилипания
      const isSnapping =
          newX <= snapThresholdValue ||
          newY <= snapThresholdValue ||
          newX >= windowWidth - containerRect.width - snapThresholdValue ||
          newY >= windowHeight - containerRect.height - snapThresholdValue;

      // Обновляем индикатор
      updateSnapIndicator(containerRect, isSnapping);

      // Ограничиваем положение в пределах экрана
      newX = Math.max(0, Math.min(newX, windowWidth - containerRect.width));
      newY = Math.max(0, Math.min(newY, windowHeight - containerRect.height));

      floatingPosition.value = { x: newX, y: newY };
    };

    const stopDrag = () => {
      if (!isDragging.value) return;
      isDragging.value = false;

      // Скрываем индикатор
      hideSnapIndicator();

      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
      applySnapToEdges();
    };

    const applySnapToEdges = () => {
      if (!container.value) return;

      const containerRect = container.value.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const snapThreshold = 20;
      let { x, y } = floatingPosition.value;

      if (x <= snapThreshold) x = 0;
      else if (x >= windowWidth - containerRect.width - snapThreshold)
        x = windowWidth - containerRect.width;

      if (y <= snapThreshold) y = 0;
      else if (y >= windowHeight - containerRect.height - snapThreshold)
        y = windowHeight - containerRect.height;

      if (x !== floatingPosition.value.x || y !== floatingPosition.value.y) {
        floatingPosition.value = { x, y };
      }
    };

    const handleResize = () => {
      if (floating.value) applySnapToEdges();
    };

    onMounted(() => {
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      removeSnapIndicator();
    });

    const setPosition = (pos) => {
      currentPosition.value = pos;
      applyConfig();
      if (!doNotDisturb.value) videoMessage.info(`Позиция: ${positions.find(p => p.value === pos)?.label}`, 1500);
    };

    const setAnimationMode = (mode) => {
      animationMode.value = mode;
      applyConfig();
      if (!doNotDisturb.value) videoMessage.info(`Анимация: ${mode === 'inside' ? 'Внутри' : 'Экран'}`, 1500);
    };

    const applyConfig = () => {
      videoMessage.configure({
        position: currentPosition.value,
        offset: { x: offsetX.value, y: offsetY.value },
        width: width.value,
        animationMode: animationMode.value,
        animationSpeed: animationSpeed.value
      });
    };

    const applyOffset = () => {
      applyConfig();
      if (!doNotDisturb.value) videoMessage.info(`Настройки применены`, 2000);
    };

    const sendMessage = (type) => videoMessage[type](messageText.value, duration.value);
    const clearMessages = () => videoMessage.clear();
    const unmountAll = () => videoMessage.unmount();

    const resetConfig = () => {
      videoMessage.resetConfiguration();
      currentPosition.value = 'top-right';
      offsetXValue.value = 40;
      offsetYValue.value = 40;
      widthValue.value = 240;
      animationMode.value = 'inside';
      animationSpeed.value = 1000;
      duration.value = 4000;
      applyConfig();
      clearMessages();

      if (!doNotDisturb.value) videoMessage.info('Настройки сброшены', 2000);
    };

    applyConfig();

    return {
      positions,
      typeLabels,
      floating,
      currentPosition,
      offsetXValue,
      offsetYValue,
      widthValue,
      messageType,
      messageText,
      duration,
      animationMode,
      animationSpeed,
      doNotDisturb,
      isGenerating,
      generateMode,
      activeGroups,
      generatedCount,
      startTime,
      currentTime,
      stats,
      currentMode,
      sliderStyle,
      container,
      header,
      floatingPosition,
      formatTime,
      toggleGroup,
      setGenerateMode,
      handlePositionClick,
      toggleGeneration,
      toggleFloating,
      startDrag,
      setPosition,
      setAnimationMode,
      applyOffset,
      sendMessage,
      clearMessages,
      unmountAll,
      resetConfig
    };
  }
};
</script>

<style scoped>
.control-label {
  display: block;
  margin-bottom: 3px;
  color: #a0aec0;
  font-size: 11px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.hint {
  font-size: 10px;
  color: #a0aec0;
  text-align: right;
  flex-shrink: 0;
}

.controls {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.position-control, .message-control {
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.08);
  padding: 8px;
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.offset-row {
  display: flex;
  gap: 4px;
}

.offset-input {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.param-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.param-controls .input-with-unit {
  width: 100px;
}

.message-control {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.action-buttons {
  margin-top: auto;
  padding-top: 8px;
}

.tester-container {
  display: flex;
  flex-direction: column;
}

.system-controls {
  margin-top: auto;
  padding-top: 8px;
}

.tester-container {
  position: relative;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: 6px;
  color: white;
  width: 100%;
  max-width: 600px;
  margin: 8px auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  box-sizing: border-box;
  font-size: 11px;
}

.tester-container.floating {
  position: fixed;
  top: v-bind(floatingPosition.y + 'px');
  left: v-bind(floatingPosition.x + 'px');
  z-index: 200000;
  height: auto !important;
  max-height: 90vh;
  overflow-y: auto;
  transition: none !important;
}

.tester-header {
  padding: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tester-container.floating {
  margin: 0px auto;
}

.tester-container.floating .tester-header {
  cursor: move;
}

.header-controls {
  display: flex;
  gap: 6px;
}

.drag-handle, .toggle-float, .do-not-disturb-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
}

.toggle-float {
  transition: transform 0.3s ease;
}
.floating .toggle-float {
  transform: rotate(90deg);
}

.do-not-disturb-toggle {
  transition: background-color 0.3s, border-color 0.3s;
}
.do-not-disturb-toggle.active {
  background: rgba(59, 130, 246, 0.5);
  border-color: #3b82f6;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.tester-header h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

.input-with-unit {
  height: 24px;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding-right: 0;
  transition: all 0.2s ease;
}

.input-with-unit:hover:not(.blocked) {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.4);
}

.input-with-unit:active:not(.blocked) {
  transform: translateY(1px);
  border-color: #409eff;
}

.input-with-unit input {
  flex: 1;
  padding: 4px 6px;
  background: none;
  border: none;
  color: white;
  font-size: 11px;
  width: 100%;
  box-sizing: border-box;
  height: 22px;
  -moz-appearance: textfield;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

.input-with-unit input::-webkit-outer-spin-button,
.input-with-unit input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.unit {
  font-size: 11px;
  opacity: 0.7;
  margin: 0 6px;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

.number-controls {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 1px solid rgba(255,255,255,0.2);
}

.number-controls button {
  flex: 1;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  width: 20px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.number-controls button:hover:not(:disabled) {
  background: rgba(255,255,255,0.2);
}

.number-controls button:first-child {
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.animation-mode {
  margin-top: 6px;
}

.animation-options {
  display: flex;
  gap: 6px;
  padding-bottom: 6px;
}

.animation-options button {
  flex: 1;
  padding: 5px 4px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  font-size: 11px;
  height: 26px;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

.animation-options button:hover:not(:disabled) {
  cursor: pointer;
  background: rgba(255,255,255,0.1);
}

.animation-options button.active {
  background: rgba(59, 130, 246, 0.5);
  border-color: #3b82f6;
}

.apply-btn {
  width: 100%;
  padding: 6px;
  background: #409eff;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  height: 28px;
  border: none;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.apply-btn:hover:not(:disabled) {
  background: #66b1ff;
}

.apply-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 0 1px 1px rgba(0,0,0,0.2);
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 8px;
}

.position-grid button {
  padding: 6px 2px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  height: 36px;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

.position-grid button.active {
  background: rgba(59, 130, 246, 0.5);
  border-color: #3b82f6;
}

.position-grid button.active.manual {
  background: rgba(59, 130, 246, 0.5);
  border-color: #3b82f6;
}

.position-grid button.active.auto {
  background: rgba(251, 146, 60, 0.5);
  border-color: #ea9608;
}

.position-icon {
  font-size: 14px;
  margin-bottom: 2px;
}

.position-label {
  font-size: 9px;
  text-align: center;
  line-height: 1;
}

.mode-switcher {
  position: relative;
  display: flex;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  padding: 3px;
  margin-bottom: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.mode-switcher button {
  flex: 1;
  padding: 6px 12px;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: color 0.3s ease;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

.mode-switcher button.active {
  color: white;
}

.mode-slider {
  position: absolute;
  top: 3px;
  bottom: 3px;
  width: calc(50% - 6px);
  z-index: 1;
  border-radius: 4px;
}

.mode-slider.manual {
  left: 5px;
  background: linear-gradient(135deg, #67c23a, #3b940f);
}

.mode-slider.auto {
  left: 9px;
  background: linear-gradient(135deg, #e6a23c, #c57103);
}

.auto-mode-settings {
  padding: 10px 0;
}

.generate-modes {
  margin-bottom: 10px;
}

.mode-options {
  display: flex;
  gap: 6px;
}

.mode-options button {
  flex: 1;
  padding: 8px 4px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

.mode-options button:hover {
  background: rgba(255,255,255,0.1);
}

.mode-options button.active {
  background: rgba(251, 146, 60, 0.3);
  border-color: #fb923c;
}

.generate-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.generate-btn {
  width: 100%;
  padding: 8px;
  background: #f97316;
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.generate-btn:hover {
  background: #fb923c;
}

.generate-btn.active {
  background: #ef4444;
}

.generate-btn.active:hover {
  background: #f87171;
}

.generate-stats {
  margin-top: 6px;
  font-size: 11px;
  color: #a0aec0;
  text-align: center;
  width: 100%;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

.timer-line {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  margin-bottom: 3px;
}

.counters-line {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
}

.message-type-row {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.message-type-select {
  flex: 1;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid;
  height: 26px;
  position: relative;
}

.message-type-select.success { border-color: #67c23a; background: rgba(103, 194, 58, 0.2); }
.message-type-select.warning { border-color: #e6a23c; background: rgba(230, 162, 60, 0.2); }
.message-type-select.error { border-color: #f56c6c; background: rgba(245, 108, 108, 0.2); }
.message-type-select.info { border-color: #409eff; background: rgba(64, 158, 255, 0.2); }
.message-type-select.debug { border-color: #6c757d; background: rgba(108, 117, 125, 0.2); }

.message-type-select select {
  width: 100%;
  padding: 4px 24px 4px 8px;
  background: none;
  border: none;
  color: white;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  font-size: 12px;
  height: 24px;
  line-height: 1.5;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

.message-type-select::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid white;
  pointer-events: none;
}

.create-button {
  padding: 0 10px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
  white-space: nowrap;
  height: 26px;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.create-button:hover:not(:disabled) {
  opacity: 0.9;
}

.create-button:active:not(:disabled) {
  transform: scale(1.1);
}

.create-button.success { background: #67c23a; }
.create-button.warning { background: #e6a23c; }
.create-button.error { background: #f56c6c; }
.create-button.info { background: #409eff; }
.create-button.debug { background: #6c757d; }

textarea {
  width: 100%;
  padding: 6px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  height: 50px;
  resize: vertical;
  box-sizing: border-box;
  min-height: 50px;
  max-height: 100px;
  font-size: 11px;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
  padding-right: 20px; /* Отступ для скроллбара */
}

/* Стилизация скроллбара textarea как в группе сообщений */
textarea::-webkit-scrollbar {
  width: 8px;
}

textarea::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(64, 158, 255, 0.7);
  border-radius: 4px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 158, 255, 0.9);
}

.duration-slider, .speed-slider {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.duration-slider::-webkit-slider-thumb,
.speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #409eff;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.duration-slider::-webkit-slider-thumb:hover,
.speed-slider::-webkit-slider-thumb:hover {
  background: #66b1ff;
  transform: scale(1.1);
}

.duration-slider:disabled::-webkit-slider-thumb,
.speed-slider:disabled::-webkit-slider-thumb {
  background: #6c757d;
  cursor: not-allowed;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.action-buttons button {
  padding: 6px 4px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
  height: 26px;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.action-buttons button:hover:not(:disabled) {
  opacity: 0.9;
}

.action-buttons button:active:not(:disabled) {
  transform: scale(1.1);
}

.success { background: #67c23a; }
.warning { background: #e6a23c; }
.error { background: #f56c6c; }
.info { background: #409eff; }
.debug { background: #6c757d; }

.system-controls {
  display: flex;
  gap: 6px;
}

.system-controls button {
  flex: 1;
  padding: 6px 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  height: 26px;
  color: white;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.system-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.system-btn:active:not(:disabled) {
  transform: scale(1.1);
}

.system-btn:first-child { background: #e6a23c; }
.system-btn:nth-child(2) { background: #f56c6c; }
.system-btn:last-child { background: #6c757d; }

.blocked {
  opacity: 0.6;
  cursor: not-allowed !important;
  pointer-events: none;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
  }

  .position-control, .message-control {
    min-width: 100%;
  }

  .timer-line, .counters-line {
    flex-direction: column;
    gap: 3px;
  }

  .label-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .hint {
    margin-left: 0;
    text-align: left;
  }
}
</style>
