import React, { FC } from 'react'
import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'

interface Props {
  status: string | boolean
}

const IsInvented: FC<Props> = (props) => {
  const { status } = props

  const is_replace =
    typeof status === 'boolean'
      ? status
      : (parseInt(status) >> 8).toString(2) === '1'

  return is_replace ? (
    <Flex justifyCenter alignCenter className='gm-margin-left-10'>
      <span
        style={{
          backgroundColor: '#cc6777',
          borderRadius: '2px',
          fontWeight: 'bolder',
          padding: '3px 4px',
          color: 'var(--gm-color-white)',
          minWidth: 'max-content',
        }}
      >
        {t('替代超支库存')}
      </span>
    </Flex>
  ) : (
    <></>
  )
}

export default IsInvented
