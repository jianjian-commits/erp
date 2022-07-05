import React from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import classNames from 'classnames'

const ReleaseAndGeratePurchase = () => {
  return (
    <Flex column className='gm-padding-10'>
      {_.map(
        [
          { text: t('下达后按以下规则生成采购单，是否确认下达？') },
          {
            text: t('1.生成采购单规则：'),
            style: 'red',
          },
          {
            text: t('有供应商有采购员：按供应商+采购员生成采购单'),
            style: 'red',
          },
          {
            text: t('无供应商有采购员：按采购员生成采购单'),
            style: 'red',
          },
          {
            text: t('2.仅未下达且有供应商或采购员有其一的才可下达'),
            style: 'red',
          },
          {
            text: t('3.计划采购等于0以及库存充足的计划将不会被下达'),
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

export default ReleaseAndGeratePurchase
