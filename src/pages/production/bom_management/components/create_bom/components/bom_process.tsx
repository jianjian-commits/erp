import EllipsesText from '@/pages/production/bom_management/components/bom_list/components/ellipsed_text'
import CellProcessYield from '@/pages/production/bom_management/components/create_bom/components/cell_process_yield'
import ProcessDetail from '@/pages/production/bom_management/components/create_bom/components/process_detail'
import { ProcessOfBom } from '@/pages/production/bom_management/components/create_bom/interface'
import {
  processYieldChange,
  withStatus,
} from '@/pages/production/bom_management/components/create_bom/utils'
import { DeletedProduct } from '@/pages/sales_invoicing/components'
import { FormOutlined } from '@ant-design/icons'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { Flex, MoreSelectDataItem } from '@gm-pc/react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { Modal } from 'antd'
import { t } from 'gm-i18n'
import { BomType, Bom_Status, ProcessTemplate } from 'gm_api/src/production'
import _ from 'lodash'
import { observer, Observer } from 'mobx-react'
import React, { FC, useMemo, useRef, useState } from 'react'
import store from '../store'

/**
 * BOM工序表格的属性
 */
interface Props {
  /** BOM的种类 */
  type?: BomType
}

const { TABLE_X, OperationHeader, OperationCell, EditOperation } = TableXUtil

/**
 * BOM工序表格的组件函数
 */
