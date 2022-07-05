import { Group, IGroup } from '@antv/g-canvas'
import G6 from '@antv/g6'
import { GraphElement } from '../../graph_element'
import { CardConfig } from '../../interfaces'

/**
 * 流程图中副产品卡片的类
 * @implements {GraphElement}
 */
export class ByProductCard implements GraphElement {
  /**
   * 注册节点
   * @override
   */
  register() {
    G6.registerNode('by-product-card', {
      // 绘制节点
      draw(config?: CardConfig, group?: IGroup) {
        if (!group) {
          return new Group(config).addShape()
        }

        const { name } = config || {}
        // 外框
        const shape = group.addShape('rect', {
          attrs: {
            width: 150,
            height: 92,
            radius: 4,
            stroke: '#56A3F2',
            fill: '#FFFFFF',
          },
          draggable: true,
        })
        // 副产品的商品名
        group.addShape('text', {
          attrs: {
            x: 75,
            y: 46,
            fill: '#56A3F2',
            text: name,
            textAlign: 'center',
            textBaseline: 'middle',
            fontSize: 14,
          },
          draggable: true,
        })

        return shape
      },
      // 获取可作为连线起止点的点的位置
      getAnchorPoints: () => {
        // 返回一个数组，每一个元素代表一个点，点中两个元素分别代表水平和垂直的坐标，范围是[0, 1]
        return [
          [0, 0.5], // 左侧中间
          [1, 0.5], // 右侧中间
        ]
      },
    })
  }
}
