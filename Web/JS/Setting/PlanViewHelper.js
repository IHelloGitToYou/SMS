var PlanViewHelper = {};


PlanViewHelper._win = null;
PlanViewHelper._callBack = null;
PlanViewHelper._callBackScore = null;

PlanViewHelper.ShowWin = function (plan_no, wp_dep_no, user_dep_no, fnCallBack, fnExeclCallBack, fnScore) {
    if (PlanViewHelper._win == null)
        PlanViewHelper.CreateWin();


    var task1 = new Ext.util.DelayedTask(function () {
        PlanViewHelper.plan_no.setValue(plan_no);
        PlanViewHelper.wp_dep_no.setValue(wp_dep_no);
        PlanViewHelper.user_dep_no.setValue(user_dep_no);
    });

    task1.delay(600);

    PlanViewHelper._win.show();

    PlanViewHelper._callBack = fnCallBack;
    PlanViewHelper._callBack_Excel = fnExeclCallBack;
    PlanViewHelper._callBackScore = fnScore;
}
//ShowWin
//  开始时间，结束时间， 计划单  , 

PlanViewHelper.CreateWin = function () {
    var nPanel = Ext.create('Ext.form.Panel', {
        region: 'north',
        layout: {
            type: 'table',
            columns: 2,
            border: 0
        },
        defaults: {
            labelWidth: 90,
            maxWidth: 250,
            labelAlign: 'right',
            margin: '5 5 2 5'
        },
        items: [
            {
                itemId: 'startdd',
                name: 'startdd',
                xtype: 'datefield',
                fieldLabel: '开始日期',
                value: GlobalVar.MouthFirstDay,
                format: 'Y/m/d'
            },
            {
                itemId: 'enddd',
                name: 'enddd',
                xtype: 'datefield',
                fieldLabel: '结束日期',
                value: GlobalVar.MouthLastDay,
                format: 'Y/m/d'
            },
            {
                fieldLabel: '计划单',
                name: 'plan_no',
                itemId: 'plan_no',
                xtype: 'textfield'
            },
            {
                fieldLabel: '工序部门*',
                name: 'wp_dep_no',
                itemId: 'wp_dep_no',
                xtype: 'MSearch_DeptWP',
                value: WpConfig.UserDefault[GlobalVar.NowUserId].wp_dep_no || '000000',
                allowBlank: false
            },
            {
                fieldLabel: '员工部门*',
                name: 'user_dep_no',
                itemId: 'user_dep_no',
                xtype: 'MSearch_Dept',
                value: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000',
                allowBlank: false
            }
        ],
        tbar: [
                {
                    xtype: 'button',
                    height: 40,
                    text: '统计查询 ',
                    margin: '0 2 0 2',
                    handler: function () {
                        PlanViewHelper.findWQTable(function (record) {
                            Ext.callback(PlanViewHelper._callBack, PlanViewHelper._callBackScore, [PlanViewHelper, record]);
                        });
                    
                    }
                },
                 {
                    xtype: 'button',
                    height: 40,
                    text: '导出',
                    icon: '../JS/resources/MyImages/ms_excel.png',
                    margin: '0 2 0 2',
                     handler: function () {
                         Ext.callback(PlanViewHelper._callBack_Excel, PlanViewHelper._callBackScore);
                    }
                },
                {
                    xtype: 'button',
                    height: 40,
                    text: '上月',
                    margin: '0 2 0 2',
                    handler: function () {
                        if (!PlanViewHelper.startdd.getValue())
                            return;

                        var upMouthFirstDay = Ext.Date.add(PlanViewHelper.startdd.getValue(), Ext.Date.MONTH, -1);
                        var upMouthLastDay = Ext.Date.getLastDateOfMonth(upMouthFirstDay);

                        PlanViewHelper.startdd.setValue(upMouthFirstDay);
                        PlanViewHelper.enddd.setValue(upMouthLastDay);
                    }
                },
                {
                    xtype: 'button',
                    height: 40,
                    text: '本月',
                    margin: '0 2 0 2',
                    handler: function () {
                        PlanViewHelper.startdd.setValue(GlobalVar.MouthFirstDay);
                        PlanViewHelper.enddd.setValue( GlobalVar.MouthLastDay);
                    }
                }],
        listeners: {
            afterrender: function () {
                PlanViewHelper.startdd = nPanel.getComponent('startdd');
                PlanViewHelper.enddd = nPanel.getComponent('enddd');
                PlanViewHelper.plan_no = nPanel.getComponent('plan_no');
                PlanViewHelper.wp_dep_no = nPanel.getComponent('wp_dep_no');
                PlanViewHelper.user_dep_no = nPanel.getComponent('user_dep_no');
            }
        }
    });

    PlanViewHelper._win = Ext.create('Ext.window.Window', {
        closeAction: 'hide',
        title: '统计视图',
        //height: 200,
        //width: 400,
        layout: 'fit',
        items: nPanel 
    });
}


PlanViewHelper.findWQTable = function (fnCallback) {
    var searchParams = {};
    searchParams.action = 'SearchWQ';
    searchParams.NowUserId = GlobalVar.NowUserId;
    searchParams.TableType = "计件";
    searchParams.IsShareTable = false;  //是否分成页面

    searchParams.action = "SearchWQ";
    searchParams.plan_no = PlanViewHelper.plan_no.getValue();
    searchParams.user_dep_no = PlanViewHelper.user_dep_no.getValue();
    searchParams.wp_dep_no = PlanViewHelper.wp_dep_no.getValue();
    
    PlanViewHelper.SearchWQTableStore.load({
        params: searchParams,
        callback: function (records, operation, success) {
            if (records.length <= 0) {
                alert("没有任何[计件单据]无法统计！");
                return;
            }
            fnCallback(records[0]);
        }
    });
}
PlanViewHelper.SearchWQTableStore = Ext.create('Ext.data.Store', {
    model: 'WPQtyHeader_Model',
    proxy: {
        type: 'ajax',
        url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
        reader: {
            type: 'json'
        }
    }
});