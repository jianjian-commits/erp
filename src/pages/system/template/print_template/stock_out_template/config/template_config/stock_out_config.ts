import { t } from 'gm-i18n'

export default {
  name: '',
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
    style: { height: '150px' },
    blocks: [
      {
        text: t('{{单据}}'),
        style: {
          right: '0px',
          left: '0px',
          position: 'absolute',
          top: '10px',
          fontWeight: 'bold',
          fontSize: '26px',
          textAlign: 'center',
        },
      },
      {
        text: t('出库时间： {{出库时间}}'),
        style: {
          left: '2px',
          position: 'absolute',
          top: '62px',
        },
      },
      {
        text: t('单据编号：{{单据编号}}'),
        style: {
          left: '430px',
          position: 'absolute',
          top: '62px',
        },
      },
      {
        text: t('商户名称：{{商户名称}}'),
        style: {
          left: '2px',
          position: 'absolute',
          top: '127px',
        },
      },
      {
        text: t('单据备注：{{单据备注}}'),
        style: {
          left: '2px',
          position: 'absolute',
          top: '93px',
        },
      },
    ],
  },
  contents: [
    {
      className: '',
      type: 'table',
      dataKey: 'orders',
      subtotal: {},
      specialConfig: { style: {} },
      columns: [
        {
          head: t('序号'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.序号}}'),
        },
        {
          head: t('商品名称'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.商品名称}}'),
        },
        // {
        //   head: t('规格名称'),
        //   headStyle: {
        //     textAlign: 'center',
        //   },
        //   style: {
        //     textAlign: 'center',
        //   },
        //   text: t('{{列.规格名称}}'),
        // },
        {
          head: t('商品分类'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.商品分类}}'),
        },
        {
          head: t('出库数(基本单位)'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.出库数_基本单位}}'),
        },
        {
          head: t('基本单位'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.基本单位}}'),
        },
        {
          head: t('出库单价(基本单位)'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.出库单价_基本单位}}'),
        },
        {
          head: t('出库成本'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.出库成本}}'),
        },
      ],
    },
    {
      blocks: [
        {
          text: t('成本金额: ￥{{成本金额}}'),
          style: { position: 'absolute', right: '2px', top: '12px' },
        },
      ],
      style: { height: '56px' },
    },
  ],
  sign: {
    blocks: [],
    style: {},
  },
  footer: {
    blocks: [
      {
        text: t('页码： {{当前页码}} / {{页码总数}}'),
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
