import { t } from 'gm-i18n'

export default {
  productionMergeType: '1',
  name: '',
  showBarCodeText: true,
  tableRowSpanTdArr: [
    [],
    [
      '{{列.序号}}',
      '{{列.物料分类}}',
      '{{列.物料名称}}',
      '{{列.物料类型}}',
      '{{列.需求数_基本单位}}',
      '{{列.需求数_生产单位}}',
      '{{列.原料明细}}',
    ],
  ],
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
    style: { height: '100px' },
    blocks: [
      {
        text: t('{{领料单}}'),
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
        text: t('物料数量：{{物料数量}}'),
        style: {
          left: '2px',
          position: 'absolute',
          top: '62px',
        },
      },
      {
        text: t('交期时间：{{交期时间}}'),
        style: {
          left: '240px',
          position: 'absolute',
          top: '62px',
        },
      },
    ],
  },
  contents: [
    {
      className: '',
      type: 'table',
      dataKey: '1',
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
          rowSpan: 'rowSpan',
          noRemove: 'noRemove',
        },
        {
          head: t('物料名称'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.物料名称}}'),
        },
        {
          head: t('物料分类'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.物料分类}}'),
        },
        {
          head: t('物料类型'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.物料类型}}'),
        },
        {
          head: t('需求数（基本单位）'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.需求数_基本单位}}'),
        },
        {
          head: t('需求数（生产单位）'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.需求数_生产单位}}'),
        },
        {
          head: t('菜品明细'),
          headStyle: {
            textAlign: 'center',
          },
          style: {
            textAlign: 'center',
          },
          text: t('{{列.菜品明细}}'),
        },
      ],
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
      height: '20px',
    },
  },
}
