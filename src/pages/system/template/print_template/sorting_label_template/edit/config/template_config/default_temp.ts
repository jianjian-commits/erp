export default {
  default: {
    page: {
      type: '70X50',
      customizeWidth: '',
      customizeHeight: '',
    },
    blocks: [
      {
        text: '打印时间:{{当前时间_年月日}}',
        fieldKey: '打印时间',
        style: {
          position: 'absolute',
          left: '15px',
          top: '77px',
        },
      },
      {
        text: '联系电话：点击编辑联系电话',
        style: {
          position: 'absolute',
          fontSize: '14px',
          left: '16px',
          top: '157px',
        },
      },
    ],
  },
}
