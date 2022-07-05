import React, {
  FC,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useState,
} from 'react'
import { observer } from 'mobx-react'
import { Line } from '@ant-design/plots'
import {
  GetSkuReferencePricesResponse_ReferencePrices,
  Quotation,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { DatePicker, Radio, Button, Modal, Divider, ConfigProvider } from 'antd'
import store from './store'
import Big from 'big.js'
import classNames from 'classnames'
import locale from 'antd/es/date-picker/locale/zh_CN'
import Empty from '@/img/line_chart_empty.png'
import moment from 'moment'

export interface ProductPriceChartProps extends HTMLAttributes<HTMLDivElement> {
  type: keyof GetSkuReferencePricesResponse_ReferencePrices
  quotation?: Quotation
  sku_unit_filter: {
    sku_id: string
    /** 商品单价单位 */
    unit_id: string
    /** 下单单位 */
    order_unit_id: string
  }
  dialog?: boolean
}

const ProductPriceChart: FC<ProductPriceChartProps> = observer(
  ({ className, type, quotation, sku_unit_filter, dialog }) => {
    const handleRefresh = () =>
      store.fetch({
        list: [
          {
            quotation_id: quotation?.quotation_id!,
            quotation_type: quotation?.type!,
            ...sku_unit_filter,
          },
        ],
      })

    useEffect(() => {
      handleRefresh()
    }, [])

    useEffect(() => {
      if (!store.units(type).length) return
      store.selectedUnitId =
        store.selectedUnitId || store.units(type)?.[0].unit_id
    }, [store.units(type)])

    useEffect(() => {
      handleRefresh()
    }, [store.filter.begin, store.filter.end])

    const labelType =
      type === 'quotation_reference_prices'
        ? '报价'
        : type === 'in_stock_reference_prices'
        ? '入库价'
        : type === 'purchase_reference_prices'
        ? '采购价'
        : ''

    return (
      <div className='tw-flex tw-flex-col tw-items-center'>
        <div className='tw-mb-5 tw-w-full'>
          {dialog && <Divider className='tw-mt-0' />}
          <div>
            <DatePicker.RangePicker
              locale={locale}
              autoFocus
              value={[store.filter.begin, store.filter.end]}
              onChange={(values, formatString) => {
                if (!values) {
                  values = [
                    moment().subtract(6, 'day').startOf('day'),
                    moment().endOf('day'),
                  ]
                }
                store.filter.begin =
                  values?.[0]?.startOf('day') || store.filter.begin
                store.filter.end = values?.[1]?.endOf('day') || store.filter.end
              }}
              disabledDate={(current) => {
                const dates = [store.filter.begin, store.filter.end]
                const tooLate = dates[0] && current.diff(dates[0], 'days') > 90
                const tooEarly = dates[1] && dates[1].diff(current, 'days') > 90
                return !!tooEarly || !!tooLate
              }}
            />
          </div>
          <Divider />
          <div className='tw-mb-5 tw-flex tw-text-base'>
            <div className='tw-flex tw-flex-col tw-mr-10'>
              <span className='tw-text-gray-500 tw-text-xs tw-mb-2'>
                最高销售价(元/{store.unit(type)?.name || '-'})
              </span>
              <span className='tw-font-bold'>
                {store.maxPrice(type).toFixed(2)}
              </span>
            </div>
            <Divider type='vertical' style={{ height: 50 }} />
            <div className='tw-flex tw-flex-col tw-mx-10'>
              <span className='tw-text-gray-500 tw-text-xs tw-mb-2'>
                最低销售价(元/{store.unit(type)?.name || '-'})
              </span>
              <span className='tw-font-bold'>
                {store.minPrice(type).toFixed(2)}
              </span>
            </div>
            <Divider type='vertical' style={{ height: 50 }} />
            <div className='tw-flex tw-flex-col tw-mx-10'>
              <span className='tw-text-gray-500 tw-text-xs tw-mb-2'>
                平均销售价(元/{store.unit(type)?.name || '-'})
              </span>
              <span className='tw-font-bold'>
                {store.meanPrice(type).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className='tw-w-full tw-my-5 tw-relative'>
          <Line
            data={store.sourceData(type)}
            padding='auto'
            xField='date'
            yField='price'
            // xAxis={{
            //   tickCount: 5,
            //   title: {
            //     text: '日期',
            //   },
            // }}
            // yAxis={{
            //   title: {
            //     text: '单价',
            //   },
            // }}
            point={{
              size: 5,
              shape: 'circle',
              style: {
                fill: 'white',
                stroke: '#5B8FF9',
                lineWidth: 2,
              },
            }}
            label={{
              formatter(item) {
                return Big(item.price).toFixed(2) + '元'
              },
            }}
            meta={{
              price: {
                alias: '价格',
              },
              date: {
                alias: '时间',
              },
            }}
            onReady={(e) => {
              if (quotation?.type === Quotation_Type.PERIODIC) {
                e.chart.tooltip(false)
              } else {
                e.chart.tooltip({
                  showMarkers: true,
                  showContent: true,
                  showTitle: true,
                })
              }
            }}
          />
          {store.sourceData(type).length === 0 && (
            <div className='tw-absolute tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-m-auto tw-flex tw-items-center tw-justify-center'>
              <div>
                <img src={Empty} width={150} height={150} />
              </div>
              <div className='tw-text-gray-400'>暂无数据</div>
            </div>
          )}
        </div>

        <div
          className={classNames('units tw-mt-2 tw-flex', {
            'tw-hidden': type === 'quotation_reference_prices',
          })}
        >
          <div className='tw-font-bold tw-mr-2'>下单单位：</div>
          <div>
            <Radio.Group
              onChange={(v) => {
                store.selectedUnitId = v.target.value
              }}
              value={store.selectedUnitId}
            >
              {store.units(type).map((unit, i) => {
                return (
                  <Radio key={i} value={unit.unit_id}>
                    {unit.name}
                  </Radio>
                )
              })}
            </Radio.Group>
          </div>
        </div>
      </div>
    )
  },
)
export default ProductPriceChart

export function openProductPriceChartModal({
  title,
  ...rest
}: { title?: ReactNode } & ProductPriceChartProps) {
  const { destroy } = Modal.info({
    closable: true,
    icon: null,
    zIndex: 1045,
    okButtonProps: { style: { display: 'none' } },
    cancelButtonProps: { style: { display: 'none' } },
    width: 1080,
    title,
    content: <ProductPriceChart dialog {...rest} />,
  })
  return destroy
}
