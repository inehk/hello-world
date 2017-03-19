
/*

	INFOS DIVERSES:
	===============

	* Travailler sur la famille des patterns MV* :

		MVC : https://addyosmani.com/resources/essentialjsdesignpatterns/book/#detailmvcmvp

			- La vue réagit au changement d'un modèle
			- possibilité de multiples vues pour un même modèle
			- Controller : il gère l'interaction avec l'utilisateur

			* Utilisation du "pattern Observer" (Publisher/Subscriber) entre la vue et le modèle (les vues observent les modèles)

			* Modèle: = Business Data
				> prend en charge la validation de ses données
				> la synchronisation avec la BBD ou le "LocalStorage" (HTML5)
				* TODO : Gestion des collections d'objet "modèle", comme dans BackBone.js (plus tard...)

			* Vue:
				> plutôt "Dumb"
				> Exemple : gallerie de photos : -> EditView (pour éditer les paramètres d'un modèle "Photo")
				> L'action de mettre à jour est confié au (/responsabilité du) Controller !

			* Controller:
				> Couche intermédiaire
				> ...

*/


/*

=> TODO ajouter des objets à un panier ...

*/


// 
// Objet : avec nom et prix
//
var ObjModel = function(config) {

	// liste des fonctions "callback" a rappeler lors d'un changement d'une donnée du modèle
	var subscribers = [];

	// Valeurs
	var name = config.name || '';
	var price = config.price || 0;

	// notifications envoyées vers les "Observers" qui ont souscrit
	var changed = function() {
		subscribers.forEach(function(el){
			console.log("changed");
			el();
		});
	}

	// Règles ...
	var validatePrice = function(price) {
		return price <= MyApp.maxValue && price >= 0 ? true : false;
	}

	// interface publique ...
	return {
		addSubscriber: function(func) {	subscribers.push(func);	},
		// SETTERs
		setName: function(name_) {
			if(name != name_) { // changement ?
				name = name_;
				changed();
			}
		},
		setPrice: function(price_) {
			if(price_ != price && validatePrice(price_)) { // changement valide ?
				price = price_;
				changed();
				return true; // @TODO: pas utilisé...
			}else{
				return false;
			}
		},
		setPriceDelta: function(delta) {
			return this.setPrice(this.getPrice() + delta);
		},
		// GETTERs
		getName: function() { return name; },
		getPrice: function() { return price; }
	}
};



// 
// VUE : (elles ont peu de responsabilités ...)
// 

var View = {
	getModel: function() {
		return this.objModel;
	}
}

//
// Vue Liste d'objets
//
var ListView = function(objModel, objController, id) {

	// héritage (@TODO)
	this.test = Object.create(View);
	this.test.objModel = objModel;

	// Utilisation du template ...
	var base = document.getElementById("listViewTemplate");

	// Noeud père (racine) de cette vue
	var el = document.getElementById(id || "listView");

	var createLine = function(obj) {
		var li = document.createElement('li');
		li.innerHTML = "<span class='objName'>" + obj.getName() + "</span> " + "<span class='price'>(" + obj.getPrice() + " " + MyApp.currency + ")</span>";
		return li;
	}

	// Contenu de la vue : ce qui va s'afficher en cas de changements dans les données du modèle
	var render = function() {
		var content = Util.stringToDOM(base.innerHTML);
		if(objModel instanceof Array) {
			objModel.forEach(function(obj) {
				var li = createLine(obj);
				content.querySelector("ul").append(li);
			});
		}else{
			var li = createLine(objModel);
			content.querySelector("ul").append(li);
		}
		el.innerHTML = content.innerHTML;
	}


	// on s'inscrit aux changements du/des modèle(s)
	if(objModel instanceof Array) { // "Collection" d'objets "modèle"
		objModel.forEach(function(obj) {
			obj.addSubscriber(render);
		});
	}else{
		objModel.addSubscriber(render);
	}

	var me = this;

	// on laisse le controller gérer les interactions (elles lui sont "déléguée")
	el.addEventListener("click", function(evt) {
		if(/*evt.target.tagName.toUpperCase() == "SPAN" && */ evt.target.className == 'objName') {
			// On recherche quel <li> à été cliqué (car l'event "click" est fait sur le <ul> (parent))
			var i;
			evt.target.parentNode.parentNode.childNodes.forEach(function(el, index) {
				if(el.childNodes[0] == evt.target) {
					i = index;
				}
			});

			if(objModel instanceof Array) {
				if(i!=undefined) {
					objController.handleMyEvent("clickedItem", objModel[i], me, i);
				}else{ // pas trouvé .... !!!
					objModel.forEach(function(obj) {
						objController.handleMyEvent("clickedItem", obj, me);
					});
				}
			}else{
				objController.handleMyEvent("clickedItem", objModel /* paramètre */, me);
			}
		}
	});

	// première initialisation
	render();

	//
	// public
	// 
	var show = function() {
		el.style.display = "";
	}
	var hide = function() {
		el.style.display = "none";
	}
	// pour y accès depuis "var me = this" ...
	this.warn = function(index) {
		if(index!=undefined) {
			el.querySelector("li:nth-child("+(index+1)+")").style.backgroundColor = 'orange';
		}else{
			el.style.backgroundColor = 'orange';
		}
	}

	var color = function(idx, colorName) {
		var elem = el.querySelector("li:nth-child("+(idx+1)+")");
		elem.style.backgroundColor = colorName || 'red';
		elem.className = "myAnimation"; // quelques secondes ...
	}

	return {
		show: show,
		hide: hide,
		warning: this.warn,
		test: this.test,
		changeColor: color
	}
}

