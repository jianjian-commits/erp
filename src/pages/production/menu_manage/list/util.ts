import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'

function createMealTimesVerification(
  name: string,
  order_create_min_time: string,
  default_receive_time: string,
  order_receive_min_date: string,
) {
  if (!name) {
    Tip.danger(t('餐次名称不为空'))
    return false
  }
  if (!order_receive_min_date) {
    Tip.danger('截止下单天数不为空')
    return false
  }
  if (!order_create_min_time) {
    Tip.danger(t('请选择截止下单时间'))
    return false
  }
  if (!default_receive_time) {
    Tip.danger(t('请选择默认收货时间'))
    return false
  }

  return true
}

export { createMealTimesVerification }
