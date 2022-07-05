import React, { useEffect, useState } from 'react'
import BaseECharts from './base_echarts'
import _ from 'lodash'
import requireECharts from 'gm-service/src/require_module/require_echarts'
import PropTypes from 'prop-types'

const scheduleBarEChartsHoc = (Component) => {
  const ScheduleBarECharts = (props) => {
    const {
      option,
      data,
      customOption,
      itemFieldName,
      showText,
      isGradualChange,
      toolTipFormatFunc,
      axisLabelFormatFunc,
      onSetCustomOption,
      ...rest
    } = props
    const [barOption, setBarOption] = useState(
      BaseECharts.defaultScheduleBarOption,
    )

    const [eCharts, setECharts] = useState(null)

    useEffect(() => {
      // 渐变主题才需要获取eCharts
      if (isGradualChange) {
        getECharts()
      }
    }, [])

    useEffect(() => {
      if (isGradualChange && eCharts) {
        setBarOption(_.cloneDeep(setGradientOption()))
      }
    }, [...Object.values(props), eCharts])

    useEffect(() => {
      if (!isGradualChange) {
        setBarOption(_.cloneDeep(setOption()))
      }
    }, [...Object.values(props)])

    const getECharts = () => {
      new Promise((resolve) => {
        if (eCharts) {
          resolve()
        } else {
          requireECharts((char) => {
            setECharts(char)

            resolve()
          })
        }
      }).then()
    }

    const setFormatToolTip = (currentOption) => {
      currentOption.tooltip.formatter =
        toolTipFormatFunc ||
        function (params) {
          const finishedNum = params[0].value[itemFieldName.finishedFieldName]
          const unFinishedNum =
            params[0].value[itemFieldName.totalFieldName] - finishedNum

          return `${params[0].marker} ${showText.finishedText}: ${finishedNum}</br> ${params[1].marker} ${showText.unFinishedText}: ${unFinishedNum}`
        }
    }

    const setBaseOption = (currentOption) => {
      Object.assign(currentOption, {
        dataset: {
          source: [data],
          dimensions: data ? [...Object.keys(data)] : [], // 与encode中的配置关联，取值从这取
        },
        series: [
          {
            type: 'bar',
            label: {
              normal: {
                show: data[itemFieldName.finishedFieldName] > 0,
                position: 'inside',
                color: '#fff',
                formatter: (params) => {
                  const finishedNum =
                    params.value[itemFieldName.finishedFieldName]
                  const totalNum = params.value[itemFieldName.totalFieldName]

                  return `${finishedNum}/${totalNum}`
                },
              },
            },
            itemStyle: {
              normal: {
                barBorderRadius: 30,
              },
            },
            barWidth: 20,
            emphasis: {
              itemStyle: {},
            },
            encode: {
              x: [itemFieldName.finishedFieldName],
              y: [itemFieldName.labelFieldName],
            },
          },
          {
            name: '外框',
            type: 'bar',
            itemStyle: {
              normal: {
                barBorderRadius: 30,
                color: '#cdd7e5',
              },
            },
            barGap: '-100%',
            z: 0,
            label: {
              normal: {
                show: data[itemFieldName.finishedFieldName] === 0,
                position: 'inside',
                color: '#60a8f2',
                formatter: (params) => {
                  const finishedNum =
                    params.value[itemFieldName.finishedFieldName]
                  const totalNum = params.value[itemFieldName.totalFieldName]

                  return `${finishedNum}/${totalNum}`
                },
              },
            },
            barWidth: 20,
            encode: {
              x: ['total'],
              y: [itemFieldName.labelFieldName],
            },
          },
        ],
      })
    }

    const setColor = (currentOption) => {
      currentOption.color =
        customOption.mainColor || BaseECharts.defaultScheduleBarColor
    }

    const setAxis = (currentOption) => {
      currentOption.xAxis.type = 'value'
      currentOption.yAxis.type = 'category'
    }

    const setFormatAxisLabel = (currentOption) => {
      if (axisLabelFormatFunc) {
        currentOption.yAxis.axisLabel.formatter = axisLabelFormatFunc
        currentOption.yAxis.axisLabel.fontSize = 10
      }
    }

    const setBarWidth = (currentOption) => {
      if (customOption.barWidth) {
        _.each(currentOption.series, (item) => {
          item.barWidth = customOption.barWidth
        })
      }
    }

    const setOption = () => {
      let currentOption = _.cloneDeep(BaseECharts.defaultScheduleBarOption)
      if (option) {
        currentOption = option
      } else {
        setBaseOption(currentOption)
        setAxis(currentOption)
        setFormatToolTip(currentOption)
        setFormatAxisLabel(currentOption)

        if (customOption) {
          setBarWidth(currentOption)
          if (customOption.mainColor) {
            setColor(currentOption)
          }
        }
      }

      if (onSetCustomOption) {
        currentOption = _.cloneDeep(onSetCustomOption(currentOption))
      }

      return currentOption
    }

    const setGradientOption = () => {
      const gradientOption = _.cloneDeep(setOption())

      const linearGradientColor = customOption
        ? customOption.linearGradientColor
        : null

      _.each(gradientOption.series, (item, index) => {
        const currentLinearGradientColor =
          linearGradientColor && linearGradientColor[index]
            ? linearGradientColor[index]
            : BaseECharts.defaultSchedulePieLinearGradientColor[index]

        // 设置渐变方向
        const direction = (customOption &&
          customOption.linearGradientDirection) || [0, 0, 0, 1]

        item.itemStyle.normal.color = new eCharts.graphic.LinearGradient(
          ...direction,
          currentLinearGradientColor,
        )
      })

      gradientOption.tooltip.backgroundColor = 'rgba(36, 51, 81, 0.7)'
      gradientOption.tooltip.borderColor = '#32c5ff'

      gradientOption.yAxis.axisLabel.color = '#64a5ea'
      gradientOption.tooltip.axisPointer.shadowStyle.color =
        'rgba(16, 187, 255, 0.5)'

      return gradientOption
    }

    return <Component {...rest} option={barOption} />
  }

  ScheduleBarECharts.propTypes = {
    option: PropTypes.object,
    data: PropTypes.object,
    // 自定义的option配置，含：mainColor，linearGradientColor, barWidth(string), linearGradientDirection。
    // 格式： mainColor: ['#234233','#454354',...], linearGradientColor: [ [{ offset: 0, color: '#345344' }, { offset: 1, color: '#345344' }] , [{},{}], [{},{}], ... ]
    // mainColor、linearGradientColor格式可参考defaultBarColor和defaultBarLinearGradientColor
    // offset 为该颜色起始位置，一个数组为一个渐变色，offset区间为0～1，可多个不止两个
    // linearGradientDirection(渐变方向：右/下/左/上): 默认为[0, 0, 0, 1]，从正上方开始渐变
    customOption: PropTypes.object,
    itemFieldName: PropTypes.object,
    showText: PropTypes.object,
    isGradualChange: PropTypes.bool,
    axisLabelFormatFunc: PropTypes.func,
    toolTipFormatFunc: PropTypes.func,
    onSetCustomOption: PropTypes.func,
  }

  return ScheduleBarECharts
}

export default scheduleBarEChartsHoc
