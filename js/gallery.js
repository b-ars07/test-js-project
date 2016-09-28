/**
* @fileOverview Конструктор и прототипы объекта Галерея
* @author Arseniy Berezin
*/

'use strict';

(function() {
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
  };


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
    this.element.classList.add('invisible');

    this.element.addEventListener('click', this._onCloseClick);
    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._image.removeEventListener('click', this._onPhotoClick);
    this.element.removeEventListener('click', this._onCloseClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
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
    if(evt.keyCode === keyESC) {
      this.hide();
    }

    if (evt.keyCode === keyLEFT) {
        if (this._currentImage === 0) {
          this._currentImage = this.pictures.length - 1;
          this.setCurrentPicture(this._currentImage);
        }
        else {
          this.setCurrentPicture(--this._currentImage);
        }
    }

    if (evt.keyCode === keyRIGHT) {
      if (this._currentImage == this.pictures.length - 1) {
        this._currentImage = 0;
        this.setCurrentPicture(this._currentImage);
      }
      else {
        this.setCurrentPicture(++this._currentImage);
      }
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
  Gallery.prototype.setCurrentPicture = function(i) {
    if (i <= this.pictures.length - 1) {
      this._currentImage = i;
      var currentPictures = this.pictures[this._currentImage];
      this._image.src = currentPictures.url;
      this._likes.textContent = currentPictures.likes;
      this._comments.textContent = currentPictures.comments;
    }
  };
  /** @private
  * @fires Gallery#h*/
    Gallery.prototype._onPhotoClick = function(evt) {
        if (evt.target.classList.contains('gallery-overlay-image')) {
            if (this.pictures[this._currentImage + 1]) {
                this.setCurrentPicture(++this._currentImage);
              } else {
                this._currentImage = 0;
                this.setCurrentPicture(this._currentImage);
              }
    }
  };

  window.Gallery = Gallery;
})();
