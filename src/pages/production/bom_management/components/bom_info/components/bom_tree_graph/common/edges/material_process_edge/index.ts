import { Group } from '@antv/g-canvas'
import G6 from '@antv/g6'
import { GraphElement } from '../../graph_element'

/**
 * 流程图中原料和工序连接线的类
 * @implements {GraphElement}
 */
export class MaterialProcessEdge implements GraphElement {
  /**
   * 注册边
   * @override
   */
  register() {
    G6.registerEdge('material-process-edge', {
      // 绘制边
      draw(config, group) {
        if (!group) {
          return new Group(config).addShape()
        }

        const { startPoint, endPoint } = config || {}
        // 线
        const shape = group.addShape('path', {
          attrs: {
            stroke: '#2FC0D8',
            lineWidth: 2,
            style: {
              endArrow: true,
            },

            endArrow: {
              path: 'M 0,0 L 8,8 M 0,0 L 8,-8 Z',
              stroke: '#2FC0D8',
              lineWidth: 2,
            },

            path: [
              ['M', (startPoint?.x || 0) + 10, startPoint?.y],
              ['L', (startPoint?.x || 0) + 40, startPoint?.y],
              ['L', (startPoint?.x || 0) + 40, endPoint?.y],
              ['L', (endPoint?.x || 0) - 10, endPoint?.y],
            ],
          },

          name: 'material-process-edge', // 必须赋值且可以为任意值
        })

        return shape
      },
    })
  }
}
