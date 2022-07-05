import {
  BomProcessEdge,
  MaterialProcessEdge,
  ProcessBomEdge,
  ProcessByProductEdge
} from '../edges'
import { EdgeType } from '../enums'
import { ElementFactory } from './element_factory'

/**
 * 边工厂的类，创建各种类型的边
 * @implements {ElementFactory}
 */
class EdgeFactory implements ElementFactory {
  /**
   * 注册边
   * @override
   * @param {EdgeType} type 边的种类
   */
  register(type: EdgeType) {
    switch (type) {
      case EdgeType.MaterialToProcess:
        return new MaterialProcessEdge().register()

      case EdgeType.ProcessToBom:
        return new ProcessBomEdge().register()

      case EdgeType.BomToProcess:
        return new BomProcessEdge().register()

      case EdgeType.ProcessToByProduct:
        return new ProcessByProductEdge().register()
    }
  }

  /**
   * 注册所有种类的边
   * @override
   */
  registerAllTypes(): void {
    this.register(EdgeType.MaterialToProcess)
    this.register(EdgeType.ProcessToBom)
    this.register(EdgeType.BomToProcess)
    this.register(EdgeType.ProcessToByProduct)
  }
}

export { EdgeFactory }
