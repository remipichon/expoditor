/***************  EVENTS ***************/


TimelineControler = function(){};

TimelineControler.prototype.cloneSlide = function(i, doSetSortable) {

  logger.info("cloneSlide", this.id, i);

  var item = $("#" + this.id + "");
  var item_clone = $("#" + this.id + "-cloned"); //hohoho c'est pas beau cela
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
  logger.info("cloneSlide", this.id, i);

  if (typeof doSetSortable !== 'undefined' && doSetSortable) {
    setSortable();
  }

}



TimelineControler.prototype.setSortable = function() {
  logger.info("setSortable");
  $("#timeline").sortable({

    axis: "y",
    revert: true,
    scroll: true,
    placeholder: "sortable-placeholder",
    cursor: "move",

    start: function(e, ui) {
      ui.helper.addClass("exclude-me");
      $("#timeline .timeline-slide:not(.exclude-me)")
        .css("visibility", "hidden"); //cache toutes les vrais slides sauf celle en cours de déplacement
      $("#cloned-slides .timeline-slide").css("visibility", "visible"); //affiche tous les clones      
      ui.helper.data("clone").hide(); //cache le clone de la slide en cours de déplacement
    },

    stop: function(e, ui) {
      $("#timeline .timeline-slide.exclude-me").each(function() {
        var item = $(this);
        var clone = item.data("clone");
        var position = item.position();

        clone.css("left", position.left);
        clone.css("top", position.top);
        clone.show();

        item.removeClass("exclude-me");
      });

      updateOrderControler();

      //cache tous les clones, affiche toutes les slides
      $("#timeline .timeline-slide").css("visibility", "visible");
      $("#cloned-slides .timeline-slide").css("visibility", "hidden");


    },

    change: function(e, ui) {
      //pour toutes les slides sauf celle en cours de déplacement
      //on anime le déplacement vers sa position de déplacement
      $("#timeline .timeline-slide:not(.exclude-me)").each(function() {
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

TimelineControler.prototype.updateOrderControler = function() {
  logger.info("updateOrderControler");
  //met à jour les data-pos des clones
  $("#timeline .timeline-slide").each(function() {
    var item = $(this);
    var clone = item.data("clone");

    logger.info("sortable.stop", item.attr("id"), item.attr("data-pos"), item.index());


    clone.attr("data-pos", item.index());
    item.attr("data-pos", item.index());

  });

  updateOrderControlerVersModel();
}

TimelineControler.prototype.updateOrderControlerVersModel = function() {
  logger.info("updateOrderControlerVersModel");
  $("#timeline .timeline-slide").each(function() {
    var item = $(this);
    //if (parseInt(item.attr("data-pos")) !== item.index()) { //if update needed
      //update order
      updateOrder.apply($(this), [item.attr("data-pos")]);
    //}
  });
}