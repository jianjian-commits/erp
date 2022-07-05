import PermissionButton from '@/common/components/permission_button'
import { PlanModal } from '@/pages/production/plan_management/plan/components/plan_modal'
import { ListProductionOrderFilter } from '@/pages/production/plan_management/plan/interface'
import CreatePlan from '@/pages/production/plan_management/plan/produce_plan/components/side/create_plan'
import store from '@/pages/production/plan_management/plan/store'
import { PlusOutlined } from '@ant-design/icons'
import { DateRangePicker, Flex, Select } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Permission } from 'gm_api/src/enterprise'
import { Select_ProductionOrder_State } from 'gm_api/src/production/pc'
import { observer } from 'mobx-react'
import React, { useRef, useState } from 'react'

const PlanListFilter = () => {
  const [visible, setVisible] = useState(false)
  const planRef = useRef<{ getParams: () => Promise<any> }>()
  const {
    productionPlanFilter: { begin_time, end_time, state, production_line_id },
    productionLineList,
  } = store

  const handleChangeFilter = <T extends keyof ListProductionOrderFilter>(
    key: T,
    value: ListProductionOrderFilter[T],
  ) => {
    store.updateProductionPlanFilter(key, value)
  }

  const handleDateChange = (begin_time: Date, end_time: Date) => {
    if (begin_time && end_time) {
      store.updateProductionPlanAllFilter({
        ...store.productionPlanFilter,
        begin_time,
        end_time,
      })
    }
  }

  const handleChangeVisible = () => {
    setVisible((bool) => !bool)
  }

  const handleCreatePlan = async () => {
    const params = await planRef.current?.getParams()
    store.createProductionOrder(params).then(() => {
      store.fetchList()
      handleChangeVisible()
    })
  }

  return (
    <>
      <Flex column className='b-plan-side-header'>
        <Flex className='plan-side-filter' column>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            onChange={handleDateChange}
          />
          <Select_ProductionOrder_State
            all={{ text: t('全部计划状态') }}
            value={state}
            onChange={(value) => handleChangeFilter('state', value)}
          />
          <Select
            value={production_line_id}
            data={[
              { label: '未选择生产产线', text: '未选择生产产线', value: '1' },
              ...productionLineList,
            ]}
            onChange={(value) =>
              handleChangeFilter('production_line_id', value)
            }
            placeholder={t('选择生产产线')}
            all={{ text: t('全部产线'), value: '0' }}
          />
        </Flex>
        <Flex className='plan-side-create' justifyBetween alignCenter>
          <div>{t('生产计划列表')}</div>
          <PermissionButton
            permission={Permission.PERMISSION_PRODUCTION_CREATE_PRODUCTIONORDER}
            onClick={handleChangeVisible}
          >
            <PlusOutlined />
            {t('新建')}
          </PermissionButton>
        </Flex>
      </Flex>
      <PlanModal
        title={t('新建生产计划')}
        visible={visible}
        onCancel={handleChangeVisible}
        onOk={handleCreatePlan}
        destroyOnClose
      >
        <CreatePlan ref={planRef} />
      </PlanModal>
    </>
  )
}

export default observer(PlanListFilter)
