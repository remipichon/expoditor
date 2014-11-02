GoogEditor = function() {};


GoogEditor.prototype.makeEditable = function(field) {
    if (lockService.setLock(Elements.findOne({
        _id: field._id
    })._id, ["content"])) {

        //cancel all other editor (if exists)
        if ($("#quitEditTexteButton").length === 0) logger.warn("need a quit edit all texte button");
        $("#quitEditTexteButton").trigger("click");

        //super listener jQuery qui s'auto off et permet de desactiver les editor lorqu'on clique ailleurs
        //quit editor anywhere except iframe
        $("#modalCurrentEditing *:not('iframe')").on('mousedown.editText', function(e) {
            $("#modalCurrentEditing *:not('iframe')").off('mousedown.editText');
            $("#quitEditTexteButton").trigger("click");
        });

        $("#" + field._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
        field.makeEditable(); //methode de google Closure sur une instance editor 

        //pas top !
        logger.warn("bricolage ! pour changer le background color et le margin du body del'iframe");
        $("iframe").css('background-color', 'rgba(0,0,0,0)')
        $("iframe").contents().find('body').css('margin-top', '0px');
        $("iframe").contents().find('body').css('margin-left', '0px');

        var button = goog.dom.getElement('quitEditTexteButton');
        goog.style.setOpacity(button, '1');
    }
}

GoogEditor.prototype.makeUneditable = function(field) {
    if (field.isUneditable()) return;

    $("#" + field._id + '-currentEditing-wrapper').toggleClass('currentlyEditingByMe');
    field.makeUneditable();

    _callerUpdateData.call(field);

    var button = goog.dom.getElement('quitEditTexteButton');
    goog.style.setOpacity(button, '0');

   lockService.unsetLock(Elements.findOne({
        _id: field._id
    })._id, ["content"]);
}

/**
 * il faut :
 * l'element texte (myfield) (dblclick)
 * un button (opt)  (button) (click)
 * mongo _id      (pour les callbacks)
 * 
 */

// GoogEditor.prototype.init = function(idElement, callbackTarget, callback) {
GoogEditor.prototype.init = function(field,component, callbackTarget) {
    if (typeof window[callbackTarget] !== "object") {
        logger.error(callbackTarget, "doesn't exist in the window scope");
        return;
    }

    var myField = new goog.editor.Field(component.id);
    myField.id = component.id;
    myField._id = component._id;
   

    myField.callbackTarget = callbackTarget;



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
        _callerUpdateData, myField); //TOUPDATE

    /***  manage event  **/
    //double click pour activer l'édition de texte
    goog.events.listen(goog.dom.getElement(component.id), goog.events.EventType.DBLCLICK,
        _callerMakeEditable, 'false', myField);
    //click on button to enable editor
    var wrp = goog.dom.getElement(component.id+ '-wrapper');  
    goog.events.listen(goog.dom.getElementByClass('editTextContent', wrp), goog.events.EventType.CLICK,
        _callerMakeEditable, 'false', myField);
    // click on button to disable editor
    var button = goog.dom.getElement('quitEditTexteButton');
    goog.events.listen(goog.dom.getElement(button), goog.events.EventType.CLICK,
        _callerMakeUneditable, 'false', myField);

    return myField;
}

_callerMakeEditable = function(e) {
    e.stopPropagation();
    googEditor.makeEditable(this) //TODO utiliser instanceName
}
_callerMakeUneditable = function(e) {
    e.stopPropagation();
    googEditor.makeUneditable(this);
}
_callerUpdateData = function(e) {
    window[this.callbackTarget].updateTextContent(this);
}