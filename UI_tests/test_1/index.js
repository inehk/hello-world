
window.onload = init;

/*
.addEventListener() disponible depuis IE9, avant c'était .attachEvent() ...

*/

function init() {

  // Gestion de la diminution/agrandissement du menu de gauche :
  document.body.addEventListener('mousemove', function(e) {
    var nav = document.getElementsByTagName('nav')[0];
    if(e.clientX > 300) {
      if(!nav.classList.contains('collapse')) {
        nav.classList.add('collapse');
      }
    }else{
      document.getElementsByTagName('nav')[0].classList.remove('collapse');
    }
  });


  // Ajout d'éléments dans ce menu
  var theMenus = [
    {
      title: 'Tool 1',
      description: 'une description __ 1'
    },
    {
      title: 'Tool 2',
      description: 'une description __ 2'
    },
    {
      title: 'Tool 3',
      description: 'une description __ 3'
    },
    {
      title: 'Tool 4',
      description: 'une description __ 4'
    },
    {
      title: 'Tool 5',
      description: 'une description __ 5'
    },
    {
      title: 'Tool 6',
      description: 'une description __ 6'
    },
    {
      title: 'Tool 7',
      description: 'une description __ 7'
    },
    {
      title: 'Tool 8',
      description: 'une description __ 8'
    },
  ];
  theMenus.reverse(); // reverse car .insertBefore() ci-dessous..

  //
  var nav = document.getElementsByTagName('nav')[0];
  for(var i = 0, l = theMenus.length; i < l; i++) {
    var m = theMenus[i];
    var div = document.createElement('div');
    div.className = 'menuItem';
    div.setAttribute('data-description', m.description);
    div.innerHTML = "<span id='tool"+(l-i)+"'><span>"+m.title+"</span></span>";
    nav.insertBefore(div, nav.firstChild);
  }

  // menu est de type "HTMLCollections" !!
  var menus = document.getElementsByClassName('menuItem');
  // HTMLCollections -> Array
  menus = [].slice.call(menus);

  // on ajoute l'écoute des évènements souris : mouseover/mouseout
  menus.forEach(function(el) {
    var desc = el.getAttribute('data-description');
    // Gestion du survol des menus :
    el.addEventListener('mouseover', function(e) {
      var tooltip = document.getElementById('tooltip');
      tooltip.innerHTML = desc;
      tooltip.style.left = (e.clientX + 15) + 'px';
      tooltip.style.top = (e.clientY + 15) + 'px';
      tooltip.style.display = 'block';
    });
    el.addEventListener('mouseout', function(e) {
      // on masque le tooltip
      var tooltip = document.getElementById('tooltip');
      tooltip.innerHTML = '';
      tooltip.style.display = 'none';
    });
    // ------
  });

  //
  // Gestion du glisser-déposer de fichiers :
  //

  var status = document.getElementById('status');
  if(window.FileReader) {
    status.innerHTML = 'Your browser support the HTML5 FileReader.';
    status.style.color = 'green';

    // Annulation d'un event => ??
    function cancel(e) {
      e.stopPropagation(); // = ?????
      if (e.preventDefault) { e.preventDefault(); }
      return false;
    }

    var listOfFiles = document.getElementById('listOfFiles');
    var drop = document.getElementById('drop');

    // pour autoriser le drag'n'drop ????
    drop.addEventListener('dragover', cancel); // on est sur une zone droppable ...
    drop.addEventListener('dragenter', cancel); // on entre sur une zone droppable ...

    drop.addEventListener('drop', function(e) {
      e = e || window.event; // IE ... ?
      e.preventDefault(); // pour que le navigateur n'ouvre pas le fichier déposé sur cette zone ... ?

      var dt = e.dataTransfer;
      console.log(dt);

      var files = dt.files;
      for(var i = 0; i<files.length; i++) {
        var file = files[i];

        // Uniquement les images sont acceptées
        var isImage = ['png', 'gif', 'bmp', 'jpg'/*, 'jpeg'*/].indexOf(file.name.substr(-3));
        if(isImage !== -1) {

          // les infos sur le fichier déposé !
          listOfFiles.innerHTML += [file.name, file.type, file.size].join(', ')+"<br/>";

          var reader = new FileReader();
          reader.addEventListener('loadend', function(e, file){
            console.log(e, file);

            // fin du chargement du fichier
            listOfFiles.innerHTML += "[loaded]<br/>";

            // contenu en base64
            var base64Content = e.currentTarget.result;

            // @TODO: Utiliser new Image(); ...
            var img = document.createElement('img');
            img.src = base64Content;
            document.getElementById('myImages').appendChild(img);

          });
          // Lance le chargement du contenu du fichier !
          reader.readAsDataURL(file); // il existe aussi : readAsText, readAsBinaryString, readAsArrayBuffer

          console.log(reader);
        }
      }
      return false;
    });

  }else{ // IE8- ?
    status.innerHTML = 'Your browser does not support the HTML5 FileReader.';
    status.style.color = 'red';
  }

} //init()
