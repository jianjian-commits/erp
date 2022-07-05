import React, { useEffect, useState, FC } from 'react'
import BaseECharts from './base_echarts'
import _ from 'lodash'
import { pieEChartsOptions } from './interface'

const pieEChartsHoc = (Component) => {
  const PieECharts: FC<pieEChartsOptions> = (props) => {
    const {
      option,
      data,
      axisGroup,
      centerPosition,
      customOption,
      radiusList,
      onSetCustomOption,
      title,
      hasNoData,
      axisGroupName,
      ...rest
    } = props
    const [pieOption, setPieOption] = useState(null)

    const radius = radiusList || BaseECharts.defaultPieRadius

    useEffect(() => {
      if (!hasNoData) {
        setPieOption(_.cloneDeep(setOption()))
      } else {
        setPieOption(_.cloneDeep(BaseECharts.pieNoDataOption))
      }
    }, [...Object.values(props)])

    const setBaseOption = (currentOption) => {
      Object.assign(currentOption, {
        dataset: {
          source: data,
          dimensions: data.length > 0 ? [...Object.keys(data[0])] : [], // 与encode中的配置关联，取值从这取
        },
        series: _.map(axisGroup, (item) => {
          return {
            type: 'pie',
            stack: item.stack,
            itemStyle: {
              normal: {},
            },
            label: {
              normal: {},
            },
            center: [],
            encode: {
              itemName: [item.itemName],
              value: [item.value],
            },
            radius: radius,
          }
        }),
      })
    }

    const setTitle = (currentOption) => {
      if (title && title.text) {
        currentOption.title.text = title.text
      }
    }

    const setFormatToolTip = (currentOption) => {
      const { toolTipFormatFunc } = props

      currentOption.tooltip.formatter =
        toolTipFormatFunc ||
        function (params) {
          return `${params.seriesName}</br>${params.marker}
        ${params.name}: 
        ${params.value[axisGroup[params.seriesIndex].value]}(${
            params.percent
          }%)`
        }
    }

    const setCenterPosition = (currentOption) => {
      _.each(axisGroup, (item, index) => {
        const defaultCenter1 =
          ((index + 1) / (axisGroup.length + 1)) * 100 + '%' // 公式为 位置/（总个数+1）* 100%
        const defaultCenter2 = '50%'

        currentOption.series[index].center =
          centerPosition && centerPosition[index]
            ? centerPosition[index]
            : [defaultCenter1, defaultCenter2]
      })
    }

    const setMainColor = (currentOption) => {
      currentOption.color = customOption.mainColor
    }

    const setOption = () => {
      let currentOption = _.cloneDeep(BaseECharts.defaultPieOption)
      if (option) {
        currentOption = option
      } else {
        setBaseOption(currentOption)
        // 设置seriesName
        if (axisGroupName) {
          _.each(currentOption.series, (item, index) => {
            item.name = axisGroupName[index]
          })
        }

        setFormatToolTip(currentOption)
        setCenterPosition(currentOption)
        setTitle(currentOption)
        if (customOption && customOption.mainColor) {
          setMainColor(currentOption)
        }
      }

      if (onSetCustomOption) {
        currentOption = _.cloneDeep(onSetCustomOption(currentOption))
      }

      return currentOption
    }

    return <Component {...rest} option={pieOption} />
  }

  return PieECharts
}

export default pieEChartsHoc
