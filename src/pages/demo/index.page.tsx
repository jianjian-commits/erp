import React from 'react'
import SvgSuccess from './svg/success.svg'
import { observer } from 'mobx-react'
import demoStore from './store'
import { gmHistory } from '@gm-common/router'
import { useHistory } from 'react-router'
import globalStore from '@/stores/global'
import { Button, RightSideModal } from '@gm-pc/react'

const MobxExample = observer(() => {
  return (
    <div>
      mobx
      {demoStore.name}
      <button
        onClick={() => {
          demoStore.setName('erp')
        }}
      >
        setName erp
      </button>
      <div>{globalStore.getUnitName('200000')}</div>
      <div className='tw-bg-red-100'>tailwind</div>
    </div>
  )
})

const Demo = () => {
  const usehistory = useHistory()

  const renderModal = () => {
    RightSideModal.render({
      title: '1111',
      onHide: RightSideModal.hide,
      children: <span>233333</span>,
    })
  }

  return (
    <div>
      demo
      <p>{`is same history? ${usehistory === gmHistory}`}</p>
      <MobxExample />
      <SvgSuccess />
      <Button onClick={renderModal}>22222</Button>
    </div>
  )
}

export default Demo
