var YGPJGZ_Set = {};

YGPJGZ_Set.Model = Ext.define('YGPJGZ_Set_Model', {
    extend: 'Ext.data.Model',
    fields: [
    //js_dd,sal_no,sal_name,dep_name,js_no,itm,qty,up,amt,is_add,rem
       
        { name: 'sal_no', type: 'string' },
        { name: 'sal_name', type: 'string' },
        { name: 'dep_no', type: 'string' },
        { name: 'dep_name', type: 'string' },
        { name: 'pjgz', type: 'number' },
        
        { name: 'sal_type', type: 'string' }
    ]
});

YGPJGZ_Set.GetStore = function () {
    return Ext.create('Ext.data.Store', {
        model: YGPJGZ_Set.Model,
        autoLoad: false,
        sorters: [{
            property: 'dep_no',
            direction: 'ASC'
        }, {
            property: 'sal_type',
            direction: 'ASC'
        }
        ],
        proxy: {
            type: 'ajax',
            url: '../ASHX/YGPJGZ.ashx',
            reader: {
                type: 'json'

            }
        }
    })
};

YGPJGZ_Set.GridCols = function () {
    return [
     { header: '部门号', name: 'dep_no', dataIndex: 'dep_no', hidden: true },
     { header: '部门', name: 'dep_name', dataIndex: 'dep_name' },
//     { header: '员工号', name: 'sal_no', dataIndex: 'sal_no', hidden: true },
//     { header: '员工', name: 'sal_name', dataIndex: 'sal_name' },
     {header: '工种', name: 'sal_type', dataIndex: 'sal_type', renderer: SCom.rdSalmType },
     { header: '平均工资', name: 'pjgz', dataIndex: 'pjgz' } 
    ]
}

var GridStore = YGPJGZ_Set.GetStore();


var NowMouth = (new Date()).getMonth();
var StartDD = new Date(),
        EndDD = new Date();

if (StartDD.getDate() >= 26) {
    StartDD.setMonth(NowMouth, 26);
    EndDD.setMonth(NowMouth + 1, 25);
}
else {
    StartDD.setMonth(NowMouth - 1, 26);
    EndDD.setMonth(NowMouth, 25);
}


