(function(exports){

  var ProjectRouter = Backbone.Router.extend({
    routes: {
      "": "index",
    },
    index: function(){
      var project = $("#project_id").val();
      var modelCollection = new CrawlModels.CrawlModelCollection();
      var crawlCollection = new Crawls.CrawlCollection();
      var seedsCollection = new Seeds.SeedsCollection();
      crawlCollection.fetch({
        url: crawlCollection.url += "?project=" + project,
        success: function(){
          var crawlCollectionView = new Crawls.CrawlCollectionView(crawlCollection);
          var crawlFormView = new Crawls.AddCrawlView(crawlCollection, crawlCollectionView);
        },
        complete: function(){
          modelCollection.fetch({
            url: modelCollection.url += "?project=" + project,
            success: function(){
              var modelCollectionView = new CrawlModels.CrawlModelCollectionView(modelCollection);
              var addModelView = new CrawlModels.AddCrawlModelView(modelCollection, modelCollectionView);
            },
          });
          seedsCollection.fetch({
            url: seedsCollection.url,
            success: function(){
              var addModelView = new AddSeeds.AddSeedsProjectPage(seedsCollection);
            },
          });
        },
      });
    },
  });


  $(document).ready(function(){
    var appRouter = new ProjectRouter();
    Backbone.history.start();
  });

})(this.projectRouter = {});
