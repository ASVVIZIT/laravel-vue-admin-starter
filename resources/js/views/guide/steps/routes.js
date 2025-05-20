export default (router) => {
    return router.getRoutes()
        .filter(route => route.meta?.showInGuide)
        .map((route, index) => ({
            element: `.guide-route-${route.path.replace(/\//g, '-')}`,
            popover: {
                title: route.meta.title,
                description: route.meta.description || 'Описание раздела',
                position: index % 2 === 0 ? 'bottom' : 'top'
            },
            route: route.path
        }))
}
