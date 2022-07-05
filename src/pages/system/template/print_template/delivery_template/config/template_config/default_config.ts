import globalStore from '@/stores/global'
import { Price } from '@gm-pc/react'

export default {
  name: '',
  templateType: '商户配送单',
  page: {
    name: 'A4',
    size: {
      width: '210mm',
      height: '297mm',
    },
    printDirection: 'vertical',
    type: 'A4',
    gap: {
      paddingRight: '5mm',
      paddingLeft: '5mm',
      paddingBottom: '5mm',
      paddingTop: '5mm',
    },
  },
  header: {
    blocks: [
      {
        text: '配送单',
        type: 'rise',
        style: {
          right: '0px',
          left: '0px',
          position: 'absolute',
          top: '0px',
          fontWeight: 'bold',
          fontSize: '26px',
          textAlign: 'center',
        },
      },
      {
        text: '订单号: {{订单号}}',
        style: {
          left: '2px',
          position: 'absolute',
          top: '50px',
        },
      },
      {
        text: '打印时间：{{当前时间}}',
        style: {
          right: '',
          left: '450px',
          position: 'absolute',
          top: '76px',
        },
      },
      {
        text: '分拣序号：{{分拣序号}}',
        style: {
          right: '',
          left: '450px',
          position: 'absolute',
          top: '50px',
        },
      },
      {
        text: '下单时间：{{下单时间}}',
        style: {
          left: '2px',
          position: 'absolute',
          top: '76px',
        },
      },
    ],
    style: {
      height: '97px',
    },
  },
  contents: [
    {
      blocks: [
        {
          text: '收货商户: {{收货商户}}({{商户ID}})',
          style: {
            left: '2px',
            position: 'absolute',
            top: '5px',
          },
        },
        {
          text: '收货人: {{收货人}}',
          style: {
            right: '',
            left: '450px',
            position: 'absolute',
            top: '6px',
          },
        },
        {
          text: '收货人电话: {{收货人电话}}',
          style: {
            left: '2px',
            position: 'absolute',
            top: '30px',
          },
        },
        {
          text: '收货地址: {{收货地址}}',
          style: {
            right: '',
            left: '450px',
            position: 'absolute',
            top: '30px',
          },
        },
        {
          text: '订单备注: {{订单备注}}',
          style: {
            left: '2px',
            position: 'absolute',
            top: '55px',
          },
        },
      ],
      style: {
        height: '78px',
      },
    },

    {
      blocks: [
        {
          type: 'counter',
          style: {},
        },
      ],
      style: {
        height: 'auto',
      },
    },
    {
      className: '',
      type: 'table',
      dataKey: 'orders',
      subtotal: {
        show: false,
      },
      columns: [
        {
          head: '序号',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.序号}}',
        },
        {
          head: '类别',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.类别}}',
        },
        {
          head: '商品名',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.商品名}}',
        },
        {
          head: '下单单位',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: `{{列.下单单位}}`,
        },
        {
          head: '下单数',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: `{{列.下单数}}{{列.下单单位}}`,
        },
        // !globalStore.isLite && {
        //   head: '出库数(基本单位)',
        //   headStyle: {
        //     textAlign: 'center',
        //   },
        //   style: {
        //     textAlign: 'center',
        //   },
        //   text: '{{列.出库数_基本单位}}',
        // },
        {
          head: '出库数',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: globalStore.isLite
            ? '{{列.出库数}}{{列.出库单位}}'
            : '{{列.出库数}}{{列.出库单位}} {{列.辅助单位出库数}}{{列.辅助出库单位}}',
        },
        {
          head: '单价',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: `{{列.单价}}${Price.getUnit()}/{{列.定价单位}}`,
        },
        // {
        //   head: '单价(基本单位)',
        //   headStyle: {
        //     textAlign: 'center',
        //   },
        //   style: {
        //     textAlign: 'center',
        //   },
        //   text: '{{列.单价_基本单位}}',
        // },
        !globalStore.isLite && {
          head: '出库金额',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.出库金额}}',
        },
        {
          head: '商品销售额',
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: '{{列.商品销售额}}',
        },
      ].filter(Boolean),
    },
    {
      blocks: [],
      style: {
        height: '15px',
      },
    },
    {
      blocks: [
        {
          text: '下单金额：￥{{下单金额}}',
          style: {
            left: '1px',
            position: 'absolute',
            top: '10px',
          },
        },
        !globalStore.isLite && {
          text: '出库金额：￥{{出库金额}}',
          style: {
            left: '162px',
            position: 'absolute',
            top: '10px',
          },
        },
        {
          text: '运费：￥{{运费}}',
          style: {
            left: '309px',
            position: 'absolute',
            top: '10px',
          },
        },
      ],
      style: {
        height: '69px',
      },
    },
  ],
  sign: {
    blocks: [
      {
        text: '签收人：',
        style: {
          left: '600px',
          position: 'absolute',
          top: '5px',
        },
      },
    ],
    style: {
      height: '46px',
    },
  },
  footer: {
    blocks: [
      {
        text: '页码： {{当前页码}} / {{页码总数}}',
        style: {
          right: '',
          left: '48%',
          position: 'absolute',
          top: '0px',
        },
      },
    ],
    style: {
      height: '15px',
    },
  },
}
