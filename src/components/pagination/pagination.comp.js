﻿import { Component, PropTypes } from 'react';
import {
  compileComponent,
  registerComponent,
  registerFilter
} from 'nornj';
import classNames from 'classnames';
import Widget from '../widget';
import utils from '../../utils/utils';
import tmpl from './pagination.tmpl';
const templateDataCount = compileComponent(tmpl.pageDataCount, 'pageDataCount');
const templatePageCount = compileComponent(tmpl.pageCount, 'pageCount');

//计算总页数
function getPageCount(count, pageSize) {
  return parseInt(count % pageSize > 0 ? count / pageSize + 1 : count / pageSize, 10);
}

//分页组件
class Pagination extends Widget {
  static defaultProps = {
    fjType: 'pagn',
    pageSize: 15,                           //每页数据数
    pageSizes: [15, 30, 50],                //可选择的每页数据数
    pageIndex: 1,                           //当前页码,从1开始
    pageCountPrefix: '共',
    pageCountSuffix: '页',
    count: 0,                               //数据总数
    countPrefix: '共',
    countSuffix: '条数据',
    sizePrefix: '每页',
    sizeSuffix: '条',
    btnGoName: '跳转',                      //跳转按钮上的字
    noCount: false,                         //为true则在无法获取数据总数时使用
    setPageSize: false,                     //是否可以设置每页数据数
    showCount: true,                        //是否显示数据总数
    showPageSize: true,                     //是否显示每页数据数
    showPageCount: true,                    //是否显示总页数
    showRefresh: true,
    hasPages: true,                         //是否显示页数链接
    hasBtnGo: true,
    emptyText: '没有数据',
    responsive: false,
    responsiveDelay: 70,
    responsiveOnlyWidth: true,
    defaultResponsiveParam: {               //默认响应式参数
      '(max-width: 480px)': {
        state: {
          showCount: false,
          showPageSize: false,
          hasPages: false,
          hasBtnGo: false
        }
      },
      '(min-width: 481px) and (max-width: 768px)': {
        state: {
          showCount: false,
          showPageSize: false,
          hasPages: true,
          hasBtnGo: true
        }
      },
      '(min-width: 769px)': {
        state: {
          showCount: true,
          showPageSize: true,
          hasPages: true,
          hasBtnGo: true
        }
      }
    }
  };

  template = compileComponent(tmpl.pagination, 'pagination');
  
  constructor(props) {
    super(props, {
      pageIndex: parseInt(props.pageIndex, 10),
      pageSize: parseInt(props.pageSize, 10)
    });
  }

  init() {
    this.state.pageCount = this.getPageCount()  //总页数
    super.init();

    this.pageSizeChange = this.pageSizeChange.bind(this);
    this.pageIndexBlur = this.pageIndexBlur.bind(this);
    this.setGoPage = this.setGoPage.bind(this);
    this.goPage = this.goPage.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentWillReceiveProps (nextProps) {
    let { pageIndex, count, pageSize } = this.props;
    pageIndex = parseInt(pageIndex, 10);
    pageSize = parseInt(pageSize, 10);
    count = parseInt(count, 10);

    let {
      pageIndex: indexN,
      count: countN,
      pageSize: pageSizeN } = nextProps;
    if(indexN != null) {
      indexN = parseInt(indexN, 10);
    }
    if(pageSizeN != null) {
      pageSizeN = parseInt(pageSizeN, 10);
    }
    if(countN != null) {
      countN = parseInt(countN, 10);
    }

    let newState = {},
      isSetState = false;

    if (indexN !== pageIndex) {
      isSetState = true;
      newState.pageIndex = indexN;
      this.setGoPage(indexN);
    }
    if (pageSizeN !== pageSize || countN !== count) {
      isSetState = true;
      newState.pageSize = pageSizeN != null ? pageSizeN : this.state.pageSize;
      newState.pageCount = this.getPageCount(newState.pageSize, countN);
    }

    if(isSetState) {
      this.setState(newState);
    }
  }

  componentWillMount () {
    //初始化时默认执行刷新
    this.refresh();
  }

  getPageCount(pageSize = this.state.pageSize, count = this.props.count) {
    return getPageCount(count, pageSize);
  }

  //切换每页数据数
  pageSizeChange(pageSize) {
    this.refresh(this.state.pageIndex, parseInt(pageSize, 10));
  }

  //页数文本框失去焦点
  pageIndexBlur(e) {
    if(!utils.RegExp.num.test(e.target.value.trim())) {
      e.target.value = 1;
    }
  }

  //设置跳转页码
  setGoPage(pageIndex) {
    if(this.refs.pageTxt) {
      this.refs.pageTxt.value = pageIndex;
    }
  }

  //刷新分页
  refresh(pageIndex = this.state.pageIndex, pageSize = this.state.pageSize) {
    let props = this.props,
      pageCount = this.getPageCount(pageSize);

    //如果当前页大于总页数,则设置总页数为当前页
    if(pageIndex > pageCount) {
      pageIndex = pageCount;
    }
    if(pageIndex < 1) {
      pageIndex = 1;
    }

    this.setGoPage(pageIndex);
    this.setState({
      pageIndex: pageIndex,
      pageSize: pageSize,
      pageCount: pageCount
    });

    if(props.onChange) {
      props.onChange(pageIndex, pageSize);
    }
  }

  //跳转页数
  goPage(e) {
    this.refresh(parseInt(this.refs.pageTxt.value, 10));
  }

  render() {
    let disabled = ' fj-disabled',
      state = this.state,
      props = this.props,
      extra = {
        pageSizeChange: this.pageSizeChange,
        pageIndexBlur: this.pageIndexBlur,
        goPage: this.goPage,
        refresh: this.refresh,
        firstDisabled: '',
        prevDisabled: '',
        nextDisabled: '',
        lastDisabled: ''
      };
    let { className } = props;

    //翻页按钮展示逻辑
    if (state.pageCount <= 1) {  //只有一页
      extra.firstDisabled = disabled;
      extra.prevDisabled = disabled;
      extra.nextDisabled = disabled;
      extra.lastDisabled = disabled;
    }
    else if (state.pageIndex == 1) {  //首页
      extra.firstDisabled = disabled;
      extra.prevDisabled = disabled;
    }
    else if (state.pageIndex == state.pageCount) {  //尾页
      extra.nextDisabled = disabled;
      extra.lastDisabled = disabled;
    }

    extra.classes = classNames({
      'fj-pagn': true,
      [className]: className
    });
    extra.wrap = c => this.wrap = c;

    return this.template(state, props, extra);
  }
}

registerComponent({ 'fj-Pagination': Pagination });

registerFilter({
  clickBtn: function(fn, type) {
    let { pageIndex, pageCount } = this.data[0];

    switch(type){
      case 'first':
        return () => {
          if(pageIndex != 1) {
            fn(1);
          }
        };
      case 'prev':
        return () => {
          if(pageIndex > 1) {
            fn(pageIndex - 1);
          }
        };
      case 'next':
        return () => {
          if(pageIndex < pageCount) {
            fn(pageIndex + 1);
          }
        };
      case 'last':
        return () => {
          if(pageIndex != pageCount) {
            fn(pageCount);
          }
        };
      case 'index':
        return () => {
          if(this.index != pageIndex) {
            fn(this.index);
          }
        };
      default:
        return () => fn();
    }
  },
  isCurrentPage: function(no) {
    return parseInt(no, 10) == this.data[0].pageIndex ? '-c' : '';
  },
  showPartPage: function(no, type) {
    let { pageCount } = this.data[0];
    switch(type){
      case '1':  //当前页码<=4:左侧显示所有+当前页码+右侧2个页码+...+尾页
        return no <= 4;
      case '2':  //当前页码>4,且<=页面总数(n)-3:首页+...+左侧2个页码+ 当前页码+右侧2个页码+...+尾页
        return no > 4 && no <= pageCount - 3;
      case '3':  //当前页码>页面总数(n)- 3:首页+...+左侧2个页面+当前页码+右侧显示所有
        return no > pageCount - 3;
    }
  }
});

//总页数组件
class PageCount extends Component {
  static defaultProps = {
    prefix: '共',
    suffix: '页'
  };

