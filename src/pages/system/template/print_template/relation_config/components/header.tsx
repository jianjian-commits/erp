import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex, Button } from '@gm-pc/react'
import { HeaderProps } from '../types'

const Header: FC<HeaderProps> = ({
  infos,
  isModify,
  onCancel,
  onModify,
  onSave,
}) => {
  return (
    <Flex
      alignCenter
      justifyBetween
      style={{ backgroundColor: 'rgb(247, 248, 250)' }}
      className='gm-padding-20'
    >
      <Flex className='gm-text-bold gm-text-14'>
        {infos.map((o, i) => (
          <div style={{ marginRight: '40px' }} key={i}>
            {o.label}: {o.value}
          </div>
        ))}
      </Flex>
      <Flex justifyEnd>
        {isModify ? (
          <div>
            <Button className='gm-margin-right-5' onClick={onCancel}>
              {t('取消')}
            </Button>
            <Button type='primary' onClick={onSave}>
              {t('保存')}
            </Button>
          </div>
        ) : (
          <div>
            <Button type='primary' onClick={onModify}>
              {t('修改')}
            </Button>
          </div>
        )}
      </Flex>
    </Flex>
  )
}

export default Header
