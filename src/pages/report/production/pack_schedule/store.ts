import { observable, action, makeAutoObservable } from 'mobx';
import _ from 'lodash'
import moment from 'moment'
import { PackScheduleData } from './interface'
interface FilterParam {
  begin: string
  end: string
}
interface Filter {
  begin: Date
  end: Date
  [key: string]: any
}

interface RankData {
  name: string
  total_count: number
  percentage: number
}

class Store {
  filter: Filter = {
    begin: moment().startOf('day').toDate(),
    end: moment().endOf('day').toDate(),
  };

  // 投屏 搜素条件存入缓存中
  storageFilter: FilterParam = {
    begin: moment().startOf('day').format('YYYY-MM-DD hh:mm:ss'),
    end: moment().startOf('day').format('YYYY-MM-DD hh:mm:ss'),
  };

  // 计划进度 | 工序进度
  plan_schedule_data: PackScheduleData = {
    plan_schedule: {
      total_plan_count: 20, // 总计划数
      finished_plan_count: 10, // 已完成计划数
      released_plan_count: 5, // 已下达计划数
      unreleased_plan_count: 5, // 未下达计划数
    },
    process_schedule: {
      total_task_count: 50, // 总任务数
      finished_task_count: 20, // 已完成任务数
      released_task_count: 20, // 已下达任务数
      unreleased_task_count: 10, // 未下达任务数
    },
  };

  // 小组工序生产进度排行榜
  rank_data: Array<RankData> = [
    {
      name: '一号车间',
      total_count: 100,
      percentage: 50,
    },
    {
      name: '二号车间',
      total_count: 100,
      percentage: 60,
    },
    {
      name: '三号车间',
      total_count: 100,
      percentage: 70,
    },
    {
      name: '四号车间',
      total_count: 100,
      percentage: 50,
    },
    {
      name: '五号车间',
      total_count: 100,
      percentage: 60,
    },
    {
      name: '六号车间',
      total_count: 100,
      percentage: 70,
    },
    {
      name: '七号车间',
      total_count: 100,
      percentage: 60,
    },
    {
      name: '八号车间',
      total_count: 100,
      percentage: 70,
    },
  ];

  // 商品生产进度
  goodsData: Array<RankData> = [];

  // 是否投屏
  isFullScreen: boolean = false;

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true });
  }

  setFullScreen(value: boolean) {
    this.isFullScreen = value
  }

  updateFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }
}

export default new Store()
