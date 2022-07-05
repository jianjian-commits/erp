import { GraphFlow } from '@gm-common/graph'
import { BoxPanel } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Task_Type } from 'gm_api/src/production'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import store from '../store'
import ByProductDetail from './components/by_product_detail'
import ProductDetail from './components/finished_product_detail'

interface DetailProps {
  type?: Task_Type
}

const Detail: FC<DetailProps> = observer(({ type }) => {
  const { task } = store.taskDetails
  // 需要 task + task_input 拼接数据, task有成品信息，task_input有物料信息
  return (
    <>
      <BoxPanel title={t('工艺流程图')} collapse>
        <div className='gm-border-bottom' style={{ height: '320px' }}>
          <div style={{ margin: '8px 16px', fontSize: 14 }}>
            版本号：{task.bom_revision}
          </div>
          <div style={{ height: '280px' }}>
            <GraphFlow
              data={toJS(store.bomData)}
              options={{
                layout: {
                  nodesep: 80,
                  ranksep: 25,
                },
              }}
            />
          </div>
        </div>
      </BoxPanel>
      <BoxPanel title={t('成品明细')} collapse>
        <ProductDetail type={type} />
      </BoxPanel>
      {type !== Task_Type.TYPE_PACK &&
        task.by_products?.by_products?.length !== 0 && (
          <BoxPanel title={t('副产品明细')} collapse>
            <ByProductDetail />
          </BoxPanel>
        )}
    </>
  )
})

export default Detail
