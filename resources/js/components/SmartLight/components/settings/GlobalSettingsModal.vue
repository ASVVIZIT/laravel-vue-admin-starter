<template>
  <el-dialog v-model="visible" title="Глобальные настройки" width="650px" :close-on-click-modal="false">
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Загрузка настроек...</span>
    </div>

    <el-form v-else :model="settings" label-width="180px" size="small">
      <el-form-item label="Крит. напряжение (В)">
        <el-input-number v-model="settings.critical_voltage" :min="2.5" :max="4.3" :step="0.1" :precision="2" />
      </el-form-item>
      <el-form-item label="Интервал сна (сек)">
        <el-input-number v-model="settings.sleep_interval" :min="60" :max="86400" :step="60" />
      </el-form-item>
      <el-form-item label="Аварийный интервал (сек)">
        <el-input-number v-model="settings.emergency_sleep_interval" :min="300" :max="86400" :step="300" />
      </el-form-item>
      <el-form-item label="Тип батареи">
        <el-select v-model="settings.default_battery_type" placeholder="Выберите тип" style="width: 100%">
          <el-option v-for="type in store.batteryTypesForDropdown" :key="type.id" :label="type.label" :value="type.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="Тип лампы">
        <el-select v-model="settings.default_bulb_type" placeholder="Выберите тип" style="width: 100%">
          <el-option v-for="type in store.bulbTypesForDropdown" :key="type.id" :label="type.label" :value="type.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="Источник питания">
        <el-select v-model="settings.default_power_supply" placeholder="Выберите тип" style="width: 100%">
          <el-option v-for="type in store.powerSuppliesForDropdown" :key="type.id" :label="type.label" :value="type.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="Режим питания">
        <el-select v-model="settings.power_management_mode" placeholder="Выберите режим" style="width: 100%">
          <el-option label="Экономный" value="conservative" />
          <el-option label="Сбалансированный" value="balanced" />
          <el-option label="Производительный" value="aggressive" />
        </el-select>
      </el-form-item>
      <el-form-item label="Время работы контроллера (сек)">
        <el-input-number v-model="settings.controller_runtime" :min="3600" :max="604800" :step="3600" />
      </el-form-item>
      <el-form-item label="Мин. напряжение контроллера (В)">
        <el-input-number v-model="settings.min_controller_voltage
