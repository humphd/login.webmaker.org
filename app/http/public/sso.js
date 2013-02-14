if (window.location.host != 'login.webmaker.org'){
  function debug(s){
    console.log(s);
  }
}
else { 
  function debug(){}
}
navigator.personaSSO = {
  id: {
    watch: function(opts){
      navigator.personaSSO.loggedInUser = opts.loggedInUser;
      navigator.personaSSO.handlers.onlogin = opts.onlogin;
      navigator.personaSSO.handlers.onlogout = opts.onlogout;
    }
  },
  handlers: {},
  init: function(element, onready){
    // TODO: configure the login.webmaker.org url:
    element.src = "http://localhost:3000/signin?" + encodeURIComponent(window.location.protocol + "//" + window.location.host);

    var handlers = {
      "onready": onready,
      "onlogout": function(){
        navigator.personaSSO.id.loggedInUser = null;
        navigator.personaSSO.id.handlers.onlogout();
      },
      "onlogin": function(data){
        navigator.personaSSO.id.loggedInUser = data.loggedInUser
        navigator.personaSSO.id.handlers.onlogin(data.assertion);
      }
    }

    // Create IE + others compatible event handler
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

    // Listen to message from child window
    eventer(messageEvent, function(e){
      debug(e.data);
      try {

        var e = JSON.parse(e.data);
        
        try {
          var handle = navigator.personaSSO.handlers[e.topic];
          
          if (typeof(handle) == 'function'){
            handle(e.topic, e.message);
          }
        }
        catch(e){
          console.log("Error in handler.");
          console.log(e.message);
        }
      } 
      catch(e){
        console.log("Error parsing event: " + event.data);
      }
    }, false);

  }
}
