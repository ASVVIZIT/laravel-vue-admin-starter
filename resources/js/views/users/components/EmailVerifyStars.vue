<template>
  <span class="verify-stars">
    <el-tooltip :content="stepLabel(1)" placement="top">
      <el-icon class="star" :style="{ color: colorFor(step1Method) }">
        <StarFilled v-if="step1Method" />
        <Star v-else />
      </el-icon>
    </el-tooltip>
    <el-tooltip :content="stepLabel(2)" placement="top">
      <el-icon class="star" :style="{ color: colorFor(step2Method) }">
        <StarFilled v-if="step2Method" />
        <Star v-else />
      </el-icon>
    </el-tooltip>
    <el-tooltip :content="stepLabel(3)" placement="top">
      <el-icon class="star" :style="{ color: colorFor(step3Method) }">
        <StarFilled v-if="step3Method" />
        <Star v-else />
      </el-icon>
    </el-tooltip>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Star, StarFilled } from '@element-plus/icons-vue'

const props = defineProps({
  user: { type: Object, required: true }
})

const { t } = useI18n()

const step1Method = computed(() => {
  if (props.user?.has_pending_email_change) return 'requested'
  if (props.user?.old_email_confirm_method || props.user?.new_email_confirm_method) return 'done'
  return null
})

const step2Method = computed(() => props.user?.old_email_confirm_method || null)
const step3Method = computed(() => props.user?.new_email_confirm_method || null)

const colorFor = (method) => {
  if (method === 'requested') return '#e6a23c'
  if (method === 'done') return '#67c23a'
  if (method === 'email') return '#67c23a'
  if (method === 'admin') return '#409eff'
  return '#c0c4cc'
}

const stepLabel = (step) => {
  if (step === 1) {
    if (step1Method.value === 'requested') return t('users.verify.step1Requested')
    if (step1Method.value === 'done') return t('users.verify.step1Done')
    return t('users.verify.step1NotRequested')
  }
  if (step === 2) {
    if (step2Method.value === 'email') return t('users.verify.oldReal')
    if (step2Method.value === 'admin') return t('users.verify.oldSystem')
    return t('users.verify.step2NotDone')
  }
  if (step3Method.value === 'email') return t('users.verify.newReal')
  if (step3Method.value === 'admin') return t('users.verify.newSystem')
  return t('users.verify.step3NotDone')
}
</script>

<style lang="scss" scoped>
.verify-stars {
  display: inline-flex;
  align-items: center;
  gap: 2px;

  .star {
    font-size: 12px;
    cursor: help;
  }
}
</style>
