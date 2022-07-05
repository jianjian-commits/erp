import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/list_store'
import { getUnNillText } from '@/common/util'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

interface WarehouseNameCellProps {
  index: number
  data: PDetail
}

const WarehouseNameCell: FC<WarehouseNameCellProps> = observer(
  ({ data, index }) => {
    const { warehouse_name, warehouse_id } = data
    const { isEdit } = store.list[index]

    const onChagne = (selected: string) => {
      const changeData = {
        warehouse_id: selected,
        shelf_selected: ['0'],
        shelf_id: '0',
        shelf_name: '未分配',
        shelf: undefined,
      }
      store.changeDetailItem(index, changeData)
    }

    if (!isEdit) {
      return getUnNillText(warehouse_name)
    }

    return (
      <>
        <Select_WareHouse_Default
          value={warehouse_id}
          onChange={onChagne}
          placeholder={t('请选择仓库')}
        />
      </>
    )
  },
)

export default WarehouseNameCell
