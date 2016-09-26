'use strict';

(function() {
  var Gallery = function() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeButton = this.element.querySelector('.gallery-overlay-close');
    this._image = document.querySelector('.gallery-overlay-image');

    // Привязка контекста обработки событий мыши и клавиатуры
    // к объекту Gallery прямо в конструкторе.
    this._onCloseClick = this._onCloseClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  };

  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');

    this._closeButton.addEventListener('click', this._onCloseClick);
    this._image.addEventListener('click', this._onPhotoClick);
    document.addEventListener('keydown', this._onDocumentKeyDown)
  };

  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._image.removeEventListener('click', this._onPhotoClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
  };

  Gallery.prototype._onCloseClick = function() {
    this.hide();
  };

  Gallery.prototype._onDocumentKeyDown = function(evt) {
    if(evt.keyCode === 27) {
      this.hide();
    }
  };

  Gallery.prototype._onPhotoClick = function() {
    console.log('Обработчик клика по фотографии работает!');
  }

  window.Gallery = Gallery;
})();
