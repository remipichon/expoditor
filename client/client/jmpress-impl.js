
//migration done


initJmpress = function() {
    logger.info("initJmpress");

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
        logger.debug("createJmpressSLide traitement de la slide invisible");
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

        logger.debug("new slide", newSlide);
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
        logger.debug("delete remainfin slide if exits");
        if($("#jmpress-container >.slide").length !== 0) logger.error("deleteJmpressSlide slide remaining in a wrong place !")
        $("#jmpress-container >.slide").remove(); //pour etre sur qu'il ne reste rien de facheux
    }, 500); //TODO improve

    return newSlide;
}

function deleteJmpressSlide(_id) {
    //required : dynamic deinit (only if directly deleting the dom is not a problem)
    $("#jmpress-container").jmpress("deinit", $("#jmpress-container #" + _id)[0]);
    $("#" + _id).remove();

   

     setTimeout(function() {
        logger.debug("delete remainfin slide if exits");
        if($("#jmpress-container >.slide").length !== 0) logger.error("deleteJmpressSlide slide remaining in a wrong place !")
        $("#jmpress-container >.slide").remove(); //pour etre sur qu'il ne reste rien de facheux
    }, 500); //TODO improve
}


// Slides.find({}).observeChanges({
//     added: function(_id, slide) {
//         if (Session.get("clientMode") === "jmpress") {
//             //required : get techno status : is init ?
//             if ($("#jmpress-container").jmpress("initialized")) {
//                 logger.debug("slides.obsverchanges.added.jmpress.isInit", _id);
//                 createJmpressSlide(_id);
//             }



//         }
//     },
//     changed: function(_id, fields) {
//         if (Session.get("clientMode") === "jmpress") {
//             if (typeof fields.displayOptions === "undefined") {
//                 return;
//             }

//             var activeSlideId = $("#jmpress-container >div .active").attr("id");
//             logger.debug("slides.obsverchanges.changed.jmpress", _id, "activeslideId", activeSlideId, "fields", fields);


//             if (activeSlideId === _id) {
//                 logger.debug("shit, someone move the where you are and this broke jmpress...");
//                 $("#jmpress-container").jmpress("next");
//                 deleteJmpressSlide(_id);
//                 var newSlide = createJmpressSlide(_id);
//                 $("#jmpress-container").jmpress("prev");
//             } else {
//                 deleteJmpressSlide(_id);
//                 var newSlide = createJmpressSlide(_id);
//             }



//         }
//     },
//     removed: function(_id) {
//         if (Session.get("clientMode") === "jmpress") {
//             logger.debug("slides.obsverchanges.removed.jmpress", _id);
//             //required : get active slide (only if deleted current slide is a problem)
//             var activeSlideId = $("#jmpress-container >div .active").attr("id");
//             if (activeSlideId === _id && $("#jmpress-container >div").children().length !== 1) {
//                 //if we are on the deleted slide and it's not the last
//                 logger.debug("slides.obsverchanges.removed.jmpress : next slide");
//                 $("#jmpress-container").jmpress("next");
//             }
//             deleteJmpressSlide(_id);
//         }
//     }
// });

// Template.jmpressContainer.slides = function() {
//     if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'jmpress') {
//         // logger.info("Template.jmpressContainer.slides  empty");
//         $("#jmpress-container").jmpress("deinit");
//         $("#jmpress-container >").remove();
//         return [];
//     }
//     // logger.log("Template.jmpressContainer.slides  inject data");
//     return Slides.find({}, {
//         sort: {
//             order: 1
//         },
//         reactive: false
//     });
// };


// Template.jmpressSlide.getJmpressData = function(axis) {
//     logger.info("Template.jmpressSlide.getJmpressData", axis);
//     switch (axis) {
//         case "x":
//             var coord = parseFloat(this.displayOptions.jmpress.positions.x);
//             break;
//         case "y":
//             var coord = parseFloat(this.displayOptions.jmpress.positions.y);
//             break;
//         case "z":
//             var coord = 0;
//             break;
//         default:
//             return "";

//     }
//     //            logger.log(coord, parseFloat(this.displayOptions.jmpress.positions.y));
//     return coord;
// };


// /**
//  * jmpress mode
//  */
// Template.elementsAreaJmpress.elements = function() {
//     logger.info("Template.elementsAreaJmpress.elements");
//     return Elements.find({
//         slideReference: {
//             $in: [this._id]
//         }
//     });
// };

