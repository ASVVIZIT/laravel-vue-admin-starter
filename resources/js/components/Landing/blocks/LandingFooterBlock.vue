<template>
  <footer class="footerSection">
    <div class="footerContent">
      <p v-if="settings.text" class="footerText">{{ settings.text }}</p>
      <p v-if="settings.copyright" class="footerCopyright">{{ settings.copyright }}</p>
      <div v-if="settings.showSocialLinks && settings.socialLinks?.length" class="socialLinks">
        <a v-for="link in settings.socialLinks" :key="link.url" :href="link.url" class="socialLink" target="_blank" rel="noopener">
          <span class="socialIcon">{{ link.icon }}</span>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  settings: { type: Object, default: () => ({ text: 'Разработано с ❤️ на Laravel + Vue 3', copyright: '© 2026 FenixPortal', showSocialLinks: false, socialLinks: [] }) },
  blockId: String
})
</script>

<style scoped>
.footerSection {
  text-align: center;
  padding: 4px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.8s ease-out 0.6s both;
}
.footerContent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.footerText {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}
.footerCopyright {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;
}
.socialLinks {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}
.socialLink {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;
  text-decoration: none;
}
.socialLink:hover {
  background: rgba(255, 107, 53, 0.1);
  border-color: rgba(255, 107, 53, 0.3);
  transform: translateY(-2px);
}
.socialIcon { font-size: 14px; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
