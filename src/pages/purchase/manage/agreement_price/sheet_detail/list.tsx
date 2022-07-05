import { t } from 'gm-i18n'
import React, { useCallback, useMemo, ChangeEvent } from 'react'
import { observer, Observer } from 'mobx-react'
import { BoxPanel, Flex, Input, Tooltip, InputNumber } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import { useGMLocation } from '@gm-common/router'
import Big from 'big.js'
import store from './store'
import CellOperation from './components/cell_operation'
import CellName from './components/cell_name'
import CellUnit from './components/cell_unit'

const { OperationHeader, TABLE_X } = TableXUtil

interface Query {
  quotation_id?: string
  copy_quotation_id?: string
}
// function onEditPkgPriceChange(value: string) {
//   const a = value.split('.')[0]
//   const b = value.split('.')[1]
//   if (b?.length > 2) {
//     return a + '.' + b.slice(0, 2)
//   }
//   return value
// }

function onEditPriceChange(value: string) {
  const a = value.split('.')[0]
  const b = value.split('.')[1]
  if (b?.length > 2) {
    return a + '.' + b.slice(0, 2)
  }
  return value
}

// 算出不含税价格
function exclusiveTaxPirce(value = 0, tax = 0) {
  return +Big(+value || 0)
    .div(1 + (+tax || 0) / 100)
    .toFixed(2)
}

const List = observer(() => {
  const location = useGMLocation<Query>()
  const quotation_id = location.query?.quotation_id

  const handleDetailAdd = useCallback(() => {
    store.addRow()
  }, [])
  const columns: Column[] = useMemo(() => {
    return [
      {
        Header: OperationHeader,
        id: 'operation',
        fixed: 'left',
        diyItemText: t('操作'),
        width: TABLE_X.WIDTH_EDIT_OPERATION,
        Cell: (cellProps) => {
          const { index } = cellProps
          return <CellOperation index={index} />
        },
      },
      {
        Header: t('商品名称'),
        id: 'name',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                const { isEditing } = cellProps.original
                const supplier_id = store.headerInfo.supplier.supplier_id
                return isEditing || !quotation_id ? (
                  <CellName supplier_id={supplier_id} index={cellProps.index} />
                ) : (
                  <div>{cellProps.original.skuName}</div>
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('采购单位'),
        id: 'purchase_unit_name',
        accessor: 'purchase_unit_name',
        minWidth: 60,
        diyEnable: false,
      },
      // {
      //   Header: t('规格'),
      //   id: 'unit',
      //   minWidth: 60,
      //   diyEnable: false,
      //   Cell: (cellProps) => {
      //     return (
      //       <Observer>
      //         {() => {
      //           const { rate, measUnit, pkgUnit, isEditing } =
      //             cellProps.original
      //           return isEditing || !quotation_id ? (
      //             <CellUnit index={cellProps.index} />
      //           ) : (
      //             <div>{`${rate}${measUnit}/${pkgUnit}`}</div>
      //           )
      //         }}
      //       </Observer>
      //     )
      //   },
      // },
      {
        Header: t('商品分类'),
        id: 'category_name',
        minWidth: 60,
        diyEnable: false,
        Cell: (cellProps) => (
          <Observer>
            {() => {
              return <div>{cellProps.original.categoryName || '-'}</div>
            }}
          </Observer>
        ),
      },
      {
        Header: t('含税协议价（采购单位）'),
        id: 'price',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const { index } = cellProps
              const { price, isEditing, rate, purchase_unit_name } =
                cellProps.original

              if (isEditing || !quotation_id) {
                return (
                  <Flex alignCenter>
                    <InputNumber
                      max={9999999999999}
                      value={price}
                      // onInput={(e: any) => {
                      //   e.target.value = e.target.value.replace(/-/g, '')
                      // }}
                      onChange={(value) => {
                        // const fixPkgPrice = value
                        //   ? +Big(+value || 0)
                        //       .times(rate)
                        //       .toString()
                        //   : ''
                        // const priceMsg = {
                        //   price: onEditPriceChange(
                        //     value === null ? 0 : '' + value,
                        //   ),
                        //   // pkgPrice: onEditPkgPriceChange(fixPkgPrice),
                        // }
                        store.updateList(index, { price: value })
                      }}
                    />
                    {`元/${purchase_unit_name}`}
                  </Flex>
                )
              }
              return <div>{`${price}元/${purchase_unit_name}`}</div>
            }}
          </Observer>
        ),
      },
      // {
      //   Header: (
      //     <Flex>
      //       {t('含税协议价（包装单位）')}
      //       <Tooltip
      //         className='gm-padding-lr-5 gm-text-14'
      //         popup={t('仅方便录入，实际采购协议价以计量单位协议价为准')}
      //       />
      //     </Flex>
      //   ),
      //   id: 'category_name',
      //   minWidth: 100,
      //   diyEnable: false,
      //   Cell: (cellProps) => (
      //     <Observer>
      //       {() => {
      //         const { index } = cellProps
      //         const { rate, pkgPrice, pkgUnit, isEditing } = cellProps.original
      //         if (isEditing || !quotation_id) {
      //           return (
      //             <Flex alignCenter>
      //               <Input
      //                 type='number'
      //                 max={9999999999999}
      //                 value={pkgPrice}
      //                 onInput={(e: any) => {
      //                   e.target.value = e.target.value.replace(/-/g, '')
      //                 }}
      //                 onChange={(e: ChangeEvent<HTMLInputElement>) => {
      //                   const value: any = e.target.value
      //                   const fixedPrice = value
      //                     ? new Big(value).div(rate).toString()
      //                     : ''
      //                   const priceMsg = {
      //                     price: onEditPriceChange(fixedPrice),
      //                     pkgPrice: onEditPkgPriceChange(value),
      //                   }
      //                   store.updateList(index, priceMsg)
      //                 }}
      //               />
      //               {`元/${pkgUnit}`}
      //             </Flex>
      //           )
      //         }
      //         return <div>{`${pkgPrice}元/${pkgUnit}`}</div>
      //       }}
      //     </Observer>
      //   ),
      // },
      {
        Header: t('进项税率'),
        id: 'input_tax',
        minWidth: 50,
        diyEnable: false,
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const { index } = cellProps
              const { input_tax, isEditing } = cellProps.original
              if (isEditing || !quotation_id) {
                return (
                  <Flex alignCenter>
                    <InputNumber
                      max={100}
                      precision={0}
                      min={0}
                      value={input_tax}
                      onChange={(value) => {
                        store.updateList(index, { input_tax: value })
                      }}
                    />
                    %
                  </Flex>
                )
              }
              return <div>{`${input_tax || 0}%`}</div>
            }}
          </Observer>
        ),
      },
      {
        Header: t('不含税协议价（采购单位）'),
        id: 'price',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => (
          <Observer>
            {() => {
              const { price, purchase_unit_name, input_tax } =
                cellProps.original
              const excluding_tax_pirce = exclusiveTaxPirce(price, input_tax)
              return (
                <div>{`${
                  excluding_tax_pirce || '-'
                }元/${purchase_unit_name}`}</div>
              )
            }}
          </Observer>
        ),
      },
    ]
  }, [])

  return (
    <BoxPanel
      summary={[{ text: t('商品数'), value: store.list.length }]}
      title={t('明细列表')}
      collapse
    >
      <Table
        isIndex
        isKeyboard
        isEdit
        onAddRow={handleDetailAdd}
        data={store.list.slice()}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default List
