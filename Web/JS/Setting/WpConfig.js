
var WpConfig = {
    freezeDay: 3,//3天前的单不能修改
    freeType: '统一',//分员工
    SalmFreezeDays:{
        CCH01: 2, //2天冰封期
        CFH01: 2,
        CEH01:5
    },
    SizeControl: {

    },
    DeptNeedShare:{
        SY: true,
        PJ: true
    },
    //各部门分成方式
    ShareSetting: {
        SY: { MAN0: [100], MAN1: [100], MAN2: [57.25, 42.75], MAN3: [20, 30, 50] },      //丝印部
        MAN2: [[50, 50], [60, 40]], 
        PJ: { defaultIndex: 0 }
    },
    GetShareSetting: function(){
        var _result = [];
        for (var i = 0; i < WpConfig.ShareSetting['MAN2'].length; i++) {
            var ab = WpConfig.ShareSetting['MAN2'][i];
            _result.push({
                value: i.toString(),
                name: "主" + ab[0] + "%,副" + ab[1] + "%",
                percent1: ab[0],
                percent2: ab[1]
            });
        }
        return _result;
    },
    GetShareTypeIndexInWpConfig:function (mainWorkerSharePer) {
        var sList = WpConfig.GetShareSetting();
        for (var i = 0; i < sList.length; i++) {
            if (sList[i][0] == mainWorkerSharePer) {
                return i;
            }
        }
        return -1;
    },
    ///丝印部加番率
    PairInscreaseSetting:{
        SY:[
            { start: 0, end: 49, precent: 100 },
            { start: 50, end: 99, precent: 50 },
            { start: 100, end: 199, precent: 25 },
            { start: 200, end: Number.MAX_SAFE_INTEGER, precent: 0 }
        ]
    },
    GetPairInscrease: function (qty_pair, dep_Code) {
        var res = 0;
        for (var i = 0; i < WpConfig.PairInscreaseSetting[dep_Code].length; i++) {
            var temp = WpConfig.PairInscreaseSetting[dep_Code][i];
            if (temp.start <= qty_pair && temp.end >= qty_pair) {
                res = temp.precent;
                break;
            }
        }
        return res;
    },

    UserDefault: {
        admin: {
            root: '管理员',
            user_dep_no: '000000',
            user_no: 'admin',
            wp_dep_no: '000000',
            edit_ut: 1
        },
        CCH01: {
            root: '组长',
            user_dep_no: 'CC',
            user_no: 'CCH01',
            wp_dep_no: 'C',
            edit_ut: 1
        },
        CFH01: {
            root: '组长',
            user_dep_no: 'CF',
            user_no: 'CFH01',
            wp_dep_no: 'C',
            edit_ut: 1
        },
        CEH01: {
            root: '组长',
            user_dep_no: 'CE',
            user_no: 'CEH01',
            wp_dep_no: 'C',
            edit_ut: 1
        },
        CGH01: {
            root: '组长',
            user_dep_no: 'CG',
            user_no: 'CGH01',
            wp_dep_no: 'C',
            edit_ut: 1
        },
        CHH01: {
            root: '组长',
            user_dep_no: 'CH',
            user_no: 'CHH01',
            wp_dep_no: 'C',
            edit_ut: 1
        },
        CIH01: {
            root: '组长',
            user_dep_no: 'CI',
            user_no: 'CIH01',
            wp_dep_no: 'C',
            edit_ut: 1
        },
        CJH01: {
            root: '组长',
            user_dep_no: 'CJ',
            user_no: 'CJH01',
            wp_dep_no: 'C',
            edit_ut: 1
        },

        H1H01: {
            root: '组长',
            user_dep_no: 'H',
            user_no: 'H1H01',
            wp_dep_no: 'H',
            edit_ut: 1
        },
        H2H01: {
            root: '组长',
            user_dep_no: 'H',
            user_no: 'H2H01',
            wp_dep_no: 'H',
            edit_ut: 1
        },
        H3H01: {
            root: '组长',
            user_dep_no: 'H',
            user_no: 'H3H01',
            wp_dep_no: 'H',
            edit_ut: 1
        },
        H4H01: {
            root: '组长',
            user_dep_no: 'H',
            user_no: 'H4H01',
            wp_dep_no: 'H',
            edit_ut: 1
        },
        SH01: {
            root: '组长',
            user_dep_no: 'S',
            user_no: 'SH01',
            wp_dep_no: 'S',
            edit_ut: 1
        },
        DAH01: {
            root: '组长',
            user_dep_no: 'DA',
            user_no: 'DAH01',
            wp_dep_no: 'D',
            edit_ut: 1
        },
        SY001: {
            root: '组长',
            user_dep_no: 'Y',
            user_no: 'SY001',
            wp_dep_no: 'Y',
            edit_ut: 1
        },
        SP001: {
            root: '组长',
            user_dep_no: 'SP',
            user_no: 'SP001',
            wp_dep_no: 'SP',
            edit_ut: 1
        },
        TAH01: {
            root: '组长',
            user_dep_no: 'TA',
            user_no: 'TAH01',
            wp_dep_no: 'T',
            edit_ut: 1,
            开户超数权限: true
        },
        TBH01: {
            root: '组长',
            user_dep_no: 'TB',
            user_no: 'TBH01',
            wp_dep_no: 'T',
            edit_ut: 1,
            开户超数权限: true
        }
    },
    GetDepSalmSharePercent组合: function (dep_no) {
        //员工1": "SP0013",
        //"员工2": "SP0014",
        //"比率1": 50,
        //"比率2": 50
        Ext.define('temp_model_share', {
            extend: 'Ext.data.Model',
            fields: [
                { name: '员工1', type: 'string' },
                { name: '员工2', type: 'string' },
                { name: '比率1', type: 'number' },
                { name: '比率2', type: 'number' }
            ]
        });
 
        var store = Ext.create('Ext.data.Store', {
            model: 'temp_model_share',
            proxy: {
                type: 'ajax',
                url: commonVar.urlCDStr + 'JS/UserVars/Workers.json',
                reader: {
                    type: 'json',
                    root: dep_no
                }
            },
            autoLoad:false
        });
        
        return store;
    }
}

