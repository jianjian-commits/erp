import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { runInAction } from 'mobx'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { MoreSelect } from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from '../store'
import { ListSkuV2, Sku_SkuType, Sku } from 'gm_api/src/merchandise'
import _ from 'lodash'
interface CellSkuSelectorPros {
  index: number
}
/**
 * @description 根据别名识别多商品
 */

const CellSkuSelector: FC<CellSkuSelectorPros> = ({ index }) => {
  const { errorList } = store
  const { name, copyName } = errorList[index]
  const [list, setList] = useState<MoreSelectDataItem[]>([])
  const [selected, setSelected] = useState<MoreSelectDataItem>()

  useEffect(() => {
    if (name) {
      fetchSkuList()
    }
  }, [])

  const fetchSkuList = async () => {
    const {
      response: { skus },
    } = await ListSkuV2({
      filter_params: {
        q: name || '',
        sku_type: Sku_SkuType.NOT_PACKAGE,
      },
      paging: {
        offset: 0,
        limit: 999,
      },
    })

    runInAction(() => {
      setList(
        _.map(skus, (it) => {
          return {
            value: it.sku_id,
            text: it.name,
          }
        }),
      )
    })
  }

  const handleSelect = (selected: MoreSelectDataItem<string>) => {
    store.updateErrorList(index, 'name', !selected ? copyName : selected?.text)
    setSelected(selected)
  }

  return (
    <MoreSelect
      className='gm-margin-left-10'
      data={list}
      selected={selected}
      onSelect={handleSelect}
      placeholder={t('请输入商品名搜索')}
      style={{
        width: '180px',
      }}
    />
  )
}

export default observer(CellSkuSelector)
