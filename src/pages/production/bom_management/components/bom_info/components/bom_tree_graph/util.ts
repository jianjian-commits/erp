/**
 * 该文件主要定义了有关BOM流程图的一些方法
 * 主要是实现如何从接口获得的原始数据变成antv/g6可以识别的图数据
 * 以下是一些基本定义，有助于理解各个方法里面的注释
 * 原数据：从接口直接获得的BOM数据
 * 结构数据：表示BOM结构的数据，通过处理原数据得到
 * 流程图数据：直接用于流程图的数据，通过处理结构数据得到
 * 投料：原数据中BOM的原料信息
 * 产出：原数据中BOM的成品信息
 * 原料：结构数据中BOM的原料信息
 * 成品：结构数据中BOM的成品信息
 */
import globalStore from '@/stores/global'
import G6 from '@antv/g6'
import { GetManySkuResponse_SkuInfo } from 'gm_api/src/merchandise'
import {
  Bom,
  BomType,
  Bom_Process,
  Bom_Process_Input,
  Bom_Process_Output,
  GetBomTreeResponse,
  OutputType,
  ProcessTemplate,
} from 'gm_api/src/production'
import BomInfoStore from '../../store'
import {
  ComboBom,
  CommonBom,
  Item,
  PackBom,
  Process,
  SingleBom,
} from './common/interfaces'

/**
 * 工序模板的Map
 */
interface ProcessTemplates {
  /** key为模板的ID，value为工序模板 */
  [key: string]: ProcessTemplate
}

/**
 * 商品信息的Map
 */
interface SkuInfos {
  /** key为商品的ID，value为商品信息 */
  [key: string]: GetManySkuResponse_SkuInfo
}

/**
 * 根据宽度适应文本，超出显示省略号
 * @param  {string | undefined} text     当前文本
 * @param  {number}             maxWidth 最大宽度
 * @param  {number}             fontSize 字体大小，默认12
 * @return {string}                      适应后的文本
 */
const fitText = (text: string | undefined, maxWidth: number, fontSize = 12) => {
  if (!text) {
    return ''
  }

  const ellipsis = '...'
  const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0]
  let currentWidth = 0
  let res = text
  const pattern = new RegExp('[\u4E00-\u9FA5]+') // 区分中英文字符
  text.split('').forEach((letter, index) => {
    if (currentWidth > maxWidth - ellipsisLength) {
      return
    }
    // 中文字符直接加字体的宽度，否则获取单个英文字符的宽度
    if (pattern.test(letter)) {
      currentWidth += fontSize
    } else {
      currentWidth += G6.Util.getLetterWidth(letter, fontSize)
    }
    if (currentWidth > maxWidth - ellipsisLength) {
      res = `${text.substring(0, index)}${ellipsis}`
    }
  })
  return res
}

/**
 * 获取当前工序的所有前序工序
 * @param  {Bom_Process}      currProccess     当前工序
 * @param  {Bom_Process[]}    processes        所有工序
 * @param  {ProcessTemplates} processTemplates 所有工序模板
 * @return {Process[]}                         所有前序工序
 */
const getPrevProcesses = (
  currProcess: Bom_Process,
  processes: Bom_Process[],
  processTemplates: ProcessTemplates,
): Process[] => {
  // 如果当前已没有工序，说明已经没有了前序工序，停止递归
  if (!currProcess) {
    return []
  }

  const process = {
    name: processTemplates[currProcess.process_template_id].name,
    yieldRate: currProcess.inputs[0].cook_yield_rate,
  }
  // 如果当前工序的前序工序为0或不存在前序工序，说明当前工序已经是最先的工序，返回自己
  if (currProcess.inputs[0].prev_process_id === '0') {
    return [process]
  }

  const prevProcess = processes.find(
    (process) => process.process_id === currProcess.inputs[0].prev_process_id,
  )

  if (!prevProcess) {
    return [process]
  }

  // 递归调用，找前序工序的所有前序工序
  return [
    ...getPrevProcesses(prevProcess, processes, processTemplates),
    process,
  ]
}

/**
 * 获取BOM成品信息
 * @param  {Bom}      bom        当前BOM
 * @param  {skuInfos} skuInfos   所有商品信息
 * @param  {boolean}  isChildBom 是否是子BOM
 * @return {any}                 BOM的成品信息
 */
