
DoRunCheck = function (Ask_id, Check_itm, CheckReseult) {
    var check_msg = CheckReseult == 'T' ? '同意 ' : '不同意';
    CheckFlowHelper.DoCheck(Ask_id, Check_itm, GlobalVar.NowUserId, check_msg, CheckReseult, function (text) {
        var json = Ext.JSON.decode(text);
        alert(json.msg);
        
        Ext.callback(CheckFlowHelper.AfterCheckCallback, CheckFlowHelper.AfterCheckCallbackScope);

    }, CheckFlowHelper.AfterCheckCallbackScope);
}


var CheckFlowHelper = {};
CheckFlowHelper.AskPost = function (params, fnCallBack, scope) {
    params.NowUserId = GlobalVar.NowUserId;
    Ext.Ajax.request({
        url: commonVar.urlCDStr + 'ASHX/CheckHelper.ashx',
        params: params,
        success: function (response) {
            var text = response.responseText;
            Ext.callback(fnCallBack, scope, [text]);
        },
        failure: function (response, opts) {
            alert('操作失败:' + response.status + "[" + response.responseText + "]");
        }
    });
}

CheckFlowHelper.GetAskListByJX = function (jx_no, fnCallBack, scope) {
    CheckFlowHelper.AskPost({ action: 'GetAskByJX', jx_no: jx_no }, fnCallBack, scope);
}

CheckFlowHelper.GetAskListByCheckMan = function (CheckMan, fnCallBack, scope) {
    CheckFlowHelper.AskPost({ action: 'GetAskByCheckMan', check_man: CheckMan, check_state: '0' }, fnCallBack, scope);
}

CheckFlowHelper.GetAskAllList = function (only_working, fnCallBack, scope) {
    CheckFlowHelper.AskPost({ action: 'GetAskAll', only_working: only_working == 'T' ? 'T' : 'F' }, fnCallBack, scope);
}

CheckFlowHelper.GetFlow = function (check_no, fnCallBack, scope) {
    CheckFlowHelper.AskPost({ action: 'GetFlow', check_no: check_no }, fnCallBack, scope);
}

CheckFlowHelper.ResetFlow = function (check_no, check_man, fnCallBack, scope) {
    CheckFlowHelper.AskPost({ action: 'ResetFlow', check_no: check_no, check_man: check_man }, fnCallBack, scope);
}

CheckFlowHelper.DoCheck = function (ask_id, check_itm, check_man, check_msg, check_result, fnCallBack, scope) {
    CheckFlowHelper.AskPost({
        action: 'RunCheck',
        ask_id: ask_id,
        check_itm: check_itm,
        check_man: check_man,
        check_msg : check_msg,
        check_result: check_result == 'T' ? 'T' : 'F'
    }, fnCallBack, scope);
}

//最新审核资料创建日期
CheckFlowHelper.LastFreshTime;
CheckFlowHelper.NowUserCheckStore = Ext.create('Ext.data.Store', {
    model: 'Model_AskPrice',
    data: []
});

CheckFlowHelper.CreateRadio = function () {
    var task = Ext.TaskManager.start({
        run: function () {
            CheckFlowHelper.GetAskListByCheckMan(GlobalVar.NowUserId, function (text) {
                
                var checkList = Ext.JSON.decode(text);
                CheckFlowHelper.NowUserCheckStore.add(checkList);
                var nowTime = CheckFlowHelper.NowUserCheckStore.max('n_dd');
                console.log(nowTime + ' - nowTime ');

                if (CheckFlowHelper.NowUserCheckStore.getCount() > 0 &&
                      (!CheckFlowHelper.LastFreshTime || nowTime > CheckFlowHelper.LastFreshTime)) {

                    commonVar.Alert('亲!您收到新的审核任务,求你审核啦!<br> 位置:工资录入->调价申请审核列表','', null, null, 30000);
                }

                if (nowTime) {
                    CheckFlowHelper.LastFreshTime = nowTime;
                }

            }, CheckFlowHelper);
        },
        interval: 1000 * 30
    });

    //task.start();
}

//{ name: 'ask_id', type: 'int' },
//{ name: 'check_state', type: 'int' },
//{ name: 'check_no', type: 'string' },
//{ name: 'check_itm', type: 'string' },
//{ name: 'check_man', type: 'string' },

//{ name: 'n_dd', type: 'date' },
//{ name: 'n_man', type: 'string' },
//{ name: 'jx_no', type: 'string' },

//{ name: 'prd_no', type: 'string' },
//{ name: 'wp_no', type: 'string' },
//{ name: 'wp_name', type: 'string' },

//{ name: 'up_pic', type: 'number' },
//{ name: 'up_pair', type: 'number' },
//{ name: 'ask_up_pic', type: 'number' },
//{ name: 'ask_up_pair', type: 'number' },

