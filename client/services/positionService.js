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
    if(typeof component.size.width !== 'number' ||
        typeof component.size.height !== 'number' ||
        typeof component.CSS.left !== 'number' ||
        typeof component.CSS.top !== 'number' ||
        typeof component.ratio.left !== 'number' ||
        typeof component.ratio.top !== 'number'){
        logger.error("PositionService.CSSToPos : mal formed argument. Either size, CSS or ratio are not correctly set",component);
        throw new Meteor.Error('500',"PositionService.CSSToPos : mal formed argument. Either size, CSS or ratio are not correctly set")
    }

    //CSS to position center 
    component.center = {};
    component.center.x = (component.CSS.left) * component.ratio.left + component.size.width / 2;
    component.center.y = (component.CSS.top) * component.ratio.top + component.size.height / 2;
        // logger.info("CSStoPos : convert", component.CSS.left, '', component.CSS.top, 'to center', component.center.x, '', component.center.y);
};


/**
 *
 * component.size : real size width/height(in db)
 * component.center :real pos x/y (in db)
 */
 PositionService.prototype.posToCSS = function(component) {
    if(typeof component.size.width !== 'number' ||
        typeof component.size.height !== 'number' ||
        typeof component.center.x !== 'number' ||
        typeof component.center.y !== 'number' ||
        typeof component.ratio.left !== 'number' ||
        typeof component.ratio.top !== 'number'){
        logger.error("PositionService.posToCSS : mal formed argument. Either size, CSS or ratio are not correctly set",component);
        throw new Meteor.Error('500',"PositionService.posToCSS : mal formed argument. Either size, CSS or ratio are not correctly set")
    }

   component.CSS = {};
   component.CSS.left = (component.center.x - component.size.width / 2) / component.ratio.left;
   component.CSS.top = (component.center.y - component.size.height / 2) / component.ratio.top;
}

