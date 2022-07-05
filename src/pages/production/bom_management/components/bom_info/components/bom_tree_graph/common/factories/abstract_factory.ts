import { ElementType } from '../enums'
import { BomCardFactory } from './card_factory'
import { EdgeFactory } from './edge_factory'
import { ProcessFactory } from './process_factory'

/**
 * 抽象工厂的类，创建各种元素工厂
 */
class AbstractFactory {
  /**
   * 获取元素工厂
   * @static
   * @param  {ElementType}    type 元素的种类
   * @return {ElementFactory}      元素工厂
   */
  static getFactory(type: ElementType) {
    switch (type) {
      case ElementType.BomCard:
        return new BomCardFactory()

      case ElementType.Edge:
        return new EdgeFactory()

      case ElementType.Process:
        return new ProcessFactory()
    }
  }

  /**
   * 获取所有元素工厂
   * @static
   * @return {ElementFactory[]} 所有元素工厂
   */
  static getAllFactories() {
    return [
      this.getFactory(ElementType.BomCard),
      this.getFactory(ElementType.Edge),
      this.getFactory(ElementType.Process),
    ]
  }
}

export { AbstractFactory }
