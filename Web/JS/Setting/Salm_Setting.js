var SalmSet = {};
//代号	user_no	varchar(40)	
//名称	name	varchar(20)	
//部门代号	dep_no	varchar(40)	
//入职日期	in_dd	datetime	
//离职日期	out_dd	datetime	
//工种	type	varchar(2)	0.末指定, 1.车位,2.杂工
//联系方式	contact	varchar(200)	
//备注	rem	ntext	

//创建人员	n_man	varchar(40)	
//创建时间	n_dd	datetime	
//修改人员	e_man	varchar(40)	
//修改时间	e_dd	datetime	

SalmSet.GetStore = function() {
    return Ext.create('Ext.data.Store', {
        model: 'Model_Salm',
        pageSize: 100,
        autoLoad: false,
        proxy: {
            type: 'ajax',
            url: '../.. zzx ashx',
            reader: {
                type: 'json',
                root: 'items',
                totalProperty: 'total'
            }
        }
    });
};

SalmSet.GridCols = function () {
    return [
        { header: '序号', name: 'sort_itm', dataIndex: 'sort_itm' },
        { header: '人员代号', name: 'user_no', dataIndex: 'user_no', width: 80 },
        { header: '名称', name: 'name', dataIndex: 'name', width: 120 },
        { header: '部门代号', name: 'dep_no', dataIndex: 'dep_no', hidden: true },
        { header: '部门名', name: 'dep_name', dataIndex: 'dep_name' },


        { header: '入职日期', name: 'in_dd', dataIndex: 'in_dd', xtype: 'datecolumn', format: 'Y/m/d' },
        { header: '离职日期', name: 'out_dd', dataIndex: 'out_dd', xtype: 'datecolumn', format: 'Y/m/d' },
        { header: '工种', name: 'type', dataIndex: 'type', renderer: SCom.rdSalmType },

        { header: '购买社保', name: 'is_shebao', dataIndex: 'is_shebao', xtype: 'checkcolumn' },

        { header: '联系方式', name: 'contact', dataIndex: 'contact' },
        { header: '备注', name: 'rem', dataIndex: 'rem', renderer: SCom.rdPrdtState, hidden: true },

        { header: '创建人员', name: 'n_man', dataIndex: 'n_man', tdCls: 'disabled_column', hidden: true },
        { header: '创建时间', name: 'n_dd', dataIndex: 'n_dd', xtype: 'datecolumn', format: 'Y/m/d', tdCls: 'disabled_column', hidden: true },
        { header: '修改人员', name: 'e_man', dataIndex: 'e_man', tdCls: 'disabled_column', hidden: true },
        { header: '修改时间', name: 'e_dd', dataIndex: 'e_dd', xtype: 'datecolumn', format: 'Y/m/d', tdCls: 'disabled_column', hidden: true }
    ];
}


Ext.define('SalmSet.SalmGrid', {
    gridID: 'Top1',
    pageID: 'Page_Sys_SALM_aspx1',
    CompanyCDNO: 'C1002',

    extend: 'SunGridClass',
    xtype: 'SalmGrid',
    region: 'center',
    flex: 1,
    NowUserId: GlobalVar.NowUserId,
    autoSync: true,
    cellEditing: null,
    getDefaultColumnsSetting: SalmSet.GridCols,
    getRowClass: function (record, rowIndex, rowParams, store) {
        var cls = '';
        
        if (record.get('out_dd')) {
            //console.log('set my getRowClass salm_out ');
            cls = 'salm_out';
        }
        return cls;
    },
    initComponent: function() {
        var Fme = this;

        Fme.store = SalmSet.GetStore();
        Ext.apply(this, {
            bbar: [{
                xtype: 'pagingtoolbar',
                store: Fme.store,   // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true
            }]
        });
        this.callParent();
    }
});

