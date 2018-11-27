var PrdtSet = {};
//代号	prd_no
//名称	name
//简称	snm
//规格	spc
//英文名称	eng_name
//状态	state
//备注	rem
//创建人员	n_man
//创建时间	n_dd
//修改人员	e_man
//修改时间	e_dd

PrdtSet.GetStore = function () {
    return Ext.create('Ext.data.Store', {
        model: 'Model_Prdt',
        autoLoad: false,
        pageSize: 1000,
        proxy: {
            type: 'ajax',
            url: '../.. zzx.ashx',
            reader: {
                type: 'json',
                root: 'items',
                totalProperty: 'total'
            }
        }
    });
};

PrdtSet.GridCols = function () {
    return [
        { header: '货号', name: 'prd_no', dataIndex: 'prd_no', width: 150 },
        { header: '名称', name: 'name', dataIndex: 'name', width: 190 },
        { header: '简称', name: 'snm', dataIndex: 'snm', width: 120 },
        { header: '规格', name: 'spc', dataIndex: 'spc', width: 200 },
        { header: '英文名称', name: 'eng_name', dataIndex: 'eng_name', hidden: true },
        { header: '状态', name: 'state', dataIndex: 'state', renderer: SCom.rdPrdtState },
        { header: '备注', name: 'rem', dataIndex: 'rem', hidden: true },

        { header: '已设工序', name: 'has_wp', dataIndex: 'has_wp', xtype: 'checkcolumn' },
        { header: '已设单价', name: 'has_wpup', dataIndex: 'has_wpup', xtype: 'checkcolumn' },

        { header: '创建人员', name: 'n_man', dataIndex: 'n_man', tdCls: 'disabled_column', hidden: true },
        { header: '创建时间', name: 'n_dd', dataIndex: 'n_dd', xtype: 'datecolumn', format: 'Y/m/d', tdCls: 'disabled_column' },
        { header: '修改人员', name: 'e_man', dataIndex: 'e_man', tdCls: 'disabled_column', hidden: true },
        { header: '修改时间', name: 'e_dd', dataIndex: 'e_dd', xtype: 'datecolumn', format: 'Y/m/d', tdCls: 'disabled_column', hidden: true }
    ];
}


Ext.define('PrdtSet.PrdtGrid', {
    extend: 'SunGridClass',
    xtype: 'PrdtGrid',

    region: 'center',
    flex: 1,
    gridID: 'Top1',
    pageID: 'Page_Sys_Prdt_aspx',
    CompanyCDNO: 'C1002',
    NowUserId: GlobalVar.NowUserId,

    autoSync: true,
    cellEditing: null,
    getDefaultColumnsSetting: PrdtSet.GridCols,

    initComponent: function () {
        var Fme = this;

        Fme.store = PrdtSet.GetStore(),
        Ext.apply(this, {
            bbar: [{
                xtype: 'pagingtoolbar',
                store: Fme.store,
                dock: 'bottom',
                displayInfo: true
            }]
        });
        this.callParent();
    }
});

// form
Ext.define('PrdtFormClass', {
    extend: 'Ext.form.Panel',
    height: 200,
    xtype: 'PrdtForm',
    layout: 'column',
    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            items: [{
                xtype: 'fieldcontainer',
                itemId: 'A',
                layout: {
                    type: 'table',
                    columns: 2
                },
                defaults: {
                    xtype: 'textfield', padding: 5, labelWidth: 60, width: 200,
                    labelAlign: 'right'
                    //margin: '2 2 2 2'
                },
                items: [
                    { fieldLabel: '货号', name: 'prd_no', allowBlank: false, itemId: 'prd_no' },
                    { fieldLabel: '简称', name: 'snm' },
                    { fieldLabel: '名称', name: 'name', colspan: 2, width: 408, maxLength: 50 },

                    { fieldLabel: '规格', name: 'spc', colspan: 2, width: 408, maxLength: 250 },
                    { fieldLabel: '英文名称', name: 'eng_name', maxLength: 50 },
                    { fieldLabel: '状态', name: 'state', xtype: 'cbPrdtState', selectOnFocus: true }
                ]
            },
            {
                hidden: true,

                fieldLabel: '备注信息(可加图片)', name: 'rem', padding: 2,
                height: 146,
                labelAlign: 'top',
                //hideLabel: true, 
                xtype: 'htmleditor',
                enableSourceEdit: false,
                enableLists: false,
                enableLinks: false,
                enableFormat: false,
                enableFontSize: false,
                enableFont: false,
                enableColors: false,
                enableAlignments: false

            }]
        });
        this.callParent();
    },
    onViewState: function () {
        var F = this;
        if (!F.BoxPrdNo) {
            F.BoxPrdNo = F.getComponent('A').getComponent('prd_no');
        }

        Common_SetItemReadOnly(F.BoxPrdNo, true);
    },

    onNewState: function () {
        var F = this;
        if (!F.BoxPrdNo) {
            F.BoxPrdNo = F.getComponent('A').getComponent('prd_no');
        }

        Common_SetItemReadOnly(F.BoxPrdNo, false);
    }
});


