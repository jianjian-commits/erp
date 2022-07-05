import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from '../store'
import { getEnumText, formatDateTime, getUnNillText } from '@/common/util'
import TableTotalText from '@/common/components/table_total_text'
import { BoxTable, BoxTableInfo, Button, Switch } from '@gm-pc/react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import { history } from '@/common/service'
import { USE_STATUS } from '@/pages/sales_invoicing/enum'
import { Warehouse } from 'gm_api/src/inventory'
import { TableColumns } from '@/pages/sales_invoicing/interface'

const { OperationHeader, OperationCell, OperationDetail, OperationDelete } =
  TableXUtil
interface InComing {
  onFetchList: Function
  loading: boolean
  pagintion: any
}

const List: FC<InComing> = observer((props) => {
  const { paging, list, groupUsers, deleteWarehouse, updateWareHouse } = store
  const { onFetchList, loading } = props

  const handleDelete = async (warehouse_id: string) => {
    await deleteWarehouse(warehouse_id)
    onFetchList()
  }

  const handleToggleValid = async (original: Warehouse) => {
    const valid = !original?.valid
    await updateWareHouse(original, 'list', valid)
    onFetchList()
  }

  const columns = [
    {
      Header: t('仓库名称'),
      accessor: 'name',
    },
    {
      Header: t('仓库编码'),
      accessor: 'customized_code',
    },
    {
      Header: t('使用状态'),
      accessor: 'valid',
      Cell: (cellProps: TableColumns<Warehouse>) => {
        const valid = cellProps?.original?.valid
        let t_valid = 1
        if (valid === false) t_valid = 2
        if (valid) t_valid = 1
        return getEnumText(USE_STATUS, t_valid, 'value')
      },
    },
    {
      Header: t('地区'),
      accessor: 'address',
      Cell: (cellProps: TableColumns<Warehouse>) => {
        return getUnNillText(cellProps?.original?.address)
      },
    },
    {
      Header: t('是否默认仓'),
      accessor: 'is_default',
      Cell: (cellProps: TableColumns<Warehouse>) => {
        const {
          original: { is_default },
        } = cellProps
        if (is_default) {
          return t('默认仓')
        }
        return '-'
      },
    },
    {
      Header: t('联系人'),
      accessor: t('contact'),
    },
    {
      Header: t('联系方式'),
      accessor: 'phone',
    },
    {
      Header: t('创建人'),
      accessor: t('creator'),
      Cell: (cellProps: TableColumns<Warehouse>) => {
        const { creator } = cellProps.original
        const user = groupUsers?.[creator!] || {}
        return getUnNillText(user?.name)
      },
    },
    {
      Header: t('创建时间'),
      accessor: 'create_time',
      Cell: (cellProps: TableColumns<Warehouse>) => {
        const { original } = cellProps
        return formatDateTime(+original?.create_time!)
      },
    },
    {
      Header: t('备注'),
      accessor: 'remark',
    },
    {
      Header: OperationHeader,
      id: 'operator',
      diyItemText: t('操作'),
      diyEnable: false,
      Cell: (cellProps: TableColumns<Warehouse>) => {
        const {
          original: { name, warehouse_id, valid, is_default },
        } = cellProps
        return (
          <OperationCell>
            <OperationDetail
              onClick={() =>
                history.push(
                  `/sales_invoicing/warehouse/warehouse_info/details?warehouse_id=${warehouse_id}`,
                )
              }
            />
            {is_default ? null : (
              <>
                <Switch
                  className='gm-margin-left-10 gm-margin-right-10'
                  on={t('启用')}
                  off={t('停用')}
                  checked={valid}
                  onChange={() => handleToggleValid(cellProps.original)}
                />
                <OperationDelete
                  title={t('提示')}
                  onClick={() => handleDelete(warehouse_id)}
                  read={t('我已阅读以上提示，确认删除仓库')}
                >
                  <div> {t('KEY8', { name: name })}</div>
                  <span className='gm-text-red'>
                    {t(
                      '删除仓库后，该仓库所有出入库单据将同时删除，请谨慎操作。如果只是想不再使用此仓库，建议使用停用功能，是否继续删除仓库',
                    )}
                  </span>
                </OperationDelete>
              </>
            )}
          </OperationCell>
        )
      },
    },
  ]

  const ListRight = observer(() => {
    const handleCreate = () => {
      history.push(`/sales_invoicing/warehouse/warehouse_info/create`)
    }
    return (
      <>
        <Button type='primary' onClick={handleCreate}>
          {t('新增仓库')}
        </Button>
      </>
    )
  })

  return (
    <BoxTable
      pagination={props.pagintion}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('仓库数量'),
                content: paging.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={<ListRight />}
    >
      <Table
        data={list}
        columns={columns}
        keyField='stock_sheet_id'
        loading={loading}
      />
    </BoxTable>
  )
})

export default List
