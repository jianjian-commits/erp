import React, { useEffect, useState, FC } from 'react'
import BaseECharts from './base_echarts'
import { getDateRange } from './util'
import moment from 'moment'
import _ from 'lodash'
import { lineEChartsOptions } from './interface'

const lineEChartsHoc = (Component) => {
  const LineECharts: FC<lineEChartsOptions> = (props) => {
    const {
      option,
      data,
      axisGroup,
      axisName,
      customOption,
      title,
      onSetCustomOption,
      axisGroupName,
      hasNoData,
      fillAndFormatDate,
      ...rest
    } = props
    const [lineOption, setLineOption] = useState(null)

    useEffect(() => {
      setRealOption()
    }, Object.values(props))

    const setRealOption = () => {
      let currentOption = {}

      if (!hasNoData) {
        currentOption = _.cloneDeep(setOption())
      } else {
        currentOption = _.cloneDeep(setNoDataOption())
      }

      if (onSetCustomOption) {
        currentOption = _.cloneDeep(onSetCustomOption(currentOption))
      }

      setLineOption(_.cloneDeep(currentOption))
    }

    const setNoDataOption = () => {
      const currentOption = _.cloneDeep(BaseECharts.lineNoDataOption)

      // 没有数据状态下也显示坐标轴名字
      setAxis(currentOption)

      return currentOption
    }

    const setBaseOption = (currentOption) => {
      Object.assign(currentOption, {
        dataset: {
          source: data,
          dimensions: data.length > 0 ? [...Object.keys(data[0])] : [], // 与encode中的配置关联，取值从这取
        },
        series: _.map(axisGroup, (item) => {
          return {
            type: 'line',
            stack: item.stack,
            encode: {
              x: [item.x],
              y: [item.y],
              seriesName: [item.y],
            },
            symbol: 'circle',
            symbolSize: 8,
            smooth: true, // 圆滑曲线
            itemStyle: {
              normal: {},
            },
            lineStyle: {
              width: 3,
            },
          }
        }),
      })
    }

    const setTitle = (currentOption) => {
      if (title && title.text) {
        currentOption.title.text = title.text
      }
    }

    const setAxis = (currentOption) => {
      if (axisName) {
        if (axisName.x) {
          currentOption.xAxis.name = axisName.x
        }
        if (axisName.y) {
          currentOption.yAxis.name = axisName.y
        }
      }

      // 先写死，现在只有横坐标为基轴，轴坐标为值的情况
      currentOption.xAxis.type = 'category'
      currentOption.yAxis.type = 'value'
    }

    const setFormatDate = (currentOption) => {
      const {
        fillAndFormatDate: { begin, end, fillItemName, dateFormatType },
      } = props

      const fillDate = getDateRange(begin, end)
      const formatData = []

      _.each(fillDate, (date, index) => {
        // 将所有的日期对应的其他字段赋值为0
        const currentItem = {}
        _.each(Object.keys(data[0]), (key) => {
          currentItem[key] = 0
        })
        currentItem[fillItemName] = moment(date).format(dateFormatType)
        formatData[index] = currentItem

        _.each(data, (item) => {
          // 当data中有数据时，重新对该数据赋值
          if (item[fillItemName] === date) {
            const currentItem = { ...item }
            currentItem[fillItemName] = moment(date).format(dateFormatType)

            formatData[index] = currentItem
            return false
          }
        })
      })
      currentOption.dataset.source = formatData
    }

    const setMainColor = (currentOption) => {
      currentOption.color = customOption.mainColor
    }

    const setOption = () => {
      let currentOption = _.cloneDeep(BaseECharts.defaultLineOption)

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
        setTitle(currentOption)
        setAxis(currentOption)

        if (fillAndFormatDate) {
          setFormatDate(currentOption)
        }

        if (customOption && customOption.mainColor) {
          setMainColor(currentOption)
        }
      }

      return currentOption
    }

    return <Component {...rest} option={lineOption} />
  }
  return LineECharts
}

export default lineEChartsHoc
