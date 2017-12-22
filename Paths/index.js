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
  desc: 'estimateur statistique pour inférer les paramètres d\'une distribution de probabilité d\'un échantillon donné',
  progress: 10,
  dependencies: [2, 3]
},{
  id: 2,
  name: 'Random variable',
  desc: 'discrète, continue, ...',
  progress: 100,
  dependencies: [/*1, 3*/]
},{
  id: 3,
  name: 'Probability Density function',
  desc: 'Représentation d\'une loi de probabilité',
  progress: 80,
  dependencies: [/*2, 1*/]
},{
  id: 4,
  name: 'Pearson\'s Chi-Squared test',
  desc: 'test d\'indépendence',
  progress: 80,
  dependencies: [2, 3]
}];

var randInt = function(min, max) {
  return parseInt(Math.random()*max+min);
}

var nbTotal = 10;
for(var i = subjects_.length+1; i <= nbTotal; i++) {
  subjects_.push({
    id: i,
    name: 'test ' + i,
    dependencies: [randInt(1, nbTotal), randInt(1, nbTotal)]
  })
}



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

var currentSelected = null, currentX, currentY; // l'objet que l'on est en train de déplacer

function createBox(subject) {

  var boxGroup = document.getElementById('subject_' + subject.id);
  if(boxGroup) {
    boxGroup.setAttribute("transform", "translate("+subject.x+", "+subject.y+") rotate(0)");
  }else{

    boxGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    boxGroup.setAttribute("transform", "translate("+subject.x+", "+subject.y+") rotate(0)");
    boxGroup.setAttribute("subjectId", subject.id);
    boxGroup.setAttribute("id", "subject_"+subject.id);
    boxGroup.setAttribute("draggable", "false");


      var boxWidth = (subject.name.length*7.5+20);
      //var pos = getRandomPosition();
      //subject.x = pos.x;
      //subject.y = pos.y;
      subject.boxWidth = boxWidth;
      subject.boxGroup = boxGroup;

      // Boite
      var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("id", "rect_"+subject.id);
      rect.setAttribute("fill", "beige");
      rect.setAttribute("rx", 5);
      rect.setAttribute("ry", 5);
      rect.setAttribute("stroke", "black");
      rect.setAttribute("width", boxWidth+"px");
      rect.setAttribute("height", "50px");
      rect.setAttribute("pointer-events", "all");
      rect.setAttribute("draggable", "false");
      boxGroup.appendChild(rect);
      subject.rect = rect;

      // Text name
      var textName = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textName.innerHTML = subject.name;
      textName.setAttribute("x", "9px");
      textName.setAttribute("y", "19px");
      textName.setAttribute("fill", "black");
      textName.setAttribute("stroke", "black");
      textName.setAttribute("font-size", "10pt");
      textName.setAttribute("pointer-events", "none");
      textName.setAttribute("family", "sans serif");
      textName.setAttribute("draggable", "false");
      boxGroup.appendChild(textName);

      subject.textName = textName;

      // Text description

      // Rect pourcentage progression

    // EVENTS sur les box
    boxGroup.addEventListener('mouseover', function(e) { e.target.parentNode.querySelector("rect").setAttribute("stroke-width", 5); });
    boxGroup.addEventListener('mouseout', function(e) { e.target.parentNode.querySelector("rect").setAttribute("stroke-width", 1); });

    boxGroup.addEventListener('mousedown', function(e) {
      currentSelected = e.target.tagName == 'rect' ? e.target.parentNode : e.target;
      currentX = e.clientX;
      currentY = e.clientY;
    });
    boxGroup.setAttribute('class', 'bloc');

    svg.appendChild(boxGroup);
  }
  return boxGroup;
}

