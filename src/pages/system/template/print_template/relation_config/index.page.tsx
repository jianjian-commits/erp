import React, { useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import TableListTips from '@/common/components/table_list_tips'
import { useGMLocation } from '@gm-common/router'
import Header from './components/header'
import store from './store'
import { Flex, Tip } from '@gm-pc/react'
import { observer } from 'mobx-react'
import CustomerTable from './components/customer_table'
import SkuTable from './components/sku_table'
import styled from 'styled-components'
import CustomerTableView from './components/customer_table_view'
import SkuTableView from './components/sku_table_view'

const TableWrapper = styled.div`
  width: 100%;
  margin: 10px;
  border: 1px solid rgb(235, 238, 243);
`

const TplRelationConfig = () => {
  const {
    query: { printing_template_id },
  } = useGMLocation<{ printing_template_id: string }>()

  const [isModify, setModify] = useState(false)

  useEffect(() => {
    store.getPrintingTemplate(printing_template_id)
    store.getPrintingTemplateRelation(printing_template_id).then((response) => {
      store.getCustomers()
      return response
    })
  }, [])

  const handleCancel = () => {
    setModify(false)
  }

  const handleModify = () => {
    setModify(true)
  }

  const handleSave = () => {
    store
      .updatePrintingRelation(printing_template_id)
      .then(() => {
        return setModify(false)
      })
      .catch((res) => {
        let msg = ''
        const details = res.message.detail.details
        details.forEach((d, i) => {
          msg += `在其他模板下存在商户与商品的组合【商户:${d.customer_name},商品:${d.sku_name},模板:${d.template_name}】`
        })
        Tip.danger(msg)
      })
  }

  return (
    <div>
      <Header
        isModify={isModify}
        infos={[
          { label: t('模板名'), value: store.printing_template?.name || '-' },
          {
            label: t('打印规格'),
            value: store.printing_template?.paper_size || '-',
          },
        ]}
        onCancel={handleCancel}
        onModify={handleModify}
        onSave={handleSave}
      />
      <TableListTips
        tips={[
          t(
            '若商户下所有商品均使用同一模板，则只需添加商户无需添加商品；若仅某些商品使用该模板，则需添加商户且在右侧添加对应商品。',
          ),
        ]}
      />

      <Flex>
        <TableWrapper>
          {isModify ? <CustomerTable /> : <CustomerTableView />}
        </TableWrapper>
        <TableWrapper>
          {isModify ? <SkuTable /> : <SkuTableView />}
        </TableWrapper>
      </Flex>
    </div>
  )
}

export default observer(TplRelationConfig)