const getProductInfo = (bom: Bom, skuInfos: SkuInfos, isChildBom: boolean) => {
  return {
    bomId: bom.bom_id,
    skuId: bom.sku_id,
    revision: bom.revision,
    name: skuInfos[bom.sku_id].sku?.name || '',
    cost_unit: isChildBom ? '元' : bom.cost_unit_name,
  }
}

/**
 * 获取BOM所有工序
 * @param  {Bom}              bom              当前BOM
 * @param  {ProcessTemplates} processTemplates 所有工序模板
 * @return {Process[]}                         BOM的所有工序
 */
const getProcesses = (
  bom: Bom,
  processTemplates: ProcessTemplates,
): Process[] => {
  // 通过判断产出下一道工序ID为0找到最后一道工序，然后获取所有前序工序
  const lastProcess = bom.processes?.processes.find((process) => {
    return process.outputs.every((output) => output.next_process_id === '0')
  })

  if (!lastProcess) {
    return []
  }

  const processes = getPrevProcesses(
    lastProcess,
    bom.processes?.processes || [],
    processTemplates,
  )

  return processes
}

/**
 * 获取BOM所有的投料或产出
 * @param  {Bom}                                        bom  当前BOM
 * @param  {('inputs' | 'outputs')}                     type 获取的种类，投料或产出
 * @return {(Bom_Process_Input | Bom_Process_Output)[]}      BOM的所有投料或产出
 */
const getBomIo = (
  bom: Bom,
  type: 'inputs' | 'outputs',
): (Bom_Process_Input | Bom_Process_Output)[] => {
  return (
    bom.processes?.processes.reduce((materials, process) => {
      const ios =
        type === 'inputs'
          ? process.inputs.filter((input) => input.prev_process_id === '0')
          : process.outputs.filter((output) => output.next_process_id === '0')
      materials = [...materials, ...ios]
      return materials
    }, [] as (Bom_Process_Input | Bom_Process_Output)[]) || []
  )
}

/**
 * 获取BOM所有投料
 * @param  {Bom}                 bom 当前BOM
 * @return {Bom_Process_Input[]}     BOM的所有投料
 */
const getInputs = (bom: Bom): Bom_Process_Input[] => {
  return getBomIo(bom, 'inputs')
}

/**
 * 获取BOM所有产出
 * @param  {Bom}                  bom 当前BOM
 * @return {Bom_Process_Output[]}     BOM的所有产出
 */
const getOutputs = (bom: Bom): Bom_Process_Output[] => {
  return getBomIo(bom, 'outputs')
}

/**
 * 获取BOM的原料信息
 * @param  {Bom_Process_Input} input      BOM的投料信息
 * @param  {SkuInfos}          skuInfos   BOM的所有商品信息
 * @param  {number}            inputScale 投入的份数，默认为1
 * @return {Item}                         BOM的原料信息
 */
const getMaterial = (
  input: Bom_Process_Input,
  skuInfos: SkuInfos,
  inputScale = 1,
): Item => {
  const { material } = input
  const unitId = input.material?.unit_id
  let unitName
  // 小于200000为自定义单位情况，需要去units里面拿到name
  if (unitId && +unitId < 200000) {
    unitName = skuInfos[material?.sku_id!].sku?.units?.units[0].name
  } else {
    unitName = globalStore.getUnit(input.material?.unit_id || '')?.name
  }
  return {
    name: skuInfos?.[input.material?.sku_id || ''].sku?.name || '',
    amount: (+(input.material?.quantity || 1) * inputScale).toFixed(2),
    unit: unitName,
  }
}

/**
 * 获取BOM的查询语句，用于跳转至BOM详情页
 * @param  {Bom}    bom 需要跳转的BOM
 * @return {string}     BOM的查询语句
 */
const getBomQuery = (bom: Bom) => {
  const { bom_id, revision, sku_id } = bom
  return `bom_id=${bom_id}&revision=${revision}&sku_id=${sku_id}`
}

/**
 * 处理BOM原数据获取结构数据，比较复杂，详情见行内注释
 * @param  {BomType}            type     BOM的种类
 * @param  {GetBomTreeResponse} data     BOM原始数据
 * @param  {string}             bomId    BOM的ID
 * @param  {boolean}            showCost 是否显示成本
 * @return {CommonBom | null}            BOM的结构数据
 */
