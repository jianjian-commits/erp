import { t } from 'gm-i18n'
import React from 'react'
import { Observer, observer } from 'mobx-react'
import store from '../store'
import { Price, Tip, Dialog, Flex, Input } from '@gm-pc/react'
import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import ViewOrderNo from '../../../../components/view_order_no'
import { Customer_Type } from 'gm_api/src/enterprise'
import SVGDelete from '@/svg/delete.svg'
import { Order_State } from 'gm_api/src/order/index'

const DetailHeader = observer(() => {
  const {
    detail: {
      order_price,
      serial_no,
      state,
      student_name_text,
      staff_name_text,
      receive_time_text,
      school_text,
      class_text,
      order_time_text,
      menu_period_group_id_text,
      update_time_text,
      update_id_text,
    },
    customer_type,
  } = store
  const isStudent = customer_type === Customer_Type.TYPE_VIRTUAL_STUDENT

  const handleDelete = () => {
    Dialog.render({
      title: t('删除订单'),
      buttons: [
        {
          text: t('取消'),
          onClick: Dialog.hide,
        },
        {
          text: t('确定'),
          onClick: () => {
            store.deleteOrder().then((json) => {
              Tip.success(t('订单删除成功'))
              Dialog.hide()
              setTimeout(() => window.close(), 1000)
              return json
            })
          },
          btnType: 'primary',
        },
      ],
      children: (
        <Flex column>
          <span>{t('确定要删除该订单吗？')}</span>
          <br />
          <Observer>
            {() => {
              const { remark } = store.detail
              return (
                <Input
                  value={remark}
                  onChange={(event) => store.changeRemark(event.target.value)}
                />
              )
            }}
          </Observer>
        </Flex>
      ),
    })
  }

  return (
    <ReceiptHeaderDetail
      contentLabelWidth={55}
      contentCol={4}
      customerContentColWidth={[350, 350, 350, 350]}
      totalData={[
        {
          text: t('下单金额'),
          value: <Price value={+order_price! || 0} />,
        },
      ]}
      HeaderInfo={[
        {
          label: t('订单号'),
          item: <ViewOrderNo serial_no={serial_no} state={state} />,
        },
        {
          label: isStudent ? t('学生') : t('职工'),
          item: <span>{isStudent ? student_name_text : staff_name_text}</span>,
        },
      ]}
      HeaderAction={
        state === Order_State.STATE_NOT_PRODUCE ? (
          <div
            className='gm-text-20 gm-bg-hover-focus-primary gm-cursor'
            onClick={handleDelete}
          >
            <SVGDelete />
          </div>
        ) : (
          ''
        )
      }
      ContentInfo={[
        {
          label: t('收货日期'),
          item: <span>{receive_time_text}</span>,
        },
        {
          label: t('学校'),
          item: <span>{school_text}</span>,
        },
        {
          label: t('班级'),
          item: <span>{class_text}</span>,
        },
        {
          label: t('下单日期'),
          item: <span>{order_time_text}</span>,
        },
        {
          label: t('餐次'),
          item: <span>{menu_period_group_id_text}</span>,
        },
        {
          label: t('最后操作'),
          item: <span>{update_id_text + '(' + update_time_text + ')'}</span>,
        },
      ]}
    />
  )
})

export default DetailHeader
