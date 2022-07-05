import React, { useRef, useEffect, useState, FC } from 'react'

import classNames from 'classnames'

import requireECharts from 'gm-service/src/require_module/require_echarts'
import { valueLabelFormatter } from './util'
import { baseEChartsOptions } from './interface'

const BaseECharts: FC<baseEChartsOptions> = (props) => {
  const [eCharts, setECharts] = useState(null)
  const [ready, setReady] = useState(false)
  const [myECharts, setMyECharts] = useState(null)
  const eChartsRef = useRef(null)
  const { option, onLegendSelectChanged, style, className, ...rest } = props

  useEffect(() => {
    if (!ready) {
      getECharts()
    }
  }, [])

  useEffect(() => {
    if (myECharts) {
      // 绑定事件
      myECharts.on('legendSelectChanged', (params) => {
        if (onLegendSelectChanged) {
          onLegendSelectChanged(params)
        }
      })
    }

    const resizeFunc = () => {
      if (myECharts) {
        myECharts.resize()
      }
    }
    // 当实例好之后设置监听resize事件
    window.addEventListener('resize', resizeFunc)

    return () => {
      window.removeEventListener('resize', resizeFunc)
    }
  }, [myECharts])

  useEffect(() => {
    if (eCharts && ready) {
      // 初始化eCharts
      initMyECharts()
    }
  }, [eCharts, ready, option])

  useEffect(() => {
    if (myECharts) {
      setOption()
    }
    // 暂时用来处理滚动条出现时错位的问题，后期考虑去掉
    if (myECharts) {
      myECharts.resize()
    }
  })

  useEffect(() => {
    return () => {
      // 清除eCharts实例
      if (eCharts && ready && !myECharts.isDisposed) {
        myECharts.dispose()
      }
    }
  }, [])

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
    }).then(() => {
      setReady(true)
    })
  }

  const initMyECharts = () => {
    setMyECharts(eCharts.init(eChartsRef.current))
  }

  const setOption = () => {
    if (option) {
      myECharts.setOption(option, true) // 第二个参数设置为true不合并option,直接替换option
    }
  }

  return (
    <>
      {ready ? (
        <div
          ref={eChartsRef}
          style={{ width: '100%', height: '100%', ...style }}
          className={classNames(className)}
          {...rest}
        />
      ) : null}
    </>
  )
}

BaseECharts.defaultLineColor = ['#007eff', '#44d786']

BaseECharts.defaultLineOption = {
  title: {
    text: '',
  },
  grid: {},
  color: BaseECharts.defaultLineColor,
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    right: '20',
    padding: [0, 20, 0, 0],
  },
  xAxis: {
    // 对齐坐标轴刻度
    alignWithLabel: 'true',
    boundaryGap: false,
    axisLabel: {
      color: '#333333',
    },
    axisLine: {
      lineStyle: {
        color: '#cccccc',
      },
    },
    splitLine: {
      lineStyle: {
        color: '#ebeff3', // 坐标抽颜色
      },
    },
    nameTextStyle: {
      color: '#798294',
    },
  },
  yAxis: {
    alignWithLabel: 'true',
    axisLabel: {
      padding: [0, 20, 0, 0],
      margin: 0,
      color: '#333333',
      formatter: valueLabelFormatter,
    },
    splitLine: {
      lineStyle: {
        color: '#ebeff3', // 坐标抽颜色
      },
    },

    axisLine: {
      lineStyle: {
        color: '#cccccc',
      },
    },
    nameTextStyle: {
      color: '#798294',
    },
  },
  series: [],
}

BaseECharts.defaultBarColor = [
  '#007eff',
  '#03a9f4',
  '#02bcd4',
  '#009688',
  '#4c804f',
  '#8bc34a',
  '#cdd83a',
  '#ffea38',
  '#ffc108',
  '#ff9700',
]

BaseECharts.defaultBarLinearGradientColor = [
  [
    {
      offset: 0,
      color: '#34f6ba',
    },
    {
      offset: 1,
      color: '#feda11',
    },
  ],
  [
    {
      offset: 0,
      color: '#fe0000',
    },
    {
      offset: 1,
      color: '#f0b3b3',
    },
  ],
  [
    {
      offset: 0,
      color: '#37fbff',
    },
    {
      offset: 1,
      color: '#015cff',
    },
  ],
]

// 默认值不含dataset， series等与数据相关等设置，只设样式，且在调用改变的时候用定位到最底层的值的方式来赋值，以免清掉默认值或者其他设置好的值
BaseECharts.defaultBarOption = {
  title: {
    text: '',
  },
  toolbox: {
    right: 10,
  },
  grid: {},
  color: BaseECharts.defaultBarColor,
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(36, 51, 81, 0.7)',
    borderColor: 'default',
    borderWidth: '1',
    axisPointer: {
      type: 'shadow',
      shadowStyle: {
        color: 'rgba(36, 51, 81, 0.2)',
      },
    },
  }, // hover axis显示
  legend: {
    right: '20',
    icon: 'circle',
    textStyle: {},
  },
  xAxis: {
    nameTextStyle: { color: '#798294' },
    splitLine: {
      lineStyle: {
        color: '#ebeff3', // 坐标抽颜色
      },
    },
    axisLabel: {
      color: '#000923',
    },
    axisTick: {
      show: false,
    },
    axisLine: {
      lineStyle: {
        color: '#ebeff3',
      },
    },
  },
  yAxis: {
    nameTextStyle: { color: '#798294' },
    splitLine: {
      lineStyle: {
        color: '#ebeff3',
      },
    },
    axisLabel: {
      padding: [0, 20, 0, 0],
      margin: 0,
      color: '#000923',
    },
    axisLine: {
      lineStyle: {
        color: '#ebeff3',
      },
    },
    axisTick: {
      show: false,
    },
  },
  series: [],
}

