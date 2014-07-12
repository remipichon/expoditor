Template.jmpressContainer.slides = function() {
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'jmpress') {
        console.info("Template.jmpressContainer.slides  empty");
        $("#jmpress-container").jmpress("deinit");
        $("#jmpress-container >").remove();
        return [];
    }
    console.log("Template.jmpressContainer.slides  inject data");
    return Slides.find({}, {
        sort: {
            order: 1
        },
        reactive: false
    });
};



initJmpress = function() {
    console.info("initJmpress");

    $('#jmpress-container').jmpress({
        viewPort: {
            height: 400,
            width: 3200,
            maxScale: 1
        }
    });

    //ajout d'une slide pour que le container ne soit jamais vide (sinon jmpress s'affole)
    createJmpressSlide(null);
};

function createJmpressSlide(_id) {
    if (_id === null) {
        console.debug("createJmpressSLide traitement de la slide invisible");
        //il s'agit de traiter la slide invisible
        var newSlide = UI.renderWithData(Template.jmpressSlide, {
            _id: "invisibleOne",
            displayOptions: {
                jmpress: {
                    positions: {
                        x: 1555,
                        y: 1580,
                        z: 0
                    }
                }
            }
        });

        console.debug("new slide", newSlide);
        UI.insert(newSlide, $("#jmpress-container >").get(0));
        $("#invisibleOne").attr("style", "display:none");
        $("#invisibleOne").attr("data-scale", 5);
        //required : dynamic init
        $("#jmpress-container").jmpress("init", $("#invisibleOne"));

    } else {
        var newSlide = UI.renderWithData(Template.jmpressSlide, Slides.findOne({
            _id: _id
        }));
        UI.insert(newSlide, $("#jmpress-container >").get(0));
        //required : dynamic init
        $("#jmpress-container").jmpress("init", $("#" + _id));
    }


    setTimeout(function() {
        console.debug("delete remainfin slide if exits");
        if($("#jmpress-container >.slide").length !== 0) console.error("deleteJmpressSlide slide remaining in a wrong place !")
        $("#jmpress-container >.slide").remove(); //pour etre sur qu'il ne reste rien de facheux
    }, 500); //TODO improve

    return newSlide;
}

function deleteJmpressSlide(_id) {
    //required : dynamic deinit (only if directly deleting the dom is not a problem)
    $("#jmpress-container").jmpress("deinit", $("#jmpress-container #" + _id)[0]);
    $("#" + _id).remove();

   

     setTimeout(function() {
        console.debug("delete remainfin slide if exits");
        if($("#jmpress-container >.slide").length !== 0) console.error("deleteJmpressSlide slide remaining in a wrong place !")
        $("#jmpress-container >.slide").remove(); //pour etre sur qu'il ne reste rien de facheux
    }, 500); //TODO improve
}


//TODO see what appends when there is several identical observeChanges
Slides.find({}).observeChanges({
    added: function(_id, slide) {
        if (Session.get("clientMode") === "jmpress") {
            //required : get techno status : is init ?
            if ($("#jmpress-container").jmpress("initialized")) {
                console.debug("slides.obsverchanges.added.jmpress.isInit", _id);
                createJmpressSlide(_id);
            }



        }
    },
    changed: function(_id, fields) {
        if (Session.get("clientMode") === "jmpress") {
            if (typeof fields.displayOptions === "undefined") {
                return;
            }

            var activeSlideId = $("#jmpress-container >div .active").attr("id");
            console.debug("slides.obsverchanges.changed.jmpress", _id, "activeslideId", activeSlideId, "fields", fields);


            if (activeSlideId === _id) {
                console.debug("shit, someone move the where you are and this broke jmpress...");
                $("#jmpress-container").jmpress("next");
                deleteJmpressSlide(_id);
                var newSlide = createJmpressSlide(_id);
                $("#jmpress-container").jmpress("prev");
            } else {
                deleteJmpressSlide(_id);
                var newSlide = createJmpressSlide(_id);
            }



        }
    },
    removed: function(_id) {
        if (Session.get("clientMode") === "jmpress") {
            console.debug("slides.obsverchanges.removed.jmpress", _id);
            //required : get active slide (only if deleted current slide is a problem)
            var activeSlideId = $("#jmpress-container >div .active").attr("id");
            if (activeSlideId === _id && $("#jmpress-container >div").children().length !== 1) {
                //if we are on the deleted slide and it's not the last
                console.debug("slides.obsverchanges.removed.jmpress : next slide");
                $("#jmpress-container").jmpress("next");
            }
            deleteJmpressSlide(_id);
        }
    }
});



Template.jmpressSlide.getJmpressData = function(axis) {
    console.info("Template.jmpressSlide.getJmpressData", axis);
    switch (axis) {
        case "x":
            var coord = parseFloat(this.displayOptions.jmpress.positions.x);
            break;
        case "y":
            var coord = parseFloat(this.displayOptions.jmpress.positions.y);
            break;
        case "z":
            var coord = 0;
            break;
        default:
            return "";

    }
    //            console.log(coord, parseFloat(this.displayOptions.jmpress.positions.y));
    return coord;
};


/**
 * jmpress mode
 */
Template.elementsAreaJmpress.elements = function() {
    console.info("Template.elementsAreaJmpress.elements");
    return Elements.find({
        slideReference: {
            $in: [this._id]
        }
    });
};



/**
 * calculate position and size of an element in slide content editor mode according to ratioSlideshowMode
 * @param  {string} axis which CSS style is needed
 * @return {int}      value of the CSS style
 */
Template.elementJmpress.getEditorData = function(axis) { //pas encore utilisé à cause du draggable de jqueryreu

    if (typeof this.CSS === 'undefined') { //works here because elementCurrendEditing are #constant
        console.info("Template.elementJmpress.getEditorData", this._id);

        //a a factoriser avec l'observeChanges
        this.center = {
            x: parseFloat(this.displayOptions.editor.positions.x),
            y: parseFloat(this.displayOptions.editor.positions.y)
        };
        this.size = {
            width: parseFloat(this.displayOptions.editor.size.width),
            height: parseFloat(this.displayOptions.editor.size.height)
        }
        this.ratio = {
            top: ratioContentMode,
            left: ratioContentMode
        }
        delete this.CSS;
        posToCSS.call(this);
    }


    switch (axis) {
        case "x":
            var coord = this.CSS.left;
            break;
        case "y":
            var coord = this.CSS.top;
            break;
        case "z":
            var coord = 0;
            break;
        case "scaleX":
            var coord = 1;
            break;
        case "scaleY":
            var coord = 1;
            break;
        case "h":
            var coord = this.displayOptions.editor.size.height / 1;
            break;
        case "w":
            var coord = this.displayOptions.editor.size.width / 1;
            break;
        default:
            return "";
    }


    return coord;
};