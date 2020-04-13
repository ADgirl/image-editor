class CanvasTools {
    constructor(canvas, src) {
        let _this = this;
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.container = document.createElement('canvas');
        this.containerCtx = this.container.getContext('2d');

        this.image = new Image();
        this.image.src = src;
        this.image.onload = () => {
            _this.img = _this.image;
            _this.img.positionX = canvas.width / 2 - _this.image.width / 2;
            _this.img.positionY = canvas.height / 2 - _this.image.height / 2;
            _this.container.width = _this.image.width;
            _this.container.height = _this.image.height;
            _this.context.drawImage(_this.image, canvas.width / 2 - _this.image.width / 2, canvas.height / 2 - _this.image.height / 2, _this.image.width, _this.image.height);
            _this.containerCtx.drawImage(_this.image, 0, 0, _this.image.width, _this.image.height);
            _this.init();
        };
    }
    // ------------初始化-------------------
    init() {
        // 基础属性
        this.property = {
            // 图片属性
            imgWidth: this.image.width,
            imgHeight: this.image.height,

            // 缩放、旋转尺寸
            scaleX: 1,
            scaleY: 1,
            // slider方式最终确认的缩放层级
            zoom: 1,
            // zoomType:null,
            rotateAngle: 0,
            // 当前缩放层级
            zoomVal: 1,
            // 鼠标滚轮步长
            stemp: 1,

            // 原点坐标
            originX: 0,
            originY: 0,

            // 操作状态
            startMouseEvt: false,
            startMove: false,
            startCut: false,
            isMoving: false,
            isCropping: false,
            isRotating: false,
            isScaleing: false,

            // 移动属性
            moveStartX: 0,
            moveStartY: 0,
            moveEndX: 0,
            moveEndY: 0,

            // 鼠标距离图片边缘的距离
            clientX: 0,
            clientY: 0,

            // rgba值
            imageData: this.containerCtx.getImageData(0, 0, this.container.width, this.container.height), // 修改rgb，剪裁才会影响
            imageCropData: null,
            newRGBA: null,
            imageDataOld: this.containerCtx.getImageData(0, 0, this.container.width, this.container.height)
        };
        this.canvas.style.cursor = 'default';
    }
    // --------------------------------------------------功能相关----------------------------------------------------------------------
    // 重置相关属性
    resetProperty() {
        console.log('reset property');
        this.canvas.onmousedown = null;
        this.canvas.onmousemove = null;
        this.canvas.onmouseup = null;
        // this.canvas.onclick = null;
        this.canvas.onmousewheel = null;
        this.canvas.style.cursor = 'default';
        this.property = Object.assign(this.property, {
            startMouseEvt: false,
            startCut: false,
            startMove: false,
            isMoving: false,
            isCropping: false,
            isRotating: false,
            isScaleing: false,
            moveStartX: 0,
            moveStartY: 0,
            moveEndX: 0,
            moveEndY: 0,
            clientX: 0,
            clientY: 0,
            // zoomType:null,
            newRGBA: null,
            stemp: this.property.zoomVal
        });
    }
    // 移动
    move() {
        this.property.startMove = true;
        // 鼠标点击事件
        this.canvas.onmousedown = event => this.onMouseDown(event);
        // 鼠标移动
        this.canvas.onmousemove = event => this.onMouseMove(event);
        // 鼠标up事件
        this.canvas.onmouseup = event => this.onMouseUp(event);
        // this.canvas.addEventListener('mousedown', this.onMouseDown(), true);
        // this.canvas.addEventListener('mousemove', this.onMouseMove(), false);
        // this.canvas.addEventListener('mouseup', this.onMouseUp(), true);
    }
    // 绘制剪切区域
    drawCrop(callback) {
        this.property.startCut = true;
        // 鼠标点击事件
        this.canvas.onmousedown = event => this.onMouseDown(event);
        // 鼠标移动
        this.canvas.onmousemove = event => this.onMouseMove(event);
        // 鼠标up事件
        this.canvas.onmouseup = event => this.onMouseUp(event, callback);
        // this.canvas.addEventListener('mousedown', this.onMouseDown(), false);
        // this.canvas.addEventListener('mousemove', this.onMouseMove(), false);
        // this.canvas.addEventListener('mouseup', this.onMouseUp(event, callback), true);
    }
    // 取消剪裁
    cancelCrop () {
        this.clear();
        this.context.putImageData(this.property.imageData, this.img.positionX, this.img.positionY);
    }
    // 剪切图片
    crop() {
        this.property.imageData = this.property.imageCropData;
        this.containerCtx.clearRect(0, 0, this.container.width, this.container.height);
        this.img.width = this.container.width = this.property.moveEndX - this.property.moveStartX;
        this.img.height = this.container.height = this.property.moveEndY - this.property.moveStartY;
        // this.img.width = this.container.width;
        // this.img.height = this.container.height;
        this.containerCtx.putImageData(this.property.imageData, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        console.log(this.property.moveStartX);
        console.log(this.property.moveStartY);
        console.log(this.property.zoom);
        this.img.positionX = this.property.moveStartX;
        this.img.positionY = this.property.moveStartY;
        this.context.putImageData(this.property.imageData, this.img.positionX, this.img.positionY);
    }
    // 旋转
    rotateImg(type) {
        this.context.save();
        if (type === 1) {
            // 旋转
            this.clear();
            this.property.rotateAngle = this.property.rotateAngle % 360 + 90;
            this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
            this.context.rotate(Math.PI * this.property.rotateAngle / 180);
            this.context.translate(-this.canvas.width / 2, -this.canvas.height / 2);
            this.context.drawImage(this.img, this.img.positionX, this.img.positionY);
            let x, y;
            if (this.property.rotateAngle === 90 || this.property.rotateAngle === 270) {
                x = this.canvas.width / 2 - this.img.height / 2;
                y = this.canvas.height / 2 - this.img.width / 2;
                this.property.imageData = this.context.getImageData(x, y, this.img.height, this.img.width);
            } else {
                x = this.canvas.width / 2 - this.img.width / 2;
                y = this.canvas.height / 2 - this.img.height / 2;
                this.property.imageData = this.context.getImageData(x, y, this.img.width, this.img.height);
            }
            // // this.img.positionX = x;
            // // this.img.positionY = y;
            // this.clear();
            // this.context.putImageData(this.property.imageData,this.img.positionX, this.img.positionY)
        } else if (type === 2) {
            // 水平翻转
            this.property.imageData = this.flipHorizontal(0, 0, this.property.imageData.width, this.property.imageData.height);
            this.clear();
            this.context.putImageData(this.property.imageData, this.img.positionX, this.img.positionY);
        } else if (type === 3) {
            // 垂直翻转
            this.property.imageData = this.flipVertical(0, 0, this.property.imageData.width, this.property.imageData.height);
            this.clear();
            this.context.putImageData(this.property.imageData, this.img.positionX, this.img.positionY);
        }
        this.context.restore();
    }
    // 更新img
    changeImg() {
        let _this = this;
        this.img.src = this.save();
        this.img.onload = () => {
            _this.clear();
            _this.context.drawImage(_this.img, _this.img.positionX, _this.img.positionY, _this.img.width, _this.img.height);
        };
    }
    // 缩放
    scaleImg(value) {
        console.log('zoom:' + value);
        this.property.isScaleing = true;
        this.property.zoomVal = value;
        this.property.zoom = value; // 滚动缩放新增
        this.context.save();
        // this.context.translate((this.canvas.width - this.canvas.width * value) / 2, (this.canvas.height - this.canvas.height * value) / 2);
        this.clear();
        // this.context.scale(value, value);
        // this.context.putImageData(this.property.imageData,this.img.positionX,this.img.positionY);
        // this.context.drawImage(this.img, this.img.positionX, this.img.positionY, this.img.width, this.img.height);

        // 离屏放大器
        this.containerCtx.clearRect(0, 0, this.container.width, this.container.height);
        this.container.width = this.img.width * value;
        this.container.height = this.img.height * value;
        this.containerCtx.scale(value, value);
        this.containerCtx.drawImage(this.img, 0, 0, this.img.width, this.img.height);
        this.property.imageData = this.containerCtx.getImageData(0, 0, this.container.width, this.container.height);

        this.context.putImageData(this.property.imageData, this.img.positionX, this.img.positionY, 0, 0, this.img.width * value, this.img.height * value);
        this.context.restore();
    }
    // 调整图片亮度
    light(value) {
        value = value / 1000 * 255;
        var filtered = this.BrightnessContrastPhotoshop(this.property.imageData, value, 0);
        this.property.newRGBA = filtered;
        this.clear();
        this.context.putImageData(filtered, this.img.positionX, this.img.positionY);
    }
    // 对比度
    contrast(value) {
        // console.log(this.img.positionX);
        // console.log(this.img.positionY);
        value = value / 100 * 255;
        var filtered = this.BrightnessContrastPhotoshop(this.property.imageData, 0, value);
        this.property.newRGBA = filtered;
        this.clear();
        this.context.putImageData(filtered, this.img.positionX, this.img.positionY);
    }
    // 饱和度
    saturation(value) {
        var filtered = this.HSLAdjustment(this.property.imageData, 0, value, 0);
        this.property.newRGBA = filtered;
        this.clear();
        this.context.putImageData(filtered, this.img.positionX, this.img.positionY);
    }
    // 色彩平衡
    colorBalance(r, g, b) {
        var filtered = this.ColorTransformFilter(this.property.imageData, 1, 1, 1, 1, r, g, b, 1);
        this.property.newRGBA = filtered;
        this.clear();
        this.context.putImageData(filtered, this.img.positionX, this.img.positionY);
    }
    // 重置
    reset() {
        this.property.imageData = this.property.imageDataOld;
        this.img.positionX = this.canvas.width / 2 - this.property.imgWidth / 2;
        this.img.positionY = this.canvas.height / 2 - this.property.imgHeight / 2;
        this.property.zoom = 1;
        this.property.zoomVal = 1; // 滑轮滚动增加
        this.clear();
        this.context.scale(0, 0);
        this.context.putImageData(this.property.imageData, this.img.positionX, this.img.positionY);
    }
    // 清空画布
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    // 取消像素操作
    prev() {
        if (this.property.isScaleing) {
            this.scaleImg(this.property.zoom);
        } else {
            this.clear();
            this.context.putImageData(this.property.imageData, this.img.positionX, this.img.positionY);
        }
    }
    // 确认像素操作
    confirm() {
        if (this.property.isScaleing) {
            this.property.zoom = this.property.zoomVal;
        } else {
            this.property.imageData = this.property.newRGBA;
        }
    }
    // 保存
    save() {
        this.img.width = this.container.width = this.property.imageData.width;
        this.img.height = this.container.height = this.property.imageData.height;
        this.containerCtx.putImageData(this.property.imageData, 0, 0);
        let data = this.container.toDataURL();
        return data;
    }
    // 渲染修改后数据到画布
    drawToContext(srcImageData) {
        this.containerCtx.putImageData(srcImageData, 0, 0);
        let base64 = this.container.toDataURL();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let img = new Image();
        img.src = base64;
        img.onload = () => {
            this.context.drawImage(img, this.img.positionX, this.img.positionY, this.container.width, this.container.height);
        };
    }

    // -------------------------------------------------鼠标事件相关-----------------------------------------------------------------
    onMouseDown(e) {
        this.property.startMouseEvt = true;
        this.property.clientX = e.offsetX - this.img.positionX;
        this.property.clientY = e.offsetY - this.img.positionY;
        console.log(this.property.startCut);
        if (this.property.startMove) {
            // 移动图片
            this.property.isMoving = true;
        } else if (this.property.startCut) {
            // 剪切图片
            this.property.imageCropData = this.property.imageData;
            this.property.moveStartX = e.offsetX;
            this.property.moveStartY = e.offsetY;
            this.property.isCropping = true;
            this.canvas.style.cursor = 'crosshair';
            this.context.beginPath();
        }
        console.log(this.property.moveStartX);
    }
    onMouseMove(e) {
        if (!this.property.startMouseEvt) {
            return;
        }
        // 移动图片
        if (this.property.isMoving) {
            // 判断鼠标指针是否在图片上
            this.mouseInImage(e);
            let x = e.offsetX - this.property.clientX;
            let y = e.offsetY - this.property.clientY;
            this.clear();
            this.context.putImageData(this.property.imageData, x, y);
        } else if (this.property.isCropping) { // 剪切图片
            this.clear();
            this.context.putImageData(this.property.imageCropData, this.img.positionX, this.img.positionY);
            this.context.strokeStyle = 'red';
            this.context.strokeRect(this.property.moveStartX, this.property.moveStartY, e.offsetX - this.property.moveStartX, e.offsetY - this.property.moveStartY);
        }
    }
    onMouseUp(e, callback) {
        this.property.startMouseEvt = false;
        if (this.property.isMoving) {
            // 移动图片
            this.property.isMoving = false;
            this.img.positionX = e.offsetX - this.property.clientX;
            this.img.positionY = e.offsetY - this.property.clientY;
            this.clear();
            this.context.putImageData(this.property.imageData, this.img.positionX, this.img.positionY);
        } else if (this.property.isCropping) {
            // 剪切图片
            this.property.moveEndX = e.offsetX;
            this.property.moveEndY = e.offsetY;
            this.clear();
            this.context.putImageData(this.property.imageCropData, this.img.positionX, this.img.positionY);
            this.property.imageCropData = this.context.getImageData(this.property.moveStartX, this.property.moveStartY, this.property.moveEndX - this.property.moveStartX, this.property.moveEndY - this.property.moveStartY);
            this.context.strokeStyle = 'red';
            this.context.strokeRect(this.property.moveStartX, this.property.moveStartY, e.offsetX - this.property.moveStartX, e.offsetY - this.property.moveStartY);
            this.property.isCropping = false;
        }
        console.log('mouse up');
        if (callback) {
            setTimeout(() => {
                callback();
            }, 500);
        }
        this.canvas.style.cursor = 'default';
    }
    // onClick(e) {
    //     if (this.property.zoomType === 'in' && this.property.zoom < 3) {
    //         this.property.zoom += 0.05;
    //         this.canvas.style.cursor = 'zoom-in';
    //     } else if (this.property.zoomType === 'out' && this.property.zoom > 0.3) {
    //         this.property.zoomZOOM -= 0.05;
    //         this.canvas.style.cursor = 'zoom-out';
    //     } else {
    //         this.canvas.style.cursor = 'default';
    //     }
    //     this.property.zoom = Number(this.property.zoom.toFixed(2));
    //     // this.img.zoomWidth = this.img.width * this.property.zoom;
    //     // this.img.zoomHeight = this.img.height * this.property.zoom;
    //     this.context.save();
    //     this.context.translate((this.canvas.width-this.canvas.width*this.property.zoom)/2, (this.canvas.height-this.canvas.height*this.property.zoom)/2);
    //     this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //     this.context.scale(this.property.zoom,this.property.zoom);
    //     // this.context.putImageData(this.property.imageData,this.img.positionX,this.img.positionY);
    //     this.context.drawImage(this.img, this.img.positionX, this.img.positionY, this.img.width, this.img.height);
    //     this.context.restore();
    // }
    // 判断鼠标指针是否在图片上
    mouseInImage(e) {
        if (e.offsetX > this.img.positionX &&
            e.offsetX < this.img.positionX + this.img.width * this.property.scaleX &&
            e.offsetY > this.img.positionY &&
            e.offsetY < this.img.positionY + this.img.height * this.property.scaleY) {
            this.canvas.style.cursor = 'move';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
    // 鼠标滚轮滑动
    onMouseScroll(key) {
        let _this = this;
        this.property[key] = true;
        this.canvas.onmousewheel = function(event) {
            // console.log('onmousewheel');
            _this._throttle(2000, function() {
                if (_this.property.isScaleing) {
                    let resize = _this.roll(event);
                    resize = Number(resize.toFixed(1));
                    if (resize > 0.5) {
                        // console.log('resize image');
                        _this.scaleImg(resize);
                    }
                }
            })();
        };
    }
    roll (e) {
        e = e || window.event;
        if (e.wheelDelta) { // 判断浏览器IE，谷歌滑轮事件
            if (e.wheelDelta > 0) { // 当滑轮向上滚动时
                this.property.stemp += 0.1;
                return this.property.stemp;
            }
            if (e.wheelDelta < 0) { // 当滑轮向下滚动时
                this.property.stemp -= 0.1;
                this.property.stemp = this.property.stemp < 0.5 ? 0.5 : this.property.stemp;
                return this.property.stemp;
            }
        } else if (e.detail) { // Firefox滑轮事件
            if (e.detail > 0) { // 当滑轮向上滚动时
                this.property.stemp += 0.1;
                return this.property.stemp;
            }
            if (e.detail < 0) { // 当滑轮向下滚动时
                this.property.stemp -= 0.1;
                this.property.stemp = this.property.stemp < 0.5 ? 0.5 : this.property.stemp;
                return this.property.stemp;
            }
        }
    }
    // 节流
    _throttle (duration, fn) {
        var pre = 0, result;
        return function() {
            let now = (new Date()).getTime();
            let context = this;
            let args = arguments;
            if (now - pre > duration) {
                fn.apply(context, args);
                pre = now;
                // return result;
            }
        };
    }

    // ----------------------------------------------RGBA数据转换相关-----------------------------------------------
    // 水平翻转像素
    flipHorizontal (startX, startY, w, h) {
        // 1.获取图像信息
        // let imgdata = this.context.getImageData(startX, startY, w, h);
        let imgdata = this.property.imageData;
        // 中轴
        let middleAxle = (w * 4) / 2;

        // 2.遍历每一行作为外循环
        for (let curRow = 0; curRow < h; curRow++) {
            // 每行开始的通道位置
            let aisleStart = curRow * w * 4,
                // 每行结束的通道位置
                aisleEnd = (curRow + 1) * w * 4 - 4;
            // 每一行中轴所在的位置
            let curMiddleAxle = aisleEnd - middleAxle;

            // 3.遍历当前行的列作为内循环,把列的左边像素按照轴对称和右边的像素互换
            for (; aisleStart <= curMiddleAxle; aisleStart += 4, aisleEnd -= 4) {
            // 临时存放
                let tr = imgdata.data[aisleStart],
                    tg = imgdata.data[aisleStart + 1],
                    tb = imgdata.data[aisleStart + 2],
                    ta = imgdata.data[aisleStart + 3];

                imgdata.data[aisleStart] = imgdata.data[aisleEnd];
                imgdata.data[aisleStart + 1] = imgdata.data[aisleEnd + 1];
                imgdata.data[aisleStart + 2] = imgdata.data[aisleEnd + 2];
                imgdata.data[aisleStart + 3] = imgdata.data[aisleEnd + 3];

                imgdata.data[aisleEnd] = tr;
                imgdata.data[aisleEnd + 1] = tg;
                imgdata.data[aisleEnd + 2] = tb;
                imgdata.data[aisleEnd + 3] = ta;
            }
        }
        return imgdata;

        // // 4.把处理后的像素信息放回画布
        // this.context.clearRect(startX, startY, w, h);
        // this.context.putImageData(imgdata, startX, startY);
    }
    //   垂直翻转像素
    flipVertical (startX, startY, w, h) {
        // 1.获取图像信息
        // let imgdata = this.context.getImageData(startX, startY, w, h);
        let imgdata = this.property.imageData;
        // 中轴
        let middleAxle = Math.floor(h / 2),
            rowAisles = w * 4;

        // 2.遍历总行数一半的每一行作为外循环(向下取整)
        for (var curRow = 0; curRow < middleAxle; curRow++) {
            // 开始的通道位置
            let aisleStart = curRow * rowAisles,
                // 镜像对称的开始位置
                mirrorStart = (h - curRow - 1) * rowAisles;

            // 3.遍历当前行的列作为内循环,把列的每个通道按照水平轴对称和镜像里的通道互换
            for (
                ;
                aisleStart < rowAisles * (curRow + 1);
                aisleStart += 4, mirrorStart += 4
            ) {
                var tr = imgdata.data[aisleStart],
                    tg = imgdata.data[aisleStart + 1],
                    tb = imgdata.data[aisleStart + 2],
                    ta = imgdata.data[aisleStart + 3];

                imgdata.data[aisleStart] = imgdata.data[mirrorStart];
                imgdata.data[aisleStart + 1] = imgdata.data[mirrorStart + 1];
                imgdata.data[aisleStart + 2] = imgdata.data[mirrorStart + 2];
                imgdata.data[aisleStart + 3] = imgdata.data[mirrorStart + 3];

                imgdata.data[mirrorStart] = tr;
                imgdata.data[mirrorStart + 1] = tg;
                imgdata.data[mirrorStart + 2] = tb;
                imgdata.data[mirrorStart + 3] = ta;
            }
        }
        return imgdata;

        // // 4.把处理后的像素信息放回画布
        // this.context.clearRect(startX, startY, w, h);
        // this.context.putImageData(imgdata, startX, startY);
    }
    // 色彩平衡相关
    ColorTransformFilter (srcImageData, redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
        var srcPixels = srcImageData.data,
            srcWidth = srcImageData.width,
            srcHeight = srcImageData.height,
            srcLength = srcPixels.length;
        // dstImageData = this.utils.createImageData(srcWidth, srcHeight),
        var _canvas = document.createElement('canvas'),
            _context = _canvas.getContext('2d'),
            dstImageData = _context.createImageData(srcWidth, srcHeight),
            dstPixels = dstImageData.data;

        var i, v;
        for (i = 0; i < srcLength; i += 4) {
            dstPixels[i] = (v = srcPixels[i] * redMultiplier + redOffset) > 255 ? 255 : v < 0 ? 0 : v;
            dstPixels[i + 1] = (v = srcPixels[i + 1] * greenMultiplier + greenOffset) > 255 ? 255 : v < 0 ? 0 : v;
            dstPixels[i + 2] = (v = srcPixels[i + 2] * blueMultiplier + blueOffset) > 255 ? 255 : v < 0 ? 0 : v;
            dstPixels[i + 3] = (v = srcPixels[i + 3] * alphaMultiplier + alphaOffset) > 255 ? 255 : v < 0 ? 0 : v;
        }

        return dstImageData;
    }

    // 亮度、对比度相关
    BrightnessContrastPhotoshop (srcImageData, brightness, contrast) {
        var srcPixels = srcImageData.data,
            srcWidth = srcImageData.width,
            srcHeight = srcImageData.height,
            srcLength = srcPixels.length;
        var _canvas = document.createElement('canvas'),
            _context = _canvas.getContext('2d'),
            dstImageData = _context.createImageData(srcWidth, srcHeight),
            dstPixels = dstImageData.data;

        // fix to 0 <= n <= 2;
        brightness = (brightness + 100) / 100;
        contrast = (contrast + 100) / 100;

        this.mapRGB(srcPixels, dstPixels, function (value) {
            value *= brightness;
            value = (value - 127.5) * contrast + 127.5;
            return value + 0.5 | 0;
        });
        return dstImageData;
    }

    // 饱和度相关
    HSLAdjustment (srcImageData, hueDelta, satDelta, lightness) {
        var srcPixels = srcImageData.data,
            srcWidth = srcImageData.width,
            srcHeight = srcImageData.height,
            srcLength = srcPixels.length;
        var _canvas = document.createElement('canvas'),
            _context = _canvas.getContext('2d'),
            dstImageData = _context.createImageData(srcWidth, srcHeight),
            dstPixels = dstImageData.data;

        hueDelta /= 360;
        satDelta /= 100;
        lightness /= 100;

        var h, s, l, hsl, rgb, i;

        for (i = 0; i < srcLength; i += 4) {
            // convert to HSL
            hsl = this.rgbToHsl(srcPixels[i], srcPixels[i + 1], srcPixels[i + 2]);

            // hue
            h = hsl[0] + hueDelta;
            while (h < 0) {
                h += 1;
            }
            while (h > 1) {
                h -= 1;
            }

            // saturation
            s = hsl[1] + hsl[1] * satDelta;
            if (s < 0) {
                s = 0;
            } else if (s > 1) {
                s = 1;
            }

            // lightness
            l = hsl[2];
            if (lightness > 0) {
                l += (1 - l) * lightness;
            } else if (lightness < 0) {
                l += l * lightness;
            }

            // convert back to rgb
            rgb = this.hslToRgb(h, s, l);

            dstPixels[i] = rgb[0];
            dstPixels[i + 1] = rgb[1];
            dstPixels[i + 2] = rgb[2];
            dstPixels[i + 3] = srcPixels[i + 3];
        }

        return dstImageData;
    }
    // RGBA转换辅助基础方法-start
    rgbToHsl (r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        var max = (r > g) ? (r > b) ? r : b : (g > b) ? g : b,
            min = (r < g) ? (r < b) ? r : b : (g < b) ? g : b,
            chroma = max - min,
            h = 0,
            s = 0,
            // Lightness
            l = (min + max) / 2;

        if (chroma !== 0) {
            // Hue
            if (r === max) {
                h = (g - b) / chroma + ((g < b) ? 6 : 0);
            } else if (g === max) {
                h = (b - r) / chroma + 2;
            } else {
                h = (r - g) / chroma + 4;
            }
            h /= 6;

            // Saturation
            s = (l > 0.5) ? chroma / (2 - max - min) : chroma / (max + min);
        }

        return [h, s, l];
    }
    hslToRgb (h, s, l) {
        var m1, m2, hue,
            r, g, b,
            rgb = [];

        if (s === 0) {
            r = g = b = l * 255 + 0.5 | 0;
            rgb = [r, g, b];
        } else {
            if (l <= 0.5) {
                m2 = l * (s + 1);
            } else {
                m2 = l + s - l * s;
            }

            m1 = l * 2 - m2;
            hue = h + 1 / 3;

            var tmp;
            for (var i = 0; i < 3; i += 1) {
                if (hue < 0) {
                    hue += 1;
                } else if (hue > 1) {
                    hue -= 1;
                }

                if (6 * hue < 1) {
                    tmp = m1 + (m2 - m1) * hue * 6;
                } else if (2 * hue < 1) {
                    tmp = m2;
                } else if (3 * hue < 2) {
                    tmp = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
                } else {
                    tmp = m1;
                }

                rgb[i] = tmp * 255 + 0.5 | 0;

                hue -= 1 / 3;
            }
        }

        return rgb;
    }
    mapRGB (src, dst, func) {
        this.applyMap(src, dst, this.buildMap(func));
    }
    applyMap (src, dst, map) {
        for (var i = 0, l = src.length; i < l; i += 4) {
            dst[i] = map[src[i]];
            dst[i + 1] = map[src[i + 1]];
            dst[i + 2] = map[src[i + 2]];
            dst[i + 3] = src[i + 3];
        }
    }
    buildMap (f) {
        for (var m = [], k = 0, v; k < 256; k += 1) {
            m[k] = (v = f(k)) > 255 ? 255 : v < 0 ? 0 : v | 0;
        }
        return m;
    }
    // RGBA转换辅助基础方法-end
}
// 剪切类属性

//export default CanvasTools;