//
// Vue Panier
//
var BasketView = function(objModel, objController, id) {
	
	// héritage (@TODO)
	this.test = Object.create(View);
	this.test.objModel = objModel;

	// Utilisation du template ...
	var base = document.getElementById("basketViewTemplate");

	// Noeud père (racine) de cette vue
	var el = document.getElementById(id || "basketView");

	var render = function() {
		var content = Util.stringToDOM(base.innerHTML);
		var somme = 0;
		objModel.forEach(function(obj) {
			somme += obj.getPrice();
		});
		content.querySelector("#nbBasketElem").innerHTML = somme + " " + MyApp.currency;
		el.innerHTML = content.innerHTML;
	}


	// on s'inscrit aux changements du/des modèle(s)
	if(objModel instanceof Array) { // "Collection" d'objets "modèle"
		objModel.forEach(function(obj) {
			obj.addSubscriber(render);
		});
	}else{
		objModel.addSubscriber(render);
	}


	// on laisse le controller gérer les interactions (elles lui sont "déléguée")
	el.addEventListener("click", function() {
		objController.handleMyEvent("clickedBasket", objModel);
	});
	
	// première initialisation
	render();

	return {};
}



// 
// Les controlleurs : La logique et le workflow ...
// 

// Logique Liste
var ListController = function() {
	return {
		handleMyEvent: function(eventName, model, view, value, value2) {
			switch(eventName) {
				case "clickedItem": // quand on click ça augmente le prix de +1
					var result = model.setPrice( Math.round( (model.getPrice()+1) * MyApp.maxValue ) / MyApp.maxValue );
					if(!result) {
						view.warning(value); // value = l'index de la position du <li>
					}
					break;
				case "changeItem":
					var result = model.setPriceDelta(value2);
					console.log(result);
					if(!result) {
						view.warning(value); // value = l'index de la position du <li>
					}else{
						if(value2 > 0) {
							view.changeColor(value, 'green');
						}else{
							view.changeColor(value, 'red');
						}
					}
					break;
				default:
					//
			}
		}
	}
}

// Logique Panier
var BasketController = function() {

	var empty = function(objModel) {
		if(objModel instanceof Array) {
			objModel.forEach(function(obj) {
				obj.setPrice(0);
			});
		}else{
			objModel.setPrice(0);
		}
	}

	return {
		handleMyEvent: function(eventName, model) {
			if(eventName=="clickedBasket") { // quand on click on remet tous les prix à 0
				empty(model);
			}
		}
	}
}


// "main"
var MyApp = {
	currency: '$', // monnaie
	maxValue: 20, // valeur max.
	init : function() {

		//
		// Initialisation du pattern "MVC"
		//
		var listObj = [];
		var MIN = 3;
		var MAX = 10;
		var maxElements = Math.ceil(Math.random() * (MAX - MIN)) + MIN;
		for(var i = 1; i <= maxElements; i++) {
			listObj.push(new ObjModel({name: 'Objet ' + i, price: Math.ceil(Math.random() * MyApp.maxValue)}));
		}
		
		var listController1 = new ListController();
		var listView1 = new ListView(listObj, listController1);

		var basketController1 = new BasketController();
		var basketView1 = new BasketView(listObj, basketController1);

		//
		//
		//
		var listObj = [];
		var abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var MIN = 3;
		var MAX = 10;
		var maxElements = Math.ceil(Math.random() * (MAX - MIN)) + MIN;
		for(var i = 1; i <= maxElements; i++) {
			listObj.push(new ObjModel({name: 'Objet ' + abc.split('')[Math.ceil(Math.random() * 26)-1], price: Math.ceil(Math.random() * MyApp.maxValue)}));
		}
		
		var listController_2 = new ListController();
		var listView_2 = new ListView(listObj, listController_2, "listView_2");

		var basketController_2 = new BasketController();
		var basketView_2 = new BasketView(listObj, basketController_2, "basketView_2");

		// On modifie les valeurs de +1 ou -1 toutes les X secondes
		var nbSec = 0.8;
		setInterval(function() {
			
			var v, models;

			// liste au hasard
			if(Math.random() > 0.5) {
				v = listView1;
				c = listController1;
				models = v.test.getModel();
			}else{
				v = listView_2;
				c = listController_2;
				models = v.test.getModel();
			}

			// objet au hasard
			var idx = Math.floor(Math.random() * models.length);
			var m = models[idx];

			// valeur au hasard
			var delta = Math.random() > 0.5 ? -1 : +1;
			// action !
			c.handleMyEvent("changeItem", m, v, idx, delta);

		}, nbSec * 1000);

	}
};

// Début !
MyApp.init();
