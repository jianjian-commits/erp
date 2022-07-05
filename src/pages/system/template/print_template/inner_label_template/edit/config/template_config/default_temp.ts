export default {
  default: {
    page: {
      type: '70X50',
      customizeWidth: '',
      customizeHeight: '',
    },
    blocks: [
      {
        text: '商品名:{{SKU}}',
        fieldKey: '商品名',
        style: {
          position: 'absolute',
          left: '62px',
          top: '5px',
          fontSize: '22px',
          fontWeight: 'bold',
        },
      },
      {
        text: '产品组成:{{产品组成}}',
        fieldKey: '产品组成',
        style: {
          position: 'absolute',
          left: '14px',
          top: '35px',
        },
      },
      {
        text: '打印时间:{{当前时间_年月日}}',
        fieldKey: '打印时间',
        style: {
          position: 'absolute',
          left: '14px',
          top: '93px',
        },
      },
      {
        text: '商户名:{{商户名}}',
        fieldKey: '商户名',
        style: {
          position: 'absolute',
          left: '14px',
          top: '71px',
        },
      },
      {
        text: '保质期:{{保质期}}',
        fieldKey: '保质期',
        style: {
          position: 'absolute',
          left: '173px',
          top: '93px',
        },
      },
      {
        text: '生产商：点击编辑具体名称',
        style: {
          position: 'absolute',
          fontSize: '14px',
          left: '14px',
          top: '119px',
        },
      },
      {
        text: '产地：点击编辑具体产地信息',
        style: {
          position: 'absolute',
          fontSize: '14px',
          left: '14px',
          top: '144px',
        },
      },
      {
        text: '联系电话：点击编辑联系电话',
        style: {
          position: 'absolute',
          fontSize: '14px',
          left: '14px',
          top: '166px',
        },
      },
    ],
  },
}
