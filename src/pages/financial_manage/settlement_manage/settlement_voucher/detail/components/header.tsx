import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import { history } from '@/common/service'
import globalStore from '@/stores/global'
import { Flex, Price } from '@gm-pc/react'
import { Button, Modal, Space } from 'antd'
import { t } from 'gm-i18n'
import { map_PayType, SettleSheet_SettleStatus } from 'gm_api/src/finance'
import _ from 'lodash'
import { Observer, observer } from 'mobx-react'
import moment from 'moment'
import React, { ReactNode, useMemo } from 'react'
import store from '../../store'

interface Block {
  text: string | ReactNode
  value: ReactNode
  hide?: boolean
}

const { confirm } = Modal
const Header = observer(() => {
  const {
    total_outstock_price,
    total_paid_price,
    total_after_sale_price,
    total_price,
    unPay_price,
    needPay_price,
  } = store.dataSourceDetailHeaderInfo

  const priceBlock = useMemo<Block[]>(
    () => [
      {
        text: '',
        value: <div style={{ color: '#ff4d4f' }}>{t('已作废')}</div>,
        hide:
          store.dataSourceHeader.settle_status !==
          SettleSheet_SettleStatus.SETTLE_STATUS_DELETED,
      },
      {
        text: t('结款金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+total_price || 0}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
      {
        text: t('应付金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+total_outstock_price || 0}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
      {
        text: t('已付金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+total_paid_price || 0}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
      {
        text: t('未付金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+unPay_price || 0}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
      {
        text: t('售后金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+total_after_sale_price || 0}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
      {
        text: t('待结金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+needPay_price || 0}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
    ],
    [store.dataSourceDetailHeaderInfo, store.dataSourceHeader.settle_status],
  )

  const handleCancellation = () => {
    confirm({
      title: t('作废凭证'),
      content: (
        <Flex column>
          <Space className='gm-text-danger'>
            {t('本凭证对应的结款金额将作废，且作废不可撤销!')}
          </Space>
          <Space>{t('确认要作废该凭证吗?')}</Space>
        </Flex>
      ),
      okType: 'primary',
      onOk: () => {
        store
          .deleteCustomerSettleSheet(store.dataSourceHeader.settle_sheet_id)
          .then(() => {
            history.push(
              '/financial_manage/settlement_manage/settlement_voucher/',
            )
            store.fetchList(true)
          })
      },
    })
  }

  const {
    settle_sheet_id,
    pay_type,
    settle_time,
    customize_settle_voucher,
    create_time,
    creator_name,
  } = store.dataSourceHeader
  return (
    <ReceiptHeaderDetail
      contentLabelWidth={80}
      contentCol={4}
      customerContentColWidth={[350, 350, 350, 350]}
      totalData={priceBlock}
      HeaderInfo={[]}
      HeaderAction={
        store.dataSourceHeader.settle_status !==
          SettleSheet_SettleStatus.SETTLE_STATUS_DELETED && (
          <Button type='primary' danger onClick={handleCancellation}>
            {t('作废')}
          </Button>
        )
      }
      ContentInfo={[
        {
          label: t('结款凭证id'),
          item: <Observer>{() => <>{settle_sheet_id}</>}</Observer>,
        },
        {
          label: t('结款方式'),
          item: <Observer>{() => <>{map_PayType[pay_type]}</>}</Observer>,
        },
        {
          label: t('到账日期'),
          item: (
            <Observer>
              {() => <>{moment(+settle_time).format('YYYY-MM-DD')}</>}
            </Observer>
          ),
        },
        {
          label: t('自定义凭证号'),
          item: <Observer>{() => <>{customize_settle_voucher}</>}</Observer>,
        },
        {
          label: t('操作时间'),
          item: (
            <Observer>
              {() => <>{moment(+create_time).format('YYYY-MM-DD')}</>}
            </Observer>
          ),
        },
        {
          label: t('操作人'),
          item: <Observer>{() => <>{creator_name}</>}</Observer>,
        },
      ]}
    />
  )
})

export default Header
