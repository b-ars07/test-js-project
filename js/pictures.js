'use strict';


var template = document.querySelector('#picture-template');

(function() {
  var divPictures = document.querySelector('.pictures');
  var divFilters = document.querySelector('.filters');

    divFilters.classList.remove('hidden');
    divFilters.classList.add('visible');

//новый экземпляр по шаблону
  var getFromTemplate = function(item){
    var newTemplate = template.content.children[0].cloneNode(true);
    var image = new Image();


    image.onload = function() {
      image.height = image.width = '182';
      newTemplate.replaceChild(image, newTemplate.querySelector('img'));
    };

    image.onerror = function() {
      newTemplate.classList.add('picture-load-failure');
    };

      image.src = item.url;

      newTemplate.querySelector('.picture-comments').textContent = item.comments;
      newTemplate.querySelector('.picture-likes').textContent = item.likes;

      return newTemplate;
  }

    pictures.forEach(function(item){
      var element = getFromTemplate(item);
      divPictures.appendChild(element);
    });

    var hideFilters = function() {
      divFilters.classList.remove('visible');
      divFilters.classList.add('hidden');
    }


})();
