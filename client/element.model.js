/**
 * create an element texte in the slide currently editing (_id get from CurrentEditing)
 * @param  {[object]} options nothing by now
 * @return {[type]}         [description]
 */
createElementTexte = function(options) {
    console.log("create element texte");
    var d = new Date;
    var content = "ele:" + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();


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
                positions: {
                    x: 0,
                    y: 0
                },
                size: {
                    height: 100,
                    width: 200
                }
            },
            jmpress: {
                positions: {
                    x: 0,
                    y: 0
                },
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
updateElementPos = function() {
    console.log("updateElementPos", this._id, this.id);

    var $element = $("#" + this.id + '-wrapper')
       var top = parseFloat($element.css('top'));
    var left = parseFloat($element.css('left'));
    
    this.CSS = {
        top: top,
        left: left
    };
    this.size = {
        width: parseFloat(this.displayOptions.editor.size.width),
        height: parseFloat(this.displayOptions.editor.size.height)
    }
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

    return Elements.update(this._id, {
        $set: {
            "displayOptions.editor.positions": pos,
            "displayOptions.jmpress.positions": pos
        }
    });
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