makeEditableCallback = function(e) {
    e.stopPropagation();
    if (updateWithLocksControler.apply(Elements.findOne({
        _id: this._id
    }))) {


        //super listener jQuery qui s'auto off et permet de desactiver les editor lorqu'on clique ailleurs
        //quit editor anywhere except iframe
        $("#modalCurrentEditing *:not('iframe')").on('mousedown.editText', function(e) {
            $("#modalCurrentEditing *:not('iframe')").off('mousedown.editText');
            $("#quitEditTexteButton").trigger("click");
        });


        //cancel all other editor (if exists)
        $("#quitEditTexteButton").trigger("click");
        logger.info("makeEditableCallback", this._id);
        $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
        this.makeEditable();

        //pas top !
        logger.warn("bricolage ! pour changer le background color et le margin du body del'iframe");
        $("iframe").css('background-color', 'rgba(0,0,0,0)')
        $("iframe").contents().find('body').css('margin-top', '0px');
        $("iframe").contents().find('body').css('margin-left', '0px');

        var button = goog.dom.getElement('quitEditTexteButton');
        goog.style.setOpacity(button, '1');
    }
}

makeUneditableCallback = function(e) {
    e.stopPropagation();

    if (this.isUneditable()) return;

    logger.info("makeUneditableCallback", this._id);
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    this.makeUneditable();

    var content = this.getCleanContents();
    updateSlideElementModel.apply(this, [content]);

    var button = goog.dom.getElement('quitEditTexteButton');
    goog.style.setOpacity(button, '0');

    
    removeLocksControler.call(Elements.findOne({
        _id: this._id
    }));
}

updateFieldContents = function(e) {
    var content = this.getCleanContents();
    logger.info('makeUneditableCallback', content);
    if (Session.get("heavyRefresh")) updateSlideElementModel.apply(this, [content]);
}

setEditor = function(idElement) {
    if (typeof idElement === "undefined") return;
    logger.info("setEditor ", idElement);

    var myField = new goog.editor.Field(idElement);
    myField.id = idElement;
    var mongoId = idElement.split('-')[0]
    myField._id = mongoId; //pour coller à miniMongo

    // Create and register all of the editing plugins you want to use.
    myField.registerPlugin(new goog.editor.plugins.BasicTextFormatter());
    myField.registerPlugin(new goog.editor.plugins.RemoveFormatting());
    myField.registerPlugin(new goog.editor.plugins.UndoRedo());
    myField.registerPlugin(new goog.editor.plugins.ListTabHandler());
    myField.registerPlugin(new goog.editor.plugins.SpacesTabHandler());
    myField.registerPlugin(new goog.editor.plugins.EnterHandler());
    myField.registerPlugin(new goog.editor.plugins.HeaderFormatter());
    myField.registerPlugin(
        new goog.editor.plugins.LoremIpsum('Click here to edit'));
    myField.registerPlugin(
        new goog.editor.plugins.LinkDialogPlugin());
    myField.registerPlugin(new goog.editor.plugins.LinkBubble());

    // Hook the toolbar into the field.
    var myToolbarController =
        new goog.ui.editor.ToolbarController(myField, toolbar);

    //send data
    goog.events.listen(myField, goog.editor.Field.EventType.DELAYEDCHANGE,
        updateFieldContents, myField);

    //manage event
    //double click pour activer l'édition de texte
    goog.events.listen(goog.dom.getElement(myField.id), goog.events.EventType.DBLCLICK, makeEditableCallback, 'false', myField);
    logger.log('#', idElement, '.editTextContent');
    $('#' + idElement + '-wrapper .editTextContent').on('click', function() {
        makeEditableCallback.call(myField);
    });

    // click on button to disable editor
    var button = goog.dom.getElement('quitEditTexteButton');
    goog.events.listen(goog.dom.getElement(button), goog.events.EventType.CLICK, makeUneditableCallback, 'false', myField);
    //TODO handle an event fired instead of trigger click
    //
    
    //try for giving the editor to everyone
    $("#"+idElement).data("editorInstance",myField);

    return myField;
}