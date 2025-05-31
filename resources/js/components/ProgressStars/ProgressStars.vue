<template>
  <span class="progress-stars">
    <template v-if="required > 0">
      <el-tooltip
          :content="'Обязательные: ' + filledRequired + '/' + required"
          placement="top"
      >
        <span class="required-stars">
          <el-icon v-for="i in required" :key="'req'+i"
                   :color="i <= filledRequired ? '#67C23A' : '#F56C6C'">
            <svg viewBox="0 0 1024 1024" width="1em" height="1em">
              <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3-12.3 12.7-12.3 33.4 0 46.1l183.7 179.1-43.4 252.9c-1.2 6.9-0.4 14 2.3 20.3 7.9 19.4 29.4 30.2 48.8 22.4L512 754l227.1 119.4c6.2 3.3 13.1 4.9 20.1 4.9 12.4 0 24.5-4.9 33.3-14.2 17.4-18.4 14.9-46.5-4.5-62.9l-195.2-190.4 43.4-252.9c1.1-6.9 0.3-14-2.3-20.2-7.9-19.4-29.4-30.2-48.8-22.4L512 374.9 340.8 289.7c-6.2-3.3-13.1-4.9-20.1-4.9-12.4 0-24.5 4.9-33.3 14.2-17.4 18.4-14.9 46.5 4.5 62.9l195.2 190.4-43.4 252.9c-1.1 6.9-0.3 14 2.3 20.2 7.9 19.4 29.4 30.2 48.8 22.4L512 754l227.1 119.4c19.4 10.2 40.9-3 48.8-22.4 2.7-6.3 3.5-13.4 2.3-20.3l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"></path>
            </svg>
          </el-icon>
        </span>
      </el-tooltip>
    </template>

    <el-tooltip
        :content="'Заполнено: ' + filled + '/' + total"
        placement="top"
    >
      <span class="progress-indicator">
        {{ filled }}/{{ total }}
      </span>
    </el-tooltip>
  </span>
</template>

<script>
export default {
  props: {
    total: {
      type: Number,
      default: 0,
      validator: value => value >= 0
    },
    filled: {
      type: Number,
      default: 0,
      validator: value => value >= 0
    },
    required: {
      type: Number,
      default: 0,
      validator: value => value >= 0
    },
    filledRequired: {
      type: Number,
      default: 0,
      validator: value => value >= 0
    }
  }
}
</script>

<style scoped>
.progress-stars {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
}

.required-stars {
  display: inline-flex;
  align-items: center;
}

.progress-stars .el-icon {
  font-size: 0.9em;
}

.progress-indicator {
  font-size: 0.7em;
  background: #f0f0f0;
  border-radius: 4px;
  padding: 2px 4px;
  color: #666;
}
</style>
