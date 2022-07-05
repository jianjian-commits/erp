import React, { useMemo } from 'react'
import { BoxPanel, Button, Select } from '@gm-pc/react'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Table, Column } from '@gm-pc/table-x'
import storeInfo from '../store/storeInfo'

import { DeviceAlarmRule_StrategyData } from 'gm_api/src/device'

import CellInput from './cell_input'
import CellStrategy from './cell_strategy'
import _ from 'lodash'

const RuleList = () => {
  const columns: Column<DeviceAlarmRule_StrategyData>[] = useMemo(
    () => [
      {
        Header: t('序号'),
        width: 100,
        accessor: (_, index) => index + 1,
      },
      {
        Header: t('数据'),
        width: 180,
        Cell: ({ original, index }) => (
          <Observer>
            {() => {
              const { data_type } = original
              return (
                <Select
                  placeholder={t('选择数据')}
                  data={storeInfo.deviceData}
                  value={data_type!}
                  onChange={(value) =>
                    storeInfo.changeStrategyData('data_type', value!, index)
                  }
                />
              )
            }}
          </Observer>
        ),
      },
      {
        Header: t('单位'),
        width: 80,
        Cell: ({ original }) => (
          <Observer>
            {() => {
              const { data_type, unit_name } = original
              const deviceData = storeInfo.deviceData
              return (
                <div>
                  {(unit_name ||
                    _.find(deviceData, { value: data_type })?.unit_name) ??
                    '-'}
                </div>
              )
            }}
          </Observer>
        ),
      },
      {
        Header: t('标准值'),
        width: 140,
        Cell: ({ original, index }) => (
          <CellInput name='standard_value' data={original} index={index} />
        ),
      },
      {
        Header: t('上限'),
        width: 140,
        Cell: ({ original, index }) => (
          <CellInput name='upper_limit_value' data={original} index={index} />
        ),
      },
      {
        Header: t('下限'),
        width: 140,
        Cell: ({ original, index }) => (
          <CellInput name='lower_limit_value' data={original} index={index} />
        ),
      },
      {
        Header: t('策略'),
        // width: 300,
        Cell: ({ original, index }) => (
          <CellStrategy data={original} index={index} />
        ),
      },
      {
        Header: t('操作'),
        width: 100,
        Cell: ({ index }) => {
          return <a onClick={() => storeInfo.deleteRule(index)}>{t('删除')}</a>
        },
      },
    ],
    [],
  )

  return (
    <BoxPanel title={t('策略列表')} collapse>
      <Table
        isVirtualized
        data={storeInfo.strategyData!.slice()}
        columns={columns}
      />
      <Button onClick={storeInfo.addRuleList} type='primary'>
        {t('添加策略')}
      </Button>
    </BoxPanel>
  )
}

export default observer(RuleList)
