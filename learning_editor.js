

getCloserSlide = function(slideID, pos) {
    //connecter cela au ratio et au css
    var H = 70; //height
    var W = 90; //width

    //pour retourner uniquement les slides proche de la slide dont la pos est passée en parametre
    return Slides.find({
        $where: function() {
            return this._id !== slideID && (Math.pow(W, 2) + Math.pow(H, 2) > Math.pow(parseInt(pos.x) - parseInt(this.left), 2) + Math.pow(parseInt(pos.y) - parseInt(this.top), 2));
        }
    }).fetch();
};

/*
 * je ne suis pas fiere de moi, le code est copié collé !
 * Mais je ne comrpends pas pourquoi le server execute mal ma super requete
 */

//TODO transformer ca en objet. prototype de Slide
isCloseTo = function(self, slide) {
    var H = 70; //height
    var W = 90; //width
    return  self._id !== slide._id && 
            (Math.pow(W, 2) + Math.pow(H, 2) > 
            Math.pow(parseInt(slide.left) - parseInt(self.left), 2) + Math.pow(parseInt(slide.top) - parseInt(self.top), 2));
};
        