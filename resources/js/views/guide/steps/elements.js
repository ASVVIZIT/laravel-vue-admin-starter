export default [
    {
        element: '#hamburger-container',
        popover: {
            title: 'Гамбургер-меню',
            description: 'Открытие и закрытие боковой панели',
            position: 'bottom'
        }
    },
    {
        element: '#breadcrumb-container',
        popover: {
            title: 'Хлебные крошки',
            description: 'Показывает текущее расположение в системе',
            position: 'bottom'
        }
    },
    {
        element: '#header-search',
        popover: {
            title: 'Поиск по странице',
            description: 'Быстрая навигация между разделами',
            position: 'left'
        }
    },
    {
        element: '#screenfull',
        popover: {
            title: 'Screenfull',
            description: 'Set the page into fullscreen',
            position: 'left'
        }
    },
    {
        element: '#size-select',
        popover: {
            title: 'Switch Size',
            description: 'Switch the system size',
            position: 'left',
            nextBtnText: 'Next',
            prevBtnText: 'Prev',
        }
    },
    {
        element: '#tags-view-container',
        popover: {
            title: 'Tags view',
            description: 'The history of the page you visited',
            position: 'bottom'
        },
        padding: 0
    },
    {
        element: '#non-existent-element',
        popover: {
            title: 'Тестовый элемент',
            description: 'Этот элемент не существует (пример)',
            position: 'bottom'
        }
    }
]
