import { Group } from '@antv/g-canvas'
import G6, { Arrow } from '@antv/g6'
import { GraphElement } from '../../graph_element'

/**
 * 流程图中BOM和工序连接线的类
 * @implements {GraphElement}
 */
export class BomProcessEdge implements GraphElement {
  /**
   * 注册边
   * @override
   */
  register() {
    G6.registerEdge('bom-process-edge', {
      // 绘制边
      draw(config, group) {
        if (!group) {
          return new Group(config).addShape()
        }

        const { startPoint, endPoint } = config || {}
        // 线
        const shape = group.addShape('path', {
          attrs: {
            stroke: '#FFA052',
            lineWidth: 2,
            style: {
              startArrow: true,
              endArrow: true,
            },

            startArrow: {
              path: Arrow.circle(6, -3),
              stroke: '#FFA052',
              fill: '#FFFFFF',
              lineWidth: 2,
            },

            endArrow: {
              path: 'M 0,0 L 8,8 M 0,0 L 8,-8 Z',
              stroke: '#FFA052',
              lineWidth: 2,
            },

            path: [
              ['M', (startPoint?.x || 0) + 20, startPoint?.y],
              ['L', (startPoint?.x || 0) + 20, endPoint?.y],
              ['L', (endPoint?.x || 0) - 10, endPoint?.y],
            ],
          },

          name: 'bom-process-edge', // 必须赋值且可以为任意值
        })

        return shape
      },
    })
  }
}
