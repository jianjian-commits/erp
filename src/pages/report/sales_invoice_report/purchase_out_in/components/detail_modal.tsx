import React, { FC } from 'react'
import { Flex, Price } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import BaseECharts from '@/common/components/customize_echarts/base_echarts'
import store, { CommonListType } from '../store'

type DetailModalProps = {
  data: CommonListType
}

const DetailModal: FC<DetailModalProps> = observer(({ data }) => {
  const { sku_name, category_name, expiry_date, sku_base_unit_name } = data
  const { rangeData, priceData, modalData } = store
  return (
    <Flex column className='gm-padding-15'>
      <Flex className='gm-margin-top-15'>
        <Flex flex>
          {t('商品名称')}: {sku_name}
        </Flex>
        <Flex flex>
          {t('分类')}: {category_name}
        </Flex>
        <Flex flex>
          {t('基本单位')}: {sku_base_unit_name}
        </Flex>
      </Flex>
      <Flex className='gm-margin-top-15'>
        <Flex flex>
          {t('默认供应商')}: {modalData?.supplier_name ?? '-'}
        </Flex>
        <Flex flex>
          {t('默认采购员')}: {modalData?.purchase_name ?? '-'}
        </Flex>
      </Flex>
      <Flex className='gm-margin-top-15'>
        <Flex flex>
          {t('保质期')}:{expiry_date}
          {t('天')}
        </Flex>
        <Flex flex>
          {t('最近采购单价')}: {modalData?.lastestPrice}元
        </Flex>
      </Flex>
      <Flex className='gm-margin-top-15'>
        <BaseECharts
          option={{
            title: {
              text: '入库单价(元)',
              x: 'center',
              y: '10px',
            },
            xAxis: {
              type: 'category',
              data: rangeData,
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                formatter: `{value}${Price.getUnit()}`,
              },
            },
            grid: {
              left: 100,
            },
            series: [
              {
                data: priceData,
                type: 'line',
                lineStyle: {
                  normal: {
                    color: '#40a9ff',
                  },
                },
              },
            ],
          }}
          style={{ height: '400px', width: '100%' }}
          className=''
        />
      </Flex>
    </Flex>
  )
})

export default DetailModal
