expoditorV0
===========

first try of expoditor's server core with Meteor.js 


Existing functionnalities 
===========
* Slideshow : create/load/delete
* Slide : create/rename/move (2D)/delete
* Element texte : create/edit content with concurent access/move (2D)/delete
* Launch : jmpress or deck (but CSS sucks)

All these take benefits of Meteor super power live updating. 


Big next functionnalities 
===========
* Global improvement of UI with famo.us (https://famo.us)
* Shapes
* Operationnal Transform with probably Share.js (http://sharejs.org/)
* Intagration with expo remote (https://github.com/ExpoTeam/expo)



Installation 
===========

The project uses Google Closure in many parts. Closure files are not served by the Meteor server side, you will need a way to serve static file like. I use Google Drive (https://support.google.com/drive/answer/2881970?hl=fr) or Dropbox via site44 (http://www.site44.com/) in production and a very simple Nodejs in development. Here is the way with Nodejs :

* First install Nodejs (<code> apt get-install </code>)
* Create the Jsfile found at https://github.com/remipichon/expoditor/docs/serveFile.js
* Note hostname and port var which are needed by the Meteor part
* Run with <code> node serverFile.js </code>


The main part of the editor is (currently) run with Meteor. You need to install it (https://www.meteor.com), here are the steps :
* <code> $ curl https://install.meteor.com | sh </code>
* in a directory you love :
* <code> $ meteor create expoditor </code>
* clone the repo : https://github.com/remipichon/expoditor.git into the newly created folder (expoditor)
* install the package for user authenfication :
* <code> $ meteor add accounts-base </code>
* <code> $ meteor add accounts-ui </code>
* if needed, change the src for the Google Closure script base.js and all the href for the Google Closure directly in file expoditor/learning_editor.html for the hostname and port you set in serveFile.js
* run with : <code> $ meteor </code>

The editor will be deployed on your localhost port 3000, you need to be connected to start using the editor, you can create a user to do so. 

 

Common issues
===========

<code> MongoDB exit with code 100 </code>
Meteor didn't exit properly and the lock file of MongoDB still exists. Remove it with
<code> rm .meteor/local/db/mongod.lock </code>
