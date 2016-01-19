slide
  .image-slide(each='{url,index in imgList}')
    img.slider-item(src="{url}")
  script(type='text/coffeescript').
    @imgList = ['abc','bdc']