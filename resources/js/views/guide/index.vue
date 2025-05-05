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
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import steps from './steps';

const configDriver = {
    animate: true,                    // Whether to animate or not
    opacity: 0.75,                    // Background opacity (0 means only popovers and without overlay)
    padding: 10,                      // Distance of element from around the edges
    allowClose: true,                 // Whether the click on overlay should close or not
    overlayClickNext: false,          // Whether the click on overlay should move next
    //stageBackground: '#ffffff',     // Background color for the staged behind highlighted element
    closeBtnText: 'Close',            // Text on the close button for this step
    nextBtnText: '—›',
    prevBtnText: '‹—',
    doneBtnText: '✕',                 // Previous button text for this step
    showButtons: false,               // Do not show control buttons in footer
    scrollIntoViewOptions: {},        // We use `scrollIntoView()` when possible, pass here the options for it if you want any
};

const driverObj = driver({
    onNextClick:(element, step, opts) => {
        console.log('Next Button Clicked: ', element.id);
        // Implement your own functionality here
        driverObj.moveNext();
    },
    onPrevClick:(element, step, opts) => {
        console.log('Previous Button Clicked: ', element.id);
        // Implement your own functionality here
        driverObj.movePrevious();
    },
    onCloseClick:(element, step, opts) => {
        console.log('Close Button Clicked: ', element.id);
        // Implement your own functionality here
        driverObj.destroy();
    },
    // Get full control over the popover rendering.
    // Here we are adding a custom button that takes
    // user to the first step.
    onPopoverRender: (popover, { config, state }) => {
        const firstButton = document.createElement("button");
        firstButton.innerText = "В начало";
        popover.footerButtons.appendChild(firstButton);

        firstButton.addEventListener("click", () => {
            driverObj.drive(0);
        });
    },
    popoverClass: 'driverjs-theme',
    opacity: 0.75,                    // Background opacity (0 means only popovers and without overlay)
    animate: true,                    // Whether to animate or not
    closeBtnText: 'Закрыть',          // Text on the close button for this step
    nextBtnText: 'Вперед —›',
    prevBtnText: '‹— Назад',          // Previous button text for this step
    doneBtnText: 'Готово',
    showProgress: true,
    allowClose: true,
    steps: steps,
})

const showTips = () => {
    driverObj.drive()
}
</script>