function createLine(subject) {
  subject.dependencies.forEach(function(dep) {
    if(subjects[dep].id==subject.id) {
      console.log("loop!");
      return false;
    }
    var id = "from_"+subject.id+"_to_"+subjects[dep].id;
    var line = document.getElementById(id);
    if(line) {
      line.setAttribute("x2", subject.x+(subject.name.length*7.5+20)/2);
      line.setAttribute("y2", subject.y+10);
      line.setAttribute("x1", subjects[dep].x + (subjects[dep].name.length*7.5+20)/2);
      line.setAttribute("y1", subjects[dep].y + 10);
    }else{
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute("x2", parseInt(subject.x+(subject.name.length*7.5+20)/2));
      line.setAttribute("y2", subject.y+10);
      line.setAttribute("x1", parseInt(subjects[dep].x + (subjects[dep].name.length*7.5+20)/2));
      line.setAttribute("y1", subjects[dep].y + 10);
      line.setAttribute("stroke", "black");
      line.setAttribute("stroke-width", 2);
      line.setAttribute("marker-start", 'url(#head)');
      line.setAttribute("id", id);
      line.addEventListener('mouseover', function(e) { e.target.setAttribute("stroke-width", 5); });
      line.addEventListener('mouseout', function(e) { e.target.setAttribute("stroke-width", 1); });
      svg.appendChild(line);
    }
  });
}














/**
 *
 * FORCE-DIRECTED GRAPH LAYOUT
 *
 */

 REPULSION_CONSTANT = 0.1; // Coulomb ... ?
 ATTRACTION_CONSTANT = 100;
 SPRING_LENGTH = 10000; // plus petit = ressort plus "compacte", mais pb si trop compacte ça explose ???!!...

function distance(a, b) {
  //console.log("distance:", a.x, a.y, b.x, b.y);
  return parseInt(Math.sqrt(
    Math.pow(a.x - b.x, 2)
    +
    Math.pow(a.y - b.y, 2)
  ));
}

ForceLayout = (function() {
  var me = this;
  function setGraphObject(object) {
    me.object = object;
  };

  function doLayout() {
    var i = 0;
    while(i < 1000) {
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
        node.x += node.velocityX*1/* v*dt */;
        node.y += node.velocityY*1/* v*dt */;

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

      document.getElementById('totalDisplacement').innerHTML = totalDisplacement + "--" + i;

      // fin : plus rien ne bouge
      if(totalDisplacement < 100) {
        break;
      }

      i++;
    }
    console.log("i=", i);
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

function display() {
  /*var all = svg.querySelectorAll("line");
  var forEach = Array.prototype.forEach;
  forEach.call(all, function(line){
    svg.removeChild(line);
  });*/
  Object.values(subjects).forEach(function(s){
    createLine(s);
  });

  Object.values(subjects).forEach(function(s, idx){
    createBox(s);
  });

}

display();

svg.addEventListener('mousemove', function(e) {
  if(currentSelected) {
    var transform = currentSelected.getAttribute("transform");
    var myRegex = /translate\(([0-9\.]*), ([0-9\.]*)\)/g;
    var values = myRegex.exec(transform);
    if(values && values.length > 1) {
      var dx = parseFloat(values[1]) + e.clientX - currentX;
      var dy = parseFloat(values[2]) + e.clientY - currentY;
      currentX = e.clientX;
      currentY = e.clientY;
      console.log(dx, dy);
      if(!isNaN(dx) && !isNaN(dy) && dx > 0 && dy > 0) {
        currentSelected.setAttribute("transform", "translate("+parseInt(dx)+", "+parseInt(dy)+") rotate(0)");

        Object.values(subjects).forEach(function(s){
          if(s.id == currentSelected.getAttribute("subjectId")) {
            s.x = parseInt(dx);
            s.y = parseInt(dy);
          }
        });

        display();
      }
    }
  }
});
document.body.addEventListener('mouseup', function(e) {
  console.log("mouseUP!!", e.target);
  currentSelected = null;
});

var arrangeBtn = document.createElement('button');
arrangeBtn.innerHTML = 'Arrange boxes';
arrangeBtn.addEventListener('click', function() {
  ForceLayout.setGraphObject(subjects);
  ForceLayout.doLayout();
  display();
})
document.getElementById("controls").appendChild(arrangeBtn);
