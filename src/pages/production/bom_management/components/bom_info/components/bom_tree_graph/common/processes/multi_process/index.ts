import { Group, IGroup } from '@antv/g-canvas'
import G6 from '@antv/g6'
import { isArray } from 'lodash'
import { fitText } from '../../../util'
import { GraphElement } from '../../graph_element'
import { ProcessConfig } from '../../interfaces'

/**
 * 流程图中多工序的类
 * @implements {GraphElement}
 */
export class MultiProcess implements GraphElement {
  /**
   * 注册工序
   * @override
   */
  register() {
    G6.registerNode('multi-process', {
      // 绘制边
      draw(config?: ProcessConfig, group?: IGroup) {
        if (!group) {
          return new Group(config).addShape()
        }

        const { diamondSize, diamondMargin, processes, showYieldRate } =
          config || {}
        const margin = diamondMargin || 10
        const processCount = processes?.length || 0

        // 每道工序的总半长宽，最大分别为55和34
        let dWidth = 55
        let dHeight = 34
        if (typeof diamondSize === 'number' && isFinite(diamondSize)) {
          dWidth = 2 * diamondSize + margin
          dHeight = 2 * diamondSize
        } else if (isArray(diamondSize)) {
          dWidth = 2 * diamondSize[0] + margin
          dHeight = 2 * diamondSize[1]
        }

        dWidth = Math.min(dWidth, 55)
        dHeight = Math.min(dHeight, 34)

        // 垂直方向的偏移量，因为整个结点高度固定为92，但是菱形的高度可以变化，所以需要这个使菱形垂直居中
        const dy = (showYieldRate ? 34 : 46) - dHeight
        // 所有工序的总长宽
        const width = (2 * dWidth + margin) * processCount
        const height = 2 * dHeight + 24
        // 外框
        const shape = group.addShape('rect', {
          attrs: {
            x: 0,
            y: 0,
            width,
            height,
          },

          name: 'multi-process', // must be assigned and can be any value
        })

        let totalYieldRate = 100
        // 添加每道工序
        processes &&
          processes.map((process, index) => {
            const centerX = (2 * index + 1) * (dWidth + margin * 0.5)
            const centerY = dHeight
            // 工序菱形边框
            group.addShape('path', {
              attrs: {
                stroke: '#89D82F',
                lineWidth: 2,
                path: [
                  ['M', centerX, dy],
                  ['L', centerX - dWidth, centerY + dy],
                  ['L', centerX, 2 * centerY + dy],
                  ['L', centerX + dWidth, centerY + dy],
                  ['Z'],
                ],
              },

              name: 'single-process', // must be assigned and can be any value
            })

            const { name, yieldRate } = process
            // 工序名和出成率
            group.addShape('text', {
              attrs: {
                x: centerX,
                y: centerY + dy,
                text: fitText(name, (dWidth - margin - 8) * 2, 14),
                fill: '#89D82F',
                textAlign: 'center',
                textBaseline: 'middle',
                fontSize: 14,
              },
              name: 'process-name-text',
            })
            if (showYieldRate) {
              const yieldRateInNum =
                yieldRate && yieldRate !== '-' ? +yieldRate : 0
              group.addShape('text', {
                attrs: {
                  x: centerX,
                  y: centerY + 14,
                  text: yieldRateInNum ? `${yieldRateInNum.toFixed(2)}%` : '',
                  fill: '#89D82F',
                  textAlign: 'center',
                  textBaseline: 'middle',
                  fontSize: 14,
                },
              })
              totalYieldRate *= +(yieldRateInNum || 100) / 100
            }
          })

        if (showYieldRate) {
          // 显示总出成率的框
          group.addShape('rect', {
            attrs: {
              x: 0,
              y: 68,
              width,
              height: 24,
              radius: 4,
              fill: '#89D82F',
            },
          })
          // 总出成率
          group.addShape('text', {
            attrs: {
              x: width / 2,
              y: 80,
              text: `总出成率：${totalYieldRate.toFixed(2)}%`,
              fill: '#FFFFFF',
              textAlign: 'center',
              textBaseline: 'middle',
              fontSize: 14,
            },
          })
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
