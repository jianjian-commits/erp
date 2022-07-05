import React, { useEffect, useState } from 'react'

import _ from 'lodash'

import Big from 'big.js'
import BaseECharts from '@/common/components/customize_echarts/base_echarts'
import requireECharts from 'gm-service/src/require_module/require_echarts'

import PropTypes from 'prop-types'

const pieEChartsHoc = (Component) => {
  const PieECharts = (props) => {
    const {
      option,
      data,
      centerPosition,
      itemFieldName,
      isHalfColor,
      showText,
      showLegend,
      radiusList,
      onSetCustomOption,
      titlePosition,
      isGradualChange,
      customOption,
      onFormatLabel,
      labelFormatStyle,
      ...rest
    } = props
    const [pieOption, setPieOption] = useState(null)

    const [eCharts, setECharts] = useState(null)

    const radius = radiusList || BaseECharts.defaultSchedulePieRadius

    useEffect(() => {
      // 渐变主题才需要获取eCharts
      if (isGradualChange) {
        getECharts()
      }
    }, [])

    useEffect(() => {
      if (isGradualChange && eCharts) {
        setPieOption(_.cloneDeep(setGradientOption()))
      }
    }, [...Object.values(props), eCharts])

    useEffect(() => {
      if (!isGradualChange) {
        setPieOption(_.cloneDeep(setOption()))
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

    const getFormatData = (currentData) => {
      const resultData = [{}, {}]
      _.each(currentData, (item, index) => {
        // index===0 已完成，index===1 未完成
        resultData[0][`${index}name`] = showText.finishedText
        resultData[1][`${index}name`] = showText.unFinishedText
        resultData[0][`${index}value`] = item[itemFieldName.finishedFieldName]
        resultData[1][`${index}value`] =
          item[itemFieldName.totalFieldName] -
          item[itemFieldName.finishedFieldName]
      })

      return resultData
    }

    const setBaseOption = (currentOption) => {
      const formatData = getFormatData(data)
      Object.assign(currentOption, {
        dataset: {
          dimensions:
            formatData.length > 0 ? [...Object.keys(formatData[0])] : [], // 与encode中的配置关联，取值从这取
        },
        series: _.map(data, (item, index) => {
          let formatLabel = null
          if (_.isArray(onFormatLabel)) {
            formatLabel = onFormatLabel.join('\n')
          } else {
            formatLabel = onFormatLabel
              ? (params) => onFormatLabel(index, params)
              : (params) => handleFormatLabel(index, params)
          }
          return {
            type: 'pie',
            label: {
              formatter: formatLabel,
              rich: labelFormatStyle,
            },
            emphasis: {
              itemStyle: {},
            },
            center: [],

            data: [
              {
                name: formatData[0][`${index}name`],
                value: formatData[0][`${index}value`],
                itemStyle: {
                  normal: {},
                },
                label: {
                  show: true,
                  position: 'center',
                  color: BaseECharts.defaultSchedulePieColor[0],
                },
              },
              {
                name: formatData[1][`${index}name`],
                value: formatData[1][`${index}value`],
                itemStyle: {
                  normal: {},
                },
                label: {
                  show: false,
                  position: 'inside',
                },
              },
            ],
            // roundCap: true,
            radius: radius,
          }
        }),
      })
    }

    const setCenterPosition = (currentOption) => {
      _.each(data, (item, index) => {
        const defaultCenter1 = ((index + 1) / (data.length + 1)) * 100 + '%' // 公式为 位置/（总个数+1）* 100%
        const defaultCenter2 = '50%'
        currentOption.series[index].center =
          centerPosition && centerPosition[index]
            ? centerPosition[index]
            : [defaultCenter1, defaultCenter2]
      })
    }

    const handleFormatLabel = (index) => {
      const finishNum = data[index][itemFieldName.finishedFieldName]
      const totalNumb = data[index][itemFieldName.totalFieldName]

      return totalNumb
        ? Big(finishNum).div(totalNumb).times(100).toFixed(2) + '%'
        : '0%'
    }

    const setTitle = (currentOption) => {
      currentOption.title = []

      _.each(data, (item, index) => {
        const left =
          titlePosition && titlePosition.left
            ? titlePosition.left
            : currentOption.series[index].center[0] // 对齐

        const bottom =
          titlePosition && titlePosition.bottom ? titlePosition.bottom : '20'

        currentOption.title[index] = {
          ...currentOption.title[index],
          text: item[itemFieldName.titleFieldName],
          textAlign: 'center',
          textVerticalAlign: 'middle',
          textStyle: {
            fontSize: '12px',
          },
          left: left,
          bottom: bottom,
        }
      })
    }

    const setFormatToolTip = (currentOption) => {
      const { toolTipFormatFunc } = props

      currentOption.tooltip.formatter =
        toolTipFormatFunc ||
        function (params) {
          const totalNumb =
            data[params.seriesIndex][itemFieldName.totalFieldName]
          const percent = Big(params.value || 0)
            .div(totalNumb || 1)
            .times(100)
            .toFixed(2) // 由于echarts返回的不一定是正确的值，这里自己计算

          return `${params.marker}
        ${params.name}: 
        ${percent}%`
        }
    }

    const setColor = (currentOption) => {
      const { mainColor } = customOption
      currentOption.color = mainColor || BaseECharts.defaultSchedulePieColor
    }

    const setEmphasisColor = (currentOption) => {
      // 未完成hover样式
      // currentOption.series[0].emphasis.itemStyle.color = "#007fff";
      // currentOption.series[1].emphasis.itemStyle.color = ["#007fff", "#cdd7e5"];
    }

    const setShowLegend = (currentOption) => {
      currentOption.legend.show = true
    }

    const setHalfColor = (currentOption) => {
      if (isHalfColor) {
        _.each(currentOption.series, (item, index) => {
          _.each(item.data, (currentData) => {
            const finishNum = data[index][itemFieldName.finishedFieldName]
            const totalNumb = data[index][itemFieldName.totalFieldName]

            const percentage = !totalNumb
              ? 0
              : Big(finishNum || 0)
                  .div(totalNumb)
                  .toFixed(2)

            if (percentage < 0.5) {
              item.data[0].itemStyle.normal.color =
                BaseECharts.defaultSchedulePieColor[2]
              item.data[1].itemStyle.normal.color =
                BaseECharts.defaultSchedulePieColor[1]
            }
          })
        })
      }
    }

    const setOption = () => {
      let currentOption = _.cloneDeep(BaseECharts.defaultSchedulePieOption)

      if (option) {
        currentOption = option
      } else {
        setBaseOption(currentOption)

        setFormatToolTip(currentOption)

        setEmphasisColor(currentOption)

        setCenterPosition(currentOption)
        // title 跟着center走，因此要在center后面
        setTitle(currentOption)
        if (customOption && customOption.mainColor) {
          setColor(currentOption)
        }

        if (showLegend) {
          setShowLegend(currentOption)
        }
        setHalfColor(currentOption)
      }

      if (onSetCustomOption) {
        currentOption = _.cloneDeep(onSetCustomOption(currentOption))
      }

      return currentOption
    }

    const setLinearGradientColor = (currentOption) => {
      const linearGradientColor = customOption
        ? customOption.linearGradientColor
        : null

      _.each(currentOption.series, (item, index) => {
        _.each(item.data, (currentData, dataIndex) => {
          let colorIndex = 0
          // 对已完成的区域颜色做对半处理，一半以上取[ 0 ]下标，一半一下取[ 2 ] 下标
          if (dataIndex === 0 && isHalfColor) {
            const finishNum = data[index][itemFieldName.finishedFieldName]
            const totalNumb = data[index][itemFieldName.totalFieldName]

            const percentage = !totalNumb
              ? 0
              : Big(finishNum || 0)
                  .div(totalNumb)
                  .toFixed(2)

            if (percentage < 0.5) {
              colorIndex = 2
            }
          } else {
            colorIndex = dataIndex
          }

          const currentLinearGradientColor =
            linearGradientColor && linearGradientColor[colorIndex]
              ? linearGradientColor[colorIndex]
              : BaseECharts.defaultSchedulePieLinearGradientColor[colorIndex]

          // 设置渐变方向
          const direction = (customOption &&
            customOption.linearGradientDirection) || [0, 0, 0, 1]

          currentData.itemStyle.normal.color = new eCharts.graphic.LinearGradient(
            ...direction,
            currentLinearGradientColor
          )
        })
      })
    }

    const setGradientOption = () => {
      const gradientOption = _.cloneDeep(setOption())
      setLinearGradientColor(gradientOption)

      gradientOption.tooltip.backgroundColor = 'rgba(36, 51, 81, 0.7)'
      gradientOption.tooltip.borderColor = '#32c5ff'
      gradientOption.tooltip.axisPointer.shadowStyle.color =
        'rgba(16, 187, 255, 0.5)'

      gradientOption.legend.textStyle.color = '#64a5ea'
      _.each(gradientOption.title, (item) => {
        item.textStyle.color = '#64a5ea'
      })

      // gradientOption.xAxis.splitLine.lineStyle.color = 'rgba(44, 106, 178, 0.5)'
      // gradientOption.yAxis.splitLine.lineStyle.color = 'rgba(44, 106, 178, 0.5)'

      return gradientOption
    }

    return <Component {...rest} option={pieOption} />
  }

  PieECharts.propTypes = {
    // eCharts option
    option: PropTypes.object,
    // 渲染数据， 格式：[{name: '整体进度', finished: 3, total: 5}, {name: '整体进度1', finished: 2, total: 5}]
    data: PropTypes.array,
    // 对应渲染数据中需要显示的字段名，格式如下：{ finishedFieldName: 'finished', totalFieldName: 'total', titleFieldName: 'name'}
    // 其中finishedFieldName为已完成的字段名，totalFieldName为总数字段名，titleFieldName为title名
    itemFieldName: PropTypes.object,
    // 圆心位置 [ [ leftValue, topValue], [...], ... ]
    centerPosition: PropTypes.array,
    // 标题位置，格式： { bottom: '30', left: '30' }
    titlePosition: PropTypes.object,
    // 可看作legend显示的名称，格式：{ finishedText: '已完成订单数', unFinishedText: '未完成订单数'}
    showText: PropTypes.object,
    // 是否显示legend，即系列小标题
    showLegend: PropTypes.bool,
    // 半径，两个半径可呈现圆环
    radiusList: PropTypes.array,
    // 数据是否为空，可显示空数据状态样式
    hasNoData: PropTypes.bool,
    // 是否渐变主题
    isGradualChange: PropTypes.bool,
    // 自定义的option配置，含：mainColor, linearGradientColor, linearGradientDirection。.
    // 格式： mainColor: ['#234233','#454354',...], linearGradientColor: [ [{ offset: 0, color: '#345344' }, { offset: 1, color: '#345344' }] , [{},{}], [{},{}], ... ]
    // mainColor、linearGradientColor格式可参考defaultBarColor和defaultBarLinearGradientColor
    // offset 为该颜色起始位置，一个数组为一个渐变色，offset区间为0～1，可多个不止两个
    // linearGradientDirection(渐变方向：右/下/左/上): 默认为[0, 0, 0, 1]，从正上方开始渐变
    customOption: PropTypes.object,
    // 显示hover的信息格式的方法
    toolTipFormatFunc: PropTypes.func,
    // 可对最终option添加自定义属性，依据eCharts option格式, 接受option，return 自定义option
    onSetCustomOption: PropTypes.func,
    // 显示label的信息格式的方法，返回index,和eCharts相关信息
    onFormatLabel: PropTypes.func,
    labelFormatStyle: PropTypes.array,
    // 是否一半以上和一半一下显示不同颜色（含渐变）
    isHalfColor: PropTypes.bool,
  }

  return PieECharts
}

export default pieEChartsHoc
