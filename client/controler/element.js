/***************  EVENTS ***************/

Template.deleteElement.events({
    'click': function(event) {
        elementControler.deleteElement(this);
    }
});


/***************  CONTROLER ***************/
ElementControler = function() {};



ElementControler.prototype.addTexte = function(event) {
    if (event.target.className !== "elementsAreaCurrentEditing") {
        logger.warn("ElementControler.addTexte : magouille pour prevent le dblclick on element to create element");
        return;
    }

    var el = new ElementDAO();
    el.pos = {
        y: event.offsetY * ratioContentMode,
        x: event.offsetX * ratioContentMode
    };

    el.create();
    trucChouette = el;
}

ElementControler.prototype.editTexte = function(event) {
    var content = this.getCleanContents();
    logger.info('GoogEditor.makeUneditableCallback', content);
    if (Session.get("heavyRefresh")) updateSlideElementModel.apply(this, [content]);
}

ElementControler.prototype.deleteElement = function(element) {
    var el = new ElementDAO(element._id);
    el.delete();
}


ElementControler.prototype.drag = function(self) {
     var el = this._getDomPosSize(self)

     
    // var el = new ElementDAO(self._id);

    // var $element = $("#" + self.id)
    // var top = parseFloat($element.css('top'));
    // var left = parseFloat($element.css('left'));

    // el.CSS = {
    //     top: top,
    //     left: left
    // };

    // el.size = {
    //     width: parseFloat(self.displayOptions.editor.size.width),
    //     height: parseFloat(self.displayOptions.editor.size.height)
    // };
    // //si resize en cours les données dans la bd ne sont pas accurate
    // el.size = {
    //     width: parseFloat($element.css('width')),
    //     height: parseFloat($element.css('height'))
    // };


    el.updatePos();
}


ElementControler.prototype.startDrag = function(self) {
    $("#" + self._id).toggleClass('dragged');
    $("#" + self._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
}

ElementControler.prototype.endDrag = function(self) {
    $("#" + self._id).toggleClass('dragged');
    $("#" + self._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    elementControler.drag(self);
}

/**
 * return a new elementDAO with the new pos from the DOM
 * @return {[type]} [description]
 */
ElementControler.prototype._getDomPosSize = function(self) {
    var el = new ElementDAO(self._id);

    var $element = $("#" + self.id);
    var component = goog.dom.getElement(self.id);
    
    var top = parseFloat($element.css('top'));
    var left = parseFloat($element.css('left'));

    el.CSS = {
        top: top,
        left: left
    };

    el.size = {
        width: parseFloat(self.displayOptions.editor.size.width),
        height: parseFloat(self.displayOptions.editor.size.height)
    };
    //si resize en cours les données dans la bd ne sont pas accurate
    el.size = goog.style.getSize(component);

    logger.debug("_getDomPosSize", el.CSS, el.size);
    return el;
}



ElementControler.prototype.resize = function(self) {
    var component = goog.dom.getElement(self.id);
    var size = goog.style.getSize(component);

    //TODO d'ou vient ce ratio ? 
    var ratio;
    if (goog.dom.classes.has(component, 'slide')) {
        ratio = ratioSlideshowMode;
    } else if (goog.dom.classes.has(component, 'element')) {
        ratio = ratioContentMode;
    }


    var el = this._getDomPosSize(self);

    el.size = {
        height: el.size.height * ratio,
        width: el.size.width * ratio
    };
    var id = {
        _id: self._id
    };
    var update = {
        $set: {
            'displayOptions.editor.size': el.size,
            'displayOptions.jmpress.size': el.size,
        }
    }

    var updatePos = el.updatePos(true);
    jQuery.extend(update.$set, updatePos.$set);



    /**
     * Il faut absolument que
     */
    if (goog.dom.classes.has(component, 'slide')) {
        return Slides.update(id, update);
    } else if (goog.dom.classes.has(component, 'element')) {
        return Elements.update(id, update);
    }

}

ElementControler.prototype.startResize = function(component) {
    $("#" + component.id).data("isResizabling", true);
}

ElementControler.prototype.endResize = function(component) {
    logger.info("endResizeElement", component._id, component.id);
    elementControler.resize(component);
    $("#" + component.id).data("isResizabling", false);
}