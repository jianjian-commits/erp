import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import requireECharts from 'gm-service/src/require_module/require_echarts'
import BaseECharts from '@/common/components/customize_echarts/base_echarts'
import _ from 'lodash'

const barEChartsHoc = (Component) => {
  const BarECharts = (props) => {
    const {
      option,
      data,
      customOption,
      isHorizontal,
      axisGroup,
      axisGroupName,
      axisName,
      onSetCustomOption,
      isGradualChange,
      hasNoData,
      title,
      ...rest
    } = props

    const [barOption, setBarOption] = useState(null)
    const [eCharts, setECharts] = useState(null)

    useEffect(() => {
      if (isGradualChange) {
        getECharts()
      }
    }, [isGradualChange])

    // 渐变主题
    useEffect(() => {
      if (isGradualChange && eCharts && !hasNoData) {
        setRealOption('gradient')
      }
    }, [eCharts, ...Object.values(props)])

    // 非渐变主题情况
    useEffect(() => {
      if (!isGradualChange && !hasNoData) {
        setRealOption('normal')
      }
    }, [...Object.values(props)])

    // 无数据情况
    useEffect(() => {
      if (hasNoData) {
        setRealOption('noData')
      }
    }, [eCharts, ...Object.values(props)])

    // 渐变需要获取echarts实例
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

    const setRealOption = (type) => {
      let currentOption = {}

      if (type === 'normal') {
        currentOption = _.cloneDeep(setOption())
      }
      if (type === 'gradient') {
        currentOption = _.cloneDeep(setGradientOption())
      }

      if (type === 'noData') {
        currentOption = _.cloneDeep(setNoDataOption())
      }

      if (onSetCustomOption) {
        currentOption = _.cloneDeep(onSetCustomOption(currentOption))
      }

      setBarOption(_.cloneDeep(currentOption))
    }

    // 设置渐变主题
    const setGradientOption = () => {
      const gradientOption = _.cloneDeep(setOption())
      const linearGradientColor = customOption
        ? customOption.linearGradientColor
        : null

      _.map(axisGroup, (item, index) => {
        const currentLinearGradientColor =
          linearGradientColor && linearGradientColor[index]
            ? linearGradientColor[index]
            : BaseECharts.defaultBarLinearGradientColor[index]

        // 设置渐变方向
        const direction = (customOption &&
          customOption.linearGradientDirection) || [0, 0, 0, 1]

        gradientOption.series[
          index
        ].itemStyle.normal.color = new eCharts.graphic.LinearGradient(
          ...direction,
          currentLinearGradientColor,
        )
      })

      gradientOption.tooltip.backgroundColor = 'rgba(36, 51, 81, 0.7)'
      gradientOption.tooltip.borderColor = '#32c5ff'
      gradientOption.tooltip.axisPointer.shadowStyle.color =
        'rgba(16, 187, 255, 0.5)'

      gradientOption.xAxis.splitLine.lineStyle.color = 'rgba(44, 106, 178, 0.5)'
      gradientOption.yAxis.splitLine.lineStyle.color = 'rgba(44, 106, 178, 0.5)'

      gradientOption.xAxis.axisLine.lineStyle.color = 'rgba(44, 106, 178, 0.5)'
      gradientOption.yAxis.axisLine.lineStyle.color = 'rgba(44, 106, 178, 0.5)'

      gradientOption.yAxis.axisLabel.color = '#64a5ea'
      gradientOption.xAxis.axisLabel.color = '#64a5ea'

      gradientOption.xAxis.nameTextStyle.color = '#64a5ea'
      gradientOption.yAxis.nameTextStyle.color = '#64a5ea'

      gradientOption.legend.textStyle.color = '#64a5ea'

      return gradientOption
    }

    const setTitle = (currentOption) => {
      if (title && title.text) {
        currentOption.title.text = title.text
      }
    }

    // 设置dataset series
    const setBaseBarOption = (currentOption) => {
      Object.assign(currentOption, {
        dataset: {
          source: data,
          dimensions: data.length > 0 ? [...Object.keys(data[0])] : [], // 与encode中的配置关联，取值从这取
        },
        series: _.map(axisGroup, (item, index) => {
          return {
            type: 'bar',
            stack: item.stack,
            // barWidth: '25px',
            // barGap: '5px',
            // barCategoryGap: '5px',
            name: isHorizontal ? item.x : item.y,
            encode: {
              x: [item.x],
              y: [item.y],
              seriesName: [isHorizontal ? item.x : item.y],
            },
            itemStyle: {
              normal: {},
            },
          }
        }),
      })
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

      currentOption.xAxis.type = isHorizontal ? 'value' : 'category'
      currentOption.yAxis.type = isHorizontal ? 'category' : 'value'
    }

    const setMainColor = (currentOption) => {
      currentOption.color = customOption.mainColor
    }

    const setBarWidth = (currentOption) => {
      _.each(currentOption.series, (item) => {
        item.barWidth = customOption.barWidth
      })
    }

    const setOption = () => {
      let currentOption = _.cloneDeepWith(BaseECharts.defaultBarOption)

      if (option) {
        currentOption = option
      } else {
        setBaseBarOption(currentOption)
        // 设置seriesName
        if (axisGroupName) {
          _.each(currentOption.series, (item, index) => {
            item.name = axisGroupName[index]
          })
        }
        setAxis(currentOption)
        setTitle(currentOption)

        if (customOption) {
          if (customOption.mainColor) {
            setMainColor(currentOption)
          }
          if (customOption.barWidth) {
            setBarWidth(currentOption)
          }
        }
      }

      return currentOption
    }

    const setNoDataGradient = (currentOption) => {
      currentOption.xAxis.axisLine.lineStyle.color = 'rgba(44, 106, 178, 0.5)'
      currentOption.yAxis.axisLine.lineStyle.color = 'rgba(44, 106, 178, 0.5)'

      currentOption.title.textStyle.color = '#64a5ea'
      currentOption.title.textStyle.fontSize = '12'
    }

    const setNoDataOption = () => {
      const noDataOption = _.cloneDeep(BaseECharts.barNoDataOption)

      if (isGradualChange) {
        setNoDataGradient(noDataOption)
      }

      setAxis(noDataOption)

      return noDataOption
    }

    return <Component option={barOption} {...rest} />
  }

  BarECharts.defaultProps = {
    isHorizontal: true,
  }

  BarECharts.propTypes = {
    // eCharts option
    option: PropTypes.object,
    // 渲染数据，格式： [{name0, value0, name1, value1,...},{name0, value0, name1, value1,...},...]
    data: PropTypes.array,
    // 渲染的x,y轴数据的字段名，对应data中字段，格式： [{x:'name0', y: 'value0', stack: 10}, { x: 'name0', y: 'value1', stack: 10},...]
    // x,y的关系对应：同样的「x/y」下对应的「y/x」数据是那个字段的数据，一对多意味着同样的坐标也是一对多，一对多的情况下「stack」相同则堆叠在一起显示
    axisGroup: PropTypes.array,
    // 柱形系列名，对应「axisGroup」中的一个「x/y」显示名称，若无默认取「x/y」字段名格式： [ 'myShowName1', 'myShowName2',....]
    axisGroupName: PropTypes.array,
    // 坐标轴名字，格式： {x: 'myXAxisName', y: 'myYAxisName'}
    axisName: PropTypes.object,
    // 是否渐变主题
    isGradualChange: PropTypes.bool,
    // 图表标题，格式：{ text: 'yourTitle' }
    title: PropTypes.object,
    // 柱形是否横放
    isHorizontal: PropTypes.bool,
    // 数据是否为空，可显示空数据状态样式
    hasNoData: PropTypes.bool,
    // 自定义的option配置，含：mainColor，linearGradientColor, barWidth(string), linearGradientDirection。
    // 格式： mainColor: ['#234233','#454354',...], linearGradientColor: [ [{ offset: 0, color: '#345344' }, { offset: 1, color: '#345344' }] , [{},{}], [{},{}], ... ]
    // mainColor、linearGradientColor格式可参考defaultBarColor和defaultBarLinearGradientColor
    // offset 为该颜色起始位置，一个数组为一个渐变色，offset区间为0～1，可多个不止两个
    // linearGradientDirection(渐变方向：右/下/左/上): 默认为[0, 0, 0, 1]，从正上方开始渐变
    customOption: PropTypes.object,
    // 可对最终option添加自定义属性，依据eCharts option格式, 接受option，return 自定义option
    onSetCustomOption: PropTypes.func,
  }

  return BarECharts
}

export default barEChartsHoc
