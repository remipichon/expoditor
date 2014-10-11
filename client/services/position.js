PositionService = function() {
    this.ratioSlideshowMode = 5;
    this.ratioContentMode = 1;
    this.ratioTimeline = 10;
}



PositionService.prototype.resizeModalCurrentEditing = function() {
    logger.info("resizeModalCurrentEditing");
    var $modal = $("#modalCurrentEditing");
    if ($modal.length === 1) {
        var offSetTop = 70; //parseFloat($modal.css("top"));
        var rapportHW = 7 / 9;
        var $window = $(window);
        var W = $window.width();
        var H = $window.height() - offSetTop;
        var h, w;
        if (H < rapportHW * W) {
            h = H;
            w = 1 / rapportHW * h;
        } else if (H >= rapportHW * W) {
            w = W;
            h = rapportHW * w;
        }
        logger.log('resizeModal : W:', W, 'H:', H, 'offset:', offSetTop);
        logger.log("resize modal to w h", w, h);
        $modal.css("width", w).css("height", h);


        // implementation ratio fail

        /* var newRatioX = w / 900;
        var newRatioY = h / 700;
        logger.log("resizeModal : rescale modal to x y", newRatioX, newRatioY);
        $modal.css("transform", "scale(" + newRatioX + "," + newRatioX + ")");

        //pas bien ici
        $modal.css("width", 900).css("height", 700);

        var posLeft = (-1) * 900 * (1 - newRatioX) / 2;
        var posTop = (-1) * 700 * (1 - newRatioY) / 2 + offSetTop;
        $modal.css("top", posTop).css("left", posLeft);
        logger.log("resizeModal : repos modal to top left", posTop, posLeft);*/


    } else {
        logger.warn('resizeModal modalCurrentEditing not in dom');
    }

    // setTimeout(repositionElementModalCurrentEditing, 100);
}


//gestion de la taille de la modalEditContent
//$(window).on('resize', resizeModalCurrentEditing);


/**
 *
 * this.size : real size width/height(in db)
 * this.CSS : CSS displayed top/left
 */
PositionService.prototype.CSSToPos = function() {
    // logger.info("CSSToPos");

    if (typeof this.size === "undefined") {
        throw new Meteor.Error('500', "recalPos : this.size not defined")
    }
    this.size.width = parseFloat(this.size.width);
    this.size.height = parseFloat(this.size.height);


    //CSS to position center 
    if (typeof this.CSS === 'object' && typeof this.center === 'undefined') {
        this.center = {};
        this.center.x = (this.CSS.left) * this.ratio.left + this.size.width / 2;
        this.center.y = (this.CSS.top) * this.ratio.top + this.size.height / 2;
        // logger.info("CSStoPos : convert", this.CSS.left, '', this.CSS.top, 'to center', this.center.x, '', this.center.y);
        return;
    }
    throw new Meteor.Error('500', "CSStoPos : this.CSS doesn't exists or both exists");
}


/**
 *
 * this.size : real size width/height(in db)
 * this.center :real pos x/y (in db)
 */
PositionService.prototype.posToCSS = function() {
    // logger.info("posToCSS");

    if (typeof this.size === "undefined") {
        throw new Meteor.Error('500', "recalPos : this.size not defined")
    }
    this.size.width = parseFloat(this.size.width);
    this.size.height = parseFloat(this.size.height);


    //position center to CSS
    if (typeof this.center === 'object' && typeof this.CSS === 'undefined') {
        this.CSS = {};
        this.CSS.left = (this.center.x - this.size.width / 2) / this.ratio.left;
        this.CSS.top = (this.center.y - this.size.height / 2) / this.ratio.top;
        //this.CSS.left = this.center.x / this.ratioLeft - this.size.width / 2;
        //this.CSS.top = this.center.y / this.ratioTop - this.size.height / 2;


        // logger.info("posToCSS : convert", this.center.x, '', this.center.y, 'to CSS', this.CSS.left, '', this.CSS.top);
        return;
    }
    throw new Meteor.Error('500', "posToCSS : this.center doesn't exists or both exists");
}


/**
 * [coorToCSS description]
 * if this.center.x/y : coord plan (centre des elements) TO CSS this.postion.top/left (hautgauche)
 * if CSS this.postion.top/left TO this.center.x/y
 * @param  {[type]} ref [string of a CSSquery OR jQuery object OR  {W:,H:} OR {ratioLef:,ratioTop:}]
 * @return {[type]}     [description]
 */
