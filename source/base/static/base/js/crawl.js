$( document ).ready(function() {

  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) == (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  var csrftoken = getCookie('csrftoken');


  function onOff(element, state){
    $("#" + element).attr("disabled", state);
  }

  function onOffGroup(elementArray, itemsObject, state){
    for(var i=0; i<elementArray.length; i++){
      onOff(itemsObject[elementArray[i]], state);
    }
  }

  function onOffStatus(status){
    try{
      onOffGroup(statuses.states[status]["disabled"], statuses.buttons, true);
      onOffGroup(statuses.states[status]["enabled"], statuses.buttons, false);
    }catch(err){
      console.log("ERROR: Crawl dashboard failed to regcognize status \"" + status + "\"");
    }
  }

  function statusCall(){
    return $.ajax({
      type: "POST",
      data: {"action": "status"},
      success: function(response){
        $( '#status' ).text(response.status);
        onOffStatus(response.status);
        $( '#roundsLeft' ).text(response.rounds_left);
        $( '#stats-pages' ).text(response.pages_crawled);
        if ('harvest_rate' in response) {
          $( '#stats-harvest' ).text(response.harvest_rate);
          if (response.harvest_rate > 0) {
            $('#getSeeds').attr("disabled", false);
          }
        }
        onOffStatus(response.status);
      }
    });
  }

  statusCall();

  setInterval(function(){
    statusCall();
  }, 5000);

  $( document ).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
  });

  $("#dumpImages").attr("disabled", true);

  $('#common-crawl-dump').on('click', function() {
     $( '#status' ).text( "DUMPING" );
     this.disabled = true;
     $('#playButton').attr("disabled", true);
     $('#stopButton').attr("disabled", true);
     $('#common-crawl-dump').attr("disabled", false);

    $("#nutchButtons").append('<i id="imageSpinner" class="fa fa-refresh fa-spin" style="font-size:20;"></i>')
    $.ajax({
        type: "POST",
        data: {"action": "ccadump"},
        success: function(response) {
          sweetAlert("Success", "Crawled data has been successfully dumped in CCA format!", "success");
          $("#imageSpinner").remove()
          $('#playButton').attr("disabled", false);
        },
        failure: function() {
          sweetAlert("Error", "Dump in CCA format has failed.", "error");
          $("#imageSpinner").remove()
        }
      });
  });


  $('#playButton').on('click', function() {

    $( '#status' ).text( "STARTING" );
    onOffStatus("STARTING");
    this.disabled = true;
    $('#stopButton').attr("disabled", false);
    $('#rounds').attr("disabled", true);

    val = $("#rounds")? $("#rounds").val() : 0,

    $.ajax({
      type: "POST",
      data: {
        "action": "start",
        "rounds": val,
      },
      success: function(response) {
        $( '#status' ).text(response.status);
        onOffStatus(response.status);
      },
      failure: function() {
        $( '#status' ).text( "Error (could not start crawl)" );
      }
    });
  });


  $('#stopButton').on('click', function() {

    $( '#status' ).text( "STOPPING" );
    onOffStatus("STOPPING");
    this.disabled = true;

    $.ajax({
      type: "POST",
      data: {
        "action": "stop",
      },
      success: function(response) {
        $( '#status' ).text(response.status);
        onOffStatus(response.status);
      },
      failure: function() {
        $( '#status' ).text( "Error (could not stop crawl)" );
      }
    });
  });

  $('#restartButton').on('click', function() {

    $( '#status' ).text( "RESTARTING" );
    onOffStatus("RESTARTING");
    this.disabled = true;

    val = $("#rounds")? $("#rounds").val() : 0,

    $.ajax({
      type: "POST",
      data: {
        "action": "start",
        "rounds": val,
      },
      success: function(response) {
        $( '#status' ).text(response.status);
        onOffStatus(response.status);
      },
      failure: function() {
        $( '#status' ).text( "Error (could not restart crawl)" );
      }
    });
  });

  $("#dumpImages").on('click', function(){
    $("#nutchButtons").append('<i id="imageSpinner" class="fa fa-refresh fa-spin" style="font-size:20;"></i>')
    $.ajax({
      type: "POST",
      data: {"action": "dump"},
      success: function(response) {
        sweetAlert("Success", "Images have been successfully dumped!", "success");
        $("#imageSpinner").remove()
      },
      failure: function() {
        sweetAlert("Error", "Image dump has failed.", "error");
        $("#imageSpinner").remove()
      }
    });
  });

});
