/*global Photo: true, Gallery: true*/

'use strict';


(function() {
  var divPictures = document.querySelector('.pictures');
  var filterForm = document.querySelector('.filters')
  var filters = document.querySelector('.filters-radio');
  var picturesArr = [];
  var activeFilter = 'filter-popular';
  var currentPage = 0;
  var PAGE_SIZE = 12;
  var SCROLL_TIMEOUT = 100;
  var filteredPictures = [];
  var gallery = new Gallery();

  filterForm.classList.add('hidden');
  //put a filter and sort on click
  // Добавляем также функцию addPageOnScroll, иначе по клику на фильтр
  // на больших разрешениях выводится только 12 фотографий.
  filterForm.addEventListener('click', function(event) {
    var clickedElement = event.target;
    if(clickedElement.classList.contains('filters-radio')) {
      setActiveFilter(clickedElement.id);
      addPageOnScroll();
    }
  });



  var scrollTimeout;

  window.addEventListener('scroll', function(evt) {
    clearTimeout (scrollTimeout);
    scrollTimeout = setTimeout(addPageOnScroll, SCROLL_TIMEOUT);
  });

  // if 12 картинок помещаются, use ф-ю addPageOnScroll() еще и на событии 'load'
  // (адаптация для больших разрешений).
  window.addEventListener('load', addPageOnScroll);

  function addPageOnScroll() {
    //Как определить что скролл внизу страницы и пора показывать
    //следующую порцию картинок?
    //проверить - виден ли футер страницы.
    //1. определить положение футера относительно экрана (вьюпорта)
    var picturesCoordinates = document.querySelector('.pictures').getBoundingClientRect();
    var viewportSize = document.documentElement.offsetHeight;

    //3. если смещение высота экрана меньше высоты футера,
    //футер виден хотябы частично
    if (picturesCoordinates.height <= viewportSize + window.scrollY) {
      if (currentPage < Math.ceil(filteredPictures.length / PAGE_SIZE)) {
        showPictures( filteredPictures, ++currentPage);
        }
    }
  }

  //load pictures fron AJAX
  getPictures();

  // iterate the items is the data structure
  //to spped up the render using Fragment
  function showPictures(picturesToRender, pageNumber, replace) {
    if (replace) {
      var renderElements = document.querySelectorAll('.picture');
      [].forEach.call(renderElements, function(el) {
        divPictures.removeChild(el);
      });
      divPictures.innerHTML = '';
      }

    var fragment = document.createDocumentFragment();

    var pageStart = pageNumber * PAGE_SIZE;
    var pageEnd = pageStart + PAGE_SIZE;
    var pagePictures = picturesToRender.slice(pageStart, pageEnd);

    pagePictures.forEach(function(picture){
      var photoElement = new Photo(picture);
      photoElement.render();
      fragment.appendChild(photoElement.element);

      //Показ галереи должен происходить по клику на картинку
      photoElement.element.addEventListener('click', _onPhotoClick);
    });

    divPictures.appendChild(fragment);
  }

  function _onPhotoClick(evt) {
    evt.preventDefault();
    gallery.show();
  }

  //sort function
  function setActiveFilter(id, force) {
    //prevetion on installing one and the same filter
    if (activeFilter === id && !force){
      return;
    }

    //copy array
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
    currentPage = 0;
    showPictures(filteredPictures, currentPage, true);
    activeFilter = id;
  }


  //AJAX upload function for data from pictures.json
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

  // Сохранение выгруженного списка в pictures согласно выставленному фильтру.
  function updateLoadedPictures(loadedPictures) {
    picturesArr = loadedPictures;

    setActiveFilter(activeFilter, true);
  }



  filterForm.classList.remove('hidden');

})();
