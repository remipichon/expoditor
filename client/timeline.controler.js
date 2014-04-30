cloneSlide = function(i, doSetSortable) {

  console.log("cloneSlide", this.id, i);

  var item = $("#" + this.id + "");
  var item_clone = $("#" + this.id + "-cloned"); //hohoho c'est pas beau cela
  if (item_clone.length == 0) {
    //throw new Meteor.Error('500','clone not found :'+this.id+' .cloned-slides #'+this.id);
    console.log("cloneSlide clone not found :", '.cloned-slides #' + this.id);
  }
  if (item.length == 0) {
    //throw new Meteor.Error('500','clone not found :'+this.id+' .cloned-slides #'+this.id);
    console.log("cloneSlide item not found :", "#timeline #" + this.id);
  }
  //console.log("clonSlide",item,item_clone);
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
  console.log("cloneSlide", this.id, i);
  //$("#cloned-slides").append(item_clone);

  if (typeof doSetSortable !== 'undefined' && doSetSortable) {
    setSortable();
  }

}

removeClone = function() {
  $(this.id).remove();
}


setTimeline = function() {
  throw new Meteor.Error("setTimeline deprecated");
  // Some of this code is me
  // Some of this code is this fiddle http://jsfiddle.net/dNfsJ/ thx to AJ for finding it for me.

  //temporary hack thanks to dom (it's a TODO)
  $(".timeline-slide").each(function(i) {
    this.id = $(this).attr("id");
    cloneSlide.apply(this, [i]);
  });

  setSortable();

}

setSortable = function() {
  console.log("setSortable");
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
        clone.attr("data-pos", item.index());
        item.attr("data-pos", item.index());
        clone.stop(true, false);
        var position = item.position();
        console.log("sortable.change", position.left, position.top);
        clone.animate({
          left: position.left,
          top: position.top
        }, 200);
      });
    }

  });

}

updateOrderControler = function() {
  //met à jour les data-pos des clones
  $("#timeline .timeline-slide").each(function() {
    var item = $(this);
    var clone = item.data("clone");

    console.log("sortable.stop", item.attr("id"), item.attr("data-pos"), item.index());
    //if(parseInt(item.attr("data-pos")) !== item.index()){ //if update needed
    //update order

    //}

    clone.attr("data-pos", item.index());
    item.attr("data-pos", item.index());

  });

  updateOrderControlerVersModel();
}

updateOrderControlerVersModel = function() {
  $("#timeline .timeline-slide").each(function() {
    var item = $(this);
    updateOrder.apply($(this), [item.attr("data-pos")]);
  });
}