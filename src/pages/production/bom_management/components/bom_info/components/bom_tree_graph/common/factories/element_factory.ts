/**
 * 元素工厂的抽象类
 * @abstract
 */
abstract class ElementFactory {
  /**
   * 注册元素
   * @abstract
   * @param {any} type 元素的种类
   */
  abstract register(type: any): void
  /**
   * 注册所有种类的元素
   * @abstract
   */
  abstract registerAllTypes(): void
}

export { ElementFactory };
