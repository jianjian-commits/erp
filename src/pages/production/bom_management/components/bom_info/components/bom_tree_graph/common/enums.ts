/**
 * 元素的种类
 * @enum
 */
enum ElementType {
  /** 卡片 */
  BomCard = 1,
  /** 边 */
  Edge = 2,
  /** 工序 */
  Process = 3,
}

/**
 * 卡片的种类
 * @enum
 */
enum CardType {
  /** 原料 */
  Material = 1,
  /** 子BOM */
  ChildBom = 2,
  /** 成品 */
  Product = 3,
  /** 副产品 */
  ByProdcut = 4,
}

/**
 * 边的种类
 * @enum
 */
enum EdgeType {
  /** 原料与工序的连线 */
  MaterialToProcess = 1,
  /** 工序与BOM的连线 */
  ProcessToBom = 2,
  /** BOM与工序的连线 */
  BomToProcess = 3,
  /** 工序与副产品的连线 */
  ProcessToByProduct = 4,
}

/**
 * 工序的种类
 * @enum
 */
enum ProcessType {
  /** 单工序 */
  Single = 1,
  /** 多工序 */
  Multi = 2,
}

export { ElementType, CardType, EdgeType, ProcessType };
