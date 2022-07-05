/*
 * @Description: 格式化日期util
 */

import moment from 'moment'

/**
 * @description: 格式化日期为YYYY-MM-DD HH:mm:ss
 */
export const formatDateTime = (dateTime: moment.MomentInput): string => {
  if (!dateTime) return '-'
  return moment(dateTime).format('YYYY-MM-DD HH:mm:ss')
}
/**
 * @description: 格式化日期为YYYY-MM-DD
 */
export const formatDate = (dateTime: moment.MomentInput): string => {
  if (!dateTime) return '-'
  return moment(dateTime).format('YYYY-MM-DD')
}