//var _fields = [ { name: 'row_type', type: 'string' }];
//for (var i = 1; i <= 122; i++) {
//    _fields.push({ name: 'col_' + i, type: 'string' });
//}

Ext.define("WQGrid_Layout_Model", {
    extend: 'Ext.data.Model',
    fields: []
});

Ext.define("WQGrid_QtyFinish_Model", {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'prd_no', type: 'string' },
        { name: 'wp_no', type: 'string' },
        { name: 'qty_pic', type: 'number' },
        { name: 'qty_pair', type: 'number' }
    ]
});
//
Ext.define('MultiSearchComboBox.PlanSize', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_PlanSize',
    queryMode: 'remote',
    pageSize: 99,
    queryParam: 'plan_no',
    valueGridField: 'size_id',
    displayGridField: 'size_id',
    valueField: 'size_id',
    displayField: 'size_id',
    GlobalVarStore: null,
    minChars: 1,

    storeModel: 'WorkPlan_Sizes_Model',
    matchFieldWidth: false,
    proxyUrl: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx?action=SearchPlanSize&NowUserId=' + GlobalVar.NowUserId,        //可更新网址
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<div class="x-boundlist">',
            '<table>',
                '<tr class="x-boundlist-item">',
                    '<td style="width:100px">交期{show_deliver_dd}</td>',
                    '<td style="width:100px">计划:{plan_no}</td>',
                    '<td style="width:100px">{prd_no}</td>',
                    '<td style="width:150px">{size}{show_color_name}&nbsp&nbsp({qty}对)</td>',
                '</tr>',
            '</table></div>',
        '</tpl>'
    ),
    //displayTpl: Ext.create('Ext.XTemplate',
    //    '<tpl for=".">',
    //        '{plan_no}',
    //    '</tpl>'
    //),
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
    }
});


Ext.define('MultiSearchComboBox.PlanNo', {
    extend: 'MultiSearchComboBox',
    xtype: 'MSearch_PlanNo',
    queryMode: 'remote',
    queryParam: 'plan_no',
    valueGridField: 'plan_no',
    displayGridField: 'plan_no',
    GlobalVarStore: null,
    minChars: 1,
    storeModel: 'WorkPlan_Model',
    matchFieldWidth: false,
    proxyUrl: commonVar.urlCDStr + 'ASHX/ashx_WorkPlan.ashx?action=SearchWorkPlan&NowUserId=' + GlobalVar.NowUserId,        //可更新网址
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<div class="x-boundlist">',
            '<table>',
                '<tr class="x-boundlist-item">',
                    '<td style="width:100px">{show_deliver_dd}</td>',
                    '<td style="width:100px">{plan_no}</td>',
                    '<td style="width:100px">{prd_no}</td>',
                '</tr>',
            '</table></div>',
        '</tpl>'
    ),
    
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{plan_no}',
        '</tpl>'
    ),
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
        me.SearchFields = ['plan_no', 'prd_no'];
    }
});


var _PJComboxStoreData = WpConfig.GetShareSetting();
Ext.define('WpConfig.cbSharePecents', {
    extend: 'Ext.form.ComboBox',
    xtype: 'cbSharePecents',
    fieldLabel: '',
    forceSelection: true,
    matchFieldWidth: false,
    store: Ext.create('Ext.data.Store', {
        fields: [
            { name: 'value', type: 'string' },
            'name',
            { name: 'percent1', type: 'number' },
            { name: 'percent2', type: 'number' }
        ],
        data: _PJComboxStoreData
    }),
    queryMode: 'local',
    displayField: 'name',
    valueField: 'value',
    value: '1'
});