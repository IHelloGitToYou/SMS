var YGJS_Set = {};

YGJS_Set.Model = Ext.define('YGJS_Model', {
    extend: 'Ext.data.Model',
    fields: [
        //js_dd,sal_no,sal_name,dep_name,js_no,itm,qty,up,amt,is_add,rem
        {name: 'js_dd', type: 'date' },
        { name: 'hsal_no', type: 'string' },
        { name: 'sal_no', type: 'string' },
        { name: 'sal_name', type: 'string' },
        { name: 'dep_no', type: 'string' },
        { name: 'dep_name', type: 'string' },

        { name: 'js_no', type: 'string' },
        { name: 'itm', type: 'string' },
        { name: 'qty', type: 'number' },
        { name: 'up', type: 'string' },
        { name: 'amt', type: 'number' },
        { name: 'is_add', type: 'string' },
        { name: 'rem', type: 'string' }
    ]
});

YGJS_Set.GetStore = function () {
    return Ext.create('Ext.data.Store', {
        model: YGJS_Set.Model,
        autoLoad: false,
        sorters: [{
                property: 'js_dd',
                direction: 'ASC'
            },{
                property: 'sal_no',
                direction: 'ASC'
            }
        ],
        proxy: {
            type: 'ajax',
            url: '../ASHX/YGJS.ashx',
            reader: {
                type: 'json'

            }
        }
    })
};

YGJS_Set.GridCols = function () {
    return [
     { header: '计薪日期', name: 'js_dd', dataIndex: 'js_dd', xtype: 'datecolumn', format: 'Y/m/d' },
     { header: '数据责任者', name: 'hsal_name', dataIndex: 'hsal_name', hidden: true },
     { header: '部门号', name: 'dep_no', dataIndex: 'dep_no', hidden: true },
     { header: '部门', name: 'dep_name', dataIndex: 'dep_name' },
     { header: '员工号', name: 'sal_no', dataIndex: 'sal_no', hidden: true },
     { header: '员工', name: 'sal_name', dataIndex: 'sal_name' },

     { header: '计薪单号', name: 'js_no', dataIndex: 'js_no'  },
     { header: '项次', name: 'itm', dataIndex: 'so_itm', hidden: true },
     { header: '数量', name: 'qty', dataIndex: 'qty'  },
     { header: '时薪', name: 'up', dataIndex: 'up'  },
     { header: '金额', name: 'amt', dataIndex: 'amt',
         renderer: function (v, m, rec) { return v + '元' },
         summaryType: function (rows, field) {
             //console.log(rows);
             var num = 0.000;
             for (var i = 0; i < rows.length; ++i) {
                 var Val_Is_add = rows[i].get('is_add');
                 console.log(Val_Is_add);
                 if (Val_Is_add == 'Y')
                     num += rows[i].get('amt');
             }

             //console.log(num);
             return num;
         },
         summaryRenderer: function (value) {
             return '附加' + Common_fixAmount2(value) + '&nbsp元';
         }
          
     },
     { header: '是否附加', name: 'is_add', dataIndex: 'is_add',
         summaryType: function (rows, field) {
             var num = 0.000;
             for (var i = 0; i < rows.length; ++i) {
                 var is_add = rows[i].get('is_add');
                 if (is_add != 'Y')
                     num += rows[i].get('amt');
             }
             return num;
         },
         summaryRenderer: function (value) {
             return '非附加' + Common_fixAmount2(value) + '&nbsp元';
         }
         
     },
     { header: '备注', name: 'rem', dataIndex: 'rem'  }
    ]
}

