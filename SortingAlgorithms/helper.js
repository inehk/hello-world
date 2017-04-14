//
// Diverses fonctions
//
var Helper = {
    get: function(id) {
        return document.getElementById(id);
    },
    DOM: {
        addClass : function(id, className) {
            var el = $.get(id);
            if(className && el) {
                if(el.classList) { // IE10+
                    el.classList.add(className);
                }else{ // old style
                    document.getElementById(id).className += " " + className;
                }
            }
        }
    }
};

// Plus simple à écrire
var $ = Helper;
