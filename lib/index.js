"use strict";

/*
    Backbone views extend override for rendering dust templates
    This assumes that the dust-core was included in the index.html page
*/
var Backbone = require("backbone");
var q = require('q');
var _ = require("underscore");

module.exports = Backbone.View.extend({
    name: 'backboneDustCollectionView',
    initialize: function(options) {
        if (!options && (!options.el || !options.template))
            throw new Error("Backbone view " + this.name + ", instantiation failed");

        this.el = options.el;
        this.template = options.template;
        this.itemTemplate = options.itemTemplate;
        this.collection = (options.data) ? options.data : {};
        this.params = (options.params)? options.params: {};
        
        this.listWrapper = null;

        _.bindAll(this, 'render');
    },
    appendItem: function(itemDom){
        if(this.listWrapper !== null){
            Backbone.$(this.listWrapper).append(itemDom);
        }else{
            throw new Error("Backbone view " + this.name + " doesnt have a placeholder for its items");
        }
    },
    render: function(options) {
        console.log('rendering ' + this.name + ' view');

        var deferred = q.defer();
        var opt = $.extend({
            data: {
                total: this.collection.total,
                items: this.collection.toJSON()
            }
        }, options);


        setTimeout(function() {
            dust.loadSource(this.template);
            dust.render(this.template.templateName, opt.data, function(err, out) {
                this.$el.html(out);
                this.listWrapper = this.$el.find('[ui-view="content"]');
            }.bind(this));

            // now render the items in the list
            _.each(opt.data.items, function(value){
                dust.loadSource(this.itemTemplate);
                dust.render(this.itemTemplate.templateName, value, function(err, out) {
                    this.appendItem(out);
                }.bind(this));
            }.bind(this))

            deferred.resolve(this);
        }.bind(this), 0);

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
    }
});
