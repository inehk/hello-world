
// "Pattern" IIFE : Pour ne pas encombrer "window" (car les "var XX;" sont globaux? si on oublie le "var"), => ici ça crée un "scope", ... @TODO: détailler..
//    => "Block scoping can be produced by wrapping the entire block in a function and then executing it; this is known as the immediately-invoked function expression pattern."
var Main = (function(win /* pk? */){

  // Informations générales communes à tous les objets
  var code = 'SortingAlgo_';
  var i = 0; // utile si plusieurs canvas 1, 2, 3, ...


  // objet "principal", ici : utilisable après un "new Main(" ...
  return function(config) {

      // pour les "closures" et garder le contexte de l'objet (entre ces fonctions) ... @TODO: détailler ce commentaire
      var me = this;
      me.width = config && config.width || 640;
      me.height = config && config.height || 480;

      // Nombre de blocs par défaut @TODO: y rendre paramètrable
      me.nbRows = 48;
      me.nbCols = 64;

      //
      // "Interface" PUBLIC ...
      //

      this.getContext = function() {
          return me.cnv.getContext("2d");
      };

      // création d'un rectangle sur une grid de 10x10 (ou nbCols par nbRows)
      this.addBlock = function(row, col) {
          var ctx = this.getContext();

          // Coordonnées du bloc
          var x1 = col / me.nbCols * me.width;
          var y1 = row / me.nbRows * me.height;
          var x2 = (col + 1) / me.nbCols * me.width;
          var y2 = (row + 1) / me.nbRows * me.height;

      		ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y1);
      		ctx.lineTo(x2, y2);
      		ctx.lineTo(x1, y2);
          ctx.fillStyle = 'red';
      		ctx.fill();

          // Text ...
          ctx.font = 'italic 8px Calibri';
      		ctx.fillStyle = 'blue';
      		ctx.fillText(row+','+col, (x2 - x1) / 2, (y2 - y1) / 2);

      };

      this.addClass = function(className) {
          $.DOM.addClass(me.parentId, className);
      }


      // PRIVATE ...

      /**
       * Initialisation
       */
      var init = function() {

          me.parentId = config && config.id || 'main';
          me.el = document.getElementById(me.parentId);

          // Ajout du titre
          me.el.innerHTML = (config.title || 'Title') + '<br/>';

          // Ajout du canvas
          createCanvas();
      };

      // Création du canvas
          // on peut mettre la fonction ici (pas besoin de "forward declaration"), car javascript fait du "hoisting" @TODO: pas clair
      var createCanvas = function() {
          me.cnv = document.createElement('canvas');
          me.id = code + 'Canvas_' + (++i);
          me.cnv.id = me.id;
          me.cnv.style.width = me.width + 'px';
          me.cnv.style.height = me.height + 'px';
          me.cnv.style.border = '1px solid';
          me.el.appendChild(me.cnv);
      };

      // initialisation immédiate à la création
      init();
  };

})(window);
