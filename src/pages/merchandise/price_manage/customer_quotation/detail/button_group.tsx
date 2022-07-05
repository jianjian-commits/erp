import React, { useRef } from 'react'
import { Button, Space, Modal, message } from 'antd'
import { t } from 'gm-i18n'
import {
  CopyOutlined,
  StopOutlined,
  DeleteOutlined,
  TransactionOutlined,
  SafetyOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import SvgShare from '@/svg/share2.svg'
import { AssociatedGoodsRef } from './product/associated_goods'
import CopyQuotation from './components/copy_quotation'
import store from './store'
import { gmHistory as history } from '@gm-common/router'
import baseStore from '../store'
import {
  Quotation,
  Quotation_Status,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { DeleteQuotationTip } from '@/pages/merchandise/components/common'
import SyncModal, {
  SyncModalRef,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/components/sync'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import ShareQrcodeModal, {
  Ref as ShareQrcodeModalRef,
} from '../list/components/share_qrcode'
import { GenerateTokenByBusinessId } from 'gm_api/src/oauth'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { RightSideModal } from '@gm-pc/react'
import SidePrintModal from '@/common/components/rightSide_print_template/side_print_modal'
import { openNewTab } from '@/common/util'
const spaceStyle = { marginRight: '16px' }

interface ButtonGroupProps {
  /**
   * 报价单信息
   */
  quotation: Quotation
}

/* 报价单页面的按钮，由于UI改之前是放在一起的，故这次不做区分，还是放在这个文件夹 */
const ButtonGroup: React.VFC<ButtonGroupProps> = (props) => {
  const { quotation } = props

  const {
    inner_name: quotationName,
    quotation_id: quotationId,
    status: quotationStatus,
    type: quotationType,
  } = quotation

  /** 是否为周期报价单 */
  const isPeriodic = quotationType === Quotation_Type.PERIODIC
  /** 是否启用 */
  const isOpen = quotationStatus === Quotation_Status.STATUS_VALID
  /** 需要审核 */
  const shouldAudit = quotationStatus === Quotation_Status.STATUS_WAIT_AUDIT

  /**
   * 通过
   */
  const handlePass = () => {
    Modal.confirm({
      title: t('审核报价单'),
      content: t(`确认要审核通过该报价单吗？`),
      icon: null,
      closable: true,
      onOk() {
        baseStore
          .updateQuotation({
            ...quotation,
            status: Quotation_Status.STATUS_VALID,
          })
          .then(() => {
            message.success(t('操作成功'))
            store.getQuotation(quotationId)
          })
      },
    })
  }

  /**
   * 打印
   */
  const handlePrint = async () => {
    const templates = await ListPrintingTemplate({
      paging: { limit: 999 },
      type: PrintingTemplate_Type.TYPE_QUOTATION,
    }).then((json) => json.response.printing_templates || [])

    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '300px' },
      children: (
        <SidePrintModal
          name='quotation_print'
          onPrint={({ printing_template_id }) => {
            openNewTab(
              `#system/template/print_template/salemenus_template/print?quotation_id=${quotationId}&template_id=${printing_template_id}`,
            )
            RightSideModal.hide()
          }}
          onEdit={(templateId) => {
            openNewTab(
              `#system/template/print_template/salemenus_template/edit?template_id=${templateId}`,
            )
          }}
          templates={templates}
        />
      ),
    })
  }

  /**
   * 分享
   */
  const shareQuotationRef = useRef<ShareQrcodeModalRef | null>(null)
  const handleShare = () => {
    GenerateTokenByBusinessId({
      business_id: quotationId,
    }).then((json) => {
      shareQuotationRef.current &&
        shareQuotationRef.current.handleOpen({
          id: quotationId,
          name: quotationName || '',
          token: json.response.access_token!,
        })
    })
  }

  /**
   * 复制报价单
   */
  const copyQuotationRef = useRef<AssociatedGoodsRef>(null)
  const handleCopy = () => {
    copyQuotationRef.current && copyQuotationRef.current.handleOpen()
  }

  /**
   * 同步
   */
  const SyncRef = useRef<SyncModalRef>(null)
  const handleSync = () => {
    SyncRef.current && SyncRef.current.openModal()
  }

  /**
   * 禁用启用报价单
   */
  const handleOpenOrForbidden = () => {
    const text = isOpen ? t('禁用') : t('启用')
    Modal.confirm({
      title: t(text + '报价单'),
      content: t(`确认要${text}该报价单吗？`),
      onOk() {
        baseStore
          .updateQuotation({
            ...quotation,
            status: isOpen
              ? Quotation_Status.STATUS_WAIT_VALID
              : Quotation_Status.STATUS_VALID,
          })
          .then(() => {
            message.success(t('操作成功'))
            store.getQuotation(quotationId)
          })
      },
    })
  }

  /**
   * 删除报价单
   */
  const handleDelete = () => {
    Modal.confirm({
      title: t('删除报价单'),
      okText: t('删除'),
      okType: 'danger',
      content: <DeleteQuotationTip text={quotationName} />,
      onOk() {
        store.deleteQuotation().then(() => {
          message.success(t('删除成功'))
          history.go(-1)
        })
      },
    })
  }

  return (
    <>
      <Space style={spaceStyle}>
        {!isPeriodic && (
          <>
            <PermissionJudge
              permission={Permission.PERMISSION_MERCHANDISE_AUDIT_QUOTATION}
            >
              {shouldAudit && (
                <Button
                  type='text'
                  icon={<SafetyOutlined />}
                  onClick={handlePass}
                >
                  {t('通过')}
                </Button>
              )}
            </PermissionJudge>
            <Button
              type='text'
              icon={<PrinterOutlined />}
              onClick={handlePrint}
            >
              {t('打印')}
            </Button>
            <Button type='text' icon={<SvgShare />} onClick={handleShare}>
              {t('分享')}
            </Button>
            <PermissionJudge
              permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
            >
              <Button type='text' icon={<CopyOutlined />} onClick={handleCopy}>
                {t('复制')}
              </Button>
              {quotationStatus === Quotation_Status.STATUS_VALID && (
                <Button
                  type='text'
                  icon={<TransactionOutlined />}
                  onClick={handleSync}
                >
                  {t('同步')}
                </Button>
              )}
            </PermissionJudge>
          </>
        )}
        {!shouldAudit && (
          <>
            <PermissionJudge
              permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
            >
              <Button
                type='text'
                icon={isOpen ? <StopOutlined /> : <CheckCircleOutlined />}
                onClick={handleOpenOrForbidden}
              >
                {isOpen ? t('禁用') : t('启用')}
              </Button>
            </PermissionJudge>
          </>
        )}
        <PermissionJudge
          permission={Permission.PERMISSION_MERCHANDISE_DELETE_QUOTATION}
        >
          <Button type='text' onClick={handleDelete} icon={<DeleteOutlined />}>
            {t('删除')}
          </Button>
        </PermissionJudge>
      </Space>

      {!isPeriodic && (
        <>
          {/* 复制报价单 */}
          <CopyQuotation ref={copyQuotationRef} quotationId={quotationId} />
          {/* 同步 */}
          <SyncModal
            ref={SyncRef}
            // 普通报价单不存在父报价单，直接使用自身即可
            parentQuotationId={quotationId}
            quotationId={quotationId}
          />
          <ShareQrcodeModal modalRef={shareQuotationRef} />
        </>
      )}
    </>
  )
}

export default ButtonGroup
