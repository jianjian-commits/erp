import { Form } from 'antd'
import { ProductionPlanTime, ProductionPlanOrder } from './enunm'
import _ from 'lodash'
import React, { FC } from 'react'
import TimeRow from './time_row'
import CascaderProductPlan from './cascade_plan'
import { DefaultOptionType } from 'antd/lib/cascader'
import { Filters_Bool } from 'gm_api/src/common'
import JoinOrder from './join_order'

const ReleaseProductPlan: FC<{ options: DefaultOptionType[] }> = ({
  options,
}) => {
  return (
    <>
      <JoinOrder />
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue('to_production_order') === Filters_Bool.TRUE
            ? _.map(ProductionPlanOrder, (v) => (
                <CascaderProductPlan data={v} options={options} />
              ))
            : _.map(ProductionPlanTime, (v) => <TimeRow data={v} />)
        }
      </Form.Item>
    </>
  )
}

export default ReleaseProductPlan
