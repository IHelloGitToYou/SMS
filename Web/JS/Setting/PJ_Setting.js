var PJQty_Set = {};
PJQty_Set.TableState = 'TableAdd';

// Hmodel

PJQty_Set.Model_H = Ext.define('PJQty_Set.Model_H', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'pj_no', type: 'string' },
        { name: 'pj_dd', type: 'date' },
        { name: 'plan_id', type: 'int' },
        { name: 'plan_no', type: 'string' },

        
        { name: 'prd_no', type: 'string' },

        { name: 'user_dep_no', type: 'string' },
        { name: 'wp_dep_no', type: 'string' },
        


        { name: 'sal_no', type: 'string' },
        { name: 'n_man', type: 'string' },
        { name: 'n_dd', type: 'date' },
        { name: 'e_man', type: 'string' },
        { name: 'e_dd', type: 'date' }
       
    ],
    associations: [
        { type: 'hasMany', model: 'PJQty_Set.Model_B', name: 'BodyData', autoLoad: false }
    ]
});


// Bmodel
PJQty_Set.Model_B = Ext.define('PJQty_Set.Model_B', {
    extend: 'Ext.data.Model',
    fields: [
       { name: 'pj_id', type: 'int' },
       { name: 'pj_no', type: 'string' },  
       { name: 'itm', type: 'int' },
       { name: 'sort', type: 'int' },

       { name: 'wp_no', type: 'string' },
       { name: 'wp_name', type: 'string' },  //虚似栏位
       
       { name: 'worker', type: 'string' },
       { name: 'material_grade', type: 'string' },

       { name: 'wp_qty_pair', type: 'number' },  
       { name: 'wp_qty_pic', type: 'number' },  
       { name: 'wl_qty', type: 'number' },  
       { name: 'back_good_qty', type: 'number' },  
       { name: 'back_broken_qty', type: 'number' },  
       { name: 'std_price', type: 'number' },  
       { name: 'std_unit_pre', type: 'number' },  
       { name: 'std_qty', type: 'number' }, 
       
       { name: 'price', type: 'number' }, 
       { name: 'unit_pre', type: 'number' }, 
       { name: 'qty', type: 'number' },

       { name: 'is_bad_wl', type: 'bool', convert: commonVar.ConvertBool},
       { name: 'ajust_std_unit', type: 'number' },

       { name: 'amt', type: 'number' },

        { name: 'size_id', type: 'int' },
        { name: 'size', type: 'string' },
        { name: 'color_id', type: 'int' }
    ]
});

// Store
//用于加载数据！
PJQty_Set.HeadStore = Ext.create('Ext.data.Store', {
    model: PJQty_Set.Model_H,
    autoLoad: false,
    proxy: {
        type: 'ajax',
        url: '../ASHX/PJ_Qty.ashx',
        reader: {
            type: 'json',
            root: 'items',
            totalProperty: 'total'
        }
    }
});

PJQty_Set.BodyStore = Ext.create('Ext.data.Store', {
    model: PJQty_Set.Model_B,
    autoLoad: false,
     sorters: [{
         property: 'itm',
         direction: 'asc'
    }],
    proxy: {
        type: 'ajax',
        url: '../ASHX/PJ_Qty.ashx',
        reader: {
            type: 'json'
        }
    }
});

