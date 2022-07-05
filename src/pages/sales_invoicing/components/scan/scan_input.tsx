import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { Form, Tip, Input, Button } from '@gm-pc/react'
import _ from 'lodash'

interface Props {
  onSearch: (value: string, afterFunc: () => void) => void // 由于不确定什么时候结束操作，给个回调吧
}

const ScanInput: FC<Props> = (props) => {
  const [state, setState] = useState({ barcode: '', inSearch: false })
  let tip: string | null = null

  const afterFunc = () => {
    setState({ inSearch: false, barcode: '' })
    tip = null
    // Drawer.hide()
  }

  const handleSearchByBarcode = () => {
    const { barcode } = state

    if (!barcode) {
      return Tip.danger(t('条码内容不能为空'))
    }

    setState({ ...state, inSearch: true })

    props.onSearch(barcode, afterFunc)

    return null
  }

  const handleChangeBarcode = (
    val: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = val.target ? val.target.value : val
    if (tip) {
      // 因为扫码枪是一个个字符返回的，所以这里只需要提醒一次就好
      return
    }

    if (state.inSearch) {
      tip = Tip.danger(t('当前扫码任务执行中，请稍后再试'))
      return
    }

    setState({
      ...state,
      barcode: value,
    })
  }

  return (
    <Form inline onSubmit={handleSearchByBarcode} className='gm-padding-5'>
      <Input
        // maxLength={13}
        value={state.barcode}
        className='form-control input-sm'
        name='barcode'
        autoFocus
        autoComplete='off'
        style={{ width: '200px' }}
        placeholder={t('请扫描条码搜索')}
        onChange={handleChangeBarcode}
      />

      <Button type='primary' htmlType='submit'>
        {t('搜索')}
      </Button>
    </Form>
  )
}

export default ScanInput
