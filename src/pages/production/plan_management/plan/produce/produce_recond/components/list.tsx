import { ProduceRecondInfo } from '@/pages/production/plan_management/plan/produce/interface'
import TaskDetail from '@/pages/production/plan_management/plan/task/task_detail'
import globalStore from '@/stores/global'
import { Flex, RightSideModal } from '@gm-pc/react'
import { Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { Task_Type } from 'gm_api/src/production'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { FC } from 'react'
import store from '../store'
import Action from './action'
import CellBaseAmount from './cell_base_amount'
import CellPackAmount from './cell_pack_amount'

interface Props {
  refresh: () => void
}

const List: FC<Props> = ({ refresh }) => {
  const canEdit = globalStore.hasPermission(
    Permission.PERMISSION_PRODUCTION_UPDATE_PROCESSTASKOUTPUTLOG,
  )
  const canDelete = globalStore.hasPermission(
    Permission.PERMISSION_PRODUCTION_DELETE_PROCESSTASKOUTPUTLOG,
  )
  const hasOperation = canEdit || canDelete
  const handleOpenDetail = (
    id: string,
    is_combine: boolean,
    type: Task_Type,
  ): void => {
    const isPack = type === Task_Type.TYPE_PACK
    RightSideModal.render({
      style: { width: '70%' },
      onHide: RightSideModal.hide,
      children: (
        <TaskDetail
          process_task_id={id}
          is_pack={isPack}
          is_combine={is_combine}
        />
      ),
    })
  }
  const columns: ColumnsType<ProduceRecondInfo> = [
    {
      title: t('生产成品'),
      dataIndex: 'skuName',
      key: 'skuName',
      align: 'center',
    },
    {
      title: t('商品类型'),
      dataIndex: 'skuType',
      key: 'skuType',
      align: 'center',
    },
    {
      title: t('分类'),
      dataIndex: 'category',
      key: 'category',
      align: 'center',
    },
    {
      title: t('产出数量（基本单位）'),
      dataIndex: 'outputAmount',
      key: 'outputAmount',
      align: 'center',
      width: 140,
      render: (
        _,
        { process_task_output_log_id, base_unit_amount, baseUnit, type },
      ) =>
        type !== Task_Type.TYPE_PACK ? (
          <CellBaseAmount
            process_task_output_log_id={process_task_output_log_id!}
          />
        ) : (
          base_unit_amount + baseUnit
        ),
    },
    {
      title: t('产出数量（包装单位）'),
      dataIndex: 'pack_outputAmount',
      key: 'pack_outputAmount',
      align: 'center',
      width: 140,
      render: (_, { process_task_output_log_id, type }) =>
        type !== Task_Type.TYPE_PACK ? (
          '-'
        ) : (
          <CellPackAmount
            process_task_output_log_id={process_task_output_log_id!}
          />
        ),
    },
    {
      title: t('产出时间'),
      dataIndex: 'create_time',
      key: 'create_time',
      align: 'center',
      width: 170,
      render: (_, { create_time }) =>
        create_time && moment(+create_time!).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('生产车间'),
      dataIndex: 'processorIds',
      key: 'processorIds',
      align: 'center',
      render: (_, { processor_name }) => {
        return processor_name || '-'
      },
    },
    {
      title: t('计划交期'),
      dataIndex: 'delivery_time',
      key: 'delivery_time',
      align: 'center',
      render: (_, { delivery_time }) => {
        delivery_time = delivery_time.split(' ')[0]
        return delivery_time || '-'
      },
    },
    {
      title: t('任务编号'),
      dataIndex: 'serial_no',
      key: 'serial_no',
      align: 'center',
      render: (_, v) => {
        const { process_task_id, serial_no, is_combine, type } = v
        return (
          <a
            className='gm-text-primary gm-cursor'
            onClick={() => handleOpenDetail(process_task_id, is_combine, type!)}
          >
            {serial_no}
          </a>
        )
      },
    },
    {
      title: t('操作'),
      key: 'operation',
      align: 'center',
      width: 140,
      render: (_, v) => {
        const { process_task_output_log_id, use_amount } = v
        return (
          hasOperation && (
            <Flex style={{ gap: '4px' }}>
              <Action
                process_task_output_log_id={process_task_output_log_id}
                editDisabled={!canEdit}
                deleteDisabled={!canDelete || parseFloat(use_amount!) !== 0}
                refresh={refresh}
              />
            </Flex>
          )
        )
      },
    },
  ]

  return (
    <Flex flex>
      <Table<ProduceRecondInfo>
        columns={columns.filter((column) => {
          return column.key !== 'operation' || hasOperation
        })} // 没有编辑和删除的权限就不显示操作栏
        pagination={false}
        rowKey='key'
        dataSource={store.list}
        sticky
      />
    </Flex>
  )
}

export default observer(List)
