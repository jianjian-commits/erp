import React, { FC, useMemo } from 'react'

import { t } from 'gm-i18n'
import {
  Price,
  Flex,
  Input,
  Button,
  Modal,
  FunctionSet,
  Delete,
  Tip,
  RightSideModal,
} from '@gm-pc/react'

import _ from 'lodash'

import { Observer, observer } from 'mobx-react'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import store from '../store'
import {
  getEnumText,
  getFormatTimeForTable,
  openNewTab,
  toFixedByType,
} from '@/common/util'

import { getSettleActionableList, receiptTypeTag } from '../../../util'
import SupplierDeletedSign from '@/common/components/icon/supplier_deleted_sign'
import MarkPaidModal, { MarkPaidData } from './mark_paid_modal'
import { PaidReceiptDetail } from '../interface'
import {
  SettleSheet_SheetStatus,
  ExportSettleSheetDetail,
} from 'gm_api/src/finance'
import PrintModal from '../../components/print_modal'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { SETTLE_SHEET_STATUS } from '../../../enum'
import globalStore from '@/stores/global'
import Big from 'big.js'

const TextShow: FC<{
  field: keyof PaidReceiptDetail
  price?: boolean
}> = observer((props) => {
  const { receiptDetail, totalDiscount, shouldPay } = store
  const { supplier_delete_time, supplier_name, sheet_status, settle_time } =
    receiptDetail
  switch (props.field) {
    case 'sheet_status':
      return (
        <span>{getEnumText(SETTLE_SHEET_STATUS, sheet_status!, 'value')}</span>
      )

    case 'supplier_name':
      return (
        <Flex>
          {supplier_delete_time !== '0' && <SupplierDeletedSign />}
          {supplier_name}
        </Flex>
      )

    case 'settle_time':
      return (
        <span>{getFormatTimeForTable('YYYY-MM-DD HH:mm', settle_time)}</span>
      )
    case 'delta_amount':
      return (
        <span>
          <Price
            value={totalDiscount}
            precision={globalStore.dpSupplierSettle}
          />
        </span>
      )
    case 'should_amount':
      return (
        <span>
          <Price value={shouldPay} precision={globalStore.dpSupplierSettle} />
        </span>
      )
    default:
      return props.price ? (
        <Price
          value={(receiptDetail[props.field] as any) ?? 0}
          precision={globalStore.dpSupplierSettle}
        />
      ) : (
        <span>{receiptDetail[props.field] ?? '-'}</span>
      )
  }
})

const renderTotal = () => {
  return [
    {
      text: t('应付金额'),
      value: <TextShow field='should_amount' price />,
    },
    {
      text: t('已付金额'),
      value: <TextShow field='actual_amount' price />,
    },
    {
      text: t('单据总金额'),
      value: <TextShow field='total_price' price />,
    },
    {
      text: t('折让总金额'),
      value: <TextShow field='delta_amount' price />,
    },
  ]
}

const renderHeaderInfo = () => {
  return [
    {
      label: t('结款单号'),
      item: (
        <Observer>
          {() => {
            const { settle_sheet_serial_no } = store.receiptDetail
            return (
              <div style={{ width: '280px' }}>
                {settle_sheet_serial_no || '-'}
              </div>
            )
          }}
        </Observer>
      ),
    },
  ]
}

const Remark = observer(() => {
  const { abstract, sheet_status } = store.receiptDetail
  const handleChangeRemark = (e: any) => {
    store.changeReceiptDetail('abstract', e.target.value)
  }

  const canEdit = [
    SettleSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED,
    SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED,
  ]

  return canEdit.includes(sheet_status!) ? (
    <Input type='text' value={abstract || ''} onChange={handleChangeRemark} />
  ) : (
    <span>{abstract || '-'}</span>
  )
})

const renderContentInfo = (status: any) => {
  return [
    {
      label: t('供应商名称'),
      item: <TextShow field='supplier_name' />,
    },
    {
      label: t('供应商编号'),
      item: <TextShow field='supplier_customized_code' />,
    },
    {
      label: t('结款单状态'),
      item: <TextShow field='sheet_status' />,
      tag: receiptTypeTag(status),
    },

    {
      label: t('结款日期'),
      item: <TextShow field='settle_time' />,
    },
    {
      label: t('结款单摘要'),
      item: <Remark />,
    },
  ]
}

