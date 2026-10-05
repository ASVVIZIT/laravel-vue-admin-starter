import { type ObjectDirective, type DirectiveBinding, h, render, watch } from 'vue'
import LoadingIndicator from '@/modules/TalkStream/Components/UI/LoadingIndicatorSmall.vue'
import { getLoadingState } from '@/modules/TalkStream/Composables/useLoading'
import logger from '@/modules/TalkStream/utils/logger'

// Интерфейс для значения, передаваемого в директиву (например: { text: '...', background: '...' })
interface LoadingBindingValue {
    text?: string
    background?: string
}

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding<LoadingBindingValue>) {
        // Получаем ключ зоны загрузки (из модификатора, аргумента или по умолчанию 'global')
        const modifiers = Object.keys(binding.modifiers)
        const key = modifiers[0] || binding.arg || 'global'

        // Текст и фон
        const text = binding.value?.text || binding.value || 'Загрузка...'
        const background = binding.value?.background || 'rgba(255, 255, 255, 0.85)'

        // Настраиваем стили контейнера
        el.style.position = 'relative'
        el.style.overflow = 'hidden'

        const container = document.createElement('div')
        container.className = 'loading-directive-container'
        Object.assign(container.style, {
            position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
            zIndex: '9999', display: 'flex', justifyContent: 'center', alignItems: 'center',
            backgroundColor: background, pointerEvents: 'none', userSelect: 'none',
            opacity: '0', transition: 'opacity 0.3s ease', backdropFilter: 'blur(2px)',
            webkitBackdropFilter: 'blur(2px)', borderRadius: '8px'
        })

        el.appendChild(container)

        // Создаем VNode индикатора
        const loadingVNode = h(LoadingIndicator, { target: key, text })
        render(loadingVNode, container)

        // Сохраняем ссылки на элемент для очистки (unmounted)
        ;(el as any)._loaderKey = key
        ;(el as any)._loaderContainer = container
        ;(el as any)._loaderVNode = loadingVNode

        // Отслеживаем состояние загрузки через composable
        ;(el as any)._unwatch = watch(
            () => getLoadingState(key),
            (isLoading: boolean) => {
                if (!container) return
                container.style.opacity = isLoading ? '1' : '0'
                logger.info(`[Directive:v-loader-small] ${key}: ${isLoading ? 'показываем' : 'скрываем'}`)
            },
            { immediate: true }
        )
    },

    updated(el: HTMLElement, binding: DirectiveBinding<LoadingBindingValue>) {
        // Обновляем текст индикатора, если значение изменилось
        const vnode = (el as any)._loaderVNode
        if (vnode && binding.value) {
            const text = binding.value.text || binding.value || 'Загрузка...'
            if (vnode.component && vnode.component.props) {
                vnode.component.props.text = text
            }
        }
    },

    unmounted(el: HTMLElement) {
        // Очищаем watcher и удаляем DOM-элементы при уничтожении компонента
        if ((el as any)._unwatch) (el as any)._unwatch()
        if ((el as any)._loaderContainer) {
            render(null, (el as any)._loaderContainer)
            el.removeChild((el as any)._loaderContainer)
        }
    }
} as ObjectDirective<HTMLElement, LoadingBindingValue>
