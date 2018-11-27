/*
2016.9.25 Combobox控件.
/////1.仅支持Local
////2.支持多字段匹配
*/
Ext.define('MultiSearchComboBox', {
    extend: 'Ext.form.ComboBox',
    xtype: 'CB_MultiSearch',
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<table class="x-boundlist-item"><tr><td width="100">{dep_no}</td><td width="100">{name}</td></tr></table>',
        '</tpl>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{name}',
        '</tpl>'
    ),
    queryMode: 'local',
    SearchFields: [],
    // 取查询字段
    GetSearchFields: function () {
        var me = this;
        if (me.SearchFields.length <= 0) {
            var arr = [];
            arr.push(me.valueField);
            if (me.inGrid != true)
                arr.push(me.displayField);
            return arr;
        }
        else
            return me.SearchFields;
    },
    GetLocalFilter: function () {
        var me = this;
        if (!me.queryFilter) {
            alert("me.queryFilter 不存在,请修改Code");
            return;
        }
        me.queryFilter.SearchFields = me.GetSearchFields();
        me.queryFilter.CaseSensitive = me.caseSensitive;

        var fn = function (PRecord) {
            var flat = false,
                searchFields = this.SearchFields, //this 代表me.queryFilter
                caseSensitive = this.CaseSensitive;

            var searchTxt = me.lastQuery ? me.lastQuery : '';
            searchTxt = searchTxt || '';
            searchTxt = caseSensitive ? searchTxt : searchTxt.toUpperCase();
            //空白代表所有
            if (!searchTxt)
                return true;

            for (var i = 0; i < searchFields.length; ++i) {
                var fieldVale = PRecord.get(searchFields[i]);
                if (fieldVale == null)
                    continue;

                if (caseSensitive === false)
                    fieldVale = fieldVale.toUpperCase();
                if (fieldVale.indexOf(searchTxt) >= 0) {
                    flat = true;
                    break;
                }
            }
            return flat;
        }
        return fn;
    },
    doLocalQuery: function (queryPlan) {
        var me = this,
            queryString = queryPlan.query;
        if (!me.queryFilter) {
            me.queryFilter = new Ext.util.Filter({
                id: me.id + '-query-filter',
                anyMatch: me.anyMatch,
                matchFields: me.matchFields,
                caseSensitive: me.caseSensitive
                //root: 'data',
                //property: me.displayField
                //filterFn: function () { return true;}
            });

            me.queryFilter.setFilterFn(me.GetLocalFilter());
            me.store.addFilter(me.queryFilter, false);
        }

        if (queryString || !queryPlan.forceAll) {
            me.queryFilter.disabled = false;
            me.queryFilter.setValue(me.enableRegEx ? new RegExp(queryString) : queryString);
        }
        else {
            me.queryFilter.disabled = true;
        }

        me.store.filter();
        if (me.store.getCount()) {
            me.expand();
        } else {
            me.collapse();
        }

        me.afterQuery(queryPlan);
    },
    GlobalVarStore: null,
    CopyGlobalVarStore: function () {
        var me = this,
            GlobalVarStore = me.GlobalVarStore;
        //GlobaStore = GlobalVar.DeptListStore,
        if (me.queryMode === 'local') {
            if (!me.store) {
                me.store = Ext.create('Ext.data.Store', {
                    model: GlobalVarStore.model,
                    data: []
                });
            }
            
            var i = 0,
                cnt = GlobalVarStore.getCount(),
                datas = [];
            for (var i = 0; i < cnt; ++i) {
                var copyRec = GlobalVarStore.getAt(i).copy();
                Ext.data.Model.id(copyRec);
                datas.push(copyRec.data);
            }

            me.store.add(datas);
        }
    },
    proxyUrl : commonVar.urlCDStr +'ASHX/ashx_SunEditor.ashx?action=GET_PRDT',
    initComponent: function () {
        var me = this;
        if (me.inGrid === true) {
            me.displayField = me.valueField;
        }

        if (me.queryMode == 'local') {
            me.CopyGlobalVarStore();
        }
        else {
            //alert('控件不支持运行加载数据!');
            //return;
            var GlobalVarStore = me.GlobalVarStore
            if (!me.store && (GlobalVarStore || me.storeModel)) {
                me.store = Ext.create('Ext.data.Store', {
                    model:  me.storeModel || GlobalVarStore.model,
                    pageSize: me.pageSize || 1000000,
                    proxy: {
                        type: 'ajax',
                        url: me.proxyUrl,
                        reader: {
                            type: 'json'
                        }
                    }
                });

                //alert('me.store.pageSize' + me.pageSize);
            }
        }
        me.callParent(arguments);
    }
});