const formatBomTreeData = (
  type: BomType,
  data: GetBomTreeResponse,
  bomId: string,
  showCost: boolean,
): CommonBom | null => {
  // #region 1. 确保该有的信息都有，没有直接返回null
  if (type === BomType.BOM_TYPE_UNSPECIFIED) {
    return null
  }

  const { boms, process_templates, sku_infos } = data
  if (!boms || !process_templates || !sku_infos) {
    return null
  }

  const productBom = boms?.[bomId]
  if (!productBom) {
    return null
  }
  // #endregion

  // #region 2. 获取成品信息
  const unitId = productBom.base_unit_id
  let unitName
  // 小于200000为自定义单位情况，需要去units里面拿到name
  if (unitId && +unitId < 200000) {
    unitName =
      data.sku_infos?.[productBom.sku_id || '']?.sku?.units?.units.find(
        (item) => item.unit_id === unitId,
      )?.name || ''
  } else {
    unitName = globalStore.getUnit(unitId || '')?.name
  }

  const product: Item = {
    ...getProductInfo(productBom, sku_infos, false),
    amount: (+productBom.quantity).toFixed(2),
    unit: unitName,
    cost: productBom.product_cost,
  }
  const lastProcess = productBom.processes?.processes.find((process) =>
    process.outputs.every((output) => output.next_process_id === '0'),
  )
  const byProducts = lastProcess?.outputs
    .filter((output) => output.type === OutputType.OUTPUT_TYPE_EXTRA)
    .map((output) => {
      const byProduct: Item = {
        name: sku_infos[output.material?.sku_id || ''].sku?.name || '-',
      }
      return byProduct
    })
  // #endregion

  // #region 3. 获取成品的工序信息并创建基本的BOM数据
  const processes = getProcesses(productBom, process_templates)

  let formatedBomData: CommonBom = {
    products: [product],
    processes,
    showCost,
    byProducts,
  }
  // #endregion

  // #region 4. 获取所有投料信息
  const inputs = getInputs(productBom)

  if (!inputs?.length) {
    return null
  }
  // #endregion

  // #region 5. 根据BOM种类和投料信息获取所有的子BOM和原料信息
  if (type === BomType.BOM_TYPE_CLEANFOOD) {
    const input = inputs[0]
    const materialBom = boms[input.material?.sku_id || '']
    // 单品BOM流程图只有原料 + 成品工序 + 成品，这里只需要获取原料即可
    const singleBomData: SingleBom = {
      ...formatedBomData,
      materials: [
        {
          ...getMaterial(input, sku_infos),
          cost: input.material_cost
            ? (+(input.material_cost?.val || 0)).toFixed(2)
            : undefined,
          cost_unit: input.cost_unit_name,
          isBom: !!materialBom,
          bomQuery: materialBom && getBomQuery(materialBom),
        },
      ],
      isSingle: true,
    }
    formatedBomData = singleBomData
  } else if (type === BomType.BOM_TYPE_PRODUCE) {
    // 组合BOM包含原料 + 子BOM工序 + 子BOM + 成品工序 + 成品，需要把子BOM作为成品的原料，然后获取子BOM下的原料和工序
    const comboBomData: ComboBom = {
      ...formatedBomData,
      materials: inputs.reduce((childBoms, input) => {
        const childBom = getChildBom(
          boms,
          input,
          process_templates,
          sku_infos,
          showCost,
        )

        if (childBom) {
          childBoms.push(childBom)
        }

        return childBoms
      }, [] as (SingleBom | ComboBom | Item)[]),
      isSingle: false,
    }
    formatedBomData = comboBomData
  } else if (type === BomType.BOM_TYPE_PACK) {
    // 包装和单品一样，只不过包含了多个原料
    const packBomData: PackBom = {
      ...formatedBomData,
      materials: inputs.map((input) => {
        return {
          ...getMaterial(input, sku_infos),
          cost: (showCost && input?.material_cost?.val) || undefined,
          cost_unit: (showCost && input?.cost_unit_name) || '',
        }
      }),
    }
    formatedBomData = packBomData
  }
  // #endregion

  return formatedBomData
}

/**
 * 获取子BOM的结构数据，比较复杂，详情见行内注释
 * @param  {{ [key: string]: Bom }}             boms             所有BOM的信息
 * @param  {Bom_Process_Input}                  input            子BOM作为成品的投料时的信息
 * @param  {ProcessTemplates}                   processTemplates 所有工序的模板
 * @param  {SkuInfos}                           skuInfos         所有商品的信息
 * @param  {boolean}                            showCost         是否显示成本
 * @return {SingleBom | ComboBom | Item | null}                  子BOM的结构数据
 */