//{ name: 'ask_reason', type: 'string' },
//{ name: 'check_msg', type: 'string' }
CheckFlowHelper.GetGridColumns = function (FnCallback, FnCallbackScope) {

    CheckFlowHelper.AfterCheckCallback = FnCallback;
    CheckFlowHelper.AfterCheckCallbackScope = FnCallbackScope;

    var newArray = [];
    newArray.push({ text: '序号', xtype: 'rownumberer', width: 60 });
    newArray.push({
        text: '审核状态', dataIndex: 'check_state', width: 100,
        renderer: function (v, m, rec) {
            switch (v) {
                case 0:
                    return '审核中';
                case 1:
                    return '审核通过';
                case 2:
                    return '审核不通过';
            }
        }
    });
    newArray.push({
        text: '-', dataIndex: 'ask_id', width: 100, align: 'center',
        renderer: function (v, m, rec, rowIndex) {
            m.tdAttr = 'data-qtip="' + '同意' + '"';
            if (GlobalVar.NowUserId == rec.get('check_man') && rec.get('check_state') == 0) {
                return '<button type="button" ' +
                       '  class="x-btn x-unselectable x-btn-default-small x-noicon x-btn-noicon x-btn-default-small-noicon" '
                       + ' onclick=DoRunCheck(' + rec.get('ask_id') + ',' + rec.get('check_itm') + ',"T") >同意</button>';
            }
            else {
                return '';
            }
        }
    });

    newArray.push({
        text: '-', dataIndex: 'ask_id', width: 100, align: 'center',
        renderer: function (v, m, rec, rowIndex) {
            m.tdAttr = 'data-qtip="' + '不同意' + '"';
            if (GlobalVar.NowUserId == rec.get('check_man') && rec.get('check_state') == 0) {
                return '<button type="button" ' +
                       '  class="x-btn x-unselectable x-btn-default-small x-noicon x-btn-noicon x-btn-default-small-noicon" '
                       + ' onclick=DoRunCheck(' + rec.get('ask_id') + ',' + rec.get('check_itm') + ',"F") >不同意</button>';
            }
            else {
                return '';
            }
        }
    });
    
    newArray.push({ text: '计件输入单', dataIndex: 'jx_no', width: 100 });
    newArray.push({ text: '生产计划', dataIndex: 'plan_no', width: 100 });
    newArray.push({ text: '货号', dataIndex: 'prd_no', width: 100 });
    newArray.push({ text: '工序', dataIndex: 'wp_name', width: 100 });
    newArray.push({
        text: '申请人', dataIndex: 'n_man_name', width: 90
    });
    newArray.push({ text: '申请日期', dataIndex: 'n_dd', width: 100, xtype: 'datecolumn', format: 'Y-m-d' });
    newArray.push({ text: '工序单价(原对)', dataIndex: 'up_pair', width: 100 });
    newArray.push({ text: '申请单价(对)', dataIndex: 'ask_up_pair', width: 100 });
    newArray.push({ text: '申请原因', dataIndex: 'ask_reason', width: 200 });

    newArray.push({ text: '当前处理人', dataIndex: 'check_man_name', width: 100 });
    
    return newArray;
}


//'Model_AskPrice'
//轮询审核工具,可传入CallBackFn(DataStore, DataChanged)


//制作显示报表,与审核按钮.
//     当前处理人, 计件单,货号工序,申请日期,原工序单价,申请单价,申请原因, 同意, 不同意. 审流号,审流步骤, 审核状态   0.审核中 1.同意 2.不同意

//审核流程编辑Grid
//
CheckFlowHelper.ShowFlowEditWindow = function(check_no)
{
    var flowStore =  Ext.create('Ext.data.Store', {
        model: 'Model_CheckFlow',
        data: []
    });

    CheckFlowHelper.GetFlow(check_no, function (text) {
        var json = Ext.JSON.decode(text);
        flowStore.add(json);
    }, flowStore);

    var grid = Ext.create('Ext.grid.Panel', {
        margin: 5,
        store: flowStore,
        columns: [
            { text: '顺序', xtype: 'rownumberer', width: 60 },
            {
                text: '审批人员', dataIndex: 'check_man',
                editor: {
                    xtype: 'MSearch_SYSUser'
                },
                renderer: GlobalVar.rdSYSUserName
            }
        ],
        bbar: [
            {
                text: '修改保存', handler: function () {
                    //check_no
                    var check_mans = [];
                    flowStore.findBy(function (qRec) {
                        if (qRec.get('check_man')) {
                            check_mans.push(qRec.get('check_man'));
                        }
                    });
                    var postString = check_mans.join();
                    var win = this.up('window');
                    CheckFlowHelper.ResetFlow(check_no, postString, function (text) {
                        var json = Ext.JSON.decode(text);
                        if (json.result == false) {
                            alert(json.msg);
                        }
                        else {
                            win.close();
                        }
                    }, flowStore);
                }
            }
        ],
        plugins: [
           Ext.create('Ext.grid.plugin.CellEditing', {
               clicksToEdit: 1
               //listeners: {
               //    beforeedit: OnWQGridBeforeEdit,
               //    edit: OnWQGridEdit
               //}
           })
        ]
    });

    var win = Ext.create('Ext.window.Window', {
        title: '调价审核流程',
        height: 200,
        width: 380,
        resizable:false,
        items: grid,
        listeners: {
            show: function () {
                
            }
        }
    });

    win.show();
}