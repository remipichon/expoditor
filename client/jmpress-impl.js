Template.jmpressContainer.slides = function() {
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'jmpress') {
        console.log("jmpressContainer empty");
        return [];
    }
    console.log("jmpressContainer inject data");
    return Slides.find({}, {
        sort: {
            order: 1
        }
    });
};


/**
 * jmpress mode
 */
Template.elementsAreaJmpress.elements = function() {
    return Elements.find({
        slideReference: {
            $in: [this._id]
        }
    });
};



cloneJmpressSlide = function(sl) {
    var slide = $(sl);
    var clone = slide.clone();
    clone.addClass("clone");
    slide.removeClass("step").removeClass("slide").addClass("lymbe");
    if ($("#jmpress-container").jmpress('initialized')) {
    $("#jmpress-container >  div:not(.lymbe)").append(clone);
    } else {
    $("#jmpress-container").append(clone);
    }
    console.log('cloneJmpressSlide',sl,clone)
    // alert();
    return clone;
}


initJmpress = function() {
    // console.log("init jmpress desactivé");
    // return;

    //test : clone des slides pour maintenir la gestion via Spacebars
    $('#jmpress-container').children('.slide').each(function() {
        cloneJmpressSlide(this);
    });



    console.log("init jmpress");
    //launch jmpress first time
    $('#jmpress-container').jmpress({
        viewPort: {
            height: 400,
            width: 3200,
            maxScale: 1
        }
    });
};



Template.jmpressSlide.getJmpressData = function(axis) {
    console.log("jmpressSlide getJmpressData", axis);
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
 * calculate position and size of an element in slide content editor mode according to ratioSlideshowMode
 * @param  {string} axis which CSS style is needed
 * @return {int}      value of the CSS style
 */
Template.elementJmpress.getEditorData = function(axis) { //pas encore utilisé à cause du draggable de jqueryreu

    if (typeof this.CSS === 'undefined') { //works here because elementCurrendEditing are #constant
        console.log("elementJmpress.getEditorData", this._id);

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


/**** render ****/


/*
 * callback of render to move jmpress slide
 */
Template.jmpressSlide.rendered = function() {
    if ($("#jmpress-container").jmpress('initialized')) {
        console.log('jmpressSlide desactivate when jmpress is init')
    }

    console.log("slide.rendered for jmpress", this.data._id);

    var posX = this.data.displayOptions.jmpress.positions.x;
    var posY = this.data.displayOptions.jmpress.positions.y;



    /*
     * Si jmpress est init
     * il faut mettre à jour les jmpress data de la slide jmpress (celle contenue
     * dans le #jmpress-contaner > div et l'init avec jmpress à partir de la slide
     * ajoutée par Handelbars
     */
    // if ($("#jmpress-container").jmpress('initialized')) {
    // var $slideToMaj = $("#jmpress-container >div #" + this.data._id);

    // if ($slideToMaj.length === 0) {
    console.log("create slide ", this.data._id, " jmpress to ", posX, posY);
    var $templateSlide = $("#jmpress-container > #" + this.data._id);
    var $jmpressClone = cloneJmpressSlide($templateSlide);
    //$("#jmpress-container > div").append($newSlide);
    $("#jmpress-container").jmpress('init', $jmpressClone);
    // setTimeout(function() { ///WOUW SUCH MAGIC ! 
    //     //je ne comprends vraiment pas pourquoi il faut un timeout qui reappend la slide...
    //     $("#jmpress-container > div").append($newSlide);
    // }, 500);
    // } else {
    //     console.log("update de la slide ", this.data._id, " jmpress to ", posX * ratio, posY * ratio);
    //     $slideToMaj.attr("data-x", parseFloat(posX) * ratio).attr("data-y", parseFloat(posY) * ratio);
    //     $("#jmpress-container").jmpress('init', $slideToMaj);
    // }
    // //suppression de la slide crée par Handelbars
    // $("#jmpress-container >#" + this.data._id).remove();
    // }
};


/*
 * A la suppression de la slide, jmpress doit deinit la slide mais il laisse
 * le dom dans le jmpress-container>div, on ajoute la classe "lymbe" pour signifier
 * que c'est une slide morte. Il faut laisser le DOM pour que le deinit du container jmpress
 * puisque fonctionner.
 *
 * Lorsqu'il ne reste plus que des slides "lymbe" et que le client n'est pas (plus) en
 * jmpress mode, il faut deinit l'ensemble du container et procéder à la suppression
 * des slides que jmpress déplace dans jmpress-container. On n'en a plus besoin ici.
 *
 * Le traitement n'est pas propre mais Jmpress fait sa petite tambouille qu'on ne peut
 * pas altérer.
 */
Template.jmpressSlide.destroyed = function() {
    console.log("slidejmpress destroyed", this.data._id);

    var slideToRemove = $("#jmpress-container >div #" + this.data._id);
    $("#jmpress-container").jmpress("deinit", slideToRemove);

    var self = this;

    $("#jmpress-container #" + self.data._id).addClass("lymbeOldJmpress").css("display", "none");
    // $("#jmpress-container #" + self.data._id).remove();
    setTimeout(function() {
        //       s'il n'y a plus de slide et que le client mode n'est plus jmpress, il faut deinit jmpress
        if ($("#jmpress-container >div >:not(.lymbe)").length === 0 && Session.get("clientMode") !== "jmpress") {
            console.log("jmpress-container.jmpress.deinit");
            $("#jmpress-container").jmpress("deinit"); //la slide n'existe déja plus dans le DOM, il faut un before destroyed !!!
            setTimeout(function() {
                console.log("jmpress-container.children.remove (cleaning after jmpress deinit");
                $("#jmpress-container").children().remove();
            }, 500);
        }
    }, 500);

};