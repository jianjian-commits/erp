import React, { FC, HTMLAttributes, ReactNode, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Modal, DatePicker, Radio, Button, Divider } from 'antd'
import { Line } from '@ant-design/plots'
import store from './store'
import Big from 'big.js'
import { GetSalePriceDataRequest_Filter } from 'gm_api/src/order'
import locale from 'antd/es/date-picker/locale/zh_CN'
import Empty from '@/img/line_chart_empty.png'
import moment from 'moment'

const { RangePicker } = DatePicker

export interface HistoryPriceModalProps extends HTMLAttributes<HTMLDivElement> {
  sku_unit_filter: GetSalePriceDataRequest_Filter
}

const HistoryPriceModal: FC<HistoryPriceModalProps> = observer(
  ({ className, sku_unit_filter }) => {
    const handleRefresh = () => store.fetch({ sku_unit_filter })

    useEffect(() => {
      handleRefresh()
    }, [store.filter.begin, store.filter.end])

    return (
      <div className='tw-flex tw-flex-col tw-items-center'>
        <div className='tw-w-full'>
          <Divider className='tw-mt-0' />
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
                最高销售价(元/{store.unit?.name || '-'})
              </span>
              <span className='tw-font-bold'>{store.maxPrice.toFixed(2)}</span>
            </div>
            <Divider type='vertical' style={{ height: 50 }} />
            <div className='tw-flex tw-flex-col tw-mx-10'>
              <span className='tw-text-gray-500 tw-text-xs tw-mb-2'>
                最低销售价(元/{store.unit?.name || '-'})
              </span>
              <span className='tw-font-bold'>{store.minPrice.toFixed(2)}</span>
            </div>
            <Divider type='vertical' style={{ height: 50 }} />
            <div className='tw-flex tw-flex-col tw-mx-10'>
              <span className='tw-text-gray-500 tw-text-xs tw-mb-2'>
                平均销售价(元/{store.unit?.name || '-'})
              </span>
              <span className='tw-font-bold'>{store.meanPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className='tw-w-full tw-my-5 tw-relative'>
          <Line
            data={store.sourceData}
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
              e.chart.tooltip({
                showMarkers: true,
                showContent: true,
                showTitle: true,
              })
            }}
          />

          {store.sourceData.length === 0 && (
            <div className='tw-absolute tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-m-auto tw-flex tw-items-center tw-justify-center'>
              <div>
                <img src={Empty} width={150} height={150} />
              </div>
              <div className='tw-text-gray-400'>暂无数据</div>
            </div>
          )}
        </div>
      </div>
    )
  },
)
export default HistoryPriceModal

export function openHistoryPriceModal({
  title,
  ...rest
}: { title?: ReactNode } & HistoryPriceModalProps) {
  title = title ?? '历史销售价'
  const { destroy } = Modal.info({
    closable: true,
    icon: null,
    zIndex: 1042,
    okButtonProps: { style: { display: 'none' } },
    cancelButtonProps: { style: { display: 'none' } },
    width: 1080,
    title,
    content: <HistoryPriceModal {...rest} />,
  })
  return destroy
}
