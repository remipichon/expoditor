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


cloneJmpressSlide = function(sl) {
    var slide = $(sl);
    var clone = slide.clone();
    slide.removeClass("step").removeClass("slide");
    $("#jmpress-container").append(clone);
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



/**** render ****/


/*
 * callback of render to move jmpress slide
 */
Template.jmpressSlide.rendered = function() {

    console.log("slide.rendered for jmpress", this.data._id);

    var posX = this.data.displayOptions.jmpress.positions.x;
    var posY = this.data.displayOptions.jmpress.positions.y;



    /*
     * Si jmpress est init
     * il faut mettre à jour les jmpress data de la slide jmpress (celle contenue
     * dans le #jmpress-contaner > div et l'init avec jmpress à partir de la slide
     * ajoutée par Handelbars puis supprimer le DOM de cette slide là
     */
    if ($("#jmpress-container").jmpress('initialized')) {
        var $slideToMaj = $("#jmpress-container >div #" + this.data._id);

        if ($slideToMaj.length === 0) {
            console.log("create slide ", this.data._id, " jmpress to ", posX * ratio, posY * ratio);
            var $newSlide = $("#jmpress-container > #" + this.data._id);
            createJmpressClone($newSlide);
            $("#jmpress-container > div").append($newSlide);
            $("#jmpress-container").jmpress('init', $newSlide);
            setTimeout(function() { ///WOUW SUCH MAGIC ! 
                //je ne comprends vraiment pas pourquoi il faut un timeout qui reappend la slide...
                $("#jmpress-container > div").append($newSlide);
            }, 500);
        } else {
            console.log("update de la slide ", this.data._id, " jmpress to ", posX * ratio, posY * ratio);
            $slideToMaj.attr("data-x", parseFloat(posX) * ratio).attr("data-y", parseFloat(posY) * ratio);
            $("#jmpress-container").jmpress('init', $slideToMaj);
        }
        //suppression de la slide crée par Handelbars
        $("#jmpress-container >#" + this.data._id).remove();
    }
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
    setTimeout(function() {
        $("#jmpress-container #" + self.data._id).addClass("lymbe").css("display", "none");

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