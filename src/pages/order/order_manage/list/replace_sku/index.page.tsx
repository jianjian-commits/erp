import React, { useEffect } from 'react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { BoxTable, BoxTableInfo, FormGroup, Tip } from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import TableListTips from '@/common/components/table_list_tips'
import store from './store'
import ReplaceSkuTable from './table'
import { observer } from 'mobx-react'
import { history } from '@/common/service'
import { useGMLocation } from '@gm-common/router'
import { BatchUpdateOrderSsu } from 'gm_api/src/orderlogic'
import globalStore from '@/stores/global'

const ReplaceSku = observer(() => {
  const { list } = store
  function handleSubmit() {
    const updates = store.getReplaceParams(type)
    if (!updates.length) return Tip.danger(t('没有选择可替换的商品'))
    return BatchUpdateOrderSsu({
      updates: updates,
    }).then(() => {
      history.goBack()
      globalStore.showTaskPanel('1')
      return null
    })
  }

  function handleCancel() {
    history.goBack()
  }

  const location =
    useGMLocation<{ filter: string; all: string; type: string }>()
  const { filter, all, type } = location.query
  if (!filter) history.goBack()

  useEffect(() => {
    store.fetchGroupSku({
      filter: { ...JSON.parse(filter), paging: { limit: 100 } },
      relation_info: {
        need_customer_info: true,
        need_quotation_info: true,
        // 现在需要sku信息
        need_sku_info: true,
      },
      all: all ? JSON.parse(all) : false,
    })
  }, [all, filter])

  return (
    <FormGroup
      formRefs={[]}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      saveText={t('保存')}
    >
      <BoxTable
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t(`批量替换${type === 'combine' ? '组合' : ''}商品`),
                  content: _.reduce(
                    list,
                    (sum, v) => {
                      return sum + (v.orders?.length || 0)
                    },
                    0,
                  ),
                },
              ]}
            />
          </BoxTableInfo>
        }
      >
        <TableListTips
          tips={[
            t(
              `批量替换成功后，原${
                type === 'combine' ? '组合' : ''
              }商品将替换为新的商品，如不填写替换后商品、替换后商品为订单中已存在商品，则不替换`,
            ),
          ]}
        />
        <ReplaceSkuTable type={type} />
      </BoxTable>
    </FormGroup>
  )
})

export default ReplaceSku
