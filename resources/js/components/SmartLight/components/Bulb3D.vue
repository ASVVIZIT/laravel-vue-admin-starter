<template>
  <div class="light-bulb" :class="statusClass">
    <!-- Стеклянная колба с 3D-эффектом -->
    <div class="bulb-glass">
      <div class="bulb-glass-inner">
        <!-- Нить накаливания с держателями -->
        <div class="bulb-filament-container">
          <div class="bulb-filament-support">
            <div class="bulb-filament-support-inner"></div>
          </div>
          <div class="bulb-filament">
            <div class="bulb-filament-inner"></div>
          </div>
        </div>

        <!-- Свечение лампочки -->
        <div class="bulb-glow" :style="{
          opacity: glowIntensity,
          background: glowGradient
        }"></div>
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
    validator: value => ['ON', 'OFF', 'FULL_ON'].includes(value)
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
  if (props.status === 'FULL_ON') return 1;
  return 0.8;
});

// Градиент свечения
const glowGradient = computed(() => {
  if (props.status === 'OFF') return 'none';
  if (props.status === 'SLEEPING') {
    return 'radial-gradient(circle, rgba(255, 165, 0, 0.8) 0%, rgba(255, 140, 0, 0) 70%)';
  }
  return 'radial-gradient(circle, rgba(255, 220, 150, 0.9) 0%, rgba(255, 200, 100, 0) 40%, rgba(255, 180, 80, 0) 70%)';
});
</script>

<style scoped>
.light-bulb {
  width: 100px;
  height: 150px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  perspective: 500px;
}

/* Стеклянная колба с 3D-эффектом */
.bulb-glass {
  width: 100%;
  height: 65%;
  position: relative;
  display: flex;
  justify-content: center;
  border-radius: 50% 50% 0 0;
  transform: rotateX(10deg) rotateY(-15deg);
}

.bulb-glass-inner {
  width: 100%;
  height: 100%;
  border-radius: 50% 50% 0 0;
  background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  box-shadow:
      0 0 5px 1px rgba(255, 255, 255, 0.7) inset,
      0 0 15px rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
  transform: translateZ(5px);
}

/* Нить накаливания и ее крепления */
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
  transform: translateZ(10px);
}

.bulb-filament-support {
  width: 100%;
  height: 20%;
  border-radius: 4px;
  background: linear-gradient(to bottom, #888, #333);
  position: relative;
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
  display: flex;
  justify-content: center;
  position: relative;
}

.bulb-filament-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, #ffcc00 0%, #ffffff 100%);
  border-radius: 4px;
  animation: filament-glow 2s infinite alternate;
}

/* Свечение лампочки */
.bulb-glow {
  position: absolute;
  width: 90%;
  height: 80%;
  border-radius: 50% 50% 0 0;
  top: 5%;
  left: 5%;
  z-index: 1;
  transition: opacity 0.5s ease;
}

/* Цоколь лампочки */
.bulb-base {
  width: 70%;
  height: 25%;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(to bottom, #444, #222);
  position: relative;
  top: -1px;
  transform: translateZ(5px);
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
  transform: translateZ(5px);
}

/* Стили для состояния ON (1) */
.bulb-status-on .bulb-filament-inner {
  background: linear-gradient(to top, #ffcc00 0%, #ffffff 100%);
  box-shadow: 0 0 15px #ffcc00;
}

/* Стили для состояния OFF (2) */
.bulb-status-off .bulb-glass-inner {
  background: linear-gradient(135deg, #e6e6e6 0%, #d1d1d1 100%);
  box-shadow: none;
}

.bulb-status-off .bulb-filament-inner {
  background: linear-gradient(to top, #666 0%, #333 100%);
  box-shadow: none;
}

.bulb-status-off .bulb-glow {
  opacity: 0;
}

/* Стили для состояния FULL_ON (3) */
.bulb-status-full_on .bulb-glass-inner {
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

/* Анимация свечения */
@keyframes filament-glow {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

.bulb-status-on .bulb-filament-inner,
.bulb-status-full_on .bulb-filament-inner {
  animation: filament-glow 2s infinite alternate;
}
</style>
