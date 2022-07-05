import React from 'react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import {
  BoxTable,
  BoxTableInfo,
  Button,
  MoreSelectDataItem,
} from '@gm-pc/react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import TableTotalText from '@/common/components/table_total_text'
import store from '../store'
import { gmHistory as history } from '@gm-common/router'
import Operation from './operation'
import SupplierSelector from '../../components/supplier_selector'
import { User } from '../interface'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'

const List = () => {
  function handleCreate() {
    history.push('/purchase/manage/information/create')
  }

  const { list } = store
  return (
    <BoxTable
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('采购员数'),
                content: list.length,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={
        <PermissionJudge
          permission={Permission.PERMISSION_PURCHASE_CREATE_PURCHASE_SHEET}
        >
          <Button type='primary' onClick={handleCreate}>
            {t('新建采购员')}
          </Button>
        </PermissionJudge>
      }
    >
      <Table<User>
        data={list}
        columns={[
          {
            Header: t('序号'),
            id: 'index',
            Cell: (cellProps) => cellProps.index + 1,
          },
          {
            Header: t('账号'),
            accessor: 'username',
          },
          {
            Header: t('负责供应商'),
            accessor: 'attrs',
            Cell: (props) => (
              <Observer>
                {() => {
                  const { attrs, isEditing } = props.original
                  if (isEditing) {
                    return (
                      <SupplierSelector
                        selected={(attrs?.bounded_customer_ids || [])
                          .map((v) => store.mapSuppliers[v])
                          .filter((_) => _)}
                        data={store.suppliers.slice()}
                        onSelect={(selected: MoreSelectDataItem<string>[]) => {
                          const ids = selected.map((v) => v.value)
                          store.updateListItem(props.index, 'attrs', {
                            ...attrs,
                            bounded_customer_ids: ids,
                          })
                        }}
                      />
                    )
                  }
                  return (
                    <div>
                      {(attrs?.bounded_customer_ids || [])
                        .map(
                          (id: string) => store.mapSuppliers[id]?.name || null,
                        )
                        .filter((v: string | null) => v)
                        .join(',')}
                    </div>
                  )
                }}
              </Observer>
            ),
          },
          {
            Header: t('姓名'),
            accessor: 'name',
          },
          {
            Header: t('手机'),
            accessor: 'phone',
          },
          {
            Header: t('账号状态'),
            id: 'is_valid',
            accessor: (d: any) => {
              return <span>{d.is_valid ? t('开启') : t('关闭')}</span>
            },
          },
          {
            Header: t('登录采购小程序'),
            id: 'status',
            accessor: (d: any) => {
              return <span>{d.status === '256' ? t('开启') : t('关闭')}</span>
            },
          },
          {
            Header: t('登录状态'),
            id: 'is_online',
            accessor: (d: any) => {
              return <span>{d.is_online ? t('在线') : t('离线')}</span>
            },
          },
          {
            Header: TableXUtil.OperationHeader,
            id: 'action',
            width: TableXUtil.TABLE_X.WIDTH_OPERATION,
            Cell: (props) => (
              <Operation
                index={props.index}
                editDisabled={
                  !globalStore.hasPermission(
                    Permission.PERMISSION_ENTERPRISE_UPDATE_PURCHASER,
                  )
                }
                deleteDisabled={
                  !globalStore.hasPermission(
                    Permission.PERMISSION_ENTERPRISE_DELETE_PURCHASER,
                  )
                }
              />
            ),
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(List)
