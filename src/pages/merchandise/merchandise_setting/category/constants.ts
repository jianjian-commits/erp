import { t } from 'gm-i18n'

/** 创建子节点的文案 */
export const createLevelMap = {
  0: t('/'),
  1: t('二'),
  2: t('三'),
  3: t('四'),
  4: t('五'),
}

/**
 * 编辑子节点时，节点文案，编辑当前节点
 */
export const editLevelMap = {
  0: t('/'),
  1: t('一'),
  2: t('二'),
  3: t('三'),
  4: t('四'),
  5: t('五'),
}

/** 可以创建子节点的层级 */
export const hasCreateLevelList = [1, 2]

/** 轻巧版可以创建子节点的层级 */
export const hasCreateLevelListForLite = [1]
