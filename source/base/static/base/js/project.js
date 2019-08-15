$(document).ready(function(){
(function(){

  function updateStatus(itemsObject){
    statuses = Object.keys(itemsObject);
    for(var i=0; i<statuses.length; i++){
      $("#" + statuses[i]).text(itemsObject[statuses[i]])
    }
  }

  function getStatus(){
    return $.ajax({
      type: "POST",
      data: {"action": "index_status"},
      success: function(response){
        updateStatus(response.statuses);
      },
      failure: function(response){
        return "Failure";
      }
    });
  }

  getStatus();

  setInterval(function(){
    getStatus();
  }, 7000);

})();
});
