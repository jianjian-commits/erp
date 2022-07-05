import React, { FC, useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import {
  Form,
  Select,
  Input,
  Button,
  Space,
  Cascader,
  Menu,
  Dropdown,
  Modal,
  message,
} from 'antd'
import { gmHistory as history } from '@gm-common/router'
import store, { FilterType } from './store'
import cycleQuotationStore from '../cycle/store'
import CopyQuotation, { CopyQuotationRef } from '../components/copy_quotation'
import { SHELF_OPTIONS } from '../../constants'
import AssociatedGoods, { AssociatedGoodsRef } from './associated_goods'
import { formatCascaderData, openNewTab } from '@/common/util'
import './style.less'
import {
  ExportBasicPriceV2,
  Quotation_Status,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'
import baseStore from '../store'
import { DownOutlined } from '@ant-design/icons'
import SvgShare from '@/svg/share2.svg'
import SvgCopy from '@/svg/copy.svg'
import SvgImport from '@/svg/import.svg'
import SvgExport from '@/svg/export2.svg'
import SvgSync from '@/svg/sync.svg'
import CycleFilter from '@/pages/merchandise/price_manage/customer_quotation/detail/cycle/components/cycle_filter'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { RightSideModal } from '@gm-pc/react'
import SidePrintModal from '@/common/components/rightSide_print_template/side_print_modal'
import { GenerateTokenByBusinessId } from 'gm_api/src/oauth'
import ShareQrcodeModal, {
  Ref as ShareQrcodeModalRef,
} from '../../list/components/share_qrcode'
import SyncModal, {
  SyncModalRef,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/components/sync'

interface FilterProps {
  type: number
  quotationId: string
}

const filterStyle = {
  padding: '0 24px 16px 24px',
  borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
  display: 'flex',
  justifyContent: 'space-between',
}

const initialValues = { on_shelf: 0, q: '', category_id: ['00'] }

const Filter: FC<FilterProps> = ({ type, quotationId }) => {
  const { setFilter, treeData, listPriceReqFilter } = store
  const { status } = cycleQuotationStore.activeQuotation

  useEffect(() => {
    form.setFieldsValue({ category_id: ['00'], on_shelf: 0, q: '' })
  }, [quotationId])

  /** 是否为周期报价单 */
  const isPeriodic = type === Quotation_Type.PERIODIC
  /** 需要审核 */
  const shouldAudit = status === Quotation_Status.STATUS_WAIT_AUDIT

  const modalRef = useRef<AssociatedGoodsRef>(null)

  const [form] = Form.useForm()

  const handleAssociatedGoods = () => {
    modalRef.current && modalRef.current.handleOpen()
  }

  const handleSearch = async () => {
    const value = form.getFieldsValue()
    console.log('value', value)
    const { category_id } = value
    await setFilter({
      ...value,
      category_id: category_id[category_id.length - 1] || '',
    })
    dispatchEvent(
      new CustomEvent(
        'force_update|merchandise/price_manage/customer_quotation/components/reference_price_map/index.tsx',
      ),
    )
  }

  const handleImport = () => {
    history.push(
      `/merchandise/price_manage/customer_quotation/import?quotation_id=${baseStore.quotation_id}`,
    )
  }

  const handleExport = () => {
    ExportBasicPriceV2({
      list_basic_price_v2_request: {
        ...listPriceReqFilter,
        paging: { limit: 1000 },
      },
    }).then(() => {
      globalStore.showTaskPanel()
    })
  }

  const shareQuotationRef = useRef<ShareQrcodeModalRef | null>(null)
  /** 分享 */
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

  const copyQuotationRef = useRef<CopyQuotationRef | null>(null)
  /** 复制 */
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
            baseStore.getQuotationRequest(baseStore.parentQuotationId)
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
      <Menu.Item key='share' style={{ minHeight: 44 }} onClick={handleShare}>
        <Space size={6}>
          <SvgShare className='gm-text-16' />
          {t('分享')}
        </Space>
      </Menu.Item>
      <Menu.Item
        key='copy'
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
      <Menu.Item
        key='import'
        style={{ minHeight: 44 }}
        disabled={
          !globalStore.hasPermission(
            Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
          )
        }
        onClick={handleImport}
      >
        <Space size={6}>
          <SvgImport className='gm-text-16' />
          {t('导入')}
        </Space>
      </Menu.Item>
      <Menu.Item key='export' style={{ minHeight: 44 }} onClick={handleExport}>
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
            key='sync'
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
          <Form<FilterType>
            form={form}
            name='merchandise-manage-sale'
            layout='inline'
            onFinish={handleSearch}
            initialValues={initialValues}
          >
            <Form.Item name='category_id'>
              <Cascader
                style={{ width: '200px' }}
                expandTrigger='hover'
                changeOnSelect
                allowClear={false}
                options={[
                  {
                    label: '全部分类',
                    value: '00',
                  },
                  ...formatCascaderData(treeData),
                ]}
                onChange={handleSearch}
              />
            </Form.Item>

            <Form.Item name='on_shelf'>
              <Select
                options={SHELF_OPTIONS}
                style={{ minWidth: 100 }}
                onChange={handleSearch}
              />
            </Form.Item>
            <Form.Item name='q'>
              <Input.Search
                placeholder={t('请输入商品名称/编码')}
                style={{ minWidth: 120 }}
                enterButton={t('搜索')}
                onSearch={handleSearch}
                loading={store.loading}
              />
            </Form.Item>
          </Form>
        </Space>
        <Space size={16}>
          {!isPeriodic ? (
            <>
              <PermissionJudge
                permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
              >
                <Button onClick={handleImport}>{t('导入')}</Button>
              </PermissionJudge>
              <Button onClick={handleExport}>{t('导出')}</Button>
            </>
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
            <Button type='primary' onClick={handleAssociatedGoods}>
              {t('关联商品')}
            </Button>
          </PermissionJudge>
        </Space>
      </div>
      <AssociatedGoods ref={modalRef} title={t('关联商品')} />
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
