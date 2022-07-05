import store from '@/pages/production/plan_management/plan/store'
import globalStore from '@/stores/global'
import SVGCompleted from '@/svg/completed.svg'
import SVGRemove from '@/svg/remove.svg'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Flex, Input } from '@gm-pc/react'
import { Popover } from 'antd'
import Big from 'big.js'
import classNames from 'classnames'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import {
  map_ProductionOrder_State,
  ProductionOrder_State,
} from 'gm_api/src/production'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { FC, useState } from 'react'

const PlanInfo: FC<{ index: number; isDefault?: boolean }> = ({
  index,
  isDefault,
}) => {
  const data = store.productionPlanList[index] || {}
  const {
    state,
    name,
    delivery_time,
    lineName,
    output_amount_sum,
    plan_amount_sum,
  } = data
  const [inputName, setInputName] = useState(false)
  const [itemName, setItemName] = useState(name)

  const Status = () => {
    return (
      <Flex
        alignCenter
        justifyCenter
        className={classNames('plan-info-status', {
          'plan-info-status-ing ':
            state === ProductionOrder_State.STATE_STARTED,
        })}
      >
        {map_ProductionOrder_State[state!]}
      </Flex>
    )
  }

  const Delay = () => (
    <>
      <span className='plan-info-delivery'>
        {state === ProductionOrder_State.STATE_STARTED &&
          Date.now() - +delivery_time! >= 0 &&
          Big(+output_amount_sum! || 0)
            .div(+plan_amount_sum! || '1')
            .lt(1) && (
            <>
              <ExclamationCircleOutlined />
              <span>{t('已延期')}</span>
            </>
          )}
      </span>
    </>
  )
  const handleChangeName = () => {
    if (
      !globalStore.hasPermission(
        Permission.PERMISSION_PRODUCTION_UPDATE_PRODUCTIONORDER_NAME,
      )
    ) {
      return
    }

    !isDefault && setInputName((v) => !v)
  }

  const handleUpdatedName = (v: string) => {
    setItemName(v)
  }

  const handleOk = async () => {
    await store.updateProductionOrder({ ...data, name: itemName })
    store.fetchList()
  }

  return (
    <div className='b-plan-info'>
      <Flex alignCenter className='plan-info-title'>
        <Status />
        {inputName ? (
          <Flex alignCenter>
            <Input
              value={itemName}
              onChange={(e) => handleUpdatedName(e.currentTarget.value)}
            />
            <span
              className='b-factory-edit-icon'
              title={t('保存')}
              onClick={handleOk}
            >
              <SVGCompleted />
            </span>
            <div className='gm-gap-5' />
            <span
              className='b-factory-edit-icon'
              title={t('取消')}
              onClick={handleChangeName}
            >
              <SVGRemove />
            </span>
          </Flex>
        ) : (
          <Popover
            placement='right'
            content={
              <div style={{ width: '250px', wordWrap: 'break-word' }}>
                {name}
              </div>
            }
            trigger='hover'
          >
            <span
              className='gm-text-bold gm-text-16 b-order-name'
              onClick={handleChangeName}
            >
              {name}
            </span>
          </Popover>
        )}
      </Flex>
      <Flex
        column={!isDefault}
        className={classNames({ 'gm-text-14': isDefault })}
      >
        <div className='gm-margin-right-20'>
          <span>{t('计划交期: ')}</span>
          <span className='gm-margin-right-10'>
            {moment(+delivery_time!).format('YYYY.MM.DD')}
          </span>
          <Delay />
        </div>
        <div className={classNames({ 'gm-margin-top-5': !isDefault })}>{`${t(
          '生产产线',
        )}: ${lineName || '-'}`}</div>
      </Flex>
    </div>
  )
}

export default observer(PlanInfo)
