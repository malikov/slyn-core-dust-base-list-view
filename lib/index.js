"use strict";

/*
    Backbone views extend override for rendering dust templates
    This assumes that the dust-core was included in the index.html page
*/
var Backbone = require("backbone");
var q = require('q');
var _ = require("underscore");

var defaultTemplate = require("./template/default-template.dust");
var listItemTemplate = require("./template/list-item-template.dust");

module.exports = Backbone.View.extend({
    name: 'backboneDustCollectionView',
    initialize: function(options) {
        if (!options && (!options.el || !options.template))
            throw new Error("Backbone view " + this.name + ", instantiation failed");

        this.el = options.el;
        this.template = options.template || defaultTemplate;
        this.itemTemplate = options.itemTemplate || listItemTemplate;
        this.collection = (options.data) ? options.data : {};
        this.params = (options.params)? options.params: {};
        
        this.listWrapper = null;
        this.rendered = false;
        this.renderedItems = [];
        
        this.loadMoreBtnWrapper = $('<div>').addClass('btn-load-more__wrapper');
        this.loadMoreBtn = $('<button>')
                            .addClass('btn btn-load-more')
                            .attr('data-bind','click:loadMore')
                            .html('Load More');
        
        this.loadMoreBtnWrapper.append(this.loadMoreBtn);

        _.bindAll(this, 'render', 'preRender', 'postRender', 'renderItems', 'appendItem');
    },
    appendItem: function(itemDom){
        if(this.listWrapper !== null){
            Backbone.$(this.listWrapper).append(itemDom);
            this.renderedItems.push(itemDom);
        }else{
            throw new Error("Backbone view " + this.name + " doesnt have a placeholder for its items");
        }
    },
    renderItems : function(items){
            // now render the items in the list
            _.each(items, function(value){
                dust.loadSource(this.itemTemplate);
                dust.render(this.itemTemplate.templateName, value, function(err, out) {
                    this.appendItem(out);
                }.bind(this));
            }.bind(this));
    },
    render: function(options) {
        console.log('rendering ' + this.name + ' view');

        var deferred = q.defer();
        var opt = Backbone.$.extend({
            data: {
                total: this.collection.total,
                items: this.collection.toJSON()
            }
        }, options);

        if(this.rendered){
            setTimeout(function() {
                this.renderItems(opt.data.items);
                deferred.resolve(this);
            }.bind(this), 0);
        }else{
            setTimeout(function() {
                dust.loadSource(this.template);
                dust.render(this.template.templateName, opt.data, function(err, out) {
                    this.$el.html(out);
                    this.listWrapper = this.$el.find('[ui-view="content"]');
                    
                    if(opt.infinite && this.collection.total > this.collection.c){
                        this.$el.append(this.loadMoreBtnWrapper);
                    }
                }.bind(this));
    
                this.renderItems(opt.data.items);
                
                this.rendered = true;
                deferred.resolve(this);
            }.bind(this), 0);
        }

        return deferred.promise;
    },
    preRender: function(options){
        console.log('preRendering function called for ' + this.name + ' view');

        var deferred = q.defer();
        
        setTimeout(function() {
            deferred.resolve(this);
        }.bind(this), 0);

        return deferred.promise;
    },
    postRender: function(options){
        console.log('postRendering function called for ' + this.name + ' view');

        var deferred = q.defer();
        
        setTimeout(function() {
            deferred.resolve(this);
        }.bind(this), 0);

        return deferred.promise;
    },
    loadMore: function(isLoading){
        if(isLoading){
            this.loadMoreBtn.addClass('loading');
            this.loadMoreBtn.html('Loading...');
            this.collection.i++;
        }else{
            this.loadMoreBtn.removeClass('loading');
            this.loadMoreBtn.html('Load More');
            
            if(this.renderedItems.length === this.collection.total){
                this.loadMoreBtn.remove();
            }
        }
    },
    reset: function(){
        this.collection.i = 0;
        this.collection.total = 0;
        this.collection.reset();
    }
});
