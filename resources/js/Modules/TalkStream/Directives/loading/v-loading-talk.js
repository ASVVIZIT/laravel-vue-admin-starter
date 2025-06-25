import { h, render, watch } from 'vue'
import LoadingIndicator from '@/modules/TalkStream/Components/UI/LoadingIndicator.vue'
import { getLoadingState } from '@/modules/TalkStream/Composables/useLoading'
import logger from '@/modules/TalkStream/utils/logger'

export default {
    mounted(el, binding) {
        const key = Object.keys(binding.modifiers)[0] || binding.arg || 'global'
        const text = binding.value?.text || binding.value || 'Загрузка...'
        const background = binding.value?.background || 'rgba(255, 255, 255, 0.85)'

        el.style.position = 'relative'
        el.style.overflow = 'hidden'

        // Контейнер для спиннера
        const container = document.createElement('div')
        container.className = 'loading-directive-container'
        container.style.position = 'absolute'
        container.style.top = '0'
        container.style.left = '0'
        container.style.right = '0'
        container.style.bottom = '0'
        container.style.zIndex = '9999'
        container.style.display = 'flex'
        container.style.justifyContent = 'center'
        container.style.alignItems = 'center'
        container.style.backgroundColor = background
        container.style.pointerEvents = 'none'
        container.style.userSelect = 'none'
        container.style.opacity = '0'
        container.style.transition = 'opacity 0.3s ease'
        container.style.backdropFilter = 'blur(2px)'
        container.style.webkitBackdropFilter = 'blur(2px)'
        container.style.borderRadius = '8px'

        el.appendChild(container)

        // VNode компонента
        const loadingVNode = h(LoadingIndicator, {
            target: key,
            text
        })

        render(loadingVNode, container)

        // Сохраняем ссылки
        el._loaderKey = key
        el._loaderContainer = container
        el._loaderVNode = loadingVNode

        // Отслеживаем состояние загрузки
        el._unwatch = watch(
            () => getLoadingState(key),
            (isLoading) => {
                if (!container) return

                container.style.opacity = isLoading ? '1' : '0'

                logger.info(`[Directive:v-loader] ${key}: ${isLoading ? 'показываем' : 'скрываем'}`)
            },
            { immediate: true }
        )
    },

    updated(el, binding) {
        if (el._loaderVNode && binding.value) {
            const text = binding.value.text || binding.value || 'Загрузка...'
            el._loaderVNode.component.props.text = text
        }
    },

    unmounted(el) {
        if (el._unwatch) el._unwatch()
        if (el._loaderContainer) {
            render(null, el._loaderContainer)
            el.removeChild(el._loaderContainer)
        }
    }
}