const Action = observer(() => {
  const { sheet_status, settle_sheet_id, should_amount } = store.receiptDetail

  const canActionableList = getSettleActionableList(sheet_status!)

  const handleEnsureSettle = (data: MarkPaidData) => {
    if (
      Big(data.money ?? 0).gt(
        toFixedByType(+(should_amount ?? 0), 'dpSupplierSettle'),
      )
    ) {
      Tip.danger(t('结款金额不能大于应付金额'))
      throw new Error(t('结款金额不能大于应付金额'))
    } else {
      return store.doSomeAndGetDetail(() => {
        return store.signSettle(data)
      })
    }
  }

  const handleMark = () => {
    Modal.render({
      children: <MarkPaidModal onEnsure={handleEnsureSettle} />,
      title: t('结款'),
      onHide: Modal.hide,
    })
  }

  const handleSubmit = () => {
    store.doSomeAndGetDetail(() => {
      return store
        .updatePaidReceipt(
          SettleSheet_SheetStatus.SHEET_STATUS_SUBMITTED_NOT_PAID,
        )
        .then(() => {
          Tip.success(t('提交结款单成功！'))
          return null
        })
    })
  }

  const handleSaveDraft = () => {
    // const isNotApproved =
    //   sheet_status === SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED
    // const changeStatus = isNotApproved
    //   ? SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED
    //   : SettleSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED
    store.doSomeAndGetDetail(() => {
      return store
        .updatePaidReceipt(SettleSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED)
        .then(() => {
          Tip.success(t('保存草稿成功！'))
          return null
        })
    })
  }

  const handlePrint = () => {
    const req = {
      settle_sheet_id,
    }
    return ListPrintingTemplate({
      paging: { limit: 999 },
      type: PrintingTemplate_Type.TYPE_SETTLEMENT,
    }).then((json) => {
      RightSideModal.render({
        onHide: RightSideModal.hide,
        style: { width: '300px' },
        children: (
          <PrintModal
            name='produce_stock_out_print'
            onPrint={({ printing_template_id }: any) => {
              const settle_sheet_req = JSON.stringify(req)
              openNewTab(
                `#system/template/print_template/supplier_settle_template/print?tpl_id=${printing_template_id}&settle_sheet_req=${settle_sheet_req}`,
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

  const handleExportTable = () => {
    const req = {
      settle_sheet_id,
    }
    return ExportSettleSheetDetail(req).then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  // const handleExport = () => {
  //   window.open('/stock/settle_sheet/export?id=' + settle_sheet_id)
  // }

  const handleRefuse = () => {
    store.doSomeAndGetDetail(() => {
      return store
        .updatePaidReceipt(SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED)
        .then(() => {
          Tip.success(t('审核不通过成功！'))
          return null
        })
    })
  }

  const handleBlaze = () => {
    store.doSomeAndGetDetail(() => {
      return store
        .updatePaidReceipt(
          SettleSheet_SheetStatus.SHEET_STATUS_SUBMITTED_NOT_PAID,
        )
        .then(() => {
          Tip.success(t('冲账成功！'))
          return null
        })
    })
  }

  const handleDel = () => {
    Delete({
      children: t('是否删除此单据?'),
      title: t('确认删除'),
    }).then(() => {
      // eslint-disable-next-line promise/no-nesting
      store.doSomeAndGetDetail(() => {
        // eslint-disable-next-line promise/no-nesting
        return store
          .updatePaidReceipt(SettleSheet_SheetStatus.SHEET_STATUS_DELETED)
          .then(() => {
            Tip.success(t('删除结款单成功！'))
            return null
          })
      })

      return null
    })
  }

  return (
    <>
      {canActionableList.includes('submit') && (
        <Button
          type='primary'
          className='gm-margin-right-5 gm-margin-tb-5'
          onClick={handleSubmit}
        >
          {t('提交结款单')}
        </Button>
      )}

      {canActionableList.includes('signSettle') && (
        <Button
          type='primary'
          className='gm-margin-right-5 gm-margin-tb-5'
          onClick={handleMark}
        >
          {t('结款')}
        </Button>
      )}

      <FunctionSet
        right
        data={[
          {
            text: t('保存草稿'),
            onClick: handleSaveDraft,
            show: canActionableList.includes('saveCraft'),
          },
          {
            text: t('打印结款单'),
            onClick: handlePrint,
            show: canActionableList.includes('print'),
          },
          {
            text: t('导出对账单'),
            onClick: handleExportTable,
            show: true,
          },
          // {
          //   text: t('导出结款单'),
          //   onClick: handleExport,
          //   show: canActionableList.includes('export'),
          // },
          {
            text: t('审核不通过'),
            onClick: handleRefuse,
            show: canActionableList.includes('notApproved'),
          },
          {
            text: t('冲账'),
            onClick: handleBlaze,
            show: canActionableList.includes('blaze'),
          },
          {
            text: t('删除'),
            onClick: handleDel,
            show: canActionableList.includes('delete'),
          },
        ]}
      />
    </>
  )
})

const Header = observer(() => {
  const { sheet_status } = store.receiptDetail
  const headerInfo = useMemo(() => {
    return renderHeaderInfo()
  }, [])

  const total = useMemo(() => {
    return renderTotal()
  }, [])

  const content = useMemo(() => {
    return renderContentInfo(sheet_status)
  }, [sheet_status])

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={65}
      HeaderInfo={headerInfo}
      HeaderAction={<Action />}
      ContentInfo={content}
      totalData={total}
    />
  )
})

export default Header
