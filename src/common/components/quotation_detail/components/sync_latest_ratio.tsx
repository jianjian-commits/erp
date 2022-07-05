import React, { useState, useEffect } from 'react'
import { Flex, RadioGroup, Radio, Transfer, Button, Dialog } from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from '../store'
import { SyncMenuCombineSkuToOrder } from 'gm_api/src/orderlogic'
import moment from 'moment'
import globalStore from '@/stores/global'

const SyncLatestRatio = () => {
  const [isAllOrder, setAllOrder] = useState<boolean>(true)
  const [selectedId, setSelectedId] = useState<Array<string>>([])
  const {
    CustomerGroups,
    filter: { quotation_id, menu_from_time, menu_to_time },
  } = store

  useEffect(() => {
    store.fetchCustomer()
  }, [])

  const handeleConfirm = () => {
    const basic_price_ids = store.getSelectedCombineSsus.map((item) => ({
      quotation_id,
      sku_id: item.sku_id,
      unit_id: item.unit_id,
      menu_detail_id: item.menu_detail_id,
      menu_period_group_id: item.menu_period_group_id,
      menu_time: item.menu_time,
      basic_price_id: item.rawBasicPrice?.basic_price_id,
    }))

    SyncMenuCombineSkuToOrder({
      menu_filter: {
        basic_price_ids,
        customer_ids: selectedId,
        menu_from_time: '' + moment(menu_from_time).startOf('day').format('x'),
        menu_to_time:
          '' + moment(menu_to_time).add('d', 1).startOf('day').format('x'),
      },
    }).then(() => {
      globalStore.showTaskPanel('1')
      Dialog.hide()
    })
  }

  return (
    <Flex column>
      <Flex alignCenter className='gm-margin-bottom-10 gm-margin-left-10'>
        <span>{t('请选择要同步的客户订单')}:</span>
        <RadioGroup
          className='gm-margin-left-10'
          name='import_type'
          value={isAllOrder}
          onChange={(value) => setAllOrder(value)}
        >
          <Radio value>{t('全部客户订单')}</Radio>
          <Radio value={false}>{t('部分客户订单')}</Radio>
        </RadioGroup>
      </Flex>
      {!isAllOrder && (
        <Flex column className='gm-margin-bottom-10 gm-margin-left-10'>
          <span>{t('请选择要同步的客户')}:</span>
          <Transfer
            rightTree
            className='gm-margin-top-10'
            leftStyle={{ width: '250px', height: '400px' }}
            rightStyle={{ width: '250px', height: '400px' }}
            leftTitle={t('全部公司/客户')}
            rightTitle={t('已选公司/客户')}
            list={CustomerGroups.slice()}
            selectedValues={selectedId}
            onSelectValues={(selected: []) => setSelectedId(selected)}
          />
        </Flex>
      )}
      <Flex justifyEnd className='gm-padding-top-10'>
        <Button className='gm-margin-right-10' onClick={() => Dialog.hide()}>
          {t('取消')}
        </Button>
        <Button
          htmlType='submit'
          type='primary'
          disabled={!isAllOrder && selectedId.length === 0}
          onClick={handeleConfirm}
        >
          {t('确定')}
        </Button>
      </Flex>
    </Flex>
  )
}

export default SyncLatestRatio
