/**
 * Визуальные токены лоадеров модуля TalkStream.
 *
 * Это фронтовый контракт дизайна, НЕ бизнес-настройки: он не едет через API
 * и не дублирует config/talkstream.php. Директивы и индикаторы читают его
 * напрямую, поэтому в шаблонах не остаётся литералов текста/фона/размеров.
 *
 * Оси:
 *   variants - переиспользуемые наборы (default/small/inline), выбираются
 *              той обёрткой-директивой, которую поставили на элемент.
 *   zones    - привязка к ключу загрузки (модификатор .contacts/.history/...):
 *              текст и точечные переопределения фона под конкретный контейнер.
 *
 * Приоритет слияния в директиве: binding.value > zones[key] > variants[variant] > fallback.
 * Пока шаблоны передают binding.value, поведение идентично старому; после очистки
 * биндингов значения берутся отсюда без изменения рендера.
 */

export interface SpinnerTokens {
    size: number | null;        // px диаметра; null = не подтверждён, заполняется в Пасс C
    border: number | null;      // px толщины кольца
    track: string | null;       // цвет незамкнутой части кольца
    tone: string | null;        // цвет дуги вращения ('currentColor' для inline)
    textSize: string | null;    // CSS-единицы подписи
    textColor: string | null;   // CSS-цвет подписи ('inherit' для inline)
    labelGap: number | null;    // px зазора спиннер/подпись
}

export interface OverlayTokens {
    background: string;         // цвет затемнения оверлея
    blur: number;               // px backdrop-blur
    radius: number;             // px скругления оверлея
    zIndex: number;             // порядок поверх контента
    fadeMs: number;             // ms плавного появления/исчезновения
}

export interface VariantPreset {
    spinner: SpinnerTokens;
    overlay: OverlayTokens;
    labelPlacement: 'top' | 'bottom' | 'left' | 'right';
}

export interface LoadingZone {
    text?: string;
    background?: string;
}

export interface LoadingConfig {
    fallback: { text: string; background: string };
    variants: Record<string, VariantPreset>;
    zones: Record<string, LoadingZone>;
}

// Оверлей-токены ниже сверены по телу директивы в дампе Level_3.6
// (background/blur/radius/zIndex/fade и дефолт фона из Object.assign(container.style,...)).
export const loadingConfig: LoadingConfig = {
    fallback: {
        text: 'Загрузка...',
        background: 'rgba(255, 255, 255, 0.85)',
    },

    variants: {
        default: {
            // TODO(Пасс C): заполнить spinner из тела LoadingIndicator.vue
            // (в дампе блок .spinner{width...} отсутствует, значения не угадываем).
            spinner: { size: null, border: null, track: null, tone: null, textSize: null, textColor: null, labelGap: null },
            overlay: { background: 'rgba(255, 255, 255, 0.85)', blur: 2, radius: 8, zIndex: 9999, fadeMs: 300 },
            labelPlacement: 'bottom',
        },
        small: {
            // TODO(Пасс C): заполнить spinner из тела LoadingIndicatorSmall.vue.
            spinner: { size: null, border: null, track: null, tone: null, textSize: null, textColor: null, labelGap: null },
            overlay: { background: 'rgba(255, 255, 255, 0.85)', blur: 2, radius: 8, zIndex: 9999, fadeMs: 300 },
            labelPlacement: 'bottom',
        },
        inline: {
            // Токены inline заданы здесь полностью: компонент пишется заново в этом пассе,
            // значения известны по построению и не требуют сверки со старыми телами.
            // tone/textColor на currentColor/inherit - спиннер подстраивается под цвет текста
            // кнопки/строки, поэтому inline и вынесен в отдельный вариант.
            spinner: { size: 16, border: 2, track: 'rgba(127,127,127,0.25)', tone: 'currentColor', textSize: '0.7rem', textColor: 'inherit', labelGap: 6 },
            overlay: { background: 'transparent', blur: 0, radius: 0, zIndex: 0, fadeMs: 150 },
            labelPlacement: 'right',
        },
    },

    // Ключи совпадают с модификаторами директив (.contacts/.history/.sender/...).
    // text/background здесь равны тем, что раньше передавались биндингом в шаблонах,
    // поэтому перенос значений из шаблонов сюда не меняет рендер.
    zones: {
        contacts:   { text: 'Загрузка контактов...', background: '#ffffffaa' },
        history:    { text: 'Загрузка истории...',   background: '#ffffffaa' },
        sender:     { text: '' },
        friends:    { text: '' },
        callRow:    { text: '' },
        connection: { text: '' },
        global:     { text: 'Загрузка...' },
    },
};