Ext.define('MultiSearchComboBox.Dept', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_Dept',
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<table  class="x-boundlist"><tr class="x-boundlist-item"><td width="100">{dep_no}</td><td width="100">{name}</td></tr></table>',
        '</tpl>'
    ),
    valueField: 'dep_no',
    displayField: 'name',
    matchFieldWidth: false,
    width: 210,
    
    localStoreSortByWorkerDeptNo: '',    //可以指定加载的部门
    fnSortLocalStoreByWorkerDeptNo: function (dep_no) {
        var me = this;
        me.localStoreSortByWorkerDeptNo = dep_no;
        if (dep_no == '' || dep_no == '000000') {
            var allCopy = [];
            for (var i = 0; i < GlobalVar.DeptListStore.getCount() ; i++) {
                var rec1 = GlobalVar.DeptListStore.getAt(i);
                allCopy.push(rec1.getData());
            }
            me.store.removeAll();
            me.store.add(allCopy);
            return;
        }
        var subDepts = commonVar.GetSubHierarchicalRecord(GlobalVar.DeptListStore, 'up_dep_no', 'dep_no', dep_no);
        //console.log({ subDepts: subDepts });
        var rec = GlobalVar.DeptListStore.findRecord('dep_no', dep_no);
        
        if (subDepts.length > 0) {
            var allCopy = [];
            for (var i = 0; i < subDepts.length; i++) {
                allCopy.push(subDepts[i].getData());
            }
            me.store.removeAll();
            me.store.add(rec.getData());
            me.store.add(allCopy);
        }
        else {
            me.store.removeAll();
            me.store.add(rec.getData());
        }
    },
    initComponent: function () {
        var me = this;
        me.GlobalVarStore = GlobalVar.DeptListStore;
        me.callParent(arguments);

        if (me.queryMode == 'local') {
            if (me.localStoreSortByWorkerDeptNo && me.localStoreSortByWorkerDeptNo != '000000') {
                me.fnSortLocalStoreByWorkerDeptNo(me.localStoreSortByWorkerDeptNo);
            }
        }
    }
});

Ext.define('MultiSearchComboBox.DeptWP', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_DeptWP',
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<table class="x-boundlist"><tr class="x-boundlist-item"><td width="100">{dep_no}</td><td width="100">{name}</td></tr></table>',
        '</tpl>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{name}',
        '</tpl>'
    ),
    valueField: 'dep_no',
    displayField: 'name',
    
    initComponent: function () {
        var me = this;
        me.GlobalVarStore = GlobalVar.DeptWpListStore;
        me.callParent(arguments);
    }
});

