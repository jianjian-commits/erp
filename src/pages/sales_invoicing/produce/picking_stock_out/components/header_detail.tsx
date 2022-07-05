import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  Price,
  DatePicker,
  FunctionSet,
  Flex,
  Input,
  Modal,
  RightSideModal,
  LevelSelect,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import moment from 'moment'
import _ from 'lodash'

import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { Select_Warehouse } from 'gm_api/src/inventory/pc'
import { Permission } from 'gm_api/src/enterprise'

import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import { history } from '@/common/service'
import PermissionJudge from '@/common/components/permission_judge'
import {
  getDateByTimestamp,
  getFormatTimeForTable,
  getTimestamp,
  openNewTab,
  getUnNillText,
} from '@/common/util'
import {
  getMinStockTime,
  getReceiptActionableList,
  getProcessName,
} from '@/pages/sales_invoicing/util'
import { PrintModal } from '@/pages/sales_invoicing/components'
import {
  RECEIPT_STATUS_TAG,
  STOCK_OUT_RECEIPT_STATUS_NAME,
} from '../../../enum'
import { Select_MaterialOrder } from 'gm_api/src/production/pc'
import globalStore from '@/stores/global'
import { DetailStore } from '../stores/index'
import sale_store from '../../../store'

interface HeaderProps {
  type: 'add' | 'detail'
}

