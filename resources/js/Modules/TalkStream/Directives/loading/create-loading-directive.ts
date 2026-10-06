import {
    type Component,
    type ObjectDirective,
    type DirectiveBinding,
    type VNode,
    h,
    render,
    watch
} from 'vue'
import { getLoadingState } from '@/modules/TalkStream/Composables/useLoading'
import logger from '@/modules/TalkStream/utils/logger'

export interface LoadingBindingValue {
    text?: string
    background?: string
}

export type LoadingDirectiveValue = LoadingBindingValue | string

interface LoaderState {
    key: string
    container: HTMLDivElement
    vnode: VNode
    unwatch: () => void
    originalPosition: string
    positionPatched: boolean
    text: string
    background: string
}

const DEFAULT_TEXT = 'Загрузка...'
const DEFAULT_BACKGROUND = 'rgba(255, 255, 255, 0.85)'

const registry = new WeakMap<HTMLElement, LoaderState>()

const resolveKey = (binding: DirectiveBinding<LoadingDirectiveValue>): string => {
    const modifiers = Object.keys(binding.modifiers)
    return modifiers[0] || binding.arg || 'global'
}

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

export function createLoadingDirective(
    component: Component,
    logName: string
): ObjectDirective<HTMLElement, LoadingDirectiveValue> {
    return {
        mounted(el: HTMLElement, binding: DirectiveBinding<LoadingDirectiveValue>) {
            if (registry.has(el)) return

            const key = resolveKey(binding)
            const text = resolveText(binding.value)
            const background = resolveBackground(binding.value)

            // 🔥 P4c: сохраняем оригинальный inline position и трогаем его
            // только если элемент реально не имеет позиционирующего контекста.
            const originalPosition = el.style.position
            const computedPosition = window.getComputedStyle(el).position
            const positionPatched = computedPosition === 'static'

            if (positionPatched) {
                el.style.position = 'relative'
            }

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
                // 🔥 P0-база: клип скругления на оверлее, не на хосте.
                overflow: 'hidden'
            })

            el.appendChild(container)

            const vnode = h(component, { target: key, text })
            render(vnode, container)

            // 🔥 P3b: без мёртвого if (!container) внутри watch.
            const unwatch = watch(
                () => getLoadingState(key),
                (isLoading: boolean) => {
                    container.style.opacity = isLoading ? '1' : '0'
                    // 🔥 P4b: debug вместо info для частых логов.
                    logger.debug(`[${logName}] ${key}: ${isLoading ? 'показываем' : 'скрываем'}`)
                },
                { immediate: true }
            )

            registry.set(el, {
                key,
                container,
                vnode,
                unwatch,
                originalPosition,
                positionPatched,
                text,
                background
            })
        },

        updated(el: HTMLElement, binding: DirectiveBinding<LoadingDirectiveValue>) {
            const state = registry.get(el)
            if (!state) return

            const text = resolveText(binding.value)
            const background = resolveBackground(binding.value)

            if (state.text === text && state.background === background) return

            state.container.style.backgroundColor = background

            // 🔥 P2a/P3a: корректный re-render с новыми props.
            const vnode = h(component, { target: state.key, text })
            render(vnode, state.container)

            state.vnode = vnode
            state.text = text
            state.background = background
        },

        unmounted(el: HTMLElement) {
            const state = registry.get(el)
            if (!state) return

            state.unwatch()
            render(null, state.container)

            // 🔥 P2b: безопасное удаление.
            if (state.container.parentNode === el) {
                el.removeChild(state.container)
            }

            // 🔥 P4c: восстанавливаем position только если сами его ставили.
            if (state.positionPatched) {
                el.style.position = state.originalPosition
            }

            registry.delete(el)
        }
    }
}
