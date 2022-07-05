import { t } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  Transfer,
  RightSideModal,
  Confirm,
  Button,
  Tip,
} from '@gm-pc/react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import TableListTips from '@/common/components/table_list_tips'
import store from '../store'

interface RouteConfigProps {
  routeId: string
  index: number
  onUpdateList: () => void
}

const RouteConfigModal = observer(
  class RouteConfigModal extends React.Component<RouteConfigProps> {
    componentDidMount() {
      store.getRoute(this.props.routeId)
    }

    _handleSelect = (selectedValues: string[]) => {
      store.handleCustomerSelected(selectedValues)
    }

    _handleSubmit = () => {
      Confirm({
        children: t(
          '如商户已经进入分拣流程，修改商户的线路可能会引起分拣流程出现序号与所属路线不一致的情况，请确定是否修改？',
        ),
        title: t('提示'),
      })
        .then(() => {
          return store.updateRoute(this.props.index)
        })
        .then((result) => {
          if (result.code === 0) {
            this.props.onUpdateList()
            RightSideModal.hide()
            Tip.success(t('修改成功'))
          }
          return null
        })
    }

    render() {
      const { customerSelected, customer_config_data } = store
      return (
        <div className='gm-padding-lr-15'>
          <div className='gm-text-black gm-text-14 gm-padding-tb-10'>
            {t('商户配置')}
          </div>
          <Flex justifyBetween alignCenter>
            <TableListTips
              tips={[
                t('若将商户从此线路移除，该商户将没有线路。'),
                t('商户信息：商户名-商户标签（线路名）'),
              ]}
            />
            <Button type='primary' onClick={this._handleSubmit}>
              {t('确定')}
            </Button>
          </Flex>
          <hr />
          <Transfer
            list={toJS(customer_config_data)}
            selectedValues={customerSelected}
            onSelectValues={(selected) => {
              this._handleSelect(selected)
            }}
          />
        </div>
      )
    }
  },
)

export default RouteConfigModal
