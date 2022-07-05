import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Affix, Button, RightSideModal, Tip } from '@gm-pc/react'
import Container from './container'
import Filter from './filter'
import List from './list'
import store from './store'
import billStore from '../../store'
import { combineSku } from '../../../../../util'
import { PurchaseTask } from 'gm_api/src/purchase'
import { observer } from 'mobx-react'
import { SsuInfo, BasicPrice } from 'gm_api/src/merchandise'
import Big from 'big.js'

interface PurchasePlanProps {
  index: number
}

const PurchasePlan: FC<PurchasePlanProps> = (props) => {
  const selectedList: PurchaseTask[] = []
  const unSelectedList: PurchaseTask[] = []

  store.list.slice().forEach((v) => {
    if (store.selected.includes(v.purchase_task_id)) {
      selectedList.push(v)
    } else {
      unSelectedList.push(v)
    }
  })

  function handleSearch() {
    const item = billStore.list[props.index]
    store.fetchList(item.sku_id)
  }

  useEffect(() => {
    const item = billStore.list[props.index]
    handleSearch()
    store.setSelected(item?.purchase_task_ids || [])
    return () => {
      store.init()
    }
  }, [props.index])

  function handleCancel() {
    RightSideModal.hide()
  }

  function handleSave() {
    if (!store.selected.length) {
      Tip.danger('请选择一项')
      return Promise.reject(new Error('请选择一项'))
    }
    const task = billStore.list[props.index]
    const target = _.find(
      store.list,
      (v) => v.purchase_task_id === (store.selected || [])[0],
    )
    if (target) {
      if (task.sku_id !== '') {
        const { ssuInfos = [], ssu_unit_id } = billStore.list[props.index]
        const ssu = _.find(ssuInfos, (v) => v.value === ssu_unit_id!)
        const rate = ssu?.ssu_unit_rate || 1
        billStore.updateRowColumn(
          props.index,
          'purchase_task_ids',
          store.selected.slice(),
        )
        billStore.updateRowColumn(
          props.index,
          'plan_amount',
          Big(+selectedList[0]?.plan_value?.input?.quantity!).toFixed(4),
        )
        billStore.updateRowColumn(
          props.index,
          'plan_sale_amount',
          Big(+selectedList[0]?.plan_value?.input?.quantity! || 0)
            .div(rate)
            .toFixed(4),
        )
      } else {
        const skuInfo = target?.sku! || {}
        let ssuInfos = _.map(skuInfo.ssu_map, (v) => {
          if (v.ssu?.delete_time === '0') {
            return v
          } else {
            return null
          }
        }).filter((v) => v) as SsuInfo[]
        if (!ssuInfos.length) {
          ssuInfos = _.map(store.ssuSnaps, (v, k) => {
            if (
              k.indexOf(skuInfo.sku?.sku_id!) === 0 &&
              v.delete_time === '0'
            ) {
              return {
                ssu: v,
                basic_prices: [] as BasicPrice[],
              }
            } else {
              return null
            }
          }).filter((v) => v) as SsuInfo[]
        }

        const { sku, category_infos } = skuInfo
        const data = {
          sku,
          category_infos,
          ssu_infos: ssuInfos,
        }
        const selected = combineSku([data])[0]
        billStore.updateRow(props.index, {
          ...selected,
          purchase_amount: undefined,
          purchase_sale_amount: undefined,
          purchase_price: undefined,
          purchase_money: undefined,
          remark: '',
          purchase_task_ids: store.selected.slice(),
          ssu_unit_id: selected?.ssuInfos[0]?.value,
        })
      }
      billStore.updateRowColumn(
        props.index,
        'purchase_task_serial_no',
        _.find(
          store.list,
          (v) => v.purchase_task_id === (store.selected || [])[0],
        )?.serial_no || task.purchase_task_serial_no,
      )
    }
    handleCancel()
    return null
  }

  // const selectedList: PurchaseTask[] = []
  // const unSelectedList: PurchaseTask[] = []
  // store.list.slice().forEach((v) => {
  //   if (store.selected.includes(v.purchase_task_id)) {
  //     selectedList.push(v)
  //   } else {
  //     unSelectedList.push(v)
  //   }
  // })

  return (
    <Container title={t('选择采购计划')}>
      <List type='selected' data={selectedList} />
      <Filter onSearch={handleSearch} />
      <List type='unSelected' data={unSelectedList} />
      <Affix bottom={0}>
        <div className='gm-padding-tb-5 gm-margin-top-20 gm-text-center'>
          <Button className='gm-margin-right-10' onClick={handleCancel}>
            {t('取消')}
          </Button>
          <Button type='primary' onClick={handleSave}>
            {t('保存')}
          </Button>
        </div>
      </Affix>
    </Container>
  )
}

export default observer(PurchasePlan)
