import React, { FC, useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'

import store, { PDetail } from '../../stores/list_store'
import { getSelectedShelfName } from '../../../../util'
import _ from 'lodash'

import { Flex, LevelSelect, Tip } from '@gm-pc/react'
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
  const { allShelfResponse, shelfList } = store
  const { isEdit } = store.list[index]
  const { shelf_name, shelf, shelf_selected, shelf_id, warehouse_id } = data

  const handleSelectStockGoodsShelf = (selected: string[]) => {
    const changeData = {
      shelf_selected: selected,
      shelf_id: selected[selected.length - 1],
      shelf_name: getSelectedShelfName(allShelfResponse, selected),
      shelf: _.find(
        allShelfResponse,
        (item) => item.shelf_id === selected[selected.length - 1],
      ),
    }

    store.changeDetailItem(index, changeData)
  }

  useEffect(() => {
    if (isEdit) {
      globalStore.fetchShelf({ warehouse_id })
    }
  }, [warehouse_id])

  // 切换仓库选择
  useEffect(() => {
    // 如果shelf_selected被初始化
    if (!shelf_selected.length || shelf_selected.includes('0')) {
      // 清空组件库的数据
      // eslint-disable-next-line no-unused-expressions
      selectRef?.current?._handleWillActiveSelect(['0'])
    }
  }, [shelf_selected])

  // 开启多仓，则必先选择仓库
  if (globalStore.isOpenMultWarehouse && !warehouse_id) {
    Tip.danger(t('请先选择仓库'))
  }

  const isDelete = shelf ? shelf.delete_time !== '0' : false
  if (globalStore.shelfListTree.length === 0) return null
  return !isEdit ? (
    <div>{shelf_name || '未分配'}</div>
  ) : (
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
