<template>
  <section>
    <el-table
        ref="tableRef"
        v-loading="loading"
        :tooltip-effect="tooltipEffect"
        :row-key="getRowKey"
        :stripe="stripe"
        :data="tableData"
        :height="tableHeight"
        :border="border"
        :row-class-name="tableRowClassName"
        :highlight-current-row="highlightCurrentRow"
        @row-click="handleRowClick"
        @sort-change="handleSortChange"
        @selection-change="handleSelectionChange"
        empty-text="Нет данных"
    >
      <template v-for="(item, index) in tableColumn" :key="index">
        <el-table-column
            v-if="item.filters"
            :key="index+1"
            :width="item.width"
            :align="item.align"
            :label="item.label"
            :prop="item.prop"
            :sortable="item.sortable"
            :filters="item.filters ? item.filters : []"
            :filter-method="filterHandler"
            :show-overflow-tooltip="!item.operate"
        >
          <template #default="scope">
            <slot v-if="item.slot" :name="item.prop" v-bind="scope"/>
            <span v-else>{{ show(scope.row, item.prop, scope) }}</span>
          </template>
        </el-table-column>
        <el-table-column
            v-else-if="item.type === 'selection'"
            :type="item.type"
            :width="item.width"
            :key="index+1"
        >
        </el-table-column>
        <el-table-column
            v-else
            :key="index+1"
            :width="item.width"
            :align="item.align ? item.align : 'center'"
            :label="item.label"
            :prop="item.prop"
            :sortable="item.sortable"
            show-overflow-tooltip
        >
          <template #default="scope">
            <slot v-if="item.slot" :name="item.prop" v-bind="scope"/>
            <span v-else>{{ show(scope.row, item.prop) }}</span>
          </template>
        </el-table-column>
      </template>
      <el-table-column
          v-if="tableOption.label"
          :fixed="tableOption.fixed"
          :align="tableOption.align ? tableOption.align : 'center'"
          :width="tableOption.width"
          :label="tableOption.label"
      >
        <template #default="scope">
          <template v-if="tableOption.item_actions">
            <slot v-if="!tableOption.slot" name="table_options" v-bind="scope"/>
            <template v-else-if="tableOption.item_actions.length <= 1">
              <el-button-group :size="size">
                <el-button
                    v-for="(action, index) in tableOption.item_actions"
                    :key="index"
                    :type="action.type ? action.type : 'primary'"
                    :size="action.size ? action.size : ''"
                    :round="action.round ? action.round : ''"
                    :disabled="!action.disabled ? action.disabled : ''"
                    @click="callAction(action.name, scope.row)"
                >
                  <svg-item :el-svg-name="action.icon" :title="action.label"/>
                </el-button>
              </el-button-group>
            </template>
            <template v-else>
              <el-button-group :size="size">
                <el-button
                    v-for="(action, index) in tableOption.item_actions"
                    :key="index"
                    :type="action.type ? action.type : 'primary'"
                    :size="action.size ? action.size : ''"
                    :round="action.round ? action.round : ''"
                    :disabled="!action.disabled ? action.disabled : ''"
                    @click="callAction(action.name, scope.row)"
                >
                  <svg-item :el-svg-name="action.icon" :title="action.label"/>
                </el-button>
              <el-dropdown>
                <el-button class="fenix-dropdown-link" :icon="ArrowDown" :round="false" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                        v-for="(action, index) in tableOption.item_actions_down"
                        :key="index"
                        :command="action.name"
                        @click="callAction(action.name, scope.row)"
                    >
                      <svg-item :el-svg-name="action.icon" :title="action.label"/>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              </el-button-group>
            </template>
          </template>
        </template>
      </el-table-column>
      <template #empty>
        <div class="empty-data">
          <el-empty description="Нет данных" />
        </div>
      </template>
    </el-table>
    <template v-if="paginate && pagination.meta.total > 0">
      <section class="pagination-container">
        <el-pagination
            :size="size"
            background
            :page-sizes="pageSizes"
            :layout="layout"
            :current-page="pagination.meta.current_page"
            :page-size="pagination.meta.per_page"
            :total="pagination.meta.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </section>
    </template>
  </section>
