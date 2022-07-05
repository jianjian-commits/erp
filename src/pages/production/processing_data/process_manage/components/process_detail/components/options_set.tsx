import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import { KCInput } from '@gm-pc/keyboard'
import { Affix, Button, Flex, RightSideModal } from '@gm-pc/react'
import _ from 'lodash'

import TableListTips from '@/common/components/table_list_tips'
import store from '../store'

interface OptionsSetProps {
  tableIndex: number
}

const { TABLE_X, EditOperation, OperationHeader } = TableXUtil

const OptionsSet: FC<OptionsSetProps> = observer(({ tableIndex }) => {
  const { typeValuesList } = store

  useEffect(() => {
    store.initTypeValuesList(tableIndex)
    return () => {
      store.clearTypeValuesList()
    }
  }, [tableIndex])

  const handleAddItem = () => {
    store.addNewTypeValue()
  }

  const handleDeleteItem = (index: number) => {
    store.deleteNewTypeValue(index)
  }

  const handleChange = (index: number, value: string) => {
    store.updateTypeValuesList(index, value)
  }

  const handleCancel = () => {
    RightSideModal.hide()
  }

  const handleSave = () => {
    const value = _.map(
      _.filter(typeValuesList, (item) => item.desc.trim() !== ''),
      (v) => v.desc.trim(),
    )
    store.updateGuideDataList(tableIndex, 'values', value)
    RightSideModal.hide()
  }

  return (
    <>
      <TableListTips
        tips={[t('删除后，绑定该参数的商品，其商品的参数将重置为空')]}
      />
      <Table
        isIndex
        isKeyboard
        isEdit
        id='process_guide_options_values'
        tiled
        onAddRow={handleAddItem}
        data={typeValuesList.slice()}
        columns={[
          {
            Header: OperationHeader,
            id: 'operation',
            width: TABLE_X.WIDTH_EDIT_OPERATION,
            fixed: 'left',
            Cell: (cellProps) => {
              return (
                <EditOperation
                  onAddRow={handleAddItem}
                  onDeleteRow={
                    typeValuesList.length === 1
                      ? undefined
                      : () => handleDeleteItem(cellProps.index)
                  }
                />
              )
            },
          },
          {
            Header: t('参数描述'),
            accessor: 'desc',
            minWidth: 200,
            isKeyboard: true,
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  const {
                    index,
                    original: { desc },
                  } = cellProps
                  return (
                    <KCInput
                      type='text'
                      name='description'
                      autoComplete='off'
                      value={desc}
                      maxLength={20}
                      onChange={(e) => handleChange(index, e.target.value)}
                    />
                  )
                }}
              </Observer>
            ),
          },
        ]}
      />
      <Affix bottom={0}>
        <Flex row justifyCenter alignCenter className='gm-margin-top-20'>
          <Button className='gm-margin-right-5' onClick={handleCancel}>
            {t('取消')}
          </Button>
          <div className='gm-gap-20' />
          <Button type='primary' htmlType='submit' onClick={handleSave}>
            {t('保存')}
          </Button>
        </Flex>
      </Affix>
    </>
  )
})

export default OptionsSet
