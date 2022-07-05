import { Group, IGroup } from '@antv/g-canvas'
import G6 from '@antv/g6'
import { GraphElement } from '../../graph_element'
import { CardConfig } from '../../interfaces'

/**
 * 流程图中原料卡片的类
 * @implements {GraphElement}
 */
export class MaterialCard implements GraphElement {
  /**
   * 注册节点
   * @override
   */
  register(): void {
    G6.registerNode('material-card', {
      // 绘制节点
      draw(config?: CardConfig, group?: IGroup) {
        if (!group || !config) {
          return new Group(config).addShape()
        }

        const {
          name,
          amount,
          unit,
          cost,
          cost_unit,
          showAmount,
          showCost,
          isBom,
          bomQuery,
        } = config || {}
        // 外框
        const shape = group.addShape('rect', {
          attrs: {
            width: 150,
            height: 92,
            radius: 4,
            stroke: '#2FC0D8',
          },
          draggable: true,
        })
        // 跳转链接，原料是BOM时才显示
        // 先注释保留，以防以后又要显示
        // isBom &&
        //   group.addShape('text', {
        //     attrs: {
        //       x: 0,
        //       y: -4,
        //       text: '进入BOM详情',
        //       fill: '#56A3F2',
        //       fontSize: 14,
        //       cursor: 'pointer',
        //     },
        //     draggable: true,
        //   })
        // 显示原料商品名和数量的框
        group.addShape('rect', {
          attrs: {
            x: 0,
            y: 28,
            width: 150,
            height: 58,
            radius: [4, 4, 0, 0],
          },
          draggable: true,
        })
        // 原料的商品名和数量
        group.addShape('text', {
          attrs: {
            x: 75,
            y: 35,
            fill: '#2FC0D8',
            text: showAmount ? `${name}\n${amount}${unit}` : name,
            textAlign: 'center',
            textBaseline: 'middle',
            fontSize: 14,
          },
          draggable: true,
        })
        // 显示原料成本的框
        group.addShape('rect', {
          attrs: {
            x: 0,
            y: 58,
            width: 150,
            height: 36,
            radius: [0, 0, 4, 4],
            fill: '#2FC0D8',
          },
          draggable: true,
        })
        // 原料的成本
        group.addShape('text', {
          attrs: {
            x: 75,
            y: 75,
            fill: '#FFFFFF',
            text: `成本： ${
              showCost && cost && +cost
                ? `${(+cost).toFixed(2)}${cost_unit}`
                : '-'
            }`,
            textAlign: 'center',
            textBaseline: 'middle',
            fontSize: 14,
          },
          draggable: true,
        })
        // 点击事件，如果是BOM就跳转
        // 先注释保留，以防以后又要显示
        // group.on('click', () => {
        //   if (isBom) {
        //     window.location.href = `/#/production/bom_management/produce/detail?${bomQuery}`
        //   }
        // })

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
