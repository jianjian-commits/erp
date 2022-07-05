import { DualAxes } from '@ant-design/charts'
import { t } from 'gm-i18n'
import {
  DeviceAlarmRule_StrategyData,
  DeviceData,
  DeviceData_DataType,
  GetDeviceResponse,
  list_DeviceData_DataType,
  NumberData,
} from 'gm_api/src/device'
import moment from 'moment'
import React, { FC, useEffect, useState } from 'react'

/**
 * 投屏页面图表的属性
 */
interface ProjectionChartProps {
  /** 获取设备数据的响应 */
  getDeviceResponse: GetDeviceResponse
}

/**
 * 温度数据点的属性，用于图表展示
 */
interface TempData {
  /** 数据类型，用于图例的名称 */
  type: string | null
  /** 采集时间，用于横坐标 */
  time: string | null
  /** 温度数值，用于纵坐标 */
  temperature: number | null
}

/**
 * 湿度数据点的属性，用于图表展示
 */
interface HumData {
  /** 数据类型，用于图例的名称 */
  type: string | null
  /** 采集时间，用于横坐标 */
  time: string | null
  /** 湿度数值，用于纵坐标 */
  humidity: number | null
}

/**
 * 图表各类数据值的范围，用于规划纵坐标的范围
 */
interface ValueRange {
  /** 温度最小值 */
  minTemp: number | null
  /** 温度最大值 */
  maxTemp: number | null
  /** 湿度最小值 */
  minHum: number | null
  /** 湿度最大值 */
  maxHum: number | null
}

/**
 * 投屏页面图表的组件函数
 */
