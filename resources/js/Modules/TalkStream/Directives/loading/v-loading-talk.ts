import { type ObjectDirective, type DirectiveBinding, h, render, watch } from 'vue'
import LoadingIndicator from '@/modules/TalkStream/Components/UI/LoadingIndicator.vue'
import { getLoadingState } from '@/modules/TalkStream/Composables/useLoading'
import logger from '@/modules/TalkStream/utils/logger'

interface LoadingBindingValue {
    text?: string
    background?: string
}

type LoadingDirectiveValue = LoadingBindingValue | string

const DEFAULT_TEXT = 'Загрузка...'
const DEFAULT_BACKGROUND = 'rgba(255, 255, 255, 0.85)'

const resolveText = (value: LoadingDirectiveValue | undefined): string => {
    if (!value) return DEFAULT_TEXT
    if (typeof value === 'string') return value
    return value.text || DEFAULT_TEXT
}

const resolveBackground = (value: LoadingDirectiveValue | undefined): string => {
    if (value && typeof value === 'object' && value.background) {
        return value.background
    }
    return DEFAULT_BACKGROUND
}

export default {
    mounted(el: HTMLElement, binding: DirectiveBinding<LoadingDirectiveValue>) {
        const modifiers = Object.keys(binding.modifiers)
        const key = modifiers[0] || binding.arg || 'global'
        const text = resolveText(binding.value)
        const background = resolveBackground(binding.value)

        // 🔥 P0-база: не ставим хосту overflow:hidden.
        // position:relative нужен для абсолютного оверлея и не ломает скролл.
        el.style.position = 'relative'

        const container = document.createElement('div')
        container.className = 'loading-directive-container'
        Object.assign(container.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            zIndex: '9999',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: background,
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            backdropFilter: 'blur(2px)',
            webkitBackdropFilter: 'blur(2px)',
            borderRadius: '8px',
            // 🔥 P0: клип скругления перенесён на сам оверлей, а не на хост.
            overflow: 'hidden'
        })

        el.appendChild(container)

        const loadingVNode = h(LoadingIndicator, { target: key, text })
        render(loadingVNode, container)

        // Сохраняем ссылки для cleanup и обновления.
        ;(el as any)._loaderKey = key
        ;(el as any)._loaderContainer = container
        ;(el as any)._loaderVNode = loadingVNode
        ;(el as any)._loaderText = text
        ;(el as any)._loaderBackground = background

        ;(el as any)._unwatch = watch(
            () => getLoadingState(key),
            (isLoading: boolean) => {
                container.style.opacity = isLoading ? '1' : '0'
                logger.info(`[Directive:v-loader] ${key}: ${isLoading ? 'показываем' : 'скрываем'}`)
            },
            { immediate: true }
        )
    },

    updated(el: HTMLElement, binding: DirectiveBinding<LoadingDirectiveValue>) {
        const container = (el as any)._loaderContainer as HTMLDivElement | undefined
        const key = (el as any)._loaderKey as string | undefined
        if (!container || !key) return

        const text = resolveText(binding.value)
        const background = resolveBackground(binding.value)

        // 🔥 P2a: не мутируем vnode.component.props напрямую.
        // Если значение не изменилось — не перерендерим без нужды.
        const prevText = (el as any)._loaderText as string | undefined
        const prevBackground = (el as any)._loaderBackground as string | undefined
        if (prevText === text && prevBackground === background) return

        container.style.backgroundColor = background

        const vnode = h(LoadingIndicator, { target: key, text })
        render(vnode, container)

        ;(el as any)._loaderVNode = vnode
        ;(el as any)._loaderText = text
        ;(el as any)._loaderBackground = background
    },

    unmounted(el: HTMLElement) {
        const unwatch = (el as any)._unwatch as (() => void) | undefined
        if (unwatch) unwatch()

        const container = (el as any)._loaderContainer as HTMLDivElement | undefined
        if (container) {
            render(null, container)

            // 🔥 P2b: защищаем removeChild от гонок teardown.
            if (container.parentNode === el) {
                el.removeChild(container)
            }
        }

        delete (el as any)._loaderKey
        delete (el as any)._loaderContainer
        delete (el as any)._loaderVNode
        delete (el as any)._loaderText
        delete (el as any)._loaderBackground
        delete (el as any)._unwatch
    }
} as ObjectDirective<HTMLElement, LoadingDirectiveValue>
