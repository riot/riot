riot.tag2('slide', '<div each="{url,index in imgList}" class="image-slide"><img riot-src="{url}" class="slider-item"></div>', '', '', function(opts) {
this.imgList = ['abc', 'bdc'];
}, '{ }');