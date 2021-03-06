import React, { useCallback, useMemo } from 'react'
import { t } from 'gm-i18n'

import {
  Table,
  TableXUtil,
  BatchActionDefault,
  Column,
  TableProps,
} from '@gm-pc/table-x'
import { Flex, Modal } from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import SkuSelector from './sku_selector'
import SupplierSelector from './supplier_selector'
import PurchaserSelector from './purchaser_selector'
// eslint-disable-next-line import/namespace
import PurchaseInput from './purchase_input'
import SupplierBatch from './supplier_batch'
import SkuLevelSelect from './sku_level_select'
import PurchaserBatch from './purchaser_batch'

// import CellRatio from '../../../components/cell_ratio'
import store from '../store'
import type { Spec } from '../store'

const { OperationCell, OperationHeader, EditOperation, TABLE_X } = TableXUtil

const List = () => {
  const { selected, specDetail } = store
  const columns = useMemo(
    (): Column<Spec>[] => [
      {
        Header: OperationHeader,
        id: 'operation',
        width: TABLE_X.WIDTH_EDIT_OPERATION,
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const { index } = cellProps
              return (
                <OperationCell>
                  <EditOperation
                    onAddRow={() => {
                      store.addRow(index)
                    }}
                    onDeleteRow={
                      store.specDetail.list.length > 1
                        ? () => {
                            store.deleteRow(index)
                          }
                        : undefined
                    }
                  />
                </OperationCell>
              )
            }}
          </Observer>
        ),
      },
      {
        Header: t('ååįžį '),
        minWidth: 160,
        accessor: 'customize_code',
        Cell: (cellProps) => (
          <Observer>
            {() => <div>{cellProps.original.customize_code}</div>}
          </Observer>
        ),
      },
      {
        Header: t('ååå'),
        accessor: 'sku_name',
        minWidth: 200,
        isKeyboard: true,
        Cell: (cellProps) => <SkuSelector index={cellProps.index} />,
      },

      {
        Header: t('åååįąŧ'),
        accessor: 'category_name',
        minWidth: 120,
        Cell: (cellProps) => (
          <Observer>
            {() => <div>{cellProps.original.category_name || '-'}</div>}
          </Observer>
        ),
      },
      {
        Header: t('ååį­įš§'),
        accessor: 'merchandise_level',
        minWidth: 120,
        Cell: (cellProps) => (
          <Observer>
            {() => <SkuLevelSelect index={cellProps.index} />}
          </Observer>
        ),
      },
      {
        Header: t('éčī­åä―'),
        id: 'purchase_unit_name',
        minWidth: TABLE_X.WIDTH_SEARCH,
        Cell: (cellProps) => (
          <Observer>
            {() => <div>{cellProps.original.purchase_unit_name || '-'}</div>}
          </Observer>
        ),
      },
      {
        Header: t('éčī­æ°é'),
        accessor: 'plan_purchase_amount',
        isKeyboard: true,
        minWidth: TABLE_X.WIDTH_SEARCH,
        Cell: (cellProps) => (
          <Observer>
            {() => {
              return (
                <Flex alignCenter>
                  <PurchaseInput index={cellProps.index} />
                  {cellProps?.original?.purchase_unit_name || '-'}
                </Flex>
              )
            }}
          </Observer>
        ),
      },

      {
        Header: t('äūåšå'),
        accessor: 'supplier',
        minWidth: TABLE_X.WIDTH_SEARCH,
        isKeyboard: true,
        Cell: (cellProps) => <SupplierSelector index={cellProps.index} />,
      },
      {
        Header: t('éčī­å'),
        accessor: 'purchaser',
        minWidth: TABLE_X.WIDTH_SEARCH,
        isKeyboard: true,
        Cell: (cellProps) => <PurchaserSelector index={cellProps.index} />,
      },
    ],
    [],
  )

  const handleDetailAdd = useCallback(() => {
    store.addRow()
  }, [])

  const handleSelect = useCallback((selected) => {
    store.setSelected(selected)
  }, [])

  const batchActions = useMemo(
    () => [
      {
        children: (
          <BatchActionDefault>{t('æđéčŪūį―Ūäūåšå')}</BatchActionDefault>
        ),
        onAction: (selected: number[]) => {
          Modal.render({
            children: <SupplierBatch selected={selected} />,
            title: t('æįĪš'),
            size: 'sm',
            onHide: Modal.hide,
          })
        },
      },
      {
        children: (
          <BatchActionDefault>{t('æđéčŪūį―Ūéčī­å')}</BatchActionDefault>
        ),
        onAction: (selected: number[]) => {
          Modal.render({
            children: <PurchaserBatch selected={selected} />,
            title: t('æįĪš'),
            size: 'sm',
            onHide: Modal.hide,
          })
        },
      },
    ],
    [],
  )

  return (
    <Table
      isIndex
      isBatchSelect
      isKeyboard
      isEdit
      id='create_specs'
      columns={columns}
      onAddRow={handleDetailAdd}
      data={specDetail.list.slice()}
      keyField='_i'
      selected={selected.slice()}
      isSelectorDisable={(item: Spec) => !item.sku_id}
      onSelect={handleSelect}
      batchActions={batchActions as unknown as TableProps['batchActions']}
    />
  )
}

export default observer(List)
