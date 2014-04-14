# photogrid - jQuery plugin

A jQuery plugin to arrange images into a flexible grid. It looks like Google images gallery.

##Main features
- Like Google images gallery
- Endless scroll supported
- Ajax supported
- Precompiled template supported, e.g. Handlebars   


## Demo
- TagFay: [http://www.tagfay.com/image](http://www.tagfay.com/image)
![](./snapshot.jpg)

## Usage
Add three lines to the HEAD:
```html
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<script src="jquery.photogrid.min.js" type="text/javascript" ></script>
<link href="jquery.photogrid.min.css" rel="stylesheet" type="text/css">
```
Add this to page code:
```html
<div id="ImageBox">
    <!-- height attribute of img  is required -->
    <div class="item"><a href="#"><img src="images\1.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\2.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\3.jpg" height="200"/></a></div>
</div>
```
Add this to page script:
```html 
<script type="text/javascript">
    $(window).load(function () {
        $(document).ready(function(){
            $("#ImageBox").photogrid({
                itemSelector: ".item"     
            });
        });
    });
</script>
```

## Options
- `itemSelector`:  **{String}[Optional]**, **default**:`'.item'`
   CSS selector for items

- `itemDataSelector`:  **{String}[Optional]**, **default**:`'.data'`
   CSS  selector for item data. If `data('itemData')` is undefined, this selector points to the data container. And the data container will set to hidden automatically. e.g.:
    ```html
    <div class="item">
        <a href="#"><img src="images1.jpg" height="200"/></a>
        <div class="data">
            {title:'aaaa', description:'bbbbb', tags:'xx,yy,zz'}
        </div>
    </div>
    ```
- `rowHeight`:  **{Number}[Optional]**, **default**:`null`
    The base height of item. The final height will be equal or close to it.
    It is recommend that you set the height attribue of `img` in DOM or by css.

-  `minMargin`:  **{Number}[Optional]**, **default**:`6`
    The minimum margin between items in each row.

-  `maxMargin`:  **{Number}[Optional]**, **default**:`15`
    The maximal margin between items in each row.

-  `resize`:  **{Boolean}[Optional]**, **default**:`true`
    If true,  the layout will be update on window resize events.

-  `caption`:  **{Boolean}[Optional]**, **default**:`true`
    If true, the item's caption will be shown on mouse hover events.

-  `initAfterWinLoad`:  **{Boolean}[Optional]**, **default**:`false`
    If true, the plugin will be initialized after window loaded. Before the window loaded, the target container will set to `opacity:0`, and after window loaded, it will set to `opacity:1`.
    It is recommend that you initialize this plugin in `window.onload` callback function.
    ```js
    $(window).load(function () {
        $(document).ready(function(){
            $("#ImageBox").photogrid({
                itemSelector: ".item"         
            });
        });
    });
    ```

-  `winLoadTimeout`:  **{Number}[Optional]**, **default**:`3000`
    How long the plugin will wait before `window.onload` event. After this dual, the plugin will initialize forcely. This option is valid only when `initAfterWinLoad` is set to true.
    

-  `minImageSize`:  **{Number}[Optional]**, **default**:`16`
    Images whose size(height or width) less than `minImageSize` will not show.

-  `firstItemClass`:  **{String}[Optional]**, **default**:`''`
    It will be add to the first item of each row.

-  `lastRowClass`:  **{String}[Optional]**, **default**:`''`
    It will be add to the first item of the last row.       

-  `onInited`:  **{Function}[Optional]**, **default**:`null`
    Define a function to be called when the plugin is initialized.  

-  `onAppended`:  **{Function}[Optional]**, **default**:`null`
    Define a function to be called when new items are appened dynamically.
            
-  `endless`:  **{Function}[Optional]**, **default**:`null`
    Endless scrolling(or infinite scrolling). If it is a function, the page will keeps loading with new items attached to the end. The function has two parameter: `done` and `imgReady`. After updating the DOM, you must call `done();` manually. See the example below. 
    If set to `null`, endless scrolling will not be supported.
    
-  `endlessTimes`:  **{Number}[Optional]**, **default**:`0`
How many times the plugin will load new items attached to the end.
Set `0` if not limit wanted.

-  `endlessDistance`:  **{Number}[Optional]**, **default**:`0`
The number of pixels from the boundary of the window that triggers the event.

-  `endlessTimeout`:  **{Number}[Optional]**, **default**:`3000`
How long the plugin will wait before new items append to the DOM. After this dual, the plugin will call `done();` forcely. 

-  `detailsTemplate`:  **{Object}[Optional]**, **default**:`null`   
Precompiled template for each image's detail. A precompiled template is a function that takes a JavaScript object as its first argument and returns a HTML string. e.g.: `Handlebars.compile('<h1>{{title}}</h1>')`

-  `templateRender`:  **{Function}[Optional]**, **default**:`null`  
A function defines how to render a precompiled template with a context to a HTML string. e.g.: 
    ```js
     templateRender: function(template, context){
        //Hogan
        rerurn template.render(context);
    }
    ```
If `detailsTemplate` is not null, while `templateRender` is null, the built-in function will be used:
    ```js
    function render(template, context){
        rerurn template(context);//Handlebars style
    }
    ```

-  `imageViewheight`:  **{Number}[Optional]**, **default**:`440`
Define the height of the image viewer. 

## API
Call these methods like this:
```js
$("#ImageBox").photogrid('appended');
```
- `appended`: inform the plugin that the new items are appended to the DOM, and it can take the next step.
- `destroy`:   destory the plugin.
- `stopEndless`: stop endless scrolling.

##Example
JS:
```js
$(window).load(function () {
    $(document).ready(function(){
        $("#ImageBox").photogrid({
            itemSelector: ".item",
            endless: endless,
            endlessTimes: 3,
            endlessDistance: 50       
        });
    });
});

function endless(done, imgReady){
   var colors = ['ff0000','00ff00' ,'0000ff', '808080', '008080' , 'FF6600'];
   var randomColor = colors[Math.ceil((Math.random() * 100)) % colors.length];
   var imgs = [
        'http://placehold.it/480x300/'+randomColor+'/ffffff?',
        'http://placehold.it/500x300/'+randomColor+'/ffffff?',
        'http://placehold.it/600x500/'+randomColor+'/ffffff?',
        'http://placehold.it/1024x500/'+randomColor+'/ffffff?',
        'http://placehold.it/780x857/'+randomColor+'/ffffff?',
        'http://placehold.it/490x570/'+randomColor+'/ffffff?,
        'http://placehold.it/480x480/'+randomColor+'/ffffff?',
        'http://placehold.it/880x530/'+randomColor+'/ffffff?',
        'http://placehold.it/280x400/'+randomColor+'/ffffff?',
        'http://placehold.it/450x550/'+randomColor+'/ffffff?',
        'http://placehold.it/680x300/'+randomColor+'/ffffff?',
        'http://placehold.it/300x600/'+randomColor+'/ffffff?'
   ];  

   var imgOk = [];
   $.each(imgs, function(i, url){     
        console.log(i+"/"+imgs.length+" is loading, url:"+url);

        var img = document.createElement('img');               
        img.height = 200;
        img.index = i;
        img.src = url;
        
        /**
         * lazy show the photos one by one
         * imgReady - a fast way to detect the image's size.
         * @see :http://code.google.com/p/redeem-point-system/source/browse/trunk/WebRoot/js/util/imgReady.js?r=85
        */
        imgReady(img, function ready(){
            var index = img.index;
            console.log(index+"/"+imgs.length+" loaded");

            var $item =  $('<div class="item"></div>')
            .append(
                $('<a href="'+img.src+'"></a>')
                    .append(img))
                    .appendTo("#ImageBox");
                    
            $item.data('itemData', {
                title: img.src,
                domain: img.src,
                dimensions: img.naturalWidth + ' x '+ img.naturalHeight,
                description: 'description-'+index,
                srcLink: img.src,
                pageLink: 'http://www.google.com'
            });
            imgOk.push(index);
            
            //If all new items are appended to the DOM
            if(imgOk.length === imgs.length){  
                console.log("------done--------");
                done();
            }
        }, null, function error(){
            var index = img.index;
            console.log(index+"/"+imgs.length+" error");

            imgOk.push(index);
            
            //If all new items are appended to the DOM
            if(imgOk.length === imgs.length){  
                console.log("------done--------");
                done();
            }
        });//imgReady                   
   });//each
}//endlessCbk
```

HTML:
```html
<div id="ImageBox">
    <div class="item"><a href="#"><img src="images\1.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\2.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\3.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\4.jpg"height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\5.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\6.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\7.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\8.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\9.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\11.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\13.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\14.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\15.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\16.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\17.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\e.gif" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\f.gif" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\g.gif" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\h.gif" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\i.gif" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\j.gif" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\k.gif" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\l.jpg" height="200"/></a></div>
    <div class="item"><a href="#"><img src="images\m.png" height="200"/></a></div>
</div>
```