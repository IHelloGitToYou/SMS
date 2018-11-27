
//////Ext.define('SunTool.colSearchBox', {
//////    extend: 'Ext.container.Container',
//////    xtype: 'colSearchBox',

//////    myXtype: 'textfield',
//////    myDataIndex: 'fieldName',
//////    myHeader: '列名',
//////    myIsFix: true,
//////    myIsFormTo: false,
//////    mySearchType: 1, //1  包含 2.绝对，3.左包含，4.右包含
//////    myCaseSensitive: false,
//////    myFormValue: '',
//////    myToValue: '',

//////    margin: '2',
//////    items: [],
//////    getValue: function () {
//////        var me = this;
//////        var obj = {
//////            myXtype: me.myXtype,
//////            myDataIndex: me.myDataIndex,
//////            myHeader: me.myHeader,
//////            myIsFix: me.myIsFix,
//////            myIsFormTo: me.myIsFormTo,
//////            mySearchType: me.mySearchType, //1  包含 2.绝对，3.左包含，4.右包含
//////            myCaseSensitive: me.myCaseSensitive,
//////            myFormValue: me.formBox.getValue(),
//////            myToValue: me.toBox.getValue()
//////        };

//////        return obj;
//////    },

//////    initComponent: function () {
//////        var me = this;
//////        me.callParent(arguments);

//////        ////myXtype: 'textfield',
//////        ////myDataIndex: 'fieldName',
//////        ////myHeader: '列名',
//////        ////myIsFix: true,
//////        ////myIsFormTo: false,
//////        ////mySearchType: 1, //1  包含 2.绝对，3.左包含，4.右包含
//////        ////myCaseSensitive: false,
//////        ////myFormValue: '',
//////        ////myToValue: '',

//////        //如果是日期类型，强制是起止模式
//////        if (me.myXtype === 'datefield')
//////            me.myIsFormTo = true;

//////        me.formBoxCfg = {
//////            xtype: me.myXtype,
//////            fieldLabel: me.myHeader,
//////            name: me.myDataIndex + '_form',
//////            value: me.myXtype === 'datefield' ? (me.myFormValue || new Date()) : me.myFormValue,
//////            format: me.myXtype === 'datefield' ? 'Y-m-d' : undefined,
//////            labelAlign: 'left',
//////            labelWidth: 35,
//////            anchor: '100%'
//////        };

//////        me.toBoxCfg = {
//////            xtype: me.myXtype,
//////            fieldLabel: '至',
//////            name: me.myDataIndex + '_to',
//////            value: me.myXtype === 'datefield' ? (me.myToValue || new Date()) : me.myToValue,
//////            format: me.myXtype === 'datefield' ? 'Y-m-d' : undefined,
//////            hidden: !me.myIsFormTo,
//////            labelAlign: 'left',
//////            labelWidth: 35,
//////            anchor: '100%'
//////        };

//////        me.formBox = me.add(me.formBoxCfg);
//////        me.toBox = me.add(me.toBoxCfg);
//////    },
//////    listeners: {
//////        boxready: function (com, obj) {

//////        }
//////    }
//////});


//////var states = Ext.create('Ext.data.Store', {
//////    fields: ['abbr', 'name'],
//////    data: [
//////        { "abbr": "AL", "name": "Alabama" },
//////        { "abbr": "AK", "name": "Alaska" },
//////        { "abbr": "AZ", "name": "Arizona" }
//////    ]
//////});

///////*
//////    需重写
//////    store ,
//////    queryMode
//////    displayField,
//////    displayField,
//////    maxRecord: 2, 下拉弹出最大项数
//////    tpl,
//////    displayTpl,
//////    enableGridSearch : //可以用Grid查询？
//////    inGrid,
//////    celleditingIndex，
//////    valueGridField: 'email',
//////    displayGridField: ''
//////*/
//////Ext.define('SunEditor.Sample', {
//////    extend: 'Ext.form.ComboBox',
//////    //fieldLabel: 'Choose State',
//////    xtype: 'SunEditor_Sample',
//////    store: states,
//////    queryMode: 'local',
//////    triggerAction: 'query',
//////    typeAhead: true,
//////    //      store: dsprd(),
//////    //      queryMode: 'remote',
//////    displayField: 'name',
//////    valueField: 'abbr',
//////    focusAndExpand: false,
//////    anyMatch: true,
//////    triggerAction: 'last',
//////    clearFilterOnBlur: false,
//////    matchAtFristChar: false, //从第二个字符开始匹配
//////    enableGridSearch: true,
//////    inGrid: false,
//////    valueGridField: 'email',
//////    displayGridField: '',
//////    selectOnTab: false,
//////    maxGridSearchBox: 5, //最大可查询条件数

//////    celleditingIndex: 0,
//////    isIniting: true,
//////    maxRecord: 2,
//////    tpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '<div class="x-boundlist-item"><table><tr><td style="width:50px">{abbr}</td><td  style="width:40px">{name}</td><td  style="width:45px">{name}</td><td  style="width:40px">{name}</td><td  style="width:40px">{name}</td></tr></table></div>',
//////            //'{% if (xindex >= 10) break; %}',
//////        '</tpl>'
//////    ),
//////    // template for the content inside text field
//////    displayTpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '{abbr} - {name}',
//////        '</tpl>'
//////    ),

//////    ////                .x-form-trigger {
//////    ////                    background: url("images/form/trigger.png") repeat scroll 0 0 rgba(0, 0, 0, 0);
//////    ////                    width: 22px;
//////    ////                }

//////    matchFieldWidth: false,
//////    doLocalQuery: function (queryPlan) {

//////        queryPlan.forceAll = false;
//////        var me = this,
//////            queryString = queryPlan.query;

//////        me.queryPlan = queryPlan; //保存它的引用．希望能在filterFn中引用到

//////        if (me.queryFilter && me.inGrid === true && me.isIniting === true) {
//////            //me.store.clearFilter();
//////            if (me.queryFilter)
//////                me.store.removeFilter(me.queryFilter);
//////            me.queryFilter = null;
//////            me.isIniting = false;
//////        }
//////        /// Create our filter when first needed
//////        if (!me.queryFilter) {
////////            console.log(' set queryFilter');
////////            console.log(' 查 ' + me.queryPlan.query);

//////            //me.store.clearFilter();
//////            me.queryFilter = new Ext.util.Filter({
//////                valueField1: me.valueField,
//////                valueField2: me.displayField,
//////                matchAtFristChar: me.matchAtFristChar,
//////                filterFn: function (item) {
//////                    //console.log({ a: ' 查2 ', vthis: this });
//////                    //return true;
//////                    var qStr = me.queryPlan.query;
//////                    if (!qStr || (qStr && qStr.trim() === ''))
//////                        return true;

