/**
@TODO:

-> Modifier le style !

-> remettre la transparence sur la pastille li "valid" (data:png...) !!!

-> mettre des boutons + ou - 1 pour la progression
    -> ajouter les évenements ... + modifier les données => réactualiser juste le nécessaire ...

-> mettre une progressbar globale !
    -> s'inspirer de bootstrap !!

-> changer la souris => "cursor" : avec url('data:....') ?

-> sauvegarde des données modifiées sur le browser ... !!

-> Pouvoir déplacer une ligne ! (drag-n-drop)
    -> Voire une liste entière ...

@BUG:


@XXX:
WebStorage (local ou session) : IE8+

*/

(function(window) {

    var get = function(id) { return document.getElementById(id); };

    var body = document.getElementsByTagName('body')[0];

    function getSkillsObj() {
        return {
            "C": {
                "__desc": "Connaitre le langage C",
                "__tags": ["difficile"],
                "Pointeurs": {
                    "__desc": "les pointers !!!",
                    "__tags": ["moyen"],
                    "memcpy": [0, "savoir faire.."],
                    "pointeur sur fonction": [15.5, "comment ça marche ?"]
                },
                "stdlib": {
                    "un truc": [0, "savoir s'en servir.."],
                    "un autre truc": [90, "comment ça marche ?"]
                },
                "les types": [20, "Lister tous les types de données"]
            },
            "PHP7": {
                "__tags": ["facile"],
                "Différences avec le 5.X": [10, "..."],
                "Installer PHP7 et des extensions": [100, "Fait sur Raspberry PI"]
            }
        };
        //return localStorage.getItem('skills');
    }

    // Ecriture dans la zone de logs sur l'écran
    function writeToLog(text) {
        var log = document.getElementById('log');
        log.innerHTML += text + '<br/>';
        log.scrollTop = log.scrollHeight; // pour rester en bas de la liste
    }

    function createSkillsDOM(skills) {
        var innerHTML = createSkillsHTMLText(skills);
        var div = document.createElement('div');
        div.className = "skills";
        div.innerHTML = innerHTML;
        div.addEventListener('mouseenter', function(e) {
            if(e.target.tagName.toUpperCase() == 'SPAN' && e.target.className.indexOf("progress") !== -1) {

                writeToLog(e.target.clientX);

                // = ??
                //log.scrollIntoView(false); // IE8+ , mais expérimental toujours ??


            }
        });

        var currentEditedDescription = null;

        div.addEventListener("click", function(e) {

             if(e.target.className == 'progress') {
                 // @TODO : faire progresser la tâche cliquée ...
             }

             if(e.target.className.indexOf('description') !== -1) {

                 currentEditedDescription = e.target;
                 // on masque le <span> de la description
                 currentEditedDescription.style.visibility = 'hidden';

                 createStringReplacementSpan();

                 var inputText = document.getElementById('newDescriptionText');
                 inputText.value = currentEditedDescription.innerHTML;

                 // on y positionne au dessus de l'élement édité..
                 currentDescriptionEditionSpan = get('test');
                 currentDescriptionEditionSpan.style.position = 'absolute';
                 currentDescriptionEditionSpan.style.visibility = 'visible';

                 //   '- 2' => sinon le <input> bouge un peu vers le bas et c'est moche
                 currentDescriptionEditionSpan.style.top = (e.target.offsetTop - 2) + 'px';
                 currentDescriptionEditionSpan.style.left = e.target.offsetLeft + 'px';
                 currentDescriptionEditionSpan.style.width = e.target.offsetWidth + 'px';

                 inputText.focus(); // Il faut bien que ce <input> soit visible sinon .focus() ne marche pas

                 currentDescriptionEditionSpan.addEventListener('keydown', funcKeyDown(currentEditedDescription)); // validation avec <ENTER> ?
                 currentDescriptionEditionSpan.querySelector('input[type=text]').addEventListener('blur', funcKeyDown(currentEditedDescription)); // validation avec <ENTER> ?
             }

        });
        return div;
    }

    // lors d'une saisie d'une modif. de description
    var funcKeyDown = function(currentEditedDesc) {
        return function(ev) {
            if(ev.type == 'keydown' && ev.keyCode == 13 || ev.type == 'blur') {
                currentDescriptionEditionSpan = get('test');

                currentDescriptionEditionSpan.removeEventListener('keydown', funcKeyDown(currentEditedDesc)); // ça marche bien ??

                //console.log(currentDescriptionEditionSpan);
                //console.log(currentDescriptionEditionSpan.parentNode);

                try {
                    // on vire cet element d'édition !
                    currentDescriptionEditionSpan.parentNode.removeChild(currentDescriptionEditionSpan);

                    // on réutilise la modification qui vient d'être validée..
                    // Il y a eu un changement ?
                    if(currentEditedDesc.innerHTML !== ev.target.value) {
                        writeToLog(currentEditedDesc.innerHTML + ' <b>(DEVIENT)</b> ' + ev.target.value);
                        currentEditedDesc.innerHTML = ev.target.value;
                    }

                    currentEditedDesc.style.visibility = 'visible';

                } catch (e) {
                    if(e instanceof DOMException) {
                        console.log("Exception : le blur est passé avant ?!");
                    }else{
                        throw e;
                    }
                }

            }
        };
    };

    function createStringReplacementSpan() {
        var currentDescriptionEditionSpan = document.createElement('span');
        var inputText = document.createElement('input');
        inputText.type = 'text';
        inputText.id = 'newDescriptionText';
        inputText.value = '';
        currentDescriptionEditionSpan.appendChild(inputText);
        currentDescriptionEditionSpan.id = 'test';
        currentDescriptionEditionSpan.style.display = 'block'; // pour le positionnement absolute ??
        currentDescriptionEditionSpan.style.visibility = 'hidden';
        body.appendChild(currentDescriptionEditionSpan);
    }

    var sum = total = 0;
    var ret = getTotalProgressionRec(getSkillsObj())
    document.getElementById('globalProgression').innerHTML = Math.round(ret[0]/ret[1]*100*100) / 100;

    function getTotalProgressionRec(skills) {
        for(var i in skills) {
            if(skills[i] instanceof Array && skills[i].length == 2) {
                sum += skills[i][0];
                total += 100;
            }else{
                if(skills[i] instanceof Object) {
                    getTotalProgressionRec(skills[i]);
                }
            }
        }
        return [sum, total];
    }

    // @TODO: utiliser "map" ?
    function addTags(tags) {
        var html = '';
        for(var i in tags) {
            var className = '';
            switch(tags[i]) {
                case "difficile":   className='red'; break;
                case "moyen":   className='orange'; break;
                case "facile":   className='green'; break;
            }
            html += '<span class="tag ' + className + '">'+tags[i]+'</span>';
        }
        return html;
    }

    function createSkillsHTMLText(skills, depth) {
        depth = depth || 0;
        var html = '';
        var parentTags = [];

        for(var name in skills) {

            // données "internes"
            if (name.substr(0, 2) == "__") {
                switch(name.substr(2)) {
                    // description d'un noeud
                    case "desc":    continue;
                    // Etiquettes (tags)
                    case "tags":
                        parentTags = skills[name]; // PAS utilisé..
                        continue;
                        break;
                    default:
                }
            }
            // les sous-listes ou autres font partie d'une liste, et on besoin d'un <li>
            if(depth) { html += '<li'; }

            if(skills[name] instanceof Array) { // JS 1.4 !
                // simple liste d'éléments
                var progress = skills[name][0];
                var desc = skills[name][1];
                if(progress >= 100) {
                    html += ' class="validedSkill"';
                }
                if(depth) {
                    html += ' data-progession=' + progress + '>';
                }
                html += '<span class="skillName' + (progress >= 100 ? ' finished' : '') + '">' + name + '</span>' +
                        ' <span class="description">' + desc + '</span> ' +
                        ' <span class="progress">' + progress + '</span>';
            }else{
                if(depth) {
                    html += '>';
                }
                // Liste de listes
                html += "<ul class='" + (depth%2 ? 'odd' : 'even') + "'><span class='skillNameParent'>" + name + '</span>';
                if(skills[name].__desc) {
                    // description d'une liste
                    html += " : <span class='description titleDescription'>" + skills[name].__desc + "</span>";
                }
                if(skills[name].__tags) {
                    html += addTags(skills[name].__tags);
                }
                html += createSkillsHTMLText(skills[name], depth+1);
                html += "</ul>";
            }

            if(depth) { html += '</li>'; }
        }
        return html;
    }



    // chargement des données..
    body.appendChild(createSkillsDOM(getSkillsObj()));

})(window);
