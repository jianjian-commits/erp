import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { MoreSelect, MoreSelectGroupDataItem } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { Role_Type, ListGroupUser } from 'gm_api/src/enterprise'

import store from '../store'

import type { MoreSelectDataItem } from '@gm-pc/react'
import { purchaserGroupBy } from '../../../../util'

const Purchaser = () => {
  function handleSelect(selected: MoreSelectDataItem<string>) {
    store.infoUpdate('purchase', selected)
  }
  const { supplier, purchase } = store.info
  const [purchasers, setPurchasers] = useState<MoreSelectDataItem<string>[]>([])

  useEffect(() => {
    ListGroupUser({
      role_types: [Role_Type.BUILT_IN_PURCHASER as number],
      paging: { limit: 999 },
    }).then((json) => {
      const purchasers = (json.response?.group_users || [])
        .filter((v) => v.is_valid)
        .map((v) => {
          return {
            ...v,
            value: v.group_user_id,
            text: v.name,
          }
        })
      setPurchasers(purchasers)

      return null
    })
  }, [])

  const list: MoreSelectGroupDataItem[] = purchaserGroupBy(
    purchasers,
    supplier!,
  )

  return (
    <MoreSelect
      isGroupList
      data={list}
      // disabled={!supplier}
      selected={purchase}
      onSelect={handleSelect}
      renderListFilterType='pinyin'
      placeholder={t('请选择采购员')}
    />
  )
}

export default observer(Purchaser)
