var CustSet = {};
//代号	cus_no	varchar(40)
//名称	name	varchar(100)
//简称	snm	varchar(100)
//状态	state	varchar(2)
//创建人员	n_man	varchar(40)
//创建时间	n_dd	datetime
//修改人员	e_man	varchar(40)
//修改时间	e_dd	datetime

          
CustSet.GetStore  = function(){
    return Ext.create('Ext.data.Store',{
        model : 'Model_Cust',
        autoLoad: false,
        pageSize : 100,
        proxy:{
            type:'ajax',
            url:'../.. zzx ashx',
            reader:{
                type:'json', 
                root: 'items',
                totalProperty: 'total'
            }
        }
    })
};

CustSet.GridCols  = function(){
    return [
     { header: '客户号', name: 'cus_no', dataIndex: 'cus_no', width: 100 },
     { header:'名称',name:'name', dataIndex:'name', width : 150},
     { header: '简称', name: 'snm', dataIndex: 'snm' },
     { header: '状态', name: 'state', dataIndex: 'state', renderer: SCom.rdPrdtState },
     
     { header:'创建人员',name:'n_man',dataIndex:'n_man', tdCls :'disabled_column'},
     { header: '创建时间', name: 'n_dd', dataIndex: 'n_dd', xtype: 'datecolumn', format: 'Y/m/d', tdCls: 'disabled_column' },
     { header: '修改人员', name: 'e_man', dataIndex: 'e_man', tdCls: 'disabled_column' },
     { header: '修改时间', name: 'e_dd', dataIndex: 'e_dd', xtype: 'datecolumn', format: 'Y/m/d', tdCls: 'disabled_column' }
    ]
}


Ext.define('CustSet.CustGrid', {
    extend: 'SunGridClass',
    xtype: 'CustGrid',

    region: 'center',
    flex: 1,
    gridID: 'Top1',
    pageID: 'Page_Sys_Cust_aspx',
 
    autoSync: true,
    cellEditing: null,
    getDefaultColumnsSetting: CustSet.GridCols,
    initComponent: function() {
        var Fme = this;
        Fme.store = CustSet.GetStore();

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

Ext.define('CustFormClass', {
    extend: 'Ext.form.Panel',
    height: 200,
    xtype: 'CustForm',
    url: "../../ASHX/Cust.ashx",
    
    initComponent: function() {
        var me = this;
        Ext.apply(this, {
            bodyPadding : 5,
            layout: {
                type: 'table',
                columns: 2
            },
            defaults: { xtype: 'textfield', padding: 2, labelWidth: 60, width: 200 },
            items: [
                { fieldLabel: '客户代号', name: 'cus_no', itemId: 'cus_no' ,allowBlank: false, anchor:'50%'},
                { fieldLabel: '简&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp称', name: 'snm' ,anchor:'50%'},
                { fieldLabel: '名&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp称', name: 'name', colspan: 2, anchor:'100%', width: 404, maxLength: 250, allowBlank: false },
                { fieldLabel: '状&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp态', name: 'state', xtype: 'cbPrdtState', selectOnFocus: true, anchor:'50%' }
            //                { fieldLabel: '创建人员', name: 'n_man' },
            //                { fieldLabel: '创建时间', name: 'n_dd' },
            //                { fieldLabel: '修改人员', name: 'e_man' },
            //              { fieldLabel: '修改时间', name: 'e_dd' } 
            ]
        });
        this.callParent();
    },

    onViewState: function() {
        var F = this;
        if (!F.BoxCusNo)
            F.BoxCusNo = F.getComponent('cus_no');
        Common_SetItemReadOnly(F.BoxCusNo, true);
    },
    onNewState: function() {
        var F = this;
        if (!F.BoxCusNo)
            F.BoxCusNo = F.getComponent('cus_no');
        Common_SetItemReadOnly(F.BoxCusNo, false);
    }
});

