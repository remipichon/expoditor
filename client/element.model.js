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



updateElementPos = function() {
    console.log("updateElementPos", this._id, this.id);

    var $element = $("#" + this.id + '-wrapper')
    /*
     var slideW = parseFloat($($('#modalCurrentEditing')).css('width'));
    var slideH = parseFloat($($('#modalCurrentEditing')).css('height'));
    var rapporHW = slideH / slideW;

    var ratioLeft = 900 / slideW;
    var ratioTop = 700 / slideH;

*/

    var top = parseFloat($element.css('top'));
    var left = parseFloat($element.css('left'));
    /*
    console.log("updateElementPos debug pos", top, left);


    this.CSS = {
        top: top,
        left: left
    };
    this.size = {
        width: parseFloat(this.displayOptions.editor.size.width),
        height: parseFloat(this.displayOptions.editor.size.height)
    }

    delete this.center; // pour liberer la place
    recalcPos.apply(this, ['#modalCurrentEditing']);

    var pos = {
        x: this.center.x,
        y: this.center.y,
        z: 0
    };
    */

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



updateSlideElementModel = function(content) {
    console.log("update element model");

    Elements.update(this._id, {
        $set: {
            content: content
        }
    });
};



deleteSlideElement = function() {
    console.log("delete element ", this._id);
    if (!userHasAccessToComponent.call(this)) {
        throw new Meteor.Error('500', 'deleteSlideElement : cannot remove an element locked');
    }
    Elements.remove(this._id);
};