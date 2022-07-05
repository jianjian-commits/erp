export default {
  name: '',
  page: {
    name: 'A4',
    size: { width: '210mm', height: '297mm' },
    printDirection: 'vertical',
    type: 'A4',
    gap: {
      paddingRight: '5mm',
      paddingLeft: '5mm',
      paddingBottom: '5mm',
      paddingTop: '5mm',
    },
  },
  header: {},
  contents: [
    {
      style: { height: '160px' },
      blocks: [
        {
          text: '{{客户名}}',
          style: {
            right: '0px',
            left: '0px',
            position: 'absolute',
            top: '5px',
            fontWeight: 'bold',
            fontSize: '26px',
            textAlign: 'center',
          },
        },
        {
          text: '对账单',
          style: {
            right: '0px',
            left: '0px',
            position: 'absolute',
            top: '40px',
            fontWeight: 'bold',
            fontSize: '26px',
            textAlign: 'center',
          },
        },
        {
          text: '打印时间：{{打印时间}}',
          style: { left: '2px', position: 'absolute', top: '86px' },
        },
        {
          text: '账单周期：{{账单周期}}',
          style: { left: '300px', position: 'absolute', top: '86px' },
        },
        {
          text: '公司名：{{公司名}}',
          style: { left: '2px', position: 'absolute', top: '112px' },
        },
        {
          text: '客户名：{{客户名}}',
          style: { left: '300px', position: 'absolute', top: '112px' },
        },
        {
          text: '客户地址：{{客户地址}}',
          style: { left: '2px', position: 'absolute', top: '138px' },
        },
      ],
    },
    {
      blocks: [
        {
          text: '账单明细：',
          style: { left: '2px', position: 'absolute', top: '5px' },
        },
      ],
      style: { height: '26px', fontWeight: 'bold' },
    },
    {
      className: '',
      type: 'table',
      dataKey: 'orders',
      subtotal: { show: false },
      specialConfig: { style: {} },
      columns: [
        {
          head: '订单号',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.订单号}}',
        },
        {
          head: '下单时间',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.下单时间}}',
        },
        {
          head: '收货时间',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.收货时间}}',
        },
        {
          head: '业务类型',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.业务类型}}',
        },
        {
          head: '订单类型',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.订单类型}}',
        },
        {
          head: '支付状态',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.支付状态}}',
        },
        {
          head: '下单金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.下单金额}}',
        },
        {
          head: '出库金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.出库金额}}',
        },
        {
          head: '应付金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.应付金额}}',
        },
        {
          head: '已付金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.已付金额}}',
        },
        {
          head: '未付金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.未付金额}}',
        },
        {
          head: '售后金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.售后金额}}',
        },
      ],
    },
    {
      blocks: [
        {
          text: '下单金额：¥{{下单金额}}',
          style: { position: 'absolute', left: '2px', top: '10px' },
        },
        {
          text: '已付金额：¥{{已付金额}}',
          style: { position: 'absolute', left: '300px', top: '10px' },
        },
        {
          text: '售后金额：¥{{售后金额}}',
          style: { position: 'absolute', left: '520px', top: '10px' },
        },
      ],
      style: { height: '40px' },
    },
    {
      blocks: [
        {
          text: '订单类型：',
          style: { left: '2px', position: 'absolute', top: '5px' },
        },
      ],
      style: { height: '26px', fontWeight: 'bold' },
    },
    {
      className: '',
      type: 'table',
      dataKey: 'orderType',
      subtotal: { show: false },
      specialConfig: { style: {} },
      columns: [
        {
          head: '下单日期（按天）',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.下单日期_按天}}',
        },
        {
          head: '下单金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.下单金额}}',
        },
        {
          head: '出库金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.出库金额}}',
        },
      ],
    },
    { blocks: [], style: { height: '28px' } },
    {
      blocks: [
        {
          text: '订单明细：',
          style: {
            position: 'absolute',
            left: '2px',
            top: '5px',
            fontWeight: 'bold',
          },
        },
      ],
      style: { height: '26px' },
    },
    {
      type: 'table',
      className: '',
      specialConfig: { style: {} },
      dataKey: 'skus',
      subtotal: { show: false },
      columns: [
        {
          head: '订单号',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.订单号}}',
        },
        {
          head: '下单时间',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.下单时间}}',
        },
        {
          head: '收货时间',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.收货时间}}',
        },
        {
          head: '业务类型',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.业务类型}}',
        },
        {
          head: '订单类型',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.订单类型}}',
        },
        {
          head: '商品名',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.商品名}}',
        },
        {
          head: '商品分类',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.商品分类}}',
        },
        {
          head: '下单单位',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.下单单位}}',
        },
        {
          head: '下单数',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.下单数}}',
        },
        {
          head: '出库数',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.出库数}}',
        },
        {
          head: '商品单价',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.商品单价}}',
        },
        {
          head: '定价单位',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.定价单位}}',
        },
        {
          head: '下单金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.下单金额}}',
        },
        {
          head: '出库金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.出库金额}}',
        },
      ],
    },
    { blocks: [], style: { height: '20px' } },
    {
      blocks: [
        {
          text: '商品汇总：',
          style: {
            position: 'absolute',
            left: '2px',
            top: '5px',
            fontWeight: 'bold',
          },
        },
      ],
      style: { height: '28px' },
    },
    {
      type: 'table',
      className: '',
      specialConfig: { style: {} },
      dataKey: 'product',
      subtotal: { show: false },
      columns: [
        {
          head: '商品名',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.商品名}}',
        },
        {
          head: '商品分类',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.商品分类}}',
        },
        {
          head: '下单单位',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.下单单位}}',
        },
        {
          head: '下单数',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.下单数}}',
        },
        {
          head: '出库数',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.出库数}}',
        },
        {
          head: '商品单价（均值）',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.商品单价_均值}}',
        },
        {
          head: '下单金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.下单金额}}',
        },
        {
          head: '出库金额',
          headStyle: { textAlign: 'center' },
          style: { textAlign: 'center' },
          text: '{{列.出库金额}}',
        },
      ],
    },
  ],
  sign: { blocks: [], style: { height: '46px' } },
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
    style: { height: '15px' },
  },
}
