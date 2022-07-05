import React, { FC, useRef, useState } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { TableList, TableListColumn } from '@gm-pc/business'
import {
  Quotation_Status,
  BulkUpdateQuotationV2,
  Quotation,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import { GenerateTokenByBusinessId } from 'gm_api/src/oauth'
import {
  Button,
  Divider,
  Col,
  Tag,
  Modal,
  message,
  Dropdown,
  Menu,
  Space,
} from 'antd'
import { gmHistory as history } from '@gm-common/router'
import { RightSideModal } from '@gm-pc/react'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'

import store from '../store'
import {
  DeleteQuotationTip,
  getSelectItemCount,
} from '@/pages/merchandise/components/common'
import CopyQuotation, {
  CopyQuotationRef,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/components/copy_quotation'
import BatchActionBar from '@/common/components/batch_action_bar'
import PermissionJudge from '@/common/components/permission_judge'
import TableTextOverflow from '@/common/components/table_text_overflow'
import SidePrintModal from '@/common/components/rightSide_print_template/side_print_modal'
import { openNewTab } from '@/common/util'
import ShareQrcodeModal, { Ref } from './components/share_qrcode'
import classNames from 'classnames'
import QuotationStatusTag from '@/pages/merchandise/price_manage/customer_quotation/components/quotation_status_tag'

type QuatationShare = {
  id: string
  name: string
}

const tableId = 'price_manage_customer_quotation_list'

/** 报价单列表 */
const List: FC = observer(() => {
  const editModalRef = useRef<CopyQuotationRef>(null)
  const ShareQrcodeModalRef = useRef<Ref>(null)

  const [copyQtId, setCopyQtId] = useState<string>('')

  /** 已选择的数量 */
  const count = store.isAll ? store.count : store.selected.length
  /** 列表操作栏按钮 disabled */
  const disabled = store.selected.length === 0

  /**
   * 跳转报价单详情页
   */
  const handleDetail = (quotation_id: string, type: number) => {
    history.push(
      `/merchandise/price_manage/customer_quotation/detail?quotation_id=${quotation_id}&type=${type}`,
    )
  }

  /**
   * 跳转编辑报价单
   */
  const handleEdit = (quotation_id: string) => {
    history.push(
      `/merchandise/price_manage/customer_quotation/edit?&quotation_id=${quotation_id}`,
    )
  }

  /**
   * 单个删除报价单
   * @param record 当前行数据
   */
  const handleDelete = (record: Quotation) => {
    const { inner_name = '-', quotation_id } = record
    Modal.confirm({
      title: t('删除报价单'),
      okType: 'danger',
      okText: t('删除'),
      content: <DeleteQuotationTip text={inner_name} />,
      onOk() {
        store.deleteQuotation(quotation_id).then(() => {
          message.success(t('删除成功'))
          store.fetchList()
        })
      },
    })
  }

  /**
   * 批量删除报价单
   */
  const handleBatchDelete = () => {
    Modal.confirm({
      title: t('批量删除'),
      okType: 'danger',
      content: <DeleteQuotationTip count={count} />,
      okText: t('删除'),
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({ delete: true }).then(() => {
          message.success(t('正在批量删除, 请稍后刷新查看'))
        })
      },
    })
  }

  /**
   * 禁用启用
   * @param value 当前行数据
   */
  const handleOpenOrForbidden = (value: Quotation) => {
    const { status } = value

    const text =
      status === Quotation_Status.STATUS_VALID ? t('禁用') : t('启用')
    Modal.confirm({
      title: t(text + '报价单'),
      content: t(`确认要${text}该报价单吗？`),
      onOk() {
        store
          .updateQuotation({
            ...value,
            status:
              status === Quotation_Status.STATUS_WAIT_VALID
                ? Quotation_Status.STATUS_VALID
                : Quotation_Status.STATUS_WAIT_VALID,
          })
          .then(() => {
            message.success(t('操作成功'))
            store.fetchList()
          })
      },
    })
  }

  /**
   * 批量启用
   */
  const handleBatchOpen = () => {
    Modal.confirm({
      title: t('批量启用'),
      content: (
        <>
          {getSelectItemCount(count)}
          {t(`确定要启用这些报价单吗？`)}
        </>
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({ quotation_status: Quotation_Status.STATUS_VALID }).then(
          () => {
            message.success(t('正在批量启用, 请稍后刷新查看'))
          },
        )
      },
    })
  }

  /**
   * 批量禁用
   */
  const handleBatchForbidden = () => {
    Modal.confirm({
      title: t('批量禁用'),
      content: (
        <>
          {getSelectItemCount(count)}
          {t('确定要禁用这些报价单吗？')}
        </>
      ),
      okText: t('确认'),
      cancelText: t('取消'),
      onOk: () => {
        onBatchUpdate({
          quotation_status: Quotation_Status.STATUS_WAIT_VALID,
        }).then(() => {
          message.success(t('正在批量禁用, 请稍后刷新查看'))
        })
      },
    })
  }

  /**
   * 批量修改的公共方法
   * @param on_shelf 上下架
   * @param isDelete 删除
   */
  const onBatchUpdate = (params: any) => {
    params.filter_params = store.isAll
      ? store.filter
      : {
          quotation_ids: store.selected,
        }

    return BulkUpdateQuotationV2(params).then(() => {
      globalStore.showTaskPanel('1')
    })
  }

  const handleClose = () => {
    store.setSelected([])
    store.setIsAll(false)
  }

  const handleToggleSelectAll = (params: boolean) => {
    store.setIsAll(params)
    store.selected = store.list.map((item) => item.quotation_id)
  }

  /**
   * @description: 打印报价单action
   * @param {string} quotation_id
   * @return {*}ƒ
   */
  const handlePrint = async (quotation_id: string) => {
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
              `#system/template/print_template/salemenus_template/print?quotation_id=${quotation_id}&template_id=${printing_template_id}`,
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
   * @description: 复制报价单
   * @param {string} quotation_id
   * @return {*}
   */
  const handleCopy = (quotation_id: string): void => {
    setCopyQtId(quotation_id)
    editModalRef.current && editModalRef.current.handleOpen()
  }

  /**
   * @description: 报价单分享
   * @param {string} quotation_id
   * @return {*}
   */
  const handleShare = (quotation: QuatationShare): void => {
    GenerateTokenByBusinessId({ business_id: quotation.id }).then((json) => {
      const params = {
        ...quotation,
        token: json.response.access_token!,
      }
      ShareQrcodeModalRef.current &&
        ShareQrcodeModalRef.current.handleOpen(params)
    })
  }

  /** 表格列 */
  const columns = [
    {
      Header: t('报价单名称'),
      id: 'inner_name',
      minWidth: 120,
      headerSort: true,
      Cell: (d) => {
        const { quotation_id, type, inner_name = '', is_default } = d.original
        return (
          <a onClick={() => handleDetail(quotation_id, type)}>
            {is_default && <Tag color='#3e8de8'>{t('默认')}</Tag>}

            <TableTextOverflow text={inner_name} />
          </a>
        )
      },
    },
    {
      Header: t('报价单编码'),
      id: 'serial_no',
      accessor: 'serial_no',
      minWidth: 120,
      headerSort: true,
    },
    {
      Header: t('对外简称'),
      id: 'outer_name',
      accessor: 'outer_name',
      minWidth: 120,
    },
    {
      Header: t('类型'),
      id: 'quotation_id',
      minWidth: 120,
      Cell: (d) => {
        const { type } = d.original
        return type === Quotation_Type.PERIODIC
          ? t('周期报价单')
          : t('普通报价单')
      },
    },
    {
      Header: t('商品数'),
      id: 'sku_count',
      accessor: 'sku_count',
      minWidth: 120,
      headerSort: true,
    },
    {
      Header: t('客户数'),
      id: 'customer_count',
      accessor: 'customer_count',
      minWidth: 120,
      headerSort: true,
    },
    {
      Header: t('描述'),
      id: 'description',
      accessor: 'description',
      minWidth: 120,
      Cell: (d) => {
        const { description = '' } = d.original
        return <TableTextOverflow text={description} />
      },
    },
    {
      Header: t('状态'),
      id: 'status',
      accessor: 'status',
      minWidth: 120,
      headerSort: true,
      Cell: (d) => {
        const { status } = d.original
        return (
          <div>
            <QuotationStatusTag status={status || 0} />
          </div>
        )
      },
    },
    {
      Header: t('操作'),
      id: 'operation',
      accessor: 'operation',
      minWidth: 150,
      Cell: (d) => {
        const { quotation_id, status, inner_name, type } = d.original

        const isPeriodic = type === Quotation_Type.PERIODIC
        const shouldAudit = status === Quotation_Status.STATUS_WAIT_AUDIT
        const hasAuditPermission = globalStore.hasPermission(
          Permission.PERMISSION_MERCHANDISE_AUDIT_QUOTATION,
        )
        return (
          <Col>
            {shouldAudit && (
              <>
                <a
                  className={classNames({
                    'tw-text-gray-400 gm-not-allowed': !hasAuditPermission,
                  })}
                  onClick={() => {
                    if (hasAuditPermission) {
                      handleDetail(quotation_id, type)
                    }
                  }}
                >
                  {t('审核')}
                </a>
                <Divider type='vertical' />
              </>
            )}
            <a
              className={classNames({
                merchandise_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
                ),
              })}
              type='link'
              onClick={() => handleEdit(quotation_id)}
            >
              {t('编辑')}
            </a>
            <Divider type='vertical' />
            {!shouldAudit && (
              <>
                <a
                  className={classNames({
                    merchandise_a_disabled: !globalStore.hasPermission(
                      Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
                    ),
                  })}
                  type='link'
                  onClick={() => handleOpenOrForbidden(d.original)}
                >
                  {status === Quotation_Status.STATUS_VALID
                    ? t('禁用')
                    : t('启用')}
                </a>
                <Divider type='vertical' />
              </>
            )}
            <Dropdown.Button
              type='text'
              placement='bottomLeft'
              buttonsRender={([_, right]) => [
                <></>,
                React.cloneElement(right as any, {
                  style: { position: 'relative', top: '7px', color: '#1e80e5' },
                }),
              ]}
              overlay={
                <Menu>
                  <Menu.Item
                    disabled={
                      !globalStore.hasPermission(
                        Permission.PERMISSION_MERCHANDISE_DELETE_QUOTATION,
                      )
                    }
                    key='delete'
                    onClick={() => handleDelete(d.original)}
                  >
                    {t('删除')}
                  </Menu.Item>
                  <Menu.Item
                    key='copy'
                    onClick={handleCopy.bind(null, quotation_id)}
                    disabled={
                      !globalStore.hasPermission(
                        Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
                      )
                    }
                  >
                    {t('复制')}
                  </Menu.Item>
                  {!isPeriodic && (
                    <>
                      <Menu.Item
                        key='print'
                        onClick={handlePrint.bind(null, quotation_id)}
                      >
                        {t('打印')}
                      </Menu.Item>
                      <Menu.Item
                        key='share'
                        onClick={handleShare.bind(null, {
                          name: inner_name!,
                          id: quotation_id,
                        })}
                      >
                        {t('分享')}
                      </Menu.Item>
                    </>
                  )}
                </Menu>
              }
            />
          </Col>
        )
      },
    },
  ] as TableListColumn<Quotation>[]

  return (
    <>
      <div
        className='gm-site-card-border-less-wrapper-114'
        style={{ padding: '0 16px' }}
      >
        <TableList<Quotation>
          batchActionBar={
            <BatchActionBar
              onClose={handleClose}
              isSelectAll={store.isAll}
              selected={store.selected}
              toggleSelectAll={handleToggleSelectAll}
              count={store.count}
              ButtonNode={
                <>
                  <PermissionJudge
                    permission={
                      Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION
                    }
                  >
                    <Space size='middle'>
                      <Button disabled={disabled} onClick={handleBatchOpen}>
                        {t('启用')}
                      </Button>
                      <Button
                        disabled={disabled}
                        onClick={handleBatchForbidden}
                      >
                        {t('禁用')}
                      </Button>
                    </Space>
                  </PermissionJudge>

                  <PermissionJudge
                    permission={
                      Permission.PERMISSION_MERCHANDISE_DELETE_QUOTATION
                    }
                  >
                    <Button disabled={disabled} onClick={handleBatchDelete}>
                      {t('删除')}
                    </Button>
                  </PermissionJudge>
                </>
              }
            />
          }
          isDiy
          isHeaderSort
          isSelect
          onSelect={store.setSelected}
          selected={store.selected}
          isUpdateEffect={false}
          id={tableId}
          keyField='quotation_id'
          service={store.getSaleList}
          filter={store.filter}
          columns={columns}
          paginationOptions={{
            paginationKey: tableId,
            defaultPaging: { need_count: true },
          }}
        />
      </div>
      <CopyQuotation
        ref={editModalRef}
        quotationId={copyQtId}
        refresh={store.fetchList}
      />
      <ShareQrcodeModal modalRef={ShareQrcodeModalRef} />
    </>
  )
})

export default List
