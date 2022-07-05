import { t } from 'gm-i18n'
import React from 'react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import { KCSelect } from '@gm-pc/keyboard'
import { RightSideModal, FormPanel, Tooltip } from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import { Attr } from 'gm_api/src/production'

import KeyBoardTips from '@/common/components/key_board_tips'
import { PROCESS_OPTIONS_TYPE } from '../../../enum'
import store from '../store'
import OptionsSet from './options_set'
import CellGuideName from './cell_guide_name'

const { OperationHeader, EditOperation, TABLE_X } = TableXUtil

const GuideData = observer(() => {
  const handleAddItem = (): void => {
    store.addNewGuideDataItem()
  }

  const handleDeleteItem = (index: number): void => {
    store.deleteGuideDataItem(index)
  }

  const handleChange = <T extends keyof Attr>(
    index: number,
    key: T,
    value: Attr[T],
  ) => {
    store.updateGuideDataList(index, key, value)
  }

  const handleOpenParamsSetting = (index: number) => {
    RightSideModal.render({
      title: t('可选项设置'),
      children: <OptionsSet tableIndex={index} />,
      onHide: RightSideModal.hide,
      style: {
        width: '500px',
      },
    })
  }

  const { guideDataList } = store

  return (
    <FormPanel
      title={t('工序指导信息')}
      left={
        <Tooltip
          top
          showArrow
          className='gm-margin-left-5'
          style={{ marginBottom: '2px' }}
          popup={
            <div style={{ width: '200px', padding: '5px' }}>
              {t(
                '用于指导工序的相关操作，会在加工单与工位屏展现。如“时长”，“切断长度”等',
              )}
            </div>
          }
        />
      }
      right={<KeyBoardTips />}
    >
      <Table
        isIndex
        isKeyboard
        isEdit
        id='process_guide_options'
        tiled
        onAddRow={handleAddItem}
        data={guideDataList.slice()}
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
                    guideDataList.length === 1
                      ? undefined
                      : () => handleDeleteItem(cellProps.index)
                  }
                />
              )
            },
          },
          {
            Header: t('指导参数'),
            accessor: 'name',
            minWidth: 200,
            isKeyboard: true,
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  const {
                    index,
                    original: { name, values },
                  } = cellProps

                  return (
                    <CellGuideName index={index} name={name} values={values} />
                  )
                }}
              </Observer>
            ),
          },
          {
            Header: t('参数属性设置'),
            accessor: 'type',
            minWidth: 80,
            isKeyboard: true,
            Cell: (cellProps) => (
              <Observer>
                {() => {
                  const {
                    index,
                    original: { type },
                  } = cellProps
                  return (
                    <KCSelect
                      data={PROCESS_OPTIONS_TYPE}
                      value={type}
                      onChange={(value: number) =>
                        handleChange(index, 'type', value)
                      }
                    />
                  )
                }}
              </Observer>
            ),
          },
          {
            Header: t('可选项设置'),
            id: 'values',
            minWidth: 200,
            Cell: (cellProps) => {
              // 单选属性可以设置字段参数
              return (
                <Observer>
                  {() => {
                    const {
                      index,
                      original: { values, type },
                    } = cellProps

                    return (
                      <div>
                        {type === 2 ? (
                          <a
                            onClick={() => handleOpenParamsSetting(index)}
                          >{`${t('选项数')}（${values.length}）`}</a>
                        ) : (
                          '-'
                        )}
                      </div>
                    )
                  }}
                </Observer>
              )
            },
          },
        ]}
      />
    </FormPanel>
  )
})

export default GuideData
