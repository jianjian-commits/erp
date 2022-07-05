import { t } from 'gm-i18n'
import React, { useMemo } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import {
  Price,
  Flex,
  Button,
  Modal,
  Tip,
  Input,
  FunctionSet,
  Delete,
} from '@gm-pc/react'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import moment from 'moment'
import { SettleSheet_SheetStatus } from 'gm_api/src/finance'
import SettlementModal, { SettlementData } from './settlement_modal'
import { SETTLE_SHEET_STATUS } from '../../view_statement/enum'
import { CreditTypeMap } from '../../../enum'
import { receiptTypeTag, getSettleActionableList } from '../../../utils'
import IndexStore from '../../view_statement/store'

const Action = observer(() => {
  const { settle_sheet } = store

  const canActionableList = getSettleActionableList(settle_sheet.sheet_status!)

  const handleSettlement = () => {
    const handleSave = (data: SettlementData) => {
      return store.doSomeAndGetDetail(() => {
        return store.paySettle(data)
      })
    }
    const handleCancel = () => {
      Modal.hide()
    }
    Modal.render({
      children: (
        <SettlementModal
          serial_no={settle_sheet.settle_sheet_serial_no!}
          company={settle_sheet.company!}
          need_amount={settle_sheet.need_amount!}
          target_id={settle_sheet.target_id!}
          onCancel={handleCancel}
          onOk={handleSave}
        />
      ),
      size: 'md',
      title: t('商户结款'),
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
          Tip.success(t('提交对账单成功！'))
          return null
        })
    })
  }

  const handleSaveDraft = () => {
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
    const URL = `#/financial_manage/merchant_settlement/merchant_settlement/print`
    window.open(`${URL}?settle_sheet_id=${settle_sheet?.settle_sheet_id!}`)
  }

  const handleExport = () => {
    IndexStore.exportList(settle_sheet?.settle_sheet_id!)
  }

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

  const handleDel = () => {
    Delete({
      children: t('是否删除此对账单?'),
      title: t('确认删除'),
    }).then(() => {
      // eslint-disable-next-line promise/no-nesting
      store.doSomeAndGetDetail(() => {
        // eslint-disable-next-line promise/no-nesting
        return store
          .updatePaidReceipt(SettleSheet_SheetStatus.SHEET_STATUS_DELETED)
          .then(() => {
            Tip.success(t('删除对账单成功！'))
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
          onClick={handleSettlement}
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
            text: t('打印对账单'),
            onClick: handlePrint,
            show: canActionableList.includes('print'),
          },
          {
            text: t('导出对账单'),
            onClick: handleExport,
            show: canActionableList.includes('export'),
          },
          {
            text: t('审核不通过'),
            onClick: handleRefuse,
            show: canActionableList.includes('notApproved'),
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

const Remark = observer(() => {
  const { abstract, sheet_status } = store.settle_sheet
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

const Header = observer(() => {
  const { settle_sheet } = store

  // const handleSettlement = () => {
  //   const handleSave = () => {
  //     store.paySettle()
  //   }
  //   const handleCancel = () => {
  //     Modal.hide()
  //   }
  //   Modal.render({
  //     children: (
  //       <SettlementModal
  //         serial_no={settle_sheet.settle_sheet_serial_no!}
  //         company={settle_sheet.company!}
  //         need_amount={settle_sheet.need_amount!}
  //         target_id={settle_sheet.target_id!}
  //         onCancel={handleCancel}
  //         onOk={handleSave}
  //       />
  //     ),
  //     size: 'md',
  //     title: t('商户结算'),
  //     onHide: Modal.hide,
  //   })
  // }

  const contentInfo = (status: any) => {
    return [
      {
        label: t('公司名'),
        item: <span>{settle_sheet.company! || '-'}</span>,
      },
      {
        label: t('建单时间'),
        item: (
          <span>
            {moment(new Date(+settle_sheet.create_time!)).format(
              'YYYY-MM-DD HH:mm:ss',
            )}
          </span>
        ),
      },
      {
        label: t('结款周期'),
        item: <span>{CreditTypeMap[settle_sheet.credit_type!] || '-'}</span>,
      },
      {
        label: t('状态'),
        item: (
          <span>{SETTLE_SHEET_STATUS[settle_sheet.sheet_status!] || '-'}</span>
        ),
        tag: receiptTypeTag(status),
      },
      {
        label: t('备注'),
        item: <Remark />,
      },
    ]
  }

  const content = useMemo(() => {
    return contentInfo(settle_sheet.sheet_status!)
  }, [settle_sheet.sheet_status!])

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={80}
      contentCol={4}
      customerContentColWidth={[350, 350, 350, 350]}
      totalData={[
        {
          text: t('对账单总金额'),
          value: <Price value={+settle_sheet.total_price! || 0} />,
        },
        {
          text: t('已结款金额'),
          value: <Price value={+settle_sheet.actual_amount! || 0} />,
        },
        {
          text: t('待结款金额'),
          value: <Price value={+settle_sheet.need_amount! || 0} />,
        },
      ]}
      HeaderInfo={[
        {
          label: t('对账单号'),
          item: <Flex>{settle_sheet.settle_sheet_serial_no! || '-'}</Flex>,
        },
      ]}
      HeaderAction={<Action />}
      ContentInfo={content}
    />
  )
})

export default Header
