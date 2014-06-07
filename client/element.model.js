    /**
 * create an element texte in the slide currently editing (_id get from CurrentEditing)
 * @param  {[object]} options nothing by now
 * @return {[type]}         [description]
 */
createElementTexte = function(options) {
    console.log("create element texte", options);
    // return;
    var d = new Date;
    var content = "ele:" + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
    if (typeof options === "undefined") {
        var options = {};
    }
    if (typeof options.pos === "undefined") {
        options.pos = {
            x: 200,
            y: 200
        };
        // console.log("create element texte with pos",options.pos.x, options.pox.y);
    }


    var slideId = CurrentEditing.findOne({})._id;

    return Elements.insert({
        _id: Random.id(),
        slideReference: [
            slideId
        ],
        content: content,
        type: "text",
        displayOptions: {
            editor: {
                positions: options.pos,
                size: {
                    height: 100,
                    width: 200
                }
            },
            jmpress: {
                positions: options.pos,
                size: {
                    height: 100,
                    width: 200
                }
            }
        }
    });
};


/**
 * update a element pos by this._id. Read CSS left/top in DOM and convert into real pos accordind to
 * slide size and ratioContentMode *
 */
updateElementPos = function(getUpdateData) {
    console.log("updateElementPos", this._id, this.id);

    var $element = $("#" + this.id)
    var top = parseFloat($element.css('top'));
    var left = parseFloat($element.css('left'));

    this.CSS = {
        top: top,
        left: left
    };
    this.size = {
        width: parseFloat(this.displayOptions.editor.size.width),
        height: parseFloat(this.displayOptions.editor.size.height)
    };
    //si resize en cours les données dans la bd ne sont pas accurate
    this.size = {
        width: parseFloat($element.css('width')),
        height: parseFloat($element.css('height'))
    };
    this.ratio = {
        top: ratioContentMode,
        left: ratioContentMode
    }
    delete this.center; // pour liberer la place
    CSSToPos.call(this);

    var pos = {
        x: this.center.x,
        y: this.center.y
    };


    var element = Elements.findOne({
        _id: this._id
    });



    //petite verif que l'element ait effectivement été bougé
    if (element.displayOptions.editor.positions.x == left && element.displayOptions.editor.positions.y == top) {
        console.log("updateElementPos : element didn't really move");
        return;
    }

    var update = {
        $set: {
            "displayOptions.editor.positions": pos,
            "displayOptions.jmpress.positions": pos
        }
    }
    console.log("elementModel.updateElementPos", update);

    if (typeof getUpdateData !== 'undefined' && getUpdateData) {
        return update;
    }


    return Elements.update(this._id, update);
};


/**
 * update content of an element given by this._id
 * @param  {string} content : whole new content
 * @return {[type]}         [description]
 */
updateSlideElementModel = function(content) {
    console.log("update element model");

    Elements.update(this._id, {
        $set: {
            content: content
        }
    });
};


/**
 * delete an element given by this._id
 * @return {[type]} [description]
 */
deleteSlideElement = function() {
    console.log("delete element ", this._id);
    if (!userHasAccessToComponent.call(this)) {
        throw new Meteor.Error('500', 'deleteSlideElement : cannot remove an element locked');
    }
    Elements.remove(this._id);
};