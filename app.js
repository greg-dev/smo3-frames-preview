'use strict';

window.onload = function () {
  app.init('#app');
};

var app = {
  domain: 'loadobfp.ru'.replace('obf', 'u', 'scated'),

  /* subdomains from frame2 to frame11 */
  subdomains: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (x) { return 'frame' + x; }),

  urlTemplate: 'https://[SUBDOMAIN].[DOMAIN]/[H]/[A]/[SH].[IMAGE].[SIZE].jpg',

  getUrlRegex: function () {
    return '^.*(' + app.subdomains.join('|') + ').(' + app.domain + ')' +
      '\/([0-9a-f]{2})\/([0-9a-f]{2})\/([0-9]{7,8}).([0-9]{1,4}).([1-3]{1}.jpg)$';
  },

  sizes: [
    {values: '3|400', label: 'big'},
    // {values: '2|100', label: 'medium'},
    {values: '1|80', label: 'small'}
  ],

  imgSize: 3,
  imgWidth: 400,

  init: function (root) {
    var $container = document.createDocumentFragment();

    var $label = document.createElement('label');
    $label.htmlFor = 'url';
    $label.innerText = 'url:';
    $container.appendChild($label);

    var $url = document.createElement('input');
    $url.id = 'url';
    $url.type = 'text';
    $url.placeholder = '//frame7.' + app.domain + '/c6/84/10473728.1.3.jpg';
    $url.value = '//frame7.' + app.domain + '/c6/84/10473728.5.3.jpg';
    $url.addEventListener('change', function () {
      app.updateUrl();
    });
    $container.appendChild($url);
    app.$url = $url;

    $label = document.createElement('label');
    $label.htmlFor = 'start';
    $label.innerText = 'start:';
    $container.appendChild($label);

    var $start = document.createElement('input');
    $start.id = 'start';
    $start.type = 'text';
    $start.value = 1;
    $start.maxLength = 4;
    $start.style.width = '40px';
    $container.appendChild($start);
    app.$start = $start;

    $label = document.createElement('label');
    $label.htmlFor = 'end';
    $label.innerText = 'end:';
    $container.appendChild($label);

    var $end = document.createElement('input');
    $end.id = 'end';
    $end.type = 'text';
    $end.value = 5;
    $end.maxLength = 4;
    $end.style.width = '40px';
    $container.appendChild($end);
    app.$end = $end;

    for (var i = 0; i < app.sizes.length; i++) {
      var $size = document.createElement('input');
      $size.name = 'size';
      $size.type = 'radio';
      $size.checked = !i;
      $size.value = app.sizes[i].values;
      $container.appendChild($size);
      $size.insertAdjacentText('afterend', app.sizes[i].label);
      $size.addEventListener('change', function (el) {
        var values = el.target.value.split('|');
        app.imgSize = values[0];
        app.imgWidth = parseInt(values[1]);
      });
    }

    var $submit = document.createElement('button');
    $submit.innerText = 'submit';
    $submit.addEventListener('click', function () {
      if (app.validateUrl()) {
        app.start();
      }
    });
    $container.appendChild($submit);
    app.$submit = $submit;

    var $stop = document.createElement('button');
    $stop.innerText = 'stop';
    $stop.disabled = true;
    $stop.addEventListener('click', function () {
      app.stop();
    });
    $container.appendChild($stop);
    app.$stop = $stop;

    var $info = document.createElement('div');
    $info.style.width = '100%';
    $container.appendChild($info);
    app.$info = $info;

    var $pics = document.createElement('div');
    $pics.addEventListener('click', function () {
      app.$zoom.style.display = 'none';
    });
    $container.appendChild($pics);
    app.$pics = $pics;

    var $zoom = document.createElement('img');
    $zoom.id = 'zoom';
    $zoom.style.position = 'absolute';
    $zoom.style.width = 400;
    $zoom.style.height = 300;
    $zoom.style.display = 'none';
    $zoom.addEventListener('click', function () {
      app.$zoom.style.display = 'none';
    });
    $container.appendChild($zoom);
    app.$zoom = $zoom;

    var $root = document.querySelector(root);
    while ($root.firstChild) {
      $root.removeChild($root.firstChild);
    }
    $root.appendChild($container);
  },

  start: function () {
    app.$submit.disabled = true;
    app.$stop.disabled = false;
    app.clear();
    app.getImages();
  },

  stop: function () {
    app.$stop.disabled = true;
    app.$submit.disabled = false;
    return false;
  },

  clear: function () {
    var $pics = app.$pics;
    while ($pics.firstChild) {
      $pics.removeChild($pics.firstChild);
    }
  },

  validateUrl: function () {
    var re = new RegExp(app.getUrlRegex());
    if (re.test(app.$url.value)) {
      return true;
    } else {
      app.error('Invalid url');
      return false;
    }
  },

  updateUrl: function () {
    var parts = app.$url.value.split(new RegExp(app.getUrlRegex()));
    if (parts.length === 9) {
      app.$start.value = 1;
      app.$end.value = parts[6];
      return true;
    } else {
      app.error('Invalid url');
      return false;
    }
  },

  getFirstImageUrl: function () {
    var parts = app.$url.value.split(new RegExp(app.getUrlRegex()));
    app.url = app.urlTemplate
      .replace('[DOMAIN]', parts[2])
      .replace('[H]', parts[3])
      .replace('[A]', parts[4])
      .replace('[SH]', parts[5])
      .replace('[SIZE]', app.imgSize);
    app.currentImage = parseInt(app.$start.value);
    app.currentSubdomain = -1;
    app.lastImage = parseInt(app.$end.value);
    app.info('getting image ' + app.currentImage + '/' + app.lastImage);
    return app.getNextImageUrl();
  },

  getImages: function () {
    app.getImage(app.getFirstImageUrl());
  },

  getNextImageUrl: function () {
    app.currentSubdomain++;
    if (app.currentSubdomain >= app.subdomains.length) {
      app.currentSubdomain = 0;
      app.currentImage++;
      app.info('getting image ' + app.currentImage + '/' + app.lastImage);
    }
    if (app.currentImage > app.lastImage) {
      return false;
    }
    app.info(app.$info.textContent + '.');
    return app.url
      .replace('[SUBDOMAIN]', app.subdomains[app.currentSubdomain])
      .replace('[IMAGE]', app.currentImage);
  },

  getImage: function (url) {
    if (app.$stop.disabled) {
      return app.stop();
    }
    var $img = document.createElement('img');
    $img.onload = function (x) {
      if ($img.naturalWidth === app.imgWidth) {
        $img.title = $img.src;
        if (app.imgSize < 3) {
          $img.addEventListener('mouseover', function (ev) {
            app.zoom(ev);
          });
        }
        app.$pics.appendChild($img);
        app.currentSubdomain = app.subdomains.length;
      }

      var url = app.getNextImageUrl();
      if (url) {
        app.getImage(url);
      } else {
        app.info('all done');
        return app.stop();
      }
    };
    $img.src = url;
  },

  zoom: function (ev) {
    app.$zoom.style.display = 'block';
    app.$zoom.style.left = ev.clientX + 'px';
    app.$zoom.style.top = ev.clientY + 'px';
    app.$zoom.src = ev.target.src.replace(app.imgSize + '.jpg', '3.jpg');
  },

  info: function (msg) {
    console.log(msg);
    app.$info.textContent = msg;
  },

  error: function (msg) {
    console.log(msg);
  }
};
