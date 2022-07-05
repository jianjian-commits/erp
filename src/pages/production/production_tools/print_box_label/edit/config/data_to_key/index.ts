import moment from 'moment'
import _ from 'lodash'

interface PrintBoxDataProps {
  customer_lv1_name: string
  customer_lv2_name: string
  print_time: string
  desc: string
}

const toKey = (data: PrintBoxDataProps) => {
  const { customer_lv1_name, customer_lv2_name, print_time, desc } = data
  const _print_time = print_time ? `${print_time}` : undefined
  const common = {
    // 基础
    学校名称: customer_lv1_name,
    班级名称: customer_lv2_name,
    商品描述: desc,

    // 其他
    当前时间: moment(_print_time).format('YYYY-MM-DD HH:mm:ss'),
    当前时间_年月日: moment(_print_time).format('YYYY-MM-DD'),
    当前时间_时间: moment(_print_time).format('HH:mm:ss'),
  }

  return {
    common,
    _origin: data,
  }
}

export default toKey
export type { PrintBoxDataProps }
