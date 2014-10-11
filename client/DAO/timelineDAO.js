TimelineDAO = function(){};


/**
 * this : est un objet jquery lorsqu'appelé par timeline.controler.sortable
 * @return {[type]} [description]
 */
//updateOrder
TimelineDAO.prototype.updateOrder = function(newPos) {
	if (this instanceof jQuery) {
		var _id = this.attr("id").split('-')[0];
		var title = this.children('.title').html();
		return Slides.update({_id:_id},{$set:{order:parseInt(newPos)}});
	}
}