const HeaderAction: FC<HeaderProps> = observer(({ type }) => {
  const {
    receiptLoading,
    receiptDetail,
    updateAndGetReceipt,
    changeReceiptLoading,
    createReceipt,
    sheet_type,
  } = DetailStore

  const { sheet_status, material_out_stock_sheet_id } = receiptDetail

  const isAdd = type === 'add'

  const currentActionList = getReceiptActionableList(
    sheet_status,
    'materialOut',
  )

  // 打印
  const handlePrint = () => {
    return ListPrintingTemplate({
      paging: { limit: 999 },
      type: PrintingTemplate_Type.TYPE_OUT_STOCK,
    }).then((json) => {
      RightSideModal.render({
        onHide: RightSideModal.hide,
        style: { width: '300px' },
        children: (
          <PrintModal
            name='produce_stock_out_print'
            onPrint={({ printing_template_id }: any) => {
              const stock_sheet_req = JSON.stringify({
                sheet_ids: [material_out_stock_sheet_id],
                stock_sheet_type: sheet_type,
              })
              openNewTab(
                `#system/template/print_template/stock_out_template/print?tpl_id=${printing_template_id}&stock_sheet_req=${stock_sheet_req}`,
              )
              RightSideModal.hide()
            }}
            templates={json.response.printing_templates}
          />
        ),
      })
      return json
    })
  }

  // 删除单据
  const handleDelete = () => {
    Modal.render({
      children: (
        <div>
          <span>{t('是否删除此单据？')}</span>
          <div className='gm-gap-10' />
          <Flex justifyEnd>
            <Button
              onClick={() => {
                Modal.hide()
              }}
            >
              {t('取消')}
            </Button>
            <div className='gm-gap-5' />
            <Button
              type='danger'
              onClick={() => {
                return updateAndGetReceipt('deleted').then(() => {
                  Modal.hide()
                  return null
                })
              }}
            >
              {t('删除')}
            </Button>
          </Flex>
        </div>
      ),
      style: { width: '300px' },
      title: t('删除单据'),
    })
  }

  // 保存草稿
  const handleSaveDraft = () => {
    if (material_out_stock_sheet_id) {
      updateAndGetReceipt('toBeSubmitted')
    } else {
      changeReceiptLoading(true)
      createReceipt('toBeSubmitted')
        .then((json) => {
          changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/produce/picking_stock_out/detail?sheet_id=${
              json.response.stock_sheet!.material_out_stock_sheet_id
            }`,
          )
          return null
        })
        .catch(() => changeReceiptLoading(false))
    }
  }

  // 提交
  const handleSubmit = () => {
    if (material_out_stock_sheet_id) {
      updateAndGetReceipt('submitted')
    } else {
      changeReceiptLoading(true)
      // 创建领料出库单据
      createReceipt('submitted')
        .then((json) => {
          changeReceiptLoading(false)
          history.push(
            `/sales_invoicing/produce/picking_stock_out/detail?sheet_id=${
              json.response.stock_sheet!.material_out_stock_sheet_id
            }`,
          )
          return null
        })
        .catch(() => changeReceiptLoading(false))
    }
  }

  // 驳回
  const handleNotApproved = () => updateAndGetReceipt('notApproved')

  // 反审核
  const handleCancelApproved = () => updateAndGetReceipt('cancelApproval')

  // 审核出库
  const handleApproved = () => updateAndGetReceipt('approved')

  const canCancelApproval =
    currentActionList.includes('cancelApproval') && !isAdd

  return (
    <>
      {currentActionList.includes('submitted') && (
        <PermissionJudge
          permission={Permission.PERMISSION_INVENTORY_SUBMIT_MATERIAL_OUT}
        >
          <Button
            type='primary'
            className='gm-margin-right-5'
            onClick={handleSubmit}
            disabled={receiptLoading}
          >
            {t('提交')}
          </Button>
        </PermissionJudge>
      )}
      {currentActionList.includes('approved') && (
        <PermissionJudge
          permission={Permission.PERMISSION_INVENTORY_APPROVE_MATERIAL_OUT}
        >
          <Button
            type='primary'
            className='gm-margin-right-5'
            onClick={handleApproved}
            disabled={receiptLoading}
          >
            {t('审核出库')}
          </Button>
        </PermissionJudge>
      )}
      {sheet_status === -1 && currentActionList.includes('toBeSubmitted') && (
        <PermissionJudge
          permission={Permission.PERMISSION_INVENTORY_UPDATE_MATERIAL_OUT}
        >
          <div className='gm-gap-10' />
          <Button
            plain
            className='gm-margin-right-5'
            onClick={handleSaveDraft}
            disabled={receiptLoading}
          >
            {t('保存草稿')}
          </Button>
        </PermissionJudge>
      )}

      {sheet_status !== -1 && (
        <FunctionSet
          right
          data={_.without(
            [
              {
                text: t('保存草稿'),
                onClick: handleSaveDraft,
                show: currentActionList.includes('toBeSubmitted'),
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_NOT_APPROVE_MATERIAL_OUT,
              ) && {
                text: t('驳回'),
                onClick: handleNotApproved,
                show: currentActionList.includes('notApproved') && !isAdd,
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_CANCEL_APPROVE_MATERIAL_OUT,
              ) && {
                text: t('反审核'),
                onClick: handleCancelApproved,
                show: canCancelApproval,
              },
              {
                text: t('打印单据'),
                onClick: handlePrint,
                show: currentActionList.includes('print'),
              },
              globalStore.hasPermission(
                Permission.PERMISSION_INVENTORY_DELETE_MATERIAL_OUT,
              ) && {
                text: t('删除单据'),
                onClick: handleDelete,
                show: currentActionList.includes('deleted'),
              },
            ],
            false,
          )}
        />
      )}
    </>
  )
})

const WarehouseName: FC<HeaderProps> = observer(({ type }) => {
  const {
    receiptDetail: { warehouse_id, warehouse_name },
    changeReceiptDetail,
    clearProductList,
  } = DetailStore

  return type === 'add' ? (
    <Select_Warehouse
      value={warehouse_id}
      style={{
        maxWidth: '160px',
      }}
      onChange={(selected) => {
        changeReceiptDetail('warehouse_id', selected)
        clearProductList()
      }}
      placeholder={t('请选择仓库')}
    />
  ) : (
    <span>{getUnNillText(warehouse_name)}</span>
  )
})

/** 出库时间 */
const StockOutTime: FC<HeaderProps> = observer(({ type }) => {
  const { receiptDetail, changeReceiptDetail } = DetailStore
  const { out_stock_time } = receiptDetail
  const { getPeriodList, period_list } = sale_store
  const data = { paging: { limit: 999 } }

  useEffect(() => {
    getPeriodList(data)
  }, [])

  const handleChangeDate = (selected: Date) =>
    changeReceiptDetail('out_stock_time', getTimestamp(selected))

  return (
    <>
      {type === 'add' ? (
        <DatePicker
          date={getDateByTimestamp(
            out_stock_time === '0' ? undefined : out_stock_time,
          )}
          onChange={handleChangeDate}
          enabledTimeSelect
          min={new Date(Number(period_list[0]?.end_time)) || getMinStockTime()}
          max={new Date()}
          timeLimit={{
            disabledSpan: (time) => {
              return moment(time).isAfter(moment())
            },
          }}
        />
      ) : (
        <div className='b-stock-in-content'>
          {getFormatTimeForTable('YYYY-MM-DD HH:mm', out_stock_time)}
        </div>
      )}
    </>
  )
})

/** 备注 */
const Remark: FC<HeaderProps> = observer(({ type }) => {
  const {
    receiptDetail: { remark },
    changeReceiptDetail,
  } = DetailStore

  const handleListRemarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    changeReceiptDetail('remark', value)
  }

  return type === 'add' ? (
    <Input
      type='text'
      value={remark || ''}
      className='form-control'
      maxLength={50}
      style={{ width: '400px' }}
      onChange={handleListRemarkChange}
    />
  ) : (
    <div style={{ width: '400px' }} className='b-stock-in-content'>
      {remark}
    </div>
  )
})

const HeaderDetail: FC<HeaderProps> = observer(({ type }) => {
  const { receiptDetail, processors, changeReceiptAllDetail } = DetailStore

  const renderHeaderInfo = () => {
    const {
      material_out_stock_sheet_serial_no,
      processor_ids,
      processor_name,
      material_order_id,
      material_order_serial_no,
    } = DetailStore.receiptDetail
    return [
      {
        label: t('领料出库单号'),
        item: (
          <div style={{ width: '380px' }}>
            {material_out_stock_sheet_serial_no ?? '-'}
          </div>
        ),
      },
      {
        label: t('关联领料单'),
        item:
          type === 'add' ? (
            <Select_MaterialOrder
              style={{ width: '150px' }}
              value={material_order_id}
              onChange={(value: string) => {
                DetailStore.changeReceiptDetail('material_order_id', value)
              }}
              getResponseData={DetailStore.getMaterialOrder}
              getName={(item) => item?.serial_no || '-'}
              placeholder={t('请选择领料单')}
            />
          ) : (
            <div style={{ width: '380px' }}>
              {material_order_serial_no || '-'}
            </div>
          ),
      },
      {
        label: t('领用部门'),
        item:
          type === 'add' ? (
            <LevelSelect
              style={{ width: '150px' }}
              selected={processor_ids}
              placeholder={t('请选择领用部门')}
              data={processors.slice()}
              onSelect={(value) =>
                changeReceiptAllDetail(
                  Object.assign(receiptDetail, {
                    processor_ids: value,
                    processor_name: getProcessName(
                      DetailStore.processorsList,
                      value,
                    ),
                  }),
                )
              }
            />
          ) : (
            <div>{processor_name || t('未指定')}</div>
          ),
      },
    ]
  }

  const renderContentInfo = (type: 'add' | 'detail') => {
    const { sheet_status, creator_name, create_time } =
      DetailStore.receiptDetail
    return [
      {
        label: t('选择仓库'),
        item: <WarehouseName type={type} />,
        required: true,
        hide: !globalStore.isOpenMultWarehouse,
      },
      {
        label: t('建单时间'),
        item: getFormatTimeForTable('YYYY-MM-DD HH:mm', create_time),
      },
      {
        label: t('出库时间'),
        item: <StockOutTime type={type} />,
      },
      {
        label: t('单据状态'),
        item: STOCK_OUT_RECEIPT_STATUS_NAME[sheet_status],
        tag: RECEIPT_STATUS_TAG[sheet_status],
      },
      {
        label: t('建单人'),
        item: creator_name || '-',
      },
      {
        label: t('备注'),
        item: <Remark type={type} />,
      },
    ]
  }

  const renderTotalData = () => {
    // 商品总金额
    const { totalPrice } = DetailStore

    return [
      {
        text: t('出库成本'),
        value: (
          <Price
            value={totalPrice ?? 0}
            precision={globalStore.dpInventoryAmount}
          />
        ),
        left: false,
      },
    ]
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={90}
      contentCol={5}
      customerContentColWidth={[260, 260, 260, 260, 490]}
      HeaderInfo={renderHeaderInfo()}
      HeaderAction={<HeaderAction type={type} />}
      ContentInfo={renderContentInfo(type)}
      totalData={renderTotalData()}
    />
  )
})

export default HeaderDetail
