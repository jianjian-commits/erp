import { t } from 'gm-i18n'
import React, { FC, useState, useEffect } from 'react'
import { Flex } from '@gm-pc/react'
import SVGBusiness from '@/svg/business.svg'
import SvgRemove from '@/svg/remove.svg'
import { checkNumberOptions } from '../../../manage/interface'

const CheckNumber: FC<checkNumberOptions> = ({ data, handleMoveCategory }) => {
  const [show, changeShow] = useState(true)

  useEffect(() => {
    changeShow(true)
  }, [data])

  const handleToggle = () => {
    changeShow(!show)
  }

  const renderButton = () => (
    <Flex className='station-tree-number-tab' alignCenter row>
      <SvgRemove onClick={handleToggle} className='gm-cursor' />
      <div className='gm-gap-10' />
      <span className='station-tree-number-tab-number'>
        {t('已选择')}
        <span>{data.length}</span>
        {t('项')}
      </span>
      <div className='gm-margin-lr-15'>|</div>
      <div
        className='station-tree-number-tab-button gm-cursor'
        onClick={handleMoveCategory}
      >
        <span style={{ paddingRight: '4px' }}>
          <SVGBusiness />
        </span>
        {t('转移商品分类')}
      </div>
    </Flex>
  )

  if (show && data.length) return renderButton()
  else return <span />
}

export default CheckNumber
