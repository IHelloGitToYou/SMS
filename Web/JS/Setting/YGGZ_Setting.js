var YGGZ_Set = {}

// Model


YGGZ_Set.Model = Ext.define('YGGZ_Model', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'jx_no', type: 'string' },
        { name: 'jx_dd', type: 'date' },
        { name: 'sal_no', type: 'string' },
        { name: 'sal_name', type: 'string' },
        { name: 'dep_no', type: 'string' },
        { name: 'dep_name', type: 'string' },
        { name: 'clc_type', type: 'string' },       //工资类型
        
        { name: 'so_no', type: 'string' },
        { name: 'so_itm', type: 'string' },
        { name: 'prd_no', type: 'string' },
        { name: 'prd_name', type: 'string' },
        { name: 'wp_no', type: 'string' },
        { name: 'wp_name', type: 'string' },
        { name: 'qty', type: 'string' },
        { name: 'up_pair', type: 'number' },
        { name: 'up_pic', type: 'number' },
        { name: 'up_pair_list', type: 'string' },
        { name: 'amt', type: 'number' }, 
        { name: 'jsamt1', type: 'number' },
        { name: 'jsamt2', type: 'number' },
        { name: 'so_pic_qty', type: 'number' },
        { name: 'so_qty', type: 'number' }
    ]
});

// Store
YGGZ_Set.GetStore = function () {
    return Ext.create('Ext.data.Store', {
        model: YGGZ_Set.Model,
        autoLoad: false,
        //groupField: ['dep_no,sal_no'],
        sorters: [
        {
            property: 'clc_type',
            direction: 'ASC'
        }, {
            property: 'jx_dd',
            direction: 'ASC'
        }
        ],
        proxy: {
            type: 'ajax',
            url: '../ASHX/YGGZ.ashx',
            reader: {
                type: 'json'
                //                root: 'items',
                //                totalProperty: 'total'
            }
        }
    })
};

var GridStore = YGGZ_Set.GetStore();

// 计时的汇总
YGGZ_Set.JsModel = Ext.define('YGGZ_JsModel', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'sal_no', type: 'string' },
        { name: 'is_add', type: 'string' },
        { name: 'amt', type: 'number' },
    ]
});

YGGZ_Set.GetStore = function () {
    return Ext.create('Ext.data.Store', {
        model: YGGZ_Set.JsModel,
        autoLoad: false,
        proxy: {
            type: 'ajax',
            url: '../ASHX/YGJS.ashx',
            reader: {
                type: 'json'
            }
        }
    })
};

var GridJsStore = YGGZ_Set.GetStore();

var fnGetJsData = function (sal_no) {

    //var sal_no = summaryData.record.get('sal_no');
    alert(sal_no);
    var r = GridJsStore.findReocrd('sal_no', sal_no);
    alert(sal_no );
    if (r) {
        alert('T1');
        var obj = {};

        if (r.get('is_add') == 'Y') {
            amt1 = r.get('amt');
            alert('T2 ');
            var rIndex = GridJsStore.indexOf(r);
            var r2 = GridJsStore.findReocrd('sal_no', sal_no, rIndex);
            if (r2) {
                amt2 = r2.get('amt');
            }
        }

        if (r.get('is_add') != 'Y') {
            amt2 = r.get('amt');
            alert('T2 2');
            var rIndex = GridJsStore.indexOf(r);
            var r2 = GridJsStore.findReocrd('sal_no', sal_no, rIndex);
            if (r2) {
                amt1 = r2.get('amt');
            }
        }

        obj['amt1'] = amt1;
        obj['amt2'] = amt2;
        //return '计时:附加' + amt1 + '&nbsp元' + '&nbsp&nbsp' + '无附加' + amt2 + '&nbsp元';
        return obj;
    }

    return null;
}
// C#后台
    //1. dal  数据制表 1.超明细  2.汇总明细 
    
