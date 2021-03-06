/*global Photo: true, Gallery: true*/

/**
* @fileOverview Модуль выгрузки картинок из JSON файла (data/pictures.json)
* обработки данных и вывода на страницу с использованием шаблона. Фильтрация картинок.
* Обработчик кликов по фотографиям, показывающим галерею
* @author Arseniy Berezin
*/

'use strict';

requirejs.config({
  baseUrl: 'js'
});

define(['gallery', 'photo', 'resizer', 'upload'], function(Gallery, Photo) {
  /** @type {HTMLElement} */
  var divPictures = document.querySelector('.pictures');
  /** @type {HTMLElement} */
  var filterForm = document.querySelector('.filters');
  /** @type {HTMLElement} */
  var filters = document.querySelector('.filters-radio');
  /** @type {Array.<string>} */
  var picturesArr = [];
  /** @type {string} */
  var activeFilter = localStorage.getItem('activeFilter') || 'filter-popular';
  /** @type {number} */
  var currentPage = 0;
  /** @const {number} */
  var PAGE_SIZE = 12;
  /** @const {number} */
  var SCROLL_TIMEOUT = 100;
  /** @type {Array.<string>} */
  var filteredPictures = [];
  /** @type {Array.<string>} */
  var renderedElements = [];
  /** @type {Gallery} */
  var gallery = new Gallery();

  filterForm.classList.add('hidden');
  /**
  * Добавляем также функцию addPageOnScroll, иначе по клику на фильтр
  * на больших разрешениях выводится только 12 фотографий.
  */
  filterForm.addEventListener('click', function(evt) {
    var clickedElement = evt.target;
    if(clickedElement.classList.contains('filters-radio')) {
      setActiveFilter(clickedElement.id);
      addPageOnScroll();
    }
  });


 /** var {number} */
  var scrollTimeout;

  /**
   * обработчик события scroll
   */
  window.addEventListener('scroll', function() {
    clearTimeout (scrollTimeout);
    scrollTimeout = setTimeout(addPageOnScroll, SCROLL_TIMEOUT);
  });

  /** если 12 картинок помещаются, используем ф-ю addPageOnScroll() еще и на событии 'load'
  * (адаптация для больших разрешений). */
  window.addEventListener('load', addPageOnScroll);


  function addPageOnScroll() {
    /** Как определить что скролл внизу страницы и пора показывать
    *следующую порцию картинок?
    *проверить - виден ли футер страницы.
    *1. определить положение конца страницы относительно экрана (вьюпорта)
    */
    var picturesCoordinates = document.querySelector('.pictures').getBoundingClientRect();
    var viewportSize = document.documentElement.offsetHeight;

    /** 2. если смещение высота экрана меньше высоты конца страницы,
    * конец виден хотябы частично
    */
    if (picturesCoordinates.height <= viewportSize + window.scrollY) {
      if (currentPage < Math.ceil(filteredPictures.length / PAGE_SIZE)) {
        showPictures( filteredPictures, ++currentPage);
        }
    }
  }

  /** загружаем картинки с помощью AJAX */
  getPictures();

  /** Перебираем элементы в структуре данных, для ускорения отрисовки
  * используем Fragment
  */
  function showPictures(picturesToRender, pageNumber, replace) {
    if (replace) {
      var el;
      while ((el = renderedElements.shift())) {
        divPictures.removeChild(el.element);
        el.onClick = null;
        el.remove();
      }
    }

    var fragment = document.createDocumentFragment();

    var pageStart = pageNumber * PAGE_SIZE;
    var pageEnd = pageStart + PAGE_SIZE;
    var pagePictures = picturesToRender.slice(pageStart, pageEnd);

    renderedElements = renderedElements.concat(pagePictures.map(function(item){
      var photoElement = new Photo(item);
      photoElement.render();
      fragment.appendChild(photoElement.element);

      //Показ галереи должен происходить по клику на картинку
      // Обработчик взаимодействия с фотографией теперь работает с адресной
      // строкой, куда он передает обрезанную часть пути src, начиная с "photos"
      photoElement.onClick = function() {
        var hashToAdd = photoElement.image.src;
        location.hash = 'photo/' + hashToAdd.substr(hashToAdd.indexOf('photos'));
        gallery._onHashChange();
      };
      return photoElement;
    }));

    divPictures.appendChild(fragment);
    addPageOnScroll();
  }

  /** Функция сортировки
  * @param {string} id
  * @param {boolean} force
  */
  function setActiveFilter(id, force) {
    //prevetion on installing one and the same filter
    if (activeFilter === id && !force){
      return;
    }
    //сортировка элементов массива по выбранному фильтру
    filteredPictures = picturesArr.slice(0);

    var daysInMonth = 30;
    var hours = 24;
    var minutes = 60;
    var seconds = 60;
    var ms = 1000;

    switch (id) {
      case ('filter-new'):
        // 3 month ago (~90 days)
        var threeMonthsAgo = parseInt(Date.now()) - daysInMonth * 3 * hours * minutes * seconds * ms;

        filteredPictures = filteredPictures.filter(function(item) {
          return Date.now(item.date) > threeMonthsAgo;
        }).sort(function(a, b) {
          return Date.now(b.date) - Date.now(a.date);
        });
        break;

      case ('filter-discussed'):
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;

      case ('filter-popular'):
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.likes - a.likes;
        });
        break;
    }

    gallery.setPictures(filteredPictures);
    currentPage = 0;
    showPictures(filteredPictures, currentPage, true);
    activeFilter = id;
    //запись фильтра в localStorage
    localStorage.setItem('activeFilter', id);
    filterForm[activeFilter].checked = true;
  }

  /**
   * //AJAX upload function for data from pictures.json
   */
  function getPictures() {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 10000;
    xhr.open('GET', 'data/pictures.json');

    // Пока идет загрузка, показываем прелоадер.
    divPictures.classList.add('pictures-loading');

    // Если подключение не произошло, выдаем сообщение об ошибке.
    var showError = function() {
      divPictures.classList.remove('pictures-loading');
      divPictures.classList.add('pictures-failure');
    };

    xhr.ontimeout = showError;

    // Обрабатываем загруженные данные.
    xhr.onload = function(evt) {
      if (evt.target.status <= 300) {
        var rawData = evt.target.response;
        var loadedPictures = JSON.parse(rawData);

        divPictures.classList.remove('pictures-loading');
        updateLoadedPictures(loadedPictures);
      } else {
        showError();
        return;
      }
    };

    xhr.send();
  }

  /** Сохранение выгруженного списка в pictures согласно выставленному фильтру.
  * @param {Object.<string>, string|number} loadedPictures
  */
  function updateLoadedPictures(loadedPictures) {
    picturesArr = loadedPictures;

    setActiveFilter(activeFilter, true);
  }

  filterForm.classList.remove('hidden');
});
