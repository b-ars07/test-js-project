/**
* @author Arseniy Berezin
*/

'use strict';
+/**
+ * Функция принимает два конструктора и записывает в прототип
+ * дочернего конструктора Child методы и свойства родительского
+ * конструктора Parent, используя пустой конструктор.
+ * @param {Function} Child
+ * @param {Function} Parent
+ * @return {Object} Child
+ */
function inherit(Child, Parent) {
  var EmptyConstructor = function() {}
    EmptyConstructor.prototype = Parent.prototype;
    Child.prototype = new EmptyConstructor();

    return Child;
}

console.log(inherit.toString());