// GridCols
YGGZ_Set.GridCols = function () {
    return [
     { header: '工资类型', name: 'clc_type', dataIndex: 'clc_type', renderer: SCom.rdClcType },
     { header: '数据来源单', name: 'jx_no', dataIndex: 'jx_no', width: 200,
         summaryType: function (arrRes, field) {
             var num = 0.000;
             for (var i = 0; i < arrRes.length; ++i) {
                 num += arrRes[i].get('amt');
             }
             return num;
         },
         summaryRenderer: function (value) {
             return '计件金额合计' + Common_fixAmount(value, 3) + '&nbsp元';
         }
     },
     { header: '部门号', name: 'dep_no', dataIndex: 'dep_no', hidden: true },
     { header: '部门', name: 'dep_name', dataIndex: 'dep_name' },

     { header: '订单代号', name: 'so_no', dataIndex: 'so_no' },
     { header: '订单项次', name: 'so_itm', dataIndex: 'so_itm', hidden: true },
     { header: '订单数量', name: 'so_pic_qty', dataIndex: 'so_pic_qty', hidden: true },
     { header: '订单数量(个)', name: 'so_qty', dataIndex: 'so_qty', hidden: true },


     { header: '货号', name: 'prd_no', dataIndex: 'prd_no', hidden: true },
     { header: '货名', name: 'prd_name', dataIndex: 'prd_name' },
     { header: '工序号', name: 'wp_no', dataIndex: 'wp_no', hidden: true },
     { header: '工序', name: 'wp_name', dataIndex: 'wp_name',
         width: 200,
         summaryType: function (data, field_name) {
             var vsum1, vsum2;
             vsum1 = vsum2 = 0.00;

             for (var i = 0; i < data.length; ++i) {
                 //vsum1 = data[i].get('jsamt1');
                 vsum2 = data[i].get('jsamt2');
                 break;
             }
             return vsum2; //.toString() + '|' + vsum2.toString();
             //return {'jsamt1' : vsum1, 'jsamt2' : vsum2};
         },
         summaryRenderer: function (value, b, c) {
             //console.log(value);
             if (value > 0 || value < 0)
                 return '计时:无附加' + value + '(元)'
             //return '计时:附加' + value[0] + '&nbsp元' + '&nbsp&nbsp' + '无附加' + value[1] + '&nbsp元';
         }
     },
     { header: '数量', name: 'qty', dataIndex: 'qty', renderer: function (v, m, rec) { return v + '对' },
         summaryType: function (data, field_name) {
             var vsum1, vsum2;
             vsum1 = vsum2 = 0.00;

             for (var i = 0; i < data.length; ++i) {
                 vsum1 = data[i].get('jsamt1');
                 //vsum2 = data[i].get('jsamt2');
                 break;
             }
             return vsum1; //.toString() + '|' + vsum2.toString();
             //return {'jsamt1' : vsum1, 'jsamt2' : vsum2};
         },
         summaryRenderer: function (value, b, c) {
             //console.log(value);
             if (value > 0 || value < 0)
                 return '计时:附加' + value + '(元)'
             //return '计时:附加' + value[0] + '&nbsp元' + '&nbsp&nbsp' + '无附加' + value[1] + '&nbsp元';
         }
     },
     { header: '单价', name: 'up_pair', dataIndex: 'up_pair',
         width: 160,
         renderer: function (v, m, rec) { return v + '元 对' },
         summaryType: function (arrRes, field) {
             var num = 0.000,
                 num2 = 0.000;
             for (var i = 0; i < arrRes.length; ++i) {
                 var clc_type = arrRes[i].get('clc_type');
                 if (clc_type == '3')
                     num2 += arrRes[i].get('amt');
             }
             return num2;
         },
         summaryRenderer: function (value) {
             var str1 = '';
             if (value == 0)
                 str1 = '拼身:0元;';
             else
                 str1 = '拼身' + Common_fixAmount(value, 3) + '(元)';
             return str1;
         }
         ////             var sum = 0.00;
         ////             for (var i = 0; i < values.length; ++i) {
         ////                 alert('0');
         ////                 var sal_no = values[i].data.sal_no;
         ////                 alert('1');
         ////                 var res = fnGetJsData(sal_no);
         ////                 //                 if (res)
         ////                 //                     return '计时:附加' + res.amt1 + '&nbsp元' + '&nbsp&nbsp' + '无附加' + res.amt2 + '&nbsp元';
         ////                 //                 else
         ////                 //                     return '';
         ////                 alert('2');
         ////             }
         ////             return 12;
         ////         }
         ////         summaryRenderer: function (value, summaryData, dataIndex) {
         ////             //             var amt1 = 0.00, amt2 = 0.00;
         ////             //             console.log(summaryData);
         ////             //             //alert (typeof( summaryData.record )); 
         ////             //             var sal_no = summaryData.record.get('sal_no');

         ////             //             var r = GridJsStore.findReocrd('sal_no', sal_no);
         ////             //             if (r) {
         ////             //                 if (r.get('is_add') == 'Y'){
         ////             //                     amt1 = r.get('amt');

         ////             //                     var rIndex = GridJsStore.indexOf(r);
         ////             //                     var r2 = GridJsStore.findReocrd('sal_no', sal_no, rIndex);
         ////             //                     if (r2) {
         ////             //                         amt2 = r2.get('amt');
         ////             //                     }
         ////             //                 }

         ////             //                 if (r.get('is_add') != 'Y') {
         ////             //                     amt2 = r.get('amt');

         ////             //                     var rIndex = GridJsStore.indexOf(r);
         ////             //                     var r2 = GridJsStore.findReocrd('sal_no', sal_no, rIndex);
         ////             //                     if (r2) {
         ////             //                         amt1 = r2.get('amt');
         ////             //                     }
         ////             //                 }

         ////             //                 GridJsStore.indexOfRecord(r);
         ////             //                 return '计时:附加' + amt1 + '&nbsp元' + '&nbsp&nbsp' + '无附加' + amt2 + '&nbsp元';
         ////             //             }
         ////             //             else
         ////             return value;
         ////         }
     },
     { header: '单价(个)', name: 'up_pic', dataIndex: 'up_pic', renderer: function (v, m, rec) { return v + '元' }, hidden: true },
     { header: '单价组成', name: 'up_pair_list', dataIndex: 'up_pair_list', hidden: true },
     { header: '金额', name: 'amt', dataIndex: 'amt',
         width: 220,
         renderer: function (v, m, rec) { return v + '元' },
         summaryType: function (arrRes, field) {
             var num = 0.000;
             for (var i = 0; i < arrRes.length; ++i) {
                 var clc_type = arrRes[i].get('clc_type');
                 if (clc_type == '1' || clc_type == '2')
                     num += arrRes[i].get('amt');
             }
             return num
         },
         summaryRenderer: function (value) {
             var str1 = '';
             if (value == 0)
                 str1 = '剪纸与杂车:0元;';
             else
                 str1 = '剪纸与杂车' + Common_fixAmount(value, 3) + '(元)';
             return str1;
         }
     },
     { header: '员工号', name: 'sal_no', dataIndex: 'sal_no', hidden: true },
     { header: '员工', name: 'sal_name', dataIndex: 'sal_name',
         width: 250,
         summaryType: function (arrRes, field) {
             var num = 0.000;

             for (var i = 0; i < arrRes.length; ++i) {
                 var clc_type = arrRes[i].get('clc_type');
                 if (clc_type == '' || (clc_type != '1' && clc_type != '2' ))
                     num += arrRes[i].get('amt');
             }
             return num;
         },
         summaryRenderer: function (value) {
             return '其他小计' + Common_fixAmount(value, 3) + '(元)';
         }
     },
     { header: '计薪日期', name: 'jx_dd', dataIndex: 'jx_dd', xtype: 'datecolumn', format: 'Y/m/d' }
    ]
}

