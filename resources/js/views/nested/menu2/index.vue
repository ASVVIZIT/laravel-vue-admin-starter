<template>
  <div class="app-container">
    <div style="padding:30px;">
      <el-alert :closable="false" title="menu 2">
        <router-view />
      </el-alert>
    </div>
  </div>
</template>
