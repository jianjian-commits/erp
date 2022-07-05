import { OPERATE_TYPE_NAME, OPERATE_TYPE } from '../enum'
import { t } from 'gm-i18n'
import _ from 'lodash'
/**
 * logplacehold
 */
export const diffPlaceholderText = (value: number): string => {
  const ifPlan = _.includes([OPERATE_TYPE.productIn], value)
  const ifMateral = _.includes(
    [OPERATE_TYPE.materialIn, OPERATE_TYPE.materialOut],
    value,
  )
  const productPlanId = ifPlan
    ? t('、生产需求编号')
    : ifMateral
    ? t('、领料单号')
    : ''

  let text
  switch (value) {
    case OPERATE_TYPE.refundIn:
      text = t('售后单号')
      break
    case OPERATE_TYPE.increase:
    case OPERATE_TYPE.loss:
      text = t('盘点单号')
      break
    default:
      text = OPERATE_TYPE_NAME[value]
      break
  }
  return `${t('输入商品名称、商品编码')}${productPlanId}${t('或')}${text}${t(
    '单号搜索',
  )}`
}

export const getShelfName = (shelfs: Record<string, any>, shelf_id: string) => {
  const nameArr = []
  let isEnd = true
  let currentId: string = shelf_id
  while (isEnd) {
    const currentShelf = shelfs[currentId]
    if (currentShelf) {
      nameArr.push(currentShelf.name)
      currentId = currentShelf.parent_id
      if (currentShelf.parent_id === '0') {
        isEnd = false
      }
    } else {
      isEnd = false
    }
  }
  return nameArr.reverse().join('/')
}