// 解决自定义 GroupTpl 功能

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

////Ext.Loader.setConfig({ enabled: true });
////Ext.Loader.setPath('Ext.ux', '../JS/ux');

////Ext.require([
////     //'Ext.ux.grid.feature.MultiGrouping',
////     //'Ext.ux.grid.feature.MultiGroupingSummaryMy',
////]);

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
                itemId: 'dep_no',
                name: 'dep_no',
                xtype: 'CbGrid_Dept',
                fieldLabel: '部&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp门'
            },
            {
                itemId: 'sal_no',
                name: 'sal_no',
                xtype: 'CbGrid_Salm',
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


    // SunGrid
    cPanel = Ext.create('SunGridClass', {
        region: 'center',
        gridID: 'YGGZ_aspx',
        pageID: 'YGGZ_aspx',
        CompanyCDNO: 'C1002',
        store: GridStore,
        myMinHeight: 0,
        SaveMode: '1',
        remoteGroup: true,
        remoteSort: true,
        getDefaultColumnsSetting: YGGZ_Set.GridCols,

        features: [{
            groupHeaderTpl: '分组: {name}',
            ftype: 'groupingsummary'
            ////            //ftype: 'multigrouping'
            ////            ftype: 'multigroupingsummarymy'
        }],
        listeners: {
            MyRender: function (a, bb) {
                var me = this;
                me.grid.on('itemdblclick', function (vthis, record, item, index, e, eOpts) {
                    if (!window.parent)
                        return false;

                    openFn = window.parent.tabPanel.openWindow;
                    var jx_noStr = record.get('jx_no');
                    var nos = jx_noStr.split(',');
                    //                    alert(nos.length);
                    //                    console.log(nos);
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
                                        openFn({ text: '计件工资输入', url: 'Sys/Wp_Qty.aspx', params: { action: 'ViewTable', no: this.text} });
                                    }
                                });
                            }
                        });


                    }
                    else
                        openFn({ text: '计件工资输入', url: 'Sys/Wp_Qty.aspx', params: { action: 'ViewTable', no: jx_noStr} });
                });
            }
        }
    });

    //A.超明细  B.汇总明细
    var SearchData = function (GetType, requestType, extraParams) {
        var str = ' 1=1 ';
        var str2 = ' 1=1 ';  //计时的条件
        var val1 = nPanel.startdd.getValue();
        var val2 = nPanel.enddd.getValue();
        var val3 = nPanel.dep_no.HiddenValue;
        var val4 = nPanel.sal_no.HiddenValue;
        var val5 = nPanel.depFindSub.checked;

        if (val1 && val1 != '') {
            str += ' and jx_dd >= \'' + Ext.Date.format(val1, 'Y/m/d') + '\' ';
            str2 += ' and js_dd >= \'' + Ext.Date.format(val1, 'Y/m/d') + '\' ';
        }
        else {
            val1 = '1901-01-01';
        }

        if (val2 && val2 != '') {
            str += ' and jx_dd <= \'' + Ext.Date.format(val2, 'Y/m/d') + '\' ';
            str2 += ' and js_dd <= \'' + Ext.Date.format(val2, 'Y/m/d') + '\' ';
        }
        else {
            val2 = '2299-01-01';
        }

        //        if (val3 && val3 != '') {
        //            str += ' and dep_no = \'' + val3 + '\' ';
        //            str2 += ' and dep_no = \'' + val3 + '\' ';
        //        }

        if (val4 && val4 != '') {
            str += ' and sal_no = \'' + val4 + '\' ';
            str2 += ' and sal_no = \'' + val4 + '\' ';
        }

        if (requestType && requestType == 'get_excel') {
            var cols = cPanel.grid.headerCt.getVisibleGridColumns();
            var ArrDataIndexs = [], ArrDataNames = [], ArrDataWidths = [];
            for (var i = 0; i < cols.length; ++i) {
                ArrDataIndexs.push(cols[i].dataIndex);
                ArrDataNames.push(cols[i].text);
                ArrDataWidths.push(cols[i].width);
            }

            if (!extraParams)
                extraParams = {};
            //console.log(extraParams);
            var paras = { action: 'GetData', action2: 'Get_Excel', GetType: GetType, sqlWhere: str, sqlWhereJs: str2,
                    ArrDataIndexs: ArrDataIndexs.join(','),
                    ArrDataNames: ArrDataNames.join(','),
                    ArrDataWidths: ArrDataWidths.join(','),
                    startdd: val1,
                    enddd: val2,
                    user_dep_no: val3,
                    depFindSub: val5
                };
            //console.log(Ext.Object.merge(paras, extraParams));

            Ext.Ajax.request({
                url: GridStore.proxy.url,
                params: Ext.Object.merge(paras, extraParams),
                success: function (response) {
                    var _join = Ext.JSON.decode(response.responseText);
                    // 打开Excel的报表 
                    if (confirm('确定导出吗？'))
                        window.location.href = '../downFields/' + _join.fieldpath;
                    //window.open('../downFields/' + _join.fieldpath);
                }
            });
        }
        else {
            //            GridJsStore.load({
            //                params: { action: 'GetData', sqlWhere: str2 },
            //                callback: function () {
            GridStore.load({
                params: {
                    action: 'GetData', GetType: GetType,
                    sqlWhere: str, sqlWhereJs: str2,
                    user_dep_no: val3,
                    depFindSub: val5
                },
                callback: function () {
                    //GridStore.group(['dep_no', 'sal_no'], 'asc');
                    GridStore.group('sal_no', 'asc');
                }
            });
        }
    }

    // sPanel   超明细  2.汇总明细  3.导出  4.关闭
    sPanel = Ext.create('Ext.toolbar.Toolbar', {
        nowSearchType: 'A',
        region: 'south',
        items: ['-', {
            text: '超明细',
            width: 90,
            height: 32,
            style: {
                borderColor: 'black'
            },

            itemId: 'btnnew',
            handler: function () {
                SearchData("A");
                sPanel.nowSearchType = 'A';
            }

        }, '-', {
            text: '汇总明细',
            width: 90,
            height: 32,
            style: {
                borderColor: 'black'
            },
            itemId: 'btnfind',
            handler: function () {
                SearchData("B");
                sPanel.nowSearchType = 'B';
            }
        }, '-', {
            text: '导出',
            width: 60,
            height: 32,
            //disable: true,
            style: {
                borderColor: 'black'
            },
            itemId: 'btnExport',
            handler: function () {
                if (!sPanel.ExportWin) {
                    sPanel.ExportWin = Ext.create('Ext.window.Window', {
                        title: '导出前设置',
                        //// private int TitleHeight = 20;
                        ////    private int TitleFontSize = 15;
                        ////    private int ColsNameHeight = 15;
                        ////    private int ColsNameFontSize = 12;
                        ////    private int BodyHeight = 10;
                        ////    private int BodyFontSize = 8;
                        layout :'fit',
                        items: [
                            {
                                xtype: 'form',
                                
                                defaults: {
                                    xtype: 'numberfield',
                                    style:'margin:0px',
                                    labelAlign :'right'
                                },
                                items: [
                                    { fieldLabel: '标题内容格式', name: 'HeadTitleFormula', value: "部门{0}员工{1}2月工资统计表", xtype: 'textfield' },
                                    { fieldLabel: '标题&nbsp&nbsp&nbsp&nbsp&nbsp高度&nbsp&nbsp', name: 'TitleHeight', value: 18 },
                                    { fieldLabel: '标题字体大小', name: 'TitleFontSize', value: 13 },
                                    { fieldLabel: '栏首&nbsp&nbsp&nbsp&nbsp&nbsp高度&nbsp&nbsp', name: 'ColsNameHeight', value: 13 },
                                    { fieldLabel: '栏首字体大小', name: 'ColsNameFontSize', value:10 },
                                    { fieldLabel: '内容&nbsp&nbsp&nbsp&nbsp&nbsp高度&nbsp&nbsp', name: 'BodyHeight', value: 8 },
                                    { fieldLabel: '内容字体大小', name: 'BodyFontSize', value: 7.5 },
                                    { fieldLabel: '合计&nbsp&nbsp&nbsp&nbsp&nbsp高度&nbsp&nbsp', name: 'TotalHeight', value: 15 },
                                    { fieldLabel: '合计字体大小', name: 'TotalFontSize', value: 9 },
                                    { fieldLabel: '合计&nbsp&nbsp&nbsp&nbsp&nbsp位置&nbsp&nbsp', name: 'TotalPosition', value: 1, decimalPrecision: 0 }
                                    
                                ]
                            }
                        //{ fieldLabel: '标题高度', name: 'TitleHeight', value: 20 },
                        ],
                        bbar: [
                            { xtype: 'button', text: '确定设置',
                                handler: function () {
                                    //var op = {};
                                    var op = sPanel.form.getValues();

                                    SearchData(sPanel.nowSearchType, 'get_excel', op);
                                }
                            }
                        ],
                        listeners: {
                            boxready: function () {
                                sPanel.form = sPanel.ExportWin.down('.form');
                                //                                sPanel.boxTitleHeight = sPanel.ExportWin.down('numberfield[name=TitleHeight]');
                                //                                sPanel.boxTitleFontSize = sPanel.ExportWin.down('numberfield[name=TitleFontSize]');
                                //                                sPanel.boxColsNameHeight = sPanel.ExportWin.down('numberfield[name=ColsNameHeight]');
                                //                                sPanel.boxColsNameFontSize = sPanel.ExportWin.down('numberfield[name=ColsNameFontSize]');
                                //                                sPanel.boxBodyHeight = sPanel.ExportWin.down('numberfield[name=BodyHeight]');
                                //                                sPanel.boxBodyFontSize = sPanel.ExportWin.down('numberfield[name=BodyFontSize]');
                            }
                        }
                    });
                }
                sPanel.ExportWin.show();

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
    function monitor(url, orderParams) {

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
                    var thisTabComp = pa.getComponent('Report_工资导出');

                    if (thisTabComp) {
                        thisTabComp.had_rendered = true;
                        pa.on('SendOrder', monitor);
                        pa.getComponent('Report_工资导出').fireEvent('had_rendered', monitor);

                        PageClose = function () {
                            var pa = window.parent.Ext.getCmp('tabPanel');
                            //通知上级tab 这已加载完成
                            if (pa) {
                                pa.getComponent('Report_工资导出').fireEvent('letcloseme');
                            }
                        } // PageClose
                    }
                }
            }

        }
    });
});