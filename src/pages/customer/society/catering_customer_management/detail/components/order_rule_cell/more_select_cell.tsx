import React, { FC, useState, useEffect } from 'react'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer, Observer } from 'mobx-react'
import { Flex, MoreSelect } from '@gm-pc/react'
import { TableXUtil } from '@gm-pc/table-x'
import SvgRemove from '@/svg/remove.svg'
import SvgCompleted from '@/svg/completed.svg'

/** type */
interface MoreSelectCellProps {
  index: number
  selectClassList: MoreSelectDataItem[]
  store: any
}

const { OperationCell, OperationIcon } = TableXUtil

const MoreSelectCell: FC<MoreSelectCellProps> = observer(
  ({ index, selectClassList, store }) => {
    const [selected, setSelected] =
      useState<MoreSelectDataItem[]>(selectClassList)

    const handleCancel = () => {
      store.updateTableRow(index, 'isEditing', false)
      store.updateMoreSelectList(
        _.map(selectClassList, (it) => it.value),
        'disabled',
        true,
      )
      store.setIsLock(false)
    }

    const handleOk = () => {
      store.updateTableRow(index, 'category_1_ids', selected)
      store.updateTableRow(index, 'isEditing', false)
      store.updateMoreSelectList(
        _.map(selected, (it) => it.value),
        'disabled',
        true,
      )
      store.setIsLock(false)
    }

    useEffect(() => {
      store.updateMoreSelectList(
        _.map(selectClassList, (it) => it.value),
        'disabled',
        false,
      )
    }, [])

    return (
      <Flex justifyStart alignCenter>
        <Observer>
          {() => {
            return (
              <MoreSelect
                data={_.filter(
                  store.categoryList,
                  (it) => it.isSelect === false,
                )}
                multiple
                renderListFilterType='pinyin'
                selected={selected}
                onSelect={(selected: MoreSelectDataItem[]) => {
                  setSelected(selected)
                  // store.updateMoreSelectList(
                  //   _.map(selected, (it) => it.value),
                  //   'disabled',
                  // )
                }}
                placeholder={t('请选择商品分类')}
                style={{
                  width: '80%',
                }}
              />
            )
          }}
        </Observer>
        <OperationCell>
          <OperationIcon onClick={handleOk} tip={t('确定')}>
            <SvgCompleted className='gm-text-primary gm-margin-left-10 gm-margin-right-5 gm-text-14' />
          </OperationIcon>
          <OperationIcon onClick={handleCancel} tip={t('取消')}>
            <SvgRemove className='gm-text-12' />
          </OperationIcon>
        </OperationCell>
      </Flex>
    )
  },
)

export default MoreSelectCell
