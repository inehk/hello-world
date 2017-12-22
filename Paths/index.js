/*

Force-Directed Layout :
https://www.brad-smith.info/blog/archives/129




TODO:

Utiliser les poids pour les positionnement (si nouveau bloc, peu de poids pour ne pas bouger le reste !...)











*/

var svg = document.getElementById('main');
var width = window.innerWidth;
var height = window.innerHeight;

svg.addEventListener('contextmenu', function(event) {
  event.preventDefault();
});

//
// Example
//
var subjects_ = [{
  id: 1,
  name: 'Maximum likelihood estimator',
  desc: '',
  progress: 10,
  dependencies: [2, 3]
},{
  id: 2,
  name: 'Random variable',
  desc: '',
  progress: 100,
  dependencies: [/*1, 3*/]
},{
  id: 3,
  name: 'Probability Density function',
  desc: '',
  progress: 80,
  dependencies: [/*2, 1*/]
},{
  id: 4,
  name: 'Test',
  desc: '',
  progress: 80,
  dependencies: [2, 3]
}];

var subjects = {};
subjects_.map(function(s) {
  var pos = getRandomPosition();
  s.x = pos.x;
  s.y = pos.y;
  subjects[s.id] = s;
});
console.log(subjects);

function getRandomPosition() {
  return {x: parseInt(Math.random()*width*0.75)+50, y: parseInt(Math.random()*height*0.75)+25};
}

function createBox(subject) {
  var boxGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    var boxWidth = (subject.name.length*7.5+30);
    //var pos = getRandomPosition();
    //subject.x = pos.x;
    //subject.y = pos.y;
    subject.boxWidth = boxWidth;
    subject.boxGroup = boxGroup;

    // Boite
    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("id", "box");
    rect.setAttribute("fill", "beige");
    rect.setAttribute("stroke", "black");
    rect.setAttribute("x", subject.x+"px");
    rect.setAttribute("y", subject.y+"px");
    rect.setAttribute("width", boxWidth+"px");
    rect.setAttribute("height", "50px");
    rect.setAttribute("pointer-events", "inherit");
    rect.setAttribute('draggable', true);
    boxGroup.appendChild(rect);

    subject.rect = rect;

    // Text name
    var textName = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textName.innerHTML = subject.id+". "+subject.name;
    textName.setAttribute("x", (subject.x+9)+"px");
    textName.setAttribute("y", (subject.y+19)+"px");
    textName.setAttribute("fill", "black");
    textName.setAttribute("stroke", "black");
    textName.setAttribute("font-size", "10pt");
    textName.setAttribute("family", "sans serif");
    boxGroup.appendChild(textName);

    subject.textName = textName;

    // Text description

    // Rect pourcentage progression

  // EVENTS sur les box
  boxGroup.addEventListener('mouseover', function(e) { e.target.parentNode.querySelector("rect").setAttribute("stroke-width", 5); });
  boxGroup.addEventListener('mouseout', function(e) { e.target.parentNode.querySelector("rect").setAttribute("stroke-width", 1); });
  boxGroup.addEventListener('dragstart', function(e) {
    console.log("dragstart", e);
    console.log(e.target.parentNode);
  });
  boxGroup.addEventListener('drag', function(e) {
    console.log("drag", e);
  });
  boxGroup.addEventListener('dragend', function(e) {
    console.log("dragend", e);
    e.target.parentNode.setAttribute("x", e.clientX);
    e.target.parentNode.setAttribute("y", e.clientY);
  });
  boxGroup.setAttribute('class', 'bloc');
  boxGroup.setAttribute('draggable', true);
  svg.appendChild(boxGroup);

  return boxGroup;
}

function createLine(subject) {
  subject.dependencies.forEach(function(dep) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute("x1", subject.x+(subject.name.length*7.5+30)/2);
    line.setAttribute("y1", subject.y+10);
    line.setAttribute("x2", subjects[dep].x + subjects[dep].name.length*9/2);
    line.setAttribute("y2", subjects[dep].y + 10);
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", 2);
    line.setAttribute("marker-end", 'url(#head)');
    line.addEventListener('mouseover', function(e) { e.target.setAttribute("stroke-width", 5); });
    line.addEventListener('mouseout', function(e) { e.target.setAttribute("stroke-width", 1); });
    svg.appendChild(line);
  });
}














