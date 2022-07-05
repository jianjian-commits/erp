import { TreeSelect } from 'antd'
import { t } from 'gm-i18n'
import { Filters_Bool, SetFlag_Bool } from 'gm_api/src/common'
import { TaskMergeMode } from 'gm_api/src/production'
import React from 'react'
import { ProcessedData } from './interface'

const { SHOW_CHILD } = TreeSelect

export const TipContent = (
  <>
    <div>
      {t(
        '开启后，可正对所选分类设置特定交期，适用于冻品、干调等一周一采的场景。',
      )}
    </div>
    <div>{t('关闭后，则所有商品使用同一交期。')}</div>
  </>
)

export interface Enum {
  value: string | number
  text: string
}

export const Tasks: Enum[] = [
  {
    value: 'productionByCustomer',
    text: t('生产计划:'),
  },
  {
    value: 'packByCustomer',
    text: t('包装计划:'),
  },
]

export const initProcessedData: ProcessedData = {
  isSetClassify: false, // 是否设置分类交期
  sortGroupList: [],

  production_merge_mode: TaskMergeMode.MERGE_MODE_NOT, // 生产计划模式设置
  pack_merge_mode: TaskMergeMode.MERGE_MODE_NOT, // 包装计划模式设置

  purchase_type: 1, // 采购计划交期设置
  production_cleanfood_type: 1, // 生产单品BOM计划交期设置
  production_type: 1, // 生产组合BOM计划交期设置
  pack_type: 1, // 包装计划交期设置

  pack_time: undefined, // 包装计划时间
  purchase_time: undefined, // 采购计划时间
  production_time: undefined, // 生产单品BOM交期时间
  production_cleanfood_time: undefined, // 生产组合BOM交期时间

  purchase_batch: '', // 采购计划波次
  production_cleanfood_batch: '', // 生产计划单品BOM波次
  production_batch: '', // 生产计划组合BOM波次
  pack_batch: '', // 包装计划波次
  need_purchase: SetFlag_Bool.TRUE,
  to_production_order: Filters_Bool.TRUE,
}

export const initNotProcessedData = {
  purchase_type: 1, // 计划交期设置
  purchase_batch: '', // 采购计划波次
  purchase_time: undefined, //  采购计划时间
  isSetClassify: false, // 是否设置分类交期
  sortGroupList: [],
}

export const treeDataProps = {
  treeCheckable: true,
  showCheckedStrategy: SHOW_CHILD,
  placeholder: t('请选择'),
  style: {
    maxWidth: '510px',
  },
  maxTagCount: 15,
  maxTagPlaceholder: () => '...',
}
