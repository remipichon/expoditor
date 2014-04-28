Template.editorContainer.slides = function() {
    if (typeof Slides.findOne() === 'undefined' || Session.get("clientMode") !== 'editor') {
        console.log("editorContainer empty");
        return [];
    }
    console.log("editorContainer inject data");
    return Slides.find({},{sort:{order:1}}); //enfait pas besoin du sort ici
};



Template.modalCurrentEditing.editorSlideCurrentEditing = function() {
    if (CurrentEditing.find({}).fetch().length !== 0) {
        // throw new Meteor.Error("500","More than one slide in CurrentEditing");
        console.log("More than one slide in CurrentEditing");
    }
    console.log("Template.modalCurrentEditing.editorSlideCurrentEditing");
    return CurrentEditing.find({});
};



/****** render *****/

/*
 * callback of render to add draggable when edit
 */
Template.editorSlide.rendered = function() {
    console.log("slide.rendered for editor", this.data._id);

    this.data.id = this.data._id;
    var dragger = new goog.fx.Dragger(goog.dom.getElement(this.data._id));
    goog.events.listen(dragger, 'start', startDragSlide, 'false', this.data);
    //if(Session.get("heavyRefresh")) goog.events.listen(dragger, goog.fx.Dragger.EventType.DRAG, dragSlide, 'false', this.data);    
    goog.events.listen(dragger, 'end', endDragSlide, 'false', this.data);

};



/******
 *  method
 ******/
Template.editorSlide.isActive = function() {

    var remote = Remote.findOne({
        slideshowId: Slideshow.findOne({})._id //, activeSlideId: notnull
    });
    if (typeof remote !== "undefined") { //pour eviter une erreur la premeire fois
        if (this._id === remote.activeSlideId) {
            return "active";
        } else {
            return "";
        }
    }
};



Template.editorSlide.getEditorData = function(axis) {

    // if(typeof this.CSS === "undefined"){
    console.log('editorSlide.getEditorData', this._id);
    var posX = parseFloat(this.displayOptions.editor.positions.x);
    var posY = parseFloat(this.displayOptions.editor.positions.y);

    this.center = {
        x: parseFloat(this.displayOptions.editor.positions.x),
        y: parseFloat(this.displayOptions.editor.positions.y)
    };
    this.size = {
        width: parseFloat(this.displayOptions.editor.size.width),
        height: parseFloat(this.displayOptions.editor.size.height)
    }
    this.ratio = {
        top: ratioSlideshowMode,
        left: ratioSlideshowMode
    }
    delete this.CSS;
    posToCSS.call(this);
    // }

    switch (axis) {
        case "x":
            var coord = this.CSS.left; //posX / ratioSlideshowMode;
            break;
        case "y":
            var coord = this.CSS.top; //tposY / ratioSlideshowMode;
            break;
        case "z":
            var coord = 0;
            break;
        case "scaleX":
            var coord = 1; /// 5;
            break;
        case "scaleY":
            var coord = 1; /// 5;
            break;
        case "h":
            var coord = this.displayOptions.editor.size.height / ratioSlideshowMode; //
            break;
        case "w":
            var coord = this.displayOptions.editor.size.width / ratioSlideshowMode; //
            break;
        default:
            return "";

    }
    return coord;
};