//////                    qStr = qStr.trim();
//////                    var vName = item.get(this.valueField1).toString().toUpperCase();
//////                    var vAbbr = item.get(this.valueField2).toString().toUpperCase();
//////                    var vNowValue = qStr.toUpperCase();

//////                    //console.log({ page: ' 匹配方式内部 ', 当前值: vNowValue, Name值: vName, Value值: vAbbr });
//////                    if (this.matchAtFristChar === true) {
//////                        //console.log({ v: vName.indexOf(vNowValue), b: vAbbr.indexOf(vNowValue) });
//////                        return (vName.indexOf(vNowValue) == 0 || vAbbr.indexOf(vNowValue) == 0) ? true : false;
//////                    }
//////                    else {
//////                        return (vName.indexOf(vNowValue) >= 0 || vAbbr.indexOf(vNowValue) >= 0) ? true : false;
//////                    }

//////                }
//////            });

//////            me.store.addFilter(me.queryFilter, false);
//////        }

//////        // Querying by a string...
//////        if (queryString || !queryPlan.forceAll) {
//////            me.queryFilter.disabled = false;
//////            //me.queryFilter.setValue(me.enableRegEx ? new RegExp(queryString) : (queryString || '').trim());
//////        }

//////        // If forceAll being used, or no query string, disable the filter
//////        else {
//////            me.queryFilter.disabled = true;
//////        }
//////        ////        me.queryFilter.disabled = false;
//////        // Filter the Store according to the updated filter
//////        me.store.filter();

//////        // Expand after adjusting the filter unless there are no matches
//////        //        console.log({ 过滤出了行数: me.store.getCount() });
//////        if (me.store.getCount()) {
//////            me.expand();
//////        } else {
//////            me.collapse();
//////        }
//////        if (me.afterQuery)
//////            me.afterQuery(queryPlan);
//////    },

//////    doRemoteQuery: function (queryPlan) {
//////        var me = this,
//////           loadCallback = function () {
//////               //me.afterQuery(queryPlan);
//////               //console.log('加载完成');
//////               //alert('加载完成');
//////           };

//////        // expand before loading so LoadMask can position itself correctly
//////        me.expand();
//////        //        me.store.clearFilter(true);

//////        // In queryMode: 'remote', we assume Store filters are added by the developer as remote filters,
//////        // and these are automatically passed as params with every load call, so we do *not* call clearFilter.
//////        if (me.pageSize) {
//////            // if we're paging, we've changed the query so start at page 1.
//////            me.loadPage(1, {
//////                rawQuery: queryPlan.rawQuery,
//////                callback: loadCallback
//////            });
//////        } else {
//////            me.store.load({
//////                params: me.getParams(queryPlan.query),
//////                //rawQuery: queryPlan.rawQuery,
//////                callback: loadCallback
//////            });
//////        }
//////    },

//////    /**
//////    * @private
//////    * Enables the key nav for the BoundList when it is expanded.
//////    */
//////    onExpand: function () {
//////        var me = this,
//////            keyNav = me.listKeyNav,
//////            selectOnTab = me.selectOnTab,
//////            picker = me.getPicker();

//////        if (keyNav) {
//////            keyNav.enable();
//////        } else {
//////            keyNav = me.listKeyNav = new Ext.view.BoundListKeyNav(me.inputEl, {
//////                boundList: picker,
//////                forceKeyDown: true,
//////                //                down: function (e) {
//////                //                    console.log(' down arrow');
//////                //                    console.log( e);
//////                //                },
//////                tab: function (e) {
//////                    if (selectOnTab) {
//////                        this.selectHighlighted(e);
//////                        me.triggerBlur();
//////                    }
//////                    // Tab key event is allowed to propagate to field
//////                    return true;
//////                },
//////                enter: function (e, a, b) {
//////                    //console.log('1 enter Event');
//////                    me.suspendEvents(false);

//////                    var selModel = picker.getSelectionModel(),
//////                        count = selModel.getCount();

//////                    //console.log('enter event in suneditor');

//////                    var highlighted = picker.highlightedItem;

//////                    if (highlighted) {
//////                        var highlightedRec = picker.getRecord(highlighted);

//////                        me.onSelectWinReturn([highlightedRec], false);
//////                    }

//////                    // Handle the case where the highlighted item is already selected
//////                    // In this case, the change event won't fire, so just collapse

//////                    //                    console.log({ count: count, selCnt: selModel.getCount(), multiSelect: me.multiSelect });
//////                    if (!me.multiSelect || count === selModel.getCount()) {
//////                        me.collapse();
//////                    }
//////                    me.setRawValue(me.value);
//////                    //me.setRawValue(me.getDisplayValue());
//////                    me.inputEl.focus();
//////                    me.resumeEvents(false);

//////                    me.fireEvent('inside_select', me, [highlightedRec]);
//////                    ;
//////                    if (!me.TaskSelectText) {
//////                        me.TaskSelectText = new Ext.util.DelayedTask(function () {
//////                            me.selectText();
//////                        }, me);
//////                    }
//////                    me.TaskSelectText.delay(100);
//////                }
//////            });
//////        }

//////        //        console.log('keyNav');
//////        //        console.log(keyNav);

//////        // While list is expanded, stop tab monitoring from Ext.form.field.Trigger so it doesn't short-circuit selectOnTab
//////        if (selectOnTab) {
//////            me.ignoreMonitorTab = true;
//////        }

//////        Ext.defer(keyNav.enable, 1, keyNav); //wait a bit so it doesn't react to the down arrow opening the picker
//////        //        me.inputEl.focus();
//////    },



//////    initEvents: function () {

//////        var me = this;
//////        me.callParent(arguments);


//////        if (me.inGrid == false) {
//////            me.mon(me.inputEl, 'focus', me.onFocusYao, me);
//////            me.mon(me.inputEl, 'blur', me.onBlurYao, me);
//////            //me.on('beforeselect', me.onBeforeSelectItem, me);
//////        }
//////        me.mon(me.inputEl, 'dblclick', me.onKeyF3OrDblClick, me);
//////        me.on('select', me.onSelectItem, me);
//////        //////        if (me.inGrid === true) {
//////        //////            var me = this,
//////        //////                outGrid = me.up('.grid'),
//////        //////                cellEditing = outGrid.plugins[me.celleditingIndex];

