var PrdtWPSet = {};

    ///下拉移动输入框
function specialkeyfunction(obj, e) {
        //console.log("special key event");
        //var grid = gridPanel.grid;
        var code = e.getCharCode(),
            pos = grid.view.getSelectionModel().getCurrentPosition(),
            ce = editor; //grid.plugins[0];

        var maxRows = 40;
        var maxColumns = 20;
        var rowSelected = pos.row;
        var colSelected = pos.column;
        if (code == "37") {
            if (colSelected > 1)
                ce.startEditByPosition({ row: rowSelected, column: colSelected - 1 });
        }
        else if (code == "39") {
            if (colSelected < (maxColumns - 1))
                ce.startEditByPosition({ row: rowSelected, column: colSelected + 1 });
        }
        else if (code == "38") {
            if (rowSelected > 0)
                ce.startEditByPosition({ row: rowSelected - 1, column: colSelected });
        }
        else if (code == "40") {
            if (rowSelected < (maxRows - 1))
                ce.startEditByPosition({ row: rowSelected + 1, column: colSelected });
        }
        else if( code == "13"){
            if (rowSelected < (maxRows - 1)){
                Common_RunDelayFn(function(){
                    ce.startEditByPosition({ row: rowSelected + 1, column: colSelected });
                    //ce.startEditByPosition({ row: rowSelected + 1, column: colSelected });
                },150);
            }
        }
        else{

        }
    }

PrdtWPSet.ashxUrl = '../ASHX/Prdt_WP.ashx';
//    货品代号	prd_no	varchar(40)
//    工序次序	itm	int
//    工序ID	wp_no	varchar(40)
//    生产部门	dep_no	varchar(40)

//    名称	name	varchar(40)
//    个数/对	pic_num	int
//    是剪线工序	is_cutwp	varchar(2)
//    状态	state	varchar(2)


PrdtWPSet.Model_PrdtWP = Ext.define('Model_PrdtWP', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'prd_no', type: 'string' },
        { name: 'itm', type: 'string' },
        { name: 'wp_no', type: 'string' },
        { name: 'dep_no', type: 'string' },
        { name: 'dep_name', type: 'string' },
        
        { name: 'name', type: 'string' },
        { name: 'wq_type', type: 'string', defaultValue: 'size_qty' },
        { name: 'pic_num', type: 'number',defaultValue : 2  },
        { name: 'is_cutwp', type: 'bool', convert: commonVar.ConvertBool },
        { name: 'is_pswp', type: 'bool', convert: commonVar.ConvertBool },
        { name: 'is_size_control', type: 'bool', convert: commonVar.ConvertBool },
        { name: 'color_different_price', type: 'bool', convert: commonVar.ConvertBool },  //11.28加
        { name: 'save_material_award', type: 'bool', convert: commonVar.ConvertBool },    //17.2.4 加
        { name: 'state', type: 'string',defaultValue : '0'  }
    ]
});



//单价ID	up_no	int
//起效日期	start_dd	datetime
//结束日期	end_dd	datetime
//客户代号	cus_no	varchar(40)
//货品代号	prd_no	varchar(40)
//创建人员	n_man	varchar(40)
//创建时间	n_dd	datetime
//修改人员	e_man	varchar(40)
//修改时间	e_dd	datetime

////　工序单价，表头
 
PrdtWPSet.GetWPHFUPStore = function() {
    return Ext.create('Ext.data.Store', {
        model: 'Model_PrdtWP_HFUP',
        autoLoad: false,
        proxy: {
            type: 'ajax',
            url: '../ASHX/Prdt_WP.ashx',
            reader: {
                type: 'json',
                root: 'items',
                totalProperty: 'total'
            }
        }
    })
}

