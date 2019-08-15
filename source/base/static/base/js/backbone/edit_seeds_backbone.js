(function(exports){

  var EditSeedsView = Backbone.View.extend({
    el: "#seeds",
    form: "#editSeedsForm",
    invalidLines: [],
    template: _.template($("#editSeedsTemplate").html()),
    initialize: function(model){
      this.model = model;
      var that = this;
      this.model.set({id: $("#seeds_pk").val()}).fetch({
        success: function(){
          that.render();
          that.setEditor();
        }
      });
    },
    render: function(){
      this.$el.append(this.template(this.model.toJSON()));
    },
    setEditor: function(){
      this.editor = CodeMirror.fromTextArea(document.getElementById("id_seeds"), {
        lineNumbers: true
      });
      this.editor.setSize("100%", 1000);
      this.loadSeeds();
    },
    editSeeds: function(event){
      var that = this;
      event.preventDefault();
      var save = confirm("Save this seeds list?");
      if(save == true){
        var newSeeds = JSON.stringify($("#id_seeds").val().replace("\r", "").split("\n"))
        this.model.set("seeds", newSeeds);
        this.model.save({}, {
          beforeSend: function(){
            that.clearErrors();
            $("#seedsSuccess").hide();
            $("#seedsFailure").hide();
          },
          success: function(response){
            $("#seedsSuccess").show();
          },
          error: function(model, xhr, thrownError){
            that.showLineErrors(xhr.responseJSON);
          },
        });
      }
    },
    showLineErrors: function(errors){
      this.errors = errors["seeds"];
      var that = this;
      _.each(this.errors, function(seed){
        // Skip the initial error message.
        if((that.errors.indexOf(seed) == 0) || (that.errors.indexOf(seed) == that.errors.length - 1)){
          return;
        }
        line = that.editor.getLineHandle(Object.keys(seed));
        that.invalidLines.push(line);
        that.editor.doc.addLineClass(line, 'background', 'line-error');
      });
      $("#seedsFailure").show()
    },
    clearErrors: function(){
      var that = this;
      _.each(this.invalidLines, function(line){
        that.editor.doc.removeLineClass(line, 'background', 'line-error');
      });
      this.invalidLines = []
    },
    loadSeeds: function(){
      this.editor.setValue(this.model.toJSON().file_string);
    },
    events: {
      "submit #editSeedsForm": "editSeeds",
      "click #reset": "loadSeeds",
    },
  });


  var EditSeedsRouter = Backbone.Router.extend({
    routes: {
      "": "index",
    },
    index: function(){
      var seedsList = new Seeds.Seeds();
      var seedsView = new EditSeedsView(seedsList);
    },
  });

  $(document).ready(function(){
    var appRouter = new EditSeedsRouter();
    Backbone.history.start();
  });

})(this.EditSeeds = {});
