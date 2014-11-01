PositionService = function() {
    this.ratioSlideshowMode = 5;
    this.ratioContentMode = 1;
    this.ratioTimeline = 10;
}


/**
 *
 * component.size : real size width/height(in db)
 * component.CSS : CSS displayed top/left
 */
PositionService.prototype.CSSToPos = function(component) {

    if (typeof component.size === "undefined") {
        throw new Meteor.Error('500', "recalPos : component.size not defined")
    }
    component.size.width = parseFloat(component.size.width);
    component.size.height = parseFloat(component.size.height);


    //CSS to position center 
    if (typeof component.CSS === 'object' && typeof component.center === 'undefined') {
        component.center = {};
        component.center.x = (component.CSS.left) * component.ratio.left + component.size.width / 2;
        component.center.y = (component.CSS.top) * component.ratio.top + component.size.height / 2;
        // logger.info("CSStoPos : convert", component.CSS.left, '', component.CSS.top, 'to center', component.center.x, '', component.center.y);
        return;
    }
    throw new Meteor.Error('500', "CSStoPos : component.CSS doesn't exists or both exists");
}


/**
 *
 * component.size : real size width/height(in db)
 * component.center :real pos x/y (in db)
 */
PositionService.prototype.posToCSS = function(component) {
    if (typeof component.size === "undefined") {
        throw new Meteor.Error('500', "recalPos : component.size not defined")
    }
    component.size.width = parseFloat(component.size.width);
    component.size.height = parseFloat(component.size.height);


    //position center to CSS
    if (typeof component.center === 'object' && typeof component.CSS === 'undefined') {
        component.CSS = {};
        component.CSS.left = (component.center.x - component.size.width / 2) / component.ratio.left;
        component.CSS.top = (component.center.y - component.size.height / 2) / component.ratio.top;
        //component.CSS.left = component.center.x / component.ratioLeft - component.size.width / 2;
        //component.CSS.top = component.center.y / component.ratioTop - component.size.height / 2;


        // logger.info("posToCSS : convert", component.center.x, '', component.center.y, 'to CSS', component.CSS.left, '', component.CSS.top);
        return;
    }
    throw new Meteor.Error('500', "posToCSS : component.center doesn't exists or both exists");
}