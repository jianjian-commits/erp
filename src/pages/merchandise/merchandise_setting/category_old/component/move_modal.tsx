import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import {
  Button,
  Form,
  FormButton,
  FormItem,
  LevelSelect,
  Modal,
  Validator,
} from '@gm-pc/react'
import { moveModalOptions } from '../../../manage/interface'

const MoveModal: FC<moveModalOptions> = ({ data, onMove }) => {
  const [selected, changeSelected] = useState([])

  const handleOk = () => {
    const [category_id_1, category_id_2, pinlei_id] = selected
    onMove({ category_id_1, category_id_2, pinlei_id })
  }

  const handleCancel = (): void => {
    Modal.hide()
  }

  const validateSelect = (value: string) => {
    let result = ''
    switch (value.length) {
      case 0:
        result = t('请选择转移分类库')
        break
      case 1:
        result = t('请选择二级分类和品类')
        break
      case 2:
        result = t('请选择品类')
        break
    }
    return result
  }

  return (
    <Form
      horizontal
      style={{ height: '300px', position: 'relative' }}
      onSubmitValidated={handleOk}
    >
      <FormItem
        label={t('转移分类库：')}
        required
        validate={Validator.create(
          [Validator.TYPE.required],
          selected,
          validateSelect,
        )}
      >
        <LevelSelect
          selected={selected}
          data={data}
          onSelect={changeSelected}
          titles={[t('一级分类'), t('二级分类'), t('品类')]}
        />
      </FormItem>
      <FormButton>
        <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
          <Button onClick={handleCancel}>{t('取消')}</Button>
          <div className='gm-gap-10' />
          <Button type='primary' htmlType='submit'>
            {t('保存')}
          </Button>
        </div>
      </FormButton>
    </Form>
  )
}
export default MoveModal
