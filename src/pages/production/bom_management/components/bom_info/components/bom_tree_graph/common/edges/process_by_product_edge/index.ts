import { Group } from '@antv/g-canvas'
import G6 from '@antv/g6'
import { GraphElement } from '../../graph_element'

/**
 * 流程图中工序和副产品连接线的类
 * @implements {GraphElement}
 */
export class ProcessByProductEdge implements GraphElement {
  /**
   * 注册边
   * @override
   */
  register() {
    G6.registerEdge('process-by-product-edge', {
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
            lineDash: [5],
            style: {
              endArrow: true,
            },

            endArrow: {
              path: 'M 0,0 L 8,8 M 0,0 L 8,-8 Z',
              stroke: '#89D82F',
              lineWidth: 2,
              lineDash: [12], // 因为上方设置了虚线，这里单纯设置为false是不行的，必须设置一个大于单边长度的数字
            },

            path: [
              ['M', startPoint?.x, startPoint?.y],
              ['L', startPoint?.x, endPoint?.y],
              ['L', (endPoint?.x || 0) - 10, endPoint?.y],
            ],
          },

          name: 'process-by-product-edge', // 必须赋值且可以为任意值
        })

        return shape
      },
    })
  }
}
