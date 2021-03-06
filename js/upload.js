/* global Resizer: true */

/**
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

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

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

  /**
   * Элементы формы, которые будут использоваться при валидации
   * @type {HTMLElement}
   */
  var resizeX = resizeForm['resize-x'];
  var resizeY = resizeForm['resize-y'];
  var resizeSize = resizeForm['resize-size'];
  var resizeFwd = resizeForm['resize-fwd'];

  /**
   * Проверяет, валидны ли данные в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    if (
      +resizeX.value + +resizeSize.value > currentResizer._image.naturalWidth ||
      +resizeY.value + +resizeSize.value > currentResizer._image.naturalHeight
    ) {
      resizeFwd.setAttribute('disabled', true);
      resizeFwd.classList.add('upload-form-controls-fwd--disabled');
      return false;
    } else {
      resizeFwd.removeAttribute('disabled');
      resizeFwd.classList.remove('upload-form-controls-fwd--disabled');
      return true;
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

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  // Функция получения данных из ресайзера загруженного изображения (координаты x, y и
  // сторона в пикселях) и их записи в поля формы resizeForm.
  function getResizerData() {
    var currentResizerData = currentResizer.getConstraint();
    resizeX.value = Math.floor(currentResizerData.x);
    resizeY.value = Math.floor(currentResizerData.y);
    resizeSize.value = Math.floor(currentResizerData.side);
  }

  /**
   * Обработчик события 'resizerchange' на объекте window.
   * @param {Event} resizerсhange
   * @param {function} getResizerData
   */
  window.addEventListener('resizerchange', getResizerData);

  // Для улучшения UX валидируем форму еще и на клавиатурных событиях
  // (по отпускании кнопки).
  resizeForm.addEventListener('keyup', resizeFormIsValid);

  /**
   * Синхронизация изменения значений полей resizeForm с габаритами окна кадрирования
   * и валидация формы.
   * @param {Event} change
   */
  resizeForm.addEventListener('change', function() {
    currentResizer.setConstraint(+resizeX.value, +resizeY.value, +resizeSize.value);
    resizeFormIsValid();
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

    if (resizeFormIsValid) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');

      // После ресайза обращаемся к нашей куке и добавляем ее в список классов картинки
      // как выставленный в последний раз фильтр и, соответственно, переключаем радиокнопку.
      var filterFromCookie = docCookies.getItem('filter');

      if (filterFromCookie) {
        filterImage.className = 'filter-image-preview ' + filterFromCookie;
        filterForm['upload-' + filterFromCookie].setAttribute('checked', true);
      } else {
        filterImage.className = 'filter-image-preview filter-none';
        filterForm['upload-filter-none'].setAttribute('checked', true);
      }
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

    // Вычисляем время, прошедшее после ДР
    var currentYear = new Date().getFullYear();
    var recentBirthday = new Date(currentYear, 9, 12);

    // Проверяем, что ДР не больше текущей даты, и при необходимости отнимаем год
    if (+recentBirthday >= +Date.now()) {
      recentBirthday.setFullYear(currentYear - 1);
    }

    var daysPassed = +Date.now() - +recentBirthday;
    var dateToExpire = +Date.now() + daysPassed;
    var formattedDateToExpire = new Date(dateToExpire).toUTCString();

    // Запоминаем класс фильтра, который добавляется в список классов изображения
    // из функции ниже, обращаемся к его классу, превращаем строковой тип
    // в массив из двух значений методом split и берем второе значение.
    var defaultFilter = filterImage.className.split(' ')[1];

    // Записываем полученное значение в куку и задаем ей вычисленный выше срок жизни.
    document.cookie = 'filter=' + defaultFilter + ';expires =' + formattedDateToExpire;

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
