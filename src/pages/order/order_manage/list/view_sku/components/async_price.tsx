import { t } from 'gm-i18n'
import React, { useState, FC } from 'react'
import { Radio, RadioGroup, Button } from '@gm-pc/react'

interface AsyncPriceProps {
  onCancel: () => void
  onOk: (radio: number) => void
}
const AsyncPrice: FC<AsyncPriceProps> = (props) => {
  const [radio, setRadio] = useState(2)
  const handleCancel = () => {
    props.onCancel()
  }

  const handleOk = () => {
    props.onOk(radio)
  }

  return (
    <div className='gm-padding-5 gm-margin-left-15'>
      <div className='gm-text-14'>
        <span>{t('同步单价类型：')}</span>
        <RadioGroup
          name='price'
          className='gm-inline-block'
          value={radio}
          onChange={(v) => setRadio(v)}
        >
          <Radio value={2}>{t('销售单价（基本单位）')}</Radio>
          <Radio value={1}>{t('销售单价（销售单位）')}</Radio>
        </RadioGroup>
      </div>
      <div className='gm-text-14'>
        {t(
          '同步后，所选商品价格会根据所选单价类型进行价格同步，确认要同步吗？',
        )}
      </div>
      <div className='gm-margin-top-20 gm-text-desc gm-text-12'>
        <div>{t('说明')}：</div>
        <div>
          {t('1. 商品将同步所在报价单的价格，锁价商品将根据锁价规则同步价格')}
        </div>
        <div>{t('2. 若订单为锁定状态，则不更新单价')}</div>
        <div>{t('3. 修改价格后，使用优惠券的订单存在退还优惠券的风险')}</div>
        <div>{t('4. 时价商品同步规则，根据系统设置确定')}</div>
      </div>
      <div className='gm-text-right'>
        <Button className='gm-margin-right-10' onClick={handleCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' onClick={handleOk}>
          {t('确定')}
        </Button>
      </div>
    </div>
  )
}

export default AsyncPrice
