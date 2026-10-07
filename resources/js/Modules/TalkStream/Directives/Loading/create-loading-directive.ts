// resources/js/modules/TalkStream/Directives/Loading/create-loading-directive.ts

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

    /**
     * Минимальное время показа лоадера в секундах.
     *
     * Пример:
     *   v-loading-talkstream.history="{ minVisible: 1.5 }"
     *
     * Если не передано, берётся из:
     *   zones[key].minVisibleMs
     *   variants[variant].minVisibleMs
     *   fallback.minVisibleMs
     */
    minVisible?: number
}

export type LoadingDirectiveValue = LoadingBindingValue | string

type Layout = 'overlay' | 'inline'

interface LoaderState {
    layout: Layout
    key: string

    // overlay: абсолютный оверлей-контейнер; inline: инлайн-хост внутри хоста.
    container?: HTMLDivElement
    host?: HTMLSpanElement

    vnode: VNode | null
    unwatch?: () => void

    originalPosition: string
    positionPatched: boolean

    text: string
    background: string

    minVisibleMs: number
    visible: boolean
    startedAt: number
    hideTimer?: ReturnType<typeof setTimeout>
}

const registry = new WeakMap<HTMLElement, LoaderState>()

const resolveKey = (binding: DirectiveBinding<LoadingDirectiveValue>): string => {
    const modifiers = Object.keys(binding.modifiers)

    // Инвариант рукопожатия шаблон->стор: не менять derivation.
    return modifiers[0] || binding.arg || 'global'
}

// binding.value имеет приоритет над зоной; пустая строка текста - валидное
// значение ("без подписи"), поэтому различаем "передано явно" и "отсутствует".
const pickText = (
    binding: DirectiveBinding<LoadingDirectiveValue>,
    zone?: LoadingZone
): string => {
    const v = binding.value

    if (v && typeof v === 'object' && 'text' in v) {
        return v.text ?? ''
    }

    if (typeof v === 'string') {
        return v
    }

    if (zone && zone.text !== undefined) {
        return zone.text
    }

    return loadingConfig.fallback.text
}

const pickBackground = (
    binding: DirectiveBinding<LoadingDirectiveValue>,
    zone?: LoadingZone
): string => {
    const v = binding.value

    if (v && typeof v === 'object' && 'background' in v) {
        return v.background ?? loadingConfig.fallback.background
    }

    if (zone && zone.background !== undefined) {
        return zone.background
    }

    return loadingConfig.fallback.background
}

const secondsToMs = (value: unknown): number | undefined => {
    if (typeof value !== 'number') {
        return undefined
    }

    if (!Number.isFinite(value)) {
        return undefined
    }

    return Math.max(0, value * 1000)
}

const pickMinVisibleMs = (
    binding: DirectiveBinding<LoadingDirectiveValue>,
    zone: LoadingZone | undefined,
    variant: string
): number => {
    const v = binding.value

    // 1. Явный параметр директивы: { minVisible: 1.5 }
    if (v && typeof v === 'object') {
        const fromValue = secondsToMs(v.minVisible)

        if (fromValue !== undefined) {
            return fromValue
        }
    }

    // 2. Зона: loadingConfig.zones[key].minVisibleMs
    if (zone && typeof zone.minVisibleMs === 'number') {
        return Math.max(0, zone.minVisibleMs)
    }

    // 3. Вариант: loadingConfig.variants[variant].minVisibleMs
    const variantConfig = loadingConfig.variants[variant]

    if (variantConfig && typeof variantConfig.minVisibleMs === 'number') {
        return Math.max(0, variantConfig.minVisibleMs)
    }

    // 4. Фолбэк: loadingConfig.fallback.minVisibleMs
    return Math.max(0, loadingConfig.fallback.minVisibleMs)
}

const syncVNode = (
    state: LoaderState,
    component: Component
): void => {
    const vnode = h(component, {
        target: state.key,
        text: state.text,

        // Директива сама управляет видимостью.
        manual: true,
        visible: state.visible
    })

    if (state.layout === 'inline') {
        if (state.host) {
            render(vnode, state.host)
        }
    }
    else if (state.container) {
        render(vnode, state.container)
    }

    state.vnode = vnode
}

const applyVisible = (
    state: LoaderState,
    component: Component,
    visible: boolean
): void => {
    if (state.visible === visible) {
        return
    }

    state.visible = visible

    // Overlay: директива управляет opacity контейнера.
    if (state.layout === 'overlay' && state.container) {
        state.container.style.opacity = visible ? '1' : '0'
    }

    // Inline: НЕ трогаем host.style.opacity.
    // Видимость и fade владеет сам компонент через <transition> + v-show.
    syncVNode(state, component)
}

const showNow = (
    state: LoaderState,
    component: Component,
    logName: string
): void => {
    if (state.hideTimer !== undefined) {
        clearTimeout(state.hideTimer)
        state.hideTimer = undefined
    }

    if (!state.visible) {
        state.startedAt = Date.now()
        applyVisible(state, component, true)

        logger.debug(`[${logName}] ${state.key}: показываем`)
    }
}

