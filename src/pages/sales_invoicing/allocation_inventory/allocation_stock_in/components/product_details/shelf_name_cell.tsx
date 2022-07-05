import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'

import store, { PDetail } from '../../stores/receipt_store'
import { getSelectedShelfName } from '../../../../util'
import _ from 'lodash'

import { Flex, LevelSelect } from '@gm-pc/react'
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
  const { index, data } = props
  const { allShelfResponse, canEdit, shelfList } = store
  const { shelf, shelf_selected, shelf_name } = data

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

  if (!shelfList.length) return null
  const isDelete = shelf ? shelf.delete_time !== '0' : false

  return !canEdit ? (
    <div>{shelf_name || '-'}</div>
  ) : (
    <Flex row alignCenter>
      <LevelSelect
        onSelect={handleSelectStockGoodsShelf}
        selected={shelf_selected}
        data={toJS(shelfList)}
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
