
// IIFE
(function(w) {

  function Slider(tag) {

    var me = this;
    me.initialized = false;
    me.rootTag = tag;

    function init() {

      // récupération des attribues du tag <slider>
      me.max = me.rootTag.getAttribute('max') || 100;
      me.current = me.rootTag.getAttribute('current') || 0;
      me.suffix = me.rootTag.getAttribute('suffix') || '';
      me.label = me.rootTag.getAttribute('label') || '';
      // la largeur fixe du slider
      me.rootWidth = me.rootTag.offsetWidth; // en pixel

      // @TODO
      // pour le drag-n-drop : http://caniuse.com/#feat=dragndrop (IE/Edge : pas de .setDragImage() ???)
      // me.rootTag.draggable = true;

      // Le fond du slider
      var mainBar = document.createElement('div');
      mainBar.className = 'mainBar';

      // L'état "d'avancement" courant
      var currentBar = document.createElement('div');
      currentBar.className = 'currentBar';
      mainBar.appendChild(currentBar);

      me.rootTag.appendChild(mainBar);

      // le truc pour modifier la valeur...
      var grab = document.createElement('div');
      grab.className = 'grab';
      me.rootTag.appendChild(grab);

      // Text ...
      var text = document.createElement('span');
      text.className = 'value';
      text.innerHTML = me.current + me.suffix;
      me.rootTag.appendChild(text);

      // Début du drag-n-drop !
      /*
      // @TODO
      me.rootTag.addEventListener('dragstart', function(e) {
        // image vide lors du déplacement ...
        var dragImg = document.createElement('img');
        dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(dragImg, 0, 0); // image, xOffset, yOffset
      });
      */

      // on déplace le curseur
      function movingGrabber(e) {
        var value = (e.pageX - me.rootTag.offsetLeft) / me.rootWidth * me.max;
        me.moveTo(value);
      }

      // Gestion de la modification manuel du slider
        // quand on click sur le "grabber"
      grab.addEventListener('mousedown', function(e) {
        // on détecte les mouvements de souris
        document.body.style.setProperty("cursor", "none", "important"); // @FIXME: ne marche pas ?!
        document.body.addEventListener('mousemove', movingGrabber);
      });
      // dès qu'on relache la souris (où qu'on soit sur la page)
      document.body.addEventListener('mouseup', function(e) {
        document.body.style.setProperty("cursor", "default", "important"); // @FIXME: ne marche pas ?!
        // on n'écoute plus l'evenement mousemove sur le slider
        document.body.removeEventListener('mousemove', movingGrabber);
      });

      // simple click n'importe où sur le slider => change la valeur
      me.rootTag.addEventListener('click', function(e) {
        movingGrabber(e);
      });

      //
      me.mainBar = mainBar;
      me.currentBar = currentBar;
      me.grabber = grab;
      me.text = text;

      me.moveTo(me.current);

      me.initialized = true;

    } // FIN: init()

    me.moveTo = function(value) {
      if(value >= 0 && value <= me.max) {
        me.currentBar.style.width = (Math.round(value / me.max * me.rootWidth) / me.rootWidth * 100) + '%';
        me.grabber.style.left = ((Math.round(value / me.max * me.rootWidth) - 4) / me.rootWidth * 100) + '%';
        me.text.style.left = ((Math.round(value / me.max * me.rootWidth) - 8) / me.rootWidth * 100) + '%';
        me.text.innerHTML = (me.max > 1 ? Math.round(value) :  Math.round(value*100)/100) + me.suffix;
        me.current = value;
        if(me.initialized) {
          changeBackgroundColor();
        }
      }
    }

    // initialisation du slider
    init();

    return {
      moveTo: me.moveTo,
      getMax: function() {
        return me.max;
      },
      getValue: function() {
        return me.max > 1 ? Math.round(me.current) : Math.round(me.current*100)/100;
      },
      getRoot: function() {
        return me.rootTag;
      },
      addDelta: function(delta) {
        if(this.getMax()<=1) {
          delta *= 0.05;
        }else{
          delta *= 2;
        }
        me.moveTo(this.getValue() + delta);
      }
    }
  }


  // on initialise tous les tags <slider>
  var slidersTags = document.getElementsByTagName('slider');
  w.sliders = []; // "global" : la liste de tous les sliders
  for(var i in slidersTags) {
    var s;
    if(slidersTags[i].nodeType == 1) {
      s = new Slider(slidersTags[i]);
      w.sliders.push(s);

      // Closure...?
      function test(aSlider) {
        addMouseWheelListener(aSlider.getRoot(), function(e) {
          if(e.wheelDeltaY > 0) { // toujours +120 ou -120 ??
            aSlider.addDelta(1);
          }else{
            aSlider.addDelta(-1);
          }
        });
      }

      test(s);
    }
  }
  w.changeBackgroundColor();


  //
  // Handler d'évenements "mousewheel" cross-browser
  //
  function addMouseWheelListener(el, fn) {
    if(el.addEventListener){
      // IE9, Chrome, Safari, Opera
      el.addEventListener("mousewheel", fn, false);
      // Firefox
      el.addEventListener("DOMMouseScroll", fn, false);
    }else{ // IE 6/7/8
      el.attachEvent("onmousewheel", fn);
    }
  }


})(window);
