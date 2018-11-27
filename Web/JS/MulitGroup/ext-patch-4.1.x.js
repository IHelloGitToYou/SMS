Ext.override(Ext.data.Store, {

	/**
	 * Runs the aggregate function for all the records in the store.
	 *
	 * When store is filtered, only items within the filter are aggregated.
	 *
	 * @param {Function} fn The function to execute. The function is called with a single parameter,
	 * an array of records for that group.
	 * @param {Object} [scope] The scope to execute the function in. Defaults to the store.
	 * @param {Boolean} [grouped] True to perform the operation for each group
	 * in the store. The value returned will be an object literal with the key being the group
	 * name and the group average being the value. The grouped parameter is only honored if
	 * the store has a groupField.
	 * @param {Array} [args] Any arguments to append to the function call
	 * @return {Object} An object literal with the group names and their appropriate values.
	 */
	aggregate: function(fn, scope, grouped, args) {
		args = args || [];
		if (grouped && this.isGrouped()) {
			var groups = this.getGroupData(false),
				i = 0,
				len = groups.length,
				out = {},
				group;

			for (; i < len; ++i) {
				group = groups[i];
				this.aggregateGroup(out, fn, scope, group, args);
			}
			return out;
		} else {
			return fn.apply(scope || this, [this.data.items].concat(args));
		}
	},

	aggregateGroup: function(out, fn, scope, group, args) {
		if (group.children) {
			for (var c = group.children.length - 1; c >= 0; c--) {
				child = group.children[c];
				child.parent = group.name;
				child.name = group.name + '' + child.name;
				this.aggregateGroup(out, fn, scope, child, args);
			}
		}
		out[group.name] = fn.apply(scope || this, [group.records].concat(args, group.depth));
	}
	

	
});

Ext.override(Ext.grid.feature.AbstractSummary, {

	/**
	 * Gets the value for the column from the attached data.
	 * @param {Ext.grid.column.Column} column The header
	 * @param {Object} data The current data
	 * @return {String} The value to be rendered
	 */
	getColumnValue: function(column, summaryData){
		var comp	 = Ext.getCmp(column.id),
			value	= summaryData[column.id],
			renderer = comp.summaryRenderer;

		if (renderer) {
			value = renderer.call(
				comp.scope || this,
				value,
				summaryData,
				column.dataIndex
			);
		}

		if (!value && value !== 0) {
			value = '\u00a0';
		}
		return value;
	},

	/**
	 * Get the summary data for a field.
	 * @private
	 * @param {Ext.data.Store} store The store to get the data from
	 * @param {String/Function} type The type of aggregation. If a function is specified it will
	 * be passed to the stores aggregate function.
	 * @param {String} field The field to aggregate on
	 * @param {Boolean} group True to aggregate in grouped mode 
	 * @return {Number/String/Object} See the return type for the store functions.
	 */
	getSummary: function(store, type, field, group){
		if (type) {
			if (Ext.isFunction(type)) {
				return store.aggregate(type, null, group, [field]);
			}

			switch (type) {
				case 'count':
					return store.count(group);
				case 'min':
					return store.min(field, group);
				case 'max':
					return store.max(field, group);
				case 'sum':
					return store.sum(field, group);
				case 'average':
					return store.average(field, group);
				default:
					return group ? {} : '';
					
			}
		}
	}
});

Ext.override(Ext.grid.feature.Summary, {

	/**
	 * @cfg {String} position
	 * The position where the summary row should be rendered (defaults to 'top').
	 * The only other supported value is 'bottom'.
	 */

	/**
	 * Overrides the openRows and closeRows methods on the template so we can include our own
	 * custom header or footer.
	 * @private
	 * @return {Object} The custom fragments
	 */
	getTableFragments: function(){
		if (this.showSummaryRow) {
			if (this.position == "bottom") {
				return {
					closeRows: this.closeRows
				};
			}
			return {
				openRows: this.openRows
			};
		}
	},

	/**
	 * Provide our own custom header for the grid.
	 * @private
	 * @return {String} The custom header
	 */
	openRows: function() {
		return '{[this.recursive? "" : this.printSummaryRow()]}<tpl for="rows">';
	},

	/**
	 * Provide our own custom footer for the grid.
	 * @private
	 * @return {String} The custom footer
	 */
	closeRows: function() {
		return '</tpl>{[this.recursive? "" : this.printSummaryRow()]}';
	},

	/**
	 * Gets the data for printing a template row
	 * @private
	 * @param {Number} index The index in the template
	 * @return {Array} The template values
	 */
	getPrintData: function(index){
		var me = this,
			columns = me.view.headerCt.getColumnsForTpl(),
			length = columns.length,
			rowIdx = index - 1,
			colIdx = 0,
			header,
			renderer,
			value,
			metaData,
			view = me.view,
			store = view.store,
			record,
			data = [],
			active = me.summaryData,
			column;

		record = store.createModel(active);
		for (; colIdx < length; ++colIdx) {
			metaData = {
				tdCls: '',
				style: ''
			};
			column = columns[colIdx];
			header = Ext.getCmp(column.id);
			value = active[header.dataIndex];
			if (header.totalLabel) {
				value = header.totalLabel;
			} else {
				renderer = header.summaryRenderer;
				if (!renderer && header.summaryType) {
					renderer = header.renderer;
				}
			}

			if (typeof renderer == "function") {
				value = renderer.call(
					header || this,
					value,
					// metadata per cell passing an obj by reference so that
					// it can be manipulated inside the renderer
					metaData,
					record,
					rowIdx,
					colIdx,
					store,
					view
				);
			}

			if (metaData.css) {
				// This warning attribute is used by the compat layer
				column.cssWarning = true;
				metaData.tdCls = metaData.css;
				delete metaData.css;
			}
			column["id-tdCls"] = metaData.tdCls;
			column["id-tdAttr"] = metaData.tdAttr;
			column["id-style"] = metaData.style;
			if (typeof value === 'undefined' || value === null || value === '') {
				value = header.emptyCellText;
			}
			column.gridSummaryValue = value;
			data.push(column);
		}
		return data;
	},

	/**
	 * Generates all of the summary data to be used when processing the template
	 * @private
	 * @return {Object} The summary data
	 */
	generateSummaryData: function(){
		var me = this,
			data = {},
			store = me.view.store,
			columns = me.view.headerCt.getColumnsForTpl(),
			i = 0,
			length = columns.length,
			fieldData,
			key,
			comp;

		for (i = 0, length = columns.length; i < length; ++i) {
			comp = Ext.getCmp(columns[i].id);
			data[comp.dataIndex] = me.getSummary(store, comp.summaryType, comp.dataIndex, false);
		}
		return data;
	}
});
