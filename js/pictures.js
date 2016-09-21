'use strict';


(function() {
  var divPictures = document.querySelector('.pictures');
  var filterForm = document.querySelector('.filters')
  var filters = document.querySelectorAll('.filters-radio');
  var picturesArr = [];
  var activeFilter = 'filter-popular';
  var template = document.querySelector('#picture-template');

  filterForm.classList.add('hidden');
  //put a filter and sort on click
  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function(evt) {
      var clickedElementID = evt.target.id;
      setActiveFilter(clickedElementID);
    };
  }

  //load pictures fron AJAX
  getPictures();

  // iterate the items is the data structure
  //to spped up the render using Fragment
  function showPictures(picturesToRender) {
    divPictures.innerHTML = '';
    var fragment = document.createDocumentFragment();

    picturesToRender.forEach(function(picture){
      var element = getFromTemplate(picture);
      fragment.appendChild(element);
    });

    divPictures.appendChild(fragment);
  }

  //sort function
  function setActiveFilter(id, force) {
    //prevetion on installing one and the same filter
    if (activeFilter === id && !force){
      return;
    }

    //copy array
    var filteredPictures = picturesArr.slice(0);

    switch (id) {
      case ('filter-new'):
        // 3 month ago (~90 days)
        var threeMonthsAgo = parseInt(Date.now()) - 90 * 24 * 60 * 60 * 1000;

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
    showPictures(filteredPictures);
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

    //новый экземпляр по шаблону
    function getFromTemplate(data) {
         var IMAGE_TIMEOUT = 10000;
         var element = template.content.children[0].cloneNode(true);


         // Вывод количества лайков и комментариев:
         element.querySelector('.picture-comments').textContent = data.comments;
         element.querySelector('.picture-likes').textContent = data.likes;

         // Объявляем переменные картинок: первая - заменяемый тэг в шаблоне,
         // вторая - загружаемое с сервера изображение.
         var currentImg = element.querySelector('img');
         var image = new Image(182, 182);

         // До загрузки картинки будет отображаться иконка-спиннер.
         element.classList.add('picture-load-process');

         var showLoadingError = function() {
           image.src = '';
           element.classList.remove('picture-load-process');
           element.classList.add('picture-load-failure');
           element.href = '#';
         };

         // Установка таймаута на загрузку изображения.
         var imageLoadTimeout = setTimeout(showLoadingError, IMAGE_TIMEOUT);

         // Отмена таймаута при загрузке и замена картинок.
         image.onload = function() {
           clearTimeout(imageLoadTimeout);
           element.classList.remove('picture-load-process');
           element.replaceChild(image, currentImg);
           element.href = image.src;
         };

         // Обработка ошибки сервера
         image.onerror = showLoadingError;

         // Изменение src у изображения начинает загрузку.
         image.src = data.url;

         return element;
       }

  filterForm.classList.remove('hidden');

})();