BaseECharts.defaultPieColor = [
  '#007eff',
  '#03a9f4',
  '#02bcd4',
  '#009688',
  '#4c804f',
  '#8bc34a',
  '#cdd83a',
  '#ffea38',
  '#ffc108',
  '#ff9700',
]
BaseECharts.defaultPieRadius = [110, 140] // 默认半径

BaseECharts.defaultPieOption = {
  title: {
    text: '',
  },
  color: BaseECharts.defaultPieColor,
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(36, 51, 81, 0.7)',
    axisPointer: {
      type: 'shadow',
      shadowStyle: {
        color: 'rgba(36, 51, 81, 0.2)',
      },
    },
  }, // hover axis显示
  legend: {
    right: '20',
    padding: [0, 20, 0, 0],
    orient: 'vertical',
    icon: 'circle',
  },
  series: [],
}

BaseECharts.defaultSchedulePieColor = ['#007eff', '#cdd7e5', '#f7b500']
BaseECharts.defaultSchedulePieLinearGradientColor = [
  [
    {
      offset: 0,
      color: '#37fbff',
    },
    {
      offset: 1,
      color: '#015cff',
    },
  ],
  [
    {
      offset: 0,
      color: '#363a57',
    },
    {
      offset: 1,
      color: '#10132d',
    },
  ],
  [
    {
      offset: 0,
      color: '#feda11',
    },
    {
      offset: 1,
      color: '#26f7c5',
    },
  ],
]

BaseECharts.defaultPiePadding = [10, 0, 0, 10] // top right bottom left

BaseECharts.defaultSchedulePieRadius = [27, 35] // 默认半径

BaseECharts.defaultSchedulePieOption = {
  title: {
    text: '',
    textStyle: {},
  },
  color: BaseECharts.defaultSchedulePieColor,
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(36, 51, 81, 0.7)',
    borderWidth: '1',
    axisPointer: {
      type: 'shadow',
      shadowStyle: {
        color: 'rgba(36, 51, 81, 0.2)',
      },
    },
  }, // hover axis显示
  legend: {
    icon: 'circle',
    textStyle: {},
    show: false,
  },
  series: [],
}

BaseECharts.defaultScheduleBarColor = ['#007eff']

BaseECharts.defaultScheduleBarLinearGradientColor = [
  [
    {
      offset: 1,
      color: '#37fbff',
    },
    {
      offset: 0,
      color: '#015cff',
    },
  ],
  [
    {
      offset: 0,
      color: '#363a57',
    },
    {
      offset: 1,
      color: '#10132d',
    },
  ],
]

BaseECharts.defaultScheduleBarOption = {
  title: {
    text: '',
  },
  grid: {},
  xAxis: {
    show: false,
  },
  yAxis: {
    show: true,
    splitLine: { show: false }, // 横向的线
    axisTick: { show: false }, // y轴的端点
    axisLine: { show: false },
    axisLabel: {
      padding: [0, 20, 0, 0],
      margin: 0,
    },
  },
  color: BaseECharts.defaultScheduleBarColor,
  tooltip: {
    backgroundColor: 'rgba(36, 51, 81, 0.7)',
    borderWidth: '1',
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
      shadowStyle: {
        color: 'rgba(36, 51, 81, 0.2)',
      },
    },
  },
  legend: {
    show: false,
  },
  series: [],
}

BaseECharts.pieNoDataOption = {
  color: ['#dddfe4'],
  series: [
    {
      type: 'pie',
      radius: [50, 70],
      label: { show: true, position: 'center' },
      data: [{ value: 1, name: '没有更多数据了' }],
    },
  ],
}

BaseECharts.barNoDataOption = {
  title: {
    text: '没有更多数据了',
    textAlign: 'center', // 水平居中
    textStyle: {
      color: '#dddfe4',
      fontSize: '12',
    },
    left: '50%',
    top: 'center',
  },
  xAxis: {
    type: 'category',
    axisLine: {
      lineStyle: {
        color: '#dddfe4',
      },
    },
  },
  yAxis: {
    type: 'value',
    axisLine: {
      lineStyle: {
        color: '#dddfe4',
      },
    },
  },
  grid: {},
}

BaseECharts.lineNoDataOption = {
  title: {
    text: '没有更多数据了',
    left: '50%',
    textAlign: 'center',
    top: 'center',
    textStyle: {
      color: '#dddfe4',
      fontSize: '12',
    },
  },
  xAxis: {
    type: 'category',
    axisLine: {
      lineStyle: {
        color: '#dddfe4',
      },
    },
  },
  yAxis: {
    type: 'value',
    axisLine: {
      lineStyle: {
        color: '#dddfe4',
      },
    },
  },
  grid: {},
}

export default BaseECharts
