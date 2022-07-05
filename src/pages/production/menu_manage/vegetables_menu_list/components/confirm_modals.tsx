import React from 'react'
import { t } from 'gm-i18n'

/** 获取条目的样式 */
export const getSelectItemCount = (count?: number | undefined) => {
  return (
    <span style={{ fontWeight: 600, marginRight: 8 }}>
      {t('已选条目')}：{count || t('所有')}
    </span>
  )
}

const deleteStyle = { color: '#E04B20', marginTop: '4px', fontSize: '14px' }

interface DeleteMenuTipProps {
  /** 当前删除的报价单名称，text不传表示批量 默认这些报价单 */
  text?: string
  /** 已选条目数量，批量时传 */
  count: number
}

/**
 * 单个/批量删除报价单的提示
 */
export const DeleteMenuTip = (props: DeleteMenuTipProps) => {
  const { text = t('这些菜谱'), count } = props
  return (
    <>
      {!!count && getSelectItemCount(count)}

      <span>{t('您确定要删除')}</span>
      <span style={{ fontWeight: 600 }}>{t(`${text}`)}</span>
      <span>{t('吗？')}</span>
      <div style={deleteStyle}>
        {t(
          '注意：删除菜谱后，与删除菜谱关联的客户无法正常下单，请尽快为客户绑定新的菜谱。',
        )}
      </div>
    </>
  )
}
