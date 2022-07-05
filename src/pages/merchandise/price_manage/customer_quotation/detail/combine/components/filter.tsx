import React, { FC, useRef } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  Form,
  Select,
  Input,
  Button,
  Space,
  Menu,
  Dropdown,
  Modal,
  message,
} from 'antd'
import { openNewTab } from '@/common/util'
import SvgShare from '@/svg/share2.svg'
import SvgCopy from '@/svg/copy.svg'
import SvgExport from '@/svg/export2.svg'
import SvgSync from '@/svg/sync.svg'
import store from '../store'
import baseStore from '../../store'
import CombineModal from '../bound_modal/combine_modal'
import { DetailModalRef } from '../interface'
import { SHELF_OPTIONS } from '../../../constants'
import {
  ExportBasicPriceV2,
  Quotation_Status,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'
import { DownOutlined } from '@ant-design/icons'
import CycleFilter from '@/pages/merchandise/price_manage/customer_quotation/detail/cycle/components/cycle_filter'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import cycleQuotationStore from '../../cycle/store'
import CopyQuotation, {
  CopyQuotationRef,
} from '../../components/copy_quotation'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { RightSideModal } from '@gm-pc/react'
import SidePrintModal from '@/common/components/rightSide_print_template/side_print_modal'
import { GenerateTokenByBusinessId } from 'gm_api/src/oauth'
import ShareQrcodeModal, {
  Ref as ShareQrcodeModalRef,
} from '../../../list/components/share_qrcode'
import SyncModal, {
  SyncModalRef,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/components/sync'

interface FilterProps {
  type: number
}

const filterStyle = {
  padding: '0 24px 16px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
}

const initialValues = { on_shelf: 0, q: '' }

const Filter: FC<FilterProps> = ({ type }) => {
  const { setFilter, listPriceReqFilter } = store
  const modalRef = useRef<DetailModalRef>(null)

  const { status } = cycleQuotationStore.activeQuotation
  /** 是否为周期报价单 */
  const isPeriodic = type === Quotation_Type.PERIODIC
  /** 需要审核 */
  const shouldAudit = status === Quotation_Status.STATUS_WAIT_AUDIT

  const [form] = Form.useForm()

  /*
   * 关联组合商品
   */
  const handleAssociatedCombine = () => {
    modalRef.current && modalRef.current.openModal()
  }

  const handleSearch = () => {
    const value = form.getFieldsValue()
    store.setCombineListSelectedRowKeys([])
    store.setCombineListSelectedRows([])
    setFilter({ ...value })
  }

  /** 导出组合商品 */
  const handleExport = () => {
    ExportBasicPriceV2({
      list_basic_price_v2_request: {
        ...listPriceReqFilter,
        paging: { limit: 1000 },
      },
    }).then((res) => {
      globalStore.showTaskPanel()
    })
  }

  /** 分享 */
  const shareQuotationRef = useRef<ShareQrcodeModalRef | null>(null)
  const handleShare = () => {
    GenerateTokenByBusinessId({
      business_id: cycleQuotationStore.activeQuotationId,
    }).then((json) => {
      shareQuotationRef.current &&
        shareQuotationRef.current.handleOpen({
          id: cycleQuotationStore.activeQuotationId,
          name: cycleQuotationStore.activeQuotation.inner_name || '',
          token: json.response.access_token!,
        })
    })
  }

  /** 复制 */
  const copyQuotationRef = useRef<CopyQuotationRef | null>(null)
  const handleCopy = () => {
    copyQuotationRef.current && copyQuotationRef.current.handleOpen()
  }

  /** 通过（审核） */
  const handlePass = () => {
    Modal.confirm({
      title: t('审核报价单'),
      content: t(`确认要审核通过该报价单吗？`),
      icon: null,
      closable: true,
      onOk() {
        cycleQuotationStore
          .enableQuotation(cycleQuotationStore.activeQuotationId)
          .then(() => {
            message.success(t('操作成功'))
          })
      },
    })
  }

  /** 打印 */
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
              `#system/template/print_template/salemenus_template/print?quotation_id=${cycleQuotationStore.activeQuotationId}&template_id=${printing_template_id}`,
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
   * 同步
   */
  const syncRef = useRef<SyncModalRef>(null)
  const handleSync = () => {
    syncRef.current && syncRef.current.openModal()
  }

  /** 更多操作 */
  const moreOperation = (
    <Menu className='tw-text-center tw-p-0'>
      <Menu.Item style={{ minHeight: 44 }} onClick={handleShare}>
        <Space size={6}>
          <SvgShare className='gm-text-16' />
          {t('分享')}
        </Space>
      </Menu.Item>
      <Menu.Item
        style={{ minHeight: 44 }}
        disabled={
          !globalStore.hasPermission(
            Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
          )
        }
        onClick={handleCopy}
      >
        <Space size={6}>
          <SvgCopy className='gm-text-16' />
          {t('复制')}
        </Space>
      </Menu.Item>
      <Menu.Item style={{ minHeight: 44 }} onClick={handleExport}>
        <Space size={6}>
          <SvgExport className='gm-text-16' />
          {t('导出')}
        </Space>
      </Menu.Item>
      {(status === Quotation_Status.STATUS_AVAILABLE ||
        status === Quotation_Status.STATUS_EXPIRED) && (
        <PermissionJudge
          permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
        >
          <Menu.Item
            style={{ minHeight: 44 }}
            disabled={
              !globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
              )
            }
            onClick={handleSync}
          >
            <Space size={6}>
              <SvgSync className='gm-text-16' />
              {t('同步')}
            </Space>
          </Menu.Item>
        </PermissionJudge>
      )}
    </Menu>
  )

  return (
    <>
      <div style={filterStyle}>
        <Space size={16}>
          {isPeriodic && (
            /** 周期报价单商品类型筛选 */
            <CycleFilter />
          )}
          <Form
            form={form}
            name='merchandise-manage-sale'
            layout='inline'
            initialValues={initialValues}
          >
            <Form.Item name='on_shelf'>
              <Select
                placeholder={t('请选择')}
                options={SHELF_OPTIONS}
                style={{ minWidth: 100 }}
                onChange={handleSearch}
              />
            </Form.Item>
            <Form.Item name='q'>
              <Input.Search
                loading={store.loading}
                placeholder={t('请输入组合商品名称/编码')}
                style={{ minWidth: 120 }}
                enterButton={t('搜索')}
                onSearch={handleSearch}
              />
            </Form.Item>
          </Form>
        </Space>
        <Space>
          {type === 1 ? (
            <Button className='tw-mr-2' onClick={handleExport}>
              {t('导出')}
            </Button>
          ) : (
            <>
              <Dropdown overlay={moreOperation} trigger={['click']}>
                <Button>
                  {t('更多操作')}
                  <DownOutlined />
                </Button>
              </Dropdown>
              {shouldAudit && (
                <PermissionJudge
                  permission={Permission.PERMISSION_MERCHANDISE_AUDIT_QUOTATION}
                >
                  <Button onClick={handlePass}>{t('通过')}</Button>
                </PermissionJudge>
              )}
              <Button onClick={handlePrint}>{t('打印')}</Button>
            </>
          )}
          <PermissionJudge
            permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
          >
            <Button type='primary' onClick={handleAssociatedCombine}>
              {t('关联组合商品')}
            </Button>
          </PermissionJudge>
        </Space>
      </div>
      <CombineModal ref={modalRef} title={t('关联组合商品')} />
      <CopyQuotation
        ref={copyQuotationRef}
        quotationId={cycleQuotationStore.activeQuotationId}
      />
      {/* 同步 */}
      <SyncModal
        ref={syncRef}
        parentQuotationId={baseStore.currentQuotationId}
        quotationId={cycleQuotationStore.activeQuotationId}
      />
      <ShareQrcodeModal modalRef={shareQuotationRef} />
    </>
  )
}

export default observer(Filter)
