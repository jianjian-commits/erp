import React, { FC, MouseEventHandler } from 'react'
import { Modal, Flex, Button } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Descriptions } from 'antd'
import _ from 'lodash'
import { observer } from 'mobx-react'
import store from './../store'
import { getUnNillText } from '@/common/util'
interface DistributionProps {
  warehouseIds: string[]
}

const Distribution: FC<DistributionProps> = observer(
  ({ warehouseIds = [] }) => {
    const { getWarehouseById } = store
    const showDetail: MouseEventHandler<HTMLAnchorElement> = (event) => {
      event.preventDefault()
      Modal.render({
        children: (
          <>
            <Descriptions bordered column={1} size='small'>
              {_.map(warehouseIds, (id) => {
                const warehouse = getWarehouseById(id)
                return (
                  <Descriptions.Item>
                    {getUnNillText(warehouse?.name)}
                  </Descriptions.Item>
                )
              })}
            </Descriptions>
            <Flex justifyCenter>
              <Button
                type='primary'
                className='gm-margin-top-15'
                onClick={() => Modal.hide()}
              >
                {t('确定')}
              </Button>
            </Flex>
          </>
        ),
        title: t('查看详情'),
      })
    }
    return (
      <>
        <div>
          {_.map(warehouseIds.slice(0, 2), (id) => {
            const warehouse = getWarehouseById(id)
            return getUnNillText(warehouse?.name)
          }).join(';')}
        </div>
        {warehouseIds.length > 1 ? (
          <a href='##' onClick={showDetail}>
            {t('查看详情')}
          </a>
        ) : null}
      </>
    )
  },
)

export default Distribution