//////        //////            cellEditing.on('edit', function (ed, e) {
//////        //////                //Grid 清空对应名的列
//////        //////                if (!e.record.get(me.valueGridField)) {
//////        //////                    e.record.set(me.displayGridField, '');
//////        //////                    me.clearValue();

//////        //////                    me.fireEvent('ingrid_clear', me, e);
//////        //////                }
//////        //////                //me.onBlurYao();
//////        //////            });
//////        //////        }
//////    },
//////    initComponent: function () {
//////        var me = this,
//////            isDefined = Ext.isDefined,
//////            store = me.store,
//////            i = 0,
//////            cnt = store.getCount(),
//////            rowModel = Ext.ModelManager.getModel(store.model);

//////        me.callParent(arguments);
//////        if (me.inGrid === false) {
//////            //试试取消Focus 方法
//////            me.onFocus = function () { }
//////            me.beforeBlur = function () { }
//////        }
//////        //增加 默认的排序方式，以 主键栏位排
//////        me.store.sorters.addAll(me.store.decodeSorters({
//////            property: me.valueField,
//////            direction: 'ASC'
//////        }));


//////        var isLocalMode = me.queryMode === 'local';
//////        if (isLocalMode === true && !me.orignalStoreSetting && !me.orignalStore) {
//////            //复制本地原始数据
//////            me.orignalStore = Ext.create('Ext.data.Store', {
//////                model: store.model
//////            });

//////            for (; i < cnt; ++i) {
//////                me.orignalStore.add(store.getAt(i).copy());
//////            }

//////            ////console.log('父级： 复制本地原始数据' + me.orignalStore.getCount() + '   :' + me.orignalStoreSetting);
//////            //////                        //替换贴粘方法，直接找到对应值写上
//////            //////                        me.onPaste = 
//////        }
//////    },

//////    doGetJsonValue: function () {
//////        var o = {},
//////            me = this;

//////        o[me.valueField] = me.value;
//////        o[me.displayField] = me.getRawValue();

//////        return o;
//////    },
//////    //    onBeforeSelectItem: function (cb, records) {
//////    //        var me = this;
//////    //        //console.log('onBeforeSelectItem ');
//////    //        //me.collapse();
//////    //        me.triggerBlur();
//////    //        me.onSelectWinReturn(records, false);

//////    //        return false;
//////    //    },
//////    onSelectItem: function (cb, records) {
//////        var me = this;
//////        //console.log('onSelectItem ');
//////        me.onSelectWinReturn(records, false);
//////    },

//////    //改写Reset 方法，同时清除　me.tempResult
//////    reset: function () {
//////        var me = this;

//////        me.beforeReset();
//////        me.setValue('');
//////        me.setRawValue('');
//////        me.clearInvalid();
//////        // delete here so we reset back to the original state

//////        delete me.tempResult;
//////        delete me.displayTplData;

//////        delete me.wasValid;
//////    },
//////    //**private //
//////    getRealTplData: function () {
//////        var me = this,
//////            displayTempTplData,
//////            displayTplData;
//////        if (me.tempResult && Ext.typeOf(me.tempResult) === 'array' && me.tempResult[0]) {
//////            displayTempTplData = me.tempResult[0];
//////        }
//////        else if (me.tempResult && Ext.typeOf(me.tempResult) === 'object') {
//////            displayTempTplData = me.tempResult;
//////        }

//////        if (me.displayTplData && Ext.typeOf(me.displayTplData) === 'array' && me.displayTplData[0]) {
//////            displayTplData = me.displayTplData[0];
//////        }
//////        else if (me.displayTplData && Ext.typeOf(me.displayTplData) === 'object') {
//////            displayTplData = me.displayTplData;
//////        }

//////        var tplData = displayTplData || displayTempTplData;

//////        if (displayTplData && displayTempTplData &&
//////            displayTplData[me.valueField] != displayTempTplData[me.valueField])
//////            tplData = me.displayTplData;


//////        return tplData;
//////    },
//////    onBlurYao: function () {
//////        //        console.log('1 blur Event' + this.id);
//////        var me = this;


//////        //清空　所选项
//////        if (!me.getRawValue()) {
//////            me.reset();
//////        }
//////        //tempResult 有值，displayTplData一定有
//////        //　写得有些复杂，　
//////        //　用于对比二个结果，以displayTplData为准
//////        //      情况１.速查单据时，displayTplData有值，但是空对象．　所以要查询为空值，不理tempResult
//////        var tplData = me.getRealTplData();
//////        console.log({ blur: tplData });

//////        var rawValue = '';
//////        if (tplData) {
//////            me.displayTplData = tplData;
//////            //rawValue = tplData[me.displayField];
//////        }
//////        me.setRawValue(me.getDisplayValue());


//////        ////        if (!me.myBlurTask) {
//////        ////            me.myBlurTask = new Ext.util.DelayedTask(function () {
//////        ////                if (me.value && me.doCheckValue() === false) {
//////        ////                    alert('查不存在代号');
//////        ////                    me.clearValue();
//////        ////                }

//////        ////                me.setRawValue(me.getDisplayValue());
//////        ////                console.log('set setRawValue in BlurYao');
//////        ////            }, me);

//////        ////            //console.log('set myBlurTask  ');
//////        ////        }

//////        ////        me.myBlurTask.delay(10);
//////    },
//////    onFocusYao: function () {
//////        //        console.log('1 onFocusYao Event' + this.id);
//////        var me = this;
//////        var tplData = me.getRealTplData();
//////        var Value = '';
//////        if (tplData) {
//////            Value = tplData[me.valueField];
//////        }
//////        me.setRawValue(Value);
//////        //全选字体，会执行focus()，会进入死＇蠢＇环
//////        ////        if (!me.TaskSelectText) {
//////        ////            me.TaskSelectText = new Ext.util.DelayedTask(function () {
//////        ////                me.selectText();
//////        ////            }, me);
//////        ////        }
//////        ////        me.TaskSelectText.delay(100);

//////        //        if (!me.focusAndExpand && !me.isGridReturn)
//////        //            me.expand();

//////        if (!me.inputElKeyNav) {
//////            me.inputElKeyNav = new Ext.util.KeyMap({
//////                target: me.inputEl,
//////                binding: [{
//////                    key: 114, // F3键
//////                    fn: function (keyCode, e) {
//////                        e.preventDefault();
//////                        me.onKeyF3OrDblClick(e);
//////                    }
//////                }],
//////                scope: me.inputEl
//////            });

//////            me.inputElKeyNav.enable();
//////        }


//////    },
//////    doCheckValue: function () {
//////        var me = this,
//////            isLocalMode = me.queryMode === 'local';

