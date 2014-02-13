//create entities

/*
 * -  create a document in collection slideshow, error si title already exists
 * -  client subscribe
 */
createSlideshowModel({title:'test1'});

/*
 * do : click on createSlide :
 * - create a document in collection slides :
 *          slideshow reference
 * - display slide created on each client :
 *          Slides.find({}).fetch(); 
 */


/*
 * - recupere les data dans  :
 *      Slideshow
 *      Slides
 * - display slides if present     
 */
getSlideshow({title:"test1"});

/*
 * do : move a slide
 * - slide move on other client
 */


/*
 * do : load same slideshow on two client, create a slide
 * do : edit text on one slide
 * do : edit text on same slide
 * expected : alert showing the id of the first user
 */

/*
 * do : load same slideshow on two client, create two slides
 * do : launch jmpress slideshow on user1
 * do : navigate via space bar
 * expected : user2 see css change on slide according to slide active on user1
 * do : user1 create a slide then move it
 * expected : user1 see slide created and see moves
 * do : launch jmpress slideshow on user2 and navigate throughout
 * expected : user1 follow navigation of usr2
 */
