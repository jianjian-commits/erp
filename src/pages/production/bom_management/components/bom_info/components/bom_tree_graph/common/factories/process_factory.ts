import { ProcessType } from '../enums'
import { MultiProcess, SingleProcess } from '../processes'
import { ElementFactory } from './element_factory'

/**
 * 工序工厂的类，创建各种类型的工序
 * @implements {ElementFactory}
 */
class ProcessFactory implements ElementFactory {
  /**
   * 注册工序
   * @override
   * @param {ProcessType} type 工序的种类
   */
  register(type: ProcessType) {
    switch (type) {
      case ProcessType.Single:
        return new SingleProcess().register()

      case ProcessType.Multi:
        return new MultiProcess().register()
    }
  }

  /**
   * 注册所有种类的工序
   * @override
   */
  registerAllTypes(): void {
    this.register(ProcessType.Single)
    this.register(ProcessType.Multi)
  }
}

export { ProcessFactory }
