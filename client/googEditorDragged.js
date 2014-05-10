setToolbar = function() {
    // if(typeof toolbar !== 'undefined'){
    //     throw new Meteor.Error("500","A toolbar is alredy set",toolbar);
    // }

    var quitEditTexteButton = goog.ui.editor.ToolbarFactory
        .makeButton('quitEditTexteButton', 'Quit edit texte', 'Quit Edit Texte', goog.getCssName('expo-toolbar-quitEdit-texte'));
    var quitEditSlideButton = goog.ui.editor.ToolbarFactory
        .makeButton('quitEditSlideButton', 'Quit edit slide', 'Quit Edit Slide', goog.getCssName('expo-toolbar-quitEdit-slide'));
    var addElementTextButton = goog.ui.editor.ToolbarFactory
        .makeButton('addElementTextButton', 'Add texte field', 'Add tex field', goog.getCssName('expo-toolbar-add-element'));



    // Specify the buttons to add to the using, toolbar built in default buttons.
    var buttons = [
        goog.editor.Command.BOLD,
        goog.editor.Command.ITALIC,
        goog.editor.Command.UNDERLINE,
        goog.editor.Command.FONT_COLOR,
        goog.editor.Command.BACKGROUND_COLOR,
        goog.editor.Command.FONT_FACE,
        goog.editor.Command.FONT_SIZE,
        goog.editor.Command.LINK,
        goog.editor.Command.UNDO,
        goog.editor.Command.REDO,
        goog.editor.Command.UNORDERED_LIST,
        goog.editor.Command.ORDERED_LIST,
        goog.editor.Command.INDENT,
        goog.editor.Command.OUTDENT,
        goog.editor.Command.JUSTIFY_LEFT,
        goog.editor.Command.JUSTIFY_CENTER,
        goog.editor.Command.JUSTIFY_RIGHT,
        goog.editor.Command.SUBSCRIPT,
        goog.editor.Command.SUPERSCRIPT,
        goog.editor.Command.STRIKE_THROUGH,
        goog.editor.Command.REMOVE_FORMAT,

        quitEditSlideButton,
        quitEditTexteButton,
        addElementTextButton
    ];
    var myToolbar = goog.ui.editor.DefaultToolbar.makeToolbar(buttons,
        goog.dom.getElement('toolbar'));

    goog.events.listen(goog.dom.getElement("quitEditSlideButton"), goog.events.EventType.CLICK, quitEditSlide);
    goog.events.listen(goog.dom.getElement("addElementTextButton"), goog.events.EventType.CLICK, createElementTexte);


    var button = goog.dom.getElement('quitEditTexteButton');
    goog.style.setOpacity(button, '0');

    // goog.style.setOpacity(goog.dom.getElement('toolbar'), '0');


    return myToolbar;
}


quitEditSlide = function() {
    //cancel all remaining editor (if exists)
    $(".expo-toolbar-quitEdit").trigger("click");

    Session.set("modalCurrentEditing", false);
    CurrentEditing.remove({});

    /*goog.style.setOpacity(goog.dom.getElement('timeline'), '1');
    // goog.style.setOpacity(goog.dom.getElement('buttons'), '1');
    goog.style.setStyle(goog.dom.getElement('buttons'), 'display', 'block');
    goog.style.setOpacity(goog.dom.getElement('toolbar'), '0');*/

    displayBlockAccordingToEditorMode("slideshowMode");

}


makeEditableCallback = function(e) {
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
        console.log("makeEditableCallback", this._id);
        $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
        this.makeEditable();

        var button = goog.dom.getElement('quitEditTexteButton');
        goog.style.setOpacity(button, '1');
    }
}

makeUneditableCallback = function(e) {
    if (this.isUneditable()) return;

    removeLocksControler.call(Elements.findOne({
        _id: this._id
    }));
    console.log("makeUneditableCallback", this._id);
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    this.makeUneditable();

    var content = this.getCleanContents();
    updateSlideElementModel.apply(this, [content]);

    var button = goog.dom.getElement('quitEditTexteButton');
    goog.style.setOpacity(button, '0');
}

updateFieldContents = function(e) {
    var content = this.getCleanContents();
    console.log('content chanded : ', content);
    if (Session.get("heavyRefresh")) updateSlideElementModel.apply(this, [content]);
}

setEditor = function(idElement) {
    if (typeof idElement === "undefined") return;
    console.log("setEditor ", idElement);

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
    console.log('#', idElement, '.editTextContent');
    $('#' + idElement + '-wrapper .editTextContent').on('click', function() {
        makeEditableCallback.call(myField);
    });

    // click on button to disable editor
    var button = goog.dom.getElement('quitEditTexteButton');
    goog.events.listen(goog.dom.getElement(button), goog.events.EventType.CLICK, makeUneditableCallback, 'false', myField);

    return myField;
}



startDragSlide = function(e) {

    e.stopPropagation();
    $("#" + this._id).toggleClass('dragged');
    console.log("slide start drag");
}
startDragElement = function(e) {

    e.stopPropagation();
    $("#" + this._id).toggleClass('dragged');
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    e.stopPropagation();
    console.log("elment start drag")
}
endDragSlide = function(e) {

    $("#" + this._id).toggleClass('dragged');
    updateSlidePos.call(this);
}

dragSlide = function(e) {

    updateSlidePos.call(this);
}
endDragElement = function(e) {

    $("#" + this._id).toggleClass('dragged');
    $("#" + this._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    console.log("endDragElement");
    updateElementPos.call(this);
}
dragElement = function(e) {

    updateElementPos.call(this);
}