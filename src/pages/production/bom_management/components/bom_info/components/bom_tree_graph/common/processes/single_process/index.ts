import { Group, IGroup } from '@antv/g-canvas'
import G6 from '@antv/g6'
import { isArray } from 'lodash'
import { fitText } from '../../../util'
import { GraphElement } from '../../graph_element'
import { ProcessConfig } from '../../interfaces'

/**
 * 流程图中单工序的类
 * @implements {GraphElement}
 */
export class SingleProcess implements GraphElement {
  /**
   * 注册工序
   * @override
   */
  register() {
    G6.registerNode('single-process', {
      // 绘制边
      draw(config?: ProcessConfig, group?: IGroup) {
        if (!group) {
          return new Group(config).addShape()
        }

        const { diamondSize, processes, showYieldRate } = config || {}
        // 所有的总长宽
        let width = 0
        let height = 0
        if (typeof diamondSize === 'number' && isFinite(diamondSize)) {
          width = 2 * diamondSize
          height = 2 * diamondSize
        } else if (isArray(diamondSize)) {
          width = 2 * diamondSize[0]
          height = 2 * diamondSize[1]
        } else {
          width = 150
          height = 92
        }
        // 外框
        const shape = group.addShape('rect', {
          attrs: {
            x: 0,
            y: 0,
            width,
            height,
          },

          name: 'single-process', // must be assigned and can be any value
        })

        const centerX = width / 2
        const centerY = height / 2
        // 工序菱形边框
        group.addShape('path', {
          attrs: {
            stroke: '#89D82F',
            lineWidth: 2,
            path: [
              ['M', centerX, 0],
              ['L', 0, centerY],
              ['L', centerX, height],
              ['L', width, centerY],
              ['Z'],
            ],
          },
        })
        // 工序名和出成率
        if (processes) {
          const { name, yieldRate } = processes[0]
          const yieldRateInNum = yieldRate && yieldRate !== '-' ? +yieldRate : 0
          group.addShape('text', {
            attrs: {
              x: centerX,
              y: centerY,
              text: fitText(name, width - 24, 14),
              fill: '#89D82F',
              textAlign: 'center',
              textBaseline: 'middle',
              fontSize: 14,
            },
          })
          if (showYieldRate) {
            group.addShape('text', {
              attrs: {
                x: centerX,
                y: centerY + 16,
                text: yieldRateInNum ? `${yieldRateInNum.toFixed(2)}%` : '',
                fill: '#89D82F',
                textAlign: 'center',
                textBaseline: 'middle',
                fontSize: 14,
              },
            })
          }
        }

        return shape
      },
      // 获取可作为连线起止点的点的位置
      getAnchorPoints() {
        // 返回一个数组，每一个元素代表一个点，点中两个元素分别代表水平和垂直的坐标，范围是[0, 1]
        return [
          [0, 0.5], // 左侧中间
          [1, 0.5], // 右侧中间
        ]
      },
    })
  }
}
