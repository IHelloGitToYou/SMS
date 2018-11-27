

Ext.onReady(function () {

    // CbGrid 类　Combo 下拉出一个Grid  超类
    // Xtype : CbGrid
    Ext.define('TConfig.CbGrid', {
        extend: 'Ext.form.field.Picker',
        requires: [
            'Ext.grid.Panel'
        ],
        xtype: 'CbGrid',
        matchFieldWidth: false,
        triggerAction: 'query',
        enableKeyEvents: true,
        columnWidth: 810,

        HiddenValue: '',
        RawValue: '',
        RecIndex: -1,
        MyValueField: 'p_cus_no',
        MyDisplayField: 'name',
        MySqlUrl: '../../Handler2/TCRM/ashx_CRM_PCust.ashx',
        // 模糊查询条件
        MySqlStructFormat: " (p_cus_no like '%{0}%' or name like '%{0}%' or product like '%{0}%' or advantage like '%{0}%') ",
        MyAddtionalParam: '',  //附加参数
        MyActionName: 'GetData',
        MyIsGridCell: false,
        //            // 重写提交方法
        getSubmitData: function () {
            var obj = {};
            obj[this.name] = this.HiddenValue;
            return obj;
        },
        onUpArrow: function (e) {
            e.preventDefault();
            e.stopEvent();

            var picker = this.getPicker();
            this.expand();
            var grid = picker.grid;

            if (!grid || !grid.view)
                return false;

            var gStore = grid.getView().getStore();

            if (this.RecIndex > 0)
                --this.RecIndex;

            var sel = grid.getView().getStore().getAt(this.RecIndex);
            grid.getView().highlightItem(grid.getView().getNode(sel));
        },
        onDownArrow: function () {

            this.callParent(arguments);
            if (this.isExpanded == false) {
                //this.getPicker().focus();
                return false;
            }

            var picker = this.getPicker();
            this.expand();
            var grid = picker.grid;

            if (!grid || !grid.view)
                return false;

            var gStore = grid.getView().getStore(),
                    gStoreCnt = gStore.getCount();

            // console.log('this.RecIndex   onDownArrow_  ' + this.RecIndex);

            var sel = gStore.getAt(this.RecIndex);
            grid.getView().highlightItem(grid.getView().getNode(sel));

            if ((this.RecIndex < gStoreCnt - 1) && this.RecIndex >= 0) {
                ++this.RecIndex;
            }
        },
        onSelect: function (e) {
            var me = this;
            me.SetValueState = true;

            var picker = me.getPicker();
            var grid = picker.grid;
            var gStore = grid.getView().getStore();

            if (me.RecIndex >= 0 && me.RecIndex <= gStore.getCount() - 1) {
                //me.onItemdblClick(grid, gStore.getAt(me.RecIndex));
                //me.collapse();
                var record = gStore.getAt(me.RecIndex);

                me.HiddenValue = record.get(me.MyValueField);
                me.RawValue = record.get(me.MyDisplayField);

                //me.GridRowChangeState = true;    //避免再次查询
                me.setValue(me.HiddenValue);
                //me.fireEvent('MySelected', me.HiddenValue, me.RawValue);

                picker.hide();
            }
        },
        initEvents: function () {
            var me = this;
            me.callParent();

            me.keyNav = new Ext.util.KeyNav(me.inputEl, {
                up: me.onUpArrow,
                down: me.onDownArrow,
                enter: me.onSelect,
                //                    esc: {
                //                        handler: me.onEsc,
                //                        scope: me,
                //                        defaultEventAction: false
                //                    },
                scope: me,
                forceKeyDown: true
            });

            if (!me.editable) {
                me.mon(me.inputEl, 'click', me.onTriggerClick, me);
            }

            if (Ext.isGecko) {
                me.inputEl.dom.setAttribute('autocomplete', 'off');
            }


//            me.mon(me.inputEl, 'enter', function () { alert('enter'); });

        },
        initComponent: function () {
            this.callParent();

            var me = this;
            me.picker = me.getPicker();
            me.grid = me.picker.grid;
            this.mon(this, 'change', function (txt, newValue, oldValue, eOpts) {
                me.onChangeVV(txt, newValue, oldValue, eOpts);
            }, me, {
                // buffer: (me.buffer || 200)
            }
            );

            this.mon(this, 'keyDown', function () {
                this.SetValueState = false;
            });


            this.mon(this, 'specialkey', function (field, e) {

            });

            this.mon(this, 'focus', function (field, e) {
                var me = this;
                if (me.MyIsGridCell == false) {
                    me.SetValueState = true;

                    me.setValue(me.HiddenValue);
                    me.expand();
                }
                else {
                    // 应被Grid栏位控件修改
                }
            });

            this.mon(this, 'blur', function (field, e) {
                var me = this;

                if (me.MyIsGridCell == false) {
                    me.SetValueState = true;
                    me.setValue(me.RawValue);
                }
            });

        },
        // MySelected 事件
        createPicker: function () {
            var me = this,
                picker,
                pickerCfg = Ext.apply({
                    xtype: 'gird',
                    getDefaultColumnsSetting: function () {
                        return [
                            { header: '竟争对手号', name: 'p_cus_no', dataIndex: 'p_cus_no' },
                            { header: '名称', name: 'name', dataIndex: 'name' },
                            { header: '主要产品', name: 'naproductme', dataIndex: 'product' },
                            { header: '竟争优势', name: 'advantage', dataIndex: 'advantage' }
                        ]
                    },
                    pickerField: me,
                    pageID: 'Page_CrmPCust_CBGrid公共控件',
                    height: 200,
                    width: 400,
                    floating: true,
                    hidden: true,
                    //                    store: me.store,
                    //                    displayField: me.displayField,
                    focusOnToFront: false,
                    pageSize: me.pageSize,
                    tpl: me.tpl
                }, me.listConfig, me.defaultListConfig);

            picker = me.picker = Ext.widget(pickerCfg);
            //picker.doLayout();

            if (me.pageSize) {
                picker.pagingToolbar.on('beforechange', me.onPageChange, me);
            }

            me.mon(picker, {
                MyRender: function () {
                    me.mon(picker.grid, {
                        itemdblclick: me.onItemdblClick,
                        itemkeydown: me.onItemkeyClick,
                        scope: me
                    });
                },
                //itemkeydown: me.onItemkeyClick,
                scope: me
            });

            return picker;
        },
        reset: function () {
            var me = this;
            me.SetValueState = true;

            me.HiddenValue = '';
            me.RawValue = '';
            me.setValue('');
            this.callParent();
        },
        MyGetValue: function () {
            return this.HiddenValue;
        },
        MySetValue: function (no, name, showVal) {
            var me = this;
            me.HiddenValue = no;
            me.RawValue = name;

            //alert(  (showVal || true) );

            me.setValue((showVal || true) == true ? me.HiddenValue : me.RawValue);
        },
        onItemdblClick: function (grid, record, item, index, e, eOpts) {
            var me = this;
            // 以防再次跳出来，选择
            me.SetValueState = true;

            me.HiddenValue = record.get(me.MyValueField);
            me.RawValue = record.get(me.MyDisplayField);
            me.setValue(me.HiddenValue);

            me.focus();
            console.log(' onItemdblClick in class ');

            me.fireEvent('MySelected', me.HiddenValue, me.RawValue);
            me.collapse();
        },
        onItemkeyClick: function (grid, record, item, index, e, eOpts) {
            console.log('onItemkeyClick');
            console.log(e);

            if (e.getKey() == e.ENTER) {
                this.onItemdblClick(grid, record, item, index, e, eOpts);
            }
            if (e.getKey() == e.ESC) {
                this.onItemdblClick(grid, record, item, index, e, eOpts);
            }
        },
        onCreateSqlWhere: function (param_str) {
            var me = this;

            // 分拆字符串，生成SQL　条件                
            var Keys = SCom.stripString(param_str).split(' '),
                    key = '',
                    sqlWhere = ' 1=1 ';

            var isFirstValidKey = true;

            for (var i = 0; i < Keys.length; ++i) {
                key = Keys[i].trim();
                if (key && key != '') {
                    sqlWhere += isFirstValidKey === true ? " and " : " or "
                    sqlWhere += Ext.String.format(me.MySqlStructFormat, key);

                    isFirstValidKey = false;
                }
            }

            me.lastsqlWhere = (me.lastsqlWhere || '');
            // 相同的参数，不再后台抓数据了
            if (me.lastsqlWhere == sqlWhere)
                return 'SAME';
            else
                me.lastsqlWhere = sqlWhere;

            return sqlWhere;
        },
        onChangeVV: function (txt, newValue, oldValue, eOpts) {
            var me = this;

            //Grid 中换行而已, 不需求执行变更操作
            if (me.GridRowChangeState == true) {
                me.GridRowChangeState = false;
                return false;
            }

            if (me.SetValueState == true) {
                me.SetValueState = false;
                return false;
            }

            if (newValue == oldValue)
                return false;

            if (newValue == '') {
                me.reset();
            }

            var v = me.getValue();
            if (!me.getPicker().grid)
                return false;

            var _S = me.getPicker().grid.getView().getStore();
            var sqlWhere = me.onCreateSqlWhere(newValue);

            // 样同sql条件，不必再查询了
            if (sqlWhere == 'SAME')
                return false;
            // 附上 附加参数
            if (me.MyAddtionalParam.trim() != '')
                sqlWhere += ' and ' + me.MyAddtionalParam;
            // 清空查询记录, 以防再输入同样不会触发查询
            me.lastsqlWhere = '';

            _S.load({
                url: me.MySqlUrl,
                params: { action: me.MyActionName, sqlWhere: sqlWhere },
                callback: function () {
                    // 标识当前第一行
                    me.RecIndex = 0;
                    me.expand();
                    me.picker.show();
                    me.OnSearch();
                }
            });
        },
        listeners: {


        },

        //////////////////////////　高度匹配字体
        ///////
        tagsRe: /<[^>]*>/gm,
        // DEL ASCII code
        tagsProtect: '\x0f',
        // detects regexp reserved word
        regExpProtect: /\\|\/|\+|\\|\.|\[|\]|\{|\}|\?|\$|\*|\^|\|/gm,

        OnSearch: function () {
            var F = this;

            var me = grid = this.getPicker().grid;
            me.store = me.getView().getStore();

            var sel = me.store.getAt(this.RecIndex);
            grid.getView().highlightItem(grid.getView().getNode(sel));

            var values = SCom.stripString(this.getValue()).split(' ');

            for (var i = 0; i < values.length; ++i) {
                me.searchValue = values[i];

                //me.indexes = [];
                //// console.log(me.store.getCount());
                if (me.searchValue !== null && me.searchValue.trim() !== ''
                    && me.searchValue.trim() !== '<' && me.searchValue.trim() !== '>'
                    && me.searchValue.trim().toLowerCase() !== 'b'
                    ) {

                    me.searchRegExp = new RegExp(me.searchValue.trim(), 'gi');
                    //me.searchRegExp = new RegExp("<b[^<]*>\\w+" + me.searchValue + "\\w+<\/b>", "gi");
                    // // console.log(me.searchRegExp);


                    me.store.each(function (record, idx) {
                        var td = Ext.fly(me.view.getNode(idx)).down('td'),
                                 cell, matches, cellHTML;

                        while (td) {
                            cell = td.down('.x-grid-cell-inner');
                            matches = cell.dom.innerHTML.match(F.tagsRe);
                            cellHTML = cell.dom.innerHTML.replace(me.tagsRe, F.tagsProtect);

                            //// console.log(cellHTML);

                            // populate indexes array, set currentIndex, and replace wrap matched string in a span
                            cellHTML = cellHTML.replace(me.searchRegExp, function (m) {
                                //count += 1;
                                //                                if (Ext.Array.indexOf(me.indexes, idx) === -1) {
                                //                                    //me.indexes.push(idx);
                                //                                }
                                if (me.currentIndex === null) {
                                    me.currentIndex = idx;
                                }
                                return '<b>' + m + '</b>';
                            });
                            // restore protected tags
                            Ext.each(matches, function (match) {
                                cellHTML = cellHTML.replace(F.tagsProtect, match);
                            });
                            // update cell html
                            cell.dom.innerHTML = cellHTML;
                            td = td.next();
                        }
                    }, me);
                }
            } // Ext.Array.each


        }
    });


    Ext.define('CbGrid_Cust.class', {
        extend: 'TConfig.CbGrid',
        requires: [
            'Ext.grid.Panel', 'CustSet.CustGrid'
        ],
        xtype: 'CbGrid_Cust',
        matchFieldWidth: false,
        enableKeyEvents: true,
        columnWidth: 410,
        HiddenValue: '',
        RawValue: '',
        MyValueField: 'cus_no',
        MyDisplayField: 'snm',
        MySqlUrl: '../ASHX/Cust.ashx',
        MySqlStructFormat: " (cus_no like '%{0}%' or name like '%{0}%' or snm like '%{0}%') ",

        // MySelected 事件
        createPicker: function () {
            var me = this,
            picker,
            pickerCfg = Ext.apply({
                xtype: 'CustGrid',
                //height : 500,
                getDefaultColumnsSetting: function () {
                    return [
                     { header: '客户代号', name: 'cus_no', dataIndex: 'cus_no' },
                     { header: '名称', name: 'name', dataIndex: 'name', flex: 1 },
                     { header: '简称', name: 'snm', dataIndex: 'snm' } 
                    ]
                },
                pickerField: me,
                pageID: 'Page_ComboGrid公共控件',
                myMinHeight: 300,
                width: 400,
                floating: true,
                hidden: true,
                //                    store: me.store,
                //                    displayField: me.displayField,
                focusOnToFront: false,
                pageSize: me.pageSize,
                tpl: me.tpl
            }, me.listConfig, me.defaultListConfig);

            picker = me.picker = Ext.widget(pickerCfg);

            //picker.doLayout();

            if (me.pageSize) {
                picker.pagingToolbar.on('beforechange', me.onPageChange, me);
            }

            me.mon(picker, {
                MyRender: function () {
                    me.mon(picker.grid, {
                        itemdblclick: me.onItemdblClick,
                        itemkeydown: me.onItemkeyClick,
                        scope: me
                    });
                },
                scope: me
            });


            //        me.mon(picker, {
            //            itemclick: me.onItemClick,
            //            refresh: me.onListRefresh,
            //            scope: me
            //        });

            //        me.mon(picker.getSelectionModel(), {
            //            beforeselect: me.onBeforeSelect,
            //            beforedeselect: me.onBeforeDeselect,
            //            selectionchange: me.onListSelectionChange,
            //            scope: me
            //        });
            return picker;
        }
    });

    Ext.define('CbGrid_Prdt.class', {
        extend: 'CbGrid_Cust.class',
        requires: [
            'Ext.grid.Panel', 'CustSet.CustGrid', 'CbGrid_Cust.class', 'PrdtSet.PrdtGrid'
        ],
        xtype: 'CbGrid_Prdt',
        MyValueField: 'prd_no',
        MyDisplayField: 'name',
        MySqlUrl: '../ASHX/Prdt.ashx',
        MySqlStructFormat: " 	(prd_no like '%{0}%' or name like '%{0}%' or snm like '%{0}%' or spc like '%{0}%') ",

        createPicker: function () {
            var me = this,
            picker,
            pickerCfg = Ext.apply({
                xtype: 'PrdtGrid',
                getDefaultColumnsSetting: function () {
                    return [
                         { header: '货品代号', name: 'prd_no', dataIndex: 'prd_no' },
                         { header: '名称', name: 'name', dataIndex: 'name', flex: 1 },
                         { header: '简称', name: 'snm', dataIndex: 'snm' },
                         { header: '规格', name: 'spc', dataIndex: 'spc' },
                         { header: '英文名称', name: 'eng_name', dataIndex: 'eng_name' }
                    ]
                },
                pickerField: me,
                pageID: 'Page_ComboPrdtrGrid公共控件',
                myMinHeight: 200,
                width: 400,
                floating: true,
                hidden: true,
                //                    store: me.store,
                //                    displayField: me.displayField,
                focusOnToFront: false,
                pageSize: me.pageSize,
                tpl: me.tpl
            }, me.listConfig, me.defaultListConfig);

            picker = me.picker = Ext.widget(pickerCfg);
            if (me.pageSize) {
                picker.pagingToolbar.on('beforechange', me.onPageChange, me);
            }

            me.mon(picker, {
                MyRender: function () {
                    me.mon(picker.grid, {
                        itemdblclick: me.onItemdblClick,
                        itemkeydown: me.onItemkeyClick,
                        scope: me
                    });

                    picker.doLayout();
                },
                scope: me
            });

            return picker;
        }
    });

    Ext.define('CbGrid_Salm.class', {
        extend: 'CbGrid_Cust.class',
        requires: [
            'Ext.grid.Panel', 'CustSet.CustGrid', 'CbGrid_Cust.class', 'SalmSet.SalmGrid'
        ],
        xtype: 'CbGrid_Salm',
        MyValueField: 'user_no',
        MyDisplayField: 'name',
        MySqlUrl: '../ASHX/Salm.ashx',
        MySqlStructFormat: " 	(user_no like '%{0}%' or name like '%{0}%' ) ",

        createPicker: function () {
            var me = this,
            picker,
            pickerCfg = Ext.apply({
                xtype: 'SalmGrid',
                getDefaultColumnsSetting: function () {
                    return [
                        { header: '人员代号', name: 'user_no', dataIndex: 'user_no' },
                        { header: '名称', name: 'name', dataIndex: 'name', flex: 1 }
                    ]
                },
                pickerField: me,
                pageID: 'Page_ComboSalmGrid公共控件',
                myMinHeight: 200,
                width: 400,
                floating: true,
                hidden: true,
                //                    store: me.store,
                //                    displayField: me.displayField,
                focusOnToFront: false,
                pageSize: me.pageSize,
                tpl: me.tpl
            }, me.listConfig, me.defaultListConfig);

            picker = me.picker = Ext.widget(pickerCfg);
            if (me.pageSize) {
                picker.pagingToolbar.on('beforechange', me.onPageChange, me);
            }

            me.mon(picker, {
                MyRender: function () {
                    me.mon(picker.grid, {
                        itemdblclick: me.onItemdblClick,
                        itemkeydown: me.onItemkeyClick,
                        scope: me
                    });

                    picker.doLayout();
                },
                scope: me
            });

            return picker;
        }
    });

    Ext.define('DeptSet.DeptGrid', {
        extend: 'SunGridClass',
        xtype: 'DeptGrid',

        region: 'center',
        flex: 1,
        gridID: 'Top1',
        pageID: 'Page_Sys_Dept_aspx',
        CompanyCDNO: 'C1002',
        NowUserId: GlobalVar.NowUserId,

        autoSync: true,
        cellEditing: null,
        getDefaultColumnsSetting: function () {
            return [
                { header: '部门代号', name: 'dep_no', dataIndex: 'dep_no' },
                { header: '名称', name: 'name', dataIndex: 'name', flex: 1 }
            ]
        },
        initComponent: function () {
            var Fme = this;

            Fme.store = Ext.create('Ext.data.Store', {
                model: 'Model_TreeDept',
                folderSort: true,
                proxy: {
                    type: 'ajax',
                    url: '../ASHX/Dept.ashx',
                    reader: {
                        type: 'json',
                        root: 'items',
                        totalProperty: 'total'
                    }
                }
            });
            Ext.apply(this, {
                bbar: [{
                    xtype: 'pagingtoolbar',
                    store: Fme.store,   // same store GridPanel is using
                    dock: 'bottom',
                    displayInfo: true
                }]
            });
            this.callParent();
        } // initComponent

    });

    Ext.define('CbGrid_Dept.class', {
        extend: 'CbGrid_Cust.class',
        requires: [
                'Ext.grid.Panel', 'CustSet.CustGrid', 'CbGrid_Cust.class', 'DeptSet.DeptGrid'
            ],
        xtype: 'CbGrid_Dept',
        MyValueField: 'dep_no',
        MyDisplayField: 'name',
        MySqlUrl: '../ASHX/Dept.ashx',
        MySqlStructFormat: " 	(dep_no like '%{0}%' or name like '%{0}%' ) ",

        createPicker: function () {
            var me = this,
                picker,
                pickerCfg = Ext.apply({
                    xtype: 'DeptGrid',
                    pickerField: me,
                    pageID: 'Page_Sys_Dept_aspx公共控件',
                    myMinHeight: 200,
                    width: 400,
                    floating: true,
                    hidden: true,
                    //                    store: me.store,
                    //                    displayField: me.displayField,
                    focusOnToFront: false,
                    pageSize: me.pageSize,
                    tpl: me.tpl
                }, me.listConfig, me.defaultListConfig);

            picker = me.picker = Ext.widget(pickerCfg);
            if (me.pageSize) {
                picker.pagingToolbar.on('beforechange', me.onPageChange, me);
            }

            me.mon(picker, {
                MyRender: function () {
                    me.mon(picker.grid, {
                        itemdblclick: me.onItemdblClick,
                        itemkeydown: me.onItemkeyClick,
                        scope: me
                    });

                    picker.doLayout();
                },
                scope: me
            });

            return picker;
        }
    });


    Ext.define('CbGrid_DeptWp.class', {
        extend: 'CbGrid_Cust.class',
        requires: [
                'Ext.grid.Panel', 'CustSet.CustGrid', 'CbGrid_Cust.class', 'DeptSet.DeptGrid'
            ],
        xtype: 'CbGrid_DeptWp',
        MyValueField: 'dep_no',
        MyDisplayField: 'name',
        MySqlUrl: '../ASHX/DeptWp.ashx',
        MySqlStructFormat: " 	(dep_no like '%{0}%' or name like '%{0}%' ) ",

        createPicker: function () {
            var me = this,
                picker,
                pickerCfg = Ext.apply({
                    xtype: 'DeptGrid',
                    pickerField: me,
                    pageID: 'Page_Sys_DeptWp_aspx公共控件',
                    myMinHeight: 200,
                    width: 400,
                    floating: true,
                    hidden: true,
                    //                    store: me.store,
                    //                    displayField: me.displayField,
                    focusOnToFront: false,
                    pageSize: me.pageSize,
                    tpl: me.tpl
                }, me.listConfig, me.defaultListConfig);

            picker = me.picker = Ext.widget(pickerCfg);
            if (me.pageSize) {
                picker.pagingToolbar.on('beforechange', me.onPageChange, me);
            }

            me.mon(picker, {
                MyRender: function () {
                    me.mon(picker.grid, {
                        itemdblclick: me.onItemdblClick,
                        itemkeydown: me.onItemkeyClick,
                        scope: me
                    });

                    picker.doLayout();
                },
                scope: me
            });

            return picker;
        }
    });




    Ext.define('CbGrid_MFSO.class', {
        extend: 'CbGrid_Cust.class',
        requires: [
            'Ext.grid.Panel', 'CustSet.CustGrid', 'CbGrid_Cust.class', 'DeptSet.DeptGrid'
        ],
        xtype: 'CbGrid_MFSO',
        MyValueField: 'so_no',
        MyDisplayField: 'so_no',
        MySqlUrl: '../ASHX/MF_SO.ashx',
        MySqlStructFormat: " 	(so_no like '%{0}%' or cus_no like '%{0}%' ) ",
        GetHeadStore: function () {
            return Ext.create('Ext.data.Store', {
                model: 'Search_Model_TF_SO',
                autoLoad: false,
                proxy: {
                    type: 'ajax',
                    url: '../ASHX/MF_SO.ashx',
                    reader: {
                        type: 'json',
                        root: 'items',
                        totalProperty: 'total'
                    }
                }
            });
        },
        createPicker: function () {
            var me = this,
                picker,
                pickerCfg = Ext.apply({


                    xtype: 'SunGrid',
                    //icon:'../JS/resources/MyIcon/icon_save_cg.png',
                    region: 'center',
                    gridID: 'MF_SO_aspx',
                    pageID: '速查控件',
                    CompanyCDNO: 'C1002',
                    store: me.GetHeadStore(),
                    myMinHeight: 0,
                    SaveMode: '1',
                    getDefaultColumnsSetting: function () {
                        return [
                                { header: '订单号', dataIndex: 'so_no', name: 'so_no' },
                                { header: '客户代号', name: 'cus_no', dataIndex: 'cus_no' },
                                { header: '订单日期', name: 'so_dd', dataIndex: 'so_dd', xtype: 'datecolumn', format: 'Y/m/d', tdCls: 'disabled_column' }
                            ];
                    },



                    //xtype: 'DeptGrid',
                    pickerField: me,
                    pageID: 'Page_Sys_Dept_aspx公共控件',
                    height: 200,
                    width: 400,
                    floating: true,
                    hidden: true,
                    //                    store: me.store,
                    //                    displayField: me.displayField,
                    focusOnToFront: false,
                    pageSize: me.pageSize,
                    tpl: me.tpl
                }, me.listConfig, me.defaultListConfig);

            picker = me.picker = Ext.widget(pickerCfg);
            if (me.pageSize) {
                picker.pagingToolbar.on('beforechange', me.onPageChange, me);
            }

            me.mon(picker, {
                MyRender: function () {
                    me.mon(picker.grid, {
                        itemdblclick: me.onItemdblClick,
                        itemkeydown: me.onItemkeyClick,
                        scope: me
                    });

                    picker.doLayout();
                },
                scope: me
            });

            return picker;
        }
    });


    //        Ext.create('CbGrid_Cust.class', { renderTo: Ext.getBody() });
    //        Ext.create('CbGrid_Prdt.class', { renderTo: Ext.getBody() });
    //        Ext.create('CbGrid_Salm.class', { renderTo: Ext.getBody() });
    //        Ext.create('CbGrid_Dept.class', { renderTo: Ext.getBody() });



    //    var a = '<b style="color:Yellow;" >ABCD</b> Im singing while you re dancing. <b style="color:Yellow;" >EFG</b>';

    //    var searchRegExp = /(?=ing\b)/;

    //    ///(?<=<(\w+)>).*(?<=<(\/\1)>)/

    //    //var searchRegExp = /<b[^<]*>(\w+)<\/b>/g;

    //    a = a.replace(searchRegExp, function(m) {
    //        return '<span>' + m + '</span>';
    //    });
    //    alert(a);

});
 