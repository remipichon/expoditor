/***************  EVENTS ***************/


TimelineControler = function(timelineId) {
  if(typeof timelineId !== "string"){
    logger.error("TimelineControler constructor needs an ID for timeline")
  }
  this.timelineId = timelineId;
};

/**
 * create a clone timeline-slide "slide" at pos "i"  
 * @param  {object} slide         the timeline-slide to clone
 * @param  {number} i             pos of the timeline-slide
 * @param  {boolan} doSetSortable true to re-compute sortable on all timeline-slides
 */
TimelineControler.prototype.cloneSlide = function(slide,i, doSetSortable) {
  var item = $("#" + slide.id + "");
  var item_clone = $("#" + slide.id + "-cloned"); //hohoho c'est pas beau cela
  item.data("clone", item_clone).attr("cloneId", item_clone.attr("id"));
  var position = item.position();
  item_clone
    .css({
      left: position.left,
      top: position.top,
      visibility: "hidden"
    })
    .attr("data-pos", i); //.attr("id", $(this).attr('id') + "-cloned");

  item.attr("data-pos", i);

  if (typeof doSetSortable !== 'undefined' && doSetSortable) {
    this.setSortable();
  }

}



TimelineControler.prototype.setSortable = function() {
  var self = this;
  $("#"+this.timelineId).sortable({
    axis: "y",
    revert: true,
    scroll: true,
    placeholder: "sortable-placeholder",
    cursor: "move",

    start: function(e, ui) {
      ui.helper.addClass("exclude-me");
      $("#"+self.timelineId+" .timeline-slide:not(.exclude-me)")
        .css("visibility", "hidden"); //cache toutes les vrais slides sauf celle en cours de déplacement
      $("#cloned-slides .timeline-slide").css("visibility", "visible"); //affiche tous les clones      
      ui.helper.data("clone").hide(); //cache le clone de la slide en cours de déplacement
    },

    stop: function(e, ui) {
      $("#"+self.timelineId+" .timeline-slide.exclude-me").each(function() {
        var item = $(this);
        var clone = item.data("clone");
        var position = item.position();

        clone.css("left", position.left);
        clone.css("top", position.top);
        clone.show();

        item.removeClass("exclude-me");
      });

      self.updateOrder();

      //cache tous les clones, affiche toutes les slides
      $("#timeline .timeline-slide").css("visibility", "visible");
      $("#cloned-slides .timeline-slide").css("visibility", "hidden");


    },

    change: function(e, ui) {
      //pour toutes les slides sauf celle en cours de déplacement
      //on anime le déplacement vers sa position de déplacement
      $("#"+self.timelineId+" .timeline-slide:not(.exclude-me)").each(function() {
        var item = $(this);
        var clone = item.data("clone");
        clone.stop(true, false);
        var position = item.position();
        logger.log("sortable.change", position.left, position.top);
        clone.animate({
          left: position.left,
          top: position.top
        }, 200);
      });
    }

  });

}

//updateOrderControler
TimelineControler.prototype.updateOrder = function(self) {
  //met à jour les data-pos des clones
  $("#"+this.timelineId+" .timeline-slide").each(function() {
    var item = $(this);
    var clone = item.data("clone");

    logger.info("sortable.stop", item.attr("id"), item.attr("data-pos"), item.index());

    clone.attr("data-pos", item.index());
    item.attr("data-pos", item.index());

  });

  //TODO ameliorer le this
  var sl = new SlideDAO();

  $("#timeline .timeline-slide").each(function() {
    var item = $(this);

    //TODO update only if needed ==> done by DAO
    sl._id = item.attr("id").split('-')[0];
    sl.order = item.attr("data-pos");
    sl.updateOrder();

    //if (parseInt(item.attr("data-pos")) !== item.index()) { //if update needed
    //update order
   // updateOrder.apply($(this), [item.attr("data-pos")]);
    //}
  });
}