/**
 *
 * FORCE-DIRECTED GRAPH LAYOUT
 *
 */

 REPULSION_CONSTANT = 1; // Coulomb ... ?
 ATTRACTION_CONSTANT = 10;
 SPRING_LENGTH = 10000; // plus petit = ressort plus "compacte", mais pb si trop compacte ça explose ???!!...

function distance(a, b) {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2)
    +
    Math.pow(a.y - b.y, 2)
  );
}

ForceLayout = (function() {
  var me = this;
  function setGraphObject(object) {
    me.object = object;
  };

  function doLayout() {
    var i = 0;
    while(i < 10) {
      var totalDisplacement = 0;

      // Pour chaque noeud : on va calculer la force à y appliquer
      Object.values(me.object).forEach(function(node) {

        // netForce = C'est la force totale exercée sur ce noeud
        var netForceX = 0, netForceY = 0,
            vec;

        node.oldX = node.x;
        node.oldY = node.y;

          // Electron/Loi de coulomb (avec tous les *autres* noeuds) => répulsion
        Object.values(me.object).forEach(function(node2) {
          if(node !== node2) {
            vec = calcRepulsionForce(node, node2); // force, angle
            netForceX += vec[0]*Math.cos(vec[1]); // Magn ... angle
            netForceY += vec[0]*Math.sin(vec[1]);
          }
        });

        // Loi de Hooke : Ressorts (uniquement si connecté !)
        for(var i in node.dependencies) {
          var linkedNode = me.object[node.dependencies[i]];
          var springLength = distance(node, linkedNode);
          vec = calcAttractionForce(node, linkedNode, SPRING_LENGTH);
          //console.log('force attraction :' + vec[0]);
          netForceX += vec[0]*Math.cos(vec[1]); // Magn ... angle
          netForceY += vec[0]*Math.sin(vec[1]);
        };



        if(node.velocityX == undefined) {
          node.velocityX = netForceX;
          node.velocityY = netForceY;
        }else{
          node.velocityX += netForceX;
          node.velocityY += netForceY;
        }

        // d'y mettre ici ça fait quoi de mieux ???!!!
        node.x += node.velocityX*0.1/* v*dt */;
        node.y += node.velocityY*0.1/* v*dt */;

      });


      // Bouger chaque node avec la force calculé précedemment
      Object.values(me.object).forEach(function(node) {
        var oldX = node.x;
        var oldY = node.y;
        // calcul du déplacement vers la nouvelle position
        //console.log("node.velocityX:", node.velocityX, "node.velocityY:", node.velocityY);

        node.velocityX = 0;
        node.velocityY = 0;

        // Ajouter ça à totalDisplacement
          //console.log("distance beetween : ", oldX, oldY, node.x, node.y);
        addedDisplacement = distance({x: node.oldX, y: node.oldY}, node);
          //console.log("addedDisplacement : ", addedDisplacement);
        totalDisplacement += addedDisplacement;

      });

      //console.log("totalDisplacement:", totalDisplacement);

      // fin : plus rien ne bouge
      if(totalDisplacement < 1E-9) {
        break;
      }

      i++;
    }
    //console.log("i=", i);
  };

  function getBearingAngle(node1, node2) {
    return Math.atan2(node2.x - node1.x, node2.y - node1.y); // * 180 / Math.PI; // degrée
  }

  function calcRepulsionForce(node1, node2) {
    var proximity = Math.max(distance(node1, node2), 1);
    var force = -REPULSION_CONSTANT / Math.pow(proximity, 2)
    //console.log("force de repulsion entre "+node1.id+" et "+node2.id, force);
    var angle = getBearingAngle(node1, node2);
    //console.log("angle de repulsion entre "+node1.id+" et "+node2.id+" en degré", angle * 180 / Math.PI);
    return [force, angle];
  };

  function calcAttractionForce(node1, node2, springLength) {
    var proximity = Math.max(distance(node1, node2), 1);
    var force = ATTRACTION_CONSTANT * Math.max(proximity - springLength, 0);
    //console.log("forceAttr:", force);
    var angle = getBearingAngle(node1, node2);
    return [force, angle];
  };

  return {
    doLayout: doLayout,
    setGraphObject: setGraphObject
  }

})(window);

ForceLayout.setGraphObject(subjects);
ForceLayout.doLayout();



Object.values(subjects).forEach(function(s){
  createLine(s);
});



Object.values(subjects).forEach(function(s, idx){
  createBox(s);
});
