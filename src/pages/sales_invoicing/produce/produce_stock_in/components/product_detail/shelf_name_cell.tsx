import React, { FC, useEffect, useRef, useMemo } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { KCLevelSelect } from '@gm-pc/keyboard'
import store, { PDetail } from '../../stores/receipt_store'
import { getSelectedShelfName, isInShareV2 } from '../../../../util'
import _ from 'lodash'

import { Flex } from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'
import WarningPopover from '@/common/components/icon/warning_popover'
import { t } from 'gm-i18n'
import globalStore from '@/stores/global'
import { search } from '@/common/util'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: PDetail
}

const ShelfNameCell: FC<Props> = observer((props) => {
  const selectRef = useRef()
  const { index, data } = props
  const { apportionList, shelfList, shelfResponse } = store
  const { shelf_name, sku_id, shelf, shelf_selected, shelf_id } = data

  // 切换仓库选择
  useEffect(() => {
    // 如果shelf_selected被初始化
    if (!shelf_selected.length || shelf_selected.includes('0')) {
      // 清空组件库的数据
      // eslint-disable-next-line no-unused-expressions
      selectRef?.current?._handleWillActiveSelect(['0'])
    }
  }, [shelf_selected, shelf_id])

  const handleSelectStockGoodsShelf = (selected: string[]) => {
    const changeData = {
      shelf_selected: selected,
      shelf_id: selected[selected.length - 1],
      shelf_name: getSelectedShelfName(shelfResponse, selected),
      shelf: _.find(
        shelfResponse,
        (item) => item.shelf_id === selected[selected.length - 1],
      ),
    }

    // changeData.shelfSelected = selected
    // changeData.shelf_id =
    //   selected.length > 0 ? selected[selected.length - 1] : null
    // changeData.shelf_name = getSelectedShelfName(
    //   this.spreadOutShelfList,
    //   selected,
    // )
    store.changeProductDetailsItem(index, changeData)
  }

  const isDelete = shelf ? shelf.delete_time !== '0' : false
  if (globalStore.shelfList.length === 0) return null

  return useMemo(
    () =>
      isInShareV2(apportionList, sku_id) ? (
        <div>{shelf_name || '-'}</div>
      ) : (
        <Flex row alignCenter>
          <KCLevelSelect
            ref={selectRef}
            onSelect={handleSelectStockGoodsShelf}
            selected={
              shelf_selected.length === 0
                ? search(globalStore.shelfList, shelf_id ?? '0').reverse()
                : shelf_selected.slice()
            }
            data={toJS(globalStore.shelfListTree)}
            // data={toJS(shelfList)}
            right
            style={{ width: TABLE_X.WIDTH_SELECT }}
          />
          {isDelete && (
            <>
              <div className='gm-gap-10' />
              <WarningPopover
                popup={
                  <div className='gm-padding-tb-10 gm-padding-lr-15'>
                    {t('货位已删除，请重新选择')}
                  </div>
                }
              />
            </>
          )}
        </Flex>
      ),
    [globalStore.shelfList.length, shelf_id],
  )
})

export default ShelfNameCell
