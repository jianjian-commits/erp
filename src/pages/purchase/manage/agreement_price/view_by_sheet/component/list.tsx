import React, { FC } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  BoxTable,
  Button,
  Popover,
  Select,
  DatePicker,
  Flex,
  Confirm,
  Tip,
  BoxTableProps,
} from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import store from '../store'
import { t } from 'gm-i18n'
import moment from 'moment'
import { Quotation_Status } from 'gm_api/src/merchandise'
import SvgMore from '@/svg/more.svg'
import { gmHistory as history } from '@gm-common/router'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import SheetImport from './sheet_import'

enum StatusMap {
  '未生效' = Quotation_Status.STATUS_WAIT_VALID,
  '生效中' = Quotation_Status.STATUS_VALID,
  '已失效' = Quotation_Status.STATUS_INVALID,
  '已终止' = Quotation_Status.STATUS_STOP,
}

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  refresh: () => Promise<any>
}

const List: FC<ListProps> = observer(({ refresh, pagination }) => {
  const handleDelete = (index: number) => {
    store.deleteQuotation(index).then(() => refresh())
  }
  const handleEditSave = (index: number) => {
    if (Number(store.editStartTime) > Number(store.editEndTime)) {
      Tip.danger(t('终止时间需大于开始时间'))
      return
    }
    store.updateEditMsg(index).then(() => refresh())
  }
  const handleImport = () => {
    // Confirm({
    //   children: <SheetImport />,
    //   title: '导入协议单',
    //   size: 'md',
    // })
    //   .then(() => {
    //     if (!store.priceImportUploadUrl) throw Error
    //     return store.sendPriceImportCreate()
    //   })
    //   .then(() => {
    //     store.updateImportSupplier([])
    //     return globalStore.showTaskPanel('1')
    //     // return Tip.success(t('导入成功'))
    //   })
  }
  const handleExport = (index: number) => {
    const quotation_id = store.list[index].quotation_id
    store.exportQuotation(quotation_id).then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }
  const handleCopy = (index: number) => {
    const quotation_id = store.list[index].quotation_id
    window.open(
      `#/purchase/manage/agreement_price/sheet_detail?copy_quotation_id=${quotation_id}`,
    )
  }

  const columns: Column[] = [
    {
      Header: t('建单日期'),
      accessor: 'create_time',
      minWidth: 80,
      Cell: (cellProps) => {
        const { create_time } = cellProps.original
        const date = Number(create_time)
        return (
          <div>{date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>
        )
      },
    },
    {
      Header: t('协议单号'),
      accessor: 'serial_no',
      minWidth: 80,
      Cell: (cellProps) => {
        const { serial_no, quotation_id } = cellProps.original
        const url = `#/purchase/manage/agreement_price/sheet_detail?quotation_id=${quotation_id}`
        return (
          <a href={url} rel='noopener noreferrer' target='_blank'>
            {serial_no}
          </a>
        )
      },
    },
    { Header: t('供应商'), accessor: 'supplier_name', minWidth: 80 },
    { Header: t('供应商编号'), accessor: 'supplier_code', minWidth: 80 },
    {
      Header: t('开始时间'),
      accessor: 'start_time',
      minWidth: 80,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { status, isEditing } = cellProps.original
              if (isEditing && status === Quotation_Status.STATUS_WAIT_VALID) {
                return (
                  <div>
                    <DatePicker
                      // enabledTimeSelect
                      date={new Date(+store.editStartTime)}
                      onChange={(value: Date) =>
                        // store.updateEditTime('startTime', `${+value}`)
                        store.updateEditTime(
                          'startTime',
                          moment(value).startOf('day').valueOf().toString(),
                        )
                      }
                    />
                  </div>
                )
              }
              const { start_time } = cellProps.original
              const date = Number(start_time)
              return <div>{date ? moment(date).format('YYYY-MM-DD') : '-'}</div>
            }}
          </Observer>
        )
      },
    },
    {
      Header: t('终止时间'),
      accessor: 'end_time',
      minWidth: 80,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { status, isEditing } = cellProps.original
              if (isEditing && status === Quotation_Status.STATUS_WAIT_VALID) {
                return (
                  <div>
                    <DatePicker
                      // enabledTimeSelect
                      date={new Date(+store.editEndTime)}
                      onChange={(value: Date) =>
                        // store.updateEditTime('endTime', `${+value}`)
                        store.updateEditTime(
                          'endTime',
                          moment(value).endOf('day').valueOf().toString(),
                        )
                      }
                    />
                  </div>
                )
              }
              const { end_time } = cellProps.original
              const date = Number(end_time)
              return <div>{date ? moment(date).format('YYYY-MM-DD') : '-'}</div>
            }}
          </Observer>
        )
      },
    },
    { Header: t('创建人'), accessor: 'operator', minWidth: 80 },
    {
      Header: t('状态'),
      accessor: 'status',
      minWidth: 80,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { status, isEditing } = cellProps.original
              if (isEditing && status === Quotation_Status.STATUS_VALID) {
                return (
                  <div>
                    <Select
                      clean
                      value={store.editStatus}
                      onChange={(value) => store.updateEditStatus(value)}
                      className='gm-block'
                      data={[
                        {
                          value: Quotation_Status.STATUS_VALID,
                          text: '生效中',
                        },
                        {
                          value: Quotation_Status.STATUS_STOP,
                          text: '已终止',
                        },
                      ]}
                    />
                  </div>
                )
              }
              return <div>{StatusMap[status]}</div>
            }}
          </Observer>
        )
      },
    },
    { Header: t('备注'), accessor: 'remark', minWidth: 80 },
    {
      Header: TableXUtil.OperationHeader,
      minWidth: 120,
      id: 'op',
      diyItemText: t('操作'),
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { isEditing, status } = cellProps.original
              const index = cellProps.index
              return (
                <Flex alignCenter>
                  {(status === Quotation_Status.STATUS_WAIT_VALID ||
                    status === Quotation_Status.STATUS_VALID) && (
                    <TableXUtil.OperationCellRowEdit
                      disabled={
                        !globalStore.hasPermission(
                          Permission.PERMISSION_PURCHASE_UPDATE_AGREEMENT_PRICE,
                        )
                      }
                      isEditing={isEditing}
                      onSave={() => handleEditSave(index)}
                      onClick={() => store.editMsg(index)}
                      onCancel={() => store.closeEditMsg(index)}
                    >
                      {status === Quotation_Status.STATUS_WAIT_VALID && (
                        <TableXUtil.OperationDelete
                          disabled={
                            !globalStore.hasPermission(
                              Permission.PERMISSION_PURCHASE_DELETE_AGREEMENT_PRICE,
                            )
                          }
                          title={t('确认删除')}
                          onClick={handleDelete.bind(this, cellProps.index)}
                        >
                          {t(
                            '删除后协议单中该协议价也同步删除，是否确认删除？',
                          )}
                        </TableXUtil.OperationDelete>
                      )}
                    </TableXUtil.OperationCellRowEdit>
                  )}
                  {/* {!isEditing && (
                    <TableXUtil.OperationIcon style={{ marginLeft: '10px' }}>
                      <Popover
                        showArrow
                        type='hover'
                        right
                        center
                        // popup={renderPopup(index)}
                        popup={
                          <div className='tw-w-10 tw-h-15'>
                            <div
                              className='tw-p-2'
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleCopy(index)}
                            >
                              {t('复制')}
                            </div>
                            <div
                              className='tw-p-2'
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleExport(index)}
                            >
                              {t('导出')}
                            </div>
                          </div>
                        }
                      >
                        <div className='gm-padding-top-5 b-card-info'>
                          <SvgMore className='gm-text-16' />
                        </div>
                      </Popover>
                    </TableXUtil.OperationIcon>
                  )} */}
                </Flex>
              )
            }}
          </Observer>
        )
      },
    },
  ]
  return (
    <div>
      <BoxTable
        pagination={pagination}
        action={
          <div>
            <PermissionJudge
              permission={Permission.PERMISSION_PURCHASE_CREATE_AGREEMENT_PRICE}
            >
              <Button
                type='primary'
                onClick={() =>
                  history.push('/purchase/manage/agreement_price/sheet_detail')
                }
                className='gm-margin-left-10'
              >
                {t('新建协议单')}
              </Button>
              {/* <Button
                type='primary'
                onClick={handleImport}
                className='gm-margin-left-10'
              >
                {t('导入协议单')}
              </Button> */}
            </PermissionJudge>
          </div>
        }
      >
        <Table
          isDiy
          id='agreement_price_list'
          columns={columns}
          data={store.list}
        />
      </BoxTable>
    </div>
  )
})

export default List
