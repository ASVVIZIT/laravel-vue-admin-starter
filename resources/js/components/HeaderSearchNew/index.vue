<template>
    <div :class="{ 'show': show }" class="header-search">
        <div class="nav-search">
            <icon
                class-name="search"
                class="search-icon"
                @click.stop="click"
            />
        </div>
        <el-select
            ref="headerSearchSelect"
            v-model="search"
            :remote-method="querySearch"
            filterable
            default-first-option
            remote
            placeholder="Поиск"
            class="header-search-select"
            @change="change"
        >
            <el-option
                v-for="item in options"
                :key="item.path"
                :value="item"
                :label="item.title.join(' > ')"
            />
        </el-select>
    </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Fuse from 'fuse.js'
import path from 'path'

export default defineComponent({
    name: 'HeaderSearch',
    setup() {
        const store = useStore()
        const router = useRouter()

        const search = ref('')
        const options = ref([])
        const searchPool = ref([])
        const show = ref(false)
        const fuse = ref(null)
        const headerSearchSelect = ref(null)

        const routes = computed(() => store.getters.permission_routes)

        const generateRoutes = (routesList, basePath = '/', prefixTitle = []) => {
            let res = []

            for (const router of routesList) {
                if (router.hidden) continue

                const data = {
                    path: path.resolve(basePath, router.path),
                    title: [...prefixTitle]
                }

                if (router.meta?.title) {
                    data.title = [...data.title, router.meta.title]

                    if (router.redirect !== 'noRedirect') {
                        res.push(data)
                    }
                }

                if (router.children) {
                    const tempRoutes = generateRoutes(
                        router.children,
                        data.path,
                        data.title
                    )
                    if (tempRoutes.length >= 1) {
                        res = [...res, ...tempRoutes]
                    }
                }
            }
            return res
        }

        const initFuse = (list) => {
            fuse.value = new Fuse(list, {
                shouldSort: true,
                threshold: 0.4,
                location: 0,
                distance: 100,
                minMatchCharLength: 1,
                keys: [
                    { name: 'title', weight: 0.7 },
                    { name: 'path', weight: 0.3 }
                ]
            })
        }

        const querySearch = (query) => {
            options.value = query ? fuse.value.search(query) : []
        }

        const click = () => {
            show.value = !show.value
            if (show.value) {
                nextTick(() => {
                    headerSearchSelect.value?.focus()
                })
            }
        }

        const close = () => {
            headerSearchSelect.value?.blur()
            options.value = []
            show.value = false
        }

        const change = (val) => {
            router.push(val.path)
            search.value = ''
            options.value = []
            nextTick(() => (show.value = false))
        }

        watch(routes, (newRoutes) => {
            searchPool.value = generateRoutes(newRoutes)
        })

        watch(searchPool, (newList) => {
            if (newList.length) initFuse(newList)
        })

        watch(show, (value) => {
            if (value) {
                document.body.addEventListener('click', close)
            } else {
                document.body.removeEventListener('click', close)
            }
        })

        onMounted(() => {
            searchPool.value = generateRoutes(routes.value)
        })

        return {
            search,
            options,
            show,
            headerSearchSelect,
            click,
            change,
            querySearch
        }
    }
})
</script>

<style lang="scss" scoped>
/* Стили остаются без изменений */
.header-search {
    font-size: 0 !important;

    .nav-search {
        display: block;
        position: relative;
    }

    .search-icon {
        z-index: 1000;
        cursor: pointer;
        font-size: 18px;
        vertical-align: middle;
        position: absolute;
        top: 6px;
        right: 8px;
    }

    .header-search-select {
        font-size: 18px;
        transition: width 0.2s;
        width: 0;
        overflow: hidden;
        background: transparent;
        border-radius: 0;
        display: inline-block;
        vertical-align: middle;

        :deep(.el-input__inner) {
            border-radius: 0;
            border: 0;
            padding-left: 0;
            padding-right: 0;
            box-shadow: none !important;
            border-bottom: 1px solid #d9d9d9;
            vertical-align: middle;
        }

        :deep(.el-select__wrapper) {
            padding: 4px 28px 4px 8px !important;
        }
    }

    &.show {
        .header-search-select {
            width: 210px;
            margin-left: 10px;
        }
    }
}
</style>
