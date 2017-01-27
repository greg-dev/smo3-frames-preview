"use strict";

window.onload = function() {
  app.init('#app');
};

var app = {
  domain: 'loadobfp.ru'.replace('obf','u','scated'),

  /* subdomains from frame2 to frame11 */
  subdomains: [2,3,4,5,6,7,8,9,10,11].map(function(x) { return 'frame' + x; }),

  urlTemplate: 'https://${SUBDOMAIN}.${DOMAIN}/${H}/${A}/${SH}.${IMAGE}.3.jpg',

  getUrlRegex: function() {
    return '^.*(' + app.subdomains.join('|') + ').(' + app.domain + ')' +
      '\/([0-9a-f]{2})\/([0-9a-f]{2})\/([0-9]{7,8}).([0-9]{1,4}).([1-3]{1}.jpg)$';
  },

  init: function(root) {
    var $container = document.createDocumentFragment();

    var $url = document.createElement('input');
    $url.type = 'text';
    $url.placeholder = '//frame7.' + app.domain + '/c6/84/10473728.1.3.jpg';
    $url.value = '//frame7.' + app.domain + '/c6/84/10473728.5.3.jpg';
    $container.appendChild($url);
    app.$url = $url;

    var $submit = document.createElement('button');
    $submit.innerText = 'submit';
    $submit.addEventListener('click', function(){
      if (app.validateUrl()){
        app.clear();
        app.getImages();
      }
    });
    $container.appendChild($submit);

    var $pics = document.createElement('div');
    $container.appendChild($pics);
    app.$pics = $pics;

    var $root = document.querySelector(root);
    while ($root.firstChild) {
      $root.removeChild($root.firstChild);
    }
    $root.appendChild($container);
  },

  clear: function() {
    var $pics = app.$pics;
    while ($pics.firstChild) {
      $pics.removeChild($pics.firstChild);
    }
  },

  validateUrl: function() {
    var re = new RegExp(app.getUrlRegex());
    if (re.test(app.$url.value)) {
      return true;
    } else {
      app.error('Invalid url');
      return false;
    }
  },

  getFirstImageUrl: function() {
    var parts = app.$url.value.split(new RegExp(app.getUrlRegex()));
    app.url = app.urlTemplate
      .replace('${DOMAIN}',parts[2])
      .replace('${H}',parts[3])
      .replace('${A}',parts[4])
      .replace('${SH}',parts[5]);
    app.currentImage = 1;
    app.currentSubdomain = -1;
    app.lastImage = parseInt(parts[6]);
    return app.getNextImageUrl();
  },

  getImages: function() {
    app.getImage(app.getFirstImageUrl());
  },

  getNextImageUrl: function() {
    app.currentSubdomain++;
    if (app.currentSubdomain >= app.subdomains.length) {
      app.currentSubdomain = 0;
      app.currentImage++;
    }
    if (app.currentImage > app.lastImage) {
      return false;
    }
    return app.url
      .replace('${SUBDOMAIN}',app.subdomains[app.currentSubdomain])
      .replace('${IMAGE}',app.currentImage);
  },

  getImage: function(url) {
    var $img = document.createElement('img');
    $img.onload = function(x) {
      if($img.naturalWidth === 400) {
        app.$pics.appendChild($img);
        app.currentSubdomain = app.subdomains.length;
      }

      var url = app.getNextImageUrl();
      if (url) {
        app.getImage(url);
      } else {
        app.info('all done');
      }
    }
    $img.src = url;
  },

  info: function(msg) {
    console.log(msg);
  },

  error: function(msg) {
    console.log(msg);
  }
};
