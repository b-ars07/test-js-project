'use strict';

(function() {
  function Photo(data) {
    this._data = data;
  }

  Photo.prototype.render = function() {
    //новый экземпляр по шаблону
         var IMAGE_TIMEOUT = 10000;
         var template = document.querySelector('#picture-template');
         this.element = template.content.children[0].cloneNode(true);

         // Вывод количества лайков и комментариев:
         this.element.querySelector('.picture-comments').textContent = this._data.comments;
         this.element.querySelector('.picture-likes').textContent = this._data.likes;

         // Объявляем переменные картинок: первая - заменяемый тэг в шаблоне,
         // вторая - загружаемое с сервера изображение.
         var currentImg = this.element.querySelector('img');
         var image = new Image(182, 182);

         // До загрузки картинки будет отображаться иконка-спиннер.
         this.element.classList.add('picture-load-process');

         var showLoadingError = function() {
           image.src = '';
           this.element.classList.remove('picture-load-process');
           this.element.classList.add('picture-load-failure');
           this.element.href = '#';
         }.bind(this);

         // Установка таймаута на загрузку изображения.
         var imageLoadTimeout = setTimeout(showLoadingError, IMAGE_TIMEOUT);

         // Отмена таймаута при загрузке и замена картинок.
         image.onload = function() {
           clearTimeout(imageLoadTimeout);
           this.element.classList.remove('picture-load-process');
           this.element.replaceChild(image, currentImg);
           this.element.href = image.src;
         }.bind(this);
         // Обработка ошибки сервера
         image.onerror = showLoadingError;
         // Изменение src у изображения начинает загрузку.
         image.src = this._data.url;
       };

       window.Photo = Photo;
   })();
