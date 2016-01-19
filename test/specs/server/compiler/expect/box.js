//src: box.tag
riot.tag2('content', '<div class="box"> <h1>{box.title}</h1> <img riot-src="{box.image}" width="480"> <div class="body">{box.body}</div> </div>', '', '', function(opts) {

  this.box = {
      title: "Good morning!",
      image: "http://trinixy.ru/pics5/20130614/podb_07.jpg",
      body: "It is when SO!"
  }
}, '{ }');