const getChildBom = (
  boms: { [key: string]: Bom },
  input: Bom_Process_Input,
  processTemplates: ProcessTemplates,
  skuInfos: SkuInfos,
  showCost: boolean,
): SingleBom | ComboBom | Item | null => {
  // #region 1. 确保该有的信息都有，没有直接返回null
  const { material, material_cost } = input
  if (!material) {
    return null
  }
  // #endregion

  // #region 2. 获取子BOM的信息
  const childBom = boms?.[material.sku_id || '']
  // #endregion

  // #region 3. 如果找不到子BOM的信息，说明子BOM不是BOM，是个原料，直接按照原料的格式返回，否则继续处理
  if (!childBom) {
    const skuInfo = skuInfos[material.sku_id || '']
    if (!skuInfo || !skuInfo.sku) {
      return null
    }

    const childBomData: Item = {
      name: skuInfo.sku?.name,
      amount: (+material.quantity).toFixed(2),
      unit: globalStore.getUnit(material.unit_id)?.name,
      cost: material_cost
        ? (+(material_cost?.val || 0) * +(material?.quantity || 0)).toFixed(2)
        : undefined,
      cost_unit: '元',
      isBom: false,
    }
    return childBomData
  }
  // #endregion

  // #region 4. 获取子BOM的成品信息
  const product: Item = {
    ...getProductInfo(childBom, skuInfos, true),
    amount: (+material.quantity).toFixed(2),
    // 小于200000为自定义单位情况，需要去units里面拿到name
    unit:
      globalStore.getUnit(material.unit_id)?.name ||
      skuInfos[material?.sku_id!].sku?.units?.units[0].name,
    cost: (+material.quantity * +(material_cost?.val || 0)).toFixed(2),
    isBom: true,
    bomQuery: getBomQuery(childBom),
  }
  // #endregion

  // #region 5. 获取子BOM所有工序信息并创建子BOM的基本结构数据
  const processes = getProcesses(childBom, processTemplates)

  const childBomData = {
    products: [product],
    processes,
    showCost,
  }
  // #endregion

  // #region 6. 获取子BOM所有的产出信息并计算份数，因为子BOM作为投料和产出时数量是不同的，要根据作为投料时的数量为基础计算作为产出时的份数
  const childBomOutputs = getOutputs(childBom)
  const inputScale = getInputScale(input, childBomOutputs[0], skuInfos)
  // #endregion

  // #region 7. 获取子BOM所有的投料信息并根据上面的份数计算数量和成本，因为投料和产出比例是相同的，所以直接使用上面的份数就行
  const childBomInputs = getInputs(childBom)
  const childBomMaterials = childBomInputs.reduce((materials, input) => {
    const skuId = input.material?.sku_id || ''
    let material = getMaterial(input, skuInfos, inputScale)
    material = {
      ...material,
      cost: childBomInputs[0].material_cost
        ? (
            +(childBomInputs[0].material_cost?.val || 0) *
            +(childBomInputs[0].material?.quantity || 0) *
            inputScale
          ).toFixed(2)
        : undefined,
      cost_unit: '元',
      isBom: !!boms[skuId],
      bomQuery: boms[skuId] && getBomQuery(boms[skuId]),
    }
    materials.push(material)

    return materials
  }, [] as (SingleBom | ComboBom | Item)[])
  // #endregion

  // #region 8. 根据子BOM的种类处理，主要是类型上有不同
  if (childBom.type === BomType.BOM_TYPE_CLEANFOOD) {
    const singleBom: SingleBom = {
      ...childBomData,
      materials: childBomMaterials as Item[],
      isSingle: true,
    }
    return singleBom
  } else {
    const comboBom: ComboBom = {
      ...childBomData,
      materials: childBomMaterials,
      isSingle: false,
    }
    return comboBom
  }
  // #endregion
}

/**
 * 获取子BOM投入的份数，用于原料的投入数量和成本的计算，比较复杂，详情见行内注释
 * @param  {Bom_Process_Input}  parentBomInput 子BOM作为投料时的信息
 * @param  {Bom_Process_Output} childBomOutput 子BOM作为产出时的信息
 * @param  {SkuInfos}           skuInfos       所有商品的信息
 * @return {number}                            子BOM投入的份数
 */
