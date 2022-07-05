import { i18next } from 'gm-i18n'
import React, { useEffect } from 'react'
import { BoxTable, BoxTableInfo, Tip, Button } from '@gm-pc/react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import qs from 'query-string'
import store from './store'
import moment from 'moment'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { ORDER_IMPORT_TYPE } from './enum'
import TableTotalText from '@/common/components/table_total_text'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import globalStore from '@/stores/global'

const Action = () => (
  <div>
    <PermissionJudge
      permission={Permission.PERMISSION_PREFERENCE_CREATE_IMPORT_TEMPLATE}
    >
      <Button
        type='primary'
        onClick={() => {
          window.location.href = '#/system/template/order_template/create'
        }}
      >
        {i18next.t('新建模板')}
      </Button>
    </PermissionJudge>
  </div>
)

export default observer(() => {
  const fetchList = async () => {
    await store.getList()
  }

  const handleDel = (id: string) => {
    store.del(id).then(() => {
      fetchList()
      Tip.success(i18next.t('删除成功'))
      return null
    })
  }

  useEffect(() => {
    fetchList()
  }, [])

  const { list } = store
  const addPermission = true
  const deletePermission = true
  const tableInfo = [{ label: '订单导入模板列表', content: list.length }]

  return (
    <div className='b-order-printer-list'>
      <BoxTable
        headerProps={{ style: { backgroundColor: '#fff' } }}
        info={
          <BoxTableInfo>
            <TableTotalText data={tableInfo} />
          </BoxTableInfo>
        }
        action={addPermission ? <Action /> : null}
      >
        <Table
          data={list.slice()}
          columns={[
            {
              Header: i18next.t('创建时间'),
              id: 'create_time',
              accessor: (d: any) =>
                moment(new Date(+d.create_time)).format('YYYY-MM-DD HH:mm'),
            },
            {
              Header: i18next.t('模板名称'),
              accessor: 'name',
            },
            {
              Header: i18next.t('模板类型'),
              id: 'type',
              accessor: (d: any) => {
                const target = _.find(
                  ORDER_IMPORT_TYPE,
                  (item) => item.value === d.type,
                )
                return target ? target.text : '-'
              },
            },
            {
              Header: i18next.t('创建人'),
              accessor: 'creator.name',
            },
            {
              width: 80,
              id: 'operation',
              Header: TableXUtil.OperationHeader,
              Cell: (props) => (
                <TableXUtil.OperationCell>
                  <TableXUtil.OperationDetail
                    href={`#/system/template/order_template/detail?${qs.stringify(
                      { id: props.original.order_import_templete_id },
                    )}`}
                  />
                  {deletePermission && (
                    <TableXUtil.OperationDelete
                      disabled={
                        !globalStore.hasPermission(
                          Permission.PERMISSION_PREFERENCE_DELETE_IMPORT_TEMPLATE,
                        )
                      }
                      title='警告'
                      onClick={handleDel.bind(
                        null,
                        props.original.order_import_templete_id,
                      )}
                    >
                      {i18next.t('确定删除模板吗？')}
                    </TableXUtil.OperationDelete>
                  )}
                </TableXUtil.OperationCell>
              ),
            },
          ]}
        />
      </BoxTable>
    </div>
  )
})
