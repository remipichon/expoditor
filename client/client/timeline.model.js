/**
 * this : est un objet jquery lorsqu'appelé par timeline.controler.sortable
 * @return {[type]} [description]
 */
updateOrder = function(newPos) {
	if (this instanceof jQuery) {
		var _id = this.attr("id").split('-')[0];
		var title = this.children('.title').html();
		logger.info("updateOrder",_id,title,'to',newPos);
		Slides.update({_id:_id},{$set:{order:parseInt(newPos)}});

	}
}