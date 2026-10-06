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
import { loadingConfig, type LoadingZone } from '@/modules/TalkStream/config/loading'

export interface LoadingBindingValue {
    text?: string
    background?: string
}

export type LoadingDirectiveValue = LoadingBindingValue | string

type Layout = 'overlay' | 'inline'

interface LoaderState {
    layout: Layout
    key: string
    // overlay: абсолютный оверлей-контейнер; inline: инлайн-хост внутри хоста.
    container?: HTMLDivElement
    host?: HTMLSpanElement
    vnode: VNode
    unwatch?: () => void
    originalPosition: string
    positionPatched: boolean
    text: string
    background: string
}

const registry = new WeakMap<HTMLElement, LoaderState>()

const resolveKey = (binding: DirectiveBinding<LoadingDirectiveValue>): string => {
    const modifiers = Object.keys(binding.modifiers)
    // Инвариант рукопожатия шаблон->стор: не менять derivation.
    return modifiers[0] || binding.arg || 'global'
}

// binding.value имеет приоритет над зоной; пустая строка текста - валидное
// значение ("без подписи"), поэтому различаем "передано явно" и "отсутствует".
const pickText = (binding: DirectiveBinding<LoadingDirectiveValue>, zone?: LoadingZone): string => {
    const v = binding.value
    if (v && typeof v === 'object' && 'text' in v) return v.text ?? ''
    if (typeof v === 'string') return v
    if (zone && zone.text !== undefined) return zone.text
    return loadingConfig.fallback.text
}

const pickBackground = (binding: DirectiveBinding<LoadingDirectiveValue>, zone?: LoadingZone): string => {
    const v = binding.value
    if (v && typeof v === 'object' && 'background' in v) return v.background ?? loadingConfig.fallback.background
    if (zone && zone.background !== undefined) return zone.background
    return loadingConfig.fallback.background
}

export function createLoadingDirective(
    component: Component,
    logName: string,
    variant: string,
    layout: Layout = 'overlay'
): ObjectDirective<HTMLElement, LoadingDirectiveValue> {
    return {
        mounted(el: HTMLElement, binding: DirectiveBinding<LoadingDirectiveValue>) {
            if (registry.has(el)) return

            const key = resolveKey(binding)
            const zone = loadingConfig.zones[key]
            const text = pickText(binding, zone)
            const background = pickBackground(binding, zone)
            const preset = loadingConfig.variants[variant] ?? loadingConfig.variants.default

            if (layout === 'inline') {
                // Инлайн не пишет хосту вообще никаких стилей (ни position, ни overflow):
                // вставляем отдельный span-хост и рендерим индикатор в него.
                // Видимость сам индикатор гейтит через getLoadingState(key).
                const host = document.createElement('span')
                host.className = 'loading-inline-host'
                el.appendChild(host)

                const vnode = h(component, { target: key, text })
                render(vnode, host)

                registry.set(el, {
                    layout,
                    key,
                    host,
                    vnode,
                    originalPosition: el.style.position,
                    positionPatched: false,
                    text,
                    background
                })
                return
            }

            // Overlay: сохраняем оригинальный inline position и ставим relative
            // только если вычисленный position реально static.
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
                zIndex: String(preset.overlay.zIndex),
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: background,
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: '0',
                transition: `opacity ${preset.overlay.fadeMs}ms ease`,
                backdropFilter: `blur(${preset.overlay.blur}px)`,
                webkitBackdropFilter: `blur(${preset.overlay.blur}px)`,
                borderRadius: `${preset.overlay.radius}px`,
                // Клип скругления на самом оверлее, не на хосте (иначе глушится скролл).
                overflow: 'hidden'
            })
            el.appendChild(container)

            const vnode = h(component, { target: key, text })
            render(vnode, container)

            const unwatch = watch(
                () => getLoadingState(key),
                (isLoading: boolean) => {
                    container.style.opacity = isLoading ? '1' : '0'
                    logger.debug(`[${logName}] ${key}: ${isLoading ? 'показываем' : 'скрываем'}`)
                },
                { immediate: true }
            )

            registry.set(el, {
                layout,
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

            const zone = loadingConfig.zones[state.key]
            const text = pickText(binding, zone)
            const background = pickBackground(binding, zone)

            if (state.layout === 'inline') {
                if (state.text === text) return
                const vnode = h(component, { target: state.key, text })
                if (state.host) render(vnode, state.host)
                state.vnode = vnode
                state.text = text
                return
            }

            if (state.text === text && state.background === background) return
            if (state.container) state.container.style.backgroundColor = background
            const vnode = h(component, { target: state.key, text })
            if (state.container) render(vnode, state.container)
            state.vnode = vnode
            state.text = text
            state.background = background
        },

        unmounted(el: HTMLElement) {
            const state = registry.get(el)
            if (!state) return

            if (state.unwatch) state.unwatch()

            if (state.layout === 'inline') {
                if (state.host) {
                    render(null, state.host)
                    if (state.host.parentNode === el) el.removeChild(state.host)
                }
                registry.delete(el)
                return
            }

            if (state.container) {
                render(null, state.container)
                if (state.container.parentNode === el) el.removeChild(state.container)
            }
            if (state.positionPatched) {
                el.style.position = state.originalPosition
            }
            registry.delete(el)
        }
    }
}
