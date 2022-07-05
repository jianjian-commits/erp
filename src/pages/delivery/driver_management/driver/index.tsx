import { t } from 'gm-i18n'
import React, { FC, ChangeEvent } from 'react'
import { observer } from 'mobx-react'
import {
  BoxForm,
  BoxTable,
  FormBlock,
  FormItem,
  FormButton,
  Button,
  BoxTableInfo,
  Input,
  Tip,
} from '@gm-pc/react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { usePagination } from '@gm-common/hooks'
import _ from 'lodash'

import TableTotalText from '@/common/components/table_total_text'
import type { GroupUser } from 'gm_api/src/enterprise'
import store from './store'
import { history } from '@/common/service'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'
import { useMount } from 'react-use'

const { OperationHeader, OperationDetail, OperationDelete, OperationCell } =
  TableXUtil

const DriverList: FC = observer(() => {
  const {
    search_text,
    handleSearchText,
    fetchList,
    fetchDistributionContractorList,
    distributionContractorList,
    delDriver,
  } = store
  const handleSearch = (): void => {
    run()
  }
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleSearchText(event.target.value)
  }
  const handleDelete = (id: string) => {
    delDriver(id).then(() => {
      Tip.success(t('删除成功'))
      return run()
    })
  }

  const { pagination, run } = usePagination<any>(
    (params) => fetchList(params),
    {
      defaultPaging: {
        need_count: true,
      },
    },
  )

  useMount(() => {
    run && run()
    fetchDistributionContractorList()
  })

  const columns: Column<GroupUser>[] = [
    {
      Header: t('司机账号'),
      accessor: 'username',
      Cell: (cellProps) => cellProps.original.username || '-',
    },
    {
      Header: t('承运商'),
      accessor: 'distribution_contractor_id',
      Cell: (cellProps) => {
        return (
          _.find(
            distributionContractorList,
            (item) =>
              item.distribution_contractor_id ===
              cellProps.original.distribution_contractor_id,
          )?.name || '-'
        )
      },
    },
    {
      Header: t('司机名'),
      accessor: 'name',
    },
    {
      Header: t('手机号'),
      Cell: (cellProps) => cellProps.original.phone || '-',
      accessor: 'phone',
    },
    {
      Header: t('车牌号码'),
      Cell: (cellProps) =>
        cellProps.original.attrs!?.car_license_plate_number || '-',
      accessor: 'plate_number',
    },
    {
      Header: t('账号状态'),
      Cell: (cellProps) =>
        cellProps.original.is_valid ? (
          t('有效')
        ) : (
          <span style={{ color: '#ccc' }}>{t('无效')}</span>
        ),
      accessor: 'state',
    },
    {
      Header: OperationHeader,
      id: 'driver_management_operator',
      Cell: (cellProps) => {
        return (
          <OperationCell>
            <OperationDetail
              href={`#/delivery/driver_management/driver/detail?id=${cellProps.original.group_user_id}`}
              open
            />
            <OperationDelete
              disabled={
                !globalStore.hasPermission(
                  Permission.PERMISSION_ENTERPRISE_DELETE_DRIVER,
                )
              }
              title={t('警告')}
              onClick={() => handleDelete(cellProps.original.group_user_id)}
            >
              {t('确认删除司机') + `${cellProps.original.name}？`}
            </OperationDelete>
          </OperationCell>
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
              placeholder={t('输入司机名、手机号进行搜索')}
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
                  label: t('司机列表'),
                  content: store.count,
                },
              ]}
            />
          </BoxTableInfo>
        }
        action={
          <>
            <PermissionJudge
              permission={Permission.PERMISSION_ENTERPRISE_CREATE_DRIVER}
            >
              <Button
                type='primary'
                onClick={() => {
                  history.push(`/delivery/driver_management/driver/detail`)
                }}
              >
                {t('新建司机')}
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

export default DriverList