const hideOrSchedule = (
    state: LoaderState,
    component: Component,
    logName: string
): void => {
    if (!state.visible) {
        return
    }

    const elapsed = Date.now() - state.startedAt
    const delay = Math.max(0, state.minVisibleMs - elapsed)

    if (delay === 0) {
        applyVisible(state, component, false)
        logger.debug(`[${logName}] ${state.key}: скрываем`)
        return
    }

    if (state.hideTimer !== undefined) {
        clearTimeout(state.hideTimer)
    }

    state.hideTimer = setTimeout(() => {
        state.hideTimer = undefined
        applyVisible(state, component, false)

        logger.debug(`[${logName}] ${state.key}: скрываем после minVisible`)
    }, delay)

    logger.debug(`[${logName}] ${state.key}: откладываем скрытие на ${delay} ms`)
}

export function createLoadingDirective(
    component: Component,
    logName: string,
    variant: string,
    layout: Layout = 'overlay'
): ObjectDirective<HTMLElement, LoadingDirectiveValue> {
    return {
        mounted(el: HTMLElement, binding: DirectiveBinding<LoadingDirectiveValue>) {
            if (registry.has(el)) {
                return
            }

            const key = resolveKey(binding)
            const zone = loadingConfig.zones[key]
            const text = pickText(binding, zone)
            const background = pickBackground(binding, zone)
            const minVisibleMs = pickMinVisibleMs(binding, zone, variant)
            const preset = loadingConfig.variants[variant] ?? loadingConfig.variants.default!

            const state: LoaderState = {
                layout,
                key,
                vnode: null,
                originalPosition: el.style.position,
                positionPatched: false,
                text,
                background,
                minVisibleMs,
                visible: false,
                startedAt: 0
            }

            if (layout === 'inline') {
                // Инлайн не пишет хосту вообще никаких стилей (ни position, ни overflow):
                // вставляем отдельный span-хост и рендерим индикатор в него.
                const host = document.createElement('span')
                host.className = 'loading-inline-host'
                host.style.display = 'inline-flex'

                el.appendChild(host)

                state.host = host

                const vnode = h(component, {
                    target: key,
                    text,
                    manual: true,
                    visible: false
                })

                render(vnode, host)
                state.vnode = vnode

                registry.set(el, state)

                const unwatch = watch(
                    () => getLoadingState(key),
                    (isLoading: boolean) => {
                        if (isLoading) {
                            showNow(state, component, logName)
                        }
                        else {
                            hideOrSchedule(state, component, logName)
                        }
                    },
                    { immediate: true }
                )

                state.unwatch = unwatch
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

            container.style.position = 'absolute'
            container.style.top = '0'
            container.style.left = '0'
            container.style.right = '0'
            container.style.bottom = '0'
            container.style.zIndex = String(preset.overlay.zIndex)
            container.style.display = 'flex'
            container.style.justifyContent = 'center'
            container.style.alignItems = 'center'
            container.style.backgroundColor = background
            container.style.pointerEvents = 'none'
            container.style.userSelect = 'none'
            container.style.opacity = '0'
            container.style.transition = `opacity ${preset.overlay.fadeMs}ms ease`
            container.style.backdropFilter = `blur(${preset.overlay.blur}px)`
            container.style.setProperty('-webkit-backdrop-filter', `blur(${preset.overlay.blur}px)`)
            container.style.borderRadius = `${preset.overlay.radius}px`

            // Клип скругления на самом оверлее, не на хосте (иначе глушится скролл).
            container.style.overflow = 'hidden'

            el.appendChild(container)

            state.container = container
            state.positionPatched = positionPatched

            const vnode = h(component, {
                target: key,
                text,
                manual: true,
                visible: false
            })

            render(vnode, container)
            state.vnode = vnode

            registry.set(el, state)

            const unwatch = watch(
                () => getLoadingState(key),
                (isLoading: boolean) => {
                    if (isLoading) {
                        showNow(state, component, logName)
                    }
                    else {
                        hideOrSchedule(state, component, logName)
                    }
                },
                { immediate: true }
            )

            state.unwatch = unwatch
        },

        updated(el: HTMLElement, binding: DirectiveBinding<LoadingDirectiveValue>) {
            const state = registry.get(el)

            if (!state) {
                return
            }

            const zone = loadingConfig.zones[state.key]
            const text = pickText(binding, zone)
            const background = pickBackground(binding, zone)
            const minVisibleMs = pickMinVisibleMs(binding, zone, variant)

            state.minVisibleMs = minVisibleMs

            let needSync = false

            if (state.text !== text) {
                state.text = text
                needSync = true
            }

            if (state.layout === 'overlay' && state.background !== background) {
                state.background = background

                if (state.container) {
                    state.container.style.backgroundColor = background
                }
            }

            if (needSync) {
                syncVNode(state, component)
            }

            if (getLoadingState(state.key)) {
                showNow(state, component, logName)
            }
            else {
                hideOrSchedule(state, component, logName)
            }
        },

        unmounted(el: HTMLElement) {
            const state = registry.get(el)

            if (!state) {
                return
            }

            if (state.unwatch) {
                state.unwatch()
            }

            if (state.hideTimer !== undefined) {
                clearTimeout(state.hideTimer)
                state.hideTimer = undefined
            }

            if (state.layout === 'inline') {
                if (state.host) {
                    render(null, state.host)

                    if (state.host.parentNode === el) {
                        el.removeChild(state.host)
                    }
                }

                registry.delete(el)
                return
            }

            if (state.container) {
                render(null, state.container)

                if (state.container.parentNode === el) {
                    el.removeChild(state.container)
                }
            }

            if (state.positionPatched) {
                el.style.position = state.originalPosition
            }

            registry.delete(el)
        }
    }
}
