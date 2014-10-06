
/**
 * live load to edit
 */
test_liveLoadToEdit = function() {
    clearServerData();
    injectData();
    _unloadToStore(Slideshow.findOne({})._id);
    loadToEdit(Slideshow.findOne({})._id);
    //TODO verifier que les connlecions sont vide et que slideshow est plein
}