const getInputScale = (
  parentBomInput: Bom_Process_Input,
  childBomOutput: Bom_Process_Output,
  skuInfos: SkuInfos,
): number => {
  const skuId = parentBomInput.material?.sku_id || ''
  /** 投料单位与产出单位的比率 */
  const rateOfInputByOutput = +BomInfoStore.skuRateMap[skuId].rate
  /** 投料数量(投料单位) */
  const parentBomInputQuantity = +(parentBomInput.material?.quantity || 0)
  /** 单位产出数量(产出单位) */
  const childBomOutputQuantity = +(childBomOutput.material?.quantity || 1)
  // /** 投料份数 = 投料数量 / 单位产出数量 * 投料单位与产出单位的比率 */
  const inputScale =
    (parentBomInputQuantity / childBomOutputQuantity) * rateOfInputByOutput

  return inputScale
}

const formatSingleBomRawData = (
  data: GetBomTreeResponse,
  bomId: string,
  showCost: boolean,
): SingleBom => {
  const formatedSingleBomData = formatBomTreeData(
    1,
    data,
    bomId,
    showCost,
  ) as SingleBom

  return formatedSingleBomData
}

const formatComboBomRawData = (
  data: GetBomTreeResponse,
  bomId: string,
  showCost: boolean,
): ComboBom => {
  const formatedComboBomData = formatBomTreeData(
    2,
    data,
    bomId,
    showCost,
  ) as ComboBom

  return formatedComboBomData
}

const formatPackBomRawData = (
  data: GetBomTreeResponse,
  bomId: string,
  showCost: boolean,
): PackBom => {
  const formatedPackBomRawData = formatBomTreeData(
    3,
    data,
    bomId,
    showCost,
  ) as PackBom

  return formatedPackBomRawData
}

/**
 * 获取成品信息以用于BOM流程图，因为直接在现有流程图数据上处理了，所以没有任何返回
 * @param  {CommonBom} data             BOM的结构数据
 * @param  {any}       currentGraphData 当前BOM流程图的数据
 * @param  {boolean}   isSingle         是否单品
 */
const getProducts = (
  data: CommonBom,
  currentGraphData: any,
  isSingle = false,
) => {
  const { products, byProducts, processes, showCost } = data
  const { nodes, edges, productX, productY } = currentGraphData

  // 加入工序的节点
  nodes.push({
    id: 'process',
    type: processes.length > 1 ? 'multi-process' : 'single-process',
    x: productX - 100 - (processes.length > 1 ? processes.length * 120 : 150),
    y: productY,
    processes: processes,
    showYieldRate: isSingle,
  })

  // 加入每一个成品和与工序的边
  products.map((product, index) => {
    nodes.push({
      ...product,
      id: 'product-' + index,
      type: 'product-card',
      x: productX,
      y: productY + 120 * index,
      showAmount: !isSingle,
      showCost,
    })
    edges.push({
      type: 'process-bom-edge',
      source: 'process',
      target: 'product-' + index,
      sourceAnchor: 1,
      targetAnchor: 3,
    })
  })

  // 有副产品的话加到所有成品下方
  if (byProducts) {
    byProducts.map((byProduct, index) => {
      nodes.push({
        ...byProduct,
        id: `by-product-${index}`,
        type: 'by-product-card',
        x: productX,
        y: productY + 120 * (products.length + index),
      })
      edges.push({
        type: 'process-by-product-edge',
        source: 'process',
        target: `by-product-${index}`,
      })
    })
  }
}

/**
 * 获取单品BOM的流程图数据
 * @param  {SingleBom} data 单品BOM的结构数据
 * @return {any}            单品BOM的流程图数据
 */
const getSingleBomGraphData = (data: SingleBom) => {
  const nodes = []
  const edges = []
  const { processes, materials, showCost } = data
  const startX = 50
  const startY = 50

  // 把原料节点和与工序的边加入图中
  const materialNode = {
    ...materials[0],
    id: 'material',
    type: 'material-card',
    x: startX,
    y: startY,
    showAmount: false,
    showCost,
  }

  const materialEdge = {
    type: 'material-process-edge',
    source: 'material',
    target: 'process',
    sourceAnchor: 1,
    targetAnchor: 3,
  }

  nodes.push(materialNode)
  edges.push(materialEdge)

  // 计算成品的位置并把成品节点加入图中
  const productX =
    startX + 350 + (processes.length > 1 ? processes.length * 120 : 150)
  const productY = startY

  getProducts(
    data,
    {
      nodes,
      edges,
      productX,
      productY,
    },
    true,
  )
  // #endregion

  const graphData = {
    nodes,
    edges,
  }

  return graphData
}

