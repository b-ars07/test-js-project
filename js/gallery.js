/**
* @fileOverview Конструктор и прототипы объекта Галерея
* @author Arseniy Berezin
*/

'use strict';

define(function() {
  /**
   *
   * @constructor
   */
  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeButton = this.element.querySelector('.gallery-overlay-close');
    this._image = document.querySelector('.gallery-overlay-image');
    this._likes = document.querySelector('.likes-count');
    this._comments = document.querySelector('.comments-count');
    //Список изображений из json файла. Изначально пуст
    this.pictures = [];
    //Индекс текущей картинки в галерее
    this._currentImage = 0;

    // Привязка контекста обработки событий мыши и клавиатуры
    // к объекту Gallery прямо в конструкторе.
    this._onCloseClick = this._onCloseClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onHashChange = this._onHashChange.bind(this);

    window.addEventListener('load', this._onHashChange);
    window.addEventListener('hashchange', this._onHashChange);
  };


    Gallery.prototype._hash = null;


  /**
  * Показ галереи
  * @event Gallery#show
  */
  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');

    this._closeButton.addEventListener('click', this._onCloseClick);
    this._image.addEventListener('click', this._onPhotoClick);
    document.addEventListener('keydown', this._onDocumentKeyDown)
  };
  /**
  * Скрытие галереи
  * @event Gallery#hide
  */
  Gallery.prototype.hide = function() {
    location.hash = '';
    this.element.classList.add('invisible');

    this.element.addEventListener('click', this._onCloseClick);
    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._image.removeEventListener('click', this._onPhotoClick);
    this.element.removeEventListener('click', this._onCloseClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);

    window.removeEventListener('load', this._onHashChange);
    window.removeEventListener('hashchange', this._onHashChange);
  };
  /**
  * Обработчики клика по крестику, нажатию клавиши esc на клавитатуре и клика по фотографии
  * @private
  * @fires Gallery#hide
  */
    Gallery.prototype._onCloseClick = function(evt) {
        if (!evt.target.classList.contains('gallery-overlay-image')) {
           this.hide();
          }
  };

  /**
   *
   * @param evt
   * @private
   */
  Gallery.prototype._onDocumentKeyDown = function(evt) {
    var keyESC = 27;
    var keyLEFT = 37;
    var keyRIGHT = 39;

      switch (evt.keyCode) {
        case keyESC:
          this.hide();
          break;

        case keyLEFT:
          this.setCurrentPicture(--this._currentImage);
          this._setHash(this.pictures[this._currentImage].url);
          break;

        case keyRIGHT:
          this.setCurrentPicture(++this._currentImage);
          this._setHash(this.pictures[this._currentImage].url);
          break;
      }
    };

  /**
   *
   * @param pictures
   */
  Gallery.prototype.setPictures = function(pictures) {
    this.pictures = pictures;
  };

  /**
   * @param {number} i
   */
    Gallery.prototype._checkPositionFromNumber = function(num) {
      var end = this.pictures.length - 1;

      // Проверяем и правим индекс

      if (num < 0) {
        num = end;
      } else if (num > end) {
        num = 0;
      }
      return num;
    };

    Gallery.prototype._getPositionFromString = function(item, index) {
        if (item.url === this._currentImage) {
            this._currentImage = index;
          }
      };


  Gallery.prototype.setCurrentPicture = function(index) {
    var type = typeof index;

    switch (type) {
      case 'number':
        this._currentImage = this._checkPositionFromNumber(index);
        break;
      case 'string':
        this._currentImage = index;
        this.pictures.forEach(this._getPositionFromString, this);
        break;
    }
    var currentPicture = this.pictures[this._currentImage];
    this._image.src = currentPicture.url;
    this._likes.textContent = currentPicture.likes;
    this._comments.textContent = currentPicture.comments;

  };

  /** @private
  * @fires Gallery#h*/
    Gallery.prototype._onPhotoClick = function(evt) {
        if (evt.target.classList.contains('gallery-overlay-image')) {
          this.setCurrentPicture(this._currentImage);
          this._setHash(this.pictures[this._currentImage].url);
              }
        };


    Gallery.prototype._setHash = function(hash) {
          location.hash = hash ? 'photo/' + hash : '';
        };


      Gallery.prototype._onHashChange = function() {
        this._hash = location.hash.match(/#photo\/(\S+)/);

        if (this._hash && this._hash[1] !== '') {
          this.setCurrentPicture(this._hash[1]);
          this.show();
        } else {
          this.hide();

        }
      };
    return Gallery;
});
