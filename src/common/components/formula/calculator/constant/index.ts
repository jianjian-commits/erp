import { CalcBtnConfig } from '../types'
import { FORMULA, FORMULA_MEAN } from '../../constant/formula'
import { OPERATOR_BUTTON, ACTION_BUTTON } from './button'

/**
 * 公式变量
 */
const VARIABLE_LIST: CalcBtnConfig[] = [
  {
    value: FORMULA.NOW,
    content: FORMULA_MEAN.NOW,
    textBoxValue: `[${FORMULA_MEAN.NOW}]`,
    isVariable: true,
  },
  //   {
  //     value: FORMULA.LAST_QUOTE_PRICE,
  //     content: FORMULA_MEAN.LAST_QUOTE_PRICE,
  //     textBoxValue: `[${FORMULA_MEAN.LAST_QUOTE_PRICE}]`,
  //     isVariable: true,
  //   },
  {
    value: FORMULA.LAST_PURCHASE_PRICE,
    content: FORMULA_MEAN.LAST_PURCHASE_PRICE,
    textBoxValue: `[${FORMULA_MEAN.LAST_PURCHASE_PRICE}]`,
    isVariable: true,
  },
  {
    value: FORMULA.LAST_IN_STOCK_PRICE,
    content: FORMULA_MEAN.LAST_IN_STOCK_PRICE,
    textBoxValue: `[${FORMULA_MEAN.LAST_IN_STOCK_PRICE}]`,
    isVariable: true,
  },
  //   {
  //     value: FORMULA.STOCK_AVG_PRICE,
  //     content: FORMULA_MEAN.STOCK_AVG_PRICE,
  //     textBoxValue: `[${FORMULA_MEAN.STOCK_AVG_PRICE}]`,
  //     isVariable: true,
  //   },
  //   {
  //     value: FORMULA.LAST_PURCHSE_AGREEMENT_PRICE,
  //     content: FORMULA_MEAN.LAST_PURCHSE_AGREEMENT_PRICE,
  //     textBoxValue: `[${FORMULA_MEAN.LAST_PURCHSE_AGREEMENT_PRICE}]`,
  //     isVariable: true,
  //   },

  // #region 暂时用不上
  //   {
  //     value: FORMULA.LATEST_QUOTE_PRICE,
  //     content: FORMULA_MEAN.LATEST_QUOTE_PRICE,
  //     textBoxValue: `[${FORMULA_MEAN.LATEST_QUOTE_PRICE}]`,
  //     isVariable: true,
  //   },
  //   {
  //     value: FORMULA.LATEST_IN_STOCK_PRICE,
  //     content: FORMULA_MEAN.LATEST_IN_STOCK_PRICE,
  //     textBoxValue: `[${FORMULA_MEAN.LATEST_IN_STOCK_PRICE}]`,
  //     isVariable: true,
  //   },
  //   {
  //     value: FORMULA.LATEST_PURCHASE_PRICE,
  //     content: FORMULA_MEAN.LATEST_PURCHASE_PRICE,
  //     textBoxValue: `[${FORMULA_MEAN.LATEST_PURCHASE_PRICE}]`,
  //     isVariable: true,
  //   },
  // {
  //   value: FORMULA.SUPPLIER_CYCLE_QUOTE,
  //   content: FORMULA_MEAN.SUPPLIER_CYCLE_QUOTE,
  //   textBoxValue: `[${FORMULA_MEAN.SUPPLIER_CYCLE_QUOTE}]`,
  //   isVariable: true,
  // },
  // #endregion
]

/**
 * 按钮配置
 */
const BUTTON_LIST: CalcBtnConfig[] = [
  OPERATOR_BUTTON['/'],
  OPERATOR_BUTTON['('],
  OPERATOR_BUTTON[')'],
  ACTION_BUTTON.BACKSPACE,
  OPERATOR_BUTTON['*'],
  OPERATOR_BUTTON[7],
  OPERATOR_BUTTON[8],
  OPERATOR_BUTTON[9],
  OPERATOR_BUTTON['-'],
  OPERATOR_BUTTON[4],
  OPERATOR_BUTTON[5],
  OPERATOR_BUTTON[6],
  OPERATOR_BUTTON['+'],
  OPERATOR_BUTTON[1],
  OPERATOR_BUTTON[2],
  OPERATOR_BUTTON[3],
  ACTION_BUTTON.CLEAR,
  OPERATOR_BUTTON[0],
  OPERATOR_BUTTON['.'],
  ACTION_BUTTON.DONE,
]

const FULL_CALC_BTN_LIST = [...VARIABLE_LIST, ...BUTTON_LIST]

export { BUTTON_LIST, VARIABLE_LIST, FULL_CALC_BTN_LIST }
export { OPERATOR_BUTTON }
