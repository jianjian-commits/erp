import React, { FC, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { MoreSelect, MoreSelectGroupDataItem } from '@gm-pc/react'
import { useAsync } from '@gm-common/hooks'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { ListGroupUser, Role_Type } from 'gm_api/src/enterprise'

interface PurchaseSelectorProps {
  data?: MoreSelectDataItem<string>[]
  selected: MoreSelectDataItem<string> | undefined
  onSelect(selected?: MoreSelectDataItem<string>): void
  groupBy?: (
    list: MoreSelectDataItem<string>[],
  ) => MoreSelectGroupDataItem<string>[]
}
const PurchaseSelector: FC<PurchaseSelectorProps> = ({
  data,
  onSelect,
  selected,
  groupBy,
}) => {
  function handleRequest() {
    return ListGroupUser({
      role_types: [Role_Type.BUILT_IN_PURCHASER],
      paging: { limit: 999 },
    }).then((json) => {
      const list = json.response.group_users! || []
      setPurchasers(
        list.map((v) => ({
          ...v,
          value: v.group_user_id!,
          text: v.name!,
        })),
      )
      return null
    })
  }

  function transformGroupData(list: MoreSelectDataItem<string>[]) {
    return groupBy ? groupBy(list) : list
  }
  const [purchasers, setPurchasers] = useState<MoreSelectDataItem<string>[]>([])
  const { run } = useAsync(() => handleRequest())

  useEffect(() => {
    if (!data) run()
  }, [])

  return (
    <MoreSelect
      isGroupList={!!groupBy}
      data={transformGroupData(data || purchasers)}
      selected={selected}
      placeholder={t('选择采购员')}
      renderListFilterType='pinyin'
      onSelect={onSelect}
    />
  )
}

export default PurchaseSelector
