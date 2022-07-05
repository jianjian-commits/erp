import { Group } from '@antv/g-canvas'
import G6 from '@antv/g6'
import { GraphElement } from '../../graph_element'

/**
 * 流程图中工序和BOM连接线的类
 * @implements {GraphElement}
 */
export class ProcessBomEdge implements GraphElement {
  /**
   * 注册边
   * @override
   */
  register() {
    G6.registerEdge('process-bom-edge', {
      // 绘制边
      draw(config, group) {
        if (!group) {
          return new Group(config).addShape()
        }

        const { startPoint, endPoint } = config || {}
        // 线
        const shape = group.addShape('path', {
          attrs: {
            stroke: '#89D82F',
            lineWidth: 2,
            style: {
              endArrow: true,
            },

            endArrow: {
              path: 'M 0,0 L 8,8 M 0,0 L 8,-8 Z',
              stroke: '#89D82F',
              lineWidth: 2,
            },

            path: [
              ['M', startPoint?.x, startPoint?.y],
              ['L', startPoint?.x, endPoint?.y],
              ['L', (endPoint?.x || 0) - 10, endPoint?.y],
            ],
          },

          name: 'process-bom-edge', // 必须赋值且可以为任意值
        })

        return shape
      },
    })
  }
}
