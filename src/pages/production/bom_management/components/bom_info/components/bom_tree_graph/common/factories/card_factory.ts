import {
  ByProductCard,
  ChildBomCard,
  MaterialCard,
  ProductCard
} from '../cards'
import { CardType } from '../enums'
import { ElementFactory } from './element_factory'

/**
 * 卡片工厂的类，创建各种类型的卡片
 * @implements {ElementFactory}
 */
class BomCardFactory implements ElementFactory {
  /**
   * 注册卡片
   * @override
   * @param {CardType} type 卡片的种类
   */
  register(type: CardType) {
    switch (type) {
      case CardType.Material:
        return new MaterialCard().register()

      case CardType.ChildBom:
        return new ChildBomCard().register()

      case CardType.Product:
        return new ProductCard().register()

      case CardType.ByProdcut:
        return new ByProductCard().register()
    }
  }

  /**
   * 注册所有种类的卡片
   * @override
   */
  registerAllTypes() {
    this.register(CardType.Material)
    this.register(CardType.ChildBom)
    this.register(CardType.Product)
    this.register(CardType.ByProdcut)
  }
}

export { BomCardFactory }
