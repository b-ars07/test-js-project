/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap;

  var filterCookie;


  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;
  var DECIMAL = 10;
  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }
    window.addEventListener('resizerchange', resizerChangeHandler);

     function resizerChangeHandler() {

       if(currentResizer) {
         if(currentResizer.getConstraint().x < 0){
           currentResizer.setConstraint(0);
         }

         if(currentResizer.getConstraint().x > currentResizer._image.naturalWidth - currentResizer.getConstraint().side) {
           currentResizer.setConstraint(currentResizer._image.naturalWidth - currentResizer.getConstraint().side);
         }

         if(currentResizer.getConstraint().y < 0) {
           currentResizer.setConstraint(currentResizer.getConstraint().x, 0);
         }

         if(currentResizer.getConstraint().y > currentResizer._image.naturalHeight - currentResizer.getConstraint().side){
           currentResizer.setConstraint(currentResizer.getConstraint().x, currentResizer._image.naturalHeight - currentResizer.getConstraint().side);
         }



      resizeForm['resize-x'].value = parseInt(currentResizer.getConstraint().x, DECIMAL);
      resizeForm['resize-y'].value = parseInt(currentResizer.getConstraint().y, DECIMAL);
      resizeForm['resize-size'].value = parseInt(currentResizer.getConstraint().side, DECIMAL);
      }
    }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];



  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');


  var resizeX = resizeForm['resize-x'];
  var resizeY = resizeForm['resize-y'];
  var resizeSize = resizeForm['resize-size'];
  var resizeButton = resizeForm['resize-fwd'];
  var error = document.querySelector('.error');


  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {

      if((parseInt(resizeX.value) + parseInt(resizeSize.value)) > currentResizer._image.naturalWidth ||
        (parseInt(resizeX.value) + parseInt(resizeSize.value)) > currentResizer._image.naturalHeight) {
        resizeButton.setAttribute('disabled', true);
        resizeButton.classList.add('upload-form-controls-fwd--disabled');
      return false;

    }else {
          resizeButton.removeAttribute('disabled');
          resizeButton.classList.remove('upload-form-controls-fwd--disabled');
          return true;

    }
  }
   var hours = 24;
   var minutes = 60;
   var seconds = 60;
   var ms = 1000;

  function dayAfterBirthday(birthDay){
    var oneDay = hours * minutes * seconds * ms;
    var today = Date.now();
    var diffInDay = Math.round(Math.abs(today - birthDay / getTime() / oneDay));
    return diffInDay;
  }


  uploadForm.addEventListener('change', function(event) {
    resizeFormChangeHandler(event.target);

      currentResize.redraw();
    });

  function resizeFormChangeHandler(target) {
    var element = target;
    if(element.name === 'x')
    {
      if(parseInt(element.value) <= 0){
        element.value = 0;
        currentResizer.setConstraint(parseInt(element.value));
      }
      else if(parseInt(element.value) + currentResizer.getConstraint().side <= currentResizer._image.naturalWidth) {
        currentResizer.setConstraint(parseInt(element.value));
      }
      else {
        element.value = currentResizer._image.naturalWidth - currentResizer.getConstraint().side;
        currentResizer.setConstraint(parseInt(element.value));
      }
    }

    if(element.name === 'y') {
      if(parseInt(element.value <= 0)){
        element.value = 0;
        currentResizer.setConstraint(parseInt(resizeForm['resize-x'].value), parseInt(resizeForm['resize-y'].value), parseInt(element.value));
      }
      else if(parseInt(element.value) + currentResizer.getConstraint().side <= currentResizer._image.naturalHeight) {
        currentResizer.setConstraint(parseInt(resizeForm['resize-x'].value), parseInt(element.value));
      }
      else {
        element.value = currentResizer._image.naturalHeight - currentResize.getConstraint().side;
        currentResize.setConstraint(parseInt(resizeForm['resize-x'].value), parseInt(element.value));
      }
    }

    if(element.name === 'size'){
      if(element.value <= 0){
        element.value = 0;
        currentResize.setConstraint(parseInt(resizeForm['resize-x'].value), parseInt(resizeForm['resize-y'].value), parseInt(element.value));
      }
      else if(element.value <+ Math.min(currentResize._image.naturalWidth - resizeForm['resize-x'].value,
                                       currentResize._image.naturalHeight - resizeForm['resize-y'].value)) {
        currentResize.setConstraint(parseInt(resizeForm['resize-x'].value), parseInt(resizeForm['resize-y'].value), parseInt(element.value));
      }
      else {
        element.value = Math.min(currentResize._image.naturalWidth - resizeForm['resize-x'].value,
                                 currentResize._image.naturalHeight - resizeForm['resize-y'].value);
        currentResize.setConstraint(parseInt(resizeForm['resize-x'].value), parseInt(resizeForm['resize-y'].value), parseInt(element.value));
      }
    }

  }


  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.addEventListener('load', function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

        });
        hideMessage();
      }
        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }

  });

  // Функция получения данных из ресайзера загруженного изображения (x, y
  // и сторона в пикселях) и их записи в  поля формы resizeForm
  function getResizerData() {
    var currentResizerData = currentResizer.getConstraint();
    resizeX.value = Math.floor(currentResizerData.x);
    resizeY.value = Math.floor(currentResizerData.y);
    resizeSize.value = Math.floor(currentResizerData.side);
  }


  // /*
    //   Обработчик события 'resizerchange' на объекте window.
    //
    //  */
    window.addEventListener('resizerchange', getResizerData);

    // Для улучшения UX валидируем форму еще и на клавиатурных событиях
    // (по отпускании кнопки).
    resizeForm.addEventListener('keyup', resizeFormIsValid);

  /*
    Синхронизация изменения значений полей resizeForm с габаритами окна кадрирования
    и валидация формы.
   */

   resizeForm.addEventListener('change', function() {
    currentResizer.setConstraint(parseInt(resizeX.value), parseInt(resizeY.value),
      parseInt(resizeSize.value));
    resizeFormIsValid()
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      filterCookie = docCookies.getItem('filter-cookie');
      filterCookie = filterCookie || 'none';
      filterImage.className = 'filter-image-preview filter-' + filterCookie;

      document.getElementById('upload-filter-' + filterCookie).checked = true;


      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();
    docCookies.setItem('filter-cookie', selectedFilter,
                         hours * minutes * seconds * ms
                         * dayAfterBirthday(new Date(1994,7,7)), '/');


    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {
    if (!filterMap) {
      // Ленивая инициализация. Объект не создается до тех пор, пока
      // не понадобится прочитать его в первый раз, а после этого запоминается
      // навсегда.
      filterMap = {
        'none': 'filter-none',
        'chrome': 'filter-chrome',
        'sepia': 'filter-sepia'
      };
    }

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  cleanupResizer();
  updateBackground();
})();