Ext.define('MultiSearchComboBox.Salm', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_Salm',
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<table class="x-boundlist"><tr class="x-boundlist-item"><td width="100">{user_no}</td><td width="100">{name}</td></tr></table>',
        '</tpl>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{name}',
        '</tpl>'
    ),
    valueField: 'user_no',
    displayField: 'name',
    localStoreSortByWorkerDeptNo: '',    //可以指定加载的员工
    loadOutSalm: true,                   //加载离职员工
    fnSortLocalStoreByWorkerDeptNo: function (dep_no) {
        var me = this;
        me.localStoreSortByWorkerDeptNo = dep_no;
        if (dep_no == '' || dep_no == '000000') {
            var allCopy = [];
            for (var i = 0; i < GlobalVar.SalmStore.getCount() ; i++) {
                var rec1 = GlobalVar.SalmStore.getAt(i);

                if (me.fnNeedLoad(rec1.getData())) {
                    allCopy.push(rec1.getData());
                }
            }

            me.store.removeAll();
            me.store.add(allCopy);
            return;
        }

        var subDepts = commonVar.GetSubHierarchicalRecord(GlobalVar.DeptListStore, 'up_dep_no', 'dep_no', dep_no);
        //console.log(subDepts);
        var hitedIndexs = [];
        for (var i = -1; i < subDepts.length; i++) {
            var _depNo = '';
            if (i == -1) {
                _depNo = dep_no;
            }
            else {
                _depNo = [subDepts[i].get('dep_no')];
            }
             
            GlobalVar.SalmStore.findBy(function (qRec) {
                // 2017 9 26过滤离职员工
                if (qRec.get('dep_no') == _depNo && me.fnNeedLoad(qRec.getData())) {
                    hitedIndexs.push(GlobalVar.SalmStore.indexOf(qRec));
                }
            });
        }

        var hitedSalm = [],
            otherSalm = [];
        for (var i = 0; i < GlobalVar.SalmStore.getCount() ; i++) {
            var rec1 = GlobalVar.SalmStore.getAt(i);
            if (hitedIndexs.indexOf(i) >= 0) {
                hitedSalm.push(rec1.getData());
            }
            //else {
            //    otherSalm.push(rec1.getData());
            //}
        }
         
        me.store.removeAll();
        me.store.add(hitedSalm);
        //me.store.add(otherSalm);
        //console.log(salmArr);
    },
    fnNeedLoad: function (salmRecData) {
        var me = this;
        if (me.loadOutSalm) {
            return true;
        }

        return !me.fnIsOutSalme(salmRecData);
    },
    fnIsOutSalme: function (salmRecData) {
        if (salmRecData != null && salmRecData.out_dd) {
            //console.log(salmRecData.out_dd);
            return true;
        }

        return false;
    },
    initComponent: function () {
        var me = this;
        me.GlobalVarStore = GlobalVar.SalmStore;
        me.callParent(arguments);
        
        if (me.queryMode == 'local') {
            //if (me.localStoreSortByWorkerDeptNo && me.localStoreSortByWorkerDeptNo != '000000') {
            me.fnSortLocalStoreByWorkerDeptNo(me.localStoreSortByWorkerDeptNo || '000000');
            //}
        }
    }
});

Ext.define('MultiSearchComboBox.SYSUser', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_SYSUser',
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<table class="x-boundlist"><tr class="x-boundlist-item"><td width="100">{user_no}</td><td width="200">{name}</td></tr></table>',
        '</tpl>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{name}',
        '</tpl>'
    ),
    valueField: 'user_no',
    displayField: 'name',
    matchFieldWidth: false,
    initComponent: function () {
        var me = this;
        me.GlobalVarStore = GlobalVar.SYSUserStore;
        me.callParent(arguments);
    }
});

Ext.define('MultiSearchComboBox.Prdt', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_Prdt',
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<table class="x-boundlist"><tr class="x-boundlist-item"><td width="100">{prd_no}</td><td width="200">{name}</td></tr></table>',
        '</tpl>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{name}',
        '</tpl>'
    ),
    valueField: 'prd_no',
    displayField: 'name',
    matchFieldWidth :false,
    initComponent: function () {
        var me = this;
        me.GlobalVarStore = GlobalVar.PrdtStore;
        me.callParent(arguments);
    }
});

Ext.define('MultiSearchComboBox.Cust', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_Cust',
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<table class="x-boundlist"><tr class="x-boundlist-item"><td width="100">{cus_no}</td><td width="100">{name}</td></tr></table>',
        '</tpl>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{name}',
        '</tpl>'
    ),
    valueField: 'cus_no',
    displayField: 'name',
    GlobalVarStore: GlobalVar.CustStore,
    initComponent: function () {
        var me = this;
        me.GlobalVarStore = GlobalVar.CustStore;
        me.callParent(arguments);
    }
});


