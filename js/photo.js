/**
* @fileOverview Конструктор и прототипы объекта Фото
* @author Arseniy Berezin
*/

'use strict';

define(function() {
  /**
  * @constructor
  * @param {Object} data
  */
  function Photo(data) {
    this._data = data;

    /** @member {HTMLElement} template */
    Photo.prototype.template = document.querySelector('#picture-template');

    this._onPhotoClick = function(evt) {
      evt.preventDefault();
      if (!this.element.classList.contains('picture-load-failure')) {
        if(typeof  this.onClick === 'function') {
          this.onClick();
        }
      }
    }.bind(this);
  }

  /**новый экземпляр по шаблону*/
  Photo.prototype.render = function() {
         /** @const {number} */
         var IMAGE_TIMEOUT = 10000;
         /** @type {HTMLElement} */
         var template = document.querySelector('#picture-template');
         this.element = template.content.children[0].cloneNode(true);

         /** Вывод количества лайков и комментариев: */
         this.element.querySelector('.picture-comments').textContent = this._data.comments;
         this.element.querySelector('.picture-likes').textContent = this._data.likes;

         /** Объявляем переменные картинок: первая - заменяемый тэг в шаблоне,
         * вторая - загружаемое с сервера изображение.
         * @type {HTMLElement} currentImg
         * @type {Image} image
         */
         var currentImg = this.element.querySelector('img');
        this.image = new Image(182, 182);

         /** До загрузки картинки будет отображаться иконка-спиннер. */
         this.element.classList.add('picture-load-process');

         var showLoadingError = function() {
           this.image.src = '';
           this.element.classList.remove('picture-load-process');
           this.element.classList.add('picture-load-failure');
           this.element.href = '#';
         }.bind(this);

         /** Установка таймаута на загрузку изображения. */
         var imageLoadTimeout = setTimeout(showLoadingError, IMAGE_TIMEOUT);

         /** Отмена таймаута при загрузке и замена картинок. */
         this.image.onload = function() {
           clearTimeout(imageLoadTimeout);
           this.element.classList.remove('picture-load-process');
           this.element.replaceChild(this.image, currentImg);
           this.element.href = this.image.src;
         }.bind(this);
         /**  Обработка ошибки сервера */
         this.image.onerror = showLoadingError;
         /** Изменение src у изображения начинает загрузку. */
         this.image.src = this._data.url;

          this.element.addEventListener('click', this._onPhotoClick)

       };

  /** @type {?Function} */
       Photo.prototype.onClick = null;

        //Удаление обработчика клика по фотографии
       Photo.prototype.remove = function() {
         this.element.removeEventListener('click', this._onPhotoClick);
       };

       return Photo;
   });
