<template>
  <div class="email-verification">
    <el-alert v-if="verified" type="success" :closable="false">
      Ваш email успешно подтвержден!
    </el-alert>

    <div v-else>
      <el-alert type="warning" :closable="false">
        Пожалуйста, подтвердите ваш email
      </el-alert>

      <el-button
          type="primary"
          @click="resendVerification"
          :loading="resending"
          :disabled="cooldown > 0"
      >
        {{ buttonText }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const verified = ref(false);
    const resending = ref(false);
    const cooldown = ref(0);
    let cooldownInterval;

    const checkVerification = async () => {
      const user = store.getters['auth/user'];
      verified.value = !!user?.email_verified_at;
    };

    const resendVerification = async () => {
      resending.value = true;
      try {
        await store.dispatch('auth/resendVerification');
        cooldown.value = 60;

        cooldownInterval = setInterval(() => {
          cooldown.value--;
          if (cooldown.value <= 0) clearInterval(cooldownInterval);
        }, 1000);
      } catch (error) {
        console.error('Ошибка отправки:', error);
      } finally {
        resending.value = false;
      }
    };

    const buttonText = computed(() => {
      if (resending.value) return 'Отправка...';
      if (cooldown.value > 0) return `Повторная отправка (${cooldown.value}s)`;
      return 'Отправить письмо повторно';
    });

    onMounted(checkVerification);

    return { verified, resending, cooldown, resendVerification, buttonText };
  }
};
</script>
