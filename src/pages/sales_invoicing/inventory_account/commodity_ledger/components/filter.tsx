import React, { FC, useState } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import {
  FormBlock,
  BoxForm,
  FormItem,
  DateRangePicker,
  ListDataItem,
  Input,
  BoxFormMore,
  Select,
  MoreSelect,
  FormButton,
  Button,
  Flex,
} from '@gm-pc/react'
import { Sku_SkuType } from 'gm_api/src/merchandise'
// import type { MoreSelectDataItem } from '@gm-pc/react'

import { OPERATE_TYPE_SELECT } from '@/pages/sales_invoicing/enum'
import { formatSkuListV2 } from '@/pages/sales_invoicing/util'
import type { FilterType } from '../store'
import LedgerStore from '../store'
import { SignTip } from '@/pages/sales_invoicing/components'
import { Permission } from 'gm_api/src/enterprise'
import PermissionJudge from '@/common/components/permission_judge'
import globalStore from '@/stores/global'
import Select_WareHouse_Default from '@/common/components/select_warehouse'

interface ChangeFilter {
  onSearch: () => any
}

const renderProductItem = (item: any) => {
  return (
    <div>
      {item.text}
      {item.sku_type === Sku_SkuType.PACKAGE && <SignTip text={t('包材')} />}
    </div>
  )
}

// const renderItem = (item: any) => {
//   return (
//     <div>
//       {item.text}
//       {item.isVirtualBase && (
//         <span
//           style={{
//             border: '1px solid #798294',
//             borderRadius: '2px',
//             display: 'inline-block',
//             marginLeft: '5px',
//             padding: '2px',
//             color: 'var(--gm-color-desc)',
//           }}
//         >
//           {t('基本单位')}
//         </span>
//       )}
//     </div>
//   )
// }

const Filter: FC<ChangeFilter> = observer((props) => {
  const { onSearch } = props
  const [skuList, setSkuList] = useState<ListDataItem<string>[]>([])
  const [ssuList, setSsuList] = useState<ListDataItem<string>[]>([])
  const {
    filter: {
      sku_id,
      begin_time,
      end_time,
      q,
      operate_type,
      unit_id,
      warehouse_id,
    },
  } = LedgerStore
  const handleFilterChange = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    LedgerStore.updateFilter(key, value)
  }
  const handleChangeDate = (begin_time: Date, end_time: Date) => {
    if (begin_time && end_time) {
      handleFilterChange('begin_time', begin_time)
      handleFilterChange('end_time', end_time)
    }
  }

  const handleGetSku = (value: string) => {
    LedgerStore.fetchSkuList(value).then((json) => {
      const {
        response: { skus, category_map },
      } = json
      setSkuList(formatSkuListV2(skus, category_map))
      return json
    })
  }

  const handleSelectSku = (value: ListDataItem<string>) => {
    setSsuList(value?.ssu || [])
    handleFilterChange('sku_id', value)
    handleFilterChange('unit_id', undefined)
  }

  const handleExport = () => {
    LedgerStore.export().then((json) => {
      globalStore.showTaskPanel()
      return json
    })
  }

  const handleCleat = () => {
    LedgerStore.clear()
  }

  return (
    <BoxForm onSubmit={onSearch} labelWidth='100px' colWidth='400px'>
      <FormBlock col={3}>
        <FormItem label={t('按出/入库时间')}>
          <DateRangePicker
            begin={begin_time}
            end={end_time}
            onChange={handleChangeDate}
            enabledTimeSelect
          />
        </FormItem>
        {globalStore.isOpenMultWarehouse && (
          <FormItem label={t('仓库')}>
            <Select_WareHouse_Default
              value={warehouse_id}
              onChange={(value) => handleFilterChange('warehouse_id', value)}
            />
          </FormItem>
        )}
        <FormItem label={t('搜索')}>
          <Input
            value={q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            placeholder={t('单据号、操作人搜索')}
          />
        </FormItem>
      </FormBlock>
      <BoxFormMore>
        <FormBlock col={2}>
          <FormItem label={t('商品筛选')}>
            <Flex justifyBetween>
              <MoreSelect
                style={{ width: '58%' }}
                data={skuList}
                selected={sku_id}
                onSearch={handleGetSku}
                onSelect={handleSelectSku}
                placeholder={t('请输入商品编号或者名称')}
                renderListItem={renderProductItem}
              />
              {/* <MoreSelect
                style={{ width: '40%' }}
                data={ssuList}
                selected={unit_id}
                onSelect={(e: MoreSelectDataItem<string>) =>
                  handleFilterChange('unit_id', e)
                }
                placeholder={t('选择规格名称')}
                renderListItem={renderItem}
              /> */}
            </Flex>
          </FormItem>
          <FormItem label={t('变动类型')}>
            <Select
              value={operate_type}
              data={OPERATE_TYPE_SELECT}
              onChange={(e) => handleFilterChange('operate_type', e)}
            />
          </FormItem>
        </FormBlock>
      </BoxFormMore>
      <FormButton>
        <Flex>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
          <div className='gm-gap-10' />
          <PermissionJudge
            permission={Permission.PERMISSION_INVENTORY_EXPORT_CHANGE_STOCK_LOG}
          >
            <Button onClick={handleExport}>{t('导出')}</Button>
          </PermissionJudge>
          <BoxFormMore>
            <>
              <div className='gm-gap-10' />
              <Button onClick={handleCleat}>{t('重置')}</Button>
            </>
          </BoxFormMore>
        </Flex>
      </FormButton>
    </BoxForm>
  )
})

export default Filter