var fnGetAnTable = function (pj_no) {
    PJQty_Set.HeadStore.load({
        params: { action: 'FetchTableData', pj_no: pj_no },
        callback: function () {
            var HeadRec = PJQty_Set.HeadStore.getAt(0),
                HeadRecData = HeadRec.data;
           
            nPanel.loadRecord(HeadRec);
            PJQty_Set.TableState = 'TableUpdate';

            Ext.suspendLayouts();
            PJQty_Set.BodyStore.removeAll();
            var T = HeadRec.BodyData();
            T.each(function (rec) {
                PJQty_Set.BodyStore.add(rec);
            });

            PJQty_Set.BodyStore.removed = [];
            Ext.resumeLayouts(true);

            reLoadComboStore();

            nPanel.getComponent('plan_id').setValue(HeadRec.get('plan_id'));
            Ext.Function.defer(function () {
                nPanel.getComponent('plan_no').setValue(HeadRec.get('plan_no'));
                nPanel.getComponent('cbSelectPlanNo').setRawValue(HeadRec.get('plan_no'));
            }, 250);
           

            nPanel.getComponent('prd_no').setValue(HeadRec.get('prd_no'));

            //nPanel.getComponent('size_id').setValue(HeadRec.get('size_id'));
            //nPanel.getComponent('size').setValue(HeadRec.get('size'));
            //nPanel.getComponent('color_id').setValue(HeadRec.get('color_id'));

            //var str1 = fnGetShowSizeAndColor(HeadRec.get('size'), HeadRec.get('color_id'));
            //nPanel.getComponent('showSizeAndColor').setValue(str1);

            nPanel.getComponent('cbSelectPlanNo').setReadOnly(true);
        }
    });
}

var fnGetShowSizeAndColor = function (size, color_id) {
    if (color_id > 0) {
        return size + '(' + commonVar.RenderColorName(color_id) + ')';
    }
    return size;
}

//更新工序下拉内容
var reLoadComboStore = function () {
    var prd_no = nPanel.getComponent('prd_no').getValue();
    commonVar.AjaxGetData('../ASHX/Prdt_WP.ashx',
        {
            action: 'GetPrdtWps',
            prd_no: prd_no,
            ups: ''
        },
        function (jsonData) {
            //CacheWPName = {};
            WQPrdtWPStore.removeAll(true);

            WQPrdtWPStore.add(jsonData.items);

            FilterWpStoreByWpDept();

            //记忆工序名称
            WQPrdtWPStore.each(function (rec) {
                CacheWPName[prd_no + '-' + rec.get('wp_no')] = rec.get('name');
            });
        }
    );
}

