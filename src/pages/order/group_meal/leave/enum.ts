import { t } from 'gm-i18n'
import _ from 'lodash'
import { ObjectOfKey } from './interface'

import { Customer_Type } from 'gm_api/src/enterprise'

// 用户类型
export const UserTypeMap: ObjectOfKey<string> = {
  [Customer_Type.TYPE_UNSPECIFIED]: t('全部用户类型'),
  [Customer_Type.TYPE_VIRTUAL_STUDENT]: t('学生'),
  [Customer_Type.TYPE_VIRTUAL_SCHOOL_STAFF]: t('职工'),
}

function parseSelectData(m: { [key: number]: string }) {
  return _.map(m, (text, value) => {
    return {
      value: +value,
      text: text,
    }
  }).filter((v) => v.text)
}

export const userType = parseSelectData(UserTypeMap)
