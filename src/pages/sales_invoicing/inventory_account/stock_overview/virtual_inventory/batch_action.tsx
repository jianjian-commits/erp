import React, { FC, useState } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import moment from 'moment'
import Big from 'big.js'
import { observer } from 'mobx-react'
import { TableXUtil, BatchActionDefault } from '@gm-pc/table-x'
import { Flex, Button, Modal, Select, Form, FormItem, Tip } from '@gm-pc/react'
import { isValid } from '@/common/util'
import { BatchDetail } from '@/pages/sales_invoicing/sales_invoicing_type'
import { SkuStockExpand } from '@/pages/sales_invoicing/interface'
import { Batch } from 'gm_api/src/inventory'

import { BatchSelect } from '@/pages/sales_invoicing/components'
import { storageType } from '../enum'
import store from './store'

interface batchType {
  batch_ids: string[]
  isSelectAll: boolean
}

const BatchModal: FC<batchType> = observer((props) => {
  const { batch_ids, isSelectAll } = props
  const {
    replaceStock,
    choseList,
    list,
    filter: { warehouse_id },
  } = store
  const handleCreateReplace = () => {
    store.createReplaceStock(batch_ids, isSelectAll, warehouse_id)
    Modal.hide()
  }

  const sku_unit_list = _.reduce(
    _.map(choseList.select_tree, (v, k) => {
      const skuSheet = _.find(list, { sku_id: k })
      return _.uniqBy(
        _.map(v, (v) => _.find(skuSheet?.batches, { batch_id: v })),
        'sku_unit_id',
      )
    }),
    (result, v) => _.concat(result, v as Batch[]),
    [] as Batch[],
  ) // 筛选相同规格

  return (
    <Form colWidth='360px'>
      <FormItem>
        {!isSelectAll ? (
          <div>
            {t('已选中')}
            <span style={{ color: 'rgb(169, 207, 246)' }}>
              {sku_unit_list.length}
            </span>
            {t('个商品规格，共')}
            <span style={{ color: 'rgb(169, 207, 246)' }}>
              {batch_ids.length}
            </span>
            {t('个临时批次')}
          </div>
        ) : (
          <div>{t('已选中所有批次')}</div>
        )}
      </FormItem>
      <FormItem label={t('选择入库类型')} colWidth='210px'>
        <Select
          value={replaceStock.sheet_type}
          data={storageType}
          onChange={(e) => {
            store.handleChangeStorage(e)
          }}
        />
      </FormItem>
      <FormItem>
        <div className='gm-text-desc gm-margin-bottom-10'>
          {t(
            '说明:快捷入库单生成真实批次,用于替代并取消临时批次,入库时间默认为所选临时批次中的最早出库时间的前一天',
          )}
        </div>
      </FormItem>
      <Flex justifyCenter>
        <Button onClick={() => Modal.hide()}> {t('取消')} </Button>
        <div className='gm-gap-5' />
        <Button
          type='primary'
          onClick={() => {
            handleCreateReplace()
          }}
        >
          {t('确定')}
        </Button>
      </Flex>
    </Form>
  )
})

const BatchAction = () => {
  const [selectAll, setSelectAll] = useState(false)
  const {
    list,
    choseList: { select_batch, select_tree },
    filter: { warehouse_id },
  } = store

  const verifyBatch = (select: BatchDetail[]) => {
    let isBatchValid = true
    if (select.length === 0) {
      Tip.danger(t('请选择需要替换的批次！'))
      isBatchValid = false
    }

    _.forEach(select, (item) => {
      if (!isValid(item.sku_base_quantity) || !isValid(item.ssu_quantity)) {
        isBatchValid = false
        Tip.danger(t('替换数（基本单位）为必填'))
        return false
      } else if (+item.sku_base_quantity! === 0 || +item.ssu_quantity! === 0) {
        isBatchValid = false
        Tip.danger(t('替换数（基本单位）不能为0'))
      }
    })
    return isBatchValid
  }

  const handleEnsure = (select: BatchDetail[], result: SkuStockExpand) => {
    if (!verifyBatch(select)) {
      return
    }

    store.createReplaceBatch(result, select).then((json) => {
      Modal.hide()
      Tip.success(`已创建货值调整单${json?.adjust_sheet_serial_no}`)
      store.handleClearSelect()
      store.doRequest()
      return null
    })
  }

  const handleReplaceStock = () => {
    Modal.render({
      children: <BatchModal batch_ids={select_batch} isSelectAll={selectAll} />,
      style: {
        width: '380px',
      },
      title: t('批量入库'),
      onHide: Modal.hide,
    })
  }

  const handleReplaceBatch = () => {
    console.log(123)
    const select_stock = _.compact(
      _.map(select_tree, (v, k) =>
        v.length >= 1
          ? {
              sku_id: k,
              batch_ids: v,
            }
          : null,
      ),
    )
    if (select_stock.length >= 2) {
      Tip.danger('使用库存批次替换只能选择一种商品')
      return
    }

    const result_sku = _.find(list, { sku_id: select_stock[0].sku_id })
    const result = _.cloneDeep(result_sku!)
    result!.batches = _.filter(result_sku?.batches, ({ batch_id }) =>
      _.includes(select_batch, batch_id),
    )
    const maxTime = moment(
      _.reduce(
        result.batches,
        (result, v) => Math.min(result, +v.in_stock_time!),
        +moment().format('x'),
      ),
    )
    const nowEndTime = new Date()
    Modal.render({
      children: (
        <BatchSelect
          selectKey='batch_id'
          warehouseId={warehouse_id}
          selected={[]}
          hasSkuUnit
          type='virtual'
          defaultFilter={{
            end_time: maxTime.isBefore(nowEndTime)
              ? maxTime.toDate()
              : nowEndTime,
          }}
          productInfo={{
            skuInfo: {
              sku_id: result.sku_id!,
              skuBaseUnitName: result.base_unit_name!,
              skuBaseCount: +_.reduce(
                result.batches,
                (sum, n) => Big(sum).plus(n.origin_stock?.base_unit?.quantity!),
                Big(0),
              ),
              sku_type: result.skuInfo!.sku!.sku_type,
              sku_base_unit_id: result.base_unit_id,
            },
            ssuInfo: { ssu_unit_id: '0' },
          }}
          filterInfo={{
            maxTime: maxTime.toDate(),
          }}
          needInputLimit
          onEnsure={(select) => {
            handleEnsure(select, result)
          }}
          onCancel={() => {
            Modal.hide()
          }}
          canPackage
          disabledSsu
        />
      ),
      style: {
        width: '1200px',
      },
      title: t('批量替代超支库存'),
      onHide: Modal.hide,
    })
  }

  return (
    <TableXUtil.BatchActionBar
      onClose={() => {
        store.handleClearSelect()
      }}
      batchActions={[
        {
          children: (
            <BatchActionDefault>{t('新建入库替换')}</BatchActionDefault>
          ),
          onAction: handleReplaceStock,
        },
        {
          children: (
            <BatchActionDefault>{t('使用库存批次替换')}</BatchActionDefault>
          ),
          onAction: handleReplaceBatch,
        },
      ]}
      isSelectAll={selectAll}
      toggleSelectAll={() => {
        store.handleSelectAll()
        setSelectAll(!selectAll)
      }}
      count={select_batch!.length}
      selected={select_batch}
    />
  )
}

export default observer(BatchAction)
