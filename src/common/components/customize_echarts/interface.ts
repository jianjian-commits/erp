import { CSSProperties } from 'react'

export interface baseEChartsOptions {
  option: any
  onLegendSelectChanged?(value: any): void
  style: CSSProperties
  className: string
}

export interface lineEChartsOptions {
  // eCharts option
  option?: any
  style?: CSSProperties
  // 渲染数据，格式： [{name0, value0, name1, value1,...},{name0, value0, name1, value1,...},...]
  data: any[]
  // 渲染的x,y轴数据的字段名，对应data中字段，格式： [{x:'name0', y: 'value0', stack: 10}, { x: 'name0', y: 'value1', stack: 10},...]
  // x,y的关系对应：同样的「x/y」下对应的「y/x」数据是那个字段的数据，一对多意味着同样的坐标也是一对多，一对多的情况下「stack」相同则堆叠在一起显示
  axisGroup: any[]
  // 线系列名，对应「axisGroup」中的一个「x/y」显示名称，若无默认取「x/y」字段名格式： [ 'myShowName1', 'myShowName2',....]
  axisGroupName: any[]
  // 坐标轴名字，格式： {x: 'myXAxisName', y: 'myYAxisName'}
  axisName?: any
  // 图表标题，格式：{ text: 'yourTitle' }
  title?: any
  // 显示无数据状态
  hasNoData: boolean
  // 自定义的option配置，含：mainColor.
  // 格式： mainColor: ['#234233','#454354',...]
  // mainColor格式可参考defaultLineColor
  customOption: any
  // 填充后台未返回的时间数据，用来适配data. 格式: { begin: 'begin_time', end: 'end_time', fillItemName: 'yFieldName', dateFormatType: 'YYYY-MM-DD' }
  // 其中begin为显示的初始时间，end为显示的结束时间，fillItemName为填充字段名，即显示为0的y轴字段名，dateFormatType为显示的时间格式
  fillAndFormatDate: any
  // 可对最终option添加自定义属性，依据eCharts option格式, 接受option，return 自定义option
  onSetCustomOption?(value: any): void
}

export interface pieEChartsOptions {
  // eCharts option
  option?: any
  style?: CSSProperties
  // 渲染数据，格式： [{name0, value0, name1, value1,...},{name0, value0, name1, value1,...},...]
  data: any[]
  // 渲染的item, value数据的字段名，对应data中字段，格式： [{itemName:'name0', value: 'value0', stack: 10}, { itemName: 'name0', y: 'value1', stack: 10},...]
  // itemName,value的关系对应：同样的「itemName」下对应的「value」数据是哪个字段的数据，一对多意味着同样的坐标也是一对多，一对多的情况下「stack」相同则堆叠在一起显示
  axisGroup: any[]
  // 对应item字段的显示名，格式： [ 'yourItemName',....]
  axisGroupName: any[]
  // 圆心位置 [ [ leftValue, topValue], [...], ... ]
  centerPosition?: any[]
  // 半径，两个半径可呈现圆环
  radiusList: any[]
  // 图表标题，格式：{ text: 'yourTitle' }
  title?: any
  // 自定义的option配置，含：mainColor.
  // 格式： mainColor: ['#234233','#454354',...]
  // mainColor格式可参考defaultPieColor
  customOption?: any
  // 显示hover的信息格式的方法
  toolTipFormatFunc?(value: any): void
  // 是否无数据，无数据时可开启无数据图表
  hasNoData: boolean
  // 可对最终option添加自定义属性，依据eCharts option格式, 接受option，return 自定义option
  onSetCustomOption?(value: any): void
}
