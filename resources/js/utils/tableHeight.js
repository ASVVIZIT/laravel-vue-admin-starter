export const calculateTableHeight = (minHeight = 300, addLevel = 60) => {
    const navbarEl = document.querySelector('#main-navbar')
    const tagsViewEl = document.querySelector('#tags-view-container')
    const appMainEl = document.querySelector('#app-main')
    const cardBodyEl = document.querySelector('.el-card__body')
    const filterContainer = document.querySelector('.filter-container')
    const paginationEl = document.querySelector('.pagination-container, .el-pagination')

    const navbarHeight = navbarEl?.offsetHeight || 60
    const tagsViewHeight = tagsViewEl?.offsetHeight || 50

    const appMainStyle = window.getComputedStyle(appMainEl || {})
    const appMainPadding = (parseInt(appMainStyle.paddingTop) || 20) + (parseInt(appMainStyle.paddingBottom) || 20)

    const cardBodyStyle = window.getComputedStyle(cardBodyEl || {})
    const cardBodyPadding = (parseInt(cardBodyStyle.paddingTop) || 20) + (parseInt(cardBodyStyle.paddingBottom) || 20)

    const filterHeight = (filterContainer?.offsetHeight || 0) + addLevel
    const paginationHeight = paginationEl?.offsetHeight || 60

    const totalOffset = navbarHeight + tagsViewHeight + appMainPadding + cardBodyPadding + filterHeight + paginationHeight
    const viewportHeight = window.innerHeight

    return viewportHeight - totalOffset < minHeight
        ? `${minHeight}px`
        : `calc(100vh - ${totalOffset}px)`
}
