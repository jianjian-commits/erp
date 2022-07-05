import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { Button, Col, Divider, Row, Select, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import Footer, { FooterProps } from './footer'
import SelectFakeOrderField from '../select-fake-order-field'
import { Price } from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from '../../detail/store'
import { useStoreContext } from '../store/context'
import { MerchandiseShape, Key } from '../store/types'
import { formatePrice, getFakeFields, isZero } from '../utils'
import { TableRowSelection } from 'antd/lib/table/interface'
import InputNumber from '../input_number'
import SelectSku from '../select_sku'
import SelectedList from '../selected_list'
import { guid } from '@/common/util'
import { isCombineSku } from '@/pages/order/util'

type Step1Props = Pick<FooterProps, 'onCancel' | 'onOk'>

const Step1: React.VFC<Step1Props> = observer((props) => {
  const { onCancel, onOk } = props
  const ctx = useStoreContext()

  const tableNode = useRef<HTMLDivElement>(null)

  // 是否需要滚动到底部（新增商品时需要）
  const shouldScrollBottom = useRef(false)
  useEffect(() => {
    if (shouldScrollBottom.current) {
      shouldScrollBottom.current = false
      if (tableNode.current) {
        const body = tableNode.current.querySelector('.ant-table-body')
        if (body) {
          body.scrollTo({ top: body.scrollHeight })
        }
      }
    }
  })

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  const [data, setData] = useState<MerchandiseShape[]>(() => {
    return _.map(store.list, (item, index): MerchandiseShape | undefined => {
      // 过滤组合商品
      if (isCombineSku(item)) {
        return undefined
      }
      // 过滤组合商品的子商品
      if (_.trim(item.parentId).length > 0) {
        return undefined
      }
      // 未选择商品
      const isNotSku = _.size(item.customize_code) <= 0
      // 未选择单位
      const isNoUnit = _.trim(item.unit_id).length === 0

      if (isNotSku || isNoUnit) {
        ctx.insetSku(item.sku_id!, item)
      }

      return {
        key: `${item.sku_id}-${item.unit_id}-${index}`,
        rawIndex: index,
        commodityCode: item.customize_code,
        name: item.name,
        price: formatePrice(item.price),
        unitName: item.unit?.name || '',
        unitId: item.unit_id || '',
        ...getFakeFields(item, ctx.field),

        /** 未选择商品/单位时需要的字段 */
        isNewItem: isNotSku,
        canChooseUnit: isNoUnit,
        skuId: item.sku_id,
        units: item.units,
      }
    }).filter((item): item is MerchandiseShape => !_.isNil(item))
  })

  const selectedRows = useMemo(() => {
    // 列表顺序
    const list = _.filter(data, (item) => {
      // 未选择单位
      const isNoUnit = _.trim(item.unitId).length === 0
      if (isNoUnit) {
        return false
      }
      return selectedRowKeys.includes(item.key)
    })
    // 用户勾选顺序
    const selected = _.map(selectedRowKeys, (item) => {
      const index = data.findIndex((v) => item === v.key)
      return data[index]
    }).filter(Boolean)
    return { list, selected }
  }, [data, selectedRowKeys])

  const isNotSelected = selectedRows.list.length === 0

  const rowSelection: TableRowSelection<MerchandiseShape> = {
    type: 'checkbox',
    selectedRowKeys,
    onChange(selectedKeys) {
      setSelectedRowKeys(selectedKeys as string[])
    },
    // renderCell(val, row) {
    //   // 未选择单位
    //   const isNoUnit = _.trim(row.unitId).length === 0

    //   if (!isNoUnit) {
    //     return (
    //       <Checkbox
    //         checked={val}
    //         onChange={() => {
    //           setSelectedRowKeys((selected) => {
    //             if (val) {
    //               return _.filter(selected, (item) => item !== row.key)
    //             }
    //             return [...selected, row.key]
    //           })
    //         }}
    //       />
    //     )
    //   }
    //   // 非正常的商品
    //   const isNotSku = _.size(row.commodityCode) <= 0
    //   let tips = t('此项不可选：未选择商品')
    //   if (!isNotSku && isNoUnit) {
    //     tips = t('此项不可选：未选择下单单位')
    //   }
    //   return (
    //     <Tooltip overlay={tips}>
    //       <Checkbox checked={val} disabled={isNoUnit} />
    //     </Tooltip>
    //   )
    // },
    // 列表顶部全选按钮使用
    // getCheckboxProps(row) {
    //   // 未选择单位
    //   const isNoUnit = _.trim(row.unitId).length === 0
    //   return {
    //     // 没有商品编码不可选
    //     disabled: isNoUnit || _.size(row.commodityCode) <= 0,
    //   }
    // },
  }

  const handleOk = (e: React.MouseEvent<HTMLButtonElement>) => {
    ctx.setList(selectedRows.list)
    if (_.isFunction(onOk)) {
      onOk(e)
    }
  }

  /** 添加商品（新增一行） */
  const handleNewItem = () => {
    shouldScrollBottom.current = true
    const key = guid()
    setData((rawData) => {
      const result = rawData.slice()
      result.push({
        key,
        rawIndex: -1,
        commodityCode: '',
        name: '',
        price: '0',
        unitId: '',
        unitName: '',
        count: '0',
        amount: '0',
        isNewItem: true,
      })
      return result
    })
    setSelectedRowKeys((rawData) => {
      const result = rawData.slice()
      result.push(key)
      return result
    })
  }

  const columns = useMemo<ColumnsType<MerchandiseShape>>(() => {
    return [
      {
        title: t('商品编码'),
        dataIndex: 'commodityCode',
      },
      {
        title: t('商品名'),
        dataIndex: 'name',
        width: 240,
        render(val, row, index) {
          if (row.isNewItem) {
            const { customer } = store.order
            return (
              <SelectSku
                className='tw-w-full'
                placeholder={t('输入商品名')}
                customerId={customer?.customer_id!}
                quotationId={customer?.quotation?.quotation_id!}
                onChange={(e) => {
                  ctx.insetSku(e.sku_id!, e)
                  setData((rawData) => {
                    const result = rawData.slice()
                    result[index] = {
                      ...result[index],
                      skuId: e.sku_id,
                      commodityCode: e.customize_code,
                      name: e.name,
                      units: e.units,
                      unitId: '',
                      price: '0',
                    }
                    return result
                  })
                }}
              />
            )
          }
          return val
        },
      },
      {
        title: t('下单单位'),
        dataIndex: 'unitName',
        width: 240,
        render(val, row, index) {
          if (row.isNewItem || row.canChooseUnit) {
            return (
              <Select
                className='tw-w-full'
                placeholder={t('请选择下单单位')}
                fieldNames={{ value: 'value', label: 'text' }}
                options={row.units}
                value={row.unitId}
                onChange={(unitId, option) => {
                  const opt = Array.isArray(option) ? option[0] : option
                  setData((rawData) => {
                    const result = rawData.slice()
                    const price = ctx.getPriceByUnitId(row.skuId!, unitId)
                    result[index] = {
                      ...result[index],
                      unitId: opt.value,
                      unitName: opt.text,
                      price: `${price}`,
                    }
                    return result
                  })
                }}
              />
            )
          }
          return val
        },
      },
      {
        title: t('单价'),
        dataIndex: 'price',
        render(val) {
          return `${val}${Price.getUnit()}`
        },
      },
    ]
  }, [ctx])

  return (
    <>
      <Row>
        <Col className='tw-px-6 divider-y' span={18}>
          <div className='tw-flex tw-mb-4'>
            <div
              className='tw-inline-flex tw-items-center'
              style={{ marginRight: 28 }}
            >
              <label
                className='tw-whitespace-nowrap'
                htmlFor='smart-add-fake-order-amount'
                style={{ marginRight: 12 }}
              >
                {t('加单总金额')}
              </label>
              <InputNumber
                id='smart-add-fake-order-amount'
                value={ctx.targetAmount}
                min={0}
                placeholder={t('输入加单总金额')}
                suffix={Price.getUnit()}
                onChange={ctx.setTargetAmount}
              />
            </div>
            <SelectFakeOrderField value={ctx.field} onChange={ctx.setField} />
            <Button
              className='tw-ml-auto'
              type='primary'
              onClick={handleNewItem}
            >
              {t('添加商品')}
            </Button>
          </div>
          <Table<MerchandiseShape>
            size='small'
            rowSelection={rowSelection}
            rowKey='key'
            dataSource={data}
            columns={columns}
            scroll={{ y: 450 }}
            ref={tableNode}
            pagination={false}
          />
        </Col>
        <Col span={6}>
          <SelectedList
            list={selectedRows.selected}
            onClear={() => setSelectedRowKeys([])}
            onRemove={(key) =>
              setSelectedRowKeys((rawKeys) => {
                return _.filter(rawKeys, (item) => item !== key)
              })
            }
          />
        </Col>
      </Row>
      <Divider className='tw-m-0' />
      <div className='tw-py-4 tw-px-5 tw-text-right'>
        <Footer
          disabledOk={isNotSelected}
          onCancel={onCancel}
          onOk={handleOk}
        />
      </div>
    </>
  )
})
Step1.displayName = 'Step1'

export default Step1
