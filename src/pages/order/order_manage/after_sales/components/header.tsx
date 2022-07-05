import { t } from 'gm-i18n'
import React from 'react'
import { Flex, Button } from '@gm-pc/react'
import { observer } from 'mobx-react'
// eslint-disable-next-line import/no-unresolved
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'

const Header = observer(() => {
  return (
    <ReceiptHeaderDetail
      contentLabelWidth={55}
      contentCol={4}
      customerContentColWidth={[350, 350, 350, 350]}
      HeaderInfo={[
        {
          label: t('商户'),
          item: <div>八合里（深圳总店）/S086562</div>,
        },
        {
          label: t('订单号'),
          item: <div>PL343422222</div>,
        },
      ]}
      HeaderAction={
        <Flex row justifyEnd alignCenter>
          <Button className='gm-margin-right-10'>取消</Button>
          <Button type='primary'>保存</Button>
        </Flex>
      }
      ContentInfo={[
        {
          label: t('运营时间'),
          item: <div>xxxxx</div>,
        },
        {
          label: t('预计收货'),
          item: <div>2020-09-10 06:00</div>,
        },
        {
          label: t('订单备注'),
          item: <div>ddfdf</div>,
        },
        {
          label: t('订单来源'),
          item: <div>后台下单</div>,
        },
        {
          label: t('下单时间'),
          item: <div className='gm-padding-right-5'>2020-09-10 06:00</div>,
        },
        {
          label: t('收货人'),
          item: <div className='gm-padding-right-5'>xxxx</div>,
        },
        {
          label: t('收货地址'),
          item: <div className='gm-padding-right-5'>xxxx</div>,
        },
        {
          label: t('最后操作'),
          item: <div>2018-12-4</div>,
        },
      ]}
    />
  )
})

export default Header
