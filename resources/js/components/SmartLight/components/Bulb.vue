<template>
  <div class="light-bulb" :class="statusClass">
    <!-- Стеклянная колба -->
    <div class="bulb-glass">
      <!-- Внутреннее свечение -->
      <div class="bulb-glow" :style="{ opacity: glowIntensity }"></div>

      <!-- Нить накаливания -->
      <div class="bulb-filament-container">
        <div class="bulb-filament-support">
          <div class="bulb-filament-support-inner"></div>
        </div>
        <div class="bulb-filament">
          <div class="bulb-filament-inner"></div>
        </div>
      </div>
    </div>

    <!-- Цоколь лампочки -->
    <div class="bulb-base">
      <div class="bulb-base-inner">
        <!-- Контактный штырь -->
        <div class="bulb-contact"></div>
        </div>
      </div>

      <!-- Резьба цоколя -->
      <div class="bulb-threading"></div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: value => ['ON', 'OFF', 'FULL_ON', 'SLEEPING'].includes(value)
  },
  intensity: {
    type: Number,
    default: 100
  }
});

// Вычисляем класс состояния
const statusClass = computed(() => {
  return `bulb-status-${props.status.toLowerCase()}`;
});

// Вычисляем интенсивность свечения
const glowIntensity = computed(() => {
  if (props.status === 'OFF') return 0;
  if (props.status === 'SLEEPING') return 0.3 * (props.intensity / 100);
  if (props.status === 'FULL_ON') return 1;
  return 0.8 * (props.intensity / 100);
});
</script>

<style scoped>
.light-bulb {
  width: 80px;
  height: 120px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Стеклянная колба */
.bulb-glass {
  width: 100%;
  height: 70%;
  position: relative;
  border-radius: 50% 50% 0 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%);
  box-shadow:
      0 0 5px 1px rgba(255, 255, 255, 0.7) inset,
      0 0 15px rgba(255, 255, 255, 0.5);
  overflow: hidden;
}

/* Внутреннее свечение */
.bulb-glow {
  position: absolute;
  width: 90%;
  height: 80%;
  top: 5%;
  left: 5%;
  border-radius: 50% 50% 0 0;
  z-index: 1;
  background: radial-gradient(circle, rgba(255, 255, 100, 0.9) 0%, rgba(255, 220, 100, 0) 70%);
  box-shadow:
      0 0 30px 15px rgba(255, 255, 100, 0.8),
      0 0 60px 30px rgba(255, 255, 100, 0.5);
  transition: opacity 0.5s ease;
}

/* Нить накаливания */
.bulb-filament-container {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 30%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 3;
}

.bulb-filament-support {
  width: 100%;
  height: 20%;
  border-radius: 4px;
  background: linear-gradient(to bottom, #888, #333);
}

.bulb-filament-support-inner {
  width: 100%;
  height: 40%;
  background: linear-gradient(to bottom, #aaa, #666);
  border-radius: 2px;
}

.bulb-filament {
  width: 100%;
  height: 20%;
  border-radius: 4px;
  position: relative;
}

.bulb-filament-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, #ffcc00 0%, #ffffff 100%);
  border-radius: 4px;
  box-shadow: 0 0 15px #ffcc00;
  animation: filament-glow 2s infinite alternate;
}

/* Цоколь лампочки */
.bulb-base {
  width: 70%;
  height: 25%;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(to bottom, #444, #222);
  position: relative;
  top: -1px;
}

.bulb-base-inner {
  width: 100%;
  height: 70%;
  background: linear-gradient(to bottom, #555, #333);
  border-radius: 0 0 2px 2px;
  position: relative;
  top: 5%;
}

.bulb-contact {
  width: 30%;
  height: 40%;
  background: #e6a23c;
  border-radius: 50%;
  position: absolute;
  bottom: 10%;
  left: 35%;
  box-shadow: 0 0 3px 1px #ffcc00;
}

/* Резьба цоколя */
.bulb-threading {
  width: 80%;
  height: 10%;
  background: linear-gradient(to right,
  #333 20%,
  #555 20%, #555 40%,
  #333 40%, #333 60%,
  #555 60%, #555 80%,
  #333 80%);
  border-radius: 0 0 2px 2px;
  position: absolute;
  bottom: 0;
}

/* Стили для состояния ON (1) */
.bulb-status-on .bulb-filament-inner {
  background: linear-gradient(to top, #ffcc00 0%, #ffffff 100%);
  box-shadow: 0 0 15px #ffcc00;
}

/* Стили для состояния OFF (2) */
.bulb-status-off .bulb-glass {
  background: linear-gradient(135deg, rgba(200, 200, 200, 0.7) 0%, rgba(150, 150, 150, 0.3) 100%);
  box-shadow: none;
}

.bulb-status-off .bulb-glass::before {
  background: linear-gradient(135deg, rgba(200, 200, 200, 0.7) 0%, rgba(150, 150, 150, 0.3) 100%);
}

.bulb-status-off .bulb-filament-inner {
  background: linear-gradient(to top, #666 0%, #333 100%);
  box-shadow: none;
}

/* Стили для состояния FULL_ON (3) */
.bulb-status-full_on .bulb-glass {
  background: linear-gradient(135deg, #fff 0%, #ffedc0 100%);
}

.bulb-status-full_on .bulb-filament-inner {
  background: linear-gradient(to top, #ffcc00 0%, #ffffff 100%);
  box-shadow: 0 0 20px #ffcc00;
}

.bulb-status-full_on .bulb-glow {
  opacity: 1;
  background: radial-gradient(circle, rgba(255, 255, 100, 0.95) 0%, rgba(255, 220, 100, 0) 70%);
  box-shadow:
      0 0 40px 20px rgba(255, 255, 100, 0.9),
      0 0 80px 40px rgba(255, 255, 100, 0.7);
}

/* Стили для состояния SLEEPING */
.bulb-status-sleeping .bulb-glass {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.bulb-status-sleeping .bulb-filament-inner {
  background: linear-gradient(to top, #ff9800 0%, #ffcc99 100%);
  box-shadow: 0 0 15px #ff9800;
}

.bulb-status-sleeping .bulb-glow {
  background: radial-gradient(circle, rgba(255, 165, 0, 0.8) 0%, rgba(255, 140, 0, 0) 70%);
  box-shadow:
      0 0 30px 15px rgba(255, 165, 0, 0.7),
      0 0 60px 30px rgba(255, 165, 0, 0.4);
}

/* Анимация свечения */
@keyframes filament-glow {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}
</style>
