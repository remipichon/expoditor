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
    el.pos =  {
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
    var el = new ElementDAO(self._id);

    var $element = $("#" + self.id)
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
    el.size = {
        width: parseFloat($element.css('width')),
        height: parseFloat($element.css('height'))
    };


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
