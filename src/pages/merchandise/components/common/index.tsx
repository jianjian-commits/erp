import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { t } from 'gm-i18n'
import { Checkbox } from 'antd'
import globalStore from '@/stores/global'

/** 获取商品条目的样式 */
export const getSelectItemCount = (count?: number | undefined) => {
  return (
    <span style={{ fontWeight: 600, marginRight: 8 }}>
      {t('已选条目')}：{count || t('所有')}
    </span>
  )
}

const deleteStyle = { color: '#E04B20', marginTop: '4px', fontSize: '14px' }
interface DeleteQuotationTipProps {
  /** 当前删除的报价单名称，text不传表示批量 默认这些报价单 */
  text?: string
  /** 已选条目数量，批量时传 */
  count?: number
}

/**
 * 单个/批量删除报价单的提示
 */
export const DeleteQuotationTip = (props: DeleteQuotationTipProps) => {
  const { text = t('这些报价单'), count } = props
  return (
    <>
      {typeof count === 'number' && getSelectItemCount(count)}

      <span>{t('您确定要删除')}</span>
      <span style={{ fontWeight: 600 }}>{t(`${text}`)}</span>
      <span>{t('吗？')}</span>
      <div style={deleteStyle}>
        {t(
          '注意：删除报价单后，与删除报价单关联的客户无法正常下单，请尽快为客户绑定新的报价单。',
        )}
      </div>
    </>
  )
}

interface EditShelfStatusProps {
  onShelf: boolean
  quotation?: string
  combineName: string
}

/**
 * 上架/下架的提示
 */
export const EditShelfStatus = (props: EditShelfStatusProps) => {
  const { onShelf, quotation, combineName } = props
  return (
    <>
      {t(`确定要${!onShelf ? '上架' : '下架'}`)}
      {!!quotation && (
        <>
          <span style={{ fontWeight: 600 }}>{t(quotation)}</span>
          {t('中的')}
        </>
      )}
      <span style={{ fontWeight: 600 }}>{t(combineName)}</span>
      {t('吗？')}
    </>
  )
}

interface BatchOffShelfProps {
  itemCount: number
}

export interface BatchOffShelfRef {
  isShelfAssociated: boolean
}

/** 批量下架 */
export const BatchOffShelf = forwardRef<BatchOffShelfRef, BatchOffShelfProps>(
  (props, ref) => {
    const { itemCount } = props
    const [isShelfAssociated, setIsShelfAssociated] = useState<boolean>(false)

    useImperativeHandle(ref, () => ({
      isShelfAssociated,
    }))

    const onChange = (e: any) => {
      setIsShelfAssociated(e.target.checked)
    }

    return (
      <>
        {getSelectItemCount(itemCount)}
        {t('确定要下架这些商品销售条目吗？')}
        <div>
          <Checkbox
            className='tw-mt-5'
            checked={isShelfAssociated}
            onChange={onChange}
          >
            {t('将所关联的组合商品同时下架')}
          </Checkbox>
        </div>
      </>
    )
  },
)

interface DeleteSkuInQuotationProps {
  skuName?: string
}

/**
 * 删除报价单商品条目的提示
 */
export const DeleteSkuInQuotation = (props: DeleteSkuInQuotationProps) => {
  const { skuName } = props
  return (
    <div>
      {skuName ? (
        <>
          {t('确定要删除')}
          <span style={{ fontWeight: 600 }}>{t(skuName)}</span>
          {t('所有的销售条目吗？')}
        </>
      ) : (
        t('确定要删除这个商品销售条目吗？')
      )}
    </div>
  )
}

interface DeleteCombineInQuotationProps {
  combineName: string
}

/**
 * 删除报价单中组合商品提示
 */
export const DeleteCombineInQuotation = (
  props: DeleteCombineInQuotationProps,
) => {
  const { combineName } = props
  return (
    <>
      {t('确定要删除')}
      <span style={{ fontWeight: 'bold' }}>{t(`${combineName}`)}</span>
      {t('的销售条目吗？')}
    </>
  )
}

// ------------------------ 商品相关 --------------------------

interface DeleteSkuTipProps {
  /** 当前删除的商品名称，text不传表示批量 默认这些商品 */
  text?: string
  /** 已选条目数量，批量时传 */
  count?: number
}
/** 单个/批量删除商品提示 */
export const DeleteSkuTip = (props: DeleteSkuTipProps) => {
  const { text = t('这些商品'), count } = props
  return (
    <>
      {!!count && getSelectItemCount(count)}
      <span>{t('您确定要删除')}</span>
      <span style={{ fontWeight: 600 }}>{t(`${text}`)}</span>
      <span>{t('吗？')}</span>
      <div style={deleteStyle}>
        {t('注意：')}
        <br />
        {t('1、删除后，商品将从商品库中移除；')}
        <br />
        {t('2、商品将从与其关联的报价单中被移除；')}
        <br />
        {t('3、商品将从与其关联的商品BOM中移除；')}
        <br />
        {t('4、商品删除前生产的进销存单据允许继续操作；')}
        <br />
        {t('5、货值成本表中仍会展示被删除的商品，但是无法进行操作。')}
      </div>
    </>
  )
}

interface EditSkuSaleTipProps {
  /** 当前删除的商品名称，text不传表示批量 默认这些商品 */
  text?: string
  /** 已选条目数量，批量时传 */
  count?: number
  /** 是否为启售 */
  isSale: boolean
  /** 是否为组合商品 */
  isSingle?: boolean
}

export interface EditSkuSaleTipRef {
  isSaleAssociated: boolean
}
/** 单个/批量删除商品提示 */
export const EditSkuSaleTip = forwardRef<
  EditSkuSaleTipRef,
  EditSkuSaleTipProps
>((props, ref) => {
  const { text = t('这些商品'), count, isSale, isSingle } = props

  const [isSaleAssociated, setIsSaleAssociated] = useState<boolean>(false)

  useImperativeHandle(ref, () => ({
    isSaleAssociated,
  }))

  const onChange = (e: any) => {
    setIsSaleAssociated(e.target.checked)
  }

  return (
    <>
      {!!count && getSelectItemCount(count)}
      <span>{t(`您确定要${isSale ? '启售' : '停售'}`)}</span>
      <span style={{ fontWeight: 600 }}>{t(`${text}`)}</span>
      <span>{t('吗？')}</span>
      {!globalStore.isLite && (
        <>
          {!isSale && (
            <div style={deleteStyle}>
              {t('注意：停售后无法在报价单中出售对应商品')}
            </div>
          )}
          {isSingle && !isSale && (
            <Checkbox
              className='tw-mt-5'
              checked={isSaleAssociated}
              onChange={onChange}
            >
              {t('将所关联的组合商品同时停售')}
            </Checkbox>
          )}
        </>
      )}
    </>
  )
})

// ------------------------ 分类管理删除 --------------------------

interface DeleteTreeNodeTipProps {
  /** 当前当前节点名称 */
  text: string
}
export const DeleteTreeNodeTip = (props: DeleteTreeNodeTipProps) => {
  const { text = t('该分类') } = props
  return (
    <>
      {t(`确定要删除`)}
      <span style={{ fontWeight: 600 }}>{t(`${text}`)}</span>？
      <div style={deleteStyle}>
        <>
          {t('注意：')}
          <br />
          {t('1、分类下存在商品时无法被删除；')}
          <br />
          {t('2、删除分类时将同时删除该分类的所有子分类。')}
        </>
      </div>
    </>
  )
}
