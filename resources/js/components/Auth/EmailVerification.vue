<template>
  <div class="container">
    <div v-if="verified">
      <h3>Email подтверждён!</h3>
    </div>
    <div v-else>
      <p>Проверьте вашу почту для подтверждения</p>
      <button @click="resendVerification" :disabled="loading">
        {{ loading ? 'Отправка...' : 'Отправить повторно' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data: () => ({
    loading: false,
    verified: false
  }),
  computed: {
    ...mapGetters('auth', ['user'])
  },
  mounted() {
    this.checkVerified();
  },
  methods: {
    async checkVerified() {
      if (this.user && this.user.email_verified_at) {
        this.verified = true;
      }
    },
    async resendVerification() {
      this.loading = true;
      try {
        await this.$api.post('/auth/verify/resend');
        this.$notify({ type: 'success', text: 'Ссылка отправлена!' });
      } catch (error) {
        this.$notify({ type: 'error', text: 'Ошибка отправки' });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
