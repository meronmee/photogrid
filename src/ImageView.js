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
						this.$imgbox = $('<div class="photogrid-iv-imgbox"></div>').append(
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
				var newSrc = this.$currentItem.find('img').filter(':first').attr('src');
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
		};

		function noop(a) {}

		return ImageView;
	})();//ImageView