var GridStore = YGJS_Set.GetStore();

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
        url: '../../Handler2/Word/MF_SO.ashx',
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
                    fieldLabel: '员工部门',
                    name: 'dep_no',
                    itemId: 'dep_no',
                    xtype: 'MSearch_Dept',
                    localStoreSortByWorkerDeptNo: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000',
                    value: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000'
                }, {
                    fieldLabel: '员工',
                    name: 'sal_no',
                    itemId: 'sal_no',
                    xtype: 'MSearch_Salm',
                    matchFieldWidth: false,
                    forceSelection: false,
                    localStoreSortByWorkerDeptNo: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000',
                    value: ''
                },
            //{
            //    itemId: 'dep_no',
            //    name: 'dep_no',
            //    xtype: 'CbGrid_Dept',
            //    fieldLabel: '部&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp门'
            //},
            //{
            //    itemId: 'sal_no',
            //    name: 'sal_no',
            //    xtype: 'CbGrid_Salm',
            //    fieldLabel: '员&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp工'
            //},
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
                    if (confirm('确定导出吗？'))
                        window.location.href = '../downFields/' + _join.fieldpath;
                         // 打开Excel的报表 
                    //window.open('../downFields/' + _join.fieldpath);
                }
            });
        }
        else {
            GridStore.load({
                params: { action: 'GetData', sqlWhere: str, GetType: GetType, user_dep_no: val3,  depFindSub: val5 },
                callback: function () {
                    GridStore.group('sal_no', 'asc');
                }
            });
        }
    }

    // SunGrid
    cPanel = Ext.create('SunGridClass', {
        region: 'center',
        gridID: 'YGJS_aspx_GridA',
        pageID: 'YGJS_aspx',
        CompanyCDNO: 'C1002',
        store: GridStore,
        myMinHeight: 0,
        SaveMode: '1',
        getDefaultColumnsSetting: YGJS_Set.GridCols,
        features: [{
            groupHeaderTpl: '分组: {name}',
            ftype: 'groupingsummary'
        }],
        listeners: {
            MyRender: function (a, bb) {
                var me = this;

                cPanel.grid.on('itemdblclick', function (vthis, record, item, index, e, eOpts) {
                    if (!window.parent)
                        return false;

                    openFn = window.parent.tabPanel.openWindow;
                    var jx_noStr = record.get('js_no');
                    var nos = jx_noStr.split(',');

                    //如果是多个单号合并在一起，让用户选择其中一个
                    if (nos && nos.length > 1) {
                        if (!cPanel.grid.RMenu) {
                            cPanel.grid.RMenu = Ext.create('Ext.menu.Menu', {
                                width: 200,
                                margin: '0 0 10 0',
                                items: []
                            });
                        }

                        cPanel.grid.RMenu.show(record, function () {
                            cPanel.grid.RMenu.removeAll();
                            for (var i = 0; i < nos.length; ++i) {
                                cPanel.grid.RMenu.add({
                                    text: nos[i],
                                    handler: function () {
                                        //alert(this.text );
                                        openFn({ text: '计时工资输入', url: 'Sys/P_JsQty.aspx', params: { action: 'ViewTable', no: this.text} });
                                    }
                                });
                            }
                        });


                    }
                    else
                        openFn({ text: '计时工资输入', url: 'Sys/P_JsQty.aspx', params: { action: 'ViewTable', no: jx_noStr} });
                });
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
        }, '-', {
            text: '导出',
            width: 60,
            height: 32,
            //disable: true,
            style: {
                borderColor: 'black'
            },
            itemId: 'btntoxls',
            handler: function () {
                SearchData("A", 'get_excel');
            }
        },
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
                    var thisTabComp = pa.getComponent('Report_计时');

                    if (thisTabComp) {
                        thisTabComp.had_rendered = true;
                        pa.on('SendOrder', PageMonitor);
                        pa.getComponent('Report_计时').fireEvent('had_rendered', PageMonitor);

                        PageClose = function () {
                            var pa = window.parent.Ext.getCmp('tabPanel');
                            //通知上级tab 这已加载完成
                            if (pa) {
                                pa.getComponent('Report_计时').fireEvent('letcloseme');
                            }
                        } // PageClose
                    }
                }
            }

        }
    });
});