<template>
    <div ref="rightPanel" :class="{show: opened}" class="rightPanel-container">
        <div class="rightPanel-background" @click="toggleRightPanel"/>
        <div class="rightPanel">
            <div
                class="handle-button"
                :style="{'top': buttonTop + 'px', 'background-color': theme}"
                @click="toggleRightPanel"
            >
                <i :class="opened ? 'bi bi-x' : 'bi bi-gear'" />
            </div>
            <div class="rightPanel-wrapper-items">
                <div class="rightPanel-items">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAppStore } from '@/store/app'

// Define component props / Определение пропсов компонента
const props = defineProps({
    clickNotClose: {
        type: Boolean,
        default: false
    },
    buttonTop: {
        type: Number,
        default: 250
    }
})

// Store initialization / Инициализация хранилища
const appStore = useAppStore()


// Computed properties / Вычисляемые свойства
const settings = computed(() => appStore.settings)
const theme = computed(() => appStore.settings.theme)
const opened = computed(() => appStore.rightPanel.opened)

// Toggle panel visibility / Переключение видимости панели
const toggleRightPanel = () => {
    appStore.toggleRightPanel()
}

/*const addEventClick = () => {
    window.addEventListener('click', closeSidebar)
};*/

// Close sidebar when clicking outside / Закрытие панели при клике снаружи
const closeSidebar = (evt) => {
    const parent = evt.target.closest('.rightPanel')
    if (!parent) {
        appStore.setRightPanel(false)
        window.removeEventListener('click', closeSidebar)
    }
}

// Watch for panel state changes / Следим за изменениями состояния панели
watch(opened, (newVal) => {
    if (newVal && !props.clickNotClose) {
        window.addEventListener('click', closeSidebar)
    } else {
        window.removeEventListener('click', closeSidebar)
    }
})

</script>

<style lang="scss" scoped>
/* Styles remain unchanged / Стили остаются без изменений */
.showRightPanel {
    overflow: hidden;
    position: relative;
    width: calc(100% - 25px);
}

.rightPanel-background {
    position: fixed;
    top: 0;
    left: 0;
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);
    background: rgba(0, 0, 0, 0.2);
    z-index: -1;
}

.rightPanel {
    width: 100%;
    min-width: 280px;
    max-width: fit-content;
    height: 100vh;
    position: fixed;
    top: 0;
    right: 2px;
    box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.05);
    transition: all 0.25s cubic-bezier(0.7, 0.3, 0.1, 1);
    transform: translate(100%);
    background: #fff;
    z-index: 40000;
}

.rightPanel-wrapper-items {
    height: calc(100vh - 50px);
    display: block;
    position: relative;
    width: 100%;
    padding: 2px;
    overflow: auto;
}

.rightPanel-items {
    height: 100%;
}

.show {
    transition: all 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);

    .rightPanel-background {
        z-index: 20000;
        opacity: 1;
        width: 100%;
        height: 100%;
    }

    .rightPanel {
        transform: translate(0);
    }
}

.handle-button {
    width: 48px;
    height: 48px;
    position: absolute;
    left: -48px;
    text-align: center;
    font-size: 24px;
    border-radius: 6px 0 0 6px !important;
    z-index: 0;
    pointer-events: auto;
    cursor: pointer;
    color: #fff;
    line-height: 48px;

    i {
        font-size: 24px;
        line-height: 48px;
    }
}
</style>
