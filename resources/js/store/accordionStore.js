import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useAccordionStore = defineStore('accordion', () => {
    // Состояния
    const activePanels = ref(JSON.parse(localStorage.getItem('activePanels')) || [])
    const accordionMode = ref(localStorage.getItem('accordionMode') || 'single')
    const allPanelIds = ref([]) // Добавляем отслеживание всех ID

    // Геттеры
    const isPanelActive = computed(() => (id) => {
        console.log('Проверка активности панели', id, 'Текущие активные:', activePanels.value)
        return activePanels.value.includes(id)
    })

    // Вотчеры
    // Синхронизация с localStorage
    watch([activePanels, accordionMode], () => {
        console.log('Синхронизация с localStorage:')
        console.log('Активные панели:', activePanels.value)
        console.log('Режим:', accordionMode.value)

        localStorage.setItem('activePanels', JSON.stringify(activePanels.value))
        localStorage.setItem('accordionMode', accordionMode.value)
    })

    // Действия
    // В хранилище добавлена защита от дубликатов
    const registerPanel = (id) => {
        console.log('Регистрация панели', id)
        if (!allPanelIds.value.includes(id)) { // Проверка на существование ID
            allPanelIds.value.push(id)
        }
    }

    const unregisterPanel = (id) => {
        console.log('Удаление панели', id)
        const index = allPanelIds.value.indexOf(id)
        if (index !== -1) {
            allPanelIds.value.splice(index, 1)
        }
    }

    const togglePanel = (id) => {
        console.log('Переключение панели', id, 'Режим:', accordionMode.value)
        // Блокируем обработку кликов в режимах all/none
        if (['all', 'none'].includes(accordionMode.value)) {
            console.log('Клик заблокирован в текущем режиме')
            return
        }

        if (accordionMode.value === 'single') {
            console.log('Обработка режима SINGLE')
            const newState = activePanels.value.includes(id) ? [] : [id]
            console.log('Новое состояние:', newState)
            activePanels.value = newState
        } else if (accordionMode.value === 'multiple') {
            console.log('Обработка режима MULTIPLE')
            const index = activePanels.value.indexOf(id)
            index === -1
                ? activePanels.value.push(id)
                : activePanels.value.splice(index, 1)

/*            if (index === -1) {
                console.log('Добавление панели', id)
                activePanels.value.push(id)
            } else {
                console.log('Удаление панели', id)
                activePanels.value.splice(index, 1)
            }*/
        }
        console.log('Обновленные активные панели:', activePanels.value)

        // Режимы all/none обрабатываются в setMode
    }

    const setMode = (mode) => {
        console.log('Изменение режима на:', mode)
        accordionMode.value = mode
        if (mode === 'all') {
            console.log('Режим ALL - открытие всех панелей:', allPanelIds.value)
            activePanels.value = [...allPanelIds.value]
        } else if (mode === 'none') {
            console.log('Режим NONE - закрытие всех панелей')
            activePanels.value = []
        }
        console.log('Новые активные панели после смены режима:', activePanels.value)
    }

    return {
        activePanels,
        accordionMode,
        allPanelIds,
        isPanelActive,
        registerPanel,
        unregisterPanel,
        togglePanel,
        setMode
    }
})

/*
    Режим 'single' (по умолчанию):
        При клике на закрытую панель: закрывает все другие, открывает текущую
        При клике на открытую панель: закрывает её
        Реализовано через замену массива на [id] или пустой массив

    Режим 'multiple':
        Каждый клик переключает состояние конкретной панели
        Можно открывать/закрывать несколько независимо
        Используется классическое добавление/удаление из массива
*/
/*
    Режим 'all и none':
        Блокировка логики в хранилище
        Визуальная индикация неактивных панелей
        Отключение обработчика кликов на уровне компонента
*/
/*
    В режиме single:
        Открыта панель 1 → клик на панель 2 → открыта только 2
        Клик на открытую панель 2 → закрывается
        Одновременно открыта только 1 панель

    В режиме multiple:
        Клик на панель 1 → открывается
        Клик на панель 2 → открывается
        Клик на панель 1 → закрывается
        Можно открывать любое количество
*/

