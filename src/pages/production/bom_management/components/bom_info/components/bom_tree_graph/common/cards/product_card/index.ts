import { Group, IGroup } from '@antv/g-canvas'
import G6 from '@antv/g6'
import { GraphElement } from '../../graph_element'
import { CardConfig } from '../../interfaces'

/**
 * 流程图中成品卡片的类
 * @implements {GraphElement}
 */
export class ProductCard implements GraphElement {
  /**
   * 注册节点
   * @override
   */
  register() {
    G6.registerNode('product-card', {
      // 绘制节点
      draw(config?: CardConfig, group?: IGroup) {
        if (!group) {
          return new Group(config).addShape()
        }

        const { name, amount, unit, cost, cost_unit, showAmount, showCost } =
          config || {}
        // 外框
        const shape = group.addShape('rect', {
          attrs: {
            width: 150,
            height: 92,
            radius: 4,
            fill: '#56A3F2',
          },
          draggable: true,
        })
        // 显示成品商品名和数量的框
        group.addShape('rect', {
          attrs: {
            width: 150,
            height: 58,
            radius: [4, 4, 0, 0],
            fill: '#56A3F2',
          },
          draggable: true,
        })
        // 成品的商品名和数量
        group.addShape('text', {
          attrs: {
            x: 75,
            y: 35,
            fill: '#FFFFFF',
            text: showAmount ? `${name}\n${amount}${unit}` : name,
            textAlign: 'center',
            textBaseline: 'middle',
            fontSize: 14,
          },
          draggable: true,
        })
        // 显示成品成本的框
        group.addShape('rect', {
          attrs: {
            x: 0,
            y: 58,
            width: 150,
            height: 36,
            radius: [0, 0, 4, 4],
            fill: '#FFFFFF33',
          },
          draggable: true,
        })
        // 成品的成本
        group.addShape('text', {
          attrs: {
            x: 75,
            y: 75,
            fill: '#FFFFFF',
            text: `成本： ${
              showCost && cost && +cost
                ? `${cost && (+cost).toFixed(2)}${cost_unit}`
                : '-'
            }`,
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