Ext.define('SalmFormClass', {
    extend: 'Ext.form.Panel',
    height: 200,
    xtype: 'SalmForm',
    layout: 'column',
   
    initComponent: function() {
        var me = this;

        Ext.apply(this, {
            items: [{
                xtype: 'fieldcontainer',
                itemId: 'A',
                layout: {
                    type: 'table',
                    columns: 2
                },
                defaults: { xtype: 'textfield',margin :'5 2 0 2', labelWidth: 60, width: 200 },
                items: [
                        { fieldLabel: '代号', name: 'user_no', itemId: 'user_no' ,allowBlank: false },
                        { fieldLabel: '名称', name: 'name' },
                        { fieldLabel: '部门', name: 'dep_no', itemId: 'dep_no', xtype: 'MSearch_Dept', allowBlank: false },
                        { fieldLabel: '入职日', name: 'in_dd', xtype: 'datefield', allowBlank: false, format: 'Y/m/d', value: new Date() },
                        { fieldLabel: '离职日', name: 'out_dd', xtype: 'datefield', format: 'Y/m/d' },
                        { fieldLabel: '工种', name: 'type', xtype: 'cbSalmType', selectOnFocus: true },

                        { fieldLabel: '购买社保', name: 'is_shebao', xtype: 'checkbox', colspan: 2 },

                        { fieldLabel: '联系方式', name: 'contact', colspan: 2, width: 404 }
                //                        { fieldLabel: '创建人员', name: 'n_man' },
                //                        { fieldLabel: '创建时间', name: 'n_dd' },
                //                        { fieldLabel: '修改人员', name: 'e_man' },
                //                        { fieldLabel: '修改时间', name: 'e_dd' } 
                    ]
            }
                //{
                //    fieldLabel: '备注', name: 'rem', padding: 2,
                //    height: 146,
                //    hideLabel: true, xtype: 'htmleditor',
                //    enableSourceEdit: false,
                //    enableLists: false,
                //    enableLinks: false,
                //    enableFormat: false,
                //    enableFontSize: false,
                //    enableFont: false,
                //    enableColors: false,
                //    enableAlignments: false
                //}
            ]
        });
        this.callParent();
    },
    onViewState: function() {
        var F = this;
        if (!F.BoxUserNo)
            F.BoxUserNo = F.getComponent('A').getComponent('user_no');

        Common_SetItemReadOnly(F.BoxUserNo, true);
    },

    onNewState: function() {
        var F = this;
        if (!F.BoxUserNo)
            F.BoxUserNo = F.getComponent('A').getComponent('user_no');

        Common_SetItemReadOnly(F.BoxUserNo, false);
    }
});


////员工排序 Win 强制选择一个部门，然后加载部门所有员工，
/// 2.放入一下bundlist 中,让用户拖拉顺序
/// 3.保存更新

//员工排序
SalmSet.createSortWin = function () {

    var win = Ext.create('Ext.window.Window', {
        title: '排序设置,先选择好部门',
        height: 400,
        width: 380,
        closeAction : 'hide',
        layout: 'border',
        items: [
        {
            xtype: 'container',
            region: 'north',
            layout: 'column',
            defaults: {
                margin:5
            },
            items: [
            { fieldLabel: '部门', labelWidth:50, name: 'dep_no', labelAlign:'right', itemId: 'dep_no', xtype: 'MSearch_Dept', flex: 1 },
            { xtype: 'button', text: '加载员工', flex: 1,
                handler: function () {
                    var win = this.up('window'),
                        dep_no = win.down('MSearch_Dept').getValue(),
                        grid = win.down('grid'),
                        store = grid.store;
                    if (dep_no) {
                        store.load({ params: { sqlWhere: "dep_no = '" + dep_no + "'", IsShowOut: false, page: "", limit: "" } });
                    }
                }
            },
            { xtype: 'button', text: '更新', flex: 1,
                handler: function () {
                    var grid = this.up('window').down('grid'),
                        store = grid.store,
                        cnt = store.getCount(),
                        i = 0,
                        o = { action: 'UpdateSort', cnt: cnt };

                    for (; i < cnt; ++i) {
                        o['s' + i] = store.getAt(i).get('user_no');
                    }

                    Ext.Ajax.request({
                        url: '../ASHX/SALM.ashx',
                        params: o,
                        success: function (response) {
                            CommMsgShow("嘻嘻，更新OK!");
                        },
                        failure: function (response) {
                            CommMsgShow("更新异常，请找潮哥仔");
                        }
                    });
                }
            }]
        },
        {
            xtype: 'grid',
            region: 'center',
            store: Ext.create('Ext.data.Store', {
                model: 'Model_Salm',
                pageSize: 0,
                autoLoad: false,
                proxy: {
                    type: 'ajax',
                    url: '../ASHX/SALM.ashx?action=GETDATA',
                    reader: {
                        type: 'json',
                        root: 'items',
                        totalProperty: 'total'
                    }
                }
            }),
            viewConfig: {
                plugins: {
                    ptype: 'gridviewdragdrop',
                    dragText: '上下拖动'
                }
            },
            columns: [
                { xtype: 'rownumberer' },
                { header: '工号', dataIndex: 'user_no', name: 'user_no' },
                { header: '名称', dataIndex: 'name', name: 'name' }
            ]
        }]
    });
    return win;
}