Ext.onReady(function () {
    nPanel = Ext.create('Ext.form.Panel', {
        region: 'north',
        layout: {
            type: 'table',
            columns: 3,
            border: 0
        },
        defaults: {
            labelWidth: 90,
            maxWidth: 250,
            labelAlign: 'right',
            margin: '5 0 2 5'
        },
        items: [
            {
                itemId: 'startdd',
                name: 'startdd',
                xtype: 'datefield',
                fieldLabel: '开始日期',
                value: StartDD,
                format: 'Y/m/d'
            },
            {
                itemId: 'enddd',
                name: 'enddd',
                xtype: 'datefield',
                fieldLabel: '结束日期',
                value: EndDD,
                format: 'Y/m/d'
            },
                {
                },
            {
                itemId: 'dep_no',
                name: 'dep_no',
                xtype: 'CbGrid_Dept',
                fieldLabel: '部&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp门'
            },
            {
                itemId: 'sal_no',
                name: 'sal_no',
                xtype: 'CbGrid_Salm',
                hidden: true,
                fieldLabel: '员&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp工'
            },
            {
                itemId: 'depFindSub',
                name: 'depFindSub',
                xtype: 'checkbox',
                fieldLabel: '部门含下层',
                value: true
            }
        ],
        listeners: {
            afterrender: function () {

                nPanel.startdd = nPanel.getComponent('startdd');
                nPanel.enddd = nPanel.getComponent('enddd');
                nPanel.dep_no = nPanel.getComponent('dep_no');
                nPanel.sal_no = nPanel.getComponent('sal_no');
                nPanel.depFindSub = nPanel.getComponent('depFindSub');
            }
        }
    });


    var SearchData = function (GetType, requestType) {
        var str = ' 1=1 ';
        var val1 = nPanel.startdd.getValue();
        var val2 = nPanel.enddd.getValue();
        var val3 = nPanel.dep_no.HiddenValue;
        var val4 = nPanel.sal_no.HiddenValue;
        var val5 = nPanel.depFindSub.checked;

        if (val1 && val1 != '')
            str += ' and js_dd >= \'' + Ext.Date.format(val1, 'Y/m/d') + '\' ';

        if (val2 && val2 != '')
            str += ' and js_dd <= \'' + Ext.Date.format(val2, 'Y/m/d') + '\' ';

//        if (val3 && val3 != '')
//            str += ' and dep_no = \'' + val3 + '\' ';

        if (val4 && val4 != '')
            str += ' and sal_no = \'' + val4 + '\' ';



        if (requestType && requestType == 'get_excel') {
            var cols = cPanel.grid.headerCt.getVisibleGridColumns();
            var ArrDataIndexs = [], ArrDataNames = [], ArrDataWidths = [];
            for (var i = 0; i < cols.length; ++i) {
                ArrDataIndexs.push(cols[i].dataIndex);
                ArrDataNames.push(cols[i].text);
                ArrDataWidths.push(cols[i].width);
            }

            Ext.Ajax.request({
                url: GridStore.proxy.url,
                params: { action: 'GetData', action2: 'Get_Excel', GetType: GetType, sqlWhere: str,
                    ArrDataIndexs: ArrDataIndexs.join(','),
                    ArrDataNames: ArrDataNames.join(','),
                    ArrDataWidths: ArrDataWidths.join(','),
                    startdd: val1,
                    enddd: val2,
                    user_dep_no: val3,
                    depFindSub: val5
                },
                success: function (response) {
                    var _join = Ext.JSON.decode(response.responseText);
                    // 打开Excel的报表 
                    window.open('../downFields/' + _join.fieldpath);
                }
            });
        }
        else {
            GridStore.load({
                params: { action: 'GetData', sqlWhere: str, GetType: GetType, 
                    user_dep_no: val3,  depFindSub: val5,
                    startdd: val1,
                    enddd: val2 
                },
                callback: function () {
                    GridStore.group('dep_no', 'asc');
                }
            });
        }
    }

    // SunGrid
    cPanel = Ext.create('SunGridClass', {
        region: 'center',
        gridID: 'YGPJGZ_aspx_GridA',
        pageID: 'YGPJGZ_aspx',
        CompanyCDNO: 'C1002',
        store: GridStore,
        myMinHeight: 0,
        SaveMode: '1',
        getDefaultColumnsSetting: YGPJGZ_Set.GridCols,
        features: [{
            groupHeaderTpl: '分组: {name}',
            ftype: 'groupingsummary'
        }],
        listeners: {
            MyRender: function (a, bb) {
                var me = this;
            }
        }
    });

    sPanel = Ext.create('Ext.toolbar.Toolbar', {
        region: 'south',
        items: ['-', {
            text: '查询',
            width: 90,
            height: 32,
            style: {
                borderColor: 'black'
            },
            itemId: 'btnnew',
            handler: function () {
                SearchData("A");
            }
        }, 
//        '-', {
//            text: '导出',
//            width: 60,
//            height: 32,
//            //disable: true,
//            style: {
//                borderColor: 'black'
//            },
//            itemId: 'btntoxls',
//            handler: function () {
//                SearchData("A", 'get_excel');
//            }
//        },
        '-', {
                text: '关闭',
                width: 60,
                height: 32,
                style: {
                    borderColor: 'black'
                },
                itemId: 'btndelete',
                handler: function () {
                    PageClose();
                }
            }
        ]
    });

    // viewPanel
    function PageMonitor(url, orderParams) {

    }

    var viewport = Ext.create('Ext.Viewport', {
        margins: '0 0 0 0',
        layout: 'border',
        items: [
	            nPanel, cPanel, sPanel
            ],
        listeners: {
            afterrender: function () {
                var me = this;
                var pa = window.parent ? window.parent.Ext.getCmp('tabPanel') : null;
                //通知上级tab 这已加载完成
                if (pa) {
                    var thisTabComp = pa.getComponent('Report_平均工资');

                    if (thisTabComp) {
                        thisTabComp.had_rendered = true;
                        pa.on('SendOrder', PageMonitor);
                        pa.getComponent('Report_平均工资').fireEvent('had_rendered', PageMonitor);

                        PageClose = function () {
                            var pa = window.parent.Ext.getCmp('tabPanel');
                            //通知上级tab 这已加载完成
                            if (pa) {
                                pa.getComponent('Report_平均工资').fireEvent('letcloseme');
                            }
                        } // PageClose
                    }
                }
            }

        }
    });
});