//////        if (isLocalMode === true && me.orignalStore) {
//////            var matchRow = me.orignalStore.findRecord(me.valueField, me.value);
//////            if (!matchRow)
//////                return false;
//////        }
//////        else {

//////        }

//////        return true;
//////    },

//////    clearGridValue: function () {
//////        var me = this,
//////            outGrid = me.up('.grid'),
//////            cellEditing = outGrid.plugins[me.celleditingIndex];

//////        me.value = '';
//////        var row = outGrid.getSelectionModel().getSelection()[0];
//////        if (row) {
//////            row.set(me.valueGridField, '');
//////            // 名称栏位不能与值栏位，同名
//////            if (me.displayGridField && me.displayGridField != me.valueGridField)
//////                row.set(me.displayGridField, '');
//////        }
//////    },

//////    onSelectWinReturn: function (records, isCallByGridReturn) {
        
//////        var me = this;
//////        if (isCallByGridReturn === true) {
//////            me.selectWin.close();
//////        }
//////        var rec = (records[0] || records);
//////        if (me.fireEvent('ingrid_beforeselect', me, records) == false) {
//////            if (isCallByGridReturn === false) {
//////                //me.collapse();
//////            }
//////            return false;
//////        }

//////        me.value = rec.get(me.valueField);
//////        me.displayTplData = [rec.data];
//////        me.tempResult = me.displayTplData;

////////                console.log({
////////                    'onSelectWinReturn': '',
////////                    id: me.id,
////////                    value: me.value,
////////                    valueField: me.valueField,
////////                    displayField: me.displayField,
////////                    displayTplData: me.displayTplData
////////                });

//////        if (me.inGrid === false) {
//////            me.setValue(me.value);
//////            me.focus();
//////        }
//////        if (me.inGrid === true) {
//////            me.setValue(me.value);

//////            //找到外面的Grid.
//////            var outGrid = me.up('.grid'),
//////                cellEditing = outGrid.findPlugin('cellediting'),
//////                col = outGrid.headerCt.down('[dataIndex=' + me.valueGridField + ']'),
//////                colIndex = -1;

//////            if (col)
//////                colIndex = outGrid.headerCt.getHeaderIndex(col);


//////            var row = outGrid.getSelectionModel().getSelection()[0];

//////            //            console.log({ outGrid: outGrid, cellEditing: cellEditing, colIndex: colIndex, row: row,
//////            //                v: rec.get(me.valueField),
//////            //                vname: rec.get(me.displayField)
//////            //             });


//////            row.beginEdit();
//////            row.set(me.valueGridField, rec.get(me.valueField));
//////            row.set(me.displayGridField, rec.get(me.displayField));
//////            row.endEdit();

//////            //5.20改,通过触发Grid.Edit事件
//////            //　如果是返回多个记录，并且一定要带回，选中的reocrds时呢
//////            //　这个事件不合适，应该保留，ingrid_beforeselect 事件! 　
//////            outGrid.fireEvent('edit', cellEditing, { field: me.valueGridField, value: me.value, record: row, colIdx: colIndex });

//////            if (row) {
//////                //row.set(me.valueGridField, me.value);
//////                // 名称栏位不能与值栏位，同名
//////                if (me.displayGridField && me.displayGridField != me.valueGridField)
//////                    row.set(me.displayGridField, rec.get(me.displayField)); //me.getRawValue()

//////                me.fireEvent('ingrid_select', me, records);
//////            }
//////        }

//////        //selectItem
//////        me.fireEvent('inside_select', me, records);

//////        if (isCallByGridReturn === true) {
//////            me.isGridReturn = true;
//////        }
//////        return true;
//////    },

//////    onGridColPositionChange: function () {
//////        var me = this,
//////            grid = me.grid,
//////            visiableCols = grid.headerCt.getVisibleGridColumns(),
//////            i = 0,
//////            sortData = [];

//////        //delete me.store.sortInfo;
//////        //me.store.sorters.clear(); // = [];
//////        //排序方式： 最左边三个栏位，为排序条件
//////        for (; i < visiableCols.length && i < 3; ++i) {
//////            sortData.push({
//////                property: visiableCols[i].dataIndex,
//////                direction: 'ASC'
//////            });
//////        }
//////        // me.store.initSortable();
//////        grid.store.sort(sortData);
//////        //console.log(grid.store.sorters);
//////    },

//////    onGridColChange: function () {
//////        var me = this,
//////            westPanel = me.selectWin.westPanel,
//////            grid = me.grid,
//////            visiableCols = grid.headerCt.getVisibleGridColumns(),
//////            storeModelId = grid.store.model,
//////            rowModel = Ext.ModelManager.getModel(storeModelId).create(),
//////            i = 0,
//////            ignocnt = 0;

//////        if (me.isUpdateSearchBoxing)
//////            return false;

//////        Ext.suspendLayouts();
//////        westPanel.removeAll();
//////        //                    console.log('storeModelId');
//////        //                    console.log(storeModelId);
//////        //                    console.log(rowModel);
//////        me.isUpdateSearchBoxing = true;

//////        for (; i < visiableCols.length && i < ((me.maxGridSearchBox || 5) + ignocnt); ++i) {
//////            var box_xtype = 'textfield',
//////                fieldName = visiableCols[i].dataIndex,
//////                colText = visiableCols[i].text,
//////                valType = Ext.typeOf(rowModel.get(fieldName));

//////            //项次不在查询！
//////            if (visiableCols[i].xtype === 'rownumberer') {
//////                ++ignocnt
//////                continue;
//////            }

//////            if (valType === 'date') {
//////                box_xtype = 'datefield';
//////            }

//////            var box = Ext.create('SunTool.colSearchBox', {
//////                myXtype: box_xtype,
//////                myDataIndex: fieldName,
//////                myHeader: colText,
//////                //myIsFix: true,
//////                myIsFormTo: false,
//////                mySearchType: 1, //1  包含 2.绝对 3.左包含，4.右包含   
//////                myCaseSensitive: false
//////            });

//////            westPanel.add(box);
//////        }
//////        Ext.resumeLayouts(false);

//////        delete me.isUpdateSearchBoxing;
//////    },

//////    doGetGridSearchParams: function () {
//////        var me = this,
//////            westP = me.selectWin.westPanel,
//////            i = 0,
//////            searchParams = [];
//////        //因为 是AbstractMixedCollection 所以要 多一个 .items
//////        // console.log(westP.items.items);

//////        for (; i < westP.items.items.length; ++i) {
//////            var box = westP.items.items[i];
//////            searchParams.push(box.getValue());
//////        }

//////        return searchParams;
//////    },

