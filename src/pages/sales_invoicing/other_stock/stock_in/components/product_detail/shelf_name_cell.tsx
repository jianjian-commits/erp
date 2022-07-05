import React, { FC, useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
// import { KCLevelSelect } from '@gm-pc/keyboard'
import { LevelSelect, Flex } from '@gm-pc/react'
import store, { PDetail } from '../../stores/detail_store'
import { getSelectedShelfName } from '../../../../util'
import _ from 'lodash'

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
  const { shelfList, shelfResponse } = store
  const { shelf, shelf_selected, shelf_id } = data

  // 切换仓库选择
  useEffect(() => {
    // 如果shelf_selected被初始化
    if (!shelf_selected.length || shelf_selected.includes('0')) {
      // 清空组件库的数据
      // eslint-disable-next-line no-unused-expressions
      selectRef?.current?._handleWillActiveSelect(['0'])
    }
  }, [shelf_selected])

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
    store.changeProductDetailsItem(index, changeData)
  }

  const isDelete = shelf ? shelf.delete_time !== '0' : false
  if (globalStore.shelfListTree.length === 0) return null

  return (
    <Flex row alignCenter>
      <LevelSelect
        ref={selectRef}
        onSelect={handleSelectStockGoodsShelf}
        selected={
          shelf_selected.length === 0
            ? search(globalStore.shelfList, shelf_id ?? '0').reverse()
            : shelf_selected.slice()
        }
        data={toJS(globalStore.shelfListTree)}
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
  )
})

export default ShelfNameCell
