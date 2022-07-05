import PermissionJudge from '@/common/components/permission_judge'
import TableTotalText from '@/common/components/table_total_text'
import { history } from '@/common/service'
import globalStore from '@/stores/global'
import { DataAddressName } from '@gm-pc/business'
import {
  BoxTable,
  BoxTableInfo,
  Button,
  Confirm,
  Flex,
  Modal,
  MoreSelect,
  Tip,
  Popover,
  BoxTableProps,
} from '@gm-pc/react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import { PAY_METHOD, getServicePeriodList } from '../../../util'
import store from '../store'
import { ViewCustomer } from '../type'
import BatchImportCustomerAction from './batch_import'
import BatcherStore from '../batch_order_rule/store'
import { orderLimit } from '../../../custom.config.json'
import { getUnNillText } from '@/common/util'
import { Divider, Space } from 'antd'

const { userInfo } = globalStore
const isOrderLimit =
  userInfo.group_id && orderLimit.group_ids.includes(userInfo.group_id)

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  run: () => Promise<any>
  paging: any
}

const List: FC<ListProps> = observer(({ run, paging, pagination }) => {
  const {
    viewList,
    count,
    sendBatchImportCustomer,
    quotationList,
    getWarehouseById,
  } = store
  const handleDelete = (id: string) => {
    store.delCustomer(id).then(() => run())
  }

  return (
    <>
      <BoxTable
        pagination={pagination}
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('商户总数'),
                  content: paging?.count,
                },
              ]}
            />
          </BoxTableInfo>
        }
        action={
          <>
            <PermissionJudge
              permission={Permission.PERMISSION_ENTERPRISE_CREATE_CUSTOMER}
            >
              <Button
                type='primary'
                onClick={() => {
                  if (globalStore.isLite) {
                    history.push(
                      `/customer/society/catering_customer_management/detail?type=createParentCustomer`,
                    )
                    return
                  }
                  Modal.render({
                    children: <CreatCustomer />,
                    title: '新建客户',
                  })
                }}
              >
                {t('新建外部客户')}
              </Button>
            </PermissionJudge>
            <Button
              className='gm-margin-left-10'
              onClick={() => {
                Confirm({
                  children: <BatchImportCustomerAction />,
                  title: '批量导入客户信息',
                  size: 'md',
                }).then(async () => {
                  if (!store.batchImportUploadUrl) return
                  await sendBatchImportCustomer()
                  globalStore.showTaskPanel('1')
                  Tip.success(t('导入成功'))
                  return null
                })
              }}
            >
              {t('批量导入')}
            </Button>
          </>
        }
      >
        <Table<ViewCustomer>
          isDiy
          isBatchSelect={!!isOrderLimit}
          id='school_list_table'
          columns={[
            {
              Header: t('客户编码'),
              accessor: 'customer_id',
              Cell: (cellProps) => {
                return <div>{cellProps.original.customized_code}</div>
              },
              minWidth: 130,
            },
            {
              Header: t('客户名称'),
              accessor: 'name',
              Cell: (cellProps) => {
                return <div>{cellProps.original.name}</div>
              },
              minWidth: 134,
            },
            {
              Header: t('报价单'),
              accessor: 'quotation_id',
              hide: globalStore.isLite,
              diyEnable: true,
              diyItemText: t('报价单'),
              Cell: (cellProps) => {
                const result = _.find(
                  quotationList,
                  (item) => item.value === cellProps.original.quotation_id,
                )
                return <div>{(result && result.text) || ''}</div>
              },
              width: 134,
            },
            {
              Header: t('销售经理'),
              accessor: 'sales_group_user_ids',
              hide: globalStore.isLite,
              diyEnable: true,
              diyItemText: t('销售经理'),
              Cell: (cellProps) => {
                return (
                  <div>
                    {store.group_users[cellProps.original.sales_group_user_id!]
                      ?.name || t('无')}
                  </div>
                )
              },
              width: 134,
            },
            {
              Header: t('开户经理'),
              accessor: 'create_group_user_ids',
              hide: globalStore.isLite,
              diyEnable: true,
              diyItemText: t('开户经理'),
              Cell: (cellProps) => {
                return (
                  <div>
                    {store.group_users[cellProps.original.create_group_user_id!]
                      ?.name || t('无')}
                  </div>
                )
              },
              width: 134,
            },
            {
              Header: t('客户标签'),
              accessor: 'tags',
              hide: globalStore.isLite,
              diyEnable: true,
              diyItemText: t('客户标签'),
              Cell: (cellProps) => {
                return (
                  <div>
                    {store.customer_labels[
                      cellProps.original.customer_label_id[0]
                    ]?.name || ''}
                  </div>
                )
              },
              width: 134,
            },
            {
              Header: t('发货仓库'),
              accessor: 'warehouse_id',
              diyEnable: true,
              show: !globalStore.isLite,
              Cell: (cellProps: any) => {
                const { warehouse_id } = cellProps.original
                return getUnNillText(getWarehouseById(warehouse_id)?.name)
              },
              width: 134,
            },
            {
              Header: t('运营时间'),
              accessor: 'service_period_ids',
              hide: globalStore.isLite,
              Cell: (cellProps) => {
                let servicePeriodList = getServicePeriodList(
                  cellProps.original.service_period_id,
                  store.listServicePeriod,
                )
                servicePeriodList = _.filter(servicePeriodList, (v) => v)
                return (
                  <div>
                    {servicePeriodList.length > 3 ? (
                      <Popover
                        type='hover'
                        popup={
                          <div
                            className='gm-padding-10'
                            style={{ width: '300px' }}
                          >
                            {servicePeriodList.join()}
                          </div>
                        }
                      >
                        <span className='b-text-overflow'>
                          {servicePeriodList.slice(0, 3).join() + '...'}
                        </span>
                      </Popover>
                    ) : (
                      servicePeriodList.join()
                    )}
                  </div>
                )
              },
              diyEnable: true,
              diyItemText: t('运营时间'),
              width: 134,
            },
            {
              Header: t('地理标签'),
              accessor: 'geolabel',
              hide: globalStore.isLite,
              Cell: (cellProps) => {
                const address = {
                  city_id: cellProps.original.attrs?.addresses![0].city_id,
                  district_id:
                    cellProps.original.attrs?.addresses![0].district_id,
                  street_id: cellProps.original.attrs?.addresses![0].street_id,
                }
                return <DataAddressName address={address} />
              },
              diyEnable: true,
              diyItemText: t('地理标签'),
              width: 134,
            },
            {
              Header: t('结款周期'),
              accessor: 'credit_type',
              hide: globalStore.isLite,
              Cell: (cellProps) => {
                return <div>{PAY_METHOD[cellProps.original.credit_type!]}</div>
              },
              diyEnable: true,
              diyItemText: t('结款周期'),
              width: 134,
            },
            {
              Header: t('冻结状态'),
              accessor: 'is_frozen',
              hide: globalStore.isLite,
              Cell: (cellProps) => {
                return (
                  <div>
                    {cellProps.original.is_frozen ? t('冻结') : t('未冻结')}
                  </div>
                )
              },
              diyEnable: true,
              diyItemText: t('冻结状态'),
              width: 134,
            },
            {
              Header: t('白名单状态'),
              accessor: 'is_in_whitelist',
              hide: globalStore.isLite,
              Cell: (cellProps) => {
                return (
                  <div>
                    {cellProps.original.is_in_whitelist ? t('开启') : t('关闭')}
                  </div>
                )
              },
              diyEnable: true,
              diyItemText: t('白名单状态'),
              width: 134,
            },
            // 操作
            {
              Header: t('操作'),
              id: 'student_meal_customer_operator',
              diyItemText: t('操作'),
              diyEnable: false,
              minWidth: 200,
              Cell: (cellProps) => {
                return (
                  <Space>
                    <Button
                      type='link'
                      className='gm-padding-0'
                      onClick={() => {
                        history.push(
                          `/customer/society/catering_customer_management/detail?type=updateCustomer&customer_id=${
                            cellProps.original.customer_id
                          }&quotation_id=${JSON.stringify(
                            cellProps.original.quotation_id,
                          )}&service_period_id=${JSON.stringify(
                            cellProps.original.service_period_id,
                          )}&create_group_user_id=${JSON.stringify(
                            cellProps.original.create_group_user_id,
                          )}&sales_group_user_id=${JSON.stringify(
                            cellProps.original.sales_group_user_id,
                          )}&customer_label_id=${JSON.stringify(
                            cellProps.original.customer_label_id[0] || '',
                          )}&menu_id=${JSON.stringify(
                            cellProps.original.menu_id,
                          )}`,
                        )
                      }}
                    >
                      {t('编辑')}
                    </Button>
                    <Divider type='vertical' />
                    <Button
                      type='link'
                      className='gm-padding-0'
                      disabled={
                        !globalStore.hasPermission(
                          Permission.PERMISSION_ENTERPRISE_DELETE_CUSTOMER,
                        )
                      }
                      onClick={() =>
                        handleDelete(cellProps.original.customer_id)
                      }
                    >
                      {t('删除')}
                    </Button>
                    {globalStore.isLite && (
                      <>
                        <Divider type='vertical' />
                        <Button
                          type='link'
                          className='gm-padding-0'
                          onClick={() => {
                            history.push(
                              `/customer/society/catering_customer_management/agreement_price?customer_id=${cellProps.original.customer_id}`,
                            )
                          }}
                        >
                          {t('协议价')}
                        </Button>
                      </>
                    )}
                  </Space>
                )
              },
            },
          ]}
          data={viewList}
          keyField='customer_id'
          batchActions={
            isOrderLimit
              ? [
                  {
                    children: t('批量设置下单规则'),
                    onAction: (selected: string[], isSelectedAll: boolean) => {
                      BatcherStore.setSelect(selected)
                      BatcherStore.setIsSelectedAll(isSelectedAll)
                      history.push(
                        `/customer/society/catering_customer_management/batch_order_rule?customer_ids=${JSON.stringify(
                          isSelectedAll ? [] : selected,
                        )}&isSelectedAll=${isSelectedAll}`,
                      )
                    },
                  },
                ]
              : undefined
          }
        />
      </BoxTable>
    </>
  )
})

const CreatCustomer: FC = observer(() => {
  useEffect(() => {
    store.fetchParentList()
  }, [])
  const handleSelectParentCustomer = (selected: any) => {
    const data = _.trim(selected)
    if (data) {
      const id = selected.value
      history.push(
        `/customer/society/catering_customer_management/detail?type=createChildCustomer&customer_id=${id}`,
      )
    }
    Modal.hide()
  }
  return (
    <Flex column className='gm-padding-10'>
      <Flex>
        <Flex justifyCenter alignCenter>
          {t('账户信息')}:&nbsp;
          <div
            style={{ width: '180px', fontSize: '12px' }}
            className='gm-padding-right-5'
          >
            <MoreSelect
              data={_.map(store.listParent, (item) => {
                return {
                  text: `${item.name}(${item.customized_code})`,
                  value: item.customer_id,
                }
              })}
              renderListFilterType='pinyin'
              selected={[]}
              onSelect={handleSelectParentCustomer}
            />
          </div>
          <Button
            type='link'
            onClick={() => {
              history.push(
                `/customer/society/catering_customer_management/detail?type=createParentCustomer`,
              )
              Modal.hide()
            }}
          >
            {t('如无账户信息，点此创建')}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
})

export default List
