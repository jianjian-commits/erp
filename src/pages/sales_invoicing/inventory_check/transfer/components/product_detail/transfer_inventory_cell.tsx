import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { KCLevelSelect } from '@gm-pc/keyboard'
import store, { PDetail } from '../../stores/detail_store'
import _ from 'lodash'
import { Flex } from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: PDetail
}

const TransferInventoryCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { transferShelfList, allTansferShelfResponse } = store
  const { transfer_shelf_selected, batch_selected_single } = data

  const handleSelectStockGoodsShelf = (selected: string[]) => {
    const changeData = {
      transfer_shelf_selected: selected,
      transfer_shelf_obj: _.find(
        allTansferShelfResponse,
        (item) => item.shelf_id === selected[selected.length - 1],
      ),
    }

    store.changeProductDetailsItem(index, changeData)
  }

  return !batch_selected_single?.batch_id ? (
    <div>-</div>
  ) : (
    <Flex row alignCenter>
      <KCLevelSelect
        onSelect={handleSelectStockGoodsShelf}
        selected={transfer_shelf_selected.slice()}
        data={toJS(transferShelfList)}
        right
        style={{ width: TABLE_X.WIDTH_SELECT }}
      />
    </Flex>
  )
})

export default TransferInventoryCell
