import { t } from 'gm-i18n'
import { Filters_Bool } from 'gm_api/src/common'
import { ListTaskRequest_ViewType, Task_Type } from 'gm_api/src/production'

// 列表文本搜索
export const listSearchType = [
  {
    value: 1,
    text: t('按生产成品'),
    desc: t('输入生产成品名称搜索'),
    key: 'sku_name',
  },
  {
    value: 2,
    text: t('按需求编号'),
    desc: t('输入需求编号搜索'),
    key: 'serial_no',
  },
]

export const Task_Produce_Type_Enum = [
  {
    value: Task_Type.TYPE_UNSPECIFIED,
    text: t('全部'),
    label: t('全部BOM类型'),
  },
  {
    value: Task_Type.TYPE_PRODUCE_CLEANFOOD,
    text: t('单品BOM'),
    label: t('单品BOM'),
  },
  { value: Task_Type.TYPE_PRODUCE, text: t('组合BOM'), label: t('组合BOM') },
]

export const OmitViewType = [
  ListTaskRequest_ViewType.VIEW_TYPE_CUSTOMER,
  ListTaskRequest_ViewType.VIEW_TYPE_ROUTE,
]

export const ListTaskViewName: Partial<
  Record<ListTaskRequest_ViewType, string>
> = {
  [ListTaskRequest_ViewType.VIEW_TYPE_CUSTOMER]: t('无关联客户'),
  [ListTaskRequest_ViewType.VIEW_TYPE_ROUTE]: t('无关联线路'),
}

export const ListTaskViewTitle: Partial<
  Record<ListTaskRequest_ViewType, string>
> = {
  [ListTaskRequest_ViewType.VIEW_TYPE_CUSTOMER]: t('关联客户'),
  [ListTaskRequest_ViewType.VIEW_TYPE_ROUTE]: t('关联线路'),
}

export const TaskMaterialType = [
  {
    value: Filters_Bool.ALL,
    text: t('全部物料类型'),
    label: t('全部物料类型'),
  },
  {
    value: Filters_Bool.TRUE,
    text: t('成品'),
    label: t('成品'),
  },
  {
    value: Filters_Bool.FALSE,
    text: t('半成品'),
    label: t('半成品'),
  },
]
