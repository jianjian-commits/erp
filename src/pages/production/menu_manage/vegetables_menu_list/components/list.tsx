import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { TableList, TableListColumn } from '@gm-pc/business'
import {
  BulkUpdateQuotationV2,
  BulkUpdateQuotationV2Request,
  DeleteQuotationV2,
  Quotation,
  Quotation_Status,
  Status_Code,
  UpdateQuotationV2,
} from 'gm_api/src/merchandise'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { Button, Space, Tag, Modal, message, Divider, Col } from 'antd'
import store from '../store'
import BatchActionBarComponent from '@/common/components/batch_action_bar'
import _ from 'lodash'
import globalStore from '@/stores/global'
import { gmHistory as history } from '@gm-common/router'
import TableTextOverflow from '@/common/components/table_text_overflow'
import classNames from 'classnames'
import '../../../style.less'
import moment from 'moment'
import {
  DeleteMenuTip,
  getSelectItemCount,
} from '@/pages/production/menu_manage/vegetables_menu_list/components/confirm_modals'

const { confirm } = Modal
const ListV2: FC = observer(() => {
  const {
    quotation_list,
    filter,
    count,
    isAllSelected,
    selected,
    setSelected,
    setIsAllSelected,
    fetchQuotation,
    setFilter,
  } = store

  const [isLoading, setIsLoading] = useState<boolean>(false)
  /** 勾选 */
  const handleSelected = (selected: string[]) => {
    setSelected(selected)
    if (selected.length < quotation_list.length) {
      setIsAllSelected(false)
    }
  }

  /** 取消选中 */
  const cancelSelect = () => {
    setSelected([])
    setIsAllSelected(false)
  }

  /**
   * @description 全选
   * @param params 是否勾选所有页
   */
  const handleToggleSelectAll = (params: boolean) => {
    setIsAllSelected(params)
    setSelected(_.map(quotation_list, (item) => item.quotation_id))
  }

  /**
   * @description 批量删除/启用/禁用
   * @param req 请求数据
   * @param title 提示文案
   */
  const confirmBatchOperate = (
    req: BulkUpdateQuotationV2Request,
    title: string,
  ) => {
    const filter_params = isAllSelected ? filter : { quotation_ids: selected }
    BulkUpdateQuotationV2({
      filter_params,
      ...req,
    })
      .then((json) => {
        setIsLoading(false)
        setSelected([])
        setIsAllSelected(false)
        globalStore.showTaskPanel('1')
        message.success(t(`正在${title}，请稍后刷新查看`))
      })
      .catch(() => {
        message.error(t(`${title}任务创建失败`))
      })
  }

  /**
   * @description 启用/禁用单个菜谱
   * @param quotation 要启用/禁用的商品
   * @param status 启用(true)/禁用(false)
   * @param title 提示文案
   */
  const confirmEditStatus = (
    quotation: Quotation,
    status: Quotation_Status,
    title: string,
  ) => {
    UpdateQuotationV2({
      quotation: { ...quotation, status },
    })
      .then((json) => {
        setFilter(filter)
        message.success(`${title}成功`)
      })
      .catch(() => {
        // message.error(`${title}失败`)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  /**
   * @description 启用/禁用
   * @param isBatch 是否批量
   * @param status 启用(Quotation_Status.STATUS_VALID)/禁用(Quotation_Status.STATUS_WAIT_VALID)
   * @param quotaiton 启用/禁用的单个报价单
   */
  const handleStatus = (
    isBatch: boolean,
    status: Quotation_Status,
    quotation?: Quotation,
  ) => {
    const editCount = isAllSelected ? count : selected.length
    const title = `${isBatch ? '批量' : ''}${
      status === Quotation_Status.STATUS_VALID ? '启用' : '禁用'
    }`
    confirm({
      title: t(title),
      content: (
        <>
          {isBatch && getSelectItemCount(editCount)}
          {t(
            `确定要${title}${isBatch ? '这些菜谱' : quotation?.inner_name}吗？`,
          )}
        </>
      ),
      okType: 'primary',
      onOk: () => {
        setIsLoading(true)
        if (isBatch) {
          confirmBatchOperate({ quotation_status: status }, title)
        } else {
          confirmEditStatus(quotation!, status, title)
        }
      },
    })
  }

  /**
   * @description 删除单个菜谱
   * @param sku 删除的菜谱
   * @param title 提示文案
   */
  const confirmDelete = (quotation: Quotation, title: string) => {
    DeleteQuotationV2({ quotation_id: quotation.quotation_id }, [
      Status_Code.DEFAULT_QUOTATION_NOT_EXISTS_IS_NECESSARY,
    ])
      .then((json) => {
        if (
          json.code === Status_Code.DEFAULT_QUOTATION_NOT_EXISTS_IS_NECESSARY
        ) {
          message.error(t('默认菜谱不可删除'))
          return null
        }
        setFilter(filter)
        message.success(`${title}成功`)
      })
      .catch(() => {
        message.error(`${title}失败`)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  /**
   * @description 删除菜谱
   * @param isBatch 是否批量
   * @param quotation 删除单个菜谱时要删除的菜谱
   */
  const handleDelete = (isBatch: boolean, quotaiton?: Quotation) => {
    const deleteCount = isAllSelected ? count : selected.length
    const title = `${isBatch ? '批量' : ''}删除`
    confirm({
      title: t(title),
      content: (
        <DeleteMenuTip
          count={isBatch ? deleteCount : 0}
          text={isBatch ? '这些菜谱' : quotaiton?.inner_name}
        />
      ),
      okType: 'danger',
      okText: t('删除'),
      onOk: () => {
        setIsLoading(true)
        if (isBatch) {
          confirmBatchOperate({ delete: true }, title)
        } else {
          confirmDelete(quotaiton!, title)
        }
      },
    })
  }

  /** 详情 */
  const toDetail = (quotation_id: string) => {
    history.push(
      `/production/menu_manage/vegetables_menu_list/quotation_detail?quotation_id=${quotation_id}`,
    )
  }

  /**  编辑 */
  const toEdit = (id: string) => {
    history.push(
      `/production/menu_manage/vegetables_menu_list/create_quotation?viewType=isEdit&quotation_id=${id}`,
    )
  }

  const columns: TableListColumn<Quotation>[] = [
    {
      Header: t('菜谱名称'),
      id: 'inner_name',
      minWidth: 120,
      headerSort: true,
      Cell: (d) => {
        const { quotation_id, inner_name = '', is_default } = d.original
        return (
          <a onClick={() => toDetail(quotation_id)}>
            {is_default && <Tag color='#3e8de8'>{t('默认')}</Tag>}

            <TableTextOverflow text={inner_name} />
          </a>
        )
      },
    },
    {
      Header: t('菜谱ID'),
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
      Header: t('最近更新时间'),
      id: 'update_time',
      minWidth: 120,
      Cell: (d) => {
        const { update_time } = d.original
        return moment(Number(update_time)).format('YYYY-MM-DD HH:mm')
      },
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
        const isValid = status === Quotation_Status.STATUS_VALID
        return (
          <Tag
            color={isValid ? '#87d068' : '#ccc'}
            className='tw-w-9 tw-text-center'
          >
            {t(`${isValid ? '启用' : '禁用'}`)}
          </Tag>
        )
      },
    },
    {
      Header: t('操作'),
      id: 'operation',
      accessor: 'operation',
      minWidth: 150,
      Cell: (d) => {
        const { quotation_id, status } = d.original
        const isValid = status === Quotation_Status.STATUS_VALID

        return (
          <Col>
            <a
              className={classNames({
                menu_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_UPDATE_CLEANFOOD_MENU,
                ),
              })}
              type='link'
              onClick={() => toEdit(quotation_id)}
            >
              {t('编辑')}
            </a>
            <Divider type='vertical' />

            <a
              className={classNames({
                menu_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_UPDATE_CLEANFOOD_MENU,
                ),
              })}
              type='link'
              onClick={() =>
                handleStatus(
                  false,
                  isValid
                    ? Quotation_Status.STATUS_WAIT_VALID
                    : Quotation_Status.STATUS_VALID,
                  d.original,
                )
              }
            >
              {isValid ? t('禁用') : t('启用')}
            </a>
            <Divider type='vertical' />

            <a
              className={classNames({
                menu_a_disabled: !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_DELETE_CLEANFOOD_MENU,
                ),
              })}
              type='link'
              onClick={() => handleDelete(false, d.original)}
            >
              {t('删除')}
            </a>
          </Col>
        )
      },
    },
  ]

  return (
    <div className='gm-site-card-border-less-wrapper-106 menu_table_list'>
      <TableList<Quotation>
        id='quotation_menu_list'
        keyField='quotation_id'
        isSelect
        data={quotation_list}
        filter={filter}
        service={fetchQuotation}
        columns={columns}
        isUpdateEffect={false}
        selected={selected}
        onSelect={handleSelected}
        paginationOptions={{
          paginationKey: 'quotation_menu_page',
          defaultPaging: { need_count: true },
        }}
        batchActionBar={
          <BatchActionBarComponent
            selected={selected}
            onClose={cancelSelect}
            isSelectAll={isAllSelected}
            toggleSelectAll={handleToggleSelectAll}
            count={isAllSelected ? count : selected.length}
            ButtonNode={
              <>
                <PermissionJudge
                  permission={
                    Permission.PERMISSION_MERCHANDISE_UPDATE_CLEANFOOD_MENU
                  }
                >
                  <Space size='middle'>
                    <Button
                      disabled={selected.length === 0}
                      onClick={() =>
                        handleStatus(true, Quotation_Status.STATUS_VALID)
                      }
                    >
                      {t('启用')}
                    </Button>
                    <Button
                      disabled={selected.length === 0}
                      onClick={() =>
                        handleStatus(true, Quotation_Status.STATUS_WAIT_VALID)
                      }
                    >
                      {t('禁用')}
                    </Button>
                  </Space>
                </PermissionJudge>
                <PermissionJudge
                  permission={
                    Permission.PERMISSION_MERCHANDISE_DELETE_CLEANFOOD_MENU
                  }
                >
                  <Button
                    disabled={selected.length === 0}
                    onClick={() => handleDelete(true)}
                  >
                    {t('删除')}
                  </Button>
                </PermissionJudge>
              </>
            }
          />
        }
      />
    </div>
  )
})

export default ListV2
