
/*function getMessage(a, b) {
	if(a == typeof(true)){
		if(a == true){
		return "Переданное GIF-изображение анимировано и содержит " + b + " кадров"; 
	    }
	    else{
		    return "Переданное GIF-изображение не анимированно";
	    }
	}
	
	else if(a == typeof(1)){
		return "Переданное SVG-изображение содержит " + a 
				+ " объектов и "+ b * 4 + " аттрибутов";
	}

	else if((typeof a =="object") && (a instanceof Array)){
		var sum = 0;
		for(var i = 0; i < a.length; i++){
			sum += a[i];
		}
		return "Количество красных точек во всех строчках изображения: " + sum;
	}
	else if(((typeof a == "object") && (a instanceof Array)) 
		&& ((typeof b == "object") && (b instanceof Array))){
		var sumTmp = a.map(function(value, index) {
			return value * b[index];
		});

		var square = 0;
		for(var i = 0; i < sumTmp.length; i++){
			square += sumTmp[i];
		}
		return "Общая площадь артефактов сжатия: " + square;
	}
}*/

  function getMessage(a, b){
    switch (typeof(a)){
      case 'boolean':
        if(a){
          return('Переданное GIF-изображение анимировано и содержит '+b+' кадров');
        }
        else{
          return('Переданное GIF-изображение не анимировано');
        }
        break;
      case 'number':
        return('Переданное SVG-изображение содержит ' + a + ' объектов и ' + (b * 4) + ' аттрибутов');
        break;
        //not every object is array, but works for now
      case 'object':
        if(typeof(b)=='object'){
          return('Общая площадь артефактов сжатия: ' + square(a, b) + ' пикселей');
        }
        else{
          return('Количество красных точек во всех строчках изображения: ' + sum(a));
        }
        break;
    }
  };

   function square(array1, array2){
    var minLength= (array1.length <= array2.length) ? array1.length-1 : array2.length-1;
    var result = 0;
    for(minLength; minLength >= 0; minLength--){
      result += array1[minLength] * array2[minLength];
    };
    return result;
  };
  
  function sum(array1){
    var result = 0;
    for(var i = 0; i < array1.length; i++){
      result += array1[i];
    };
    return result;  
  };