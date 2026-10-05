import { type ObjectDirective, type DirectiveBinding, h, render, watch } from 'vue'
import LoadingIndicator from '@/modules/TalkStream/Components/UI/LoadingIndicator.vue'
import { getLoadingState } from '@/modules/TalkStream/Composables/useLoading'
import logger from '@/modules/TalkStream/utils/logger'

interface LoadingBindingValue {
    text?: string
    background?: string
}

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding<LoadingBindingValue>) {
        const modifiers = Object.keys(binding.modifiers)
        const key = modifiers[0] || binding.arg || 'global'
        const text = binding.value?.text || binding.value || 'Загрузка...'
        const background = binding.value?.background || 'rgba(255, 255, 255, 0.85)'

        // 🔥 P0-ФИКС прокрутки: НЕ пишем хосту el.style.overflow='hidden'.
        // Раньше эта строка вешала на хост инлайн overflow:hidden навсегда
        // (unmounted его не восстанавливал), что перебивало overflow-y:auto у
        // скроллящихся контейнеров — список контактов (.contacts-wrap) терял
        // вертикальный скролл. position:relative оставляем: он нужен абсолютному
        // оверлею и скролл не ломает.
        el.style.position = 'relative'

        const container = document.createElement('div')
        container.className = 'loading-directive-container'
        Object.assign(container.style, {
            position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
            zIndex: '9999', display: 'flex', justifyContent: 'center', alignItems: 'center',
            backgroundColor: background, pointerEvents: 'none', userSelect: 'none',
            opacity: '0', transition: 'opacity 0.3s ease', backdropFilter: 'blur(2px)',
            webkitBackdropFilter: 'blur(2px)', borderRadius: '8px',
            // 🔥 P0: клип скругления оверлея перенесён С ХОСТА на сам оверлей.
            // Так оверлей по-прежнему аккуратно обрезается по своим borderRadius
            // (включая будущие хосты с border-radius), но скролл хоста больше
            // не глушится никогда.
            overflow: 'hidden'
        })

        el.appendChild(container)

        const loadingVNode = h(LoadingIndicator, { target: key, text })
        render(loadingVNode, container)

        // Сохраняем ссылки на элемент для cleanup
        ;(el as any)._loaderKey = key
        ;(el as any)._loaderContainer = container
        ;(el as any)._loaderVNode = loadingVNode

        ;(el as any)._unwatch = watch(
            () => getLoadingState(key),
            (isLoading: boolean) => {
                if (!container) return
                container.style.opacity = isLoading ? '1' : '0'
                logger.info(`[Directive:v-loader] ${key}: ${isLoading ? 'показываем' : 'скрываем'}`)
            },
            { immediate: true }
        )
    },

    updated(el: HTMLElement, binding: DirectiveBinding<LoadingBindingValue>) {
        const vnode = (el as any)._loaderVNode
        if (vnode && binding.value) {
            const text = binding.value.text || binding.value || 'Загрузка...'
            if (vnode.component && vnode.component.props) {
                vnode.component.props.text = text
            }
        }
    },

    unmounted(el: HTMLElement) {
        if ((el as any)._unwatch) (el as any)._unwatch()
        if ((el as any)._loaderContainer) {
            render(null, (el as any)._loaderContainer)
            el.removeChild((el as any)._loaderContainer)
        }
    }
} as ObjectDirective<HTMLElement, LoadingBindingValue>
