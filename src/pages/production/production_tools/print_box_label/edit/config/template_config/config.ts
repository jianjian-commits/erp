export default {
  name: '',
  page: {
    type: 'DIY',
    customizeWidth: '',
    customizeHeight: '',
    size: { width: '70mm', height: '40mm' },
    printDirection: 'vertical',
    gap: {
      paddingTop: '0mm',
      paddingLeft: '0mm',
      paddingRight: '0mm',
      paddingBottom: '0mm',
    },
  },
  header: { style: { height: '0px' }, blocks: [] },
  sign: { style: { height: '0px' }, blocks: [] },
  footer: {
    style: { height: '0px' },
    blocks: [],
  },
  contents: [
    {
      style: { height: '100px' },
      className: '',
      blocks: [
        {
          text: '打印:{{当前时间_年月日}}',
          style: {
            position: 'absolute',
            left: '15px',
            top: '2px',
            fontSize: '10px',
          },
        },
        {
          text: '班级名称:{{班级名称}}',
          style: {
            position: 'absolute',
            left: '15px',
            top: '54px',
          },
        },
        {
          text: '商品描述:{{商品描述}}',
          style: {
            position: 'absolute',
            left: '15px',
            top: '82px',
          },
        },
        {
          text: '学校名称:{{学校名称}}',
          fieldKey: '学校名称',
          style: {
            position: 'absolute',
            left: '15px',
            top: '27px',
          },
        },
        {
          text: '单箱重量:{{单箱重量}}',
          fieldKey: '单箱重量',
          style: {
            position: 'absolute',
            right: '15px',
            top: '27px',
          },
        },
        {
          text: '单箱数量:{{单箱数量}}',
          fieldKey: '单箱数量',
          style: {
            position: 'absolute',
            right: '15px',
            top: '54px',
          },
        },
      ],
    },
  ],
}