/**
 * 获取子BOM原料相关的数量
 * @param  {(SingleBom | ComboBom | Item)[]} childBomMaterials 子BOM所有原料信息
 * @return {any}                                               原料相关的数量，包括原料的总数，每一个子BOM最多的原料数和每个子BOM的高度坐标
 */
const getMaterialCounts = (
  childBomMaterials: (SingleBom | ComboBom | Item)[],
) => {
  let totalMaterialCount = 0
  let maxMaterialProcessCount = 1
  const bomHeights: number[] = []

  childBomMaterials.map((material) => {
    let materialCount = 0
    let height = 0
    // 如果有materials属性说明是BOM
    if (material.hasOwnProperty('materials')) {
      const childBom = material as SingleBom | ComboBom
      materialCount = childBom.materials.length
      height = totalMaterialCount * 160 + (materialCount - 1) * 80
      maxMaterialProcessCount = Math.max(
        maxMaterialProcessCount,
        childBom.processes.length,
      )
    } else {
      materialCount = 1
      height = totalMaterialCount * 160
    }

    bomHeights.push(height)
    totalMaterialCount += materialCount
  })
  return {
    maxMaterialProcessCount,
    totalMaterialCount,
    bomHeights,
  }
}

/**
 * 获取子BOM的流程图数据
 * @param  {SingleBom | ComboBom} data             子BOM的信息
 * @param  {number}               index            子BOM的编号
 * @param  {number}               materialIndex    当前原料的总数
 * @param  {any}                  currentGraphData 当前BOM流程图的数据
 * @return {number}                                新的原料总数
 */
const getChildBomGraphData = (
  data: SingleBom | ComboBom,
  index: number,
  materialIndex: number,
  currentGraphData: any,
) => {
  const { nodes, edges, startX, startY, bomX, bomY } = currentGraphData
  const id = 'child-bom-' + index
  const childBom = data

  // 把每个原料的节点和与工序连接的边加到图中
  childBom.materials.map((material) => {
    const materialNode = {
      ...material,
      id: 'material-' + materialIndex,
      type: 'material-card',
      x: startX,
      y: startY + 160 * materialIndex,
      showAmount: true,
      showCost: childBom.showCost,
    }
    const materialEdge = {
      type: 'material-process-edge',
      source: 'material-' + materialIndex,
      target: 'process-' + index,
      sourceAnchor: 1,
      targetAnchor: 3,
    }
    nodes.push(materialNode)
    edges.push(materialEdge)
    materialIndex++
  })

  // 把工序、子BOM的节点和连接它们的边加到图中
  const processNode = {
    id: 'process-' + index,
    type: childBom.processes.length > 1 ? 'multi-process' : 'single-process',
    x:
      (bomX + startX + 150) / 2 -
      (childBom.processes.length > 1 ? childBom.processes.length * 60 : 75),
    y: bomY,
    processes: childBom.processes,
    showYieldRate: childBom.isSingle,
  }
  const childBomNode = {
    ...childBom.products[0],
    id,
    type: 'child-bom-card',
    x: bomX,
    y: bomY,
    showCost: childBom.showCost,
  }
  const processEdge = {
    type: 'process-bom-edge',
    source: 'process-' + index,
    target: id,
    sourceAnchor: 1,
    targetAnchor: 3,
  }
  nodes.push(processNode)
  nodes.push(childBomNode)
  edges.push(processEdge)

  return materialIndex
}

/**
 * 获取组合BOM的流程图数据
 * @param  {ComboBom} data 组合BOM的结构数据
 * @return {any}           组合BOM的流程图数据
 */
