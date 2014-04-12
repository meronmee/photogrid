
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
			this.$element = $(element);
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
							"detailsTemplate": self.opts.detailsTemplate,
							"templateRender": self.opts.templateRender,
							"height": self.opts.imageViewheight,
							"itemSelector": '.'+self._config.itemCls,
							"itemDataSelector": '.'+self._config.itemDataCls,
						};						
						self.imageView = new ImageView($thisItem, self.$element, ivOptions);
					}

					//避免触发a的链接动作
					e.preventDefault();
					return false;
				});//$items.on('click
			}//initItemEvents

			/**
			 * 追加更更新条目
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
