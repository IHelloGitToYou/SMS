var WpQty_Set = {};

Ext.onReady(function () {

    // 列复制菜单
    var cellHeadMenu = Ext.create('Ext.menu.Menu', {
        width: 100,
        items: [{
            text: '列复制',
            handler: function () {
                if (!cellHeadMenu.column)
                    return false;
                var store = cellHeadMenu.store,
                    cnt = store.getCount(),
                    dataIndex = cellHeadMenu.column.dataIndex,
                    i = 0;
                cellHeadMenu.copyData = [];

                for (; i < cnt; ++i) {
                    var rec = store.getAt(i);
                    var type = rec.get('type');
                    if (type == 'sal_no') {
                        cellHeadMenu.copyData.push(rec.get(dataIndex));
                    }
                }
                //console.log('复制完成');
            }
        }, {
            text: '列粘贴',
            handler: function () {
                if (!cellHeadMenu.copyData) {
                    alert("你还末复制呢！！姑娘，先生");
                    return false;
                }

                var store = cellHeadMenu.store,
                    cnt = store.getCount(),
                    dataIndex = cellHeadMenu.column.dataIndex,
                    i = 0,
                    vi = 0;

                if (dataIndex == 'text' || dataIndex == 'value')
                    return false;

                Ext.suspendLayouts();

                for (; i < cnt; ++i) {
                    var rec = store.getAt(i);
                    var type = rec.get('type');

                    if (type == 'sal_no') {
                        rec.set(dataIndex, cellHeadMenu.copyData[vi]);
                        ++vi;
                    }
                }
                Ext.resumeLayouts(false);

                Ext.getCmp('GridId-normal').plugins[0].fireEvent('edit', null, { record: store.getAt(vi - 1), field: dataIndex, value: '新值' });

                //console.log('粘完成');
            }
        }, '-', '-', '-', '-', '-', {
            text: '列清空',
            handler: function () {
                var store = cellHeadMenu.store,
                    cnt = store.getCount(),
                    dataIndex = cellHeadMenu.column.dataIndex,
                    i = 0;

                Ext.suspendLayouts();

                for (; i < cnt; ++i) {
                    var rec = store.getAt(i);
                    var type = rec.get('type');

                    if (type == 'sal_no') {
                        rec.set(dataIndex, 0);
                    }
                }
                Ext.resumeLayouts(false);
                Ext.getCmp('GridId-normal').plugins[0].fireEvent('edit', null, { record: store.getAt(vi - 1), field: dataIndex, value: '新值' });

                //                if (Grid.TaskRuning == false) {
                //                    Grid.TaskField.push(dataIndex);
                //                }
                //                else {
                //                    Grid.TaskField2.push(dataIndex);
                //                }
                //console.log('列清空完成');
            }
        }]
    });

    ///下拉移动输入框
    function specialkeyfunction(obj, e) {

        var grid = Ext.getCmp('GridId-normal'); //GridId - locked
        var code = e.getCharCode(),
            pos = grid.view.getSelectionModel().getCurrentPosition(),
            ce = grid.plugins[0];

        //console.log("special key event" + pos.column);
        var maxRows = (grid.MaxRecIndex || 50);
        var maxColumns = (grid.MaxColIndex || 40);
        var rowSelected = pos.row;
        var colSelected = pos.column;



        if (code == "37") {
            if (colSelected >= 1) {
                ce.startEditByPosition({ row: rowSelected, column: colSelected - 1 });
                Grid.taskSelectText.delay(10);
                //Grid.GridNormal.CurrentColumn = colSelected - 1;
            }
        }
        else if (code == "39") {
            if (colSelected < (maxColumns - 1)) {
                ce.startEditByPosition({ row: rowSelected, column: colSelected + 1 });
                Grid.taskSelectText.delay(10);
                //Grid.GridNormal.CurrentColumn = colSelected + 1;
            }
        }
        else if (code == "38") {
            if (rowSelected > 0) {
                ce.startEditByPosition({ row: rowSelected - 1, column: colSelected });
                Grid.taskSelectText.delay(10);
            }
        }
        else if (code == "40") {
            if (rowSelected < (maxRows - 1)) {
                ce.startEditByPosition({ row: rowSelected + 1, column: colSelected });
                Grid.taskSelectText.delay(10);
            }
        }
        else if (code == "13") {
            if (rowSelected < (maxRows - 1)) {
                //Common_RunDelayFn(function () {
                ce.startEditByPosition({ row: rowSelected + 1, column: colSelected });
                Grid.taskSelectText.delay(10);
                //}, 150);
            }
        }
        //console.log('CE ok');
    }

    WpQty_Set.ViewOriginalTable = function (table_no) {
        WpQty_Set.SearchWqStore.load({
            params: {
                action: 'GetTalbe',
                no: table_no
            },
            callback: function (records, operation, success) {
                if (records && records.length > 0) {
                    SearchSoPanel.grid.fireEvent('itemdblclick', SearchSoPanel.grid, records[0]);
                }
                else
                    alert('找不到单号' + table_no);
            }
        });
    }

    var myMask = new Ext.LoadMask(Ext.getBody(), { msg: "请耐心等候..." });

    var loadGridUI = function (LoadType) {
        if (Grid && Grid.TimeId) {
            window.clearInterval(Grid.TimeId);
        }

        if (false == HeadPanel.isValid()) {
            CommMsgShow('提示', '请先填写必录项(红色边框)');
            return false;
        }

        myMask.show();
        Ext.Ajax.request({
            url: '../ASHX/Wp_Qty.ashx',
            params: {
                action: LoadType,     //TalbeCreate 开始录制   
                jx_dd: HeadPanel.jx_dd.getValue(),
                prd_no: HeadPanel.prd_no.getValue(),
                so_no: HeadPanel.so_no.getValue(),
                ut: HeadPanel.view_pic_num.getValue() == true ? 2 : 1,         //1.对,2.个
                so_itm: '-1',   //后台确定
                cus_no: '-1',   //后台确定
                wpdep_nos: '\'' + HeadPanel.wp_dep_no.getValue() + '\'',    // 要求是用 dep_no in()  所以要加好 '' 号
                wpdep_no_empty: HeadPanel.user_dep_no.getValue() == '' ? true : false,
                user_dep_no: HeadPanel.user_dep_no.getValue(),
                jx_nos: (LoadType == 'TalbeCreate') ? '\'\'' : '\'' + HeadPanel.jx_no.getValue() + '\''
            },
            success: function (response) {



                var text = unescape(response.responseText);
                var Json = Ext.JSON.decode(text);
                if (Json.result == true) {

                    OnDrawTable(Json.json);

                    if (LoadType == 'TalbeCreate') {
                        fnCommonCreateLastNo('JX', HeadPanel.getComponent('jx_no'), function () { });
                        HeadPanel.state = 'TableAdd';
                    }
                    else
                        HeadPanel.state = 'TalbeUpdate';
                }
                else {
                    CommMsgShow('异常', unescape(Json.errmsg), true);
                }
                myMask.hide();
            },
            failure: function (form, action) {
                myMask.hide();
                CommMsgShow('异常', unescape(form.responseText), true);
            }
        });
    }



    //计薪单号	jx_no	varchar(40)
    //计薪日期	jx_dd	datetime
    //数据责任员	sal_no	varchar(40)
    //数据输入员	copy_sal_no	varchar(40)
    //订单代号	so_no	varchar(40)
    //订单项次	so_itm	int
    //货品代号	prd_no	varchar(40)
    //工序所属部门	wp_dep_no	varchar(40)
    //员工所属部门	user_dep_no	varchar(40)
    //显示单价	ut	varchar(2)	1.对,2.个
    var HeadPanel = Ext.create('Ext.form.Panel', {
        region: 'north',
        layout: {
            type: 'table',
            columns: 3
        },
        url: '../ASHX/Wp_Qty.ashx',
        defaults: {
            width: 250,
            labelWidth: 100,
            xtype: 'textfield',
            margin: '2 0 2 5'
        },
        items: [
          {
              fieldLabel: '计薪日期',
              name: 'jx_dd',
              itemId: 'jx_dd',
              xtype: 'datefield',
              format: 'Y/m/d',
              value: new Date(),
              allowBlank: false
          },
          {
              fieldLabel: '计薪单号',
              name: 'jx_no',
              itemId: 'jx_no',
              allowBlank: false
          },
          {
              fieldLabel: '录入人员',
              name: 'sal_no',
              itemId: 'sal_no',
              xtype: 'MSearch_Salm'
              //value: NowUserId
              //allowBlank: false
          },
          {
              fieldLabel: '订单代号*',
              name: 'so_no',
              itemId: 'so_no',
              allowBlank: false,
              xtype: 'MSearch_MF_SO',
              proxyUrl: commonVar.urlCDStr + 'ASHX/MF_SO.ashx?action=GetPrdNoListInMF_SO',
              listeners: {
                  change: function (vthis, newValue, oldValue, eOpts) {
                      //if (!newValue)
                      //    HeadPanel.prd_no.store.proxy.url = '../&so_no=';
                      //else
                      //    HeadPanel.prd_no.store.proxy.url = "../ASHX/MF_SO.ashx?action=GetPrdNoListInMF_SO&so_no=" + newValue + "";
                  }
              }
          },
          {
              fieldLabel: '货品代号*',
              name: 'prd_no',
              itemId: 'prd_no',
              xtype: 'MSearch_Prdt',
              allowBlank: false,
              queryMode:'remote',
              store: new Ext.data.Store({
                  model: 'Model_Prdt',
                  pageSize: 1000,
                  proxy: {
                      type: 'ajax',
                      url: '../ASHX/MF_SO.ashx?action=GETDATAPrdNo_with_So',
                      reader: {
                          type: 'json',
                          root: 'items',
                          totalProperty: 'total'
                      }
                  }
              }),
              listeners: {
                  change: function (vthis, newValue, oldValue, eOpts) {
                      if (!newValue)
                          HeadPanel.so_no.store.proxy.url = '../ASHX/MF_SO.ashx?action=GetSoNoListInMF_SO&prd_no=';
                      //HeadPanel.so_no.MyAddtionalParam = '';
                      else
                          HeadPanel.so_no.store.proxy.url = "../ASHX/MF_SO.ashx?action=GetSoNoListInMF_SO&prd_no=" + newValue + "";
                      //HeadPanel.so_no.MyAddtionalParam = '';
                  }
              }
          },
          {
              fieldLabel: '工序部门',
              name: 'wp_dep_no',
              itemId: 'wp_dep_no',
              xtype: 'MSearch_DeptWP'
          },
          {
              fieldLabel: '员工部门*',
              name: 'user_dep_no',
              itemId: 'user_dep_no',
              xtype: 'MSearch_Dept',
              allowBlank: false
          },
          {
              xtype: 'fieldcontainer',
              items: [{
                  xtype: 'button',
                  text: '开始录入',
                  margin: '0 5 0 5',
                  handler: function () {
                      //HeadPanel.view_pic_num.enable(true);
                      var ActionType = (HeadPanel.state || 'TableAdd') == 'TableAdd' ? 'TableAdd' : 'TalbeUpdate';

                      if (ActionType == 'TalbeUpdate')
                          HeadPanel.jx_dd.setValue(new Date());

                      loadGridUI('TalbeCreate');
                  }
              }]
          },
          {
              fieldLabel: '订单项次',
              name: 'so_itm',
              xtype: 'hiddenfield'
          },
            {
                xtype: 'checkbox',
                id: 'view_pic_num',
                itemId: 'view_pic_num',
                
                boxLabel: '个数显示',
                checked: false,
                disabled: true,
                listeners: {
                    change: function (v, newV, oldV) {
                        // 已存在的不能修改这个栏位                        
                        view_pic_numChecked = newV;
                        //  var stateNow = (HeadPanel.state || 'TableAdd') == 'TableAdd' ? 'TableAdd' : 'TalbeUpdate'
                        //  if (stateNow == 'TalbeUpdate') {
                        //      CommMsgShow('提示', '已保存的单据不能修改显示单位', true);
                        //      return false;
                        //  }
                    }
                }
            }
        ],
        listeners: {
            afterrender: function () {
                HeadPanel.prd_no = HeadPanel.getComponent('prd_no');
                HeadPanel.jx_dd = HeadPanel.getComponent('jx_dd');
                HeadPanel.so_no = HeadPanel.getComponent('so_no');
                //HeadPanel.so_itm =  HeadPanel.getComponent('so_itm');

                HeadPanel.sal_no = HeadPanel.getComponent('sal_no');

                HeadPanel.jx_no = HeadPanel.getComponent('jx_no');
                HeadPanel.wp_dep_no = HeadPanel.getComponent('wp_dep_no');
                HeadPanel.user_dep_no = HeadPanel.getComponent('user_dep_no');
                HeadPanel.jx_nos = HeadPanel.getComponent('jx_nos');
                HeadPanel.view_pic_num = Ext.getCmp('view_pic_num');
            }
        }
    });


    WpQty_Set.HModel = Ext.define('WpQty_Set.HModel', {
        extend: 'Ext.data.Model',
        fields: [
        { name: 'jx_no', type: 'string' },
        { name: 'jx_dd', type: 'date' },
        { name: 'sal_no', type: 'string' },
        { name: 'sal_name', type: 'string' },
        { name: 'copy_sal_no', type: 'string' },
        { name: 'copy_sal_name', type: 'string' },
        { name: 'so_no', type: 'string' },
        { name: 'so_itm', type: 'string' },
        { name: 'ut', type: 'number' },
        { name: 'prd_no', type: 'string' },
        { name: 'prd_name', type: 'string' },

        { name: 'wp_dep_no', type: 'string' },
        { name: 'wp_dep_name', type: 'string' },
        { name: 'user_dep_no', type: 'string' },
        { name: 'user_dep_name', type: 'string' },


        { name: 'n_man', type: 'string' },
        { name: 'n_man_name', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_man_name', type: 'string' },
        { name: 'e_dd', type: 'date' }
    ]
    });

    WpQty_Set.SearchWqStore = Ext.create('Ext.data.Store', {
        model: WpQty_Set.HModel,
        autoLoad: false,
        sorters: [{
            property: 'jx_dd',
            direction: 'desc'
        },
        {
            property: 'n_dd',
            direction: 'desc'
        }],
        proxy: {
            type: 'ajax',
            url: '../ASHX/Wp_Qty.ashx',
            reader: {
                type: 'json'
            }
        }
    });

    WpQty_Set.SearchWqCols = function () {
        return [
             { header: '计薪日', name: 'jx_dd', dataIndex: 'jx_dd', xtype: 'datecolumn', format: 'm-d', width: 60 },
             { header: '计薪单', name: 'jx_no', dataIndex: 'jx_no', width: 100 },
             { header: '订单', name: 'so_no', dataIndex: 'so_no', width: 100 },
             { header: '货品号', name: 'prd_no', dataIndex: 'prd_no' },
             { header: '单位', name: 'ut', dataIndex: 'ut', width: 50, renderer: function (v, m, rec) { return v == 1 ? '对' : '个'; } },
             { header: '货名', name: 'prd_name', dataIndex: 'prd_name', hidden: true },

             { header: '数据责任员', name: 'sal_name', dataIndex: 'sal_name', hidden: true },
             { header: '数据输入员', name: 'copy_sal_name', dataIndex: 'copy_sal_name', hidden: true },

             { header: '工序部门号', name: 'wp_dep_no', dataIndex: 'wp_dep_no', hidden: true },
             { header: '工序部门名', name: 'wp_dep_name', dataIndex: 'wp_dep_name' },

             { header: '员工部门号', name: 'user_dep_no', dataIndex: 'user_dep_no', hidden: true },
             { header: '员工部门名', name: 'user_dep_name', dataIndex: 'user_dep_name' },

             { header: '创建人员', name: 'n_man', dataIndex: 'n_man', tdCls: 'disabled_column', hidden: true },
             { header: '创建时间', name: 'n_dd', dataIndex: 'n_dd', xtype: 'datecolumn', format: 'Y/m/d', tdCls: 'disabled_column', hidden: true },
             { header: '修改人员', name: 'e_man', dataIndex: 'e_man', tdCls: 'disabled_column', hidden: true },
             { header: '修改时间', name: 'e_dd', dataIndex: 'e_dd', xtype: 'datecolumn', format: 'Y/m/d', tdCls: 'disabled_column', hidden: true }
        ];
    }

    //计薪单号	jx_no	varchar(40)
    //计薪日期	jx_dd	datetime
    //数据责任员	sal_no	varchar(40)
    //数据输入员	copy_sal_no	varchar(40)
    //订单代号	so_no	varchar(40)
    //订单项次	so_itm	int
    //货品代号	prd_no	varchar(40)
    //工序所属部门	wp_dep_no	varchar(40)
    //员工所属部门	user_dep_no	varchar(40)
    //显示单价	ut	varchar(2)	1.对,2.个



    var RowTypeRender = function (value) {
        //return value;
        switch (value) {
            case 'pic_num':
                return '个数/对';
                break;
            case 'up_pair':
                return '单价';
                break;
            case 'up_pic':
                return '单价'; //件
                break;
            case 'max_qty':
                return '应产量';
                break;
            case 'done_qty':
                return '已产量';
                break;

            case 'this_sum':
                return '本期合计';
                break;
            case 'sum':
                return '总计';
                break;
        }
        return '';
    }


    var CellRender = function (value, mate, rec) {
        //        console.log(' cellRender ' + mate.cellIndex + '  ' + rec.get('type'));
        var type = rec.get('type');

        if (!Grid.RCellSet) {
            Grid.GridNormal = Ext.getCmp('GridId-normal'); //GridId - locked
            Grid.GridNormal.Store = Grid.GridNormal.getView().getStore();
            Grid.GridNormal.cols = Grid.GridNormal.headerCt.getGridColumns();
            Grid.GridNormal.Pic_NumRec = Grid.GridNormal.Store.findRecord('type', 'pic_num');
            Grid.GridNormal.MaxRec = Grid.GridNormal.Store.findRecord('type', 'max_qty');

            Grid.GridNormal.MaxColIndex = Grid.GridNormal.cols.length;
            Grid.GridNormal.MaxRecIndex = Grid.GridNormal.Store.getCount();

            Grid.RCellSet = true;
        }

        if (type == 'sum' || type == 'this_sum') {

            var pic_num = 1;
            var field = Grid.GridNormal.cols[mate.cellIndex].dataIndex;
            //console.log(field);
            var SoNum = Grid.GridNormal.MaxRec.get(field);
            if (view_pic_numChecked == true)
                pic_num = Grid.GridNormal.Pic_NumRec.get(field);

            var num1 = Number(SoNum * pic_num);
            var num2 = Number(value * pic_num);

            if (num1 < num2)
                mate.tdAttr = 'style=" background-color: Red ;color :Black ;font-size:large"';
            else if (num1 == num2)
                mate.tdAttr = 'style=" background-color: Green"';
            else
                mate.tdAttr = 'style=" background-color: Yellow ;color :Black"';

            return value;
        }
        else if (type == 'max_qty' || type == 'done_qty') {
            // getValue();显示单价
            if (view_pic_numChecked == true) {
                var field = Grid.GridNormal.cols[mate.cellIndex].dataIndex;
                var pic_num = Grid.GridNormal.Pic_NumRec.get(field);
                return pic_num * value;
            }
            else
                return value;
        }
        else if (type == 'up_pair' || type == 'up_pic') {
            if (value == '-1')
                return '空单价';
        }
        else if (type == 'sal_no') {
            if (value == '0')
                return '';
        }

        return value;
    }


    var onSumCell = function (p_STORE, field) {
        var i = 0, res = 0.0000,
            cnt = p_STORE.getCount();
        var pic_num = 1;
        if (view_pic_numChecked == true)
            pic_num = Grid.Pic_NumRec.get(field);
        for (; i < cnt; ++i) {
            var R = p_STORE.getAt(i).data;

            if (R.type == 'sal_no')
                res += Number(R[field]);
        }

        return res;
    }

    var onClearTable = function () {

        //HeadPanel.getForm().reset();
        HeadPanel.prd_no.reset();
        HeadPanel.so_no.reset();
        HeadPanel.state = 'TableAdd';

        fnCommonCreateLastNo('JX', HeadPanel.getComponent('jx_no'), function () { });
        var gridVar = Ext.getCmp('GridId');
        if (gridVar)
            gridVar.getView().getStore().removeAll();

    }

    var onTableSave = function () {

        var ActionType = (HeadPanel.state || 'TableAdd') == 'TableAdd' ? 'TableAdd' : 'TalbeUpdate';
        var fnSave = function () {
            //alert((view_pic_numChecked || false));
            var ut = (view_pic_numChecked || false) == true ? 2 : 1,
                op = {
                    action: ActionType,
                    so_itm: -1, cus_no: '-1',
                    NowUserId: GlobalVar.NowUserId,
                    ut: ut
                },
                idx = 0;

            Grid.store.each(function (rec) {
                var Rdata = rec.data;
                if (Rdata.qty != 0 || Rdata.prd_no != '') {
                    rec.fields.each(function (field) {
                        var itemName = field.name;
                        op[itemName + '_' + idx] = rec.get(itemName);
                    });

                    ++idx;
                }
            });

            op['bodyCnt'] = Grid.store.getCount();
            HeadPanel.submit({
                params: op,
                success: function (vform, action) {
                    if (action.result.result === true) {
                        if (ActionType == "TableAdd")
                            CommMsgShow('成功', '新建成功');
                        else
                            CommMsgShow('成功', '修改成功');

                        HeadPanel.state = 'TalbeUpdate';
                        onAfterSave();
                    }
                    else
                        CommMsgShow('保存失败', action.result.msg);

                },
                failure: function (form, action) {
                    CommMsgShow('保存失败', action.response.responseText, true);
                }
            });
        }

        if (ActionType == 'TableAdd')
            fnCommonCreateLastNo('JX', HeadPanel.getComponent('jx_no'), fnSave);
        else
            fnSave();
    }

    var onAfterSave = function () {
        var i = 0,
            cnt = Grid.store.getCount();
        Grid.suspendLayouts();
        for (; i < cnt; ++i) {
            Grid.store.getAt(i).commit();
        }
        Grid.resumeLayouts(true);
    }

    var sPanel = Ext.create('ToolBarFormat', {
        region: 'south',
        listeners: {
            btnnew: function () {
                onClearTable();
            },
            btndelete: function () {
                Ext.MessageBox.confirm('询问？', '确定要删除吗?', function (btn) {
                    if (btn != 'yes')
                        return;

                    var op = { action: 'TalbeDelete', so_itm: -1, NowUserId: GlobalVar.NowUserId };
                    myMask.show();
                    HeadPanel.submit({
                        params: op,
                        success: function (form, action) {
                            myMask.hide();
                            HeadPanel.state = 'TableAdd';
                            CommMsgShow('成功', '删除成功', true);
                            onClearTable();
                        },
                        failure: function (form, action) {
                            myMask.hide();
                            CommMsgShow('删除失败', action.response.responseText, true);
                        }
                    });
                });
            },
            btnsave: onTableSave,
            btnclose: function () {
                PageClose();
            }
        }
    });


    var SearchSoPanel = Ext.create('SunGridClass', {

        region: 'center',
        gridID: 'QpQtySearch_aspx_',
        pageID: 'BodyGrid',
        CompanyCDNO: 'C1002',
        store: WpQty_Set.SearchWqStore,
        myMinHeight: 0,
        SaveMode: '1',
        getDefaultColumnsSetting: WpQty_Set.SearchWqCols,
        listeners: {
            MyRender: function (a, bb) {
                var me = this;
                me.grid.on('itemdblclick', function (vthis, record, item, index, e, eOpts) {

                    //HeadPanel.view_pic_num.disable(true);
                    var Rd = record.data;

                    //HeadPanel.view_pic_num.suspendEvents();

                    HeadPanel.loadRecord(record);
                    HeadPanel.prd_no.SetValueState = true;

                    view_pic_numChecked = (Rd.ut == '2' ? true : false);
                    HeadPanel.view_pic_num.setValue(view_pic_numChecked); //单价显示

                    HeadPanel.so_no.setValue(Rd.so_no);

                    HeadPanel.prd_no.setValue(Rd.prd_no);
                    HeadPanel.prd_no.setRawValue(Rd.prd_no);
                    HeadPanel.sal_no.setValue(Rd.sal_no);
                    HeadPanel.user_dep_no.setValue(Rd.user_dep_no);
                    HeadPanel.wp_dep_no.setValue(Rd.wp_dep_no);

                    //HeadPanel.view_pic_num.resumeEvents(true);

                    loadGridUI('TableLoad');
                });
            }
        }
    });


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
    //StartDD.setDate(26);



    var RPanel = Ext.create('Ext.panel.Panel', {
        region: 'east',
        title: '查询条件',
        width: 300,
        collapsible: true,

        layout: 'border',
        getSqlWhere: function () {
            var str = ' 1=1 ';
            var val1 = RPanel.startdd.getValue();
            var val2 = RPanel.enddd.getValue();
            var val3 = RPanel.so_no.getValue();
            var val4 = RPanel.prd_no.getValue();
            var val5 = RPanel.jx_no.getValue();

            if (val1 && val1 != '')
                str += ' and jx_dd >= \'' + Ext.Date.format(val1, 'Y/m/d') + '\' ';
            if (val2 && val2 != '')
                str += ' and jx_dd <= \'' + Ext.Date.format(val2, 'Y/m/d') + '\' ';
            if (val3 && val3 != '')
                str += ' and so_no like \'%' + val3 + '%\' ';
            if (val4 && val4 != '')
                str += ' and prd_no like \'%' + val4 + '%\' ';
            if (val5 && val5 != '')
                str += ' and jx_no like \'%' + val5 + '%\' ';
            return str;
        },
        items: [
            {
                region: 'north',
                //minHeight : 200,
                margin: '2 0 0 2',
                itemId: 'A',
                layout: {
                    type: 'table',
                    columns: 1
                },
                defaults: {
                    xtype: 'datefield',
                    margin: '0 0 0 2'
                },
                xtype: 'fieldcontainer',
                items: [
                        { fieldLabel: '开起日期', itemId: 'startdd', value: StartDD, format: 'Y/m/d' },
                        { fieldLabel: '结束日期', itemId: 'enddd', value: EndDD, format: 'Y/m/d' },
                        { xtype: 'textfield', itemId: 'jx_no', fieldLabel: '订薪单号' },
                        { xtype: 'textfield', itemId: 'so_no', fieldLabel: '销售订单' },
                        { xtype: 'textfield', itemId: 'prd_no', fieldLabel: '货&nbsp&nbsp&nbsp&nbsp号' },

                        {
                            buttonAlign: 'right',
                            xtype: 'button',
                            text: '查询原单',
                            margin: '0 0 0 150',
                            handler: function () {
                                WpQty_Set.SearchWqStore.load({
                                    params: {
                                        action: 'TalbeSearchHead',
                                        strWhere: RPanel.getSqlWhere()
                                    }
                                });
                            }
                        }
                    ]
            },
            SearchSoPanel
        ],
        listeners: {
            afterrender: function () {
                RPanel.A = this.getComponent('A');
                RPanel.startdd = RPanel.A.getComponent('startdd');
                RPanel.enddd = RPanel.A.getComponent('enddd');
                RPanel.so_no = RPanel.A.getComponent('so_no');
                RPanel.prd_no = RPanel.A.getComponent('prd_no');

                RPanel.jx_no = RPanel.A.getComponent('jx_no');

            }
        }
    });


    var OnDrawTable = function (S) {

        //　生成合适的Model
        var DataModel, DataFields = [], GridCols = [],
        Store;

        var HeadRec = S[0],
        WpNameRec = S[1],
        WpCnt = HeadRec.value,
        i = 0;

        DataFields.push({ name: 'type', type: 'string' });
        DataFields.push({ name: 'value', type: 'string' });
        DataFields.push({ name: 'sal_name', type: 'string' });
        for (; i < WpCnt; ++i) {
            DataFields.push({ name: 'row' + i, type: 'string' });
        }

        DataModel = Ext.define('DataModel', {
            extend: 'Ext.data.Model',
            fields: DataFields
        });

        // 数据转移
        var Store = Ext.create('Ext.data.Store', {
            model: 'DataModel',
            autoLoad: false,
            proxy: {
                type: 'ajax',
                url: '../ASHX/Wp_Qty.ashx',
                reader: {
                    type: 'json'
                }
            }
        });


        i = 0;
        for (; i < S.length; ++i) {
            Store.add(Ext.create('DataModel', S[i]));
        }

        //  生成合适的GridCols
        i = 0;
        var str1, str2;
       // GridCols.push({ header: '序', IsRownumberer: true, locked: true, width: 50 });
        GridCols.push({ header: '类型', name: 'type', dataIndex: 'type', renderer: RowTypeRender, lockable: true, locked: true,width: 80 });
        GridCols.push({ header: '员工', name: 'value', dataIndex: 'value', lockable: true, locked: true,
            width: 90,
            renderer: function (v, m, rec) {
                if (rec.get('type') == 'sal_no')
                    return rec.get('sal_name');
                else
                    return '';
            },
            sortable: false
        });

        for (; i < WpCnt; ++i) {
            str1 = 'row' + i;
            str2 = WpNameRec['row' + i];
            GridCols.push({
                header: str2, name: str1, width: 50, autoSizeColumn: true, dataIndex: str1,
                editor: {
                    xtype: 'numberfield',
                    format: '0.000', decimalPrecision: 4,
                    spinDownEnabled: false,
                    spinUpEnabled: false,
                    enableKeyEvents: true,
                    hideTrigger: true,
                    selectOnFocus: true,
                    listeners: {
                        specialkey: specialkeyfunction
                    },
                    onDownArrow: function () { }
                }, renderer: CellRender,
                sortable: false
            });
        }



        //　显示Json的数据
        Grid = Ext.create('Ext.grid.Panel', {
            itemId: 'GridId',
            id: 'GridId',
            region: 'center',
            store: Store,
            columns: GridCols,
            columnLines: true,
            lockable: true,
            enableLocking: true,
            // stripeRows: false,
            viewConfig: {
                //stripeRows: false, 
                getRowClass: function (record) {
                    var type = record.get('type');
                    switch (type) {
                        case 'this_sum':
                        case 'sum':
                        case 'max_qty':
                        case 'done_qty':
                            return 'disabledRow';
                            break;
                        case 'up_pair':
                        case 'up_pic':
                        case 'pic_num':
                            return 'disabledRow';
                            break;
                        default:
                            return ''
                    }
                },
                listeners: {
                    refresh: function (dataview) {
                        Ext.each(dataview.panel.columns, function (column) {
                            if (column.autoSizeColumn === true)
                                column.autoSize();
                        })
                    }
                }
            },
            selType: 'cellmodel',
            plugins: [
               Ext.create('Ext.grid.plugin.CellEditing', {
                   pluginId: 'ceId',
                   itemId: 'ceId',
                   clicksToEdit: 1,
                   //grid: Grid,
                   listeners: {
                       edit: function (editor, e, eOpts) {
                           if (e.value == e.originalValue)
                               return true;

                           //console.log('edit');
                           if (!Grid.RSet) {
                               Ext.suspendLayouts();
                               //console.log('Grid.RSet');

                               Grid.GridNormal = Ext.getCmp('GridId-normal'); //GridId - locked
                               Grid.DoneRec = e.record.store.findRecord('type', 'done_qty');
                               Grid.ThisSumRec = e.record.store.findRecord('type', 'this_sum');
                               Grid.SumRec = e.record.store.findRecord('type', 'sum');
                               Grid.Pic_NumRec = e.record.store.findRecord('type', 'pic_num');

                               Grid.RSet = true;
                               Grid.TaskField = []; //要更新的列，延时执行,缓存区
                               Grid.TaskField2 = [];
                               Grid.TaskRuning = false;

                               Grid.TaskFn = function (field) {
                                   var sumNum = onSumCell(Grid.GridNormal.Store, field);
                                   var pic_num = 1;
                                   if (view_pic_numChecked == true)
                                       pic_num = Grid.Pic_NumRec.get(field);

                                   //console.log(Number(pic_num));
                                   var doneQtyNow = Number(Grid.DoneRec.get(field) || 0.00) * pic_num;
                                   var thisSumQtyNow = Number(sumNum);

                                   Grid.ThisSumRec.set(field, thisSumQtyNow);
                                   Grid.SumRec.set(field, doneQtyNow + thisSumQtyNow);

                                   // alert(' ' + field + '  ' + doneQtyNow + ' -  '  + thisSumQtyNow);
                               }

                               Grid.TaskRunFn = function () {
                                   Grid.suspendLayout = true;
                                   Grid.TaskRuning = true;
                                   var i = 0,
                                       cnt = Grid.TaskField.length,
                                       cnt2 = Grid.TaskField2.length,
                                       runed = [];


                                   //console.log('Grid.TaskFn' + Grid.TaskField.length);
                                   for (; i < cnt; ++i) {
                                       if (runed.indexOf(Grid.TaskField[i]) < 0) {
                                           runed.push(Grid.TaskField[i]);

                                           Grid.TaskFn(Grid.TaskField[i]);
                                       }
                                   }

                                   for (; i < cnt2; ++i) {
                                       if (runed.indexOf(Grid.TaskField2[i]) < 0) {
                                           runed.push(Grid.TaskField2[i]);

                                           Grid.TaskFn(Grid.TaskField2[i]);
                                       }
                                   }

                                   Grid.TaskField = [];
                                   Grid.TaskField2 = [];

                                   Grid.TaskRuning = false;
                                   Grid.suspendLayout = false;
                               }

                               Grid.TimeId = window.setInterval(Grid.TaskRunFn, 5000);

                               Ext.resumeLayouts(false);

                           } //if (!Grid.RSet) {

                           if (Grid.TaskRuning == false) {
                               Grid.TaskField.push(e.field);
                           }
                           else {
                               Grid.TaskField2.push(e.field);
                           }
                       },
                       //buffer: 5000,
                       beforeedit: function (editor, e, eOpts) {
                           var recData = e.record.data;
                           if (recData.type != 'sal_no' || (e.field.indexOf('row', 0)) < 0)
                               e.cancel = true;
                       }
                   }
               })
            ],
            //renderTo: Ext.getBody(),
            listeners: {
                boxready: function () {
                    //console.log('boxready');
                    myMask.hide();

                    var view = Ext.getCmp('GridId-normal').getView();
                    var view1 = Ext.getCmp('GridId-locked').getView(); //GridId - locked;

                    Grid.taskSelectText = new Ext.util.DelayedTask(function () {
                        var ed = Ext.getCmp('GridId-normal').plugins[0];
                        //console.log(Grid);
                        var nowEditor = ed.getActiveEditor();
                        //console.log(nowEditor);
                        if (nowEditor && nowEditor.field) {
                            nowEditor.field.selectText();
                        }
                    });

                    Common_RunDelayFn(function () {
                        Ext.suspendLayouts();

                        view.getNode(0).style.display = 'none';
                        view.getNode(1).style.display = 'none';
                        if ((view_pic_numChecked || false) == true)
                            view.getNode(2).style.display = 'none';
                        else
                            view.getNode(3).style.display = 'none';

                        view1.getNode(0).style.display = 'none';
                        view1.getNode(1).style.display = 'none';
                        if ((view_pic_numChecked || false) == true)
                            view1.getNode(2).style.display = 'none';
                        else
                            view1.getNode(3).style.display = 'none';

                        Ext.resumeLayouts(false);
                    }, 150);


                    Grid.on('headercontextmenu', function (ct, column, e, t, eOpts) {
                        e.preventDefault();
                        cellHeadMenu.column = column;
                        cellHeadMenu.store = Grid.getView().getStore();
                        cellHeadMenu.showAt(column.getXY());

                        //Grid.cellHeadMenu.showAt(column.getXY());
                    });

                }
            }
        });


        //  选择性隐藏行        ok


        //　列输入控件控制      ok


        //  合计栏位计算功能   ok


        //　行Style设计        ok


        //　列Style设计        ok 

        var OldGrid = viewport.getComponent('GridId');
        if (OldGrid)
            viewport.remove(OldGrid);
        viewport.add(Grid);
    }

    function monitor(url, orderParams) {
        if (url == 'Sys/Wp_Qty.html' && orderParams) {
            var action = (orderParams.action || '');
            if (action == 'ViewTable') {
                var no = orderParams.no;
                WpQty_Set.ViewOriginalTable(no);
            }

            if (action == 'startEdit') {
                HeadPanel.getForm().setValues(orderParams);
                //loadRecord(orderParams);
                console.log(orderParams);
                HeadPanel.so_no.setValue(orderParams.so_no);
                HeadPanel.prd_no.setValue(orderParams.prd_no);
                HeadPanel.prd_no.setRawValue(orderParams.prd_no);
                HeadPanel.jx_dd.setValue(orderParams.jx_dd);

                HeadPanel.user_dep_no.setValue(orderParams.user_dep_name);
                HeadPanel.wp_dep_no.setValue(orderParams.wp_dep_name);


                Common_RunDelayFn(function () { loadGridUI('TalbeCreate'); }, 500);

            }
        }
    }

    viewport = Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [HeadPanel, RPanel, sPanel],
        listeners: {
            afterrender: function (comp, eOpts) {
                fnCommonCreateLastNo('JX', HeadPanel.getComponent('jx_no'), function () {
                    Common_SetReadOnly_2(true, HeadPanel.getComponent('jx_no'), false);
                });

                var me = this;
                var pa = window.parent ? window.parent.Ext.getCmp('tabPanel') : null;
                //通知上级tab 这已加载完成

                if (pa) {
                    var thisTabComp = pa.getComponent(PAGE_Locaction);

                    if (thisTabComp) {
                        thisTabComp.had_rendered = true;
                        pa.on('SendOrder', monitor);
                        pa.getComponent(PAGE_Locaction).fireEvent('had_rendered', monitor);

                        PageClose = function () {
                            var pa = window.parent.Ext.getCmp('tabPanel');
                            //通知上级tab 这已加载完成
                            if (pa) {
                                pa.getComponent(PAGE_Locaction).fireEvent('letcloseme');
                            }
                        } // PageClose

                    }
                }
            }
        }
    });


});