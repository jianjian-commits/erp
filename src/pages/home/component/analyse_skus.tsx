import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import Panel from './panel'
import DateButton from './date_button'
import { Flex, Price } from '@gm-pc/react'
import BaseECharts from '@/common/components/customize_echarts/base_echarts'
import pieEChartsHoc from '@/common/components/customize_echarts/pie_echarts_hoc'

const PieECharts = pieEChartsHoc(BaseECharts)

const AnalyseSkus = observer(() => {
  const data = [
    {
      name: '蛋品类',
      account_price: '57.00',
      account_price_proportion: '0.3774334525228446563369090187',
      id: 'A7662',
    },
    {
      name: '蔬果类',
      account_price: '42.02',
      account_price_proportion: '0.2782412925440339027943318766',
      id: 'A7666',
    },
    {
      name: '其他',
      account_price: '34.00',
      account_price_proportion: '0.2251357436101178651834194146',
      id: 'A7673',
    },
    {
      name: '畜类',
      account_price: '18.00',
      account_price_proportion: '0.1191895113230035756853396901',
      id: 'A7661',
    },
  ]
  const handleSelectChange = (field: string, value: Date) => {
    console.log('handleSelectChange', field, value)
  }
  return (
    <Panel
      title={t('分类统计')}
      right={
        <Flex alignStart height='35px'>
          <DateButton
            range={[1, 7, 15, 30]}
            onChange={(date) => handleSelectChange('dateType', date)}
          />
        </Flex>
      }
    >
      <PieECharts
        style={{ height: '381px', width: '100%' }}
        data={data}
        axisGroup={[{ itemName: 'name', value: 'account_price' }]}
        hasNoData={data.length === 0}
        axisGroupName={[t('分类统计')]}
        radiusList={[40, 70]}
        onSetCustomOption={(option) => {
          return {
            ...option,
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                const { name, seriesName, value, percent } = params
                return `${seriesName}<br/>${name}：${
                  value.account_price + Price.getUnit()
                }(${percent})%`
              },
            },
            legend: {
              ...option.legend,
              top: '10px',
              formatter: (name: string) => {
                return name?.length > 5 ? name.substr(0, 5) + '...' : name
              },
            },
          }
        }}
      />
    </Panel>
  )
})

export default AnalyseSkus
