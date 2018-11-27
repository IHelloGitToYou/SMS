/**
 * This feature allows to display the grid rows aggregated into groups as specified by the {@link Ext.data.Store#groupers}
 * specified on the Store. The group will show the title for the group name and then the appropriate records for the group
 * underneath. The groups can also be expanded and collapsed.
 * 
 * ## Extra Events
 * This feature adds several extra events that will be fired on the grid to interact with the groups:
 *
 *  - {@link #groupclick}
 *  - {@link #groupdblclick}
 *  - {@link #groupcontextmenu}
 *  - {@link #groupexpand}
 *  - {@link #groupcollapse}
 * 
 * ## Menu Augmentation
 *
 * This feature adds extra options to the grid column menu to provide the user with functionality to modify the grouping.
 * This can be disabled by setting the {@link #enableGroupingMenu} option. The option to disallow grouping from being turned off
 * by the user is {@link #enableNoGroups}.
 * 
 * ## Controlling Group Text
 *
 * The {@link #groupHeaderTpl} is used to control the rendered title for each group. It can modified to customized
 * the default display.
 * 
 * ## Example Usage
 * 
 *     @example
 *     var store = Ext.create('Ext.data.Store', {
 *         storeId:'employeeStore',
 *         fields:['name', 'seniority', 'department'],
 *         groupField: 'department',
 *         data: {'employees':[
 *             { "name": "Michael Scott",  "seniority": 7, "department": "Management" },
 *             { "name": "Dwight Schrute", "seniority": 2, "department": "Sales" },
 *             { "name": "Jim Halpert",    "seniority": 3, "department": "Sales" },
 *             { "name": "Kevin Malone",   "seniority": 4, "department": "Accounting" },
 *             { "name": "Angela Martin",  "seniority": 5, "department": "Accounting" }
 *         ]},
 *         proxy: {
 *             type: 'memory',
 *             reader: {
 *                 type: 'json',
 *                 root: 'employees'
 *             }
 *         }
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         title: 'Employees',
 *         store: Ext.data.StoreManager.lookup('employeeStore'),
 *         columns: [
 *             { text: 'Name',     dataIndex: 'name' },
 *             { text: 'Seniority', dataIndex: 'seniority' }
 *         ],
 *         features: [{ftype:'grouping'}],
 *         width: 200,
 *         height: 275,
 *         renderTo: Ext.getBody()
 *     });
 * 
 * **Note:** To use grouping with a grid that has {@link Ext.grid.column.Column#locked locked columns}, you need to supply
 * the grouping feature as a config object - so the grid can create two instances of the grouping feature.
 *
 * @author Nicolas Ferrero
 */
