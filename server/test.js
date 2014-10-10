
/**
 * live load to edit
 */
test_liveloadToEdit = function() {
    _clearServerData();
    _injectData();
    SlideshowState.prototype.unloadToStore(Slideshow.findOne({})._id);
    SlideshowState.prototype.loadToEdit(Slideshow.findOne({})._id);
    //TODO verifier que les connlecions sont vide et que slideshow est plein
}