const BomProcess: FC<Props> = ({ type }) => {
  const {
    bomProcessList,
    bomDetail: { status },
    materialList,
  } = store
  const [isModalVisible, setModalVisible] = useState(false)
  const isOpenYield = useMemo(
    () => !withStatus(status!, Bom_Status.STATUS_PROCESS_YIELD_RATE),
    [status],
  )
  const choseNumber = useRef(0)

  const [sortNum, setSortNum] = useState(1)

  const handleSort = (data: ProcessOfBom[]) => {
    setSortNum((v) => v + 1)
    store.updateAllBomProcessList(
      isOpenYield
        ? processYieldChange(data, materialList[0].process_yield!)
        : data,
    )
  }
  const handleAddRow = () => {
    store.addBomProcessList()
  }

  /**
   * 处理删除行的事件
   * 删除BOM工序
   * @param {number} index 删除行的编号
   */
  const handleDelRow = (index: number) => {
    store.delBomProcessList(index)
  }

  /**
   * 处理更新工序的事件
   * 显示更新的弹窗
   * @param {number} index 更新工序的编号
   */
  const handleUpdateProcess = (index: number) => {
    choseNumber.current = index
    setModalVisible(true)
  }

  /**
   * 渲染工序的参数
   * @param  {ProcessOfBom}           item BOM的工序
   * @return {(JSX.Element | null)[]}      工序参数的组件
   */
  const renderProcessAttrs = (item: ProcessOfBom) => {
    return _.reduce(
      item.attrs,
      (all, next, index) => {
        const nextAft = item.attrs?.[index + 1]
        all.push(
          `${next.name}: ${(next.values && next.values[0]) || '-'}
          ${nextAft?.values && nextAft.values[0] ? ',' : ''}`,
        )
        return all
      },
      [] as string[],
    ).join('')
  }

  /**
   * 定义列表的栏
   */
  const columns: Column<ProcessOfBom>[] = useMemo(
    () => [
      {
        Header: 'BOM工序',
        width: 100,
        fixed: 'left',
        Cell: () => '',
      },
      {
        Header: OperationHeader,
        id: 'index' as any,
        fixed: 'left',
        width: TABLE_X.WIDTH_OPERATION,
        show: type !== BomType.BOM_TYPE_PACK,
        Cell: ({ index }) => {
          return (
            <OperationCell>
              <EditOperation
                onAddRow={handleAddRow}
                onDeleteRow={
                  store.bomProcessList.length === 1
                    ? undefined
                    : () => handleDelRow(index)
                }
              />
            </OperationCell>
          )
        },
      },
      {
        Header: t('工序名称'),
        minWidth: 180,
        isKeyboard: true,
        accessor: 'process_name',
        Cell: ({ index }) => {
          return (
            <Observer>
              {() => {
                const { processList, bomProcessList, materialList } = store
                const { selectProcess } = bomProcessList[index]
                return (
                  <Flex alignCenter>
                    <KCMoreSelect
                      disabled={type === BomType.BOM_TYPE_PACK}
                      style={{ width: TABLE_X.WIDTH_SEARCH }}
                      selected={selectProcess}
                      data={processList}
                      renderListFilterType='pinyin'
                      placeholder={t('输入工序名称搜索')}
                      onSelect={(
                        value: ProcessTemplate & MoreSelectDataItem<string>,
                      ) => {
                        store.updateBomProcessName(index, value)
                        // 开启了总出成率的情况下 处理工序出成率
                        isOpenYield &&
                          store.updateAllBomProcessList(
                            processYieldChange(
                              bomProcessList,
                              materialList[0].process_yield!,
                            ),
                          )
                      }}
                    />
                    {selectProcess?.isDelete && (
                      <DeletedProduct tip={t('该工序已被删除')} />
                    )}
                  </Flex>
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('出成率'),
        width: 180,
        show: type === BomType.BOM_TYPE_CLEANFOOD,
        Cell: ({ index }) => {
          return (
            <Observer>
              {() => {
                const { bomProcessList } = store
                return (
                  <CellProcessYield
                    value={bomProcessList[index].process_yield!}
                    isOpenYield={isOpenYield}
                    onChange={(value) =>
                      store.updateBomProcess(index, 'process_yield', value)
                    }
                  />
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('工序指导参数'),
        width: 200,
        Cell: ({ index }) => {
          return (
            <Observer>
              {() => {
                const data = store.bomProcessList[index]
                return data.selectProcess ? (
                  <Flex
                    onClick={() => {
                      handleUpdateProcess(index)
                    }}
                  >
                    <EllipsesText text={renderProcessAttrs(data)} />
                    <FormOutlined
                      className='gm-margin-left-5'
                      style={{
                        fontSize: '14px',
                        color: '#08c',
                        cursor: 'pointer',
                      }}
                    />
                  </Flex>
                ) : (
                  <span>-</span>
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('工序描述'),
        width: 200,
        Cell: ({ index }) => {
          return (
            <Observer>
              {() => {
                const { bomProcessList } = store
                return (
                  <EllipsesText
                    text={bomProcessList[index].description || '-'}
                  />
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('工序类型'),
        minWidth: 100,
        Cell: ({ index }) => {
          return (
            <Observer>
              {() => {
                const { bomProcessList, processTypeList } = store
                return (
                  <div>
                    {
                      _.find(processTypeList, {
                        value: bomProcessList[index]?.process_type_id,
                      })?.text
                    }
                  </div>
                )
              }}
            </Observer>
          )
        },
      },
    ],
    [type, isOpenYield],
  )
  return (
    <>
      <Table
        key={sortNum}
        isEdit
        isSort
        isKeyboard
        id='bom_process_list'
        tiled
        columns={columns}
        data={bomProcessList.slice()}
        onAddRow={handleAddRow}
        className='gm-margin-bottom-10'
        style={{ marginLeft: 40 }}
        onSortChange={(data) => handleSort(data as ProcessOfBom[])}
        keyField='sortNum'
      />
      <Modal
        title={t('更多筛选')}
        visible={isModalVisible}
        width='600px'
        bodyStyle={{ maxHeight: '320px', overflowY: 'auto' }}
        onOk={() => setModalVisible(true)}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        footer={null}
      >
        <ProcessDetail
          detail={bomProcessList[choseNumber.current]}
          processIndex={choseNumber.current}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </>
  )
}

export default observer(BomProcess)