</template>

<script>
import { useI18n } from "vue-i18n";
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import SvgItem from "./Item/SvgItem.vue";
import { reactive, ref, toRefs, nextTick } from "vue";

export default {
  components: { SvgItem },
  props: {
    loading: Boolean,
    size: { type: String, default: 'small' },
    stripe: { type: Boolean, default: true },
    border: { type: Boolean, default: true },
    tooltipEffect: { type: String, default: 'dark' },
    tableData: { type: Array, required: true },
    tableColumn: { type: Array, required: true },
    tableOption: { type: Object, default: () => ({}) },
    paginate: { type: Boolean, default: true },
    pagination: { type: Object, default: () => ({ meta: {} }) },
    itemActions: {
      type: Array,
      default() {
        return [
          {
            name: 'edit-item',
            icon: 'fas fa-pencil-alt',
            class: 'btn btn-info'
          },
          {
            name: 'delete-item',
            icon: 'fas fa-trash-alt',
            class: 'btn btn-danger'
          }
        ];
      }
    },
    tableHeight: { type: String, default: 'calc(100vh - 400px)' },
    pageSizes: { type: Array, default: () => [5, 10, 30, 50, 100, 200] },
    layout: { type: String, default: 'total, sizes, prev, pager, next, jumper' },
    highlightCurrentRow: { type: Boolean, default: false },
    highlightHoverRow: { type: Boolean, default: false }
  },
  setup(props, ctx) {
    const { t } = useI18n();
    const resData = reactive({
      tableRef: ref(null),
      currentRow: null
    });

    const show = (row, key) => {
      return key.split('.').reduce((obj, k) => obj?.[k], row) || '';
    };

    const handleRowClick = (row) => {
      resData.currentRow = row;
    };

    const tableRowClassName = ({ row, rowIndex }) => {
      let classes = [];

      if (props.stripe && rowIndex % 2 === 1) {
        classes.push('stripe-row');
      }

      if (props.highlightCurrentRow && resData.currentRow === row) {
        classes.push('current-row');
      }

      if (props.highlightHoverRow) {
        classes.push('hover-row');
      }

      return classes.join(' ');
    };

    const handleSizeChange = (perPage) => {
      ctx.emit('size-change', perPage);
    };

    const handleCurrentChange = (current) => {
      ctx.emit('current-change', current);
    };

    const callAction = (action, data) => {
      ctx.emit('table-action', action, data);
    };

    const closeTag = (obj) => {
      ctx.emit('close-tag', obj);
    };

    const handleToggleRowSelection = (row, isSelected) => {
      nextTick(() => {
        resData.tableRef.toggleRowSelection(row, isSelected);
      });
    };

    const getRowKey = (row) => {
      return row.id;
    };

    return {
      ...toRefs(resData),
      tableRowClassName,
      ArrowDown,
      ArrowUp,
      show,
      handleSortChange: (sort) => ctx.emit('handle-sort-change', sort),
      handleSelectionChange: (val) => ctx.emit('handle-selection-change', val),
      filterHandler: (value, row, column) => row[column.property] === value,
      toggleExpand: (row) => resData.tableRef.toggleRowExpansion(row),
      handleSizeChange,
      handleCurrentChange,
      callAction,
      closeTag,
      handleToggleRowSelection,
      handleRowClick,
      getRowKey,
      t
    };
  }
};
</script>

<style scoped>
.pagination-container {
  flex-shrink: 0;
  background: #fff;
  padding: 12px 8px;
}

.pagination-container.hidden {
  display: none;
}

.fenix-table .stripe-row {
  --el-table-tr-bg-color: var(--el-fill-color-light) !important;
}

.fenix-table .current-row {
  --el-table-tr-bg-color: var(--el-color-primary-light-7) !important;
}

.fenix-table .hover-row:hover > td {
  background-color: var(--el-color-info-light-7) !important;
}
</style>
