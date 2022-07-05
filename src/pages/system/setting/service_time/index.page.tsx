import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable, Button, BoxTableInfo } from '@gm-pc/react'
import { TableXUtil, Table } from '@gm-pc/table-x'
import { gmHistory as history } from '@gm-common/router'
import TableTotalText from '@/common/components/table_total_text'
import store from './store'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import globalStore from '@/stores/global'

const List = () => {
  function handleDelete(id: string) {
    store.deleteServicePeriod(id)
  }

  useEffect(() => {
    store.getServicePeriods()
  }, [])

  return (
    <BoxTable
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('运营时间设置'),
                content: store.list.length,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={
        <PermissionJudge
          permission={Permission.PERMISSION_ENTERPRISE_CREATE_SERVICE_PERIOD}
        >
          <Button
            type='primary'
            onClick={() => history.push('/system/setting/service_time/create')}
            className='gm-margin-left-10'
          >
            {t('新建运营时间')}
          </Button>
        </PermissionJudge>
      }
    >
      <Table
        data={store.list.slice()}
        columns={[
          { Header: t('运营配置ID'), accessor: 'service_period_id' },
          { Header: t('运营配置名称'), accessor: 'name' },
          {
            Header: t('描述'),
            accessor: 'description',
          },
          {
            Header: TableXUtil.OperationHeader,
            width: 80,
            id: 'op',
            Cell: (cellProps) => {
              const { service_period_id } = cellProps.original

              return (
                <TableXUtil.OperationCell>
                  <TableXUtil.OperationDetail
                    href={`#/system/setting/service_time/detail?id=${service_period_id}`}
                  />
                  <TableXUtil.OperationDelete
                    disabled={
                      !globalStore.hasPermission(
                        Permission.PERMISSION_ENTERPRISE_DELETE_SERVICE_PERIOD,
                      )
                    }
                    title={t('警告')}
                    onClick={handleDelete.bind(null, service_period_id)}
                  >
                    {t(
                      '确定删除此运营时间吗？请确保此运营时间下所有订单均已处理完成，避免删除后对订单、分拣产生影响，谨慎操作！',
                    )}
                  </TableXUtil.OperationDelete>
                </TableXUtil.OperationCell>
              )
            },
          },
        ]}
      />
    </BoxTable>
  )
}

export default observer(List)
