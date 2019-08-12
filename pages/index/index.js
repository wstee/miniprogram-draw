 const windowWidth = wx.getSystemInfoSync().windowWidth,
  rpx = windowWidth / 750, // 设备像素比
  thickness = [5 * rpx, 10 * rpx, 20 * rpx, 30 * rpx, 40 * rpx], // 画笔粗细
  penColor = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FFFFFF', '#A0A0A0', '#E60013', '#FFF100', '#009944',
     '#00A1E9', '#1E2188', '#E4007F', '#959595', '#626262', '#323232', '#000000', '#F29B76', '#FACC89', '#FFF899',
     '#8AC998', '#85CCC9', '#7FCEF4', '#8F82BC', '#F19FC2', '#EC6841', '#F19149', '#F7B551', '#FFF45C', '#31B16C',
     '#00B7EE', '#556FB5', '#EA68A2', '#E60013', '#EB6101', '#FFF100', '#009944', '#00A1E9', '#E4007F',
     '#A40001', '#AD6B00', '#B7AB00', '#007130', '#0075A9', '#002F73', '#A40036', '#834F00', '#005F16',
     '#005982', '#05004C', '#7D0023', '#D1C0A5', '#372F2C', '#CEA972', '#6A3A07'];
     // 画笔颜色
// canvas 全局配置
let context = null,// 使用 wx.createContext 获取绘图上下文 context
  isButtonDown = false, // 是否触摸
  arrx = [], // 存储触摸x坐标
  arry = [], // 存储触摸y坐标
  canvasW = windowWidth, //画布宽
  canvasH = windowWidth; //画布高

//注册页面
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canvasSize: { canvasW: null, cavvasH: null },
    thickness: 0, // 笔尺寸下标
    colorIndex: 0, // 颜色下标
    drawLineArr: [], // 绘画路径
    selectErase: false, // 选中擦除
    eraseClass: '', // 选中擦除的样式
    selfMake: false, // 显示出题面板
    penColor: penColor
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setCanvasSize();
    // 使用 wx.createContext 获取绘图上下文 context
    context = wx.createCanvasContext('canvas');
    context.setLineCap('round');
    context.setLineJoin('round');
  },
  onShow: function () {
  },
  onShareAppMessage: function () {
  },
  onHide: function () {
  },
  onUnload: function () {
  },
  // 选择笔尺寸
  selectPen: function (e) {
    this.setData({
      thickness: e.currentTarget.dataset.index
    })
  },
  // 选择笔颜色
  selectColor: function (e) {
    this.setData({
      selectErase: 0,
      colorIndex: e.currentTarget.dataset.index,
      selectErase: false,
      eraseClass: ''
    })
  },
  setCanvasSize: function () {
    let canvasSize = { width: canvasW, height: canvasH };
    this.setData({
      canvasSize: canvasSize
    })
  },
// 开始触摸屏幕
  canvasStart: function (event) {
    isButtonDown = true;
    let arrxLen = arrx.length;
    let arryLen = arrx.length;
    arrx.push(event.changedTouches[0].x);
    arry.push(event.changedTouches[0].y);
    context.beginPath()
    context.setStrokeStyle(this.data.penColor[this.data.colorIndex]);
    context.setLineWidth(thickness[this.data.thickness]);
    context.moveTo(arrx[arrxLen - 1], arry[arryLen - 1]);
    context.arc(event.changedTouches[0].x, event.changedTouches[0].y, thickness[this.data.thickness] / 2, 0, 2 * Math.PI);
    context.setFillStyle(this.data.penColor[this.data.colorIndex]);
    context.fill()
    context.draw(true);
  },
  // 手指移动开始画
  canvasMove: function (event) {
    if (isButtonDown) {
      let arrxLen = arrx.length;
      let arryLen = arrx.length;
      let sx = arrx[arrxLen - 1], sy = arry[arryLen - 1]; // 开始坐标
      let ex = event.changedTouches[0].x, ey = event.changedTouches[0].y; // 结束坐标

      context.moveTo(sx, sy);
      let cx = (ex - sx) / 2 + sx,
        cy = (ey - sy) / 2 + sy; // 中间点坐标
      let lcx = (cx - sx) / 2 + sx, lcy = (cy - sy) / 2 + sy; // 1/4坐标

      let rcx = (ex - cx) / 2 + cx, rcy = (ey - cy) / 2 + cy; // 3/4坐标
      arrx.push(...[lcx, cx, rcx, ex]); // 记录路径以便回退
      arry.push(...[lcy, cy, rcy, ey]);
      context.lineTo(lcx, lcy);
      context.lineTo(cx, cy);
      context.lineTo(rcx, rcy);
      context.lineTo(ex, ey);
      // context.quadraticCurveTo(cx, cy, event.changedTouches[0].x, event.changedTouches[0].y);
      context.stroke();
      context.draw(true);
    };
  },
  // 绘画结束
  canvasEnd: function (event) {
    isButtonDown = false;
    // 路径数组存储下来方便回退以及记录
    this.data.drawLineArr.push({ arrx: arrx, arry: arry, thickness: thickness[this.data.thickness], color: this.data.penColor[this.data.colorIndex] })
    arrx = [];
    arry = [];
  },
  // 清空
  cleardraw: function () {
    //清空画布
    wx.showModal({
      title: '提示',
      content: '确定要清空画布？',
      success: res => {
        if (res.confirm) {
          arrx = [];
          arry = [];
          this.data.drawLineArr = []
          context.setFillStyle('#FFFFFF');
          context.clearRect(0, 0, canvasW, canvasH);
          context.fillRect(0, 0, canvasW, canvasH);
          context.draw(true);
          this.setData({
            colorIndex: 0,
            selectErase: false,
            eraseClass: ''
          })
        }
      }
    })
  },
  // 擦除
  eraseDraw: function () {
    if (this.data.selectErase === false) {
      this.setData({
        selectErase: this.data.colorIndex,
        colorIndex: 6, // 白色色块下标，
        eraseClass: 'select-erase'
      })
    } else {
      let colorIndex = this.data.selectErase;
      this.setData({
        selectErase: false,
        colorIndex: colorIndex, // 取消后返回之前的颜色
        eraseClass: ''
      })
    }
  },
  // 回退
  backDraw: function () {
    //只有存储了路径才能回退
    context.clearRect(0, 0, canvasW, canvasH);
    let drawObj = this.data.drawLineArr[this.data.drawLineArr.length - 1];
    if (drawObj) {
      this.data.drawLineArr.pop();
      this.data.drawLineArr.forEach(obj => {
        context.beginPath();
        context.setStrokeStyle(obj.color);
        context.setLineWidth(obj.thickness);
        context.moveTo(obj.arrx[0], obj.arry[0]);
        obj.arrx.forEach((item, index) => {
          context.lineTo(item, obj.arry[index]);
        })
        context.stroke();
        context.closePath();
      })
    } else {
      context.setFillStyle('#FFFFFF');
      context.clearRect(0, 0, canvasW, canvasH);
      context.fillRect(0, 0, canvasW, canvasH);
    }
    context.draw();
  },
  
  
})
