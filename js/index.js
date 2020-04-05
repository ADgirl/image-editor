var imageBase64 = null;
 function changeRange(e){
 	todo(e.id,e.value);
 }
function todo(type,value){
	console.log(type)
 	switch (type){
 		case 2:
 			CanvasTools.rotateImg(2)
 			break;
 		case 12:
 			CanvasTools.move()
 			break;
 		case '2.1':
 			CanvasTools.rotateImg('2.1')
 			break;
 		case '2.2':
 			CanvasTools.rotateImg('2.2')
 			break;
 		case 'scalebtn':
 			CanvasTools.scaleImg(value);
 			break;
 		case 'lightbtn':
 			CanvasTools.light(value);
 			break;
 		case 'contrastbtn':
 			CanvasTools.contrast(value);
 			break;
 		case 'saturationtbtn':
 			CanvasTools.saturation(value);
 			break;
 		case 'colorRbtn':
 			CanvasTools.colorBalance(value,0,0);
 			break;
 		case 'colorGbtn':
 			CanvasTools.colorBalance(0,value,0);
 			break;
 		case 'colorBbtn':
 			CanvasTools.colorBalance(0,0,value);
 			break;
 		default:
 			break;
 	}
 }
function adjustSave(){
	CanvasTools.adjustSave()
}
 
