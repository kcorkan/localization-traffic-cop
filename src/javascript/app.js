Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    selectedStory: null,
    items: [
       {xtype:'container',itemId:'display_box'} 
        /*,
        {xtype:'tsinfolink'}
        */
    ],
    childOptions: null,
    storyModel: null,
    launch: function() {
        if (typeof(this.getAppId()) == 'undefined' ) {
            this.logger.log ('App is not running from within Rally.');
            this._showExternalSettingsDialog(this.getSettingsFields());
            this.logger.log('WORKSPACE',this.getContext().getWorkspace().Name);
            this.logger.log('PROJECT',this.getContext().getProject().Name);
            this.logger.log('USER', this.getContext().getUser().UserName);
        }  
        
    	Rally.data.ModelFactory.getModel({
    		type:'UserStory',
    		success: this._buildUserStoryGrid,
    		scope: this
    	});
    	
    	this.down('#display_box').add({
            xtype: 'rallybutton',
            text: 'Add',
            style: {margin: '5px'},
            scope: this,
            handler: this._addLocalization
        });
        
    },
    
    _buildUserStoryGrid: function(model){
    	
    	this.storyModel = model;
    	var storyGrid = Ext.create('Rally.ui.grid.Grid', 
    			{
    				model: model,
    				columnCfgs: ['FormattedID','Name','Owner','ScheduleState'],
    				storeConfig: {},
    				scope: this,
    				listeners: {
    					select: this._selectStory,
    					scope: this
    				}
    			});
    	this.down('#display_box').add(storyGrid);
 
    	
    },
    _selectStory: function(record, index){
    	
    	this.selectedStory = record.selected.items[0]; 
    	console.log(this.selectedStory);
    },
    _addLocalization: function(){
    	
    	var shop = Ext.create('LocalizationShop',{
    		origin: this.selectedStory,
    		model: this.storyModel,
    		logger: this.logger,
    		scope: this
    	});
    	shop.addLocalization();

    },
  
    /*
     * 
     * Settings related code below here 
     * 
     */
   //Overrides getSettingsFields in Rally.app.App
   getSettingsFields: function() {

       var _chooseOnlyCheckboxFields = function(field){
           var should_show_field = true;

           if ( field.hidden ) {
               should_show_field = false;
           }
           if ( field.attributeDefinition ) {
               var type = field.attributeDefinition.AttributeType;
               if ( type != "BOOLEAN"  ) {
                   should_show_field = false;
               }
           } else {
               should_show_field = false;
           }
           return should_show_field;
       };
       
       return [{
           name: 'needs_localization_flag',
           xtype: 'rallyfieldcombobox',
           model: 'HierarchicalRequirement',
           fieldLabel: 'Localization Needed Flag Field',
           labelWidth: 200,
           margin: 10,
           _isNotHidden: _chooseOnlyCheckboxFields,
           value: this.localization_flag,
           readyEvent: 'ready' //event fired to signify readiness
       }];
   },
   // ONLY FOR RUNNING EXTERNALLY
   _showExternalSettingsDialog: function(fields){
       var me = this;
       if ( this.settings_dialog ) { this.settings_dialog.destroy(); }
       this.settings_dialog = Ext.create('Rally.ui.dialog.Dialog', {
            autoShow: false,
            draggable: true,
            width: 400,
            title: 'Settings',
            scope: this,
            buttons: [{ 
               text: 'OK',

               handler: function(cmp){
                   var settings = {};
                   Ext.Array.each(fields,function(field){
                       me.logger.log(field.name, '=',cmp.up('rallydialog').down('[name="' + field.name + '"]').getValue() );
                       settings[field.name] = cmp.up('rallydialog').down('[name="' + field.name + '"]').getValue();
                       
                   });
                   me.settings = settings;
                   cmp.up('rallydialog').destroy();
               }
           }],
            items: [
               {xtype:'container',html: "&nbsp;", padding: 5, margin: 5},
               {xtype:'container',itemId:'field_box', padding: 5, margin: 5}]
        });
        Ext.Array.each(fields,function(field){
           me.logger.log('Add: ', field.name, field.value); 
           me.settings_dialog.down('#field_box').add(field);
        });
        this.settings_dialog.show();
    },
   /*
    * Override so that the settings box fits (shows the buttons)
    */
   showSettings: function(options) {      
       this._appSettings = Ext.create('Rally.technicalservices.AppSettings', Ext.apply({
           fields: this.getSettingsFields(),
           settings: this.getSettings(),
           defaultSettings: this.getDefaultSettings(),
           context: this.getContext(),
           settingsScope: this.settingsScope,
           autoScroll: true
       }, options));
       
       this._appSettings.on('cancel', this._hideSettings, this);
       this._appSettings.on('save', this._onSettingsSaved, this);

       this.hide();
       this.up().add(this._appSettings);

       return this._appSettings;
   }
});
