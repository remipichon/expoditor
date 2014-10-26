ElementDAO = function(args) {

    //constructor
    this.defaultPos = {
        x: 200,
        y: 200
    };

    this.defaultContent = "Type text here";

    if (typeof args === "string") {
        this._id = args;
    } else if (typeof args === "object") {
        //TODO merge this et args
    } else {
        this._id = null;
    }
}

//methods

ElementDAO.prototype.delete = function() {
    if (!userHasAccessToComponent.call(this)) {
        throw new Meteor.Error('500', 'deleteSlideElement : cannot remove an element locked');
    }
    //TODO ne pas supprimer l'element et seuelement sa reference
    return Elements.remove(this._id);
};


/**
 * create an element texte in the slide currently editing (_id get from CurrentEditing)
 * @param  {[object]} options nothing by now
 * @return {[type]}         [description]
 */
ElementDAO.prototype.create = function() {
    var d = new Date;
    var content = "ele:" + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();

    if (typeof this.pos !== "object" || typeof this.pos.x !== "number" || typeof this.pos.y !== "number") {
        this.pos = this.defaultPos;
    };


    if (typeof this.targetSlide !== 'string') {
        if (typeof CurrentEditing.findOne({}) === 'undefined') {
            throw new Meteor.Error('500', 'ElementDAO.createTexte : CurrentEditing.findOne({}) or targetSlide missing')
        }
        var slideId = CurrentEditing.findOne({})._id;
    } else {
        var slideId = this.targetSlide;
    }

    var el = Elements.insert({
        _id: Random.id(),
        slideReference: [
            slideId
        ],
        content: content,
        type: "text",
        displayOptions: {
            editor: {
                positions: this.pos,
                size: {
                    height: 100,
                    width: 200
                }
            },
            jmpress: {
                positions: this.pos,
                size: {
                    height: 100,
                    width: 200
                }
            }
        }
    });
    this._id = el;
    return this._id;
};



/**
 * update a element pos by this._id. Read CSS left/top in DOM and convert into real pos accordind to
 * slide size and ratioContentMode *
 * @param  {boolean} getUpdateData wether or not return the update objet or really update data
 */
//updateElementPos
ElementDAO.prototype.updatePos = function(getUpdateData) {
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
    if (element.displayOptions.editor.positions.x == this.CSS.left 
        && element.displayOptions.editor.positions.y == this.CSS.top) {
        logger.info("ElementDAO.updatePos : element didn't really move");
        return;
    }

    var update = {
        $set: {
            "displayOptions.editor.positions": pos,
            "displayOptions.jmpress.positions": pos
        }
    }

    if (typeof getUpdateData === 'boolean' && getUpdateData) {
        return update;
    }


    return Elements.update(this._id, update);
};


/**
 * update content of an element given by this._id
 * @param  {string} content : whole new content
 * @return {[type]}         [description]
 */
//updateSlideElementModel
ElementDAO.prototype.updateTextContent = function() {
    return Elements.update(this._id, {
        $set: {
            content: this.content
        }
    });
};
