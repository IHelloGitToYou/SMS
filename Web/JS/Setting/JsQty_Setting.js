var JsQty_Set = {};
JsQty_Set.TableState = 'TableAdd';

// Hmodel

JsQty_Set.Model_H = Ext.define('JsQty_Set.Model_H', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'js_no', type: 'string' },
        { name: 'js_dd', type: 'date' },
        { name: 'sal_no', type: 'string' },
        { name: 'sal_name', type: 'string' },

        { name: 'rem', type: 'string' },
        { name: 'n_man', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_dd', type: 'date' }
    ],
    associations: [
        { type: 'hasMany', model: 'JsQty_Set.Model_B', name: 'BodyData', autoLoad: false }
    ]
});


// Bmodel
JsQty_Set.Model_B = Ext.define('JsQty_Set.Model_B', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'js_no', type: 'string' },
        { name: 'js_dd', type: 'date' },
        { name: 'sal_no', type: 'string' },
        { name: 'sal_name', type: 'string' },
        { name: 'qty', type: 'number' },
        { name: 'up', type: 'number' },
        { name: 'amt', type: 'number' },
        { name: 'is_add', type: 'bool', defaultValue : true },
        { name: 'rem', type: 'string' }
    ]
});

// Store
//用于加载数据！
JsQty_Set.HeadStore = Ext.create('Ext.data.Store', {
    model: JsQty_Set.Model_H,
    autoLoad: false,
    proxy: {
        type: 'ajax',
        url: '../ASHX/JSQty.ashx',
        reader: {
            type: 'json',
            root: 'items',
            totalProperty: 'total'
        }
    }
});

JsQty_Set.BodyStore = Ext.create('Ext.data.Store', {
    model: JsQty_Set.Model_B,
    autoLoad: false,
     sorters: [{
         property: 'itm',
         direction: 'asc'
    }],
    proxy: {
        type: 'ajax',
        url: '../ASHX/JSQty.ashx',
        reader: {
            type: 'json'
        }
    }
});

var fnGetAnTable = function (so_no) {
    JsQty_Set.HeadStore.load({
        params: { action: 'FetchTableData', so_no: so_no },
        callback: function () {
            var HeadRec = JsQty_Set.HeadStore.getAt(0),
                HeadRecData = HeadRec.data;
           
            nPanel.loadRecord(HeadRec);
            JsQty_Set.TableState = 'TableUpdate';

            Ext.suspendLayouts();
            JsQty_Set.BodyStore.removeAll();
            var T = HeadRec.BodyData();
            T.each(function (rec) {
                //rec.data.is_add = rec.data.is_add === 'true' ? true : false;
                //var A = Ext.create('JsQty_Set.Model_B', rec.data);
                JsQty_Set.BodyStore.add(rec);
            });

            JsQty_Set.BodyStore.removed = [];

            Ext.resumeLayouts(true);
        }
    });
}