Ext.onReady(function () {
    var isAdminRoot = WpConfig.UserDefault[GlobalVar.NowUserId].root == '管理员';

    WQPrdtWPSelectorStore = Ext.create('Ext.data.Store', {
        model: 'Model_Only_PrdtWP',
        data: []
    });

    WQPrdtWPStore = Ext.create('Ext.data.Store', {
        model: 'Model_Only_PrdtWP',
        data: []
    });
    ///工序Cb 依工序部门过滤
    FilterWpStoreByWpDept = function () {
        var me = this;
        var cbData = [];

        var wp_dep_no = nPanel.getComponent('wp_dep_no').getValue();
        WQPrdtWPStore.findBy(function (_qRec) {
            //cbData.push({ wp_no: _qRec.get('wp_no'), name: _qRec.get('name') });

            if (wp_dep_no == '' || wp_dep_no == '000000') {
                cbData.push({ wp_no: _qRec.get('wp_no'), name: _qRec.get('name') });
            }
            else if (_qRec.get('dep_no') == wp_dep_no) {
                cbData.push({ wp_no: _qRec.get('wp_no'), name: _qRec.get('name') });
            }
        });
        
        WQPrdtWPSelectorStore.removeAll();
        WQPrdtWPSelectorStore.add(cbData);
    }



    ListenSizeIdChange = function (records) {
        if (records && records.length > 0) {
            var cbSel = records[0];

            nPanel.getComponent('plan_id').setValue(cbSel.get('plan_id'));
            Ext.Function.defer(function () {
                nPanel.getComponent('plan_no').setValue(cbSel.get('plan_no'));
                nPanel.getComponent('cbSelectPlanNo').setRawValue(cbSel.get('plan_no'));
                
            }, 190);

            nPanel.getComponent('prd_no').setValue(cbSel.get('prd_no'));
            
            

            

            //nPanel.getComponent('size_id').setValue(cbSel.get('size_id'));
            //nPanel.getComponent('size').setValue(cbSel.get('size'));

            //nPanel.getComponent('color_id').setValue(cbSel.get('color_id'));
            //var str1 = fnGetShowSizeAndColor(cbSel.get('size'), cbSel.get('color_id'));
            //nPanel.getComponent('showSizeAndColor').setValue(str1);
            reLoadComboStore();
        }
        else {
            alert('填充其他选择时,出错! 试重选一次!');
        }
    }

    CacheWPName = {};

    var fnFindWPNameInCache = function (showingRecord) {
        var prd_no = nPanel.getComponent('prd_no').getValue();
        var wp_no = showingRecord.get('wp_no');

        if (wp_no) {

            if (CacheWPName[prd_no + '-' + wp_no]) {
                //showingRecord.set('wp_name', CacheWPName[prd_no + '-' + wp_no]);
                return CacheWPName[prd_no + '-' + wp_no];
            }
            else {
                return '';
                //reLoadComboStore();
            }
        }
        else {
            return '';
            //showingRecord.set('wp_name', '');
        }
    }

    var fnLoadDoneWPQty = function () {
        
        if (!Ext.getCmp('plan_id_id').getValue()) {
            alert('还未选择计件单!');
            return;
        }

        var fnTemp = function () {
            commonVar.AjaxGetData('../ASHX/PJ_Qty.ashx',
                {
                    action: 'GetDoneWPQty',
                    plan_id: Ext.getCmp('plan_id_id').getValue(),
                    wp_dep_no: Ext.getCmp('wp_dep_no_id').getValue(),
                    user_dep_no: Ext.getCmp('user_dep_no_id').getValue(),
                    wp_start_dd: nPanel.getComponent('wp_start_dd').getValue(),
                    wp_end_dd: nPanel.getComponent('wp_end_dd').getValue()
                },
                function (jsonData) {
                    console.log(jsonData);
                    PJQty_Set.BodyStore.removeAll();
                    //B.size_id , worker ,B.wp_no,sum(isnull(B.qty_pair,0)) as done_pair,sum(isnull(B.qty_pic,0)) as done_pic 
                    for (var i = 0; i < jsonData.length; i++) {
                        PJQty_Set.BodyStore.add({
                            size: jsonData[i].size,
                            size_id: jsonData[i].size_id,
                            color_id: jsonData[i].color_id,
                            worker: jsonData[i].worker,
                            wp_no: jsonData[i].wp_no,
                            wp_qty_pair: jsonData[i].done_pair,
                            wp_qty_pic: jsonData[i].done_pic,
                            price: jsonData[i].price,
                            std_unit_pre: jsonData[i].std_unit_pre
                        });


                        //fnLoadPrdtWpMaterial(
                        //        nPanel.getComponent('prd_no').getValue(),
                        //        e.value,
                        //        nPanel.getComponent('size').getValue(),
                        //        function (json) {
                        //            //Response.Write("{ Head:" + JsonClass.DataTable2Json(dtHead));
                        //            //Response.Write("  ,Body:" + JsonClass.DataTable2Json(dtBodySize));
                        //            //Response.Write(" }");
                        //            //Response.End();
                        //            if (json.Head.length > 0) {
                        //                e.record.set('price', json.Head[0].price);
                        //            }
                        //            if (json.Body.length > 0) {
                        //                e.record.set('std_unit_pre', json.Body[0].use_unit);
                        //            }

                        //            editor.fireEvent('price', { field: 'price', value: e.record.get('price') });
                        //        }
                        //);
                    }
                }
            );
        }

        if (PJQty_Set.BodyStore.getCount() > 0) {
            Ext.MessageBox.confirm('确认', '重新加载会覆盖已有的数据，确认覆盖吗? ', function (btn) {
                if (btn == 'yes') {
                    fnTemp();
                }
            }, this);

            return;
        }

        fnTemp();
    }

    PJQty_Set.BodyGridCols = function () {
        return [
            { xtype: 'rownumberer' },
            {
                header: '尺寸', name: 'size_id', dataIndex: 'size_id', renderer: function (v, m, recvv) {
                    return fnGetShowSizeAndColor(recvv.get('size'), recvv.get('color_id'))
                }
            },
            {
                header: '工序', name: 'wp_no', dataIndex: 'wp_no',
                editor: {
                    xtype: 'combobox',
                    store: WQPrdtWPSelectorStore,
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'wp_no',
                    editable: false
                },
                renderer: function (v, m, rec) {
                    if (rec.get('wp_name')) {
                        return rec.get('wp_name');
                    }
                    else {
                        return fnFindWPNameInCache(rec);
                    }
                },
                sortable: false
            },
            {
                header: '员工', name: 'worker', dataIndex: 'worker',
                editor: {
                    xtype: 'MSearch_Salm',
                    matchFieldWidth:false
                },
                renderer: GlobalVar.rdSalmName,
                sortable: false
            },

            //{ header: '等级', name: 'material_grade', dataIndex: 'material_grade', editor: {}, sortable: false },
            { header: '对数', name: 'wp_qty_pair', dataIndex: 'wp_qty_pair', editor: { xtype: 'numberfield' }, sortable: false, renderer: rendererForNum },
            { header: '个数', name: 'wp_qty_pic', dataIndex: 'wp_qty_pic', tdCls: 'disabled_column', hidden: true, sortable: false, renderer: rendererForNum },

          
            { header: '领料量', name: 'wl_qty', dataIndex: 'wl_qty', editor: { xtype: 'numberfield' }, sortable: false, renderer: rendererForNum },
            { header: '碎片', name: 'back_broken_qty', dataIndex: 'back_broken_qty', editor: { xtype: 'numberfield' }, sortable: false, renderer: rendererForNum },
            { header: '退料', name: 'back_good_qty', dataIndex: 'back_good_qty', editor: { xtype: 'numberfield' }, sortable: false, renderer: rendererForNum },
            { header: '实际领料', name: 'qty', dataIndex: 'qty', tdCls: 'disabled_column', sortable: false, renderer: rendererForNum },
            
            { header: '标准单耗(对)', name: 'std_unit_pre', dataIndex: 'std_unit_pre', tdCls: 'disabled_column', sortable: false, renderer: rendererForNum },
            {
                header: '调整单耗', name: 'ajust_std_unit', dataIndex: 'ajust_std_unit', tdCls: (isAdminRoot ? '' : 'disabled_column'),
                editor: isAdminRoot ? { xtype: 'numberfield', decimalPrecision: 6, step: 0.001 } : null ,
                sortable: false, renderer: rendererForNum
            },
            {
                header: '是否坏料', name: 'is_bad_wl', dataIndex: 'is_bad_wl', editor: { xtype: 'checkbox', hideLabel: false }, sortable: false, renderer: function (v, m, vvrec) {
                    return v == true ? "是" : "";
                }
            },

            { header: '实际单耗(对)', name: 'unit_pre', dataIndex: 'unit_pre', tdCls: 'disabled_column', sortable: false, renderer: rendererForNum },
            
            { header: '皮奖单价', name: 'price', dataIndex: 'price', width: 90, tdCls: 'disabled_column', sortable: false, renderer: rendererForNum, editor: { xtype: 'numberfield', decimalPrecision: 6 } },
            { header: '皮奖金额', name: 'amt', dataIndex: 'amt',  width:160, tdCls: 'disabled_column', sortable: false, renderer: rendererForNum }
        ];
    }

    //,,plan_id, plan_no,user_dep_no ,size_id ,size, wp_no,  n_man,n_dd,e_man,e_dd
    nPanel = Ext.create('Ext.form.Panel', {
        region: 'north',
        url: '../../Handler2/Word/MF_SO.ashx',
        defaults: {
            labelWidth: 80,
            width:230,
            margin: '3 3 3 5',
            labelAlign:'right'
        },
        layout: {
            type:'table',
            columns: 6
        },
        items: [
            {
                itemId: 'pj_dd',
                name: 'pj_dd',
                xtype: 'datefield',
                fieldLabel: '皮奖日期',
                format: 'Y/m/d',
                //minValue: Ext.Date.add(GlobalVar.ServerDate, Ext.Date.DAY, -1 * (WpConfig.freezeDay - 1)),
                //maxValue: GlobalVar.ServerDate,
                value: GlobalVar.ServerDate
            },
            {
                itemId: 'pj_no',
                name: 'pj_no',
                xtype: 'textfield',
                fieldLabel: '皮奖单号'
            },
            {
                id: 'plan_id_id',
                itemId: 'plan_id',
                name: 'plan_id',
                xtype: 'hiddenfield'
            },
            {
                id: 'plan_no_id',
                itemId: 'plan_no',
                name: 'plan_no',
                xtype: 'hiddenfield'
            },
            //{
            //    id: 'size_id_id',
            //    itemId: 'size_id',
            //    name: 'size_id',
            //    xtype: 'hiddenfield'
            //},
            //{
            //    itemId: 'color_id',
            //    name: 'color_id',
            //    xtype: 'hiddenfield'
            //},
            {
                itemId: 'sal_no',
                name: 'sal_no',
                xtype: 'MSearch_Salm',
                value: GlobalVar.NowUserId,
                fieldLabel: '录入员',
                colspan: 4
            },
            {
                fieldLabel: '计划单&nbsp&nbsp&nbsp',
                name: 'cbSelectPlanNo',
                itemId: 'cbSelectPlanNo',
                //allowBlank: false,
                xtype: 'MSearch_PlanNo',  
                pageSize: 100,
                listeners: {
                    select: function (vcombo, records, eOpts) {
                        ListenSizeIdChange(records);
                    }
                }
            },
            {
                fieldLabel: '货品代号*',
                name: 'prd_no',
                itemId: 'prd_no',
                xtype: 'MSearch_Prdt',
                allowBlank: false,
                readOnly: true,
                colspan: 5
            },
              //{
              //    fieldLabel: '尺&nbsp&nbsp&nbsp&nbsp&nbsp寸*',
              //    name: 'size',
              //    itemId: 'size',
              //    xtype: 'MSearch_Size',
              //    allowBlank: false,
              //    readOnly: true,
              //    hidden: true
              //},
              //{
              //    fieldLabel: '尺寸与颜色*',
              //    name: 'showSizeAndColor',
              //    itemId: 'showSizeAndColor',
              //    xtype: 'textfield',
              //    readOnly: true,
              //    colspan: 4
              //},
              {
                  fieldLabel: '工序部门',
                  id: 'wp_dep_no_id',
                  name: 'wp_dep_no',
                  itemId: 'wp_dep_no',
                  xtype: 'MSearch_DeptWP',
                  value: WpConfig.UserDefault[GlobalVar.NowUserId].wp_dep_no || '000000',
                  allowBlank: false,
                  listeners: {
                      change: function () {
                          if (nPanel.getComponent('plan_no').getValue()) {
                              reLoadComboStore();
                          }
                      }
                  }
              },
              {
                  fieldLabel: '员工部门*',
                  id: 'user_dep_no_id',
                  name: 'user_dep_no',
                  itemId: 'user_dep_no',
                  xtype: 'MSearch_Dept',
                  value: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000',
                  allowBlank: false
              },
            {
                xtype:'button',
                text: '加载计件量',
                margin: '3 3 3 20',
                height: 40,
                width: 100,
                handler: fnLoadDoneWPQty
            },
            {
                xtype: 'datefield',
                fieldLabel: '从',
                format: 'Y/m/d',
                labelWidth: 30,
                width: 140,
                itemId: 'wp_start_dd',
                name: 'wp_start_dd',
                value: GlobalVar.MouthFirstDay
            },{
                xtype: 'datefield',
                fieldLabel: '至',
                labelWidth :30,
                format: 'Y/m/d',
                width: 140,
                itemId: 'wp_end_dd',
                name: 'wp_end_dd',
                value: GlobalVar.MouthLastDay
            }
        ],
        listeners: {
            afterrender: function () {
                nPanel.pj_no = nPanel.getComponent('pj_no');
            }
        }
    });

    

    cPanel = Ext.create('SunGridClass', {
        region: 'center',
        gridID: 'PJQty_html',
        pageID: 'BodyGrid',
        CompanyCDNO: 'C1002',
        store: PJQty_Set.BodyStore,
        myMinHeight: 0,
        SaveMode: '1',
        cellEditing: Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1,
            listeners: {
                beforeedit: function (editor, e, eOpts) {
                    cPanel.cellEditing.nowRecord = e.record;
                },
                edit: function (editor, e, eOpts) {
                    if (e.value == e.originalValue) {
                        return false;
                    }
                    
                    //推算 个数
                    if (e.field == "wp_qty_pair"){
                        WQPrdtWPStore.findBy(function (qRec) {
                            if (qRec.get('wp_no') == e.record.get('wp_no')) {
                                e.record.set('wp_qty_pic', e.record.get('wp_qty_pair') * qRec.get('pic_num'));
                                return true;
                            }
                        });
                    }

                    //推算，耗用量、实际单耗
                    if (e.field == "wl_qty" || e.field == "back_broken_qty" || e.field == "back_good_qty") {
                        e.record.set('qty', e.record.get('wl_qty') - e.record.get('back_good_qty') - e.record.get('back_broken_qty'));

                        if (e.record.get('wp_qty_pair') > 0) {
                            var rnum = Ext.util.Format.round( e.record.get('qty') / e.record.get('wp_qty_pair'), 3);
                            e.record.set('unit_pre', rnum);
                        }
                        else
                            e.record.set('unit_pre', 0);

                        editor.fireEvent('edit', { field: 'qty', value: e.record.get('qty') });
                    }
                    

                    if (e.field == "qty" || e.field == "wp_qty_pair" ) {
                        if (e.record.get('wp_qty_pair') > 0) {
                            var rnum = Ext.util.Format.round( e.record.get('qty') / e.record.get('wp_qty_pair'), 3);
                            e.record.set('unit_pre', rnum);
                        }
                        else
                            e.record.set('unit_pre', 0);
                    }

                    
                    //if (e.field == "wp_qty_pair" || e.field == "qty" || e.field == 'std_unit_pre' || e.field == "ajust_std_unit" || e.field == "unit_pre" || e.field == "price") {
                    var amt = (e.record.get('std_unit_pre') + e.record.get('ajust_std_unit') - e.record.get('unit_pre')) * e.record.get('price') * e.record.get('wp_qty_pair');
                    amt = Ext.util.Format.round(amt, 3);
                    if (amt <= 0) {
                        amt = 0;
                    }
                    e.record.set('amt', amt);
                    //}
                }
            }
        }),
        getDefaultColumnsSetting: PJQty_Set.BodyGridCols,
        listeners: {
            containerdblclick: function (vthis, e, eOpts) {
               
            }
        }
    });

    var fnLoadPrdtWpMaterial = function (p_prd_no, p_wp_no, p_size, fncallback) {
        Ext.Ajax.request({
            url: commonVar.urlCDStr + 'ASHX/Material/ashx_PrdtWpMaterial.ashx',
            params: {
                action: 'Load',
                prd_no: p_prd_no,
                wp_no: p_wp_no,
                size: p_size
            },
            success: function (response) {
                var json = Ext.JSON.decode(response.responseText);
                if (json) {
                    fncallback(json);
                    
                }
                else {
                    CommMsgShow("加载失败:");
                }
            },
            failure: function (form, action) {
                CommMsgShow("异常：", form.responseText, true);
            }
        });
    };

    var IsLocking = function () {
        if (PJQty_Set.TableState != 'TableUpdate')
            return false;
        var EditingJS = PJQty_Set.HeadStore.getAt(0);
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
        if (PJQty_Set.TableState == 'TableUpdate') {
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
        var op = { action: PJQty_Set.TableState },
            getBug = false;

        cPanel.grid.store.each(function (_rec) {
            if (_rec.get('worker')) {
                if (_rec.get('qty') <= 0) {
                    cPanel.grid.getSelectionModel().select([_rec]);
                    CommMsgShow('提示', '单据行实际领料不能 < 0 ', true);
                    getBug = true;
                    return false;
                }

                if (_rec.get('wp_qty_pair') <= 0) {
                    cPanel.grid.getSelectionModel().select([_rec]);
                    CommMsgShow('提示', '单据行 对数 不能 < 0', true);
                    getBug = true;
                    return false;
                }

                _rec.fields.each(function (field) {
                    var itemName = field.name;
                    if (field.name != 'pj_dd' && field.name != 'js_no')
                        op[itemName + '_' + idx] = _rec.get(field.name);
                });
                ++idx;
            }

        });

        if (getBug)
            return false;

        op['body_cnt'] = idx;
        Ext.apply(op, nPanel.getForm().getValues());
        op['NowUserId'] = GlobalVar.NowUserId;
        

        Ext.Ajax.request({
            url: '../ASHX/PJ_Qty.ashx',
            params: op,
            success: function (response) {
                var jsonObj = Ext.JSON.decode(response.responseText);
                if (jsonObj.result == true) {
                    
                    fnGetAnTable(nPanel.pj_no.getValue());

                    CommMsgShow('提示', '操作成功');
                }
                else
                    CommMsgShow('异常', unescape(jsonObj.errmsg), true);
            },
            failtrue: function (response) {
                CommMsgShow('异常', '保存失败!', true);
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
                PJQty_Set.TableState = 'TableAdd';
                nPanel.getForm().reset();
                PJQty_Set.BodyStore.removeAll();

                fnCommonCreateLastNo('PJ', nPanel.getComponent('pj_no'), function () {
                    PJQty_Set.TableState = 'TableAdd';
                });
                nPanel.getComponent('cbSelectPlanNo').setReadOnly(false);

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
            postUrl: '../ASHX/PJ_Qty.ashx?action=TableSearch',
            defaultSearchCondition: "",
            model: PJQty_Set.Model_H,
            setGridColumns: function () {
                return [
                     { header: '皮奖日期', name: 'pj_dd', dataIndex: 'pj_dd', xtype: 'datecolumn', format: 'Y/m/d' },
                     { header: '皮奖单号', name: 'pj_no', dataIndex: 'pj_no' },
                     { header: '计划单号', name: 'plan_no', dataIndex: 'plan_no' },
                     { header: '录入人员', name: 'sal_no', dataIndex: 'sal_no' }
                ];
            },
            listeners: {
                subItemclick: function (record) {
                    fnGetAnTable(record.get('pj_no'));
                    PJQty_Set.TableState = 'TableUpdate';
                },
                fetchBack: function (records) {
                    if (records.length >= 1) {
                        this.fireEvent('subItemclick', records[0]);
                    }
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
                if (PJQty_Set.TableState == 'TableAdd') {
                    sPanel.btnNew.handler();
                    return false;
                }

                var pj_no = nPanel.pj_no.getValue();
                Ext.MessageBox.confirm('确定删除', '确定删除单据吗? ' + "(" + pj_no + ")", function (btn) {
                    if (btn == 'yes') {
                        Ext.Ajax.request({
                            url: '../ASHX/PJ_Qty.ashx',
                            params: { action: 'TableDelete', pj_no: pj_no },
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
                    if (PJQty_Set.TableState == 'TableAdd') {
                        fnCommonCreateLastNo('PJ', nPanel.getComponent('pj_no'), function () {
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
                    disabled : true,
                    handler: function () {
                        var NewModel = Ext.create('PJQty_Set.Model_B', {
                            qty: 0
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
                    disabled: true,
                    icon: '../JS/resources/MyIcon/icon_skill.png',
                    handler: function () {
                        var index = Common_GetGridSelectIndex(cPanel.grid);
                        if (index >= 0) {
                            var NewModel = Ext.create('PJQty_Set.Model_B', {
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

 