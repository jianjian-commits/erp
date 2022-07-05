import { t } from 'gm-i18n'
import React, { FC, ChangeEvent } from 'react'
import { observer, Observer } from 'mobx-react'
import {
  BoxForm,
  BoxTable,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  BoxTableInfo,
  Input,
  Flex,
  Confirm,
  Tip,
  RightSideModal,
} from '@gm-pc/react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { usePagination } from '@gm-common/hooks'
import moment from 'moment'

import TableTotalText from '@/common/components/table_total_text'
import store from './store'
import RouteConfigModal from './components/route_config_modal'
import { RouteInfo } from '../interface'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import { useMount } from 'react-use'

const { OperationHeader, OperationDelete, OperationCellRowEdit } = TableXUtil

const RouteManagement: FC = observer(() => {
  const {
    search_text,
    handleSearchText,
    fetchList,
    group_users,
    handleChangeRoute,
    handleCustomerConfigData,
  } = store
  const handleSearch = (): void => {
    run()
  }
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleSearchText(event.target.value)
  }
  const handleDelete = (id: string) => {
    store.delRoute(id).then(() => {
      Tip.success(t('删除成功'))
      return run()
    })
  }

  const { pagination, run } = usePagination<any>((params) => fetchList(params), {
    defaultPaging: {
      need_count: true,
    },
  })

  const handleConfig = (e: MouseEvent, route_id: string, index: number) => {
    e.preventDefault()
    RightSideModal.render({
      children: (
        <RouteConfigModal
          routeId={route_id}
          index={index}
          onUpdateList={() => run()}
        />
      ),
      onHide: RightSideModal.hide,
      style: {
        width: '600px',
      },
    })
  }
  const handleEditRoute = (index: number) => {
    handleChangeRoute(index, 'isEditing', true)
  }
  const handleEditRouteCancel = () => {
    run()
  }
  const handleEditRouteSave = (index: number) => {
    store.updateRouteName(index).then(() => {
      Tip.success(t('编辑成功'))
      run()
      return null
    })
  }

  useMount(() => {
    run()
    handleCustomerConfigData()
  })

  const columns: Column<RouteInfo>[] = [
    {
      Header: t('创建时间'),
      accessor: 'create_time',
      Cell: (cellProps) => {
        return moment(new Date(+cellProps.original.create_time!)).format(
          'YYYY-MM-DD HH:mm',
        )
      },
    },
    {
      Header: t('线路名称'),
      accessor: 'route_name',
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => (
              <>
                {cellProps.original.isEditing ? (
                  <Input
                    type='text'
                    style={{ width: '150px' }}
                    value={cellProps.original.route_name}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      store.handleChangeRoute(
                        cellProps.index,
                        'route_name',
                        event.target.value,
                      )
                    }}
                  />
                ) : (
                  cellProps.original.route_name
                )}
              </>
            )}
          </Observer>
        )
      },
    },
    {
      Header: t('商户配置'),
      accessor: 'address_count',
      Cell: (cellProps) => {
        return (
          <div>
            {globalStore.hasPermission(
              Permission.PERMISSION_DELIVERY_UPDATE_ROUTE,
            ) ? (
              <a
                href='#'
                onClick={(e) => {
                  handleConfig(e, cellProps.original.route_id, cellProps.index)
                }}
              >
                {t('商户配置')}
                {`(${cellProps.original.customers?.length || 0})`}
              </a>
            ) : (
              <div>
                {t('商户配置')}
                {`(${cellProps.original.customers?.length || 0})`}
              </div>
            )}
          </div>
        )
      },
    },
    {
      Header: t('创建人'),
      accessor: 'creator_id',
      Cell: (cellProps) => {
        return (
          group_users[cellProps.original.creator_id!]?.name || t('系统临时账号')
        )
      },
    },
    {
      Header: OperationHeader,
      id: 'carrier_management_operator',
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => (
              <OperationCellRowEdit
                disabled={
                  !globalStore.hasPermission(
                    Permission.PERMISSION_DELIVERY_UPDATE_ROUTE,
                  )
                }
                isEditing={cellProps.original.isEditing}
                onClick={() => handleEditRoute(cellProps.index)}
                onCancel={() => handleEditRouteCancel()}
                onSave={() => handleEditRouteSave(cellProps.index)}
              >
                <OperationDelete
                  disabled={
                    !globalStore.hasPermission(
                      Permission.PERMISSION_DELIVERY_DELETE_ROUTE,
                    )
                  }
                  title={t('警告')}
                  onClick={() => handleDelete(cellProps.original.route_id)}
                >
                  {t('确认删除线路') + `${cellProps.original.route_name}？`}
                </OperationDelete>
              </OperationCellRowEdit>
            )}
          </Observer>
        )
      },
    },
  ]
  return (
    <>
      <BoxForm onSubmit={handleSearch}>
        <FormBlock col={3}>
          <FormItem label={t('搜索')}>
            <Input
              placeholder={t('输入线路名称进行搜索')}
              value={search_text}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleInputChange(e)
              }
            />
          </FormItem>
        </FormBlock>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
        </FormButton>
      </BoxForm>
      <BoxTable
        pagination={pagination}
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('线路列表'),
                  content: store.count,
                },
              ]}
            />
          </BoxTableInfo>
        }
        action={
          <>
            <PermissionJudge
              permission={Permission.PERMISSION_DELIVERY_CREATE_ROUTE}
            >
              <Button
                type='primary'
                onClick={() => {
                  Confirm({
                    children: <CreateCarrier />,
                    title: '新建线路',
                  }).then(
                    () => {
                      store.createRoute().then(() => run())
                      return null
                    },
                    () => {
                      Tip.danger(t('新建失败'))
                    },
                  )
                }}
              >
                {t('新建线路')}
              </Button>
            </PermissionJudge>
          </>
        }
      >
        <Table data={store.list} columns={columns} />
      </BoxTable>
    </>
  )
})
const CreateCarrier: FC = observer(() => {
  const handleChangeCarrierName = (event: ChangeEvent<HTMLInputElement>) => {
    store.handleRouteName('routeName', event.target.value)
  }
  return (
    <Flex column className='gm-padding-10'>
      <Flex>
        <Flex justifyCenter alignCenter>
          {t('线路名称')}:&nbsp;
          <div className='gm-margin-left-10'>
            <Input
              type='text'
              placeholder={t('线路名称')}
              value={store.routeName}
              onChange={handleChangeCarrierName}
            />
          </div>
        </Flex>
      </Flex>
    </Flex>
  )
})

export default RouteManagement