PrdtWPSet.GridCols = function() {
    return [
        //    //{ header: '货品代号', name: 'prd_no', dataIndex: 'prd_no' },
        //        { header: '工序部门(大)', name: 'dep_no', dataIndex: 'dep_no' , sortable: false},
        //        { header: '次序', name: 'itm', dataIndex: 'itm', xtype : 'rownumberer', sortable: false },
        //        { header: '名称', name: 'name', dataIndex: 'name', flex: 1, sortable: false },
        //        { header: '单对个数', name: 'pic_num', dataIndex: 'pic_num', hidden: true, sortable: false, width: 90 },
        //        { header: '是剪线', name: 'is_cutwp', dataIndex: 'is_cutwp', xtype: 'checkcolumn', sortable: false, width: 95 },
        //        { header: '是拼身', name: 'is_pswp', dataIndex: 'is_pswp', xtype: 'checkcolumn', sortable: false, width: 95 },

        //        { header: '状态', name: 'state', dataIndex: 'state', renderer: SCom.rdPrdtState, sortable: false, width: 60 }
    ];
}

Ext.define('PrdtWPSet.PrdtWPGrid', {
    extend: 'SunGridClass',
    xtype: 'PrdtWPGrid',
    region: 'center',
    flex: 1,
    gridID: 'Top1',
    pageID: 'Page_PrdtWp_aspx',
    CompanyCDNO: 'C1002',
    NowUserId: GlobalVar.NowUserId,

    autoSync: true,
    cellEditing: null,
    getDefaultColumnsSetting: [], //PrdtWPSet.GridCols,

    initComponent: function () {
        var Fme = this;

        var store = Ext.create('Ext.data.Store', {
            model: 'Model_PrdtWP',
            autoLoad: false,
            proxy: {
                type: 'ajax',
                url: '../../ASHX/Prdt_WP.ashx',
                reader: {
                    type: 'json',
                    root: 'items',
                    totalProperty: 'total'
                }
            }
        });

        Fme.store = store;
        //        Ext.apply(this, {
        //            bbar: [{
        //                xtype: 'pagingtoolbar',
        //                store: Fme.store,   // same store GridPanel is using
        //                dock: 'bottom',
        //                displayInfo: true
        //            }]
        //        });
        this.callParent();
    }
   
});

Ext.define('PrdtWPSet.PrdtWPHFUPGrid', {
    extend: 'SunGridClass',
    xtype: 'PrdtWPHFUPGrid',
    region: 'center',
    flex: 1,
    gridID: 'PrdtWPHFUPGrid',
    pageID: 'Page_PrdtWp_aspx',
    CompanyCDNO: 'C1002',
    NowUserId: GlobalVar.NowUserId,
    width:200,
    autoSync: true,
    cellEditing: null,
    
    getDefaultColumnsSetting: function () {
        return [
            { header: '序号', xtype: 'rownumberer', IsRownumberer: true, width: 55 },
            { header: '编辑', dataIndex: 'active', name: 'active', width: 65, renderer: function (v) { return v === true ? 'Y' : ''; } },
            { header: '单价编号', name: 'up_no', dataIndex: 'up_no', width: 80 },
            { header: '生效时间', itemId: 'start_dd', name: 'start_dd', dataIndex: 'start_dd', xtype: 'datecolumn', format: 'Y/m/d', editor: { xtype: 'datefield', format: 'Y/m/d' }, width: 90 },
            { header: '失效时间', name: 'end_dd', dataIndex: 'end_dd', xtype: 'datecolumn', format: 'Y/m/d', editor: { xtype: 'datefield', format: 'Y/m/d' }, width: 90 },
            {
                header: '适用部门', name: 'dep_no', dataIndex: 'dep_no', hidden: false,
                editor: {
                    xtype: 'MSearch_Dept',
                    inGrid: true,
                    matchFieldWidth: false,
                    allowBlank: false,
                    dispalyField : 'dep_no',
                    value: '000000'
                },
                renderer: function (v, m, rec) {
                    if (!v || v == '000000') {
                        return '所有';
                    }
                    return GlobalVar.rdDeptName(v); //rec.get('dep_name');
                },
                width: 100
            },
            {
                header: '适用客户', name: 'cus_no', dataIndex: 'cus_no', hidden: true,
                editor: {
                    xtype: 'MSearch_Cust',
                    dispalyField: 'cus_no',
                    inGrid: true
                },
                renderer: function (v, m, rec) {
                    if (!v) {
                        return '所有';
                    }
                    return GlobalVar.rdCustName(v);
                },
                width: 100
            }
        ];
    },
    initComponent: function() {
        var Fme = this;

        Fme.store = PrdtWPSet.GetWPHFUPStore();
        this.callParent();
    }
});