Ext.onReady(function () {

    JsQty_Set.BodyGridCols = function () {
        return [
            { xtype: 'rownumberer' }, // header: '项', name: 'itm', dataIndex: 'itm', width:60
            { header: '员工', name: 'sal_no', dataIndex: 'sal_no', 
                editor: {
                    xtype: 'MSearch_Salm',
                    matchFieldWidth: false,
                    loadOutSalm: false
                    //inGrid: true
                },
                renderer: GlobalVar.rdSalmName,
                sortable: false
            },
            { header: '事由', name: 'rem', dataIndex: 'rem', width: 280, editor: {}, sortable: false },
            { header: '小时', name: 'qty', dataIndex: 'qty',  editor: { xtype: 'numberfield'}, sortable: false },
            { header: '时薪', name: 'up', dataIndex: 'up', editor: { xtype: 'numberfield'}, sortable: false },
            { header: '金额', name: 'amt', dataIndex: 'amt' ,sortable : false  },
            { xtype: 'checkcolumn', text: '有附加', dataIndex: 'is_add' ,sortable : false }

        //            { header: '纳入附加', name: 'is_add', dataIndex: 'is_add', editor: { xtype: 'checkbox', checked: true },
        //                renderer: function (v, m, rec) {
        //                    if (v == 'true' || v == true || v == 'Y')
        //                        return 'Y';
        //                    else
        //                        return 'N';
        //                }
        //            }
        ];
    }

    nPanel = Ext.create('Ext.form.Panel', {
        region: 'north',
        url: '../../Handler2/Word/MF_SO.ashx',
        defaults: {
            labelWidth: 80,
            width:200,
            margin: '3 3 3 5',
            labelAlign:'right'
        },
        layout: {
            type:'table',
            columns: 6
        },
        items: [
            {
                itemId: 'js_dd',
                name: 'js_dd',
                xtype: 'datefield',
                fieldLabel: '计薪日',
                format: 'Y/m/d',
                //minValue: Ext.Date.add(GlobalVar.ServerDate, Ext.Date.DAY, -1 * (WpConfig.freezeDay - 1)),
                //maxValue: GlobalVar.ServerDate,
                value: GlobalVar.ServerDate
            },
            {
                itemId: 'js_no',
                name: 'js_no',
                xtype: 'textfield',
                fieldLabel: '计时单号'
            },
            {
                itemId: 'sal_no',
                name: 'sal_no',
                xtype: 'MSearch_Salm',
                value: GlobalVar.NowUserId,
                fieldLabel: '录入员',
                colspan: 4,
                width: 200
            },
            {
                itemId: 'rem',
                name: 'rem',
                xtype: 'textfield',
                fieldLabel: '备注',
                colspan: 4,
                width: 411
            }
        ],
        listeners: {
            afterrender: function () {
                nPanel.js_no = nPanel.getComponent('js_no');
                nPanel.sal_no = nPanel.getComponent('sal_no');
            }
        }
    });

    cPanel = Ext.create('SunGridClass', {
        //icon:'../JS/resources/MyIcon/icon_save_cg.png',
        region: 'center',
        gridID: 'JSQty_html',
        pageID: 'BodyGrid',
        CompanyCDNO: 'C1002',
        store: JsQty_Set.BodyStore,
        myMinHeight: 0,
        SaveMode: '1',
        cellEditing: Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1,
            listeners: {
                beforeedit: function (editor, e, eOpts) {
                    cPanel.cellEditing.nowRecord = e.record;
                },
                edit: function (editor, e, eOpts) {
                    if (e.value == e.originalValue)
                        return false;

                    if (e.field == "qty" || e.field == "up") {
                        e.record.set('amt', e.record.get('qty') * e.record.get('up'));
                    }
                }
            }
        }),
        getDefaultColumnsSetting: JsQty_Set.BodyGridCols,
        listeners: {
            MyRender: function (a, bb) {
                var me = this;
                ////双击自动加新行
                //cPanel.grid.on('containerdblclick', function (view, e) {
                //    sPanel.btn_add.handler();
                //});
                GridTools.onGoodLike(me.grid, undefined, { qty: 1 });
            } // MyRender 
        }
    });

    var IsLocking = function () {
        if (JsQty_Set.TableState != 'TableUpdate')
            return false;
        var EditingJS = JsQty_Set.HeadStore.getAt(0);
        var TableDate = new Date(Ext.Date.format(EditingJS.get('n_dd'), 'Y/m/d'));
        var freezeDate = Ext.Date.add(TableDate, Ext.Date.DAY, (WpConfig.freezeDay - 1));
        var TodayDate = GlobalVar.ServerDate;
        var isAdminRoot = WpConfig.UserDefault[GlobalVar.NowUserId].root == '管理员';
        //console.log([Ext.Date.format(TodayDate, 'Y/m/d'), Ext.Date.format(freezeDate, 'Y/m/d'), Ext.Date.format(GlobalVar.freeze_date, 'Y/m/d')]);
        //有没有超出结账日期
        if (TableDate <= GlobalVar.freeze_date) {
            return '结账';
        }

        if (TodayDate > freezeDate) {
            //管理员有权改冰封期内的
            if (isAdminRoot == true) {
                return false;
            }
            else {
                return '冰封';
            }
        }

        return false;
    }

    var onFromSave = function () {
        cPanel.cellEditing.completeEdit();
        if(nPanel.getForm().isValid() == false){
            alert('单据信息有误');
            return true;
        }
        if (JsQty_Set.TableState == 'TableUpdate') {
            var checkResult = IsLocking();
            if (checkResult != false) {
                if (checkResult == '冰封')
                    alert('单据已被冰封!, 想修改请与管理员联系!');
                else
                    alert('单据已被结账,不能修改!');
                return;
            }
        }

        var idx = 0, idx2 = 0;
        var op = { action: JsQty_Set.TableState },
            getBug = false;

        cPanel.grid.store.each(function (_rec) {
            if (_rec.get('sal_no') == '')
                return true;
            if (_rec.get('qty') <= 0) {
                cPanel.grid.getSelectionModel().select([_rec]);
                CommMsgShow('提示', '数量不能为空', true);
                getBug = true;
            }
            if (_rec.get('amt') <= 0) {
                cPanel.grid.getSelectionModel().select([_rec]);
                CommMsgShow('提示', '总金额输入', true);
                getBug = true;
            }

            _rec.fields.each(function (field) {
                var itemName = field.name;
                if (field.name != 'js_dd' && field.name != 'js_no')
                    op[itemName + '_' + idx] = _rec.get(field.name);
            });
            ++idx;
        });

        if (getBug)
            return false;

        op['body_cnt'] = idx;
        Ext.apply(op, nPanel.getForm().getValues());
        op['NowUserId'] = GlobalVar.NowUserId;

        Ext.Ajax.request({
            url: '../ASHX/JSQty.ashx',
            params: op,
            success: function (response) {
                var jsonObj = Ext.JSON.decode(response.responseText);
                if (jsonObj.result == true) {
                    
                    fnGetAnTable(nPanel.js_no.getValue());

                    CommMsgShow('提示', '操作成功');
                }
                else
                    CommMsgShow('异常', unescape(jsonObj.errmsg), true);
            },
            failtrue: function () {

            }
        });
    }

    sPanel = Ext.create('Ext.toolbar.Toolbar', {
        region: 'south',
        buttonAlign: 'left',
        items: [{
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
                cPanel.cellEditing.completeEdit();
                JsQty_Set.TableState = 'TableAdd';
                nPanel.getForm().reset();
                JsQty_Set.BodyStore.removeAll();

                fnCommonCreateLastNo('JS', nPanel.getComponent('js_no'), function () {
                    JsQty_Set.TableState = 'TableAdd';
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
            xtype: 'SunSearchNoWin',
            postUrl: '../ASHX/JSQty.ashx?action=TableSearch',
            defaultSearchCondition: "",
            model: JsQty_Set.Model_H,
            setGridColumns: function () {
                return [
                    { header: '计时单', name: 'js_no', dataIndex: 'js_no' },
                    { header: '计薪日期', name: 'js_dd', dataIndex: 'js_dd', xtype: 'datecolumn', format: 'Y/m/d' },
                    { header: '录入人员', name: 'sal_no', dataIndex: 'sal_no' },
                    { header: '备注', name: 'rem', dataIndex: 'rem' }
                ];
            },
            listeners: {
                subItemclick: function (record) {
                    fnGetAnTable(record.get('js_no'));
                    JsQty_Set.TableState = 'TableUpdate';
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
                if (JsQty_Set.TableState == 'TableAdd') {
                    sPanel.btnNew.handler();
                    return false;
                }

                var js_no = nPanel.js_no.getValue();
                Ext.MessageBox.confirm('确定删除', '确定删除单据吗? ' + "(" + js_no + ")", function (btn) {
                    if (btn == 'yes') {
                        Ext.Ajax.request({
                            url: '../ASHX/JSQty.ashx',
                            params: { action: 'TableDelete', js_no: js_no },
                            success: function (response) {
                                sPanel.btnNew.handler();
                            },
                            failtrue: function () {

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
                    if (JsQty_Set.TableState == 'TableAdd') {
                        fnCommonCreateLastNo('JS', nPanel.getComponent('js_no'), function () {
                            onFromSave();
                        });
                    }
                    else
                        onFromSave();
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
                        var NewModel = Ext.create('JsQty_Set.Model_B', {
                            qty: 0,
                            up: 0,
                            old_itm: -1,
                            is_add: true
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
                            var NewModel = Ext.create('JsQty_Set.Model_B', {
                                qty: 0
                            });
                            cPanel.grid.store.insert(index, NewModel);
                            cPanel.grid.getSelectionModel().select([NewModel]);
                        }
                        else {
                            CommMsgShow('提示', '请指定插入行');
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
                        var index = Common_GetGridSelectIndex(cPanel.grid);
                        if (index >= 0) {
                            cPanel.grid.store.removeAt(index);
                            var recSign = cPanel.grid.store.getAt(--index);
                            if (recSign)
                                cPanel.grid.getSelectionModel().select([recSign]);
                        }
                        else {
                            CommMsgShow('提示', '请指定删除行');
                        }
                    }
                }
            ],
        listeners: {
            afterrender: function () {
                sPanel.btn_add = this.getComponent('btn_add');
                sPanel.btnNew = this.getComponent('btnNew');
            }
        }
    });

});


// nPanel


// cPanel


//sPanel


//viewPort