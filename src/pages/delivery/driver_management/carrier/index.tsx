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
} from '@gm-pc/react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { usePagination } from '@gm-common/hooks'
import { useMount } from 'react-use'
import TableTotalText from '@/common/components/table_total_text'
import store from './store'
import { DistributionContractorInfo } from '../../interface'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'

const { OperationHeader, OperationDelete, OperationCellRowEdit } = TableXUtil

const CarrierList: FC = observer(() => {
  const {
    search_text,
    handleSearchText,
    fetchList,
    handleChangeDistributionContractor,
  } = store
  const handleSearch = (): void => {
    run()
  }
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleSearchText(event.target.value)
  }
  const handleDelete = (id: string) => {
    store.delDistributionContractor(id).then(() => {
      Tip.success(t('删除成功'))
      run()
      return null
    })
  }

  const handleEditRoute = (index: number) => {
    handleChangeDistributionContractor(index, 'isEditing', true)
  }
  const handleEditRouteCancel = () => {
    run()
  }
  const handleEditRouteSave = (index: number) => {
    store.updateDistributionContractor(index).then(() => {
      Tip.success(t('编辑成功'))
      run()
      return null
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

  useMount(run)

  const columns: Column<DistributionContractorInfo>[] = [
    {
      Header: t('承运商编号'),
      accessor: 'distribution_contractor_id',
    },
    {
      Header: t('承运商'),
      accessor: 'name',
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => (
              <>
                {cellProps.original.isEditing ? (
                  <Input
                    type='text'
                    style={{ width: '150px' }}
                    value={cellProps.original.name}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      store.handleChangeDistributionContractor(
                        cellProps.index,
                        'name',
                        event.target.value,
                      )
                    }}
                  />
                ) : (
                  cellProps.original.name
                )}
              </>
            )}
          </Observer>
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
                    Permission.PERMISSION_ENTERPRISE_UPDATE_DISTRIBUTION_CONTRACTOR,
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
                      Permission.PERMISSION_ENTERPRISE_DELETE_DISTRIBUTION_CONTRACTOR,
                    )
                  }
                  title={t('警告')}
                  onClick={() =>
                    handleDelete(cellProps.original.distribution_contractor_id)
                  }
                >
                  {t('确认删除承运商') + `${cellProps.original.name}？`}
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
              placeholder={t('输入承运商名称、编号进行搜索')}
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
                  label: t('承运商列表'),
                  content: store.count,
                },
              ]}
            />
          </BoxTableInfo>
        }
        action={
          <>
            <PermissionJudge
              permission={
                Permission.PERMISSION_ENTERPRISE_CREATE_DISTRIBUTION_CONTRACTOR
              }
            >
              <Button
                type='primary'
                onClick={() => {
                  Confirm({
                    children: <CreateCarrier />,
                    title: '新建承运商',
                  }).then(
                    () => {
                      store.createDistributionContractor().then(() => run())
                      Tip.success(t('新建成功'))
                      return null
                    },
                    () => {
                      Tip.danger(t('新建失败'))
                    },
                  )
                }}
              >
                {t('新建承运商')}
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
    store.handleDistributionContractorName(event.target.value)
  }
  return (
    <Flex column className='gm-padding-10'>
      <Flex>
        <Flex justifyCenter alignCenter>
          {t('承运商名称')}:&nbsp;
          <div className='gm-margin-left-10'>
            <Input
              type='text'
              placeholder={t('承运商名称')}
              value={store.distributionContractorName}
              onChange={handleChangeCarrierName}
            />
          </div>
        </Flex>
      </Flex>
    </Flex>
  )
})

export default CarrierList