//////    onGridSearch: function () {
//////        var me = this,
//////            i = 0,
//////            params = me.doGetGridSearchParams(),
//////            isLocalMode = me.queryMode === 'local',
//////            store = me.store;

//////        //        console.log('params');
//////        //        console.log(params);

//////        if (isLocalMode === true) {
//////            ///Filter 实例
//////            //////var longNameFilter = new Ext.util.Filter({
//////            //////    filterFn: function (item) {
//////            //////        return item.name.length > 4;
//////            //////    }
//////            //////});
//////            store.clearFilter();
//////            for (; i < params.length; ++i) {
//////                var myXtype = params[i].myXtype,
//////                    myDataIndex = params[i].myDataIndex,
//////                    myHeader = params[i].myHeader,
//////                    myIsFix = params[i].myIsFix,
//////                    myIsFormTo = params[i].myIsFormTo,
//////                    mySearchType = params[i].mySearchType, //1  包含 2.绝对，3.左包含，4.右包含
//////                    myCaseSensitive = params[i].myCaseSensitive,
//////                    myFormValue = params[i].myFormValue,
//////                    myToValue = params[i].myToValue;

//////                if (myIsFormTo === true) {
//////                    if (myFormValue) {
//////                        var filterForm = new Ext.util.Filter({
//////                            matchValue: myFormValue,
//////                            matchField: myDataIndex,
//////                            filterFn: function (item) {
//////                                return item.get(this.matchField) >= this.matchValue;
//////                            }
//////                        });

//////                        store.addFilter(filterForm, false);
//////                    }

//////                    if (myToValue) {
//////                        var filterTo = new Ext.util.Filter({
//////                            matchValue: myToValue,
//////                            matchField: myDataIndex,
//////                            filterFn: function (item) {
//////                                return item.get(this.matchField) <= this.matchValue;
//////                            }
//////                        });
//////                        store.addFilter(filterTo, false);
//////                    }
//////                }
//////                else {

//////                    if (myFormValue) {

//////                        var filterLike = new Ext.util.Filter({
//////                            matchValue: myFormValue.toUpperCase(),
//////                            matchField: myDataIndex,
//////                            filterFn: function (item) {
//////                                var value = item.get(this.matchField),
//////                                        matchValue = this.matchValue;

//////                                if (mySearchType === 2)
//////                                    return this.matchValue === value.toUpperCase();

//////                                var matchIndex = value.toString().toUpperCase().indexOf(matchValue);

//////                                if (mySearchType === 1)
//////                                    return matchIndex >= 0;
//////                                else if (mySearchType === 3)  // 3.左包含
//////                                    return matchIndex === 0;
//////                                else if (mySearchType === 4) {

//////                                    matchIndex = value.toUpperCase().lastIndexOf(matchValue);
//////                                    var textLength = value.length,
//////                                        formValueLength = matchValue.length;

//////                                    //console.log({ matchIndex: matchIndex, textLength: textLength, formValueLength: formValueLength, res: textLength - formValueLength });
//////                                    return matchIndex === textLength - formValueLength;
//////                                }

//////                                return false;
//////                            }
//////                        });

//////                        store.addFilter([filterLike], false);
//////                    }
//////                } // For 
//////            }
//////            store.filter();
//////        } // End if (isLocalMode === true)
//////        else {
//////            //远程查询 
//////            var sqlWhere = ' 1 = 1 ';

//////            for (; i < params.length; ++i) {
//////                var myXtype = params[i].myXtype,
//////                    myDataIndex = params[i].myDataIndex,
//////                    myHeader = params[i].myHeader,
//////                    myIsFix = params[i].myIsFix,
//////                    myIsFormTo = params[i].myIsFormTo,
//////                    mySearchType = params[i].mySearchType, //1  包含 2.绝对，3.左包含，4.右包含
//////                    myCaseSensitive = params[i].myCaseSensitive,
//////                    myFormValue = params[i].myFormValue,
//////                    myToValue = params[i].myToValue;


//////                if (myIsFormTo === true) {
//////                    if (myFormValue) {
//////                        sqlWhere += ' and ' + myDataIndex + ' >= \'' + myFormValue + '\'';
//////                    }

//////                    if (myToValue) {
//////                        sqlWhere += ' and ' + myDataIndex + ' <= \'' + myToValue + '\'';
//////                    }
//////                }
//////                else {
//////                    if (myFormValue) {
//////                        if (mySearchType === 1)
//////                            sqlWhere += ' and ' + myDataIndex + ' like \'%' + myFormValue + '%\'';
//////                        else if (mySearchType === 2)
//////                            sqlWhere += ' and ' + myDataIndex + ' = \'' + myFormValue + '\'';
//////                        else if (mySearchType === 3) // 3.左包含
//////                            sqlWhere += ' and ' + myDataIndex + ' like \'' + myFormValue + '%\'';
//////                        else if (mySearchType === 4) // 3.右包含
//////                            sqlWhere += ' and ' + myDataIndex + ' like \'%' + myFormValue + '\'';
//////                    }
//////                }

//////            } // end for

//////            var param = {}
//////            param['isSunEditor'] = true;
//////            param['multiParams'] = true;
//////            param[me.queryParam] = sqlWhere;

//////            me.lastQuery = param;

//////            if (me.pageSize) {
//////                me.store.loadPage(1, Ext.apply({
//////                    params: me.lastQuery
//////                }, {}));
//////            }
//////            else
//////                me.store.load({ params: param });
//////            //sqlWhere;
//////        }
//////    },

//////    createPagingToolbar: function () {
//////        var me = this;

//////        return Ext.widget('pagingtoolbar', {
//////            id: me.id + '-paging-toolbarInGrid',
//////            pageSize: this.pageSize,
//////            store: me.store,
//////            border: false,
//////            ownerCt: this,
//////            ownerLayout: this.getComponentLayout()
//////        });
//////    },

//////    onGridPageChange: function (toolbar, newPageNum) {
//////        var me = this;
//////        //me.store.loadPage(newPage, { params: me.lastQuery }, {});

//////        me.store.loadPage(newPageNum, Ext.apply({
//////            params: me.lastQuery
//////        }, {}));

//////        return false;
//////    },

//////    onKeyF3OrDblClick: function (e) {
//////        var me = this;
//////        if (me.readOnly === true || me.enableGridSearch === false)
//////            return true;

//////        if (!me.selectWin) {
//////            me.selectWin = Ext.create('Ext.window.Window', {
//////                constrain: true,
//////                icon: '../../Images2/MyIcon/search.png',
//////                layout: 'border',
//////                closeAction: 'hide',
//////                title: (me.searchTitle || '查询选择XX资料'),
//////                //                width: 610,
//////                //                height: 450,
//////                width: (me.winGridWidth || 610),
//////                height: (me.winGridHeight || 400),

