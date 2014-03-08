/*************
 * unit testes by console
 ************/

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





/********************************
 * 
 *      GUI testes
 *      
 ********************************/

/****************
 * slideshow: create/load 
 * slide : create/move/edit with lock 
 **************/

clearServerData();

/*
 * click : loadSlideshow
 * expected : alert : "no slideshow to load"
 */

/*
 * click : createSlideshow
 * expected : 
 *  - prompt : type a title $TTTLE
 *  - loadslideshow loaded (but is empty)
 */

/*
 * click : create a slide
 * expected : a slide appears
 */

/*
 * do : connect as another user
 * click : loadSlideshow
 * expected : prompt for a title
 * 
 * type :  $TITLE
 * expected : slideshow with slides loaded
 */

/*
 * do : move a slide on one user
 * expected : slide move on the other users
 */

/*
 * double click : on a slide
 * expected : prompt to change title
 * type : a new title
 * expected : title has changed on every client
 */

/*
 * do on user1 : double click on a slide
 * do on user2: double click on the same slide
 * expected : alert showing the id of the first user
 */

/*
 * double click on user2 :  on the same slide
 * expected : prompt to change title
 * type :  a new title
 * expected : title has changed on every client
 */

/*
 * do : create several slides
 * do : move severals slides
 * expected : see corresponding testes
 */

/***********************
 * elements : create/update/delete with lock 
 **********************/

/*
 * click : on a slide, on createElement button ("+")
 * expected : a new element is displayed on each client
 */


/*
 * click : on a element
 * expected : prompt to change text
 * type : a new text
 * expected : text has changed on every client
 */

/*
 * do on user1 : click on a element
 * do on user2: double click on the same element
 * expected : alert showing the id of the first user                            //NOT IMPLEMENTED YET
 */

/*
 * double click on user2 :  on the same element
 * expected : prompt to change text
 * type :  a new text
 * expected : text has changed on every client
 */


/*
 * click : on a slide, on deleteElement button ("X")
 * expected : the element disaperas on each client                              //prompt to type a new title before deleting element
 */

/*
 * do : same testes with different slides                          
 * expected : see corresponding testes                                          ///DEAD : elements never appears, even after a refresh/reload
 *                                                                              ///works when restart Meteor
 *                                                                              ///elements are created in db and are displayed after a Meteor restart
 *                                                                              ///publication des Elements dans le getSlideshow n'est pas re-compute
 *                                                                              //la nouvelle slide n'est pas "prise en charge par le server" ce qui pose soucis pour
 *                                                                              //les publications (pour le moment, que celle des elements)  
 *                                                                              ///==> publish elements se base sur un tableau qui est désormais remplit dans le publish
 *                                                                              //un refresh/reload est efficace mais necessaire (pas top)
 *                                                                              // ====> SOLVED
 *                                                                                                                                                        
 */


/***********************
 * slideshow mode
 * switch between editor and different slideshow mode
 **********************/

/*
 * prerequisite : load a slideshow with some slides
 */

/*
 * from editor
 * click : load jmpress
 * expected : jmpress load and you can navigate with space bar and arrow keys
 */

/*
 * from editor
 * click : load deck
 * expected : deck load and you can navigate with space bar and arrow keys
 */

/*
 * from jmpress
 * click : load editor
 * expected : editor load and you can add slide
 */

/*
 * from deck
 * click : load editor
 * expected : editor load and you can add slide
 */

/*
 * do : previous test several time                                              //DEAD : jmpress load fine juste once
 *                                                                              //data are not injected in template after the first time
 *                                                                              
 */



/***********************
 * remote
 * follow any client who lauch a jmpress/deck (no rights)
 **********************/

/*
 * prerequisite : load same slideshow on two client
 */
 
/* do : launch jmpress slideshow on user1
 * do : navigate via space bar
 * expected : user2 (still in editor) see css change on slide according to slide active on user1
 */

/* do : user2 (in editor) create a slide then move it   
 * expected : user1 (in jmpress) see slide created and see moves                //DEAD
 *                                                                              //slides are duplicated
 *                                                                              //===> SOLVED
 */ 
 
/* 
 * prerequisite : user1 and user2 in jmpress mode       
 * do : user2  navigate throughout
 * expected : user1 (in jmp follow navigation of usr2)                          //DEAD
 *                                                                              //client doesn't receive order
 *                                                                              //====> SOLVED
 */

/* 
 * prerequisite : user1 in deck mode and user2 in jmpress mode              
 * do : user2  navigate throughout                                              
 * expected : user1 (in jmp follow navigation of usr2)                          //NOT WORKING
 *                                                                              //deck semble capturer les events, faut pas deconner ho !
 *                                                                              //comment faire pour se rendre independant des captures d'event de keyboard des technos ?
 */


/*************************
 * slideshow : edit/remove with lock
 * slide : delete
 ************************/