  render() {
    let {
      className,
      prefix,
      pageCount,
      count,
      pageSize,
      suffix, ...others } = this.props;
    
    const classes = classNames({
      'fj-pagn-part': true,
      [className]: className
    });
    
    //计算总页数
    if(count != null && pageSize != null) {
      pageCount = getPageCount(count, pageSize);
    }
    
    return templatePageCount({
      props: others,
      classes,
      prefix,
      pageCount,
      suffix,
      wrap: c => this.wrap = c
    });
  }
}

registerComponent({ 'fj-PageCount': PageCount });
Pagination.PageCount = PageCount;

//数据总数组件
class PageDataCount extends Component {
  static defaultProps = {
    prefix: '共',
    suffix: '条数据'
  };

  render() {
    const {
      className,
      prefix,
      count,
      suffix, ...others } = this.props;
    
    const classes = classNames({
      'fj-pagn-part': true,
      [className]: className
    });
    
    return templateDataCount({
      props: others,
      classes,
      prefix,
      count,
      suffix,
      wrap: c => this.wrap = c
    });
  }
}

registerComponent({ 'fj-PageDataCount': PageDataCount });
Pagination.PageDataCount = PageDataCount;

//每页展示数量组件
class PageSize extends Component {
  static propTypes = {
    pageSize: PropTypes.number,
    pageSizes: PropTypes.array,
    setPageSize: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.string
    ]),
    prefix: PropTypes.string,
    suffix: PropTypes.string,
    onChange: PropTypes.func
  };

  static defaultProps = {
    pageSize: 15,                           //每页数据数
    pageSizes: [15, 30, 50],                //可选择的每页数据数
    setPageSize: false,                     //是否可以设置每页数据数
    prefix: '每页',
    suffix: '条'
  };

  state = {
    pageSize: null
  };

  template = compileComponent(tmpl.pageSize, 'pageSize');
  
  constructor(props) {
    super(props);

    this.state.pageSize = this.props.pageSize;
    this.pageSizeChange = this.pageSizeChange.bind(this);
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      pageSize: nextProps.pageSize
    });
  }

  pageSizeChange(e) {
    let props = this.props,
      pageSize = e.target.value;

    this.setState({
      pageSize
    }, () => {
      if(props.onChange) {
        props.onChange(pageSize);
      }
    });
  }

  render() {
    const {
      className,
      prefix,
      setPageSize,
      pageSize,
      pageSizes,
      suffix,
      onChange, ...others } = this.props;
    
    const classes = classNames({
      'fj-pagn-part': true,
      [className]: className
    });

    return this.template(this.state, {
      pageSizeChange: this.pageSizeChange,
      props: others,
      classes,
      prefix,
      setPageSize,
      pageSizes,
      suffix,
      wrap: c => this.wrap = c
    });
  }
}

registerComponent({ 'fj-PageSize': PageSize });
Pagination.PageSize = PageSize;

export default Pagination;