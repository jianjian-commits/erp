import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import {
  BoxForm,
  FormBlock,
  FormItem,
  Input,
  MoreSelect,
  MoreSelectDataItem,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { MoreSelect_Customer } from 'gm_api/src/enterprise/pc'
import { ListSkuV2, Sku_SkuType } from 'gm_api/src/merchandise'
import { BomType } from 'gm_api/src/production'
import { MoreSelect_ProcessTemplate } from 'gm_api/src/production/pc'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC, useState } from 'react'
import store from '../store'

/**
 * 更多筛选框的属性
 */
interface MoreFilterProps {
  /** BOM的种类 */
  type: BomType
}

/**
 * 更多筛选框的组件函数
 */
const MoreFilter: FC<MoreFilterProps> = ({ type }) => {
  const isPack = type === BomType.BOM_TYPE_PACK

  const [skuList, setSkuList] = useState<MoreSelectDataItem[]>([])
  const [materialSkuList, setMaterialSkuList] = useState<MoreSelectDataItem[]>(
    [],
  )

  const {
    q,
    skuArray,
    materialSkuArray,
    customerArray,
    processTemplateArray,
    category_ids,
  } = store.filter

  const fetchSkuList = (q: string, skuNotPack: boolean, material?: boolean) => {
    ListSkuV2({
      filter_params: {
        q,
        sku_type: skuNotPack ? Sku_SkuType.NOT_PACKAGE : undefined,
      },
      paging: {
        offset: 0,
        limit: 999,
      },
    }).then((res) => {
      const data = _.map(res.response.skus, (v) => ({
        value: v.sku_id,
        text: v.name,
        ...v,
      }))
      material ? setMaterialSkuList(data) : setSkuList(data)
    })
  }

  return (
    <BoxForm labelWidth='120px' colWidth='385px'>
      <FormBlock col={2} className='gm-margin-bottom-10'>
        <FormItem label={t('商品分类')}>
          <CategoryCascader
            style={{ width: '255px' }}
            value={category_ids}
            onChange={(value) =>
              store.updateFilter('category_ids', value as string[])
            }
            showAdd={false}
          />
        </FormItem>
        <FormItem label={t('BOM搜索')}>
          <Input
            value={q}
            placeholder={t('请输入BOM名称/BOM编码')}
            onChange={(e) => store.updateFilter('q', e.target.value)}
          />
        </FormItem>
      </FormBlock>
      <FormBlock col={2} className='gm-margin-bottom-10'>
        <FormItem label={t('商品名称')}>
          <MoreSelect
            multiple
            data={skuList}
            selected={skuArray}
            onSearch={(q: string) => fetchSkuList(q, true)}
            onSelect={(select?: MoreSelectDataItem<string>[]) => {
              store.updateFilter('skuArray', select)
            }}
          />
        </FormItem>
        {!isPack && (
          <FormItem label={t('工序搜索')}>
            <MoreSelect_ProcessTemplate
              multiple
              selected={processTemplateArray}
              renderListFilterType='pinyin'
              onSelect={(select?: MoreSelectDataItem<string>[]) =>
                store.updateFilter('processTemplateArray', select)
              }
              placeholder={t('全部')}
            />
          </FormItem>
        )}
      </FormBlock>
      <FormBlock col={2}>
        <FormItem label={t(`原料${isPack ? '/包材' : ''}搜索`)}>
          <MoreSelect
            multiple
            data={materialSkuList}
            onSearch={(q: string) => fetchSkuList(q, !isPack, true)}
            selected={materialSkuArray}
            onSelect={(select?: MoreSelectDataItem<string>[]) => {
              store.updateFilter('materialSkuArray', select)
            }}
          />
        </FormItem>
        {!isPack && (
          <FormItem label={t('客户搜索')}>
            <MoreSelect_Customer
              multiple
              isSearch
              params={{ level: '1' }}
              selected={customerArray}
              renderListFilterType='pinyin'
              onSelect={(select?: MoreSelectDataItem<string>[]) =>
                store.updateFilter('customerArray', select)
              }
              placeholder={t('全部')}
            />
          </FormItem>
        )}
      </FormBlock>
    </BoxForm>
  )
}

export default observer(MoreFilter)
