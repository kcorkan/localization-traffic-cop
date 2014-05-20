Ext.define('LocalizationShop',{
	config: {
		origin: null,
		model: null,
		logger: null
	},
	ui: null,
	treeStore: null,
	constructor: function(config){

		this.initConfig(config);
		
		this.treeStore = Ext.create('Ext.data.TreeStore',{
			root: {
				expanded: true,
				children: [
				           {text: "North America", 
				        	   expanded: true,
				        	   children: [
                                          {text:'English', leaf:true, checked: true},
                                          {text:'German', leaf: true, checked: false},
                                          {text:'French', leaf: true, checked: false}
                                          ]},
				            {text: "Europe", 
                               expanded: true,
                               children: [
                                        {text:'English', leaf:true, checked:false},
                                        {text:'German', leaf:true, checked:false},
                                        {text: 'French', leaf: true, checked:false}
                                        ]},
				            {text: "Asia", 
                              expanded: true,  
                              children: [
                                      {text:'English',leaf:true, checked:false},
                                      {text:'Japanese',leaf:true, checked:false},
                                      {text:'Chinese',leaf:true, checked:false}
                                      ]}
				]
			}
		});
		
		
		this.ui = Ext.create('Rally.ui.dialog.Dialog',{
			width: 300,
			title: 'Select Localization Options',
			modal: true,
			items: 
			[
			  {
				xtype: 'treepanel',
				store: this.treeStore
			  },
			  {
				  xtype: 'rallybutton',
				  text: 'OK',
				  scope: this,
				  margin: 10,
				  handler: this._ok
			  },
			  {
				  xtype: 'rallybutton',
				  text: 'Cancel',
				  scope: this,
				  margin: 10,
				  handler: this._cancel
					 
			  }
			  
			]
		});

	},	
	_ok: function(){
	  	this.ui.destroy();
	  	this._createStories(this.options);
	},
	_cancel: function(){
		this.ui.destroy();
	},
	addLocalization: function(){
		this.ui.show();
	},
    _createStories: function(){
    	var me = this; 

    	//First, create the new EPIC if we have at least one checked
    	if (this._getLocalizationOptionCount() == 0){
    		alert("No Localization options selected so no new stories were created.");
    		return;
    	}
    	var parentRef = this.origin.get('Parent');
    	var parentDesc = 'Epic for ' + this.origin.get('Description');
    	var parentName = 'Epic: ' + this.origin.get('Name');
    	
    	
    	
    	
    	this._createStory(parentName, parentDesc, parentRef).then(
    	{
    		scope: this,
    		success: function(result){
    			parentRef = result.get('_ref');
    			var parentFid = result.get('FormattedID');
    			var promises = [];
    	    	var root = this.treeStore.getRootNode();
    	    	root.eachChild(
    	    		function(node){
		    			var region = node.data.text;
		    			node.eachChild(
							function(childNode){
								if (childNode.data.checked){
									var language = childNode.data.text;
				        			me.logger.log('Add story for Region: ' + region + ' and language: ' + language);
									var desc = parentFid + ': Localization for ' + region + ': ' + language;
				        			promises.push(function() {return me._createStory(desc, desc, parentRef);});
								}
									
							});
		    		});
    	    	
    	    	//Now update the original story's parent...
    	    	promises.push(function() {
    	    		me.origin.set('Parent',parentRef);
    	    		return me._updateStory(me.origin);
    	    	});
    	    	
    	    	Deft.Chain.sequence(promises).then({
    	    		success: function(records){
    	    			me.logger.log ('Success');
    	    		},
    	    		failure: function(error){
    	    			me.logger.log('Failure');
    	    			me.logger.log(error);
    	    		}
    	    	});
    	    	
    	    	//Now we need to wire up the children to the parent.  
    	    	
    			
    		},
    		failure: function(error){
    			this.logger.log('Error creating epic story');
    			this.logger.log(error);
    		}
    	});
    	

    },

    _createStory: function(name, desc, parentRef){
    	var deferred = Ext.create('Deft.Deferred');
    	
    	var rec = Ext.create(this.model,{
    		Name: name
    	});
    	rec.set('Description','description');
    	rec.set('Parent',parentRef);
    	rec.save({
    		scope: this,
    		callback: function(result, operation){
    			if (operation.wasSuccessful()){
    				deferred.resolve(result);
        			this.logger.log('story saved' + name);
    			} else {
                	this.logger.log('error in _createStory' + name );
                	this.logger.log(operation.getError());
    				deferred.reject(operation.getError());
    			}
    		}
    	});
    	return deferred.promise;  
    },
    _updateStory: function(story){
    	var deferred = Ext.create('Deft.Deferred');
    	story.save({
    		scope: this,
    		callback: function(result, operation){
    			if (operation.wasSuccessful()){
    				deferred.resolve(result);
        			this.logger.log('Story Saved.');
    			} else {
                	this.logger.log('error in _updateStory');
                	this.logger.log(operation.getError());
    				deferred.reject(operation.getError());
    			}
    		}
    	});
    	return deferred.promise; 
    },
    _getLocalizationOptionCount: function(){
    	var count = 0;
    	var root = this.treeStore.getRootNode();
    	root.eachChild(
    		function(node){
    			node.eachChild(
    					function(childNode){
    						if (childNode.data.checked){
    							count++;
    						}
    					});
    		});
    	return count;

    }
});