<template>
    <div class="app-container">
        <aside>
            Страница с руководством полезна для некоторых пользователей, которые впервые вошли в проект. Вы можете кратко ознакомить
            их с возможностями проекта. Демонстрация основана на
            <a href="https://github.com/kamranahmedse/driver.js" target="_blank">driver.js.</a>
        </aside>
        <el-button icon="el-icon-question" type="primary" @click.prevent.stop="showTips()">
            Показать руководство (Show Guide)
        </el-button>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { driver } from 'driver.js'
import steps from './steps';

const configDriver = {
    animate: true,                    // Whether to animate or not
    opacity: 0.75,                    // Background opacity (0 means only popovers and without overlay)
    padding: 10,                      // Distance of element from around the edges
    allowClose: true,                 // Whether the click on overlay should close or not
    overlayClickNext: false,          // Whether the click on overlay should move next
    doneBtnText: 'Done',              // Text on the final button
    closeBtnText: 'Close',            // Text on the close button for this step
    stageBackground: '#ffffff',       // Background color for the staged behind highlighted element
    nextBtnText: 'Next',              // Next button text for this step
    prevBtnText: 'Previous',          // Previous button text for this step
    showButtons: false,               // Do not show control buttons in footer
    scrollIntoViewOptions: {},        // We use `scrollIntoView()` when possible, pass here the options for it if you want any
}

const driverObj = driver({
    showProgress: true,
    allowClose: true,
    steps: steps,
})

const showTips = () => {
    driverObj.drive()
}

/*onMounted(() => {
    driverObj.drive()
})*/

</script>