const ProjectionChart: FC<ProjectionChartProps> = ({ getDeviceResponse }) => {
  const [deviceData, setDeviceData] = useState<DeviceData[]>([])
  const [
    temperatureRule,
    setTemperatureRule,
  ] = useState<DeviceAlarmRule_StrategyData>()
  const [
    humidityRule,
    setHumidityRule,
  ] = useState<DeviceAlarmRule_StrategyData>()
  const [tempData, setTempData] = useState<TempData[]>([])
  const [humData, setHumData] = useState<HumData[]>([])
  const [valueRange, setValueRange] = useState<ValueRange>({
    minTemp: null,
    maxTemp: null,
    minHum: null,
    maxHum: null,
  })

  /**
   * 图表的设置
   */
  const config = {
    data: [tempData, humData],
    // 根据interface中的属性对应x和y轴
    xField: 'time',
    yField: ['temperature', 'humidity'],
    // y轴的设置
    yAxis: {
      temperature: {
        title: {
          text: t('温度(°C)'),
          position: 'end', // 标题在y轴的位置，注意是y轴平行的位置，并不是相对于y轴的位置，这里是在y轴的顶部
          autoRotate: false, // 标题旋转与否，默认是true，文字会竖过来，这里是不旋转，从左到右显示
          spacing: 24, // 标题与y轴的间隔
          style: {
            fill: 'white',
            fontSize: 14,
          },
        },
        // y轴最大值和最小值
        min: valueRange.minTemp,
        max: valueRange.maxTemp,
        // y轴坐标的设置
        label: {
          style: {
            fill: 'white',
            fontSize: 14,
          },
        },
      },
      humidity: {
        title: {
          text: t('湿度(%)'),
          position: 'end',
          autoRotate: false,
          spacing: 24,
          style: {
            fill: 'white',
            fontSize: 14,
          },
        },
        min: valueRange.minHum,
        max: valueRange.maxHum,
        label: {
          style: {
            fill: 'white',
            fontSize: 14,
          },
        },
      },
    },
    // 图像设置，为一个数组，每一个元素代表一类数据，顺序应与yField里的顺序一致
    geometryOptions: [
      {
        geometry: 'line', // 图像的种类，这里是折线图
        seriesField: 'type', // 对应interface中的type
        color: '#F7B500', // 图像的颜色，这里对应的是线条颜色
        // 数据点的设置
        point: {
          style: {
            r: 5, // 点的半径
            fill: '#F7B500', // 点的填充色
            stroke: '#F7B500', // 点的边框色
          },
        },
      },
      {
        geometry: 'line',
        seriesField: 'type',
        color: '#6DD400',
        point: {
          style: {
            r: 5,
            fill: '#6DD400',
            stroke: '#6DD400',
          },
        },
      },
    ],
    // 标注的设置，是一个对象，每个属性的名对应yField里的元素
    annotations: {
      // 每个属性对应一个数组，里面每个元素对应一个标注，无顺序要求
      temperature: [
        {
          type: 'line', // 标注的种类，这里是线
          top: true, // 是否位于图表最上方
          /**
           * 设置标注的位置，start和end代表开始和结束点，分别是一个数组
           * 数组第一个元素代表x轴的位置，min代表最左，max代表最右；第二个元素代表y轴的位置
           * 这里表示标注线是一条从左到右值为下限值的线(函数式: y = lower_limit_value)
           */
          start: ['min', temperatureRule?.lower_limit_value || null],
          end: ['max', temperatureRule?.lower_limit_value || null],
          // 标注的样式
          style: {
            stroke: '#F7B500', // 线条的颜色
            lineWidth: 2, // 线条的宽度
            lineDash: [8, 8], // 虚线的样式，第一个元素代表实线的长度，第二个代表空白的长度
          },
          text: {
            content: t('下限'),
            position: 'start',
            autoRotate: false,
            style: {
              textAlign: 'end',
              fill: 'white',
            },
          },
        },
        {
          type: 'line',
          top: true,
          start: ['min', temperatureRule?.upper_limit_value || null],
          end: ['max', temperatureRule?.upper_limit_value || null],
          style: {
            stroke: '#F7B500',
            lineWidth: 2,
            lineDash: [8, 8],
          },
          text: {
            content: t('上限'),
            position: 'start',
            autoRotate: false,
            style: {
              textAlign: 'end',
              fill: 'white',
            },
          },
        },
      ],
      humidity: [
        {
          type: 'line',
          top: true,
          start: ['min', humidityRule?.lower_limit_value || null],
          end: ['max', humidityRule?.lower_limit_value || null],
          style: {
            stroke: '#6DD400',
            lineWidth: 2,
            lineDash: [8, 8],
          },
          text: {
            content: t('下限'),
            position: 'end',
            autoRotate: false,
            style: {
              textAlign: 'start',
              fill: 'white',
            },
          },
        },
        {
          type: 'line',
          top: true,
          start: ['min', humidityRule?.upper_limit_value || null],
          end: ['max', humidityRule?.upper_limit_value || null],
          style: {
            stroke: '#6DD400',
            lineWidth: 2,
            lineDash: [8, 8],
          },
          text: {
            content: t('上限'),
            position: 'end',
            autoRotate: false,
            style: {
              textAlign: 'start',
              fill: 'white',
            },
          },
        },
      ],
    },
    // 图例的设置
    legend: {
      position: 'bottom',
    },
  }

  /**
   * 根据数据类型获取数据
   * @param  {DeviceData}          deviceData 未经处理的设备数据
   * @param  {DeviceData_DataType} type       数据类型
   * @return {NumberData}                     指定类型的数据
   */
  const getDataByType = (
    deviceData: DeviceData,
    type: DeviceData_DataType,
  ): NumberData => {
    if (!deviceData || !deviceData.data || !deviceData.data.datas) {
      return {}
    }

    return deviceData.data.datas[type]
  }

  /**
   * 获取温湿度数据
   * @param  {DeviceData}               deviceData 未经数理的设备数据
   * @return {[NumberData, NumberData]}            温湿度数据，第一个元素为温度，第二个为湿度
   */
  const getTempHumData = (deviceData: DeviceData): [NumberData, NumberData] => {
    const temperatureData = getDataByType(
      deviceData,
      DeviceData_DataType.DATATYPE_TEMPERATURE,
    )
    const humidityData = getDataByType(
      deviceData,
      DeviceData_DataType.DATATYPE_HUMIDITY,
    )

    return [temperatureData, humidityData]
  }

  /**
   * 根据数据获取温度的值
   * @param  {NumberData}    temperatureData 温度数据
   * @return {number | null}                 温度的值，精确到1位小数，没有则为null
   */
  const getTemperatureByData = (temperatureData: NumberData): number | null => {
    return temperatureData && temperatureData.val
      ? Math.round(temperatureData.val * 10) / 10
      : null
  }

  /**
   * 根据数据获取温度的值
   * @param  {NumberData}    humidityData 湿度数据
   * @return {number | null}              湿度的值，精确到2位小数，没有则为null
   */
  const getHumidityByData = (humidityData: NumberData): number | null => {
    return humidityData && humidityData.val
      ? Math.round(humidityData.val * 100) / 100
      : null
  }

  /**
   * 更新图表各类数据值的范围
   * @param {ValueRange}    valueRange  当前的数据值的范围
   * @param {number | null} temperature 最新的温度值
   * @param {number | null} humidity    最新的湿度值
   */
  const updateValueRange = (
    valueRange: ValueRange,
    temperature: number | null,
    humidity: number | null,
  ) => {
    /**
     * 如果数值为null则不更新范围
     * 否则如果当前范围的值是null，则直接使用数字作为范围
     * 否则判断数值与当前的范围并更新
     */
    if (temperature !== null) {
      valueRange.minTemp =
        valueRange.minTemp === null
          ? temperature
          : Math.min(valueRange.minTemp, temperature)
      valueRange.maxTemp =
        valueRange.maxTemp === null
          ? temperature
          : Math.max(valueRange.maxTemp, temperature)
    }
    if (humidity !== null) {
      valueRange.minHum =
        valueRange.minHum === null
          ? humidity
          : Math.min(valueRange.minHum, humidity)
      valueRange.maxHum =
        valueRange.maxHum === null
          ? humidity
          : Math.max(valueRange.maxHum, humidity)
    }
  }

  /**
   * getDeviceResponse更改时触发，说明此时需要切换设备卡片
   */
  useEffect(() => {
    const { device_datas, device_alarm_rule } = getDeviceResponse
    const strategyData = device_alarm_rule?.strategy_datas?.strategy_datas
    const temperatureRule = strategyData?.find(
      (strategy) =>
        strategy.data_type === DeviceData_DataType.DATATYPE_TEMPERATURE,
    )
    const humidityRule = strategyData?.find(
      (strategy) =>
        strategy.data_type === DeviceData_DataType.DATATYPE_HUMIDITY,
    )
    setTemperatureRule(temperatureRule)
    setHumidityRule(humidityRule)
    setDeviceData(device_datas || [])
  }, [getDeviceResponse])

  /**
   * 设备数据变化时触发，说明此时需要切换设备卡片
   */
  useEffect(() => {
    const temp_data: TempData[] = []
    const hum_data: HumData[] = []
    const value_range: ValueRange = {
      minTemp: null,
      maxTemp: null,
      minHum: null,
      maxHum: null,
    }

    // 处理数据并获取最新的温度和湿度的数据点
    deviceData.map((data, index) => {
      const [temperatureData, humidityData] = getTempHumData(data)
      const temperature = getTemperatureByData(temperatureData)
      const humidity = getHumidityByData(humidityData)
      temp_data.push({
        type:
          temperatureData && temperatureData.unit_name
            ? `${list_DeviceData_DataType[0].text}(${temperatureData.unit_name})`
            : t('温度(°C)'),
        // 目前只查询8小时的数据，而且都是整点时的数据，下同
        time:
          temperatureData && temperatureData.val
            ? moment(temperatureData.time, 'x').format('HH:mm')
            : moment()
                .subtract(7 - index, 'h')
                .minute(0)
                .format('HH:mm'),
        temperature,
      })
      hum_data.push({
        type:
          humidityData && humidityData.unit_name
            ? `${list_DeviceData_DataType[1].text}(${humidityData.unit_name})`
            : t('湿度(%)'),
        time:
          humidityData && humidityData.val
            ? moment(humidityData.time, 'x').format('HH:mm')
            : moment()
                .subtract(7 - index, 'h')
                .minute(0)
                .format('HH:mm'),
        humidity,
      })
      // 每次处理完一条数据后都更新数据范围，确保当前的是最新的
      updateValueRange(value_range, temperature, humidity)
    })
    setTempData(temp_data)
    setHumData(hum_data)

    /**
     * 当前数据范围和报警规则同步确定最终的数据范围
     * 不与报警规则同步的话可能无法展示标注的线
     * 温度默认是0-50，湿度默认是0-100，温度可以为负数
     * 最终范围会在同步后的范围基础上上下各扩充10%，使图表好看一点
     */
    value_range.minTemp = Math.min(
      value_range.minTemp ?? 0,
      temperatureRule?.lower_limit_value ?? 100,
    )
    value_range.maxTemp = Math.max(
      value_range.maxTemp ?? 50,
      temperatureRule?.upper_limit_value ?? 0,
    )
    value_range.minHum = Math.min(
      value_range.minHum ?? 0,
      humidityRule?.lower_limit_value ?? 100,
    )
    value_range.maxHum = Math.max(
      value_range.maxHum ?? 100,
      humidityRule?.upper_limit_value ?? 0,
    )
    const tempDiff = value_range.maxTemp - value_range.minTemp
    const humDiff = value_range.maxHum - value_range.minHum
    setValueRange({
      minTemp: Math.floor(value_range.minTemp - tempDiff * 0.1),
      maxTemp: Math.ceil(value_range.maxTemp + tempDiff * 0.1),
      minHum: Math.max(Math.floor(value_range.minHum - humDiff * 0.1), 0),
      maxHum: Math.ceil(value_range.maxHum + humDiff * 0.1),
    })
  }, [deviceData])

  // 通过设置渲染图表
  return <DualAxes {...config} />
}

export default ProjectionChart
