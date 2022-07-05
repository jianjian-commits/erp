import { ListDataItem } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Filters_Bool } from 'gm_api/src/common'

export const PRINT_MEAN: Record<Filters_Bool, string> = {
  [Filters_Bool.ALL]: '-',
  [Filters_Bool.FALSE]: t('否'),
  [Filters_Bool.TRUE]: t('是'),
}

export const PRINT_OPTIONS: ListDataItem<Filters_Bool>[] = [
  {
    value: Filters_Bool.TRUE,
    text: PRINT_MEAN[Filters_Bool.TRUE],
  },
  {
    value: Filters_Bool.FALSE,
    text: PRINT_MEAN[Filters_Bool.FALSE],
  },
]
