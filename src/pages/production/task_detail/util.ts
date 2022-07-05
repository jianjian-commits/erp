import {
  FlowEdge,
  FlowNode,
  NODE_STATE,
  NODE_SUB_TYPE,
  NODE_TYPE,
} from '@gm-common/graph'
import * as merchandise from 'gm_api/src/merchandise'
import {
  Bom,
  Bom_Process,
  OutputType,
  TaskProcess,
  TaskProcess_State,
  TaskSource,
  TaskSource_SourceType,
} from 'gm_api/src/production'
import _ from 'lodash'

export interface ProcessNode extends FlowNode {
  id: string
  type: NODE_TYPE
  state?: NODE_STATE
  label?: string
  input: string[]
  output: string[]
}

function shuffleColor(bom_id: string) {
  let n = Number(bom_id.slice(-4, -3)) // 倒数第4个数字变动较大
  const n2 = Number(bom_id.slice(-5, -4)) // 重复的次数
  if (n === defaultColors.length / 2) n += 1
  const newDefaultColors = [...defaultColors]

  for (let i = 0; i < n2; i++) {
    const ret = newDefaultColors.splice(n)
    newDefaultColors.unshift(...ret)
  }
  return newDefaultColors
}

export interface TransToG6DataOptions {
  /** 炫彩，开启后各个节点的色值将不同, 默认开启 */
  colorful?: boolean
  /** 随机炫彩，开启后每次生成流程图颜色将随机变化，默认开启  */
  randomColor?: boolean
  /** 颜色持久化，开启后将根据bom_id生成不同颜色，默认开启 */
  persist?: boolean
}

const defaultColors = [
  '#FD8A0E',
  '#FEC771',
  '#FFA41B',
  '#EE5F57',
  '#FF5F40',
  '#FD4700',
  '#00BCD4',
  '#42B883',
  '#14B1AB',
  '#15CDA8',
  '#64E291',
  '#9DD8C8',
  '#A0C334',
  '#07689F',
  '#7B88FF',
  '#4D80E4',
  '#0779E4',
  '#AA26DA',
  '#6C5CE7',
  '#6F4A8E',
  '#EF312B',
  '#B83B5E',
  '#FE346E',
]

const defaultColor = '#56a3f2'

/**
 * 业务方法
 * 将后台BOM结构转化为G6要求的格式
 * @param bom 后台Bom类型
 * @param skuMap sku信息
 * @param taskProcesses 可选，流程图如果需要状态，需要传入
 * @param option 可选，配置项
 */
