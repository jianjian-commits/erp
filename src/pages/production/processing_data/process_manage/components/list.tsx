import TableTotalText from '@/common/components/table_total_text'
import { history } from '@/common/service'
import globalStore from '@/stores/global'
import {
  BoxTable,
  BoxTableInfo,
  BoxTableProps,
  Button,
  Tip,
} from '@gm-pc/react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import {
  ProcessTemplate_Status,
  ProcessType_Status,
} from 'gm_api/src/production'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import store from '../store'

const { OperationHeader, OperationCell, OperationDetail, OperationDelete } =
  TableXUtil

const List: FC<Pick<BoxTableProps, 'pagination'>> = observer(
  ({ pagination }) => {
    const { processList, processTypeList } = store

    const handleDelete = (id: string) => {
      store.deleteProcess(id).then((json) => {
        Tip.success(t('删除成功'))
        return json
      })
    }

    const handleToDetail = (process_template_id: string) => {
      history.push(
        `/production/processing_data/process_manage/detail?id=${process_template_id}`,
      )
    }

    const handleCreate = () => {
      const defaultType = _.find(
        processTypeList,
        (p) => !!(+(p.status || 0) & ProcessType_Status.STATUS_DEFAULT),
      )?.process_type_id
      // 默认带上未分类工序类型的id
      history.push(
        `/production/processing_data/process_manage/create?type_id=${defaultType}`,
      )
    }

    return (
      <BoxTable
        pagination={pagination}
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('工序数'),
                  content: store.processesCount,
                },
              ]}
            />
          </BoxTableInfo>
        }
        action={
          globalStore.hasPermission(
            Permission.PERMISSION_PRODUCTION_CREATE_PROCESS,
          ) && (
            <Button type='primary' onClick={handleCreate}>
              {t('新建工序')}
            </Button>
          )
        }
      >
        <Table
          columns={[
            {
              Header: t('工序编码'),
              id: 'customized_code',
              Cell: (cellProps) => {
                const {
                  original: { customized_code },
                } = cellProps
                return <div>{customized_code || '-'}</div>
              },
            },
            {
              Header: t('工序名称'),
              id: 'name',
              Cell: (cellProps) => {
                const {
                  original: { name },
                } = cellProps
                return <div>{name || '-'}</div>
              },
            },
            {
              Header: t('工序类型'),
              id: 'process_type_id',
              Cell: (cellProps) => {
                const { processTypeList } = store
                const {
                  original: { process_type_id },
                } = cellProps

                const process = _.find(
                  processTypeList,
                  (p) => p.value === process_type_id,
                )
                return <div>{process?.text || '-'}</div>
              },
            },
            {
              Header: OperationHeader,
              accessor: 'operation',
              hide:
                !globalStore.hasPermission(
                  Permission.PERMISSION_PRODUCTION_UPDATE_PROCESS,
                ) &&
                !globalStore.hasPermission(
                  Permission.PERMISSION_PRODUCTION_DELETE_PROCESS,
                ),
              Cell: (cellProps) => {
                const {
                  original: { process_template_id, status },
                } = cellProps

                // 包装工序不可删除
                return (
                  <OperationCell>
                    {globalStore.hasPermission(
                      Permission.PERMISSION_PRODUCTION_UPDATE_PROCESS,
                    ) && (
                      <OperationDetail
                        onClick={() => handleToDetail(process_template_id)}
                      />
                    )}
                    {!(status & ProcessTemplate_Status.STATUS_DEFAULT) &&
                      globalStore.hasPermission(
                        Permission.PERMISSION_PRODUCTION_DELETE_PROCESS,
                      ) && (
                        <OperationDelete
                          title={t('确认删除')}
                          onClick={() => handleDelete(process_template_id)}
                          read={t('我已阅读以上提示，确认删除工序')}
                        >
                          {t(
                            '删除工序后只影响未生成的计划，已生成的计划不受影响',
                          )}
                        </OperationDelete>
                      )}
                  </OperationCell>
                )
              },
            },
          ]}
          data={processList.slice()}
        />
      </BoxTable>
    )
  },
)

export default List
