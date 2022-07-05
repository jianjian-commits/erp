import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC } from 'react'
import classNames from 'classnames'
import '../../../../../style.less'

interface Props {
  sku_name: string
  isLast: boolean
}

const HeatTable: FC<Props> = ({ sku_name, isLast }) => {
  return (
    <Flex
      column
      className={classNames('b-command-flex ', {
        'b-flex-margin-8': !isLast,
        'b-flex-margin-20': isLast,
      })}
    >
      <Flex className='b-command-sku b-flex-center'>{sku_name}</Flex>
      <Flex className='b-command-info'>
        <Flex className='b-info-text b-info-border b-flex-center'>
          {t('理论用料')}
        </Flex>
        <Flex className='b-info-text b-flex-center'>{t('实际用料')}</Flex>
      </Flex>
    </Flex>
  )
}

export default HeatTable
