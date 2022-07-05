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
     * @description 获取采购协议价配置
     */
    GetPurchaseSettings({}).then((res) => {
      const state =
        res.response.purchase_settings
          .purchase_task_price_equal_quotation_price === 2
      return store.setAgreementPriceState(state)
    })

    /**
     * @description 查看分批入库
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
   * @desc 判断单据状态
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
        diyItemText: t('操作'),
        width: TABLE_X.WIDTH_EDIT_OPERATION,
        Cell: (cellProps) => {
          const { index } = cellProps
          return <Operation index={index} />
        },
      },
      {
        Header: t('商品编码'),
        id: 'customize_code',
        minWidth: 120,
        diyEnable: false,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return cellProps.original.customize_code || ''
        },
      },
      {
        Header: t('商品名称'),
        id: 'name',
        minWidth: 200,
        diyEnable: false,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return <CellName index={cellProps.index} />
        },
      },

      {
        Header: t('商品分类'),
        id: 'category_name',
        accessor: 'category_name',
        minWidth: 100,
        Cell: (cellProps) => <CellCategory index={cellProps.index} />,
      },
      {
        Header: t('商品等级'),
        id: 'merchandise_level',
        hide: globalStore.isLite,
        accessor: 'merchandise_level',
        minWidth: 160,
        Cell: (cellProps) => <MerchandiseLevel index={cellProps.index} />,
      },
      {
        Header: t('采购单位'),
        id: 'purchase_unit_name',
        accessor: 'purchase_unit_name',
        minWidth: 100,
      },
      {
        Header: t('需求数'),
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
        Header: t('采购数'),
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
          t('采购单价')
        ) : (
          <Flex>
            {t('采购单价')}
            {!globalStore.isLite && (
              <Tooltip
                className='gm-padding-lr-5 gm-text-14'
                popup={
                  <div className='gm-padding-5'>
                    {store.agreementPriceState
                      ? t('默认展示协议价，')
                      : t('未设置默认价，')}
                    <a className='gm-cursor' onClick={handleToPurchaseSetting}>
                      {t('点此设置')}
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
        Header: t('预计到货数（采购单位）'),
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
                  // 未提交时预计到货永远显示为”-“
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
        Header: t('采购金额'),
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
        Header: t('不含税采购单价(采购单位)'),
        accessor: 'no_tax_purchase_price',
        hide: globalStore.isLite,
        minWidth: 160,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return <CellNoTaxPrice index={cellProps.index} />
        },
      },
      {
        Header: t('不含税采购金额'),
        id: 'no_tax_purchase_money',
        minWidth: 120,
        hide: globalStore.isLite,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return <CellNoTaxMoney index={cellProps.index} />
        },
      },
      {
        Header: t('税额'),
        id: 'tax_money',
        hide: globalStore.isLite,
        minWidth: 120,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return <CellTaxMoney index={cellProps.index} />
        },
      },
      {
        Header: t('税率'),
        id: 'tax_rate',
        hide: globalStore.isLite,
        minWidth: 120,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => {
          return <CellTaxRate index={cellProps.index} />
        },
      },
      {
        Header: t('采购备注'),
        accessor: 'remark',
        hide: globalStore.isLite,
        minWidth: 120,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => <CellRemark index={cellProps.index} />,
      },
      {
        Header: t('供应商协作模式'),
        accessor: 'supplier_cooperate_model_type',
        hide: globalStore.isLite,
        minWidth: 120,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => <CellCooperateModel index={cellProps.index} />,
      },
      {
        Header: t('生产日期'),
        accessor: 'manufacture_date',
        hide: globalStore.isLite,
        minWidth: 120,
        isKeyboard: !isCommitted,
        Cell: (cellProps) => <ProductionTimeCell index={cellProps.index} />,
      },
      {
        Header: t('关联采购计划'),
        id: 'description',
        hide: globalStore.isLite,
        minWidth: 160,
        Cell: (cellProps) => <CellCombine index={cellProps.index} />,
      },
    ]
  }, [isCommitted])

  // 当采购员或者供应商 都没有选择的时候才让这个组件不显示
  if (!store.info.supplier && !store.info.purchase) return null

  /**
   * @description 表头显示方法
   * @returns 返回jsx
   */
  const summaryComponent = () => {
    return (
      <Flex alignCenter>
        <div>
          <span className='tw-mr-2' style={{ fontSize: '14px' }}>
            {t('明细列表:')}
          </span>
          <span style={{ color: '#0f0c20', fontWeight: 'bolder' }}>
            {t('商品种类 :')}
          </span>
          &nbsp;
          <span style={{ color: '#75a1ec', fontWeight: 'bolder' }}>
            {store.list.length}
          </span>
        </div>
        <span className='tw-ml-2 tw-mr-2'> | </span>
        <div>
          <span style={{ color: '#0f0c20', fontWeight: 'bolder' }}>
            {t('采购金额（含税）:')}
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
                {t('采购金额（不含税）:')}
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
    // 轻巧版且属于已经提交的状态
    return (
      globalStore.isLite &&
      Boolean(status) && (
        <>
          <Button className='tw-mr-2' onClick={handleExport} type='primary'>
            {t('导出采购单明细')}
          </Button>
          {_.some(
            store?.list,
            (item) =>
              item?.up_relation && item?.up_relation?.relations.length > 0,
          ) ? (
            <Button type='primary' onClick={() => setIsExport(true)}>
              {t('导出代分拣明细')}
            </Button>
          ) : null}
        </>
      )
    )
  }

  /**
   * @description 导出按钮
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

      {/* 导出的组件 */}
      {isExport && (
        <Modal
          width='1000px'
          title={t('请选择导出明细表格类型')}
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
                  label: '显示客户名称',
                },
                {
                  value: '1',
                  label: '显示客户编码',
                },
              ]}
              value={displayCustomerCode}
              onChange={(value) => setDisplayCustomerCode(value)}
              className='gm-margin-right-10'
            />,
            <Button key='confirm' type='primary' onClick={handleOk}>
              {t('导出')}
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
                <p>{t('样式预览(二维表样式)')}</p>
                <Image
                  src={exportDetail}
                  height={300}
                  className='tw-w-full'
                  alt='二维表样式'
                />
              </Radio>
              <Radio
                value={
                  ExportPurchaseOrderType.SUPPLIER_WAIT_SORT_PURCHASE_ORDER
                }
              >
                <p>{t('样式预览(横向展示样式)')}</p>
                <Image
                  src={exportMany}
                  height={300}
                  className='tw-w-full'
                  alt='横向展示样式'
                />
              </Radio>
            </Flex>
          </Radio.Group>
        </Modal>
      )}

      {/* 关联采购入库单 */}
      {location.query.id && relatedList?.length > 0 && (
        <BoxPanel title={t('关联采购入库单')} collapse>
          <Table<StockSheetItem>
            data={relatedList.slice()}
            id='purchase_bills_table'
            columns={[
              {
                Header: '序号',
                id: 'index',
                accessor: (_, index) => index + 1,
                minWidth: 100,
                headerSort: true,
              },
              {
                Header: '采购入库单号',
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
                Header: '供应商',
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
                Header: '采购员',
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
                Header: '状态',
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
