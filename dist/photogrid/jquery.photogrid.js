/*!
 * Photo Grid (jQuery plugin)v1.0.0
 * (c) 2014 Meron
 * MIT-style license.
 * 
 * Google liked images gallery
 * 
 * 集成:[imageReady](http://www.planeart.cn/?p=1121)
 * 参考:
 * 	- [rowGrid](https://github.com/brunjo/rowGrid.js)
 *	- [og-grid]http://tympanus.net/codrops/2013/03/19/thumbnail-grid-with-expanding-preview/
 * 
 */
;(function($){

	/*
	 * 图片头数据加载就绪事件 - 更快获取图片尺寸
	 * 
	 * imageReady(url, readyCbk, loadCbk, errorCbk)
	 * 
	 * @version	2011.05.27
	 * @author	TangBin, modified by Meron, 2014-03-21
	 * @see		http://www.planeart.cn/?p=1121
	 * @see		http://www.planeart.cn/demo/imgReady/
	 * @param	{String}	图片路径
	 * @param	{Function}	尺寸就绪ready
	 * @param	{Function}	加载完毕load (可选)
	 * @param	{Function}	加载错误error (可选)
	 * @example 
			imgReady('http://www.google.com.hk/intl/zh-CN/images/logo_cn.png', function () {
				alert('size ready: width=' + this.width + '; height=' + this.height);
			});
	 */
	var imgReady = (function () {
		var list = [], intervalId = null,

		// 用来执行队列
		tick = function () {
			var i = 0;
			for (; i < list.length; i++) {
				list[i].end ? list.splice(i--, 1) : list[i]();
			};
			!list.length && stop();
		},

		// 停止所有定时器队列
		stop = function () {
			clearInterval(intervalId);
			intervalId = null;
		};

		return function (url, ready, load, error) {
			var onready, width, height, newWidth, newHeight;
			var img;
			if(typeof url === 'string'){
				img = new Image();
				img.src = url;
			}
			else {
				img = $(url).get(0);
			}

			// 如果图片被缓存，则直接返回缓存数据
			if (img.complete) {
				ready.call(img);
				load && load.call(img);
				return;
			};
			
			width = img.width;
			height = img.height;
			
			// 加载错误后的事件
			img.onerror = function () {
				error && error.call(img);
				onready.end = true;
				img = img.onload = img.onerror = null;
			};
			
			// 图片尺寸就绪
			onready = function () {
				newWidth = img.width;
				newHeight = img.height;
				if (newWidth !== width || newHeight !== height ||
					// 如果图片已经在其他地方加载可使用面积检测
					newWidth * newHeight > 1024
				) {
					ready.call(img);
					onready.end = true;
				};
			};
			onready();
			
			// 完全加载完毕的事件
			img.onload = function () {
				// onload在定时器时间差范围内可能比onready快
				// 这里进行检查并保证onready优先执行
				!onready.end && onready();
			
				load && load.call(img);
				
				// IE gif动画会循环执行onload，置空onload即可
				img = img.onload = img.onerror = null;
			};

			// 加入队列中定期执行
			if (!onready.end) {
				list.push(onready);
				// 无论何时只允许出现一个定时器，减少浏览器性能损耗
				if (intervalId === null) intervalId = setInterval(tick, 40);
			};
		};
	})();//imageReady


	/**
	 * 工具
	 * =====================
	 */
	var Utils = (function(){

		return {
			/**
			 * 简单检查是否是http或https开头的url、
			 * @return {Boolean}		 [description]
			 */
			 isHttpUrl: function(url){
				var re = new RegExp('^(http|https)://', 'i');
				return re.test(url);
			}
			/**
			 * 从url解析出域名
			 * @param	{String} url
			 * @return {String}
			 */
			,getDomainFormUrl: function(url){
				if(typeof url === 'undefined' || null === url){ 
					return '';
				}
				var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
				var domain = matches && matches[1];
				return domain;
			} //eof:getDomainFormUrl
			,getSize: function(size){
				size = $.trim(''+size);
				if(size.match(/^\d+$/)){
					return size +'px';
				}
				return size;
			}
			/**
		     * 生成范围内的随机数
		     * @param  {Integer} min 下限
		     * @param  {Integer} max 上限
		     * @return {Integer}     [description]
		     */
		    ,random: function(min,max){
		      return Math.floor(min+Math.random()*(max-min));
		    }
		    /**
		     * 生成范围内的随机日期毫秒值
		     * @param  {Integer} min 从今天起的天数，负数为今天之前
		     * @param  {[type]} max 从今天起的天数，正数为今天之后
		     * @return {[type]}     [description]
		     */
		    ,randomDateLong: function(min,max){
		      if(!min){
		        min = -7;
		      }
		      if(!max){
		        max = 7;
		      }
		      var now = new Date();
		      var nowLong = now.getTime();
		      var oneDayMs = 1000 * 60 * 60 * 24;//一天的毫秒值
		      var finalMin = Math.min(min, max);
		      var finalMax = Math.max(min, max);
		      var begin = nowLong + (finalMin * oneDayMs);
		      var end = nowLong + (finalMax * oneDayMs);

		      return this.random(begin, end);
		    }
			,noop:function(){}
		};//return
	})();//Utils


	/**
	 * 图片查看器
	 */
	var ImageView = (function() {

		
		/**
		 * 构造器
		 * @param {jQuery|DOM Element} $item		条目
		 * @param {jQuery|DOM Element} $element 初始Photogrid组件的元素
		 * @param {json} options	
		 */
		function ImageView($item, $element, options) {
			this.$element = $($element);
			this.$item = $($item);
			this.opts = $.extend(true, {}, ImageView.defaults, options);		
			
			this.create();
			this.update();
			this.initEvent();
		}
		//原型
		ImageView.prototype = {
			/**
			 * 创建图片查看器的主结构
			 */
			create: function() {
				//详细信息部分
				this.$details = $('<div class="photogrid-iv-details"></div>');
				if(!this.opts.detailsTemplate){
					this.$title = $('<div class="photogrid-iv-details-title">Title here</div>');
					this.$baseinfo = $('<div class="photogrid-iv-details-baseinfo"></div>').append(
						this.$domain 		 = $('<a href="#" target="_blank">www.TagFay.com</a>'),
														 		 '<span> - </span>',
						this.$dimensions = $('<span>1024 x 768</span>')
					);//$baseinfo

					this.$desc = $('<div class="photogrid-iv-details-desc">Description here</div>');
					this.$pageLink = $('<a href="#" class="photogrid-iv-btn" id="pgIvBtnViewPage" target="_blank"><span class="photogrid-iv-btn-txt">访问网页</span></a>');
					this.$srcLink = $('<a href="#" class="photogrid-iv-btn" id="pgIvBtnViewSrc" target="_blank"><span class="photogrid-iv-btn-txt">查看图片</span></a>');

					this.$details.append(
						this.$title, this.$baseinfo, this.$desc,
						this.$pageLink, this.$srcLink);
				}

				//ImageView 主体结构
				this.$imageView = $('<div class="photogrid-iv"></div>').append(
					this.$imageViewWapper = $('<div class="photogrid-iv-wapper"></div>').append(
						this.$imgbox = $('<div class="photogrid-iv-imgbox" style="width:'+this.opts.imageViewImageBoxWidth+';"></div>').append(
								this.$loading = $('<div class="photogrid-loader"><b></b><b></b><b></b></div>'),
								this.$shownImgLink = $('<a href="#" target="_blank"></a>').append(
									this.$shownImg = $('<img class="photogrid-iv-img"/>')
								)							
						),//$imgbox.append
						this.$sep = $('<div class="photogrid-iv-sep"></div>'),
						this.$details,
						this.$btnClose = $('<span class="photogrid-iv-close" id="pgIvBtnClose"></span>'),
						this.$btnPrev	= $('<span class="photogrid-iv-btn photogrid-iv-nv-btn photogrid-iv-nv-btn-left" id="pgIvBtnPrev"><div></div></span>'),
						this.$btnNext	= $('<span class="photogrid-iv-btn photogrid-iv-nv-btn photogrid-iv-nv-btn-right" id="pgIvBtnNext"><div></div></span>')
					)//$imageViewWapper.append
				)//$imageView.append
				.css('height', this.opts.height);//默认440			
				
				// append imageView element to the item
				this.$item.append(this.$imageView.hide());

				//450	
				this.ivHeight = this.$imageView.outerHeight(true);
			},//create
			/**
			 * 更新特定$item
			 */
			update: function($item){
				var self = this;
				if($item) {
					this.$item = $item;
				}
				/*
					.photogrid-iv: {
						box-sizing: border-box;
						margin:10px 0 0 0;
						border:0;
						padding:20px;
					}
				*/		
				//保存item原来的高度
				this.itemHeight = this.$item.outerHeight();

				//存在展开的条目
				if(this.$imageView.is(':visible')){
					this.restoreItem();
				}
				this.$item.addClass('photogrid-expanded')
					.height(this.$item.height() + this.ivHeight);
				//更新当前条目
				this.$currentItem = this.$item;

				//前后按钮隐藏与否
				var $allItems = this.$element.find(this.opts.itemSelector);//所有item
				var currentIdx = $allItems.index(this.$currentItem);
				if(currentIdx === 0){//第一条
					this.$btnPrev.hide();				
				} else {
					this.$btnPrev.show();		
				}
				if(currentIdx === ($allItems.length - 1)){//最后一条
					this.$btnNext.hide();				
				} else {
					this.$btnNext.show();		
				}
				//右侧详细信息部分
				/*
				var source = '<h1>{{title}}</h1>';
				var template = Handlebars.compile(source);
				var context = {title: "My New Post"};
				var html		= template(context);
				*/
				var itemData = this.$currentItem.data('itemData');
				if(!itemData){
					var $databox = this.$currentItem.find(this.opts.itemDataSelector);
					if($databox.length>0){
						var dataStr = '';
						if($databox.is('input:text') || $databox.is('textarea')){
							dataStr = $.trim($databox.val());
						} else {
							dataStr = $.trim($databox.text());
						}
						if(JSON){
							try{
								itemData = JSON.parse(dataStr);
							} catch(e){
								itemData = eval('('+dataStr+')');
							}						
						} else {
							itemData = eval('('+dataStr+')');
						}
						if(itemData){
							this.$currentItem.data('itemData', itemData);
						}
					}//if($databox.length>0)
				}//if(!itemData)
				if($.isPlainObject(itemData)){
					if(!itemData.dimensions 
							&& this.$currentItem.data('dimensions')){							
						itemData.dimensions = this.$currentItem.data('dimensions');						
					}
					if(!this.opts.detailsTemplate){
						this.$title.html(itemData.title);
						this.$domain.html(itemData.domain).attr('href', itemData.domain);

						this.$desc.html(itemData.description);
						this.$srcLink.attr('href', itemData.srcLink);
						if(itemData.dimensions){
							this.$dimensions.text(itemData.dimensions);
						}
						if(itemData.pageLink) {
							this.$pageLink.attr('href', itemData.pageLink).show();
						} else {
							this.$pageLink.hide();
						}
					} else {
						//存在渲染器
						if(this.opts.templateRender && $.isFunction(this.opts.templateRender)){
							this.$details.empty().append(this.opts.templateRender(this.opts.detailsTemplate, itemData));
						} else {						
							//没有渲染器，使用Handlebars的渲染方式
							this.$details.empty().append(this.opts.detailsTemplate(itemData));
						}						
					}
				}//if($.isPlainObject(itemData)){

				//左侧图片部分			
				if(this.$loading){
					this.$loading.addClass('show-loader');
				}
				//结构:
				//this.$shownImgLink = $('<a href="#" target="_blank"></a>').append(
				//this.$shownImg = $('<img class="photogrid-iv-img"/>')
				var $thisImg = this.$currentItem.find('img').filter(':first');
				var newSrc = $thisImg.data('src') || $thisImg.attr('src');

				this.$shownImgLink.attr('href', newSrc);

				this.$shownImg.css('margin-top', 0).hide()
					.load(function(){
						if(self.$loading){
							self.$loading.removeClass('show-loader');
						}
						if(self.$imgbox.height() > self.$shownImg.height()){
							self.$shownImg.css('margin-top', ((self.$imgbox.height() - self.$shownImg.height()) / 2) + 'px');
						}
						self.$shownImg.fadeIn(350);

						//使用默认详细信息时，
						//前面没有获取到图片实际尺寸时，现在再次尝试
						if(!self.opts.detailsTemplate
							&& itemData 
							&& !itemData.dimensions){
							var imgEl = self.$shownImg.get(0);
							itemData.dimensions = imgEl.naturalWidth 
									+ ' x '
									+ imgEl.naturalHeight;
							self.$currentItem.data('dimensions', itemData.dimensions);		
							self.$dimensions.text(itemData.dimensions);
						}
					})//load
					.error(function(){
						if(self.$loading){
							self.$loading.removeClass('show-loader');
						}
						if(self.opts.pic404){
							$(this).attr('src', self.opts.pic404);
							self.$shownImgLink.attr('href', self.opts.pic404);
							self.$currentItem.addClass('photogrid-iv-img-404');
						}
					})
					.attr('src', newSrc);

				//移动主体
				this.$imageView.detach().appendTo(this.$currentItem).show();
				

				//调整详细信息部分宽度(默认为25%)
				var wapperWidth = this.$imageViewWapper.width();
				var imgboxWidth = this.$imgbox.outerWidth(true);
				var sepWidth = this.$sep.outerWidth(true);
				var detailsMaxWidth = wapperWidth - imgboxWidth - sepWidth - 10;//允许10个像素的误差
				var detailsInnerWidth = detailsMaxWidth - (this.$details.outerWidth(true) - this.$details.width());
				this.$details.width(detailsInnerWidth);

				this.positionImageView();
			},//update
			/**
			 * 初始化事件
			 */
			initEvent: function(){
				var self = this;
				//上一个按钮
				this.$btnPrev.off('click dblclick').on('click dblclick', function(){
					var $allItems = self.$element.find(self.opts.itemSelector);//所有item
					var currentIdx = $allItems.index(self.$currentItem);

					if(currentIdx <= 0){return false;}
					var $prevItem = $($allItems.get(currentIdx-1));

					self.update($prevItem);
					return false;
				});	

				//下一个按钮
				this.$btnNext.off('click dblclick').on('click dblclick', function(){
					var $allItems = self.$element.find(self.opts.itemSelector);//所有item
					var currentIdx = $allItems.index(self.$currentItem);

					if(currentIdx >= ($allItems.length - 1)){return false;}
					var $nextItem = $($allItems.get(currentIdx+1));

					self.update($nextItem);					
					return false;
				});

				//关闭按钮
				this.$btnClose.off('click dblclick').on('click dblclick', function(){
					self.hide();
				});
			},//initEvent
			/**
			 * 在原处展现（用于同一条目或同行条目）
			 */
			show: function() {
				this.setItem();
				this.$imageView.show();
			},//show
			/**
			 * 隐藏
			 */
			hide: function() {
				this.$imageView.hide();
				this.restoreItem();
			},//hide

			toggle: function(){
				if(this.$imageView.is(':visible')){
					this.hide();
				} else {
					this.show();
				}
			},
			/**
			 * 使滚动条移动到合适的位置
			 */
			positionImageView : function() {
				var offsetTop = this.$currentItem.offset().top;//距文档顶部的高度
				var targetTop = offsetTop + (this.itemHeight * 1/3);//滚动条目标位置			
				
				$('body').scrollTop(targetTop);
			},
			/**
			 * 设置item的高度和css
			 */
			setItem: function(){
				if(this.$currentItem){
					this.$currentItem.addClass('photogrid-expanded')
							.height(this.$currentItem.height() + this.ivHeight);
				}
			},
			/**
			 * 恢复$item的原貌
			 */
			restoreItem: function($item){
				//$item = $item || this.$currentItem;
				if(this.$currentItem){					
					this.$currentItem.removeClass('photogrid-expanded')
						.height(this.$currentItem.height() - this.ivHeight);				
				}
			},
			/**
			 * 销毁
			 */
			destroy: function(){		
				this.restoreItem();
				this.$imageView.remove();
			}

		}; //ImageView.prototype
		//默认选项
		ImageView.defaults = {
			/**
			 * 详细信息的 precompiled template	
			 * 在图片的右侧
			 * Note a precompiled template is a function	
			 * that takes a JavaScript object as its first argument	
			 * and returns a HTML string.
			 * 如:
			 * Handlebars.compile('<h1>{{title}}</h1>')
			 * 
			 * @type precompiled template 
			 */
		 	detailsTemplate: null
		 	/**
			* 编译后的模板渲染器
			* 接受两个参数: template, context
			* 必须返回一个渲染后的string
			* 如: 
			* templateRender: functon(template, context){
			* 	//Hogan
			* 	rerurn template.render(context);
			* }
			* 如果，detailsTemplate不为空，而templateRender为空，
			* 则默认使用Handlebars的样式:
			* 	rerurn template(context);
			* @type {Function}
			*/
			,templateRender: null
			 /**
				* ImageView的高度
				* height=内高+padding-top+padding-bottom
				* 			=内高+40
				* 			=css('height')
				* .photogrid-iv: {
						box-sizing: border-box;
						margin:10px 0 0 0;
						border:0;
						padding:20px;
					}
				* @type {Number}
				*/
			,height: 440
			/**
			 * 条目选择器
			 * @type {String}
			 */
			,itemSelector: '.photogrid-item'
			/**
			 * 条目数据的css选择器，不是必须的，只有找不到data('itemData')时才会尝试读取它
			 * @type {String}
			 * @default .data
			 */
			,itemDataSelector: '.photogrid-item-data'
			/**
			 * 图片未找到时显示的默认图片地址
			 * @type {String}
			 */
			,pic404: null
		};

		function noop(a) {}

		return ImageView;
	})();//ImageView


	/**
	 * 图片窗格主体
	 */
	var PhotoGrid = (function(){
		/**
		 * 全局变量
		 * =====================
		 */
		var photoGrids = [];//全部PhotoGrid对象数组

		/**
		 * 构造器
		 * =====================
		 */
		var PhotoGrid = function(element, options){
			var self = this;
			var pgid = 'pgid_'+Utils.randomDateLong();
			this.$element = $(element);
			this.$element.attr('pgid', pgid);
			this.opts = $.extend(true, {}, $.fn.photogrid.defaults, options);
			this._config = {
				 itemCls: 'photogrid-item'				 
				,itemDataCls: 'photogrid-item-data'
				,firstItemCls: 'photogrid-first-item'
				,lastItemCls: 'photogrid-last-item'
				,lastRowCls: 'photogrid-last-row'
				,cationCls: 'photogrid-caption'
				,cationTextCls: 'photogrid-caption-text'
			};
			this.inited = false;
			//窗口完全加载后再进一步初始化组件
			if(this.opts.initAfterWinLoad){
				this.$element.css('opacity', 0);
				this.$winLoader = $('<div class="photogridWinLoader photogrid-loader dark-loader show-loader"><b></b><b></b><b></b></div>');
				this.$element.before(this.$winLoader);
				
				$(window).load(function () {
					$(document).ready(function(){
							self._init();
					});//doc ready
				});//win.load
				//超时后自动初始化
				self.opts.winLoadTimeout = parseInt(self.opts.winLoadTimeout);
				setTimeout(function(){
					self._init();
				}, self.opts.winLoadTimeout);
			} else {
				this._init();
			}			
		};//PhotoGrid

		//imgReady作为静态变量
		PhotoGrid.imgReady = imgReady;
		//间接的全局对象
		$.PhotoGrid = PhotoGrid;

		/**
		 * 类方法/静态方法
		 * =====================
		 */
		//获取所有PhotoGrid对象
		PhotoGrid.getAll = function(){
			return photoGrids;
		};
		//销毁所有PhotoGrid对象
		PhotoGrid.destroyAll = function(){};

		/**
		 * 原型对象(对应实例方法)
		 * =====================
		 */
		PhotoGrid.prototype = {
			/**
			 * 初始化, 配置项整理，基本处理
			 * @private
			 */
			_init: function() {
				if(this.inited){ //已初始化，不再重复初始化
					reutrn;
				}
				this.inited = true;
				var self = this;
				//添加当前对象到全局数组photoGrids
				photoGrids.push(this);
				this.$element.data('photogrid', this);
				this.$element.addClass('photogrid');

				//配置项处理
				this.opts.rowHeight = parseInt(this.opts.rowHeight);
				this.opts.minMargin = parseInt(this.opts.minMargin);
				this.opts.maxMargin = parseInt(this.opts.maxMargin);
				this.opts.endlessTimes = parseInt(this.opts.endlessTimes);
				this.opts.endlessDistance = parseInt(this.opts.endlessDistance);
				this.opts.endlessTimeout = parseInt(this.opts.endlessTimeout);
				this.opts.minImageSize = parseInt(this.opts.minImageSize);
				this.opts.imageViewImageBoxWidth = Utils.getSize(this.opts.imageViewImageBoxWidth);
				//初始化基准高度
				if(this.opts.rowHeight){
					this.$element
						.find(itemSelector)
							.find('img').filter(':first')
								.attr('height', this.opts.rowHeight);
				}

				this.initLayout();	
				this.initEvents();	

				if(this.opts.initAfterWinLoad){
						this.$element.css('opacity', 1);
						this.$winLoader.remove()
				}

				if($.isFunction(this.opts.onInited)){
				 		//this.opts.onInited.call(this, arg1,..,argN);
				 		this.opts.onInited();
				}
			}
			/**
			 * 初始化布局
			 * 每次追加条目的时候都会追加初始化
			 * @param	{DOM Array| jQuery 集合} items
			 * 如果是jQuery集合，items[i]也将得到DOM元素
			 * @return {[type]}			 [description]
			 */
			,initLayout: function(items){
				var self = this;
				var container = this.$element.get(0);
				var options = this.opts;

				var rowWidth = 0,
						rowElems = [],
						items = items || container.querySelectorAll(options.itemSelector),
						itemsSize = items.length;
				
				for(var index = 0; index < itemsSize; ++index) {
					//reset classes
					var thisItem = items[index];
					var $thisItem = $(thisItem);

					//图片小于设定的最低尺寸，视为无效图片，删除整个条目
					var $thisImg = $thisItem.find('img').first();
					if($thisImg.get(0).naturalWidth < options.minImageSize ||
						$thisImg.get(0).naturalHeight < options.minImageSize ){						
						$thisItem.remove();
						continue;
					}

					//第一次时，保存最原始的style，以备恢复
					if($thisItem.is('[style]') && !$thisItem.data('style')){
						$thisItem.data('style', $thisItem.attr('style'));
					}
					$thisItem.removeAttr('style')
						.removeClass([
							options.firstItemClass,
							options.lastRowClass,
							self._config.firstItemCls,
							self._config.lastItemCls,
							self._config.lastRowCls].join(' '))
						.addClass(self._config.itemCls);

					//数据容器，主要用于无法使用jQuery#data的情况下绑定数据
					$thisItem.find(self.opts.itemDataSelector)
						.addClass(self._config.itemDataCls);

					//第一次时，保存最原始的title，以备恢复
					var $thisTitledImg = $thisItem.find('img').filter(':first[title]');
					if(!$thisTitledImg.data('title')){
						$thisTitledImg.data('title', $thisTitledImg.attr('title'));
					}
					$thisTitledImg.removeAttr('title');

					if(self.opts.caption){
						self.genCaptionView(thisItem);
					}
				}

				// read
				var containerWidth = container.clientWidth-parseFloat($(container).css('padding-left'))-parseFloat($(container).css('padding-right'));
				var itemAttrs = [];
				for(var i = 0; i < itemsSize; ++i) {
					itemAttrs[i] = {
						outerWidth: items[i].offsetWidth,
						height: items[i].offsetHeight
					};
				}

				// write
				for(var index = 0; index < itemsSize; ++index) {
					rowWidth += itemAttrs[index].outerWidth;
					rowElems.push(items[index]);
					
					// check if it is the last element
					if(index === itemsSize - 1) {
						for(var rowElemIndex = 0; rowElemIndex<rowElems.length; rowElemIndex++) {
							// if first element in row 
							if(rowElemIndex === 0) {
								rowElems[rowElemIndex].className += ' ' + options.lastRowClass + ' ' + self._config.lastRowCls;
							}
							rowElems[rowElemIndex].style.marginRight = (rowElemIndex < rowElems.length - 1)?options.minMargin+'px' : 0;
						}
					}			
					
					// check whether width of row is too high
					if(rowWidth + options.maxMargin * (rowElems.length - 1) > containerWidth) {
						var diff = rowWidth + options.maxMargin * (rowElems.length - 1) - containerWidth;
						var nrOfElems = rowElems.length;
						// change margin
						var maxSave = (options.maxMargin - options.minMargin) * (nrOfElems - 1);
						if(maxSave < diff) {
							var rowMargin = options.minMargin;
							diff -= (options.maxMargin - options.minMargin) * (nrOfElems - 1);
						} else {
							var rowMargin = options.maxMargin - diff / (nrOfElems - 1);
							diff = 0;
						}
						var rowElem,
							widthDiff = 0;
						for(var rowElemIndex = 0; rowElemIndex<rowElems.length; rowElemIndex++) {
							rowElem = rowElems[rowElemIndex];
							var rowElemWidth = itemAttrs[index+parseInt(rowElemIndex)-rowElems.length+1].outerWidth;
							var newWidth = rowElemWidth - (rowElemWidth / rowWidth) * diff;
							var newHeight = Math.round(itemAttrs[index+parseInt(rowElemIndex)-rowElems.length+1].height * (newWidth / rowElemWidth));
							if (widthDiff + 1 - newWidth % 1 >= 0.5 ) {
								widthDiff -= newWidth % 1;
								newWidth = Math.floor(newWidth);
							} else {
								widthDiff += 1 - newWidth % 1;
								newWidth = Math.ceil(newWidth);
							}
							rowElem.style.cssText =
									'width: ' + newWidth + 'px;' +
									'height: ' + newHeight + 'px;' +
									'margin-right: ' + ((rowElemIndex < rowElems.length - 1)?rowMargin : 0) + 'px';
							if(rowElemIndex === 0) {
								rowElem.className += ' ' + options.firstItemClass + '' + self._config.firstItemCls;
							}

							//去除rowElem下的img原先设置的现在已失效的height属性
							//留着会影响ImageView
							var $img = $(rowElem).find('img:first');
							//$img.removeAttr('height');
							//一律将img的高度设为计算后的item(img的容器)的高度newHeight
							$img.css('height', newHeight);
							/*
							//item(img的容器)的高度newHeight小于img实际高度naturalHeight时，
							//img会根据newHeight 100%填充，
							//反之，则需要将img的高度设为newHeight						
							if(newHeight > $img.get(0).naturalHeight){
								//img会展现默认实际的高度，然后通过原先设置的height对其进行纠正	
								$img.css('height', newHeight);												
							}*/
						}

						rowElems = [];
						rowWidth = 0;
					}
				}
			}
			/**
			 * 初始化事件，只在初始化组件的时候初始化一次
			 */
			,initEvents: function(){
				var self = this;

				//监控window.resize事件
				if(this.opts.resize) {
					$(window).off('resize.photogrid').on('resize.photogrid', function(e) {
							self.initLayout();
					});
				}

				//无限加载,监控window.scroll事件
				if($.isFunction(this.opts.endless)){
					this.isLoadingItems = false;
					this.endlessable = true;
					//有加载次数限制
					if(this.opts.endlessTimes){
						this.endlessTimes = this.opts.endlessTimes;
					} else {
						this.endlessTimes = 9999;
					}
					//监控window的scroll事件
					$(window).off('scroll.photogrid').on('scroll.photogrid', function(e) {
						//正在加载|加载次数用完|不可滚动加载
						if(self.isLoadingItems || !self.endlessTimes || !self.endlessable){
							return;
						}
						//判断是否到达点火位置
						if($(window).scrollTop()+$(window).height() >= $(document).height() - self.opts.endlessDistance) {
							self.isLoadingItems = true;
							self.endlessTimes--;

							//加载的超时处理
							setTimeout(function(){
								self.appended();
								self.isLoadingItems = false;
							}, self.opts.endlessTimeout);

							//self.opts.endless.call(self, done, imgReady);
							self.opts.endless(function(error){
								//执行完用户定义的endless函数后，用户必须显式地调用done();
								//这样便于用户ajax或异步地处理数据
								
								if(!error){	//没有出现错误				 			
									self.appended();
								}
								self.isLoadingItems = false;
							}, imgReady);//集成imgReady作为第二个参数
						}
					});//$(window).on('scroll.photogrid
				}//if($.isFunction(this.opts.endless)

				this.initItemEvents();
			}//initEvents
			/**
			 * 初始化条目的事件,每次追加条目的时候都会追加初始化
			 */
			,initItemEvents: function($items){
				var self = this;
				$items = $items || this.$element.find(this.opts.itemSelector);

				$items.children('a').off('click.photogrid').on('click.photogrid', function(e){
					var $thisItem = $(this).parent();
					if(self.imageView){
						//imageView已经初始化过，更新之
						//$thisItem即是当前展现或刚才展现过的条目
						if(self.imageView.$currentItem.is($thisItem)){
							//切换显示状态
							self.imageView.toggle();
						} else {									
							self.imageView.update($thisItem);
						}
					} else {
						//第一次点击，新建之
						var ivOptions = {
							 "detailsTemplate": self.opts.detailsTemplate
							,"templateRender": self.opts.templateRender
							,"height": self.opts.imageViewheight
							,"imageViewImageBoxWidth": self.opts.imageViewImageBoxWidth
							,"itemSelector": '.'+self._config.itemCls
							,"itemDataSelector": '.'+self._config.itemDataCls
							,"pic404": self.opts.pic404
						};						
						self.imageView = new ImageView($thisItem, self.$element, ivOptions);
					}

					//避免触发a的链接动作
					e.preventDefault();
					return false;
				});//$items.on('click
			}//initItemEvents

			/**
			 * 追加更新条目
			 * @return {[type]} [description]
			 */
			,appended: function(){
				var $lastRow = this.$element
					.find('.' + this._config.lastRowCls);
				 var items = $lastRow.nextAll().add($lastRow);
				
				 this.initLayout(items);
				 this.initItemEvents(items);
				 if($.isFunction(this.opts.onAppended)){
				 		//this.opts.onAppended.call(this, arg1,..,argN);
				 		this.opts.onAppended();
				 }
			}
			/**
			 * 更新组件
			 * @return {[type]} [description]
			 */
			,updated: function(){
				this.initLayout();
				this.imageView.destroy();
				delete this.imageView;

				this.initItemEvents();
				if($.isFunction(this.opts.onUpdated)){
				 		//this.opts.onUpdated.call(this, arg1,..,argN);
				 		this.opts.onUpdated();
				 }
			}

			/**
			 * 生成图片的字幕视图
			 */
			,genCaptionView: function(item){
				var $item = $(item);
				var $img = $item.find('img').filter(':first');
				var text = this.genCaptionText($img, $item);
				var $caption = $([
				'<div class="photogrid-caption">',
						'<span class="photogrid-caption-text">'+text+'</span>',
				'</div>'].join(''));
				$caption.insertAfter($img);
			}

			/**
			 * 获得图片的标题字幕文本
			 */
			,genCaptionText: function(img, $item){
				img = $(img).get(0);
				var domain = '';
				if(Utils.isHttpUrl(img.src)){
					domain = ' - ' + Utils.getDomainFormUrl(img.src);
				}
				var dimensions = img.naturalWidth 
					+ ' x '
					+ img.naturalHeight;

				$item.data('dimensions', dimensions);

				return dimensions + domain;
			}
			/**
			 * 停止滚动加载
			 */
			,stopEndless: function(){
				this.endlessable = false;
			}
			/**
			 * 销毁
			 */
			,destroy: function(){
				//恢复DOM
				this.$element
					.find(this.opts.itemSelector)
						.each(function(){
							var $thisItem = $(this);
							if($thisItem.data('style')){
								$thisItem.attr('style', $thisItem.data('style'));
							}
							$thisItem.removeClass([
								this.opts.firstItemClass,
								this.opts.lastRowClass,
								this._config.firstItemCls,
								this._config.lastItemCls,
								this._config.lastRowCls,
								this._config.itemCls].join(' '))
							.off('.photogrid');

							var $thisTitledImg = $thisItem.find('img').filter(':first');
							if($thisTitledImg.data('title')){
								$thisTitledImg.attr('title', $thisTitledImg.data('title'));
							}

						});//each
				
				this.$element.find('.photogrid-caption').remove();
				this.$element.removeClass('photogrid');
				this.$element.removeData('photogrid');
				
				$(window).off('.photogrid');

				this.imageView.destroy();

				//删除对象
				delete this.opts;
				delete this.$element;

				//从全局photoGrids数组中删除当前对象
				photoGrids.splice($.inArray(this, photoGrids), 1);
			}
			//空函数
			,noop: function(){}
		};//PhotoGrid.prototype

		function noop(a) {}

		return PhotoGrid;
	})();//PhotoGrid


	/**
	 * jQuery插件
	 * =====================
	 */
	$.fn.photogrid = function(options) {		
		//参数类型判断
		//第一个参数是string类型，对已有对象调用方法
		if (typeof options === 'string') {
			var args = arguments,
				method = options;
			if (method.charAt(0) == "_"){ //不处理私有方法
				return this;
			}
			Array.prototype.shift.call(args);//移除第一个参数，即options
			if (method.substr(0,3) == "get"){ //取值类方法，只获得第一个元素的返回值			
				var $first = $($(this)[0]);
				var photogrid = $first.data('photogrid');
				if (photogrid && photogrid[method]){
					return photogrid[method].apply(photogrid, args);
				}
			}
			else { //其他方法
				return this.each(function() {
					var photogrid =	$(this).data('photogrid');
					if (photogrid && photogrid[method]) {
						photogrid[method].apply(photogrid, args);
					}
				});
			}
		}//eof:if (typeof options == 'string')

		//初始化参数
		var opts = $.extend(true, {}, $.fn.photogrid.defaults, options);

		//新建对象
		return this.each(function() {
			if($(opts.itemSelector, this).length != 0){
				new PhotoGrid(this, opts);
			}
		});
	};//$.fn.photogrid

	/**
	 * 默认值
	 * =====================
	 */
	$.fn.photogrid.defaults = {
		/**
		 * 条目的css选择器
		 * @type {String}
		 * @default .item
		 */
		itemSelector: '.item'
		/**
		 * 条目数据的css选择器，不是必须的，只有找不到data('itemData')时才会尝试读取它
		 * @type {String}
		 * @default .data
		 */
		,itemDataSelector: '.data'
		/**
		 * 条目的基准高度
		 * 最终条目的高度都等于或接近基准高度
		 * 不推荐使用，建议直接在组装DOM的时候就给图片加上 height 属性
		 * 或者设置器CSS中的height属性
		 * @type {Number}
		 * @default null
		 */
		,rowHeight: null
		/**
		 * 行内条目之间的最小水平margin
		 * @type {Number}
		 * @default 6
		 */
		,minMargin: 6
		/**
		 * 行内条目之间的最大水平margin
		 * @type {Number}
		 * @default 15
		 */
		,maxMargin: 15
		/**
		 * 设为 true 将在on window resize events时改变更新布局
		 * @type {boolean}
		 * @default true
		 */
		,resize: true
		/**
		 * 图片的字幕
		 * @type {Boolean}
		 */
		,caption: true
		/**
		 * 窗口完全加载后再初始化组件
		 * 之前会显示等待中图标，
		 * 目标区域opacity:0,
		 * 初始化结束后opacity:1，移除等待框
		 * 建议页面自己在window.load时初始化组件
		 * @type {Boolean}
		 */
		,initAfterWinLoad: false		
		/**
		 * 等待窗口完全加载的超时，时间后会强制加载，
		 * initAfterWinLoad=false时，winLoadTimeout无效
		 * @type {Number}
		 */
		,winLoadTimeout: 3000
		/**
		 * 图片的最小宽度和最小高度
		 * 宽度或高度低于此值的图片将不会显示
		 * @type {Number}
		 */
		,minImageSize: 0
		/**
		 * 每行第一个条目的class
		 * @type {String}
		 * @default ''
		 */
		,firstItemClass: ''
		/**
		 * 最后一行第一个条目的class
		 * @type {String}
		 * @default ''
		 */
		,lastRowClass: ''
		/**
		 * 布局，事件等初始化完毕
		 * @type {function} functon(){}
		 */
		,onInited: null
		/**
		 * 追加条目结束
		 * @type {function} functon(){}
		 */
		,onAppended: null
		/**
		 * 更新条目结束
		 * @type {function} functon(){}
		 */
		,onUpdated: null
		/**
		 * 无限加载
		 * 在此函数中添加新的条目，更新DOM，
		 * 一切更新完成后调用done();
		 * 
		 * 接收一个函数参数done
		 * @type {function} functon(done){...; done();}
		 */
		,endless: null
		/**
		 * 无限加载次数
		 * 默认不限次
		 * @type {number}
		 */
		,endlessTimes: 0
		/**
		 * 滚动条距离底部多少像素的时候开始加载，默认0
		 * @type {Number}
		 */
		,endlessDistance: 0
		/**
		 * 加载的超时时间，默认3000ms
		 * @type {Number}
		 */
		,endlessTimeout: 3000
		/*--------ImageView----------*/
		/**
		 * 详细信息的 precompiled template	
		 * 在图片的右侧
		 * Note a precompiled template is a function	
		 * that takes a JavaScript object as its first argument	
		 * and returns a HTML string.
		 * 如:
		 * Handlebars.compile('<h1>{{title}}</h1>')
		 * 
		 * @type precompiled template 
		 */
		 ,detailsTemplate: null
		 /**
			* 编译后的模板渲染器
			* 接受两个参数: template, context
			* 必须返回一个渲染后的string
			* 如: 
			* templateRender: functon(template, context){
			* 	//Hogan
			* 	rerurn template.render(context);
			* }
			* 如果，detailsTemplate不为空，而templateRender为空，
			* 则默认使用Handlebars的样式:
			* 	rerurn template(context);
			* @type {Function}
			*/
		 ,templateRender: null
		 /**
			* ImageView的高度
			* height=内高+padding-top+padding-bottom
			* 			=内高+40
			* 			=css('height')
			* .photogrid-iv: {
					box-sizing: border-box;
					margin:10px 0 0 0;
					border:0;
					padding:20px;
				}
			* @type {Number}
			*/
		,imageViewheight: 440

		 /**
			* ImageView中左侧图片显示部分(.photogrid-iv-imgbox)的宽度
			* 可以是百分百，也可以是像素值
			* @type {String}
			*/
		,imageViewImageBoxWidth: "65%"
		/**
		 * 图片未找到时显示的默认图片地址,
		 * 此时item上面会加上CSS类 photogrid-iv-img-404
		 * @type {String}
		 */
		,pic404: null
	};//$.fn.photogrid.defaults
})(jQuery);