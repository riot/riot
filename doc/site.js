
!(function() {

  var toc = $('#toc'),
      links = $('a', toc )

  // navi highlight
  links.click(function() {

    var el = $(this),
        href = el.attr('href')

    if (!href) return false

    href = href.split('#')

    if (href[1] && href[0] == location.pathname) {
      var h = $('#' + href[1])
      links.removeClass('current')
      toc.removeClass('active')
      el.addClass('current')
      global.scroll(h, 30)
      return false
    }

  })

  var header = $('#riot-header'),
      last_pos = []

  $(window).scroll(function() {
    var pos = window.scrollY,
        diff = last_pos - pos

    if (Math.abs(diff) > 50) {
      header.toggleClass('fixed', pos > 550 && diff > 50)
      last_pos = pos
    }

  })

  $('#to-top').click(function() {
    global.scroll($('#content'), 80)
  })


  $('#burger, #toc .close').click(function() {
    toc.toggleClass('active')
  })

})()