var CanvasTools = {
 	scaleXY:1, //画布缩放
 	moveType:false, // 是否使用移动
 	adjustSaturation:0,
 	adjustLight:0,
 	adjustContrast:0,
 	angle:0,
 	// 初始化
 	init:function(canvas,src){
 		let _this = this;
 		this.canvas = canvas;
	 	this.context = canvas.getContext('2d');
	 	var imageObj = new Image();
	 	imageObj.src = src;
		imageObj.onload = function() {
			console.log(imageObj.width);
			console.log(imageObj.height);
		   _this.context.drawImage(imageObj, canvas.width / 2 - imageObj.width / 2, canvas.height / 2 - imageObj.height / 2,imageObj.width,imageObj.height);
		   _this.img = imageObj;
		   _this.img.width = imageObj.width;
		   _this.img.height = imageObj.height;
//		   _this.imageData = _this.context.getImageData(0,0, canvas.width, canvas.height);
		};
		
 	},
 	adjustSave(){
 		this.imageData = this.context.getImageData(0,0,this.canvas.width, this.canvas.height);
 	},
 	//重置
 	reset: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.drawImage(this.img, this.canvas.width / 2 - this.img.width / 2, this.canvas.height / 2 - this.img.height / 2,this.img.width,this.img.height);
    },
 	// 旋转图片
 	rotateImg:function(type){
   		this.context.save();
 		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
 		if(type === 2){
 			//旋转90°由于是改变画布位置，所以出现照片变形，待优化
 			this.angle  = this.angle%360 +90;
 			console.log(this.angle)
   			this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
 			this.context.rotate(Math.PI*this.angle / 180);
   			this.context.translate(-this.canvas.width / 2, -this.canvas.height / 2);
 			this.context.drawImage(this.img, this.canvas.width / 2 - this.img.width / 2, this.canvas.height / 2 - this.img.height / 2);
 		} else if(type==='2.1'){
		  　	this.context.translate(this.canvas.width/2, 0);
		    this.context.scale(-1, 1);
		    this.context.translate(-this.canvas.width/2, 0);
		    this.context.drawImage(this.img, this.canvas.width/2 -  this.img.width/2, this.canvas.height/2 - this.img.height/2);
 		} else if(type==='2.2'){
   			this.context.translate(0, this.canvas.height/2);
   			this.context.scale(1, -1);
   			this.context.translate(0, -this.canvas.height/2);
			this.context.drawImage(this.img, this.canvas.width / 2 - this.img.width / 2, this.canvas.height / 2 - this.img.height / 2);
 		}
		this.context.restore();
		imageBase64 = this.canvas.toDataURL();
		document.getElementById('showImg').src = imageBase64;
   },
    // 缩放图片
    scaleImg:function(value){
    	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    	this.context.save();
			this.context.translate((this.canvas.width-this.canvas.width*value)/2, (this.canvas.height-this.canvas.height*value)/2);
	        this.context.scale(value, value);
	        this.context.drawImage(this.img, this.canvas.width / 2 - this.img.width / 2, this.canvas.height / 2 - this.img.height / 2,this.img.width,this.img.height);
    	this.context.restore();
    	imageBase64 = this.canvas.toDataURL()
    	document.getElementById('showImg').src = imageBase64;
    },
    // 移动图片
    move:function(){
    	// 拖拽点图片其他地方会默认回到中心点,待修改
    	this.moveType = !this.moveType;
    	if(!this.moveType){
    		this.canvas.style.cursor = 'default';
    		this.canvas.onmousedown = null;
    		return;
    	} else{    		
    		this.canvas.style.cursor = 'move';
    	}
    	this.context.save();
	    let ax,ay,x,y;
	    let _this = this;
    	this.canvas.onmousedown=function (e) {
	        _this.canvas.onmousemove = function(e){
	             x= e.clientX;y=e.clientY;
	            //先清除之前的然后重新绘制
	            _this.context.clearRect(0,0,_this.canvas.width,_this.canvas.height);
	
	            _this.context.drawImage(_this.img,x - _this.img.width / 2, y - _this.img.height / 2,_this.img.width,_this.img.height);
	        };	
	        _this.canvas.onmouseup = function(){
	            _this.canvas.onmousemove = null;
	            _this.canvas.onmouseup = null;
	        };
    	}
    },
    //调整图片亮度
    light:function(value){
		value = value/1000*255;
		var filtered = this.BrightnessContrastPhotoshop(this.imageData,value,0);
		this.context.putImageData(filtered, 0, 0);
		imageBase64 = this.canvas.toDataURL();
		document.getElementById('showImg').src = imageBase64;
    },
    // 对比度
    contrast:function(value){
		value = value/100*255;
		var filtered = this.BrightnessContrastPhotoshop(this.imageData,0,value);
		this.context.putImageData(filtered, 0, 0);
    },
    truncateColor: function(value) {
	    if (value < 0) {
	      value = 0;
	    } else if (value > 255) {
	      value = 255;
	    }
	
	    return value;
	  },
    applyContrast: function(data,contrast) {
	  	console.log('start')
	    var factor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));
	
	    for (var i = 0; i < data.length; i+= 4) {
	      data[i] = this.truncateColor(factor * (data[i] - 128.0) + 128.0);
	      data[i+1] = this.truncateColor(factor * (data[i+1] - 128.0) + 128.0);
	      data[i+2] = this.truncateColor(factor * (data[i+2] - 128.0) + 128.0);
	    }
	    return data;
	    
	 },
    // 饱和度
    saturation:function(value){
		var filtered = this.HSLAdjustment(this.imageData,0,value,0);
    	this.context.putImageData(filtered, 0, 0);
    },
    //色彩平衡
    colorBalance(r,g,b){
    	var filtered = this.ColorTransformFilter(this.imageData, 1, 1, 1, 1, r, g, b, 1);
    	this.context.putImageData(filtered, 0, 0);
    },
    HSLAdjustment: function (srcImageData, hueDelta, satDelta, lightness) {
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
	},
	rgbToHsl: function (r, g, b) {
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
	},
	hslToRgb: function (h, s, l) {
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
	},
	BrightnessContrastPhotoshop: function (srcImageData, brightness, contrast) {
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
	},
	mapRGB: function (src, dst, func) {
		this.applyMap(src, dst, this.buildMap(func));
	},
	applyMap: function (src, dst, map) {
		for (var i = 0, l = src.length; i < l; i += 4) {
			dst[i] = map[src[i]];
			dst[i + 1] = map[src[i + 1]];
			dst[i + 2] = map[src[i + 2]];
			dst[i + 3] = src[i + 3];
		}
	},
	buildMap: function (f) {
		for (var m = [], k = 0, v; k < 256; k += 1) {
			m[k] = (v = f(k)) > 255 ? 255 : v < 0 ? 0 : v | 0;
		}
		return m;
	},
	Crop: function (srcImageData, x, y, width, height) {
		var srcPixels = srcImageData.data,
			srcWidth = srcImageData.width,
			srcHeight = srcImageData.height,
			srcLength = srcPixels.length;
		var _canvas = document.createElement('canvas'),
			_context = _canvas.getContext('2d'),
			dstImageData = _context.createImageData(srcWidth, srcHeight),
			dstPixels = dstImageData.data;
	
		var srcLeft = Math.max(x, 0),
			srcTop = Math.max(y, 0),
			srcRight = Math.min(x + width, srcWidth),
			srcBottom = Math.min(y + height, srcHeight),
			dstLeft = srcLeft - x,
			dstTop = srcTop - y,
			srcRow, srcCol, srcIndex, dstIndex;
	
		for (srcRow = srcTop, dstRow = dstTop; srcRow < srcBottom; srcRow += 1, dstRow += 1) {
			for (srcCol = srcLeft, dstCol = dstLeft; srcCol < srcRight; srcCol += 1, dstCol += 1) {
				srcIndex = (srcRow * srcWidth + srcCol) << 2;
				dstIndex = (dstRow * width + dstCol) << 2;
				dstPixels[dstIndex] = srcPixels[srcIndex];
				dstPixels[dstIndex + 1] = srcPixels[srcIndex + 1];
				dstPixels[dstIndex + 2] = srcPixels[srcIndex + 2];
				dstPixels[dstIndex + 3] = srcPixels[srcIndex + 3];
			}
		}
	
		return dstImageData;
	},
	ColorTransformFilter: function (srcImageData, redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
		var srcPixels = srcImageData.data,
			srcWidth = srcImageData.width,
			srcHeight = srcImageData.height,
			srcLength = srcPixels.length;
//			dstImageData = this.utils.createImageData(srcWidth, srcHeight),
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
};
 
 
 
var canvas = document.getElementById('myCanvas');
CanvasTools.init(canvas,'./img/face.jpg');//http://10.128.129.252:12002//01/A2/facepic/2020/3/13/person/677ef1415166472bab7926f5a248e86d.jpg
//CanvasTools.init(canvas,'http://10.128.129.252:12002//01/A2/facepic/2020/3/13/person/677ef1415166472bab7926f5a248e86d.jpg');