const getComboBomGraphData = (data: ComboBom) => {
  const nodes: any = []
  const edges: any = []
  const combos: any = []
  const { processes, materials } = data
  const startX = 50
  const startY = 50

  const { maxMaterialProcessCount, totalMaterialCount, bomHeights } =
    getMaterialCounts(materials)

  const materialChildBomMargin =
    maxMaterialProcessCount > 1 ? 120 * maxMaterialProcessCount + 200 : 350

  let materialIndex = 0
  const bomX = startX + 150 + materialChildBomMargin
  // 把每个原料（子BOM）的节点和与成品连接的边加入图中
  materials.map((material, index) => {
    const id = 'child-bom-' + index
    const bomY = startY + bomHeights[index]
    if (material.hasOwnProperty('materials')) {
      // 如果带有materials，说明是BOM，获取子BOM的流程图信息一起加入当前流程图信息，方法会直接处理，不用在加一次
      const childBom = material as SingleBom | ComboBom
      materialIndex = getChildBomGraphData(childBom, index, materialIndex, {
        nodes,
        edges,
        combos,
        startX,
        startY,
        bomX,
        bomY,
      })
    } else {
      // 如果没有materials，说明是原料，直接按原料的方式处理
      const item = material as Item
      const childBomNode = {
        ...item,
        id,
        type: 'child-bom-card',
        x: bomX,
        y: bomY,
        showCost: true,
      }
      nodes.push(childBomNode)
      materialIndex++
    }

    // 把子BOM和成品连接的边加到图中，这里特殊处理，先渲染两边的，后渲染中间的，以免覆盖掉
    const childBomEdge = {
      type: 'bom-process-edge',
      source: id,
      target: 'process',
      sourceAnchor: 1,
      targetAnchor: 3,
    }
    if (index < materials.length / 2) {
      edges.push(childBomEdge)
    } else {
      edges.unshift(childBomEdge)
    }
  })

  // 获取成品位置并把成品节点加入图中
  const childBomProductMargin =
    processes.length > 1 ? processes.length * 120 + 200 : 350
  const productX = bomX + 150 + childBomProductMargin
  const productY = startY + 80 * (totalMaterialCount - 1)

  getProducts(data, {
    nodes,
    edges,
    productX,
    productY,
  })

  const graphData = {
    nodes,
    edges,
    combos,
  }

  return graphData
}

/**
 * 获取包装BOM流程图信息，这期暂时不做，等商品重构后再做，注释到时更新
 * 基本原理和单品BOM类似，只是可能会有多个原料
 */
const getPackBomGraphData = (data: PackBom) => {
  const nodes: any = []
  const edges: any = []
  const { materials, showCost } = data
  const startX = 50
  const startY = 50

  materials.map((material, index) => {
    const id = 'child-bom-' + index
    const childBomNode = {
      ...material,
      id,
      type: 'child-bom-card',
      x: startX,
      y: startY + 160 * index,
      showAmount: true,
      showCost,
    }
    const childBomEdge = {
      type: 'bom-process-edge',
      source: id,
      target: 'process',
      sourceAnchor: 1,
      targetAnchor: 3,
    }
    nodes.push(childBomNode)
    if (index < materials.length / 2) {
      edges.push(childBomEdge)
    } else {
      edges.unshift(childBomEdge)
    }
  })

  // nodes.push({
  //   id: 'process',
  //   type: 'single-process',
  //   x: startX + 150 + 100,
  //   y: startY + 80 * (materials.length - 1),
  //   processes,
  // })
  // nodes.push({
  //   ...products[0],
  //   id: 'product',
  //   type: 'product-card',
  //   x: startX + 150 + 100 + 150 + 100,
  //   y: startY + 80 * (materials.length - 1),
  //   showAmount: true,
  //   showCost,
  // })
  // edges.push({
  //   type: 'process-bom-edge',
  //   source: 'process',
  //   target: 'product',
  //   sourceAnchor: 1,
  //   targetAnchor: 3,
  // })

  const productX = startX + 500
  const productY = startY + 80 * (materials.length - 1)

  getProducts(data, {
    nodes,
    edges,
    productX,
    productY,
  })

  const graphData = {
    nodes,
    edges,
  }

  return graphData
}

/**
 * 获取BOM的流程图数据
 * @param  {BomType}          type BOM的种类
 * @param  {CommonBom | null} data BOM的结构数据
 * @return                         BOM的流程图数据
 */
const getGraphData = (type: BomType, data: CommonBom | null) => {
  if (!data) {
    return null
  }

  switch (type) {
    case BomType.BOM_TYPE_CLEANFOOD:
      return getSingleBomGraphData(data as SingleBom)

    case BomType.BOM_TYPE_PRODUCE:
      return getComboBomGraphData(data as ComboBom)

    case BomType.BOM_TYPE_PACK:
      return getPackBomGraphData(data as PackBom)

    case BomType.BOM_TYPE_UNSPECIFIED:
      return null
  }
}

export { fitText, formatBomTreeData, getGraphData }
