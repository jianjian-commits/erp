import { t } from 'gm-i18n'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Observer, observer } from 'mobx-react'
import { BoxTable, Tooltip, Flex, BoxTableInfo, BoxPanel } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import store from './store'
import Operation from './components/operation'
import CellName from './components/cell_name'
import CellCategory from './components/cell_category'
import MerchandiseLevel from './components/merchandise_level'
import CellAmount from './components/cell_amount'
import CellPrice from './components/cell_price'
import CellMoney from './components/cell_money'
import CellRemark from './components/cell_remark'
import CellCombine from './components/cell_combine'
import CellNoTaxMoney from './components/cell_no_tax_money'
import CellTaxMoney from './components/cell_tax_money'
import CellTaxRate from './components/cell_tax_rate'
import CellCooperateModel from './components/cell_cooperate_model'
import CellNoTaxPrice from './components/cell_no_tax_price'
import ProductionTimeCell from './components/production_time_cell'
import { history } from '@/common/service'
import SupplierDeletedSign from '@/common/components/icon/supplier_deleted_sign'
import {
  PurchaseSheet_Status,
  ExportPurchaseOrderType,
} from 'gm_api/src/purchase'
import { GetPurchaseSettings } from 'gm_api/src/preference'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import _ from 'lodash'
import Big from 'big.js'
import { useGMLocation } from '@gm-common/router'
import { Query } from '@/pages/purchase/interface'
import { BillSku, StockSheetItem } from './interface'
import { STOCK_IN_RECEIPT_STATUS_NAME } from '@/pages/sales_invoicing/enum'
import { Button, Modal, Radio, RadioChangeEvent, Image, Select } from 'antd'
import exportDetail from '@/img/export_detail.png'
import exportMany from '@/img/export_many.png'

const { OperationHeader, TABLE_X } = TableXUtil

