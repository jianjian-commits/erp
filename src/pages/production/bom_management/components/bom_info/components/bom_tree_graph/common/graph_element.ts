/**
 * 流程图元素的抽象类
 * @abstract
 */
abstract class GraphElement {
  /**
   * 注册元素
   * @abstract
   */
  abstract register(): void
}

export { GraphElement };
