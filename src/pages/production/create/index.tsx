import TableTotalText from '@/common/components/table_total_text'
import { useGMLocation } from '@gm-common/router'
import { Flex } from '@gm-pc/react'
import { Card } from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import OperationButton from './components/operation_button'
import { ProductPlanType, Query } from './interface'
import store from './store'

const Create: FC<ProductPlanType> = observer((props) => {
  const location = useGMLocation<Query>()
  const { productionOrderId } = location.query
  const { type } = props
  const { taskInfo } = store
  const { product_details } = taskInfo

  useEffect(() => {
    store.updateCreateTaskInfo('productionOrderId', productionOrderId)
    return store.clearTaskInfo
  }, [productionOrderId])

  return (
    <>
      <Card title={t('需求')} bordered={false}>
        <Filter type={type} />
      </Card>
      <Card
        title={
          <Flex>
            <div>{t('商品总数')}</div>
            <TableTotalText
              data={[{ label: t(''), content: (product_details || []).length }]}
            />
          </Flex>
        }
        bordered={false}
      >
        <List type={type} />
      </Card>
      <OperationButton type={type} />
    </>
  )
})

export default Create
