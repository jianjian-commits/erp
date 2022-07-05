import React, { FC, ChangeEvent } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  BoxTable,
  Button,
  Input,
  Confirm,
  Modal,
  Flex,
  BoxTableProps,
} from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import { Filters_Bool } from 'gm_api/src/common'
import { gmHistory as history } from '@gm-common/router'
import Big from 'big.js'
import store from '../store'
import { t } from 'gm-i18n'
import moment from 'moment'
import { Quotation_Status, Status_Code } from 'gm_api/src/merchandise'
import PriceImport from './price_import'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'

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
  const handleDeleteWarning = (index: number, serial_no: string) => {
    Modal.render({
      style: {
        width: '400px',
      },
      title: t('提示'),
      onHide: Modal.hide,
      children: (
        <div>
          <div className='tw-p-1'>
            {t(
              `该商品为协议单${serial_no}的唯一一个商品，删除该商品后协议单将随之删除，是否确认删除？`,
            )}
          </div>
          <Flex justifyEnd>
            <Button onClick={() => Modal.hide()}>{t('取消')}</Button>
            <div className='gm-gap-5' />
            <Button
              type='primary'
              onClick={() =>
                store
                  .deleteAgreementSheet(index, Filters_Bool.TRUE)
                  .then(() => Modal.hide())
                  .then(() => refresh())
              }
            >
              {t('确定')}
            </Button>
          </Flex>
        </div>
      ),
    })
  }
  const handleDelete = (index: number) => {
    store.deleteAgreementSheet(index).then(({ code, msg }) => {
      if (code === Status_Code.DELETE_BASIC_PRICE_RELATION_DATA) {
        return handleDeleteWarning(index, msg.detail.serial_no)
      }
      return refresh()
    })
  }
  const handleEditSave = (index: number) => {
    store.updatePrice(index).then(() => refresh())
  }
  const handleImport = () => {
    Confirm({
      children: <PriceImport />,
      title: '导入协议价',
      size: 'md',
    })
      .then(() => {
        if (!store.priceImportUploadUrl) throw Error
        if (store.priceImportType === 1) {
          return store.sendPriceImportCreate()
        }
        if (store.priceImportType === 2) {
          return store.sendPriceImportUpdate()
        }
        throw Error
      })
      .then(() => {
        store.updateImportSupplier([])
        return globalStore.showTaskPanel('1')
      })
  }
  const columns: Column[] = [
    { Header: t('商品编码'), accessor: 'customize_code', minWidth: 80 },
    {
      Header: t('商品名称'),
      accessor: 'name',
      minWidth: 80,
    },
    // {
    //   Header: t('规格'),
    //   accessor: 'standard',
    //   minWidth: 80,
    //   Cell: (cellProps) => {
    //     const { rate, meas_unit, pkg_unit } = cellProps.original
    //     return <div>{`${rate}${meas_unit}/${pkg_unit}`}</div>
    //   },
    // },
    {
      Header: t('采购单位'),
      accessor: 'standard',
      minWidth: 80,
      Cell: (cellProps) => {
        const { rate, meas_unit, pkg_unit } = cellProps.original
        return <div>{`${rate}${meas_unit}/${pkg_unit}`}</div>
      },
    },
    { Header: t('分类'), accessor: 'category_name', minWidth: 80 },
    { Header: t('供应商'), accessor: 'supplier_name', minWidth: 80 },
    {
      Header: t('含税协议价（采购单位）'),
      accessor: 'price',
      minWidth: 80,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { price, meas_unit, isEditing, rate } = cellProps.original
              if (isEditing) {
                return (
                  <div>
                    <Input
                      type='number'
                      max={9999999999999}
                      min={0}
                      value={store.editPrice}
                      onInput={(e: any) => {
                        e.target.value = e.target.value.replace(/-/g, '')
                      }}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value
                        const fixPkgPrice = value
                          ? new Big(value).times(rate).toString()
                          : ''
                        store.onEditPriceChange(value)
                        store.onEditPkgPriceChange(fixPkgPrice)
                      }}
                    />
                    {`元/${meas_unit}`}
                  </div>
                )
              }
              return <div>{`${price}元/${meas_unit}`}</div>
            }}
          </Observer>
        )
      },
    },
    // {
    //   Header: t('含税协议价（包装单位）'),
    //   accessor: 'pkg_price',
    //   minWidth: 80,
    //   Cell: (cellProps) => {
    //     return (
    //       <Observer>
    //         {() => {
    //           const { rate, pkgPrice, pkg_unit, isEditing } = cellProps.original
    //           if (isEditing) {
    //             return (
    //               <div>
    //                 <Input
    //                   type='number'
    //                   max={9999999999999}
    //                   value={store.editPkgPrice}
    //                   onInput={(e: any) => {
    //                     e.target.value = e.target.value.replace(/-/g, '')
    //                   }}
    //                   onChange={(e: ChangeEvent<HTMLInputElement>) => {
    //                     const value: any = e.target.value
    //                     const fixedPrice = value
    //                       ? new Big(value).div(rate).toString()
    //                       : ''
    //                     store.onEditPkgPriceChange(value)
    //                     store.onEditPriceChange(fixedPrice)
    //                   }}
    //                 />
    //                 {`元/${pkg_unit}`}
    //               </div>
    //             )
    //           }
    //           return <div>{`${pkgPrice}元/${pkg_unit}`}</div>
    //         }}
    //       </Observer>
    //     )
    //   },
    // },
    {
      Header: t('开始时间'),
      accessor: 'start_time',
      minWidth: 80,
      Cell: (cellProps) => {
        const { start_time } = cellProps.original
        const date = Number(start_time)
        return <div>{date ? moment(date).format('YYYY-MM-DD') : '-'}</div>
      },
    },
    {
      Header: t('终止时间'),
      accessor: 'end_time',
      minWidth: 80,
      Cell: (cellProps) => {
        const { end_time } = cellProps.original
        const date = Number(end_time)
        return <div>{date ? moment(date).format('YYYY-MM-DD') : '-'}</div>
      },
    },
    { Header: t('协议单号'), accessor: 'serial_no', minWidth: 80 },
    { Header: t('最后操作人'), accessor: 'operator', minWidth: 80 },
    {
      Header: t('最后操作时间'),
      accessor: 'update_time',
      minWidth: 80,
      Cell: (cellProps) => {
        const { update_time } = cellProps.original
        const date = Number(update_time)
        return (
          <div>{date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>
        )
      },
    },
    {
      Header: t('状态'),
      accessor: 'status',
      minWidth: 80,
      Cell: (cellProps) => {
        const { status } = cellProps.original
        return <div>{StatusMap[status]}</div>
      },
    },
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
              return status === Quotation_Status.STATUS_WAIT_VALID ||
                status === Quotation_Status.STATUS_VALID ? (
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
                  <TableXUtil.OperationDelete
                    disabled={
                      !globalStore.hasPermission(
                        Permission.PERMISSION_PURCHASE_DELETE_AGREEMENT_PRICE,
                      )
                    }
                    title={t('确认删除')}
                    onClick={handleDelete.bind(this, cellProps.index)}
                  >
                    {t('删除后协议单中该协议价也同步删除，是否确认删除？')}
                  </TableXUtil.OperationDelete>
                </TableXUtil.OperationCellRowEdit>
              ) : null
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
                  history.push(
                    '/purchase/manage/agreement_price/product_detail',
                  )
                }
                className='gm-margin-left-10'
              >
                {t('新增协议价')}
              </Button>
              <Button
                type='primary'
                onClick={handleImport}
                className='gm-margin-left-10'
              >
                {t('导入协议价')}
              </Button>
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
