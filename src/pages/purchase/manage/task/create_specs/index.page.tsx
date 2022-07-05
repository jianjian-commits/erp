import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { BoxPanel, Button, FormPanel, Flex, Tip } from '@gm-pc/react'
import { gmHistory as history } from '@gm-common/router'
import Info from './components/info'
import List from './components/list'
import { Observer } from 'mobx-react'
import store from './store'
import purchaserStore from '@/pages/purchase/store'

const CreateSpecs = () => {
  const handleSubmit = () => {
    const list = store.specDetail.list.filter(
      (v) => v.sku_id && v.purchase_unit_id,
    )
    for (let i = 0; i < list.length; i++) {
      if (!+list[i].plan_purchase_amount!) {
        Tip.danger('请填写大于0的采购量')
        return Promise.reject(new Error('num error'))
      }
    }
    return store.createSpecs().then(() => {
      history.push('/purchase/manage/task')
      return null
    })
  }

  useEffect(() => {
    purchaserStore.fetchSuppliers()
    purchaserStore.fetchPurchasers()
    return () => {
      store.init()
    }
  }, [])

  return (
    <BoxPanel
      title={t('批量创建采购计划')}
      collapse
      right={
        <Observer>
          {() => (
            <Button
              type='primary'
              disabled={
                !store.specDetail.list.filter(
                  (v) => v.sku_id && v.purchase_unit_id,
                ).length
              }
              className='gm-margin-right-5 gm-margin-tb-5'
              onClick={handleSubmit}
            >
              {t('提交')}
            </Button>
          )}
        </Observer>
      }
    >
      <FormPanel title={t('波次信息')}>
        <Info />
      </FormPanel>
      <FormPanel
        title={t('商品总数')}
        left={
          <Observer>
            {() => (
              <Flex alignCenter className='gm-text-14'>
                ：
                <span className='gm-text-primary'>
                  {store.specDetail.list.length}
                </span>
              </Flex>
            )}
          </Observer>
        }
      />
      <List />
    </BoxPanel>
  )
}

export default CreateSpecs
