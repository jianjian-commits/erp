import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Popover } from '@gm-pc/react'
import { t } from 'gm-i18n'
import React, { FC } from 'react'
/**
 * 商品已经被删除的提示
 * @returns
 */
const DeletedProduct: FC<{ tip?: string }> = ({ tip }) => {
  return (
    <Popover
      showArrow
      type='hover'
      popup={
        <div
          className='gm-border gm-padding-5 gm-bg gm-text-12'
          style={{ width: '220px' }}
        >
          {tip ?? t('当前商品已被删除，请重新设置商品')}
        </div>
      }
    >
      <span>
        <ExclamationCircleOutlined
          style={{
            color: 'red',
            fontSize: 16,
            marginLeft: 4,
          }}
        />
      </span>
    </Popover>
  )
}

export default DeletedProduct
