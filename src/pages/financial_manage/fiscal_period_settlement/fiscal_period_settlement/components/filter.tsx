import {
  BoxForm,
  Button,
  FormBlock,
  FormButton,
  FormItem,
  Input,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import React, { ChangeEvent, FC } from 'react'
import store from '../store'

interface Props {
  onSearch: () => any
}

const Filter: FC<Props> = observer((props) => {
  const { onSearch } = props

  const {
    filter: { name },
  } = store

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    store.handlepdateName('name', e.target.value)
  }

  return (
    <BoxForm colWidth='385px' onSubmit={onSearch}>
      <FormBlock col={3}>
        <FormItem label={t('按账期名称查询')}>
          <Observer>
            {() => {
              return (
                <Input
                  value={name}
                  onChange={handleChangeName}
                  placeholder={t('账期名称')}
                  type='text'
                />
              )
            }}
          </Observer>
        </FormItem>
      </FormBlock>
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
      </FormButton>
    </BoxForm>
  )
})
export default Filter
