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
			},
			/**
			 * 从url解析出域名
			 * @param	{String} url
			 * @return {String}
			 */
			getDomainFormUrl: function(url){
				if(typeof url === 'undefined' || null === url){ 
					return '';
				}
				var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
				var domain = matches && matches[1];
				return domain;
			}, //eof:getDomainFormUrl
			noop:function(){}
		};//return
	})();//Utils
