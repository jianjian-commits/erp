export default {
  name: '配送装车清单',
  page: {
    type: 'A4',
    name: 'A4',
    printDirection: 'vertical',
    size: {
      width: '210mm',
      height: '297mm',
    },
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
        text: '配送装车清单',
        style: {
          position: 'absolute',
          left: '0px',
          top: '0px',
          right: '0px',
          textAlign: 'center',
          fontSize: '26px',
          fontWeight: 'bold',
        },
      },
      {
        text: '司机名称: {{司机名称}}',
        style: {
          position: 'absolute',
          left: '4px',
          top: '39px',
        },
      },
      {
        text: '车牌号码：{{车牌号码}}',
        style: {
          position: 'absolute',
          left: '154px',
          top: '39px',
        },
      },
      {
        text: '打印时间：{{打印时间}}',
        style: {
          position: 'absolute',
          left: '',
          top: '39px',
          right: '11px',
        },
      },
      {
        text: '司机电话：{{司机电话}}',
        style: {
          position: 'absolute',
          left: '',
          top: '39px',
          right: '297px',
        },
      },
    ],
    style: {
      height: '62px',
    },
  },
  contents: [
    {
      style: {
        height: 'auto',
      },
      blocks: [
        {
          style: {},
          type: 'counter',
          value: ['len', 'quantity'],
        },
      ],
    },
    {
      type: 'table',
      dataKey: 'driver_sku',
      subtotal: {
        show: false,
      },
      specialConfig: {
        style: {
          fontSize: '16px',
        },
      },
      columns: [
        {
          head: '商品名称',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.商品名称}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '规格',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.规格}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '下单数(包装单位)',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.下单数}}{{列.包装单位}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '分类',
          headStyle: {
            textAlign: 'center',
          },
          text: '{{列.分类}}',
          style: {
            textAlign: 'center',
          },
        },
        {
          head: '明细',
          headStyle: {
            textAlign: 'left',
          },
          text: '{{列.明细}}',
          style: {
            textAlign: 'left',
          },
        },
      ],
      className: '',
    },
  ],
  sign: {
    blocks: [],
    style: {
      height: '0',
    },
  },
  footer: {
    blocks: [
      {
        text: '页码： {{当前页码}} / {{页码总数}}',
        style: {
          position: 'absolute',
          left: '',
          top: '-0.15625px',
          right: '0px',
        },
      },
    ],
    style: {
      height: '15px',
    },
  },
}
