import StepsComponent from './steps'
import Item from './item'

type StepsComponentType = typeof StepsComponent & {
  Item: typeof Item
}

const Steps = StepsComponent as StepsComponentType
Steps.Item = Item

export default Steps
