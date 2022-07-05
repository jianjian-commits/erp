import { Form } from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  Key,
} from 'react'
import { Filters_Bool } from 'gm_api/src/common'
import CascaderProductPlan from '@/common/components/release_product_plan/cascade_plan'
import CreatePlan from '@/pages/production/plan_management/plan/produce_plan/components/side/create_plan'
import {
  ListProductionOrder,
  ListProductionOrderRequest_ViewType,
  PlaningTaskRequest,
  ProductionOrder_TimeType,
} from 'gm_api/src/production'
import moment from 'moment'
import { getProductPlanTree } from '@/common/components/release_product_plan/uti'
import { DefaultOptionType } from 'antd/lib/cascader'
import { JoinOrder } from '@/common/components/release_product_plan'

const DemandPlan = forwardRef<any, { selected: Key[]; defaultOrder: Key[] }>(
  ({ selected, defaultOrder }, ref) => {
    const [form] = Form.useForm()
    const [productionOrderList, setProductionOrderList] = useState<
      DefaultOptionType[]
    >([])

    const getTaskParams: () => Promise<PlaningTaskRequest> = async () => {
      const {
        production_batch,
        production_order,
        name,
        delivery_time,
        production_line_id,
        to_production_order,
      } = await form.validateFields()
      return {
        production_order: {
          production_order_id:
            to_production_order === Filters_Bool.TRUE
              ? production_order?.slice(-1)[0]
              : undefined,
          delivery_time: '' + moment(delivery_time).endOf('day'),
          production_line_id,
          name,
        },
        list_task_request: {
          task_ids: selected as string[],
          paging: { limit: 999 },
        },
        batch: production_batch,
      }
    }

    useImperativeHandle(ref, () => ({
      getTaskParams,
    }))

    useEffect(() => {
      fetchOrder()
    }, [])

    const fetchOrder = () => {
      ListProductionOrder({
        begin_time: '' + moment().add(-7, 'day'),
        end_time: '' + moment().add(7, 'day'),
        time_type: ProductionOrder_TimeType.TIME_TYPE_DELIVERY,
        paging: { limit: 999 },
        view_type: ListProductionOrderRequest_ViewType.VIEW_TYPE_DELIVERY,
      }).then((json) => {
        setProductionOrderList(
          getProductPlanTree(json.response.production_orders_view!),
        )
        return json
      })
    }

    return (
      <Form
        form={form}
        initialValues={{
          production_order: defaultOrder,
          to_production_order: Filters_Bool.TRUE,
        }}
      >
        <JoinOrder />
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) =>
            getFieldValue('to_production_order') === Filters_Bool.TRUE ? (
              <CascaderProductPlan
                data={{
                  orderName: 'production_order',
                  batchName: 'production_batch',
                }}
                options={productionOrderList}
              />
            ) : (
              <CreatePlan needBatch />
            )
          }
        </Form.Item>
        <div className='gm-text-red'>
          <span>{t('提示：')}</span>
          <div>
            1、
            {t(
              '需求规划提交之后，需求已有对应审核通过的领料出库单时，需要进行线下退料；需求规划提交之后，所有的领料将会重新计算，并生成新的原料数据；',
            )}
          </div>
          <div>
            2、
            {t('不加入已有计划时，将会根据选择的交期和产线生成新的生产计划；')}
          </div>
        </div>
      </Form>
    )
  },
)

export default DemandPlan