PositionService.prototype.recalcPos = function(ref) {
    logger.info("recalcPos");
    var doNothing = false;
    var $ref, refW, refH;

    if (ref instanceof Object) {
        if (typeof ref.W === "number" && typeof ref.W === "number") {
            refW = ref.W;
            refH = ref.H;

            this.ratioLeft = 900 / refW; //ATTENTION, voir un peuplus bas le copoer/coller
            this.ratioTop = 700 / refH;

        } else if (typeof ref.ratioLeft === "number" && typeof ref.ratioTop === "number") {
            this.ratioLeft = ref.ratioLeft;
            this.ratiotop = ref.ratioTop;
        } else {
            throw new Meteor.Error("recalcPos bar arguments (required a CSS query)")
        }
    } else {
        if (typeof ref === 'string') {
            $ref = $(ref);
        } else if (ref instanceof jQuery) {
            $ref = ref;
        } else {
            throw new Meteor.Error("recalcPos bar arguments (required {W:,H:} OR {ratioLef:,ratioTop:} avec des int)");
        }
        refW = parseFloat($ref.css('width'));
        refH = parseFloat($ref.css('height'));

        this.ratioLeft = 900 / refW; //ATTENTION, voir un peuplus haut le copoer/coller
        this.ratioTop = 700 / refH;
    }



    // logger.log("!!!2 ", this);

    if (typeof this.size === "undefined") {
        throw new Meteor.Error('500', "recalPos : this.size not defined")
    }
    this.size.width = parseFloat(this.size.width);
    this.size.height = parseFloat(this.size.height);

    //position center to CSS
    if (typeof this.center === 'object' && typeof this.CSS === 'undefined') {
        this.CSS = {};
        this.CSS.left = (this.center.x - this.size.width / 2) / this.ratioLeft;
        this.CSS.top = (this.center.y - this.size.height / 2) / this.ratioTop;
        //this.CSS.left = this.center.x / this.ratioLeft - this.size.width / 2;
        //this.CSS.top = this.center.y / this.ratioTop - this.size.height / 2;
        if (doNothing) {
            this.CSS.left = this.center.x;
            this.CSS.top = this.center.y;
            this.ratioLeft = 1;
            this.ratioTop = 1;
        }
        this.ratioLeft = 1;
        this.ratioTop = 1;

        logger.info("recalcPos : convert", this.center.x, '', this.center.y, 'to CSS', this.CSS.left, '', this.CSS.top);
        return;
    } else
    //CSS to position center 
    if (typeof this.CSS === 'object' && typeof this.center === 'undefined') {
        this.center = {};
        this.center.x = (this.CSS.left + this.size.width / 2) * this.ratioLeft;
        this.center.y = (this.CSS.top + this.size.height / 2) * this.ratioTop;
        // this.center.x = this.CSS.left ;//+ this.size.width / 2) * this.ratioLeft;
        // this.center.y = this.CSS.top;// + this.size.height / 2) * this.ratioTop;
        // this.ratioLeft = 1;
        // this.ratioTop = 1;
        if (doNothing) {
            this.CSS.left = this.center.x;
            this.CSS.top = this.center.y;
            this.ratioLeft = 1;
            this.ratioTop = 1;
        }
        logger.info("recalcPos : convert", this.CSS.left, '', this.CSS.top, 'to center', this.center.x, '', this.center.y);
        return;
    }
    // logger.log("debug recalc",this);
    // logger.log("!!!3", this);
    throw new Meteor.Error('500', "recalcPos : this.center or this.CSS doesn't exists or both exists");
}


PositionService.prototype.repositionElementModalCurrentEditing = function() {
    logger.warn("repositionElementModalCurrentEditing SKIPPED");
    return;


    if (!Session.get('modalCurrentEditing')) return;
    logger.log("repositionElementModalCurrentEditing");
    $(Elements.find({
        slideReference: {
            $in: [CurrentEditing.findOne({})._id]
        }
    }).fetch()).each(function() {
        logger.info("repositionElementModalCurrentEditing", this._id)
        var ele = Elements.findOne({
            _id: this._id
        });
        var $ele = $("#" + this._id + "-currentEditing-wrapper");


        this.center = {
            x: parseFloat(ele.displayOptions.editor.positions.x),
            y: parseFloat(ele.displayOptions.editor.positions.y)
        };
        this.size = {
            width: parseFloat(ele.displayOptions.editor.size.width),
            height: parseFloat(ele.displayOptions.editor.size.height)
        }
        delete this.CSS;
        recalcPos.apply(this, ['#modalCurrentEditing']);

        var slideW = parseFloat($($('#modalCurrentEditing')).css('width'));
        var slideH = parseFloat($($('#modalCurrentEditing')).css('height'));
        var rapporHW = slideH / slideW;

        var ratioLeft = 900 / slideW;
        var ratioTop = 700 / slideH;

        var l = this.CSS.left; //ele.displayOptions.editor.positions.x / ratioLeft;
        l = l + "px";
        var t = this.CSS.top; //ele.displayOptions.editor.positions.y / ratioTop;
        t = t + "px";
        logger.log(l, t)
        $ele.css('left', l)
            .css('top', t);

        //scale    
        //var scale = 'scale(' + 1 / this.ratioLeft + ',' + 1 / this.ratioTop + ')';
        //$ele.css("transform", scale);
    });
};



/* Exception from Deps afterFlush function: Error: Can't create second landmark in same brancj*/
/*https://github.com/meteor/meteor/issues/281#issuecomment-16191927*/
/*https://github.com/meteor/meteor/issues/281#issuecomment-28704924*/
Handlebars.registerHelper('labelBranch', function(label, options) {
    var data = this;
    return Spark.labelBranch(Spark.UNIQUE_LABEL, function() {
        return options.fn(data);
    });
});