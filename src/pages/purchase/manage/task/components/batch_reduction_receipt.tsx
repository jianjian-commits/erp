import React from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import classNames from 'classnames'

const BatchReductionReceipt = () => {
  return (
    <Flex column className='gm-padding-10'>
      {_.map(
        [
          { text: t('扣减库存后，计划采购展示扣减后数量，是否确认扣减？') },
          {
            text: t('1.仅未下达状态支持扣减库存'),
            style: 'red',
          },
          {
            text: t(
              '2.所选周期下存在多个相同商品计划时，按计划交期顺序扣减，扣完为止',
            ),
            style: 'red',
          },
          {
            text: t('3.扣减后不支持回退，可通过修改计划采购调整'),
            style: 'red',
          },
          {
            text: t('4.每操作一次扣减库存，均按上述逻辑重新扣减一次库存'),
            style: 'red',
          },
        ],
        (item) => (
          <div
            className={classNames('gm-padding-bottom-5', {
              'gm-text-red': item.style === 'red',
            })}
            key={item.text}
          >
            {item.text}
          </div>
        ),
      )}
    </Flex>
  )
}

export default BatchReductionReceipt
