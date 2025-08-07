<template>
  <div class="email-verification">
    <el-card>
      <template #header>
        <div class="card-header">Подтверждение Email</div>
      </template>

      <el-alert v-if="verified" type="success" show-icon>
        Ваш email успешно подтвержден!
      </el-alert>

      <div v-else>
        <el-alert type="warning" show-icon>
          Пожалуйста, подтвердите ваш email. Проверьте вашу почту.
        </el-alert>

        <el-button
            type="primary"
            @click="resendVerification"
            :loading="resending"
            :disabled="cooldown > 0"
            class="resend-btn"
        >
          {{ buttonText }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';

const store = useStore();
const verified = ref(false);
const resending = ref(false);
const cooldown = ref(0);
let cooldownTimer = null;

const checkVerification = async () => {
  try {
    const response = await store.dispatch('auth/checkVerification');
    verified.value = response.data.verified;
  } catch (error) {
    console.error('Ошибка проверки верификации:', error);
  }
};

const resendVerification = async () => {
  resending.value = true;
  try {
    await store.dispatch('auth/resendVerification');
    ElMessage.success('Письмо отправлено!');

    // Таймер обратного отсчета
    cooldown.value = 60;
    cooldownTimer = setInterval(() => {
      cooldown.value--;
      if (cooldown.value <= 0) {
        clearInterval(cooldownTimer);
      }
    }, 1000);
  } catch (error) {
    ElMessage.error('Ошибка отправки: ' + error.message);
  } finally {
    resending.value = false;
  }
};

const buttonText = computed(() => {
  if (resending.value) return 'Отправка...';
  if (cooldown.value > 0) return `Повторная отправка (${cooldown.value}s)`;
  return 'Отправить письмо повторно';
});

onMounted(() => {
  checkVerification();

  // Очистка таймера при размонтировании
  return () => {
    if (cooldownTimer) clearInterval(cooldownTimer);
  };
});
</script>

<style scoped>
.email-verification {
  max-width: 600px;
  margin: 2rem auto;
}

.resend-btn {
  margin-top: 20px;
}

.card-header {
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