type DisplayCustomerCodeType = '0' | '1'
const List = () => {
  const location = useGMLocation<Query>()
  const { status } = store.info
  const handleDetailAdd = useCallback(() => {
    store.addRow()
  }, [])

  const [relatedList, setRelatedList] = useState<StockSheetItem[]>([])
  const [isExport, setIsExport] = useState<boolean>(false)
  const [displayCustomerCode, setDisplayCustomerCode] =
    useState<DisplayCustomerCodeType>('0')

  const [radioValue, setRadioValue] = useState<ExportPurchaseOrderType>(
    (localStorage.getItem(
      'exportRecord',
    ) as unknown as ExportPurchaseOrderType) ||
      ExportPurchaseOrderType.SUPPLIER_WAIT_SORT_PURCHASE_ORDER_MERGE,
  )

  useEffect(() => {
    /**
     * @description ???????????????????????????
     */
    GetPurchaseSettings({}).then((res) => {
      const state =
        res.response.purchase_settings
          .purchase_task_price_equal_quotation_price === 2
      return store.setAgreementPriceState(state)
    })

    /**
     * @description ??????????????????
     */
    if (location.query.id) {
      store.fetchListStockSheet(location.query.id).then((json) => {
        const res = json.response
        const list = res.stock_sheets.map((d) => {
          const suppliers = res.additional?.suppliers?.[d?.supplier_id ?? '0']
          const purchasers =
            res.additional?.group_users?.[d?.purchaser_id ?? '0']
          const supplier_name =
            res.additional?.suppliers?.[d?.supplier_id ?? '0']?.name ?? '-'
          const purchaser_name =
            res.additional?.group_users?.[d?.purchaser_id ?? '0']?.name ?? '-'
          return {
            ...d,
            supplier_name,
            supplierInfo: suppliers,
            purchaser_name,
            purchaserInfo: purchasers,
          }
        }) as StockSheetItem[]
        setRelatedList(list)
      })
    }
  }, [location.query.id])

  /**
   * @desc ??????????????????
   */
  const isCommitted = status === PurchaseSheet_Status.COMMIT

  const handleToPurchaseSetting = () => {
    history.push('/system/setting/purchase_setting')
  }

  const columns: Column<BillSku>[] = useMemo(() => {
    return [
      {
        Header: OperationHeader,
        id: 'operation',
        fixed: 'left',
        show: !isCommitted,
        diyItemText: t('??????'),
        width: TABLE_X.WIDTH_EDIT_OPERATION,
        Cell: (cellProps) => {
          const { index } = cellProps
          return <Operation index={index} />
        },
      },
      {
        Header: t('????????????'),
        id: 'customize_code',
        minWidth: 120,
        diyEnable: false,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return cellProps.original.customize_code || ''
        },
      },
      {
        Header: t('????????????'),
        id: 'name',
        minWidth: 200,
        diyEnable: false,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return <CellName index={cellProps.index} />
        },
      },

      {
        Header: t('????????????'),
        id: 'category_name',
        accessor: 'category_name',
        minWidth: 100,
        Cell: (cellProps) => <CellCategory index={cellProps.index} />,
      },
      {
        Header: t('????????????'),
        id: 'merchandise_level',
        hide: globalStore.isLite,
        accessor: 'merchandise_level',
        minWidth: 160,
        Cell: (cellProps) => <MerchandiseLevel index={cellProps.index} />,
      },
      {
        Header: t('????????????'),
        id: 'purchase_unit_name',
        accessor: 'purchase_unit_name',
        minWidth: 100,
      },
      {
        Header: t('?????????'),
        id: 'plan_amount',
        accessor: 'plan_amount',
        minWidth: 100,
        Cell: (cellProps) => {
          const { plan_amount, purchase_unit_name } = cellProps.original
          if (!isCommitted && !plan_amount) {
            return '-'
          }
          return (
            <>
              {plan_amount ?? '-'}
              {purchase_unit_name ?? '-'}
            </>
          )
        },
      },
      {
        Header: t('?????????'),
        id: 'purchase_amount',
        diyEnable: false,
        minWidth: 130,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return <CellAmount index={cellProps.index} />
        },
      },
      {
        Header: isCommitted ? (
          t('????????????')
        ) : (
          <Flex>
            {t('????????????')}
            {!globalStore.isLite && (
              <Tooltip
                className='gm-padding-lr-5 gm-text-14'
                popup={
                  <div className='gm-padding-5'>
                    {store.agreementPriceState
                      ? t('????????????????????????')
                      : t('?????????????????????')}
                    <a className='gm-cursor' onClick={handleToPurchaseSetting}>
                      {t('????????????')}
                    </a>
                  </div>
                }
              />
            )}
          </Flex>
        ),
        accessor: 'purchase_price',
        diyEnable: false,
        isKeyboard: !isCommitted,
        minWidth: 140,
        Cell: (cellProps) => (
          <CellPrice
            index={cellProps.index}
            disabled={
              !globalStore.hasPermission(
                Permission.PERMISSION_PURCHASE_UPDATE_UNIT_PRICE,
              )
            }
          />
        ),
      },

      {
        Header: t('?????????????????????????????????'),
        accessor: 'out_stock_unit_value',
        hide: globalStore.isLite,
        minWidth: 180,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                const { out_stock_unit_value, purchase_unit_name } =
                  store.list[cellProps.index]

                const value = Big(
                  out_stock_unit_value?.calculate?.quantity || 0,
                ).toFixed(4)
                if (!+value! || !isCommitted) {
                  // ??????????????????????????????????????????-???
                  return <span>-</span>
                }
                return (
                  <Flex alignCenter>
                    {value}
                    {purchase_unit_name || '-'}
                  </Flex>
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('????????????'),
        id: 'purchase_money',
        minWidth: 120,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return (
            <CellMoney
              index={cellProps.index}
              disabled={
                !globalStore.hasPermission(
                  Permission.PERMISSION_PURCHASE_UPDATE_UNIT_PRICE,
                )
              }
            />
          )
        },
      },
      {
        Header: t('?????????????????????(????????????)'),
        accessor: 'no_tax_purchase_price',
        hide: globalStore.isLite,
        minWidth: 160,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return <CellNoTaxPrice index={cellProps.index} />
        },
      },
      {
        Header: t('?????????????????????'),
        id: 'no_tax_purchase_money',
        minWidth: 120,
        hide: globalStore.isLite,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return <CellNoTaxMoney index={cellProps.index} />
        },
      },
      {
        Header: t('??????'),
        id: 'tax_money',
        hide: globalStore.isLite,
        minWidth: 120,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return <CellTaxMoney index={cellProps.index} />
        },
      },
      {
        Header: t('??????'),
        id: 'tax_rate',
        hide: globalStore.isLite,
        minWidth: 120,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return <CellTaxRate index={cellProps.index} />
        },
      },
      {
        Header: t('????????????'),
        accessor: 'remark',
        hide: globalStore.isLite,
        minWidth: 120,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => <CellRemark index={cellProps.index} />,
      },
      {
        Header: t('?????????????????????'),
        accessor: 'supplier_cooperate_model_type',
        hide: globalStore.isLite,
        minWidth: 120,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => <CellCooperateModel index={cellProps.index} />,
      },
      {
        Header: t('????????????'),
        accessor: 'manufacture_date',
        hide: globalStore.isLite,
        minWidth: 120,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => <ProductionTimeCell index={cellProps.index} />,
      },
      {
        Header: t('??????????????????'),
        id: 'description',
        hide: globalStore.isLite,
        minWidth: 160,
        Cell: (cellProps) => <CellCombine index={cellProps.index} />,
      },
    ]
  }, [isCommitted])

  // ??????????????????????????? ???????????????????????????????????????????????????
  if (!store.info.supplier && !store.info.purchase) return null

  /**
   * @description ??????????????????
   * @returns ??????jsx
   */
  const summaryComponent = () => {
    return (
      <Flex alignCenter>
        <div>
          <span className='tw-mr-2' style={{ fontSize: '14px' }}>
            {t('????????????:')}
          </span>
          <span style={{ color: '#0f0c20', fontWeight: 'bolder' }}>
            {t('???????????? :')}
          </span>
          &nbsp;
          <span style={{ color: '#75a1ec', fontWeight: 'bolder' }}>
            {store.list.length}
          </span>
        </div>
        <span className='tw-ml-2 tw-mr-2'> | </span>
        <div>
          <span style={{ color: '#0f0c20', fontWeight: 'bolder' }}>
            {t('????????????????????????:')}
          </span>
          &nbsp;
          <Observer>
            {() => {
              const purchase_money = _.reduce(
                store.list,
                (prev, cur) => {
                  return +Big(prev).add(+cur?.purchase_money! || 0)
                },
                0,
              )
              return (
                <span style={{ color: '#75a1ec', fontWeight: 'bolder' }}>
                  {purchase_money.toFixed(2)}
                </span>
              )
            }}
          </Observer>
        </div>
        {!globalStore.isLite && (
          <>
            <span className='tw-ml-2 tw-mr-2'> | </span>
            <div>
              <span style={{ color: '#0f0c20', fontWeight: 'bolder' }}>
                {t('???????????????????????????:')}
              </span>
              &nbsp;
              <Observer>
                {() => {
                  const no_tax_purchase_money = _.reduce(
                    store.list,
                    (prev, cur) => {
                      return +Big((+prev || 0).toFixed(2)).add(
                        (+cur?.no_tax_purchase_money! || 0).toFixed(2),
                      )
                    },
                    0,
                  )
                  return (
                    <span style={{ color: '#75a1ec', fontWeight: 'bolder' }}>
                      {no_tax_purchase_money.toFixed(2)}
                    </span>
                  )
                }}
              </Observer>
            </div>
          </>
        )}
      </Flex>
    )
  }

  /**
   * @description action
   */
  const handleExport = () => {
    store
      .billExport(
        ExportPurchaseOrderType.MP_LITE_PURCHASE_ORDER,
        location.query.id,
      )
      .then((res) => {
        globalStore.showTaskPanel()
      })
  }

  const action = () => {
    // ???????????????????????????????????????
    return (
      globalStore.isLite &&
      Boolean(status) && (
        <>
          <Button className='tw-mr-2' onClick={handleExport} type='primary'>
            {t('?????????????????????')}
          </Button>
          {_.some(
            store?.list,
            (item) =>
              item?.up_relation && item?.up_relation?.relations.length > 0,
          ) ? (
            <Button type='primary' onClick={() => setIsExport(true)}>
              {t('?????????????????????')}
            </Button>
          ) : null}
        </>
      )
    )
  }

  /**
   * @description ????????????
   */

  const handleOk = () => {
    setIsExport(false)
    setDisplayCustomerCode('0')
    store
      .billExport(radioValue, location.query.id, Boolean(+displayCustomerCode))
      .then((res) => {
        globalStore.showTaskPanel()
      })
  }

  /**
   * @description onChange
   */
  const onChange = (e: RadioChangeEvent) => {
    setRadioValue(e.target.value)
    localStorage.setItem('exportRecord', e.target.value)
  }

  return (
    <>
      <BoxTable
        info={<BoxTableInfo>{summaryComponent()}</BoxTableInfo>}
        action={action()}
      >
        <Table
          isIndex
          isDiy
          isKeyboard
          isEdit
          isVirtualized
          onAddRow={handleDetailAdd}
          data={store.list.slice()}
          id='purchase_bills_table'
          columns={columns}
        />
      </BoxTable>

      {/* ??????????????? */}
      {isExport && (
        <Modal
          width='1000px'
          title={t('?????????????????????????????????')}
          visible={isExport}
          onCancel={() => {
            setDisplayCustomerCode('0')
            setIsExport(false)
          }}
          footer={[
            <Select
              key='select'
              options={[
                {
                  value: '0',
                  label: '??????????????????',
                },
                {
                  value: '1',
                  label: '??????????????????',
                },
              ]}
              value={displayCustomerCode}
              onChange={(value) => setDisplayCustomerCode(value)}
              className='gm-margin-right-10'
            />,
            <Button key='confirm' type='primary' onClick={handleOk}>
              {t('??????')}
            </Button>,
          ]}
        >
          <Radio.Group
            className='tw-w-full'
            onChange={onChange}
            value={
              String(radioValue) === '4'
                ? ExportPurchaseOrderType.SUPPLIER_WAIT_SORT_PURCHASE_ORDER
                : ExportPurchaseOrderType.SUPPLIER_WAIT_SORT_PURCHASE_ORDER_MERGE
            }
          >
            <Flex justifyAround>
              <Radio
                value={
                  ExportPurchaseOrderType.SUPPLIER_WAIT_SORT_PURCHASE_ORDER_MERGE
                }
              >
                <p>{t('????????????(???????????????)')}</p>
                <Image
                  src={exportDetail}
                  height={300}
                  className='tw-w-full'
                  alt='???????????????'
                />
              </Radio>
              <Radio
                value={
                  ExportPurchaseOrderType.SUPPLIER_WAIT_SORT_PURCHASE_ORDER
                }
              >
                <p>{t('????????????(??????????????????)')}</p>
                <Image
                  src={exportMany}
                  height={300}
                  className='tw-w-full'
                  alt='??????????????????'
                />
              </Radio>
            </Flex>
          </Radio.Group>
        </Modal>
      )}

      {/* ????????????????????? */}
      {location.query.id && relatedList?.length > 0 && (
        <BoxPanel title={t('?????????????????????')} collapse>
          <Table<StockSheetItem>
            data={relatedList.slice()}
            id='purchase_bills_table'
            columns={[
              {
                Header: '??????',
                id: 'index',
                accessor: (_, index) => index + 1,
                minWidth: 100,
                headerSort: true,
              },
              {
                Header: '??????????????????',
                accessor: 'totalMoney',
                id: 'totalMoney',
                minWidth: 100,
                Cell: (cellProps) => {
                  return (
                    <a
                      href={`/#/sales_invoicing/purchase/stock_in/detail?sheet_id=${cellProps?.original?.stock_sheet_id}`}
                      target='_blank'
                      className='gm-cursor'
                      rel='noreferrer'
                    >
                      {cellProps.original?.stock_sheet_serial_no}
                    </a>
                  )
                },
              },
              {
                Header: '?????????',
                accessor: 'supplier_name',
                id: 'supplier_name',
                minWidth: 100,
                Cell: (cellProps) => {
                  const { supplierInfo } = cellProps.original
                  return (
                    <Flex alignCenter>
                      {supplierInfo?.delete_time &&
                        supplierInfo?.delete_time !== '0' && (
                          <SupplierDeletedSign />
                        )}
                      {supplierInfo?.name || '-'}
                    </Flex>
                  )
                },
              },
              {
                Header: '?????????',
                accessor: 'purchaser_name',
                hide: globalStore.isLite,
                id: 'purchaser_name',
                minWidth: 100,
                Cell: (cellProps) => {
                  const { purchaserInfo } = cellProps.original
                  return (
                    <Flex alignCenter>
                      {purchaserInfo?.delete_time &&
                        purchaserInfo?.delete_time !== '0' && (
                          <SupplierDeletedSign />
                        )}
                      {purchaserInfo?.name || '-'}
                    </Flex>
                  )
                },
              },
              {
                Header: '??????',
                accessor: 'totalMoney',
                id: 'totalMoney',
                minWidth: 100,
                Cell: (cellProps) => {
                  return STOCK_IN_RECEIPT_STATUS_NAME[
                    cellProps.original.sheet_status
                  ]
                },
              },
            ]}
          />
        </BoxPanel>
      )}
    </>
  )
}

export default observer(List)
