import BatchActionBarComponent from '@/common/components/batch_action_bar'
import HeaderTip from '@/common/components/header_tip'
import ReleaseTaskModal from '@/pages/production/plan_management/plan/demand/components/list/realeaseTask'
import { ReplaceBomDrawer } from '@/pages/production/plan_management/plan/demand/components/replace_bom_drawer'
import {
  ListTaskViewTitle,
  OmitViewType,
} from '@/pages/production/plan_management/plan/demand/enum'
import { TaskDetailsView } from '@/pages/production/plan_management/plan/demand/interface'
import store from '@/pages/production/plan_management/plan/demand/store'
import planStore from '@/pages/production/plan_management/plan/store'
import Detail from '@/pages/production/task_detail'
import { toFixed } from '@/pages/production/util'
import globalStore from '@/stores/global'
import { UsePaginationPaging } from '@gm-common/hooks'
import { Flex, RightSideModal } from '@gm-pc/react'
import { Button, message, Space, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { map_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import {
  ListTaskRequest_ViewType,
  map_BomType,
  map_Task_State,
  TaskSource_SourceType,
  Task_State,
  Task_Type,
} from 'gm_api/src/production'
import _ from 'lodash'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { FC, useEffect, useState } from 'react'
import Action from './action'
import CellPlanAmount from './cell_plan_amount'
import CellTaskSchedule from './cell_task_schedule'

interface Props {
  /** 删除时执行的动作 */
  onSearchDelete: (list: any[], num: number) => Promise<any>
  paging: UsePaginationPaging
}

const List: FC<Props> = ({ onSearchDelete, paging }) => {
  const viewType = store.filter.view_type
  const { taskDetailsView, taskDetails, fetchDataNumber } = store
  const [releaseTaskVisible, setReleaseTaskVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [choseAll, setChoseAll] = useState(false)
  const { isProduce } = planStore.producePlanCondition
  const TASK_UNIT_TYPE = isProduce ? t('(基本单位)') : t('(包装单位)')
  const TASK_TEXT = isProduce ? t('生产') : t('包装')
  const viewCustomer = viewType === ListTaskRequest_ViewType.VIEW_TYPE_CUSTOMER
  const viewRouter = viewType === ListTaskRequest_ViewType.VIEW_TYPE_ROUTE
  const canEdit = isProduce
    ? globalStore.hasPermission(
        Permission.PERMISSION_PRODUCTION_UPDATE_PRODUCETASK,
      )
    : globalStore.hasPermission(
        Permission.PERMISSION_PRODUCTION_UPDATE_PACKTASK,
      )
  const canDelete = isProduce
    ? globalStore.hasPermission(
        Permission.PERMISSION_PRODUCTION_DELETE_PRODUCETASK,
      )
    : globalStore.hasPermission(
        Permission.PERMISSION_PRODUCTION_DELETE_PACKTASK,
      )
  const hasOperation = canEdit || canDelete

  useEffect(() => {
    setSelectedRowKeys([])
    setReleaseTaskVisible(false)
  }, [viewType])

  /** 搜索时清空选择状态 */
  useEffect(() => {
    setChoseAll(false)
    setSelectedRowKeys([])
  }, [fetchDataNumber])

  const handleToPlanDetail = (
    id: string,
    task_state: number,
    type: Task_Type,
  ) => {
    RightSideModal.render({
      style: { width: '70%' },
      onHide: RightSideModal.hide,
      children: <Detail type={type} task_id={id} task_state={task_state} />,
    })
  }

  const columns: ColumnsType<TaskDetailsView> = [
    {
      title: ListTaskViewTitle[viewType!],
      key: 'related_info',
      width: 150,
      fixed: 'left',
      render: (_, v) => v?.title,
    },
    {
      title: `${t(isProduce ? '生产' : '包装')}成品`,
      width: 150,
      fixed: 'left',
      render: (_, v) => v?.skuName,
    },
    {
      title: t(`${TASK_TEXT}需求编号`),
      width: 160,
      render: (_, { serial_no, task_id, state, type }) => (
        <a
          className='gm-text-primary gm-cursor'
          style={{ textDecoration: 'underline' }}
          onClick={() => handleToPlanDetail(task_id!, state!, type!)}
        >
          {serial_no}
        </a>
      ),
    },
    {
      title: (
        <HeaderTip
          justify='center'
          header={
            <Flex column alignCenter justifyCenter>
              <span>{t('需求数')}</span>
              <span>{TASK_UNIT_TYPE}</span>
            </Flex>
          }
        />
      ),
      width: 150,
      render: (_, { order_amount, unit_name }) =>
        order_amount && `${toFixed(order_amount || '0')}${unit_name}`,
    },
    {
      title: (
        <HeaderTip
          justify='center'
          header={t('计划进度')}
          tip={t(`（已${TASK_TEXT}数/计划${TASK_TEXT}）`)}
        />
      ),
      width: 180,
      render: (_, { task_id }) => <CellTaskSchedule taskId={task_id!} />,
    },
    {
      title: (
        <HeaderTip
          justify='center'
          header={
            <Flex column justifyCenter alignCenter>
              <span>{t(`计划${TASK_TEXT}`)}</span>
              <span>{TASK_UNIT_TYPE}</span>
            </Flex>
          }
        />
      ),
      width: 150,
      render: (_, { task_id }) => <CellPlanAmount taskId={task_id!} />,
    },
    {
      title: (
        <HeaderTip
          justify='center'
          header={
            <Flex column justifyCenter alignCenter>
              <span>{t(`已${TASK_TEXT}`)}</span>
              <span>{TASK_UNIT_TYPE}</span>
            </Flex>
          }
        />
      ),
      width: 150,
      render: (_, { output_amount, unit_name }) => (
        <div>
          {output_amount && `${toFixed(output_amount || '0')}${unit_name}`}
        </div>
      ),
    },
    {
      title: t('需求状态'),
      width: 150,
      render: (_, v) => map_Task_State[v?.state!],
    },
    {
      title: t('订单编号'),
      width: 160,
      render: (__, { taskSources }) => {
        const orderSource = _.find(
          taskSources!,
          (v) => v.source_type === TaskSource_SourceType.SOURCETYPE_ORDER,
        )
        return (
          !!taskSources?.length &&
          (orderSource ? (
            <a
              href={`#/order/order_manage/list/detail?id=${orderSource.order_serial_no}&type=1`}
              className='gm-text-primary gm-cursor'
              style={{ textDecoration: 'underline' }}
              target='_blank'
              rel='noreferrer'
            >
              {orderSource.order_serial_no}
            </a>
          ) : (
            '-'
          ))
        )
      },
    },
    {
      title: t('关联客户'),
      key: 'customer',
      width: 150,
      render: (_, v) => v?.customerName,
    },
    {
      title: t('关联线路'),
      key: 'route',
      width: 150,
      render: (_, v) => v?.routerName,
    },
    {
      title: t('需求备注'),
      width: 150,
      render: (_, v) => v?.batch,
    },
    {
      title: t('BOM名称'),
      width: 150,
      render: (_, v) => v?.bom_name,
    },
    {
      title: t('BOM类型'),
      width: 150,
      render: (_, v) => map_BomType[v?.type!],
    },
    {
      title: t('商品类型'),
      width: 150,
      render: (_, v) => map_Sku_NotPackageSubSkuType[v?.sku_type!],
    },
    {
      title: t('物料类型'),
      width: 150,
      render: (_, { materialType }) => materialType,
    },
    {
      title: t('创建时间'),
      width: 150,
      render: (_, { create_time }) =>
        create_time && moment(+create_time!).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('下达时间'),
      width: 150,
      render: (_, { releaseTime }) => releaseTime,
    },
    {
      title: t('操作'),
      key: 'operation',
      fixed: 'right',
      width: 140,
      render: (_, { state, task_id }) => {
        return state ? (
          <Flex style={{ gap: '8px' }}>
            <Action
              taskId={task_id!}
              editDisabled={!canEdit || state !== Task_State.STATE_PREPARE}
              deleteDisabled={
                !canDelete ||
                state === Task_State.STATE_FINISHED ||
                state === Task_State.STATE_VOID
              }
              onSearchDelete={onSearchDelete}
            />
          </Flex>
        ) : (
          ''
        )
      },
    },
  ]

  const handleReleaseTask = () => {
    setReleaseTaskVisible((v) => !v)
  }

  const handleReplaceMaterial = () => {
    if (choseAll) {
      message.error('勾选所有页内容时无法进行物料替换')
      return
    }
    const allowReplaceTaskIds = _.map(
      _.filter(taskDetails, (v) =>
        [Task_State.STATE_PREPARE, Task_State.STATE_STARTED].includes(v.state!),
      ),
      (v) => v.task_id,
    )

    if (!allowReplaceTaskIds.length) {
      message.error('仅支持未下达/进行中需求替换物料')
      return
    }
    setDrawerVisible(true)
  }

  const handleDrawerClose = () => {
    setDrawerVisible(false)
  }

  const handleSelectChange = (__: any, selectedRows: TaskDetailsView[]) => {
    setChoseAll(false)
    setSelectedRowKeys(
      _.map(
        _.filter(selectedRows, (v) => !v.children?.length),
        (value) => value.task_id!,
      ),
    )
  }

  const handleCheckAll = (isAll: boolean) => {
    setSelectedRowKeys(Object.keys(taskDetails))
    setChoseAll(isAll)
  }

  const handleClose = () => {
    setSelectedRowKeys([])
    setChoseAll(false)
  }

  const rowSelection = {
    selectedRowKeys,
    checkStrictly: false,
    onChange: handleSelectChange,
  }

  return (
    <React.Fragment key={viewType}>
      <BatchActionBarComponent
        className='gm-margin-tb-15'
        selected={selectedRowKeys}
        toggleSelectAll={handleCheckAll}
        onClose={handleClose}
        isSelectAll={choseAll}
        count={choseAll ? paging.count : 1}
        ButtonNode={
          <Space size='middle'>
            <Button
              onClick={handleReleaseTask}
              disabled={selectedRowKeys.length === 0}
            >
              {t('下达任务')}
            </Button>
            {!!globalStore.productionSetting.bom_material_replace_type && (
              <Button
                onClick={handleReplaceMaterial}
                disabled={selectedRowKeys.length === 0}
              >
                {t('物料替换')}
              </Button>
            )}
          </Space>
        }
      />
      <Table
        rowSelection={rowSelection}
        columns={columns.filter((column) => {
          // 过滤掉不需要显示的栏
          switch (column.key) {
            case 'related_info':
              return OmitViewType.includes(viewType!)

            case 'customer':
              return !viewCustomer

            case 'route':
              return !viewRouter

            case 'operation':
              return hasOperation

            default:
              return true
          }
        })}
        rowKey='key'
        dataSource={toJS(taskDetailsView)}
        scroll={{ x: 1300 }}
        pagination={false}
        sticky
        defaultExpandAllRows
      />
      <ReleaseTaskModal
        visible={releaseTaskVisible}
        onChangeVisible={handleReleaseTask}
        selectId={choseAll ? undefined : selectedRowKeys}
      />
      <ReplaceBomDrawer
        type={isProduce ? Task_Type.TYPE_PRODUCE : Task_Type.TYPE_PACK}
        visible={drawerVisible}
        selected={selectedRowKeys}
        onClose={handleDrawerClose}
      />
    </React.Fragment>
  )
}

export default observer(List)
