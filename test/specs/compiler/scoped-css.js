describe('Scoped CSS', function() {

  function render(str) {
    return compiler.style(str, 'my-tag', 'scoped-css')
  }

  it('add my-tag to the simple selector', function() {
    expect(render('h1 { font-size: 150% }'))
        .to.match(/my-tag h1[^{]+\{ font-size: 150% \}/)
  })
  it('add my-tag to the multi selector in a line', function() {
    expect(render('h1 { font-size: 150% } #id { color: #f00 }'))
        .to.match(/my-tag h1[^{]+\{ font-size: 150% \} my-tag #id[^{]+\{ color: #f00 \}/)
  })
  it('add my-tag to the complex selector', function() {
    expect(render('header a.button:hover { text-decoration: none }'))
        .to.match(/my-tag header a.button:hover[^{]+\{ text-decoration: none \}/)
  })
  it('add my-tag to the comma-separated selector', function() {
    expect(render('h2, h3 { border-bottom: 1px solid #000 }'))
        .to.match(/my-tag h2[^{]+,my-tag h3[^{]+\{ border-bottom: 1px solid #000 \}/)
  })
  it('add my-tag to the attribute selector', function() {
    expect(render('i[class=twitter] { background: #55ACEE }'))
        .to.match(/my-tag i\[class=twitter\][^{]+\{ background: #55ACEE \}/)
  })
  it('add my-tag to the selector with a backslash', function() {
    expect(render('a:after { content: "*" }'))
        .to.match(/my-tag a:after[^{]+\{ content: "\*" \}/)
  })
  it('add my-tag to the selector with multi-line definitions', function() {
    expect(render('header {\n  text-align: center;\n  background: rgba(0,0,0,.2);\n}'))
        .to.match(/my-tag header[^{]+\{ text-align: center; background: rgba\(0,0,0,.2\); \}/)
  })
  it('add my-tag to the root selector', function() {
    expect(render(':scope { display: block }'))
        .to.match(/my-tag[^{]+\{ display: block \}/)
  })
  it('add my-tag to the nested root selector', function() {
    expect(render(':scope > ul { padding: 0 }'))
        .to.match(/my-tag > ul[^{]+\{ padding: 0 \}/)
  })
  it('not add my-tag to @font-face', function() {
    expect(render('@font-face { font-family: "FontAwesome" }'))
        .to.equal('@font-face { font-family: "FontAwesome" }')
  })
  it('not add my-tag to @media, and add it to the selector inside', function() {
    expect(render('@media (min-width: 500px) {\n  header {\n    text-align: left;\n  }\n}'))
        .to.match(/@media \(min-width: 500px\) \{ my-tag header[^{]+\{ text-align: left; \} \}/)
  })

})
