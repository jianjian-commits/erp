import React, { FC } from 'react'
import {
  DeviceAlarmRule,
  DeviceAlarmRule_Status,
  ListDeviceAlarmRuleRequest_PagingField,
} from 'gm_api/src/device'
import Options from '@/pages/iot/device_management/components/options'
import { Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { BoxTable, Tip, BoxTableProps } from '@gm-pc/react'
import { Button } from 'antd'
import { history } from '@/common/service'
import storeList from '../store/storeList'
import { formatDateTime } from '@/common/util'
import SwitchEnum from '@/pages/iot/device_management/components/switchEnum'
import { observer } from 'mobx-react'
import { getSort } from '@/pages/iot/device_management/util'

const List: FC<
  { onFetchList: () => {}; offset: number } & Pick<BoxTableProps, 'pagination'>
> = ({ onFetchList, offset, pagination }) => {
  const handleCreate = () => {
    history.push('/iot/device_management/alerts/create')
  }

  const searchList = () => {
    Tip.success('操作成功')
    onFetchList()
  }

  const handleUpdateState = (
    device_alarm_rule_id: string,
    status: DeviceAlarmRule_Status,
  ) => {
    storeList
      .handleUpdateState(device_alarm_rule_id, status)
      .then(() => searchList())
  }

  const handleDelete = (id: string) => {
    storeList.deleteAlarmRule(id).then(() => searchList())
  }

  const columns: Column<DeviceAlarmRule>[] = [
    {
      Header: t('序号'),
      minWidth: 120,
      id: 'index' as any,
      accessor: (_, index) => offset + index + 1,
    },
    {
      Header: t('规则ID'),
      minWidth: 150,
      accessor: 'device_alarm_rule_id',
      id: ListDeviceAlarmRuleRequest_PagingField.DEVICE_ALARM_RULE_ID as any,
      headerSort: true,
    },
    {
      Header: t('规则名称'),
      minWidth: 120,
      accessor: 'device_alarm_rule_name',
      diyEnable: false,
      id: ListDeviceAlarmRuleRequest_PagingField.DEVICE_ALARM_RULE_NAME as any,
      headerSort: true,
    },
    {
      Header: t('设备型号'),
      minWidth: 120,
      accessor: 'device_model_name',
      id: 'device_model_name',
    },
    {
      Header: t('创建时间'),
      minWidth: 120,
      accessor: ({ create_time }) => formatDateTime(+create_time!),
      id: ListDeviceAlarmRuleRequest_PagingField.CREATE_TIME as any,
      headerSort: true,
    },
    {
      Header: t('创建用户'),
      minWidth: 120,
      accessor: 'creater_name',
      id: 'creater_name',
    },
    {
      Header: t('启动状态'),
      width: 80,
      id: 'status',
      Cell: ({ original: { status, device_alarm_rule_id } }) => {
        return (
          <SwitchEnum<DeviceAlarmRule_Status>
            status={status!}
            trueValue={DeviceAlarmRule_Status.STATUS_ENABLE}
            falseValue={DeviceAlarmRule_Status.STATUS_DISABLE}
            onEnumChange={(check) =>
              handleUpdateState(device_alarm_rule_id, check)
            }
          />
        )
      },
    },
    {
      Header: t('备注'),
      minWidth: 120,
      id: 'remarks',
      accessor: ({ remarks }) => (
        <div className='b-ellipsis-order-remark' title={remarks}>
          {remarks || '-'}
        </div>
      ),
    },
    {
      Header: t('操作'),
      minWidth: 180,
      diyEnable: false,
      id: 'option' as any,
      Cell: ({
        original: { device_alarm_rule_name, device_alarm_rule_id },
      }) => {
        return (
          <Options
            name={device_alarm_rule_name!}
            url={`/iot/device_management/alerts/edit?alarm_rule_id=${device_alarm_rule_id}`}
            onDelete={() => handleDelete(device_alarm_rule_id)}
          />
        )
      },
    },
  ]

  return (
    <BoxTable
      pagination={pagination}
      action={
        <Button type='primary' onClick={handleCreate}>
          {t('创建规则')}
        </Button>
      }
    >
      <Table<DeviceAlarmRule>
        isDiy
        data={storeList.list.slice()}
        columns={columns}
        onHeadersSort={(des) => {
          storeList.changeFilter('sortby', getSort(des))
          onFetchList()
        }}
      />
    </BoxTable>
  )
}

export default observer(List)
