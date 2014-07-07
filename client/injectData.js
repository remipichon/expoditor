//create a slideshow named <slidehoswName>, some slides with element inside
injectData = function(slidehoswName, options) {

	nbSlide = 5;
	nbElementPerSlide = 3;
	console.debug("you can specify : string:<slideshowname> , object:<nbSlide:int, nbElementPerSlide:int>");
	if (typeof options === "object") {
		if (typeof options.nbSlide === "number") {
			nbSlide = options.nbSlide;
		}
		if (typeof options.nbElementPerSlide === "number") {
			nbElementPerSlide = options.nbElementPerSlide;
		}
	}

	//disableLog();

	//create slide and elements 
	var callbackCreateSlidesow = function() {
		var options, optionsTxt, idSlide;
		for (var i = 0; i < nbSlide; i++) {
			options = {
				pos: {
					x: 1000 + i * 200,
					y: 1000 + i * 200
				},
				title: '' + (1000 + i * 500)
			};
			idSlide = createSlide(options);

			//add element inside
			for (var j = 0; j < nbElementPerSlide; j++) {
				optionsTxt = {
					pos: {
						x: 100 + j * 30,
						y: 100 + j * 20,
					},
					targetSlide: idSlide
				}
				createElementTexte(optionsTxt);
			}
		}

		//enableLog();

	};

	//create slideshow
	if (typeof slidehoswName === "undefined") {
		var d = new Date;
		var slidehoswName = "ele:" + d.getHours() + ":" + d.getMinutes() + ":" + d.getMilliseconds();
	}
	var options = {
		title: slidehoswName
	};
	Meteor.call('createSlideshow', options, function(error, result) {
		if (typeof error !== "undefined") {
			throw new Meteor.Error(200, "createSlideshow : create error " + error);
		} else {
			getSlideshowModel({
				title: options.title,
			}, callbackCreateSlidesow);

		}
	});



}