<template>
  <div class="production-info">
    <h3>🚀 Продакшн режим</h3>

    <div class="info-grid">
      <div class="info-card">
        <div class="card-icon">🌐</div>
        <h4>Публичный сайт</h4>
        <p>Полноценный сайт доступен всем посетителям</p>
      </div>

      <div class="info-card">
        <div class="card-icon">📄</div>
        <h4>Все лендинги</h4>
        <p>Доступны по URL /l/{slug}</p>
      </div>

      <div class="info-card">
        <div class="card-icon">🔌</div>
        <h4>API доступ</h4>
        <p>Публичные API эндпоинты активны</p>
      </div>

      <div class="info-card">
        <div class="card-icon">⚡</div>
        <h4>Все функции</h4>
        <p>Полный функционал платформы</p>
      </div>
    </div>

    <div class="status-box">
      <div class="status-item">
        <span class="status-label">Статус:</span>
        <span class="status-value active">● Активен</span>
      </div>
      <div class="status-item">
        <span class="status-label">Доступность:</span>
        <span class="status-value">24/7</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.production-info h3 {
  margin: 0 0 24px 0;
  font-size: 1.3rem;
  color: #fff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  padding: 20px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  text-align: center;
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.info-card h4 {
  margin: 0 0 8px 0;
  color: #10b981;
  font-size: 1.1rem;
}

.info-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.4;
}

.status-box {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: flex;
  gap: 32px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.status-value {
  font-weight: 600;
  color: #10b981;
}

.status-value.active {
  color: #10b981;
}
</style>
