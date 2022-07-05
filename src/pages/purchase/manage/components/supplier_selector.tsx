import React, { FC, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { MoreSelect, MoreSelectGroupDataItem } from '@gm-pc/react'
import { useAsync } from '@gm-common/hooks'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { ListSupplier } from 'gm_api/src/enterprise'
import store from '../bills/bill/store'
import { observer } from 'mobx-react'

interface SupplierSelectorProps {
  multiple?: boolean
  data?: MoreSelectDataItem<string>[] | MoreSelectGroupDataItem<string>[]
  selected:
    | MoreSelectDataItem<string>[]
    | MoreSelectDataItem<string>
    | undefined
  onSelect(
    selected?: MoreSelectDataItem<string>[] | MoreSelectDataItem<string>,
  ): void
  isGroupList?: boolean
  groupBy?: (...args: any) => MoreSelectGroupDataItem<string>[]
}
const SupplierSelector: FC<SupplierSelectorProps> = ({
  multiple = true,
  data,
  onSelect,
  selected,
  isGroupList = false,
  groupBy,
}) => {
  const { purchase } = store.info
  const [suppliers, setSuppliers] = useState<
    MoreSelectDataItem<string>[] | MoreSelectGroupDataItem<string>[]
  >([])
  function handleRequest() {
    return ListSupplier({ paging: { limit: 999 } }).then((json) => {
      const supplier_list = json.response.suppliers!.map((v) => ({
        ...v,
        value: v.supplier_id!,
        text: v.name!,
      }))
      supplier_list.unshift({ value: '0', text: '无' } as any)
      setSuppliers(supplier_list)
      return null
    })
  }
  const { run } = useAsync(() => handleRequest(), {
    cacheKey: 'suppliers',
  })

  useEffect(() => {
    if (!data) run()
  }, [])

  let list = data || suppliers

  if (isGroupList && groupBy) {
    // @ts-ignore
    list = groupBy(data || suppliers, purchase)
  }

  return (
    <MoreSelect
      isGroupList={isGroupList}
      multiple={multiple}
      data={list}
      selected={selected}
      placeholder={t('选择供应商')}
      renderListFilterType='pinyin'
      onSelect={onSelect}
    />
  )
}

export default observer(SupplierSelector)