Ext.define('MultiSearchComboBox.Size', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_Size',
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<table class="x-boundlist"><tr class="x-boundlist-item"><td width="100">{size}</td></tr></table>',
        '</tpl>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{size}',
        '</tpl>'
    ),
    valueField: 'size',
    displayField: 'size',
    GlobalVarStore: GlobalVar.SizesStore,
    initComponent: function () {
        var me = this;
        me.GlobalVarStore = GlobalVar.SizesStore;
        me.callParent(arguments);
    }
});

Ext.define('MultiSearchComboBox.MF_SO', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_MF_SO',
    queryMode: 'remote',
    queryParam: 'so_no',
    valueGridField: 'so_no',
    displayGridField: 'so_no',
    GlobalVarStore: null,
    minChars : 1,
    proxyUrl: commonVar.urlCDStr + 'ASHX/MF_SO.ashx?action=TableSearch',        //可更新网址
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<div class="x-boundlist"><table><tr class="x-boundlist-item"><td style="width:80px">{so_no}</td><td style="width:100px">{os_dd}</td></tr></table></div>',
        '</tpl>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{so_no}',
        '</tpl>'
    ),
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
    }
});



Ext.define('MultiSearchComboBox.Color', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_Color',
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<table class="x-boundlist"><tr class="x-boundlist-item"><td width="100">{color}</td></tr></table>',
        '</tpl>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{color}',
        '</tpl>'
    ),
    valueField: 'color_id',
    displayField: 'color_id',
    forceSelection: true,
    GlobalVarStore: GlobalVar.ColorsStore,
    initComponent: function () {
        var me = this;
        me.SearchFields = ['color'];
        me.GlobalVarStore = GlobalVar.ColorsStore;
        me.callParent(arguments);
    }
});



Ext.define('MultiSearchComboBox.Material', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_Material',
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<table  class="x-boundlist"><tr class="x-boundlist-item"><td width="90">{prd_no}</td><td width="130">{name}</td><td width="100">皮奖单价{price}</td></tr></table>',
        '</tpl>'
    ),
    valueField: 'material_id',
    displayField: 'prd_no',
    displayTpl:null,
    initComponent: function () {
        var me = this;
        me.GlobalVarStore = GlobalVar.MaterialStore;
        me.callParent(arguments);
    }
});

Ext.define('Ext.ux.MultiComboBox', {
    extend: 'Ext.form.ComboBox',
    alias: 'widget.multicombobox',
    xtype: 'multicombobox',
    multiSelect:true
    //initComponent: function () {
    //    this.multiSelect = true;
    //    this.listConfig = {
    //        itemTpl: Ext.create('Ext.XTemplate',
    //              '<input type=checkbox>{name}'),
    //        onItemSelect: function (record) {
    //            var node = this.getNode(record);
    //            if (node) {
    //                Ext.fly(node).addCls(this.selectedItemCls);

    //                var checkboxs = node.getElementsByTagName("input");
    //                if (checkboxs != null) {
    //                    var checkbox = checkboxs[0];
    //                    checkbox.checked = true;
    //                }
    //            }
    //        },
    //        listeners: {
    //            itemclick: function (view, record, item, index, e, eOpts) {
    //                var isSelected = view.isSelected(item);
    //                var checkboxs = item.getElementsByTagName("input");
    //                if (checkboxs != null) {
    //                    var checkbox = checkboxs[0];
    //                    if (!isSelected) {
    //                        checkbox.checked = true;
    //                    } else {
    //                        checkbox.checked = false;
    //                    }
    //                }
    //            }
    //        }
    //    }
    //    this.callParent();
    //}
});

Ext.define('MultiSearchComboBox.CheckStatusComboBox', {
    extend: 'Ext.form.ComboBox',
    xtype: 'checkStatusComboBox',
    fieldLabel: '审核状态',
    store: Ext.create('Ext.data.Store', {
        fields: [{ name: 'val', type: 'int' }, 'name'],
        data: [
            { "val": -1, "name": "未提交" },
            { "val": 0, "name": "审核中" },
            { "val": 1, "name": "同意" },
            { "val": 2, "name": "不同意" }
        ]
    }),
    queryMode: 'local',
    displayField: 'name',
    valueField: 'val' 
});