//////                //tbar: [{text : ''}],
//////                items: [{
//////                    region: 'west',
//////                    xtype: 'container',
//////                    itemId: 'westPanel',
//////                    width: 200,
//////                    height: 450,
//////                    items: []
//////                },
//////                    {
//////                        region: 'center',
//////                        xtype: 'SunGrid',
//////                        NowUserId: 'ZBC',
//////                        store: me.store,
//////                        gridID: me.xtype,
//////                        pageID: '查询控件SunEditor全局',
//////                        getRowClass: (me.getRowClass || undefined),
//////                        selModel: (me.selModel || undefined),

//////                        getDefaultColumnsSetting: function () {
//////                            if (me.gridSearchCols) {
//////                                //console.log({ abc: '', cols: me.gridSearchCols });
//////                                return me.gridSearchCols;
//////                            }
//////                            else {
//////                                var cols = [];
//////                                cols.push({ text: '值', dataIndex: me.valueField, name: me.valueField });
//////                                cols.push({ text: '名', dataIndex: me.displayField, name: me.displayField });

//////                                return cols;
//////                            }
//////                        },
//////                        bbar: me.pageSize ? me.createPagingToolbar() : undefined,
//////                        listeners: {
//////                            boxready: function () { },
//////                            MyRender: function (vthisPanel, vGrid) {
//////                                me.grid = vGrid;

//////                                me.mon(vGrid, 'itemdblclick', function (vthis, record, item, index, e, eOpts) {
//////                                    me.onSelectWinReturn([record], true);
//////                                });

//////                                me.selectWin.westPanel = me.selectWin.getComponent('westPanel');

//////                                me.mon(vGrid, 'columnmove', function (ct) {
//////                                    me.onGridColPositionChange();
//////                                    me.onGridColChange();
//////                                }, { buffer: 500 });

//////                                me.mon(vGrid, 'columnshow', function (ct) {
//////                                    console.log('columnsho');
//////                                    me.onGridColChange();
//////                                }, { buffer: 1000 });
//////                                me.mon(vGrid, 'columnhide', function (ct) {
//////                                    me.onGridColChange();
//////                                }, { buffer: 1000 });

//////                                me.GridKeyNav = new Ext.util.KeyMap({
//////                                    target: me.selectWin.getEl(), //me.selectWin,
//////                                    binding: [{
//////                                        ctrl: true,
//////                                        key: Ext.EventObject.F, // F键/////NOW
//////                                        fn: function (keyCode, e) {
//////                                            //e.stopEvent();
//////                                            ////e.preventDefault();

//////                                            //me.onKeyF3OrDblClick(e);
//////                                            me.selectWin.down('.button[itemId=F]').handler();
//////                                        }
//////                                    },
//////                                        {
//////                                            ctrl: true,
//////                                            key: Ext.EventObject.S, // S键
//////                                            fn: function (keyCode, e) {
//////                                                e.preventDefault();
//////                                                me.onSelectWinReturn(me.grid.getSelectionModel().getSelection(), true);
//////                                            }
//////                                        }
//////                                    ],
//////                                    scope: me.selectWin.getEl()
//////                                });

//////                                me.GridKeyNav.enable();
//////                                me.onGridColChange();

//////                                if (me.pageSize) {
//////                                    me.gridPagingToolBar = me.selectWin.down('pagingtoolbar'); // Ext.getCmp(this.id + '-paging-toolbarInGrid');
//////                                    if (me.gridPagingToolBar)
//////                                        me.gridPagingToolBar.on('beforechange', me.onGridPageChange, me);
//////                                }
//////                            }
//////                        }
//////                    }
//////                ],
//////                dockedItems: [{
//////                    xtype: 'toolbar',
//////                    dock: 'bottom',
//////                    height: 28,
//////                    style: 'padding: 0px',
//////                    items: [
//////                        '->',
//////                        { xtype: 'button', height: 26, itemId: 'F', margins: '0', text: '查 询 Ctrl + F', handler: function () {
//////                            //alert('查询');
//////                            me.grid.setLoading(true);
//////                            me.onGridSearch();
//////                            if (!me.grid.maskHideTask) {
//////                                me.grid.maskHideTask = Ext.create('Ext.util.DelayedTask', function () {
//////                                    me.grid.loadMask.hide()
//////                                });
//////                            }

//////                            me.grid.maskHideTask.delay(200);
//////                        }
//////                        },
//////                        { xtype: 'button', height: 26, text: '选 择 Ctrl + S',
//////                            handler: function () {
//////                                var recS = me.grid.getSelectionModel().getSelection();
//////                                if (recS.length > 0) {
//////                                    me.onSelectWinReturn(recS, true);
//////                                }
//////                            }
//////                        },
//////                    ]
//////                }],
//////                listeners: {
//////                    show: function () {
//////                        if (me.GridKeyNav)
//////                            me.GridKeyNav.enable();
//////                    },
//////                    hide: function () {
//////                        if (me.GridKeyNav)
//////                            me.GridKeyNav.disable();
//////                    }
//////                }
//////            });
//////        } // End if (me.selectWin) {

//////        me.selectWin.show();
//////    }

//////});



//////Ext.define('SunEditor.Prdt', {
//////    extend: 'SunEditor.Sample',
//////    xtype: 'SunEditor_Prdt',
//////    store: new Ext.data.Store({
//////        model: 'Model_Prdt',
//////        pageSize : 1000,
//////        proxy: {
//////            type: 'ajax',
//////            url: '../ASHX/ashx_SunEditor.ashx?action=GET_PRDT',
//////            reader: {
//////                type: 'json',
//////                root: 'items',
//////                totalProperty: 'total'
//////            }
//////        }
//////    }),
//////    defaultListConfig: {
//////        loadingHeight: 70,
//////        minWidth: 250,
//////        maxHeight: 300,
//////        shadow: 'sides'
//////    },
//////    minChars: 1,
//////    queryMode: 'remote',
//////    searchTitle: '选取物料代号',
//////    triggerAction: 'all',
//////    typeAhead: true,
//////    queryParam: 'prd_no',

