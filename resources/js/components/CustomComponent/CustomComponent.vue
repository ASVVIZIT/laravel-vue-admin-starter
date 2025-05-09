<script setup>
defineProps({
    initialValue: {
        type: String,
        default: 'Default value 2'
    }
})
</script>

<template>
    <div class="custom-content">
        <h4>Кастомный компонент 2</h4>
        <input
            type="text"
            :value="initialValue"
            class="custom-input"
        />
    </div>
</template>

<style lang="scss">
.custom-content {
    padding: 5px;
    background: #f8f9fa;

    .custom-input {
        width: 100%;
        margin: 1px;
        border: 2px solid #13c56f;
        border-radius: 4px;
    }
}
</style>
