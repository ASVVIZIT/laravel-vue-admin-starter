<template>
  <el-card v-if="user.id">
    <div class="user-profile">
      <div class="user-avatar box-center">
        <pan-thumb :image="user.avatar" :height="'80px'" :width="'80px'" :hoverable="false"/>
      </div>
      <div class="box-center">
        <div class="user-name text-center">
          {{ user.name }}
        </div>
        <div class="user-role text-center text-muted">
          {{ getRole() }}
        </div>
      </div>
      <div class="box-social">
        <el-descriptions
            :column="1"
            size="default"
            border
        >
          <el-descriptions-item :label="t('user.name')">{{ user.name }}</el-descriptions-item>
          <el-descriptions-item :label="t('user.email')">{{ user.email }}</el-descriptions-item>
          <el-descriptions-item :label="t('user.sex')">{{ user.sex ? t('user.female') : t('user.male') }}</el-descriptions-item>
          <el-descriptions-item :label="t('user.age')">{{ (user.age === null || user.age === '0')  ? 'нет данных' : user.age }}</el-descriptions-item>
          <el-descriptions-item :label="t('user.description')">{{ (user.description === null || user.description === '')  ? '-' : user.description }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import PanThumb from '@/components/PanThumb/index.vue'
import {uppercaseFirst, toThousandFilter} from "@/utils/index"
import {useI18n} from "vue-i18n";

const {t} = useI18n({useScope: 'global'})

/*const date1 = moment(moment(), 'YYYY-MM-DD HH:mm:ss');
console.log('date1 ', date1)
const diffInYears = date1.diff(props.user.birthday, 'years');
console.log(`Difference in years: ${diffInYears}`);*/
const props = defineProps({
  user: {
    type: Object,
    default: () => {
      return {
        name: '',
        email: '',
        avatar: '',
        age: '',
        sex: '',
        description: '',
        roles: [],
      };
    },
  },
})

const getRole = () => {
  const roles = Object.values(props.user.roles.map(value => uppercaseFirst(value)))
  return roles.join('|')
}
</script>

<style lang="scss" scoped>
.user-profile {
  .user-name {
    font-weight: bold;
  }

  .box-center {
    padding-top: 10px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 400;
    font-size: 14px;
  }

  .box-social {
    padding-top: 30px;

    .el-table {
      border-top: 1px solid #dfe6ec;
    }
  }

  .user-follow {
    padding-top: 20px;
  }
}
</style>
