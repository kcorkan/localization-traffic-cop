
    /**
     * @private
     * Gear menu shown by default on rows of Rally.ui.grid.Grids and Rally.ui.cardboard.Cards of boards.
     */
    /**
     * @private
     * A menu item for doing actions to a record
     */
    Ext.define('Rally.ui.menu.item.AddLocalization', {
        extend: 'Ext.menu.Item',
        alias: 'widget.rallyrecordmenuitemlocalization',

        config: {

            /**
             * @cfg {Rally.domain.WsapiModel}
             * The record of the menu
             */
            record: undefined,

            /**
             * @cfg {Function}
             * This is called when a menu item is clicked
             */
            handler: function () {
              	console.log (this.record);
              	console.log (this.app);
            	var shop = Ext.create('LocalizationShop',{
            		parent: this.record,
            		model: this.storyModel,
            		logger: this.logger,
            		scope: this
            	});
            	shop.addLocalization();

            },

            /**
             * @cfg {Function}
             *
             * A function that should return true if this menu item should show.
             * @param record {Rally.domain.WsapiModel}
             * @return {Boolean}
             */
            predicate: function (record) {
                return true;
            },

            /**
             * @cfg {String}
             * The display string
             */
            text: 'Add Localization...'

        },
        constructor:function (config) {
            this.initConfig(config);
            this.callParent(arguments);
        }

    });
    
    
    Ext.override(Rally.ui.menu.DefaultRecordMenu, {
        _getMenuItems: function() {
            var record = this.getRecord();
            var items = [
                 {
                     xtype: 'rallyrecordmenuitemlocalization',
                     record: record,
                     beforeAction: alert('woo hoo'),
                     actionScope: this
                 },
                {
                    xtype: 'rallyrecordmenuitemedit',
                    record: record,
                    beforeAction: this.getOnBeforeRecordMenuEdit(),
                    actionScope: this
                },
                {
                    xtype: 'rallyrecordmenuitemcopy',
                    record: record,
                    beforeAction: this.getOnBeforeRecordMenuCopy(),
                    afterAction: this.getOnRecordMenuCopy(),
                    actionScope: this
                }
            ];
            if (this.showAddTasks !== false) {
                items.push({
                    xtype: 'rallyrecordmenuitemaddtask',
                    record: record
                });
            }

            items.push(
                {
                    xtype: 'rallyrecordmenuitemaddchild',
                    record: record
                },
                {
                    xtype: 'menuseparator'
                },
                {
                    xtype: 'rallyrecordmenuitemrankextreme',
                    rankRecordFinder: this.getRankRecordFinder(),
                    rankPosition: 'highest',
                    record: record,
                    beforeAction: this.getOnBeforeRecordMenuRankHighest(),
                    actionScope: this
                },
                {
                    xtype: 'rallyrecordmenuitemrankextreme',
                    rankRecordFinder: this.getRankRecordFinder(),
                    rankPosition: 'lowest',
                    record: record,
                    beforeAction: this.getOnBeforeRecordMenuRankLowest(),
                    actionScope: this
                },
                {
                    xtype: 'menuseparator'
                },
                {
                    xtype: 'rallyrecordmenuitemsplit',
                    record: record
                },
                {
                    xtype: 'menuseparator'
                },
                {
                    xtype: 'rallyrecordmenuitemdelete',
                    record: record,
                    beforeAction: this.getOnBeforeRecordMenuDelete(),
                    afterAction: this.getOnRecordMenuDelete(),
                    actionScope: this
                }
            );
            return items;
        }
    });