Ext.define('Ext.ux.grid.feature.MultiGrouping', {
	extend: 'Ext.grid.feature.Feature',
	alias: 'feature.multigrouping',

	eventPrefix: 'group',
	eventSelector: '.' + Ext.baseCSSPrefix + 'grid-group-hd',
	bodySelector: '.' + Ext.baseCSSPrefix + 'grid-group-body',

	// @private
	groupDepthPrefix: 'group-depth-',
	// @private
	groupDepthRe: /.*(group-depth-\d).*/,

	constructor: function() {
		var me = this;

		me.collapsedState = {};
		me.nameIDNode = {};
		me.callParent(arguments);
	},

	/**
	 * @event groupclick
	 * @param {Ext.view.Table} view
	 * @param {HTMLElement} node
	 * @param {String} group The name of the group
	 * @param {Ext.EventObject} e
	 */

	/**
	 * @event groupdblclick
	 * @param {Ext.view.Table} view
	 * @param {HTMLElement} node
	 * @param {String} group The name of the group
	 * @param {Ext.EventObject} e
	 */

	/**
	 * @event groupcontextmenu
	 * @param {Ext.view.Table} view
	 * @param {HTMLElement} node
	 * @param {String} group The name of the group
	 * @param {Ext.EventObject} e
	 */

	/**
	 * @event groupcollapse
	 * @param {Ext.view.Table} view
	 * @param {HTMLElement} node
	 * @param {String} group The name of the group
	 */

	/**
	 * @event groupexpand
	 * @param {Ext.view.Table} view
	 * @param {HTMLElement} node
	 * @param {String} group The name of the group
	 */

	/**
	 * @cfg {String/Array/Ext.Template} groupHeaderTpl
	 * A string Template snippet, an array of strings (optionally followed by an object containing Template methods) to be used to construct a Template, or a Template instance.
	 * 
	 * - Example 1 (Template snippet):
	 * 
	 *       groupHeaderTpl: 'Group: {name}'
	 * 
	 * - Example 2 (Array):
	 * 
	 *       groupHeaderTpl: [
	 *           'Group: ',
	 *           '<div>{name:this.formatName}</div>',
	 *           {
	 *               formatName: function(name) {
	 *                   return Ext.String.trim(name);
	 *               }
	 *           }
	 *       ]
	 *     
	 * - Example 3 (Template Instance):
	 * 
	 *       groupHeaderTpl: Ext.create('Ext.XTemplate',
	 *           'Group: ',
	 *           '<div>{name:this.formatName}</div>',
	 *           {
	 *               formatName: function(name) {
	 *                   return Ext.String.trim(name);
	 *               }
	 *           }
	 *       )
	 *
	 * @cfg {String} groupHeaderTpl.groupField The field name being grouped by.
	 * @cfg {String} groupHeaderTpl.columnName The column header associated with the field being grouped by *if there is a column for the field*, falls back to the groupField name.
	 * @cfg {Mixed} groupHeaderTpl.groupValue The value of the {@link Ext.data.Store#groupField groupField} for the group header being rendered.
	 * @cfg {String} groupHeaderTpl.renderedGroupValue The rendered value of the {@link Ext.data.Store#groupField groupField} for the group header being rendered, as produced by the column renderer.
	 * @cfg {String} groupHeaderTpl.name An alias for renderedGroupValue
	 * @cfg {Object[]} groupHeaderTpl.rows An array of child row data objects as returned by the View's {@link Ext.view.AbstractView#prepareData prepareData} method.
	 * @cfg {Ext.data.Model[]} groupHeaderTpl.children An array containing the child records for the group being rendered.
	 */
	groupHeaderTpl: '{columnName}: {name}',

	/**
     * @cfg {Number} [depthToIndent=17]
	 * Number of pixels to indent per grouping level
	 */
	depthToIndent: 17,

	collapsedCls: Ext.baseCSSPrefix + 'grid-group-collapsed',
	hdCollapsedCls: Ext.baseCSSPrefix + 'grid-group-hd-collapsed',
	hdCollapsibleCls: Ext.baseCSSPrefix + 'grid-group-hd-collapsible',

	/**
	 * @cfg {String} [groupByText="Group by this field"]
	 * Text displayed in the grid header menu for grouping by header.
	 */
	groupByText : 'Group by this field',
	/**
	 * @cfg {String} [showGroupsText="Show in groups"]
	 * Text displayed in the grid header for enabling/disabling grouping.
	 */
	showGroupsText : 'Show in groups',

	/**
	 * @cfg {Boolean} [hideGroupedHeader=false]
	 * True to hide the header that is currently grouped.
	 */
	hideGroupedHeader : false,

	/**
	 * @cfg {Boolean} [startCollapsed=false]
	 * True to start all groups collapsed.
	 */
	startCollapsed : false,

	/**
	 * @cfg {Boolean} [enableGroupingMenu=true]
	 * True to enable the grouping control in the header menu.
	 */
	enableGroupingMenu : true,

	/**
	 * @cfg {Boolean} [enableNoGroups=true]
	 * True  to allow the user to turn off grouping.
	 */
	enableNoGroups : true,

	/**
	 * @cfg {Boolean} [collapsible=true]
	 * Set to `falsee` to disable collapsing groups from the UI.
	 * 
	 * This is set to `false` when the associated {@link Ext.data.Store store} is 
	 * {@link Ext.data.Store#buffered buffered}.
	 */
	collapsible: true,
	

	enable: function() {
		var me	= this,
			view  = me.view,
			store = view.store,
			groupToggleMenuItem;

		me.lastGroupField = me.getGroupField();

		if (me.lastGroupIndex) {
			me.block();
			store.group(me.lastGroupIndex);
			me.unblock();
		}
		me.callParent();
		groupToggleMenuItem = me.view.headerCt.getMenu().down('#groupToggleMenuItem');
		groupToggleMenuItem.setChecked(true, true);
		me.refreshIf();
		view.fireEvent('enablegrouping');
	},

	disable: function() {
		var me	= this,
			view  = me.view,
			store = view.store,
			remote = store.remoteGroup,
			groupToggleMenuItem,
			lastGroup;

		lastGroup = store.groupers.first();
		if (lastGroup) {
//			me.lastGroupIndex = lastGroup.property;
			me.block();
			store.clearGrouping();
			me.unblock();
		}

		me.callParent();
		groupToggleMenuItem = me.view.headerCt.getMenu().down('#groupToggleMenuItem');
		groupToggleMenuItem.setChecked(true, true);
		groupToggleMenuItem.setChecked(false, true);
		me.refreshIf();
		view.fireEvent('disablegrouping');
	},

	refreshIf: function() {
		var ownerCt = this.view.ownerCt,
			view = this.view;

		if (!view.store.remoteGroup && !this.blockRefresh) {
			// We are one side of a lockable grid, so refresh the locking view
			if (ownerCt && ownerCt.lockable) {
				ownerCt.view.refresh();
			} else {
				view.refresh();
			}
		}
	},

	getFeatureTpl: function(values, parent, x, xcount) {
		var me = this;
		return [
			'<tpl if="typeof rows !== \'undefined\'">',
				// group row tpl
				"<tr id='{groupHeaderId}' class='" + Ext.baseCSSPrefix + "grid-group-hd {hdCollapsedCls} {collapsibleClass} " + me.groupDepthPrefix + "{depth}'>" + me.getGroupHeaderColumns(parent) + "</tr>",
				// this is the rowbody   --   {%this.recursive = true%}
				"<tr id='{groupBodyId}' class='" + Ext.baseCSSPrefix + "grid-group-body {collapsedCls} " + me.groupDepthPrefix + "{depth}'><td colspan='" + parent.columns.length + "'><tpl if='rows.length &gt; 0'>{[this.recurse(values)]}</tpl></td></tr>",  
			'</tpl>'
		].join('');
	},

	getFragmentTpl: function() {
		var me = this;
		return {
			indentByDepth: me.indentByDepth,
			depthToIndent: me.depthToIndent,
			renderGroupHeaderTpl: function(values, parent) {
				var z = new Ext.XTemplate('{name} ({rows.grouplength})');
				return z.apply(values, parent);
			}
		};
	},

	getGroupHeaderColumns: function(parent) {
		return '<td class="' + Ext.baseCSSPrefix + 'grid-cell" colspan="' + parent.columns.length + '" {[this.indentByDepth(values)]}><div class="' + Ext.baseCSSPrefix + 'grid-cell-inner"><div class="' + Ext.baseCSSPrefix + 'grid-group-title">{collapsed}{[this.renderGroupHeaderTpl(values)]}</div></div></td>';
	},

	indentByDepth: function(values) {
		return 'style="padding-left:'+ ((values.depth || 0) * this.depthToIndent) + 'px;"';
	},

	// Containers holding these components are responsible for
	// destroying them, we are just deleting references.
	destroy: function() {
		delete this.view;
		delete this.prunedHeader;
	},

	// perhaps rename to afterViewRender
	attachEvents: function() {
		var me = this,
			view = me.view;

		view.on({
			scope: me,
			groupclick: me.onGroupClick,
			rowfocus: me.onRowFocus
		});

		view.mon(view.store, {
			scope: me,
			groupchange: me.onGroupChange,
			remove: me.onRemove,
			add: me.onAdd,
			update: me.onUpdate
		});

		if (me.enableGroupingMenu) {
			me.injectGroupingMenu();
		}

		me.pruneGroupedHeader();

		me.lastGroupField = me.getGroupField();
		me.lastGroupIndex = me.getGroupFieldArray();
		me.block();
		me.onGroupChange();
		me.unblock();
	},

	// If we add a new item that doesn't belong to a rendered group, refresh the view
	onAdd: function(store, records){
		var me = this,
			view = me.view,
			groupField = me.getGroupField(),
			i = 0,
			len = records.length,
			activeGroups,
			addedGroups,
			groups,
			needsRefresh,
			group;

		if (view.rendered) {
			addedGroups = {};
			activeGroups = {};

			for (; i < len; ++i) {
				group = records[i].get(groupField);
				if (addedGroups[group] === undefined) {
					addedGroups[group] = 0;
				}
				addedGroups[group] += 1;
			}
			groups = store.getGroups();
			for (i = 0, len = groups.length; i < len; ++i) {
				group = groups[i];
				activeGroups[group.name] = group.children.length;
			}

			for (group in addedGroups) {
				if (addedGroups[group] === activeGroups[group]) {
					needsRefresh = true;
					break;
				}
			}

			if (needsRefresh) {
				view.refresh();
			}
		}
	},

	onUpdate: function(store, record, type, changedFields){
		var view = this.view;
		if (view.rendered && !changedFields || Ext.Array.contains(changedFields, this.getGroupField())) {
			view.refresh();
		}
	},

	onRemove: function(store, record) {
		var me = this,
			groupField = me.getGroupField(),
			removedGroup = record.get(groupField),
			view = me.view;

		if (view.rendered) {
			// If that was the last one in the group, force a refresh
			if (store.findExact(groupField, removedGroup) === -1) {
				me.view.refresh(); 
			}
		}
	},

	injectGroupingMenu: function() {
		var me	   = this,
			headerCt = me.view.headerCt;

		headerCt.showMenuBy = me.showMenuBy;
		headerCt.getMenuItems = me.getMenuItems();
	},

	showMenuBy: function(t, header) {
		var menu = this.getMenu(),
			groupMenuItem  = menu.down('#groupMenuItem'),
			groupableMth = header.groupable === false ?  'disable' : 'enable';

		groupMenuItem[groupableMth]();
		Ext.grid.header.Container.prototype.showMenuBy.apply(this, arguments);
	},

	getMenuItems: function() {
		var me				 = this,
			groupByText		= me.groupByText,
			disabled		   = me.disabled || !me.getGroupField(),
			showGroupsText	 = me.showGroupsText,
			enableNoGroups	 = me.enableNoGroups,
			getMenuItems	 = me.view.headerCt.getMenuItems;

		// runs in the scope of headerCt
		return function() {
			// We cannot use the method from HeaderContainer's prototype here
			// because other plugins or features may already have injected an implementation
			var o = getMenuItems.call(this);
			o.push('-', {
				iconCls: Ext.baseCSSPrefix + 'group-by-icon',
				itemId: 'groupMenuItem',
				text: groupByText,
				handler: me.onGroupMenuItemClick,
				scope: me
			});
			if (enableNoGroups) {
				o.push({
					itemId: 'groupToggleMenuItem',
					text: showGroupsText,
					checked: !disabled,
					checkHandler: me.onGroupToggleMenuItemClick,
					scope: me
				});
			}
			return o;
		};
	},

	/**
	 * Group by the header the user has clicked on.
	 * @private
	 */
	onGroupMenuItemClick: function(menuItem, e) {
		var me = this,
			menu = menuItem.parentMenu,
			hdr  = menu.activeHeader,
			view = me.view,
			store = view.store;

		//delete me.lastGroupIndex;
		me.block();
		me.enable();
		//store.group(hdr.dataIndex);
		me.lastGroupIndex = me.lastGroupIndex || [];
		var flag = false;
		for (var i = 0; i < me.lastGroupIndex.length; i++) {
			if (me.lastGroupIndex[i] == hdr.dataIndex) {
				flag = true;
				break;
			}
		}
		if (!flag) {
			me.lastGroupIndex.push(hdr.dataIndex);
		}
		store.group(me.lastGroupIndex);
		me.pruneGroupedHeader();
		me.unblock();
		me.refreshIf();
	},

	block: function(){
		this.blockRefresh = this.view.blockRefresh = true;
	},

	unblock: function(){
		this.blockRefresh = this.view.blockRefresh = false;
	},

	/**
	 * Turn on and off grouping via the menu
	 * @private
	 */
	onGroupToggleMenuItemClick: function(menuItem, checked) {
		this[checked ? 'enable' : 'disable']();
	},

	/**
	 * Prunes the grouped header from the header container
	 * @private
	 */
	pruneGroupedHeader: function() {
		var me = this,
			header = me.getGroupedHeader();

		if (me.hideGroupedHeader && header) {
			if (me.prunedHeader) {
				me.prunedHeader.show();
			}
			me.prunedHeader = header;
			header.hide();
		}
	},

	getGroupedHeader: function(){
		var groupField = this.getGroupField(),
			headerCt = this.view.headerCt;

		return groupField ? headerCt.down('[dataIndex=' + groupField + ']') : null;
	},

	getGroupField: function(){
		var groupers = this.view.store.groupers,
			i, count = groupers.getCount();
		if (count == 0) {
			return '';
		}
		var groups = groupers.first().property;
		for (i = 1; i < count; i++) {
			groups = groups.concat('-', groupers.getAt(i).property);
		}
		return groups;
	},

	getGroupFieldArray: function() {
		var groupers = this.view.store.groupers,
			i, count = groupers.getCount(),
			groups = [];
		for (i = 0; i < count; i++) {
			groups.push(groupers.getAt(i).property);
		}
		return groups;
	},

	getGroupFieldValueArray: function(record) {
		var groupFieldArray = this.getGroupFieldArray(),
			i, count = groupFieldArray.length,
			groups = [];
		for (i = 0; i < count; i++) {
			groups.push(record.get(groupFieldArray[i]));
		}
		return groups;
	},

	/**
	 * When a row gains focus, expand the groups above it
	 * @private
	 */
	onRowFocus: function(rowIdx) {
		var node	= this.view.getNode(rowIdx),
			groupBd = Ext.fly(node).up('.' + this.collapsedCls);

		if (groupBd) {
			// for multiple level groups, should expand every groupBd
			// above
			this.expand(groupBd);
		}
	},

	/**
	 * Returns `true` if the named group is expanded.
	 * @param {String} groupName The group name as returned from {@link Ext.data.Store#getGroupString getGroupString}. This is usually the value of
	 * the {@link Ext.data.Store#groupField groupField}.
	 * @return {Boolean} `true` if the group defined by that value is expanded.
	 */
	isExpanded: function(groupName) {
		return (this.collapsedState[groupName] === false);
	},

	/**
	 * Expand a group
	 * @param {String/Ext.Element} groupName The group name, or the element that contains the group body
	 * @param {Boolean} focus Pass `true` to focus the group after expand.
	 */
	expand: function(groupName, focus, /*private*/ preventSizeCalculation) {
		var me = this,
			view = me.view,
			grid = view.up('gridpanel'),
			groupHeader,
			groupBody,
			idSummaryMy,
			depthSummaryMy,
			groupSummaryMy,
			lockingPartner = me.lockingPartner;

		// We've been passed the group name
		if (Ext.isString(groupName)) {
			groupBody = Ext.fly(me.getGroupBodyId(groupName), '_grouping');
		}
		// We've been passed an element
		else {
			groupBody = Ext.fly(groupName, '_grouping');
			groupName = me.getGroupName(groupBody);
		}
		groupHeader = Ext.get(me.getGroupHeaderId(groupName));
      	
		// If we are collapsed...
		if (me.collapsedState[groupName]) {
			groupBody.removeCls(me.collapsedCls);
			groupBody.prev().removeCls(me.hdCollapsedCls);

			if(me.summaryGroups != undefined) {      // если отображение с суммами
			
			    depthSummaryMy = me.getGroupDepth(groupHeader);
			    for(var q=0; q < me.summaryGroups.length; q++) {
			        var w = me.summaryGroups[q].name;
			        var z = me.nameIDNode[groupName];
			        if(w.indexOf(z) != -1 && depthSummaryMy+1 == me.summaryGroups[q].depth) {  
	                    idSummaryMy = Ext.get('summary-'+view.id+'-hd-'+w);
		                idSummaryMy.removeCls(me.collapsedCls);
		                idSummaryMy.removeCls(me.hdcollapsedCls);
		            }
		        }

			}

			if (!expandDepthCls) {
				var depth = me.getGroupDepth(groupBody);
				var expandDepthCls = me.groupDepthPrefix + (depth + 1);
				while ((groupBody = groupBody.next(me.eventSelector)) && me.getGroupDepth(groupBody) > depth) {
					if (groupBody.hasCls(expandDepthCls) && groupBody.hasCls(me.hdCollapsedCls)) {
						groupBody.removeCls(me.collapsedCls);
					}
				}
			}

			if (preventSizeCalculation !== true) {
				// view.refreshSize();
		        grid.determineScrollbars();
		        grid.invalidateScroller();				
			}
			view.fireEvent('groupexpand', view, groupHeader, groupName);
			me.collapsedState[groupName] = false;

			// If we are one side of a locking view, the other side has to stay in sync
			if (lockingPartner) {
				lockingPartner.expand(groupName, focus, preventSizeCalculation);
			}
			if (focus) {
				groupBody.scrollIntoView(view.el, null, true);
			}
		}
	},

	/**
	 * Expand all groups
	 */
	expandAll: function(){
		var me   = this,
			view = me.view,
			grid = view.up('gridpanel'),
			els  = view.el.select(me.eventSelector).elements,
			e,
			eLen = els.length;

		for (e = 0; e < eLen; e++) {
			me.expand(Ext.fly(els[e]).next(), false, true);
		}

        grid.determineScrollbars();
        grid.invalidateScroller();
	},

	/**
	 * Collapse a group
	 * @param {String/Ext.Element} groupName The group name, or the element that contains group body
	 * @param {Boolean} focus Pass `true` to focus the group after expand.
	 */
	collapse: function(groupName, focus, /*private*/ preventSizeCalculation) {

		var me = this,
			view = me.view,
			grid = view.up('gridpanel'),
			groupHeader,
			groupBody,
			lockingPartner = me.lockingPartner;

		// We've been passed the group name
		if (Ext.isString(groupName)) {
			groupBody = Ext.fly(me.getGroupBodyId(groupName), '_grouping');
		}
		// We've been passed an element
		else {
			groupBody = Ext.fly(groupName, '_grouping');
			groupName = me.getGroupName(groupBody);
		}
		groupHeader = Ext.get(me.getGroupHeaderId(groupName));

		// If we are not collapsed...
		if (!me.collapsedState[groupName]) {
			groupBody.addCls(me.collapsedCls);
			groupBody.prev().addCls(me.hdCollapsedCls);

			if(me.summaryGroups != undefined) {
				depthSummaryMy = me.getGroupDepth(groupHeader);

			    for(var q=0; q < me.summaryGroups.length; q++) {
			        var w = me.summaryGroups[q].name;
			        var z = me.nameIDNode[groupName];
			        if(w.indexOf(z) != -1 && depthSummaryMy+1 == me.summaryGroups[q].depth) {  
	                    idSummaryMy = Ext.get('summary-'+view.id+'-hd-'+w);
		                idSummaryMy. addCls(me.collapsedCls);
		                idSummaryMy. addCls(me.hdcollapsedCls);
		            }
		        }

			}

			var depth = me.getGroupDepth(groupBody);
			while ((groupBody = groupBody.next(me.eventSelector)) && me.getGroupDepth(groupBody) > depth) {
				groupBody.addCls(me.collapsedCls);
				groupBody = groupBody.next();
				if (!groupBody) {
					break;
				}
				me.collapse(groupBody, false, true);
			}

			if (preventSizeCalculation !== true) {
				// view.refreshSize();
		        grid.determineScrollbars();
		        grid.invalidateScroller();				
			}
			view.fireEvent('groupcollapse', view, groupHeader, groupName);
			me.collapsedState[groupName] = true;

			// If we are one side of a locking view, the other side has to stay in sync
			if (lockingPartner) {
				lockingPartner.collapse(groupName, focus, preventSizeCalculation);
			}
			if (focus) {
				groupHeader.scrollIntoView(view.el, null, true);
			}
		}
	},

	/**
	 * Collapse all groups
	 */
	collapseAll: function() {
		var me	 = this,
			view   = me.view,
			grid = view.up('gridpanel'),
			els	= view.el.select(me.eventSelector).elements,
			e,
			eLen   = els.length;

		for (e = 0; e < eLen; e++) {
			me.collapse(Ext.fly(els[e]).next(), false, true);
		}

        grid.determineScrollbars();
        grid.invalidateScroller();
	},

	onGroupChange: function(){
		var me = this,
			field = me.getGroupField(),
			menuItem,
			visibleGridColumns,
			groupingByLastVisibleColumn;

		if (me.hideGroupedHeader) {
			if (me.lastGroupField) {
				menuItem = me.getMenuItem(me.lastGroupField);
				if (menuItem) {
					menuItem.setChecked(true);
				}
			}
			if (field) {
				visibleGridColumns = me.view.headerCt.getVisibleGridColumns();

				// See if we are being asked to group by the sole remaining visible column.
				// If so, then do not hide that column.
				groupingByLastVisibleColumn = ((visibleGridColumns.length === 1) && (visibleGridColumns[0].dataIndex == field));
				menuItem = me.getMenuItem(field);
				if (menuItem && !groupingByLastVisibleColumn) {
					menuItem.setChecked(false);
				}
			}
		}
		me.refreshIf();
		me.lastGroupField = field;
	},

	/**
	 * Gets the related menu item for a dataIndex
	 * @private
	 * @return {Ext.grid.header.Container} The header
	 */
	getMenuItem: function(dataIndex){
		var view = this.view,
			header = view.headerCt.down('gridcolumn[dataIndex=' + dataIndex + ']'),
			menu = view.headerCt.getMenu();

		return header ? menu.down('menuitem[headerId='+ header.id +']') : null;
	},

	/**
	 * Toggle between expanded/collapsed state when clicking on
	 * the group.
	 * @private
	 */
	onGroupClick: function(view, rowElement, groupName, e) {
		var me = this;

		if (me.collapsible) {
			if (me.collapsedState[groupName]) {
				me.expand(groupName);
			} else {
				me.collapse(groupName);
			}
		}
	},

	// Injects isRow and closeRow into the metaRowTpl.
	getMetaRowTplFragments: function() {
		return {
			isRow: this.isRow,
			closeRow: this.closeRow
		};
	},

	// injected into rowtpl and wrapped around metaRowTpl
	// becomes part of the standard tpl
	isRow: function() {
		return '<tpl if="typeof rows === \'undefined\'">';
	},

	// injected into rowtpl and wrapped around metaRowTpl
	// becomes part of the standard tpl
	closeRow: function() {
		return '</tpl>';
	},

	// isRow and closeRow are injected via getMetaRowTplFragments
	mutateMetaRowTpl: function(metaRowTpl) {
		metaRowTpl.unshift('{[this.isRow()]}');
		metaRowTpl.push('{[this.closeRow()]}');
	},

	// injects an additional style attribute via tdAttrKey with the proper
	// amount of padding
	getAdditionalData: function(data, idx, record, orig) {
		var view = this.view,
			hCt  = view.headerCt,
			col  = hCt.items.getAt(0),
			o = {},
			tdAttrKey;

		// If there *are* any columne in this grid (possible empty side of a locking grid)...
		// Add the padding-left style to indent the row according to grouping depth.
		// Preserve any current tdAttr that a user may have set.
		if (col) {
			tdAttrKey = col.id + '-tdAttr';
			o[tdAttrKey] = this.indentByDepth(data) + " " + (orig[tdAttrKey] ? orig[tdAttrKey] : '');
			o.collapsed = 'true';
			// o.data = record.getData();
			o.data = record.data;
		}
		return o;
	},

	// return matching preppedRecords
	getGroupRows: function(group, records, preppedRecords, fullWidth) {
		var me = this,
			children = group.children,
			rows = group.rows = [],
			view = me.view,
			header = me.getGroupedHeader(),
			groupField = me.getGroupField(),
			groupFieldValueArray,
			index = -1,
			r,
			z = 1,
			rLen = records.length,
			record;

		// Buffered rendering implies that user collapsing is disabled.
		if (view.store.buffered) {
			me.collapsible = false;
		}

		group.viewId = view.id;

		for (r = 0; r < rLen; r++) {
			record = records[r];

			//if (record.get(groupField) == group.name) {
			groupFieldValueArray = me.getGroupFieldValueArray(record);
			if (groupFieldValueArray.join('') == group.name) {
				index = r;
			}
			if (Ext.Array.indexOf(children, record) != -1) {
				rows.grouplength = z;
				rows.push(Ext.apply(preppedRecords[r], {
					depth : 1
				}));
				z += 1;
			}
		}
		
		if(rows.length == 0) {
			rows.grouplength = group.records.length;
		}

		group.groupField = groupField,
		group.groupHeaderId = me.getGroupHeaderId(group.id);
		group.groupBodyId = me.getGroupBodyId(group.id);
		group.fullWidth = fullWidth;
		group.columnName = header ? header.text : groupField;
		group.groupValue = group.name;

		// Here we attempt to overwrite the group name value from the Store with
		// the get the rendered value of the column from the *prepped* record
		if (header && index > -1) {
			group.name = group.renderedValue = preppedRecords[index][header.id];
		}
		if (me.collapsedState[group.name]) {
			group.collapsedCls = me.collapsedCls;
			group.hdCollapsedCls = me.hdCollapsedCls;
		} else {
			group.collapsedCls = group.hdCollapsedCls = '';		
		}

		// Collapsibility of groups may be disabled.
		if (me.collapsible) {
			group.collapsibleClass = me.hdCollapsibleCls;
		} else {
			group.collapsibleClass = '';
		}

		return group;
	},

	// Create an associated DOM id for the group's header element given the group name
	getGroupHeaderId: function(groupName) {
		return this.view.id + '-hd-' + groupName;
	},

	// Create an associated DOM id for the group's body element given the group name
	getGroupBodyId: function(groupName) {
		return this.view.id + '-bd-' + groupName;
	},

	// Get the group name from an associated element whether it's within a header or a body
	getGroupName: function(element) {
		var me = this,
			targetEl;

		// See if element is, or is within a group header. If so, we can extract its name
		targetEl = Ext.fly(element).findParent(me.eventSelector);
		if (targetEl) {
			return targetEl.id.split(this.view.id + '-hd-')[1];
		}

		// See if element is, or is within a group body. If so, we can extract its name
		targetEl = Ext.fly(element).findParent(me.bodySelector);
		if (targetEl) {
			return targetEl.id.split(this.view.id + '-bd-')[1];
		}
	},

	// Get the group depth from an associated element whether it's within a header or a body
	getGroupDepth: function(element) {
		var depthCls = element.dom.className.replace(this.groupDepthRe, '$1');
		return parseInt(depthCls.replace(this.groupDepthPrefix, ''));
	},

	// return the data in a grouped format.
	collectData: function(records, preppedRecords, startIndex, fullWidth, o) {
		var me	= this,
			store = me.view.store,
			collapsedState = me.collapsedState,
			collapseGroups,
			g,
			gName,
			groups, gLen, group;

		if (me.startCollapsed) {
			// If we start collapse, we'll set the state of the groups here
			// and unset the flag so any subsequent expand/collapse is
			// managed by the feature
			me.startCollapsed = false;   // false <--------
			collapseGroups = true;
		}

		if (!me.disabled && store.isGrouped()) {
			//groups = store.getGroups();
			//gLen   = groups.length;
			o.rows = groups = store.getGroupsForGrouperIndex(records, 0);

			for (g = 0; g < groups.length; g++) {
				group = groups[g];
				group.id = guidGenerator();
				
				if (collapseGroups) {
					collapsedState[group.name] = true;   // true <---------
					// collapsedState[group.id] = true;
				}

				if (group.children) { 
					for (gLen = group.children.length - 1; gLen >= 0; gLen--) {
						var child = group.children[gLen];
						child.parent = group.name;
						// child.id = guidGenerator();
						collapsedState[child.name] = collapsedState[group.name] || collapsedState[child.name];
						if(group.depth == 0) {
						    me.nameIDNode[group.id] = group.name;
						    gName = group.name;
						} else {
						    me.nameIDNode[group.id] = group.parent+group.name;
						}  
						groups.splice(g + 1, 0, child);
					}
					me.getGroupRows(group, [], preppedRecords, fullWidth);
				} else {
					group.children = group.records;
					if (group.children.length == 0) {
						me.getGroupRows(group, [], preppedRecords, fullWidth);
						group.collapsibleClass = '';
					} else {
						me.getGroupRows(group, records, preppedRecords, fullWidth);
					}
					me.nameIDNode[group.id] = gName+group.parent+group.name;
				}
				if (group.parent !== undefined && collapsedState[group.parent]) {
					group.hdCollapsedCls += ' ' + me.collapsedCls;
				}
			}
		}
		return o;
	},

	flattenGroups: function(groups) {
		var g, group, child;

		for (g = 0; g < groups.length; g++) {
			group = groups[g];
			if (group.children) {
				for (var c = group.children.length - 1; c >= 0; c--) {
					child = group.children[c];
					child.parent = group.name;
					child.name = group.name + '' + child.name;
					groups.splice(g + 1, 0, child);
				}
			}
		}
		return groups;
	},

	// adds the groupName to the groupclick, groupdblclick, groupcontextmenu
	// events that are fired on the view. Chose not to return the actual
	// group itself because of its expense and because developers can simply
	// grab the group via store.getGroups(groupName)
	getFireEventArgs: function(type, view, targetEl, e) {
		return [type, view, targetEl, this.getGroupName(targetEl), e];
	}
	
});