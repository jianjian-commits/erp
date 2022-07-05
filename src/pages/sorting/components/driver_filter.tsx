import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { MoreSelect, MoreSelectDataItem } from '@gm-pc/react'
import { Role_Type, ListGroupUser } from 'gm_api/src/enterprise'

const DriverFilter = (props: {
  value: MoreSelectDataItem<string>[]
  onChange: (v: MoreSelectDataItem<string>[]) => void
}) => {
  const [driverList, setDriverList] = useState<MoreSelectDataItem<string>[]>([])

  useEffect(() => {
    const req = {
      paging: { limit: 999 },
      role_types: [Role_Type.BUILT_IN_DRIVER],
      need_distribution_contractor: true,
    }
    ListGroupUser(req).then((json) => {
      setDriverList(
        _.map(json.response.group_users, (item) => {
          return {
            text: item.name,
            value: item.group_user_id,
          }
        }),
      )
      return null
    })
  }, [])

  return (
    <MoreSelect
      multiple
      data={driverList}
      placeholder={t('全部司机')}
      selected={props.value}
      renderListFilterType='pinyin'
      onSelect={props.onChange}
    />
  )
}

export default DriverFilter
