import { t } from 'gm-i18n'
import { Quotation_Status } from 'gm_api/src/merchandise'
import { Enum, SelectStatusType } from './interface'

export const SELECT_STATUS: SelectStatusType<number> = {
  TO_ID: 0,
  TO_NAME: 1,
}

export const menu_status = [
  { label: t('全部状态'), value: 0 },
  { label: t('启用'), value: Quotation_Status.STATUS_VALID },
  { label: t('禁用'), value: Quotation_Status.STATUS_WAIT_VALID },
]

export const q_status: Enum[] = [
  {
    text: t('按菜谱名称'),
    value: SELECT_STATUS.TO_NAME,
    key: 'inner_name',
    placeholder: t('输入菜谱名称'),
  },
  {
    text: t('按菜谱id'),
    value: SELECT_STATUS.TO_ID,
    key: 'quotation_id',
    placeholder: t('输入菜谱ID'),
  },
]

export const Week: Enum[] = [
  { value: 1, text: t('周一') },
  { value: 2, text: t('周二') },
  { value: 3, text: t('周三') },
  { value: 4, text: t('周四') },
  { value: 5, text: t('周五') },
  { value: 6, text: t('周六') },
  { value: 7, text: t('周日') },
]

export const deleteTipsList: Enum[] = [
  {
    value: '1',
    text: t('仅删除菜谱，不会删除商品库已有商品'),
  },
  {
    value: '2',
    text: t(
      '删除后将解除绑定此菜谱的用户，用户将无法进行学生餐/职工餐订单的下单操作',
    ),
  },
  {
    value: '3',
    text: t('删除后菜谱相关数据无法恢复，请谨慎操作'),
  },
]

export const importType: Enum[] = [
  {
    value: '1',
    text: t('批量导入新建'),
  },
  {
    value: '2',
    text: t('批量导入修改'),
  },
]
