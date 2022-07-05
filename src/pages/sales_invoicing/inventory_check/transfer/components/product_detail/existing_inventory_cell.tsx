import React, { FC, useCallback } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { KCLevelSelect } from '@gm-pc/keyboard'
import store, { PDetail } from '../../stores/detail_store'
import { getSelectedShelfName } from '../../../../util'
import _ from 'lodash'

import { Flex } from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'
import { search } from '@/common/util'
import { useGMLocation } from '@gm-common/router'
import SVGPen from '@/svg/pen.svg'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: PDetail
}

const ExistingInventoryCell: FC<Props> = observer((props) => {
  const location = useGMLocation<{ sheet_id: string }>()
  const { sheet_id } = location.query
  const { index, data } = props
  const { allTansferShelfResponse, transferShelfList } = store
  const {
    sku_id,
    // unit_id,
    shelf_id,
    // allTansferShelfResponse,
    // transferShelfList = [],
    exist_shelf_selected = [],
    exist_shelf_name,
    exist_inventory_can_search,
  } = data

  const handleSelectStockGoodsShelf = (selected: string[]) => {
    const changeData = {
      shelf_selected: selected,
      exist_shelf_selected: selected,
      shelf_id: selected[selected.length - 1],
      shelf_name: getSelectedShelfName(allTansferShelfResponse, selected),
      shelf: _.find(
        allTansferShelfResponse,
        (item) => item.shelf_id === selected[selected.length - 1],
      ),
    }

    store.changeProductDetailsItem(index, changeData)
  }

  const searchShlef = useCallback(async () => {
    if (!exist_inventory_can_search) {
      store.changeProductDetailsItem(index, {
        exist_inventory_can_search: true,
      })
    }
  }, [exist_inventory_can_search, index])

  return !sku_id ? (
    <div>-</div>
  ) : sheet_id && !exist_inventory_can_search ? (
    <Flex alignCenter>
      {exist_shelf_name}
      <SVGPen
        style={{ fontSize: '18px', cursor: 'pointer' }}
        onClick={searchShlef}
      />
    </Flex>
  ) : (
    <Flex row alignCenter>
      <KCLevelSelect
        onSelect={handleSelectStockGoodsShelf}
        selected={
          exist_shelf_selected.length === 0
            ? search(transferShelfList, shelf_id ?? '0').reverse()
            : exist_shelf_selected.slice()
        }
        data={toJS(transferShelfList)}
        // data={toJS(globalStore.shelfListTree)}
        right
        style={{
          width: TABLE_X.WIDTH_SELECT,
        }}
      />
    </Flex>
  )
})

export default ExistingInventoryCell
