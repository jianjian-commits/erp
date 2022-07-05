import G6, { Graph } from '@antv/g6'
import { ReferencePrice_Type } from 'gm_api/src/merchandise'
import { GetMerchandiseSettings } from 'gm_api/src/preference'
import { BomType, GetBomTreeResponse } from 'gm_api/src/production'
import React, { FC, useEffect, useState } from 'react'
import { AbstractFactory } from './common/factories/abstract_factory'
import { formatBomTreeData, getGraphData } from './util'

/**
 * BOM流程图的属性
 */
interface BomTreeGraphProps {
  /** BOM的ID */
  bomId: string
  /** BOM流程图的数据 */
  bomTreeData: GetBomTreeResponse
}

/**
 * BOM流程图的组件函数
 */
const BomTreeGraph: FC<BomTreeGraphProps> = ({ bomId, bomTreeData }) => {
  // 注册所有类的所有元素
  AbstractFactory.getAllFactories().map((factory) => factory.registerAllTypes())

  const [graph, setGraph] = useState<Graph>()
  const [showCost, setShowCost] = useState(false)

  useEffect(() => {
    const initGraph = new G6.Graph({
      container: 'container',
      width: Math.max(window.innerWidth - 200, 1200),
      height: Math.max(window.innerHeight - 600, 520),
      // fitView: true,
      modes: {
        // 设置图的模式，设置拖拽与滚动的范围
        default: [
          {
            type: 'scroll-canvas',
            scalableRange: -0.8,
          },
          {
            type: 'drag-canvas',
            scalableRange: -0.8,
          },
        ],
      },
    })

    initGraph.on('process-name-text:mouseenter', (e) => {
      initGraph.setItemState(e.item || '', 'process-name-full', true)
    })

    initGraph.on('process-name-text:mouseleave', (e) => {
      initGraph.setItemState(e.item || '', 'process-name-full', false)
    })

    setGraph(initGraph)

    // 根据商品设置更新成本显示状态
    GetMerchandiseSettings().then((response) => {
      const hasSetCost =
        response.response.merchandise_settings.reference_price_type !==
        ReferencePrice_Type.REFERENCE_PRICE_UNSPECIFIED
      setShowCost(hasSetCost)
    })
  }, [])

  useEffect(() => {
    const type = bomTreeData.boms?.[bomId].type || BomType.BOM_TYPE_UNSPECIFIED
    if (type === BomType.BOM_TYPE_UNSPECIFIED) {
      return
    }

    const data = formatBomTreeData(type, bomTreeData, bomId, true)
    const graphData = getGraphData(type, data)
    if (graph && graphData) {
      graph.data(graphData)
      graph.render()
    }
  }, [graph, bomId, bomTreeData, showCost])

  return <div id='container' />
}

export default BomTreeGraph
