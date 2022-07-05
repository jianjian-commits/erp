import { t } from 'gm-i18n'

export const FORMULA = {
  /**
   * 现单价
   */
  NOW: '{{Now}}',
  /**
   * 最近入库价
   */
  LAST_IN_STOCK_PRICE: '{{LastInStockPrice}}',
  /**
   * 最近询价
   */
  //   LAST_QUOTE_PRICE: '{{LastQuotePrice}}',
  /**
   * 最近采购价
   */
  LAST_PURCHASE_PRICE: '{{LastPurchasePrice}}',
  /**
   * 最近采购协议价
   */
  //   LAST_PURCHSE_AGREEMENT_PRICE: '{{LastPurchaseAgreementPrice}}',
  /**
   * 库存均价
   */
  //   STOCK_AVG_PRICE: '{{InventoryAveragePrice}}',

  // #region 暂时不需要
  //   /**
  //    * 供应商最近询价
  //    */
  //   LAST_QUOTE_PRICE: '{last_quote_price}',
  //   /**
  //    * 供应商最近采购价
  //    */
  //   LAST_PURCHASE_PRICE: '{last_purchase_price}',
  //   /**
  //    * 供应商最近入库价
  //    */
  //   LAST_IN_STOCK_PRICE: '{last_in_stock_price}',
  //   /**
  //    * 供应商周期报价
  //    */
  //   SUPPLIER_CYCLE_QUOTE: '{supplier_cycle_quote}',
  // #endregion
} as const

/**
 * 公式含义
 */
export const FORMULA_MEAN = {
  NOW: t('现单价'),
  STOCK_AVG_PRICE: t('库存均价'),
  LAST_QUOTE_PRICE: t('最近询价'),
  LAST_IN_STOCK_PRICE: t('最近入库价'),
  LAST_PURCHASE_PRICE: t('最近采购价'),
  LAST_PURCHSE_AGREEMENT_PRICE: t('最近采购协议价'),
  //   LAST_QUOTE_PRICE: t('供应商最近询价'),
  //   LAST_PURCHASE_PRICE: t('供应商最近采购价'),
  //   LAST_IN_STOCK_PRICE: t('供应商最近入库价'),
  // SUPPLIER_CYCLE_QUOTE: t('供应商周期报价'),
} as const

/**
 * Select 选择器 options
 */
export const FORMULA_SELECT_OPTIONS = [
  { value: FORMULA.NOW, label: FORMULA_MEAN.NOW },
  //   { value: FORMULA.STOCK_AVG_PRICE, label: FORMULA_MEAN.STOCK_AVG_PRICE },
  //   { value: FORMULA.LAST_QUOTE_PRICE, label: FORMULA_MEAN.LAST_QUOTE_PRICE },
  {
    value: FORMULA.LAST_IN_STOCK_PRICE,
    label: FORMULA_MEAN.LAST_IN_STOCK_PRICE,
  },
  {
    value: FORMULA.LAST_PURCHASE_PRICE,
    label: FORMULA_MEAN.LAST_PURCHASE_PRICE,
  },
  //   {
  //     value: FORMULA.LAST_PURCHSE_AGREEMENT_PRICE,
  //     label: FORMULA_MEAN.LAST_PURCHSE_AGREEMENT_PRICE,
  //   },
  //   { value: FORMULA.LAST_QUOTE_PRICE, label: FORMULA_MEAN.LAST_QUOTE_PRICE },
  //   {
  //     value: FORMULA.LAST_IN_STOCK_PRICE,
  //     label: FORMULA_MEAN.LAST_IN_STOCK_PRICE,
  //   },
  //   {
  //     value: FORMULA.LAST_PURCHASE_PRICE,
  //     label: FORMULA_MEAN.LAST_PURCHASE_PRICE,
  //   },

  // {
  //   value: FORMULA.SUPPLIER_CYCLE_QUOTE,
  //   label: FORMULA_MEAN.SUPPLIER_CYCLE_QUOTE,
  // },
]
