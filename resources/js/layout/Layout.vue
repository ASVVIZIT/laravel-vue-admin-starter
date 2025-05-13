<template>
  <div :class="classObj" class="layout-wrapper">
    <!--left side-->
    <Sidebar v-if="settings.showLeftMenu" class="sidebar-container" />
    <!--right container-->
    <div class="main-container">
      <Navbar v-if="settings.showTopNavbar" />
      <TagsView v-if="settings.showTagsView" />
      <AppMain />
      <RightPanel v-if="settings.showSettings">
        <div class="text-center">
          <h4>Настройки интерфейса сайта</h4></div>
        <SettingsPanel />
        <Accordion>
          <AccordionPanel
              v-for="panel in panels"
              :id="panel.id"
              :key="panel.id"
              :title="`Панель ${panel.title}`"
              :headerClass="'default-header-style'"
              :customClass="'customClass-header-style'"
              :animationDuration="150"
          >

            <!-- Контент через слот -->
            <!-- Динамический компонент с передачей пропсов -->
            <component
                :is="panel.content"
                v-bind="panel.props"
            />

            <!-- Контент через слот -->
            <!--                  <template v-if="panel === 1">
                                  <div class="custom-content">
                                        <p>Содержимое первой панели</p>
                                        <el-input :id="panel + `-input`" placeholder="Пример поля ввода"/>
                                        <el-label :for="panel+ `-input`">Пример импута</el-label>
                                  </div>
                              </template>
                              <template v-if="panel === 2">
                                  <div class="custom-content">
                                      <div>Пользовательский контент</div>
                                      <el-checkbox type="checkbox" :id="panel+ `-check`"/>
                                      <el-label :for="panel+ `-check`">Пример чекбокса</el-label>
                                  </div>
                              </template>
                              <template v-if="panel === 3">
                                  <div class="custom-content">
                                      <div>Пользовательский контент</div>
                                      <el-checkbox type="checkbox" :id="panel+ `-check`"/>
                                      <el-label :for="panel+ `-check`">Пример чекбокса</el-label>
                                  </div>
                              </template>
                              <template v-if="panel === 4">
                                  <div class="custom-content">
                                      <div>Пользовательский контент</div>
                                      <el-text :for="panel + `-textarea`">Пример textarea</el-text>
                                      <el-input type="textarea" :id="panel + `-textarea`" placeholder="Пример поля ввода textarea"/>
                                  </div>
                              </template>-->
            <!--                  <template v-if="panel === 5">
                                  <div class="custom-content">
                                      <div>Пользовательский контент</div>
                                      <div class="card m-1">
                                          <div class="card card-panel">
                                              <TimerMoment/>
                                          </div>
                                      </div>
                                  </div>
                              </template>
                              <template v-if="panel === 6">
                                  <div class="custom-content">
                                      <div>Пользовательский контент</div>
                                      <div class="card m-1">
                                          <div class="card card-panel">
                                              <TimerLuxon/>
                                          </div>
                                      </div>
                                  </div>
                              </template>-->
          </AccordionPanel>
        </Accordion>
      </RightPanel>
    </div>
  </div>
</template>

<script setup>
import TimerMoment from '@/layout/components/DateTimeDisplay/DateTimeDisplayMoment.vue'
import TimerLuxon from '@/layout/components/DateTimeDisplay/DateTimeDisplayLuxon.vue'

import { AppMain, Navbar, Sidebar, TagsView, RightPanel } from './components'
import { appStore } from '@store/app'
import { ref } from 'vue'
import { useAccordionStore } from '@store/accordionStore'
import Accordion from '@components/Accordion/Accordion.vue'
import AccordionPanel from '@components/Accordion/AccordionPanel.vue'
import SettingsPanel from '@components/Accordion/SettingsPanel.vue'

import CustomComponent from '@components/CustomComponent/CustomComponent.vue'
import AnotherComponent from '@components/AnotherComponent/AnotherComponent.vue'

//const panels = ref([1, 2, 3, 4, 5, 6])

// Динамические панели с контентом
const panels = ref([
  {
    id: 'settings',
    title: 'Настройки профиля',
    content: CustomComponent,
    props: {
      initialValue: 'Данные настроек'
    }
  },
  {
    id: 'stats',
    title: 'Статистика',
    content: AnotherComponent,
    props: {
      chartData: [12, 19, 3, 5, 2]
    }
  },
  {
    id: 'TimerMoment',
    title: 'TimerMoment',
    content: TimerMoment,
  },
  {
    id: 'TimerLuxon',
    title: 'TimerLuxon',
    content: TimerLuxon,
  }
])

const store = useAccordionStore()

const useAppStore = appStore() // appStore

console.log('useAppStore: ', useAppStore)
const opened = computed(() => {
  return useAppStore.sidebar.opened
})

const settings = computed(() => {
  return useAppStore.settings
})
const classObj = computed(() => {
  return {
    closeSidebar: !opened.value,
    hideSidebar: !settings.value.showLeftMenu
  }
})

//import ResizeHook to   listen  page size that   open or close
import ResizeHook from './hook/ResizeHandler'
ResizeHook()
</script>

<style lang="scss" scoped>
.main-container {
  min-height: 100%;
  transition: margin-left 0.28s;
  margin-left: $sideBarWidth;
  position: relative;
}
.sidebar-container {
  transition: width 0.28s;
  width: $sideBarWidth !important;
  background-color: $menuBg;
  height: 100%;
  position: fixed;
  font-size: 0;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
}
.closeSidebar {
  .sidebar-container {
    width: 54px !important;
  }
  .main-container {
    margin-left: 54px !important;
  }
}
.hideSidebar {
  .sidebar-container {
    width: 0 !important;
  }
  .main-container {
    margin-left: 0;
  }
}
</style>