export function transToG6Data(
  bom: Bom,
  skuMap?: { [key: string]: merchandise.Sku },
  taskProcesses?: TaskProcess[],
  options: TransToG6DataOptions = {},
) {
  options = Object.assign(
    {
      colorful: true,
      randomColor: true,
      persist: true,
    },
    options,
  )
  const nodes: FlowNode[] = []
  const links: FlowEdge[] = []
  // 记录所有节点，方便获取
  const recordNode: { [key: string]: any } = {}
  // 记录有状态的节点
  const recordStateNode: { [key: string]: TaskProcess } = {}
  // 记录遍历过的bom工序
  const recordBomProcess: { [key: string]: Bom_Process } = {}
  // 色值集合
  const colors = getColors()

  function record(id: string, node: FlowNode) {
    if (!recordNode[id]) recordNode[id] = node
  }

  function getColors() {
    if (options.randomColor) {
      if (options.persist && bom) return shuffleColor(bom.bom_id)
      return _.shuffle([...defaultColors])
    } else {
      return [...defaultColors]
    }
  }

  /** 查找状态节点 */
  function getStateNode(id: string) {
    if (!id || id === '0') return null
    if (recordStateNode[id]) return recordStateNode[id]
    else {
      const node = _.find(taskProcesses, (p) => p.process_id === id)
      if (node) {
        recordStateNode[id] = node
      }
      return node
    }
  }

  function getNodeState(id: string) {
    const stateNode = getStateNode(id)
    if (!stateNode) return undefined
    switch (stateNode.state!) {
      case TaskProcess_State.STATE_PREPARE:
        return NODE_STATE.PREPARE

      case TaskProcess_State.STATE_STARTED:
        return NODE_STATE.STARTED
      case TaskProcess_State.STATE_FINISHED:
        return NODE_STATE.FINISHED
      default:
        return undefined // 返回null说明改节点不是工序节点
    }
  }

  function getActualId(id: string) {
    return id.split('_')[1]
  }

  function getColor() {
    const color = colors.shift()
    colors.push(color!)
    return options.colorful ? color! : defaultColor
  }

  function getLinkColor(link: FlowEdge) {
    const t_id = link.target
    const t_state = getNodeState(t_id)

    const s_id = link.source
    const s_state = getNodeState(s_id)
    /**
     * link的两端分三种情况
     * 1. target为物料节点，source为工序节点
     *    - 此时link的颜色根据source状态
     * 2. target为工序节点，source为工序节点
     *    - 此时link的颜色根据两端状态判断
     * 3. target为工序节点，source为物料节点
     *    - 此时link的颜色根据target状态
     */
    // 情况一
    if (!t_state) {
      if (s_state === NODE_STATE.STARTED || s_state === NODE_STATE.FINISHED) {
        return options.colorful ? recordNode[t_id].color : defaultColor
      } else {
        return '#ddd'
      }
    }
    // 情况三
    if (!s_state) {
      if (t_state === NODE_STATE.FINISHED) {
        return options.colorful ? recordNode[t_id].color : defaultColor
      } else {
        return '#ddd'
      }
    }
    // 情况二
    if (t_state === NODE_STATE.FINISHED || s_state === NODE_STATE.STARTED) {
      return options.colorful ? recordNode[t_id].color : defaultColor
    } else {
      return '#ddd'
    }
  }

  function getNodeColor(node: FlowNode): string {
    /**
     * 1. 如果input.length > 1 || input.length = 0
     *  - 随机生成一个颜色
     * 2. 如果input.length = 1，查看前一个节点output的长度
     *  1. output.length > 1
     *    - 随机生成一个颜色
     *  2. output.length === 1
     *    - 根据前一个节点的颜色(递归)
     */
    if (node.input.length > 1 || node.input.length === 0) {
      return node.color || getColor()
    } else {
      const preId = node.input[0]
      const preNode = recordNode[preId]
      if (preNode.output.length > 1) {
        return getColor()
      } else {
        if (preNode.color) return preNode.color as string
        else {
          const c = getNodeColor(preNode)
          preNode.color = c
          return c
        }
      }
    }
  }

  function colorfulNodes(nodes: FlowNode[]) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      node.color = getNodeColor(node)
    }
  }

  function getRanDomId() {
    return Math.random().toString(36).slice(-8)
  }

  function createNodesAndLinks(process: Bom_Process) {
    // 最后一道工序或者第一道，将形成一个节点
    const inputs = process.inputs!
    const outputs = process.outputs!
    const processId = process.process_id

    const processNode: FlowNode = {
      id: processId,
      type: NODE_TYPE.PROCESS,
      state: getNodeState(processId),
      label: getStateNode(processId)?.process_name,
      input: [],
      output: [],
    }
    record(processId, processNode)
    nodes.push(processNode)

    for (let i = 0; i < inputs.length; i++) {
      // 处理物料节点
      const input = inputs[i]
      let id = input.prev_process_id!
      if (input.prev_process_id === '0') {
        // 投入的物料可能相同即sku_id相同，不能把sku_id作为id
        // 这里重新生成了的sku_id
        id = getRanDomId() + '_' + input.material?.sku_id!
        input.material!.sku_id = id
        const sku = skuMap![getActualId(id)]
        const node = {
          id: id,
          type: NODE_TYPE.MATERIAL,
          sub_type:
            sku.sku_type === merchandise.Sku_SkuType.PACKAGE
              ? NODE_SUB_TYPE.PACK
              : NODE_SUB_TYPE.INPUT,
          label: skuMap && skuMap[getActualId(id)]?.name,
          output: [process.process_id],
          input: [],
        }
        nodes.push(node)
        record(id, node)

        processNode.input.push(id)
      } else {
        processNode.input.push(input.prev_process_id!)
      }

      // 创建link
      createLink(id, process.process_id)
    }

    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i]
      let id = output.next_process_id!
      if (output.next_process_id === '0') {
        id = getRanDomId() + '_' + output.material?.sku_id!
        output.material!.sku_id = id
        const node = {
          id,
          type: NODE_TYPE.MATERIAL,
          sub_type:
            output.type === OutputType.OUTPUT_TYPE_EXTRA
              ? NODE_SUB_TYPE.BY_PRODUCT
              : NODE_SUB_TYPE.OUTPUT,
          label: skuMap && skuMap[getActualId(id)]?.name,
          input: [process.process_id],
          output: [],
        }
        nodes.push(node)
        record(id, node)

        processNode.output.push(id)
      } else {
        processNode.output.push(output.next_process_id!)
      }

      // 创建link
      createLink(process.process_id, id)
    }

    recordBomProcess[process.process_id] = process
  }

  function createLink(targetId: string, sourceId: string) {
    if (targetId === sourceId) return
    const id = `${targetId}_${sourceId}`
    const isExist = _.findIndex(links, (link) => link.id === id) !== -1
    if (!isExist) {
      const link = {
        target: targetId,
        source: sourceId,
        id: id,
      }
      links.push(link)
    }
  }

  function colorfulLinks(links: FlowEdge[]) {
    for (let i = 0; i < links.length; i++) {
      const link = links[i]
      link.color = getLinkColor(link)
    }
  }

  if (!bom) {
    return {
      nodes: [],
      edges: [],
    }
  }

  const processes = _.cloneDeep(bom.processes?.processes!)
  for (let i = 0; i < processes.length; i++) {
    const process = processes[i]

    createNodesAndLinks(process) // 工序的输入或者输出可能是一个节点
  }
  // 为所有node添加颜色
  colorfulNodes(nodes)
  // 为所有link添加颜色
  colorfulLinks(links)
  return {
    nodes: nodes,
    edges: links,
  }
}

// 将单品BOM、组合BOM合并统一使用单品BOM的code
export const DealWithGroup = (data: TaskSource[]) => {
  const result = _.groupBy(data, 'source_type')
  const isClean = result?.[TaskSource_SourceType.SOURCETYPE_PRODUCE_CLEANFOOD]
  const iseDelicatessen =
    result?.[TaskSource_SourceType.SOURCETYPE_PRODUCE_DELICATESSEN]
  if (isClean && iseDelicatessen) {
    result[TaskSource_SourceType.SOURCETYPE_PRODUCE_CLEANFOOD] = [
      ...isClean,
      ...iseDelicatessen,
    ]
    delete result[TaskSource_SourceType.SOURCETYPE_PRODUCE_DELICATESSEN]
  }
  return result
}
