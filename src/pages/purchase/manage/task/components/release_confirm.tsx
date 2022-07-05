import React from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import classNames from 'classnames'

const ReleaseConfirm = () => {
  return (
    <Flex column className='gm-padding-10'>
      {_.map(
        [
          { text: t('批量下达采购计划时，按计划采购数下达') },
          {
            text: t('计划状态为未下达才可下达计划'),
            style: 'red',
          },
          {
            text: t('仅下达计划采购数大于0的计划'),
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

export default ReleaseConfirm