//////    valueField: 'prd_no',
//////    displayField: 'prd_name',
//////    focusAndExpand: true,
//////    anyMatch: true,
//////    triggerAction: 'last',
//////    clearFilterOnBlur: false,
//////    enableGridSearch: true,
//////    inGrid: false,
//////    valueGridField: 'prd_no',
//////    displayGridField: 'prd_name',
//////    gridSearchCols:  [
//////        { header: '货品代号', name: 'prd_no', dataIndex: 'prd_no', width: 100 },
//////        { header: '名称', name: 'name', dataIndex: 'name', width : 150 },
//////        { header: '简称', name: 'snm', dataIndex: 'snm', width: 80 },
//////        { header: '规格', name: 'spc', dataIndex: 'spc', width: 80 },
//////        { header: '英文名称', name: 'eng_name', dataIndex: 'eng_name', width: 80 }
//////    ],
//////    celleditingIndex: 0,
//////    tpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '<div class="x-boundlist-item"><table><tr><td style="width:100px">{prd_no}</td><td style="width:120px">{name}</td><td style="width:200px">{spc}</td></tr></table></div>',
//////        '</tpl>'
//////    ),
//////    displayTpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '{prd_no}',
//////        '</tpl>'
//////    ),
//////    initComponent: function () {
//////        var me = this;
//////        me.callParent(arguments);
//////    }
//////});



//////Ext.define('SunEditor.Dept', {
//////    extend: 'SunEditor.Sample',
//////    xtype: 'SunEditor_Dept',
//////    store: new Ext.data.Store({
//////        model: 'Model_Dept'
//////    }),

//////    defaultListConfig: {
//////        loadingHeight: 70,
//////        minWidth: 200,
//////        maxHeight: 300,
//////        shadow: 'sides'
//////    },
//////    minChars: 1,
//////    queryMode: 'local',
//////    //queryMode: 'remote',
//////    searchTitle: '选取员工部门',
//////    typeAhead: true,
//////    queryParam: 'dep_no',

//////    valueField: 'dep_no',
//////    displayField: 'dep_name',
//////    focusAndExpand: false,
//////    anyMatch: true,
//////    triggerAction: 'last',
//////    clearFilterOnBlur: false,
//////    enableGridSearch: true,
//////    inGrid: false,
//////    valueGridField: 'dep_no',
//////    displayGridField: 'dep_name',

//////    celleditingIndex: 0,
//////    tpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '<div class="x-boundlist-item"><table><tr><td style="width:80px">{dep_no}</td><td style="width:150px"> {dep_name}</td></tr></table></div>',
//////        '</tpl>'
//////    ),
//////    displayTpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '{dep_name}',
//////        '</tpl>'
//////    ),
//////    initComponent: function () {
//////        var me = this,
//////            i = 0;
//////        me.orignalStoreSetting = true;

//////        //填充数据1.可从全局变量中抓，如无自己后台查询所有
//////        if (window.parent && window.parent.GlobalVar) {
//////            var GlobalVar = window.parent.GlobalVar,
//////                GlobaStore = GlobalVar.DeptListStore,
//////                cnt = GlobaStore.getCount();

//////            //使用缓存 数据
//////            me.store = Ext.create('Ext.data.Store', {
//////                model: GlobaStore.model
//////            });

//////            for (; i < cnt; ++i) {
//////                me.store.add(GlobaStore.getAt(i).copy());
//////            }


//////            me.orignalStore = Ext.create('Ext.data.Store', {
//////                model: me.store.model
//////            });
//////            for (i = 0; i < cnt; ++i) {
//////                me.orignalStore.add(me.store.getAt(i).copy());
//////            }
//////        }
        
//////        me.callParent(arguments);
//////    }
//////});


/////////***工序部门
//////Ext.define('SunEditor.DeptWp', {
//////    extend: 'SunEditor.Sample',
//////    xtype: 'SunEditor_DeptWp',
//////    store: new Ext.data.Store({
//////        model: 'Model_Dept'
//////    }),

//////    defaultListConfig: {
//////        loadingHeight: 70,
//////        minWidth: 200,
//////        maxHeight: 300,
//////        shadow: 'sides'
//////    },
//////    minChars: 1,
//////    queryMode: 'local',
//////    //queryMode: 'remote',
//////    searchTitle: '选取工序部门',
//////    typeAhead: true,
//////    queryParam: 'dep_no',

//////    valueField: 'dep_no',
//////    displayField: 'name',
//////    focusAndExpand: false,
//////    anyMatch: true,
//////    triggerAction: 'last',
//////    clearFilterOnBlur: false,
//////    enableGridSearch: true,
//////    inGrid: false,
//////    valueGridField: 'dep_no',
//////    displayGridField: 'name',

//////    celleditingIndex: 0,
//////    tpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '<div class="x-boundlist-item"><table><tr><td style="width:80px">{dep_no}</td><td style="width:150px"> {name}</td></tr></table></div>',
//////        '</tpl>'
//////    ),
//////    displayTpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '{name}',
//////        '</tpl>'
//////    ),
//////    initComponent: function () {
//////        var me = this,
//////            i = 0;
//////        me.orignalStoreSetting = true;

//////        //填充数据1.可从全局变量中抓，如无自己后台查询所有
//////        if (window.parent && window.parent.GlobalVar) {
//////            var GlobalVar = window.parent.GlobalVar,
//////                GlobaStore = GlobalVar.DeptWpListStore,
//////                cnt = GlobaStore.getCount();

//////            //使用缓存 数据
//////            me.store = Ext.create('Ext.data.Store', {
//////                model: GlobaStore.model
//////            });

//////            for (; i < cnt; ++i) {
//////                me.store.add(GlobaStore.getAt(i).copy());
//////            }


//////            me.orignalStore = Ext.create('Ext.data.Store', {
//////                model: me.store.model
//////            });
//////            for (i = 0; i < cnt; ++i) {
//////                me.orignalStore.add(me.store.getAt(i).copy());
//////            }
//////        }

//////        me.callParent(arguments);
//////    }
//////});



//////Ext.define('SunEditor.Salm', {
//////    extend: 'SunEditor.Sample',
//////    xtype: 'SunEditor_Salm',

//////    store: new Ext.data.Store({
//////        model: 'Model_Salm'
//////    }),

//////    defaultListConfig: {
//////        loadingHeight: 70,
//////        minWidth: 200,
//////        maxHeight: 300,
//////        shadow: 'sides'
//////    },
//////    minChars: 1,
//////    queryMode: 'local',
//////    searchTitle: '选取员工号',
//////    typeAhead: true,
//////    queryParam: 'sal_no',

//////    valueField: 'sal_no',
//////    displayField: 'sal_name',
    
//////    focusAndExpand: false,
//////    anyMatch: true,
//////    triggerAction: 'last',
//////    clearFilterOnBlur: false,
//////    enableGridSearch: true,
//////    inGrid: false,
//////    valueGridField: 'sal_no',
//////    displayGridField: 'sal_name',

