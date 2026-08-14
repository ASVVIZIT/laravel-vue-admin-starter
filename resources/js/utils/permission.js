import { userStore } from '@/store/userStore'

/**
 * @param {Array} value - Массив требуемых прав, например: ['confirm user email']
 * @returns {Boolean}
 */
export default function checkPermission(value) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    console.error(`[checkPermission] Передан некорректный аргумент. Ожидался массив, например: ['manage permission']`)
    return false
  }

  const store = userStore()

  // Безопасно получаем массив прав. Pinia автоматически распаковывает ref,
  // но мы добавляем явную проверку на случай, если store еще пуст.
  const permissions = Array.isArray(store.permissions) ? store.permissions : []

  // 🔥 ВРЕМЕННЫЙ ДЕБАГ: Чтобы точно увидеть, что функция видит при рендере
  if (value.includes('confirm user email')) {
    console.log('🔍 [checkPermission DEBUG для confirm user email]:', {
      permissionsLength: permissions.length,
      hasConfirmEmail: permissions.includes('confirm user email'),
      // Раскомментируй строку ниже, если хочешь увидеть весь массив в консоли:
      // allPermissions: permissions
    })
  }

  return value.some(requiredPermission => permissions.includes(requiredPermission))
}
