var MF_SO_Set = {};
MF_SO_Set.TableState = 'TableAdd';

//单号	so_no	varchar(20)
//项次	itm	int
//货品代号	prd_no	varchar(40)
//数量	qty	numeric(18, 2)
//已完成数量	qty_finish	numeric(18, 2)
//备注	rem	ntext

MF_SO_Set.GetHeadStore = function () {
    return Ext.create('Ext.data.Store', {
        model: 'Model_MF_SO',
        autoLoad: false,
        proxy: {
            type: 'ajax',
            url: '../ASHX/MF_SO.ashx',
            reader: {
                type: 'json',
                root: 'items',
                totalProperty: 'total'
            }
        }
    });
}

//用于加载数据！
MF_SO_Set.HeadStore = MF_SO_Set.GetHeadStore();

MF_SO_Set.BodyStore = Ext.create('Ext.data.Store', {
    model: 'Model_TF_SO',
    autoLoad: false,
    proxy: {
        type: 'ajax',
        url: '../ASHX/MF_SO.ashx',
        reader: {
            type: 'json'
        }
    }
});


Ext.onReady(function () {

    //销售单号	so_no	varchar(40)      ok
    //客户代号	cus_no	varchar(40)
    //订单日期	so_dd	datetime      ok
    //交货日期	order_dd	datetime   ok
    //生产结案标记(系统)	finish	varchar(2)
    //生产结案标记(手工)	focus_finish	varchar(2)
    //创建人员	n_man	varchar(40)
    //创建时间	n_dd	datetime
    //修改人员	e_man	varchar(40)
    //修改时间	e_dd	datetime

    MF_SO_Set.OpenQWin = function (grid, rowIndex, colIndex) {
        var rec = grid.getStore().getAt(rowIndex);
        if (!MF_SO_Set.qWin) {
            if (MF_SO_Set.TableState != 'TableUpdate') {
                alert('请先保存计划单');
                return false;
            }

            var openWindowFn = window.parent.openWindow;

            MF_SO_Set.qWin = Ext.create('Ext.window.Window', {
                title: '计件录入_预备窗体',
                closeAction: 'hidden',
                height: 180,
                width: 300,
                margins: '5 2 2 2',
                defaults: {
                    margins: '5 2 2 2'
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
                }],
                bbar: [
                    {
                        text: '打开',
                        handler: function () {
                            var o = {}
                            recs = cPanel.grid.getView().getSelectionModel().getSelection();

                            if (recs.length > 0)
                                rec = recs[0];
                            else {
                                alert('请选择表身行');
                                return false;
                            }
                            //console.log(MF_SO_Set.qWin.getComponent('wp_dep_no'));
                            o['action'] = 'startEdit';

                            o['jx_dd'] = MF_SO_Set.qWin.getComponent('jx_dd').getValue();
                            o['wp_dep_no'] = MF_SO_Set.qWin.getComponent('wp_dep_no').HiddenValue;
                            o['wp_dep_name'] = MF_SO_Set.qWin.getComponent('wp_dep_no').getValue();

                            o['user_dep_no'] = MF_SO_Set.qWin.getComponent('user_dep_no').HiddenValue;
                            o['user_dep_name'] = MF_SO_Set.qWin.getComponent('user_dep_no').getValue();
                            o['prd_no'] = rec.get('prd_no');
                            o['so_no'] = nPanel.so_no.getValue();
                            //console.log(o);

                            openWindowFn({ text: '计件工资输入', url: 'Sys/Wp_Qty.aspx', params: o }, false);
                        }
                    },
                    { text: '取消', handler: function () { MF_SO_Set.qWin.close(); } }
                ]
            });
        }

        MF_SO_Set.qWin.show();
    }

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
            margin: '5 0 6 5'
        },
        items: [
            {
                itemId: 'so_dd',
                name: 'so_dd',
                xtype: 'datefield',
                fieldLabel: '计划日期',
                value: new Date(),
                format: 'Y/m/d'
            },
            {
                itemId: 'so_no',
                name: 'so_no',
                xtype: 'textfield',
                fieldLabel: '系统计划'
            },
            {
                itemId: 'order_dd',
                name: 'order_dd',
                xtype: 'datefield',
                fieldLabel: '计划完成',
                value: new Date(),
                format: 'Y/m/d'
            },
            {
                itemId: 'cus_no',
                name: 'cus_no',
                xtype: 'MSearch_Cust',
                fieldLabel: '客户代号',
                MyIsGridCell: false
            },
            {
                itemId: 'finish',
                name: 'finish',
                xtype: 'hiddenfield',
                fieldLabel: '生产结案标记(系统)'
            },
            {
                itemId: 'focus_finish',
                name: 'focus_finish',
                xtype: 'hiddenfield',
                fieldLabel: '生产结案标记(手工)'
            },
            {
                itemId: 'is_finish',
                name: 'is_finish',
                xtype: 'checkbox',
                fieldLabel: '生产结案标记'
            }
        ],
        listeners: {
            afterrender: function () {
                nPanel.cus_no = this.getComponent('cus_no');
                nPanel.so_no = this.getComponent('so_no');
            }
        }
    });


    MF_SO_Set.BodyGridCols = function () {
        return [
                { name: 'itm', xtype: 'rownumberer', dataIndex: 'itm', IsRownumberer: true },
                {
                    header: '货品', name: 'prd_no', dataIndex: 'prd_no',
                    width: 180,
                    editor: { xtype: 'MSearch_Prdt', inGrid: true },
                    renderer: function (v, m, rec) {
                        return commonVar.RenderPrdtName(rec.get('prd_no'));
                    }
                },
                { header: '数量', name: 'qty', dataIndex: 'qty', editor: { xtype: 'numberfield' } },
                {
                    header: '已完成数量', name: 'qty_finish', dataIndex: 'qty_finish',
                    renderer: commonVar.RenderInt
                },
                {
                    xtype: 'actioncolumn',
                    name: 'actioncolumn',
                    header: '开始计件输入',
                    width: 150,
                    items: [{
                        width: 50,
                        icon: '../Js/resources/MyImages/edit_task.png',  // Use a URL in the icon config
                        tooltip: '开始计件输入',
                        header: '开始计件输入',
                        handler: MF_SO_Set.OpenQWin
                    }]
                },
                { header: '备注', name: 'rem', dataIndex: 'rem', editor: {} }
        ];
    }


    cPanel = Ext.create('SunGridClass', {
        region: 'center',
        gridID: 'MF_SO_aspx',
        pageID: 'BodyGrid',
        CompanyCDNO: 'C1002',
        myMinHeight: 0,
        SaveMode: '1',
        store: MF_SO_Set.BodyStore,
        getDefaultColumnsSetting: MF_SO_Set.BodyGridCols,
        cellEditing: Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1,
            listeners: {
                beforeedit: function (editor, e, eOpts) {
                    cPanel.cellEditing.nowRecord = e.record;
                    if (e.field == 'prd_no' && e.record.get('jx_cnt') > 0) {
                        return false;
                    }
                },
                edit: function (editor, e, eOpts) {
                    if (e.value == e.originalValue)
                        return false;

                    if (e.field == 'prd_no') {
                        Ext.Ajax.request({
                            url: '../ASHX/MF_SO.ashx',
                            params: { action: 'CheckRowUsed', so_no: nPanel.getComponent('so_no').getValue(), itm: e.record.get('itm') },
                            success: function (response) {
                                var json = Ext.JSON.decode(response.responseText);
                                if (json.result == true) {

                                    e.record.set('prd_no', e.originalValue);
                                    e.record.commit();
                                    alert('不能删除(变更)货号，　因为已经有计件数据!');
                                }
                            }
                        });
                    }
                }
            }
        }),
        
        listeners: {
            MyRender: function (a, bb) {
                var me = this;
                GridTools.onGoodLike(me.grid, undefined, { qty: 1 });
                ////                cPanel.grid.on('containerdblclick', function (view, e) {
                ////                    sPanel.btn_add.handler();
                ////                });
            }
        }
    });


    var fnGetAnTable = function (so_no) {
        MF_SO_Set.HeadStore.load({
            params: { action: 'FetchTableData', so_no: so_no },
            callback: function () {
                var HeadRec = MF_SO_Set.HeadStore.getAt(0),
                    HeadRecData = HeadRec.data;

                Ext.suspendLayouts();
                nPanel.loadRecord(HeadRec);

                var store = cPanel.grid.store;
                store.removeAll();

                var T = HeadRec.BodyData();

                T.each(function (rec) {
                    var A = Ext.create('Model_TF_SO', rec.data);
                    store.add(A);
                });

                store.removed = [];

                Ext.resumeLayouts(true);
                Common_SetReadOnly_2(true, nPanel.getComponent('so_no'), false);
            }
        });
    }


  
    sPanel = Ext.create('Ext.toolbar.Toolbar', {
        region: 'south',
        buttonAlign: 'left',
        items: [
            {
                width: 60,
                height: 32,
                style: {
                    borderColor: '#87ceff'
                },
                text: '新建',
                icon: '../JS/resources/MyIcon/icon_add.png',
                id: 'btnNew',
                itemId: 'btnNew',
                SUNBTN: true,
                handler: function () {
                    MF_SO_Set.TableState = 'TableAdd';
                    nPanel.getForm().reset();
                    cPanel.grid.store.removeAll();

                    fnCommonCreateLastNo('SO', nPanel.getComponent('so_no'), function () {
                        Common_SetReadOnly_2(false, nPanel.getComponent('so_no'), false);
                    });
                }
            },
            {
                width: 60,
                height: 32,
                style: {
                    borderColor: '#87ceff'
                },
                text: '速查',
                icon: '../JS/resources/MyIcon/search.png',
                id: 'btnFind',
                itemId: 'btnFind',
                myWinWidth: 800,
                SUNBTN: true,
                id: 'btnSearch',
                name: 'btnSearch',
                key: 'btnSearch',
                queryParam: 'so_no',
                xtype: 'SunSearchNoWin',
                postUrl: '../ASHX/MF_SO.ashx?action=TableSearch2',
                defaultSearchCondition: "",
                model: 'Model_MF_SO',
                setGridColumns: function () {
                    return [
                        { header: '订单日期', name: 'so_dd', dataIndex: 'so_dd', xtype: 'datecolumn', format: 'Y/m/d' },
                        { header: '销售单号', name: 'so_no', dataIndex: 'so_no' },
                        { header: '客户代号', name: 'cus_no', dataIndex: 'cus_no' },
                        { header: '客户名称', name: 'cus_name', dataIndex: 'cus_name' },

                        { header: '生产结案', name: 'is_finish', dataIndex: 'is_finish' }
                    ];
                },
                listeners: {
                    subItemclick: function (record) {
                        fnGetAnTable(record.get('so_no'));
                        MF_SO_Set.TableState = 'TableUpdate';

                    },
                    fetchBack: function (records) {
                        if (records.length >= 1)
                            this.fireEvent('subItemclick', records[0]);
                    }
                }
            },
            {
                width: 60,
                height: 32,
                style: {
                    borderColor: '#87ceff'
                },
                text: '删除',
                icon: '../JS/resources/MyIcon/icon_delete.png',
                id: 'btnDelete',
                SUNBTN: true,
                handler: function () {
                    if (MF_SO_Set.TableState.toLowerCase() == 'TableAdd'.toLowerCase()) {
                        sPanel.btnNew.handler();
                        return false;
                    }

                    var so_no = nPanel.so_no.getValue();
                    Ext.MessageBox.confirm('确定删除', '确定删除单据吗? ' + "(" + so_no + ")", function (btn) {
                        if (btn == 'yes') {
                            Ext.Ajax.request({
                                url: '../ASHX/MF_SO.ashx',
                                params: { action: 'TableDelete', so_no: so_no },
                                success: function (response) {
                                    var json = Ext.JSON.decode(response.responseText);
                                    if (json.result == true) {
                                        CommMsgShow("温馨提示：", "操作成功！");
                                        sPanel.btnNew.handler();
                                    }
                                    else {
                                        CommMsgShow("异常：", unescape(json.msg));
                                    }
                                },
                                failure: function (form, action) {

                                    CommMsgShow("异常：", form.responseText, true);
                                }
                            });
                        }
                    }, this);

                } //handler   
            },
            {
                width: 60,
                height: 32,
                style: {
                    borderColor: '#87ceff'
                },
                text: '保存',
                icon: '../JS/resources/MyIcon/icon_save.png',
                id: 'btnSave',
                SUNBTN: true,
                handler: function () {
                    //MF_PSSSet.onTableSave();       
                    var idx = 0, idx2 = 0;
                    var op = { action: MF_SO_Set.TableState };

                    cPanel.grid.store.each(function (rec) {
                        var Rdata = rec.data;
                        if (Rdata.qty != 0 && Rdata.prd_no != '') {
                            rec.fields.each(function (field) {
                                var itemName = field.name;
                                op[itemName + idx] = rec.get(itemName);
                            });

                            ++idx;
                        }
                    });

                    op['body_cnt'] = idx;

                    Ext.apply(op, nPanel.getForm().getValues());
                    op['NowUserId'] = GlobalVar.NowUserId;

                    Ext.Ajax.request({
                        url: '../ASHX/MF_SO.ashx',
                        params: op,
                        success: function (response) {
                            MF_SO_Set.TableState = 'TableUpdate';
                            CommMsgShow('提示', '操作成功');
                            fnGetAnTable(nPanel.getComponent('so_no').getValue());
                        },
                        failure: function (form, action) {
                            CommMsgShow('异常', form.responseText, true);
                        }
                    });
                }
            },
            {
                width: 60,
                height: 32,
                style: {
                    borderColor: '#87ceff'
                },
                text: '关闭',
                icon: '../JS/resources/MyIcon/icon_logout.png',
                handler: function () {
                    PageClose();
                }
            }, '->',
            {
                width: 80,
                height: 32,
                style: {
                    borderColor: '#87ceff'
                },
                itemId: 'btn_add',
                text: '新建一行',
                icon: '../JS/resources/MyIcon/icon_add_rp.png',
                handler: function () {
                    var NewModel = Ext.create('Model_TF_SO', {
                        qty: 0,
                        old_itm: -1
                    });
                    cPanel.grid.store.add(NewModel);
                    cPanel.grid.getSelectionModel().select([NewModel]);
                }
            },
            {
                width: 80,
                height: 32,
                style: {
                    borderColor: '#87ceff'
                },
                itemId: 'btn_insert',
                text: '插入一行',
                icon: '../JS/resources/MyIcon/icon_skill.png',
                handler: function () {
                    var index = Common_GetGridSelectIndex(cPanel.grid);
                    if (index >= 0) {
                        var NewModel = Ext.create('Model_TF_SO', {
                            qty: 0
                        });
                        cPanel.grid.store.insert(index, NewModel);
                        cPanel.grid.getSelectionModel().select([NewModel]);
                    }
                    else {
                        CommMsgShow('提示', '请插入的删除行');
                    }
                }
            },
            {
                width: 80,
                height: 32,
                style: {
                    borderColor: '#87ceff'
                },
                itemId: 'btn_delete',
                text: '删除一行',
                icon: '../JS/resources/MyIcon/icon_delete.png',
                handler: function () {
                    var index = Common_GetGridSelectIndex(cPanel.grid),
                        rec = cPanel.grid.getView().getStore().getAt(index);
                    if (index < 0) {
                        CommMsgShow('提示', '请指定删除行');
                        return false;
                    }

                    Ext.Ajax.request({
                        url: '../ASHX/MF_SO.ashx',
                        params: { action: 'CheckRowUsed', so_no: nPanel.getComponent('so_no').getValue(), itm: rec.get('itm') },
                        success: function (response) {
                            var json = Ext.JSON.decode(response.responseText);


                            if (json.result == true) {
                                alert('不能删除修改货号，　因为后续单据中已使用!');
                            }
                            else {

                                cPanel.grid.store.removeAt(index);
                                var recSign = cPanel.grid.store.getAt(--index);
                                if (recSign)
                                    cPanel.grid.getSelectionModel().select([recSign]);

                            }
                        }
                    });

                }
            }
        ],
        listeners: {
            afterrender: function () {
                sPanel.btn_add = this.getComponent('btn_add');
                sPanel.btnNew = this.getComponent('btnNew');

                //自增单号
                fnCommonCreateLastNo('SO', nPanel.getComponent('so_no'), function () {});
            }
        }
    });


});