//////    celleditingIndex: 0,
//////    tpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '<div class="x-boundlist-item"><table><tr><td style="width:80px">{sal_no}</td><td style="width:150px"> {sal_name}</td></tr></table></div>',
//////            //'{% if (xindex >= 10) break; %}',
//////        '</tpl>'
//////    ),
//////    displayTpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '{sal_name}',
//////        '</tpl>'
//////    ),

//////    initComponent: function () {
//////        var me = this,
//////            i = 0;

//////        me.orignalStoreSetting = true;

//////        ///填充数据1.可从全局变量中抓
//////        if (window.parent && window.parent.GlobalVar) {
//////            var GlobalVar = window.parent.GlobalVar,
//////                GlobaStore = GlobalVar.SalmStore,
//////                cnt = GlobaStore.getCount();

//////            ///使用缓存 数据
//////            me.store = Ext.create('Ext.data.Store', {
//////                model: GlobaStore.model
//////            });

//////            for (; i < cnt; ++i) {
//////                me.store.add(GlobaStore.getAt(i).copy());
//////            }


//////            me.orignalStore = Ext.create('Ext.data.Store', {
//////                model: me.store.model
//////            });
//////            for (i = 0; i < cnt; ++i) {
//////                me.orignalStore.add(me.store.getAt(i).copy());
//////            }
//////        }
   
//////        me.callParent(arguments);
//////    }
//////});

 
//////Ext.define('SunEditor.Cust', {
//////    extend: 'SunEditor.Sample',
//////    xtype: 'SunEditor_Cust',

//////    defaultListConfig: {
//////        loadingHeight: 70,
//////        minWidth: 200,
//////        maxHeight: 300,
//////        shadow: 'sides'
//////    },
//////    queryDelay: 500,
//////    minChars: 0,
//////    queryMode: 'local',
//////    searchTitle: '选取客户',
//////    triggerAction: 'all',
//////    typeAhead: true,
//////    queryParam: 'cus_no',

//////    valueField: 'cus_no',
//////    displayField: 'name',
//////    focusAndExpand: false,
//////    anyMatch: true,
//////    triggerAction: 'last',
//////    clearFilterOnBlur: false,
//////    enableGridSearch: true,
//////    inGrid: false,
//////    valueGridField: 'cus_no',
//////    displayGridField: 'cus_name',
//////    gridSearchCols: [
//////        { header: '客户代号', name: 'cus_no', dataIndex: 'cus_no', width: 80 },
//////        { header: '名称', name: 'name', dataIndex: 'name', width: 120 },
//////        { header: '简称', name: 'snm', dataIndex: 'snm', width: 80 },
//////        { header: '状态', name: 'state', dataIndex: 'state', renderer: SCom.rdPrdtState }
//////    ],
//////    celleditingIndex: 0,
//////    tpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '<div class="x-boundlist-item"><table><tr><td style="width:50px">{cus_no}</td><td style="width:150px">{name}</td><td style="width:100px">{snm}</td></tr></table></div>',
//////            //'{% if (xindex >= 10) break; %}',
//////        '</tpl>'
//////    ),
//////    displayTpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '{name}',
//////        '</tpl>'
//////    ),
//////    initComponent: function () {

//////        var me = this,
//////            i = 0;
//////         me.orignalStoreSetting = true;

//////        ///填充数据1.可从全局变量中抓
//////        if (window.parent && window.parent.GlobalVar) {
//////            var GlobalVar = window.parent.GlobalVar,
//////                GlobaStore = GlobalVar.CustStore,
//////                cnt = GlobaStore.getCount();

//////            ///使用缓存 数据
//////            me.store = Ext.create('Ext.data.Store', {
//////                model: GlobaStore.model
//////            });

//////            for (; i < cnt; ++i) {
//////                me.store.add(GlobaStore.getAt(i).copy());
//////            }


//////            me.orignalStore = Ext.create('Ext.data.Store', {
//////                model: me.store.model
//////            });
//////            for (i = 0; i < cnt; ++i) {
//////                me.orignalStore.add(me.store.getAt(i).copy());
//////            }
//////        }
   
//////        me.callParent(arguments);

//////    }
//////});


////////*** 订单号
//////Ext.define('SunEditor.MF_SO', {
//////    extend: 'SunEditor.Sample',
//////    xtype: 'SunEditor_MF_SO',

//////    defaultListConfig: {
//////        loadingHeight: 70,
//////        minWidth: 200,
//////        maxHeight: 300,
//////        shadow: 'sides'
//////    },
//////    queryDelay: 500,
//////    minChars: 0,
//////    queryMode: 'remote',
//////    searchTitle: '选取客户订单',
//////    triggerAction: 'query',
//////    typeAhead: true,
//////    queryParam: 'so_no',

//////    valueField: 'so_no',
//////    displayField: 'so_no',
//////    focusAndExpand: false,
//////    anyMatch: true,
//////    triggerAction: 'last',
//////    clearFilterOnBlur: false,
//////    enableGridSearch: false,
//////    inGrid: false,
//////    valueGridField: 'so_no',
//////    displayGridField: 'so_no',
//////    gridSearchCols: [
//////    //        { header: '客户代号', name: 'cus_no', dataIndex: 'cus_no', width: 80 },
//////    //        { header: '名称', name: 'name', dataIndex: 'name', width: 120 },
//////    //        { header: '简称', name: 'snm', dataIndex: 'snm', width: 80 },
//////    //        { header: '状态', name: 'state', dataIndex: 'state', renderer: SCom.rdPrdtState }
//////    ],
//////    celleditingIndex: 0,
//////    tpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '<div class="x-boundlist-item"><table><tr><td style="width:150px">{so_no}</td><td style="width:150px">{cus_name}</td><td style="width:100px">{snm}</td></tr></table></div>',
//////        '</tpl>'
//////    ),
//////    displayTpl: Ext.create('Ext.XTemplate',
//////        '<tpl for=".">',
//////            '{so_no}',
//////        '</tpl>'
//////    ),
//////    initComponent: function () {

//////        var me = this,
//////            i = 0;
//////        me.orignalStoreSetting = true;
//////        me.store = Ext.create('Ext.data.Store', {
//////            model: 'Model_MF_SO',
//////            proxy: {
//////                 type: 'ajax',
//////                 url: '../ASHX/MF_SO.ashx?action=TableSearch',
//////                 reader: {
//////                     type: 'json',
//////                     root: 'items',
//////                     totalProperty: 'total'
//////                 }
//////             }
//////        });


//////        me.callParent(arguments);
//////    }
//////});



 
 