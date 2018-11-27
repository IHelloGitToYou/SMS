//弹出窗体
var EditShareWinObj = {
    TableType:'计件分成',
    EditingWQ: null,
    WQPrdtWP_SizeControlStore: Ext.create('Ext.data.Store', {
        model: 'PrdtWp_SizeControl_Model',
        data: []
    }),
    CreateShareWorkerGridStore: function () {
        return Ext.create('Ext.data.Store', {
            fields: [
                { name: 'worker', type: 'string' },
                { name: 'share_percent', type: 'number' },
                { name: 'inscrease_percent', type: 'number' },
                { name: 'amt', type: 'number' },
                { name: 'amt2', type: 'number' }
            ],
            data: [
                { worker: '', share_percent: 100, inscrease_percent: 0, amt: 0 },
                { worker: '', share_percent: 0, inscrease_percent: 0, amt: 0 },
                { worker: '', share_percent: 0, inscrease_percent: 0, amt: 0 }
            ]
        });
    },
    CreateSizeSelectStore: function () {
        var me = this;
        var store = Ext.create('Ext.data.Store', {
            model: 'WorkPlan_Sizes_Model',
            data: []
        });
        return store;
    },
    ///后台查询计划单的 尺寸任务
    LoadSizeStoreDataSync: function (sizeStore, callBack) {
        var me = this;
        var proxyUrl = commonVar.urlCDStr + 'ASHX/ashx_WorkPlan.ashx?action=LoadWorkPlan&NowUserId=' + GlobalVar.NowUserId;        //可更新网址
        Ext.Ajax.request({
            url: proxyUrl,
            params: {
                plan_id: me.EditingWQ.get('plan_id')
            },
            success: function (response, opts) {
                var arr = Ext.decode(response.responseText);
                sizeStore.add(arr.sizes);

                callBack();
            },
            failure: function (response, opts) {
                //console.log('server-side failure with status code ' + response.status);
            }
        });
    },
    ///创建员工选择Store
    CreateWorkerSelectStore: function () {
        var me = this;
        var store = Ext.create('Ext.data.Store', {
            model: 'Model_Salm',
            data: []
        });

        me.LoadWorkerStoreDataOnGlobalVar(store);

        return store;
    },
    //在系统 主缓存加载员工
    LoadWorkerStoreDataOnGlobalVar: function (workerStore) {
        var me = this;
        var user_dep_no = me.EditingWQ.get('user_dep_no');
        var data = [];
        GlobalVar.SalmStore.findBy(function (_qRec) {
            if (user_dep_no == '' || user_dep_no == '000000') {
                data.push(_qRec.getData());
            }
            else if (_qRec.get('dep_no') == user_dep_no) {
                data.push(_qRec.getData());
            }
        });

        workerStore.add(data);
    },
    ///工序Cb 依工序部门过滤
    FilterWpStoreByWpDept: function () {
        var me = this;
        var cbData = [];

        var wp_dep_no = me.EditingWQ.get('wp_dep_no');
        var wqbRec = me.WQDetailStore.findRecord('wqb_id', me.nowWQB_ID);
        for (var i = 0; i < me.WQPrdtWPStore.getCount() ; ++i) {
            var _qRec = me.WQPrdtWPStore.getAt(i);
            if (_qRec.get('state') == '1' && me.nowWQB_ID < 0) {
                continue;
            }

            //有之前的报产,保留被删除的工序
            if (_qRec.get('state') == '1' && me.nowWQB_ID >= 0) {
                if (!wqbRec) {
                    me.WQPrdtWPSelectorStore.clearData();
                    alert('计件行异常不存在!  请联系吖耀!');
                    return;
                }

                if (wqbRec.get('wp_no') != _qRec.get('wp_no')) {
                    continue;
                }
            }

            if (wp_dep_no == '' || wp_dep_no == '000000') {
                cbData.push({ wp_no: _qRec.get('wp_no'), name: _qRec.get('name') });
            }
            else if (_qRec.get('dep_no') == wp_dep_no) {
                cbData.push({ wp_no: _qRec.get('wp_no'), name: _qRec.get('name') });
            }
        }

        //me.WQPrdtWPStore.findBy(function (_qRec) {
        //    if (wp_dep_no == '' || wp_dep_no == '000000') {
        //        cbData.push({ wp_no: _qRec.get('wp_no'), name: _qRec.get('name') });
        //    }
        //    else if (_qRec.get('dep_no') == wp_dep_no) {
        //        cbData.push({ wp_no: _qRec.get('wp_no'), name: _qRec.get('name') });
        //    }
        //});

        me.WQPrdtWPSelectorStore.clearData();
        me.WQPrdtWPSelectorStore.add(cbData);

    },

    ListenFormFieldChange: function (form, formGrid) {
        var me = this;
        
        form.getComponent('size_id').on('change', function () {
            me.onChagedSizeId(form);
        });
        
        form.getComponent('wp_no').on('change', function (vbox, newValue, oldValue, eOpts) {
            me.onChangeWp(form, oldValue, newValue);
        });

        me.updateInscreasePercentAndTipLabel();

        form.getComponent('wp_no').setValue(me.nowWpNo);
        
        form.getComponent('qty_pair').on('change', function (vbox, newValue, oldValue, eOpts) {
            me.onChangeQtyPair(form);
        });
    },
    ///限制数量最大值
    SetMaxQty: function (form) {
        var me = this;
        var wp_no = form.getComponent('wp_no').getValue() || 0;
        if (wp_no) {
            var plan_sizes_qty = me.EditingWQ.get('plan_sizes_qty');
            var plan_size_qty = me.EditingWQ.get('plan_size_qty');

            var wq_type = me.EditWQGridData[wp_no].wq_type || 'size_qty';
            var editMaxNum = 0;
            if (me.nowWQB_ID < 0) {
                editMaxNum = wq_type == 'size_qty' ?
                    (plan_size_qty - me.EditWQGridData[wp_no].sum_qty_pair )
                      : (plan_sizes_qty - me.EditWQGridData[wp_no].sum_all_qty_pair);
            }
            else {
                var wqbRec = me.WQDetailStore.findRecord('wqb_id', me.nowWQB_ID);
                if (wqbRec == null) {
                    alert('输入行意外不存在, 有意外程序末有考虑到,请联系吖潮!');
                    editMaxNum = 0;
                }

                editMaxNum = wq_type == 'size_qty' ?
                    (plan_size_qty - me.EditWQGridData[wp_no].sum_qty_pair )
                      : (plan_sizes_qty - me.EditWQGridData[wp_no].sum_all_qty_pair);
                
                //减少本单已输入, 有可能切换成其它工序
                if (wp_no == wqbRec.get('wp_no')) {
                    editMaxNum += wqbRec.get('qty_pair');
                }
            }

            form.getComponent('qty_pair').setMaxValue((editMaxNum < 0 ? 0 : editMaxNum));
        }
        else {
            form.getComponent('qty_pair').setMaxValue(100000);
        }

        me.SetFinishLabelText();
    },

    SetFinishLabelText: function () {
        var me = this;
        var wp_no = me.form.getComponent('wp_no').getValue();
        var plan_sizes_qty = me.EditingWQ.get('plan_sizes_qty');
        var plan_size_qty = me.EditingWQ.get('plan_size_qty');
        var nowQty = me.form.getComponent('qty_pair').getValue()||0.00 ;

        if (wp_no) {
            var wq_type = me.EditWQGridData[wp_no].wq_type || 'size_qty';
            var cellingNum = (wq_type == 'size_qty' ? plan_size_qty : plan_sizes_qty);
            var originFinish = (wq_type == 'size_qty' ? me.EditWQGridData[wp_no].sum_qty_pair: me.EditWQGridData[wp_no].sum_all_qty_pair);
            //console.log({ nowQty: nowQty, originFinish: originFinish });

            if (me.nowWQB_ID <= 0) {
                nowQty = nowQty + originFinish;
            }
            else {
                var wqbRec = me.WQDetailStore.findRecord('wqb_id', me.nowWQB_ID);
                if (wqbRec) {
                    if (wp_no == wqbRec.get('wp_no')) {
                        nowQty = originFinish - wqbRec.get('qty_pair') + nowQty;
                    }
                }
                else {
                    alert('输入行意外不存在, 有意外程序末有考虑到,请联系吖潮!');
                }
            }

            me.form.getComponent('finish_label_id').setText('完工:' + nowQty + ' ->计划:' + cellingNum);
        }
        else {
            me.form.getComponent('finish_label_id').setText('完工:' + nowQty + ' ->计划:' + plan_sizes_qty);
        }
    },
    //切换尺寸时,重加载变量
    onChagedSizeId: function (form) {
        var me = this;
        me.nowSizeId = form.getComponent('size_id').getValue();
        var sizeIdRecord = null;
           

        me.SizeIdStore.findBy(function (qRec) {
            if (qRec.get('size_id') == me.nowSizeId) {
                sizeIdRecord = qRec;
            }
        });
        
        if (sizeIdRecord) {
            me.nowSize = sizeIdRecord.get('size');
            me.nowColorId = sizeIdRecord.get('color_id');

            me.OnLoadLayoutData(function (layoutData) {
                me.FitStoreFromJson(layoutData, true);

                me.GenerateEditWQGridData();
                var wp_no = form.getComponent('wp_no').getValue();
                if (wp_no) {
                    me.onChangeWp(form, '', wp_no);
                    me.onGridEdit(null, { field: 'worker', record: me.gridStore.getAt(0) });
                }

                me.updateInscreasePercentAndTipLabel();
            });
        }
        else{
            me.updateInscreasePercentAndTipLabel();
        }
    },
    //依计划量变加翻比率.
    updateInscreasePercentAndTipLabel:function(){
        var me = this,
            sizeIdRecord = null,
            planSizeQtyPair = 0,
            inscreasePercent = 0;

        me.nowSizeId = me.form.getComponent('size_id').getValue();
        me.SizeIdStore.findBy(function (qRec) {
            if (qRec.get('size_id') == me.nowSizeId) {
                sizeIdRecord = qRec;
            }
        });

        if (sizeIdRecord) {
            planSizeQtyPair = sizeIdRecord.get('qty');
            inscreasePercent = WpConfig.GetPairInscrease(planSizeQtyPair, 'SY');
            me.form.getComponent('inscrease_percent').setValue(inscreasePercent);
            me.form.getComponent('inscrease_label_id').setText('计划尺寸量:' + planSizeQtyPair + ', 加翻' + inscreasePercent + '%');
        }
        else {
            me.form.getComponent('inscrease_percent').setValue(0);
            me.form.getComponent('inscrease_label_id').setText('.....');
        }
    },
    
    /////显示二个单价, 重推2个金额
    onChangeWp: function (form, oldWpNo, newWpNo) {
        var me = this;
        me.nowWpNo = newWpNo;
        var up_pic = me.EditWQGridData[newWpNo]['up_pic'];
        var up_pair = me.EditWQGridData[newWpNo]['up_pair'];

        form.getComponent('up_pic').setValue(up_pic);
        form.getComponent('up_pair').setValue(up_pair);

        me.onCalAmt(form);
        me.onGridEdit(null, { field: 'worker', record: me.gridStore.getAt(0) });

        me.SetMaxQty(form);
    },
    //计算加翻,与推另一个数量(个数量不能改)
    onChangeQtyPair: function (form) {
        var me = this;
        var qty_pair = form.getComponent('qty_pair').getValue() || 0;
        var wp_no = form.getComponent('wp_no').getValue();
        var qty_pair = form.getComponent('qty_pair').getValue();
        var pic_num = me.EditWQGridData[wp_no].pic_num;
        var qty_pic = qty_pair * pic_num;

        form.getComponent('qty_pic').setValue(qty_pic);

        me.onCalAmt(form);
        me.SetFinishLabelText();
        me.onGridEdit(null, { field: 'worker', record: me.gridStore.getAt(0) });
    },
    onCalAmt: function (form) {
        var me = this;
        var up_pair = form.getComponent('up_pair').getValue() || 0;
        var qty_pair = form.getComponent('qty_pair').getValue() || 0;

        form.getComponent('amt').setValue(up_pair * qty_pair);

        var inscrease_percent = form.getComponent('inscrease_percent').getValue() || 0;
        if (inscrease_percent > 0) {
            form.getComponent('amt2').setValue(up_pair * qty_pair * (1 + inscrease_percent / 100));
        }
        else {
            form.getComponent('amt2').setValue(up_pair * qty_pair );
        }
    },
    onGetWorkerCount: function (store) {
        var cnt = 0;
        for (var i = 0; i < store.getCount(); i++) {
            if (store.getAt(i).get('worker')) {
                ++cnt;
            }
        }
        return cnt;
    },

    ///选择时限制由上到下选人员,防止跳空选
    onGridBeforeEdit: function (edit, e) {
        if (!e || !e.record) {
            e.cancel = true;
            return false;
        }

        var store = e.record.store;
        
        if (e.field == 'worker') {
            if (e.rowIdx == 0) {
                return true;
            }
            //console.log([e.rowIdx, e.field, store.getAt(e.rowIdx - 1).get('worker')]);
            if (!store.getAt(e.rowIdx - 1).get('worker')) {
                e.cancel = true;
                return false;
            }
        }
    },
    onGridEdit: function (edit, e) {
        var me = this;
        var store = e.record.store;

        if (e.field == 'worker') {
            store.getAt(0).set('share_percent', 100);

            var workerCnt = me.onGetWorkerCount(store);
            var shares = WpConfig.ShareSetting.SY['MAN' + workerCnt];  //取丝印部的分成设置

            for (var i = 0; i < workerCnt && i <= 2; i++) {
                store.getAt(i).set('share_percent', shares[i]);
                store.getAt(i).commit();
            }
        }
    },

    fnGetFormParams: function () {
        //员工分成金额与表头金额要一致
        var me = this;
        var isAdminRoot = WpConfig.UserDefault[GlobalVar.NowUserId].root == '管理员';
        if (me.form.isValid() == false) {
            if (isAdminRoot && me.fnOnlyOverQty()) {
                alert("数量已超录!(但管理员有权限,请按实际录入,并注意帐号密码安全!)");
            }
            else {
                alert('数据填写有误,请注意标红色的地方!');
                return;
            }
        }
        var workerCnt = me.onGetWorkerCount(me.gridStore);
        if (workerCnt <= 0) {
            alert('末选择分成人员');
            return;
        }
        var totalSharePre = 0;
        for (var i = 0; i < me.gridStore.getCount(); i++) {
            if (me.gridStore.getAt(i).get('worker')) {
                totalSharePre += me.gridStore.getAt(i).get('share_percent');
            }
        }
        if (totalSharePre != 100) {
            alert('分成比率不完整:' + totalSharePre + "%");
            return;
        }
        var saveParams = { action: 'SaveOneWQB', TableType: me.TableType, IsShareTable: IsShareTable, NowUserId: GlobalVar.NowUserId };
        Ext.apply(saveParams, me.EditingWQ.getData());

        if (me.nowSizeId <= 0) {
            alert('尺寸末选择');
            return;
        }
        if (!me.nowWpNo) {
            alert('工序末选择');
            return;
        }

        saveParams.wqb_id = me.nowWQB_ID
        saveParams.size_id = me.nowSizeId;
        saveParams.size = me.nowSize;
        saveParams.wp_no = me.nowWpNo;
        saveParams.color_id = me.nowColorId;
        saveParams.qty_pic = me.form.getComponent('qty_pic').getValue();
        saveParams.qty_pair = me.form.getComponent('qty_pair').getValue();
        saveParams.inscrease_percent = me.form.getComponent('inscrease_percent').getValue();

        if (saveParams.qty_pair <= 0) {
            alert('工序数量末输入!');
            return;
        }

        var bodyCnt = 0;
        for (var i = 0; i < me.gridStore.getCount() ; i++) {
            var worker = me.gridStore.getAt(i).get('worker');
            if (worker) {
                saveParams['worker_' + bodyCnt] = worker;
                saveParams['share_percent_' + bodyCnt] = me.gridStore.getAt(i).get('share_percent');
                ++bodyCnt;
            }
        }
        saveParams['bodyCnt'] = bodyCnt;
        return saveParams;
    },
    //是否仅仅是超数量,如果写走管理员能超数
    fnOnlyOverQty:function(){
        var me = this;
        if (!me.form.getComponent('wp_no').getValue()) {
            return false;
        }

        if (!me.form.getComponent('size_id').getValue()) {
            return false;
        }

        var boxQty = me.form.getComponent('qty_pair');
        return boxQty.getValue() > boxQty.maxValue;
    },
    nowWQB_ID:-1,
    nowSizeId: -1,
    nowSize: '',
    nowColorId: -1,
    nowWpNo: '',
    SizeIdStore : null,
    fnOpenBeforeLoad: function (callbackLayoutWin) {
        var me = this;
        me.SizeIdStore = me.CreateSizeSelectStore();
        
        me.LoadSizeStoreDataSync(me.SizeIdStore, function () {
            me.nowSizeId = me.SizeIdStore.getAt(0).get('size_id');
            me.nowSize = me.SizeIdStore.getAt(0).get('size');
            me.nowColorId = me.SizeIdStore.getAt(0).get('color_id');

            //一打开就加载第一个SizeId任务,
            //  切换SizeId时重取SizeId相关的数据来更新Store
            me.OnLoadLayoutData(function (layoutData) {
                me.FitStoreFromJson(layoutData);
                me.GenerateEditWQGridData();

                //加载工序下拉框
                me.FilterWpStoreByWpDept();

                if (me.WQPrdtWPSelectorStore.getCount() > 0) {
                    me.nowWpNo = me.WQPrdtWPSelectorStore.getAt(0).get('wp_no');
                }
                else {
                    me.opeingFlag = false;
                    alert('工序部门下没有有效的工序! 请再行选择');
                    return;
                }

                callbackLayoutWin();
            });
        });
               
    },
    //构建介面 
    fnOpenWin: function (savedCallback) {
        var me = this;
        if (me.opeingFlag == true) {
            return;
        }
        me.opeingFlag = true;
        me.fnOpenBeforeLoad(function () {
            var workStore = me.CreateWorkerSelectStore();
            me.gridStore = me.CreateShareWorkerGridStore();
            var ce = Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1,
                listeners: {
                    beforeedit: function (edit, e) {
                        me.onGridBeforeEdit(edit, e);
                    },
                    edit: function (edit, e) {
                        me.onGridEdit(edit, e);
                    }
                }
            });
            
            me.form = Ext.create('Ext.form.Panel', {
                xtype: 'form',
                region: 'north',
                defaults: {
                    labelAlign: 'right',
                    labelWidth: 80,
                    width: 180,
                    margin: '4 0 0 4'
                },
                layout: {
                    type: 'table',
                    columns: 3
                },
                items: [{
                    fieldLabel: '货号&nbsp&nbsp&nbsp',
                    name: 'prd_no',
                    itemId: 'prd_no',
                    xtype: 'MSearch_Prdt',
                    value: me.EditingWQ.get('prd_no'),
                    readOnly: true
                },
                     {
                         fieldLabel: '尺寸(颜色)',
                         xtype: 'combobox',
                         name: 'size_id',
                         itemId: 'size_id',
                         queryMode: 'local',
                         store: me.SizeIdStore,
                         displayField: 'showSizeAndColor',
                         valueField: 'size_id',
                         allowBlank: false,
                         value: me.nowSizeId
                     }, {
                         fieldLabel: '工序&nbsp&nbsp&nbsp',
                         xtype: 'combobox',
                         name: 'wp_no',
                         itemId: 'wp_no',
                         queryMode: 'local',
                         store: me.WQPrdtWPSelectorStore, //选择工序(颜色) 依生产部门过滤
                         displayField: 'name',
                         valueField: 'wp_no',
                         allowBlank: false,
                         matchFieldWidth:false
                         //value : me.nowWpNo || ''
                     },
                    {
                        fieldLabel: '个单价', //显示   2个单价
                        name: 'up_pic',
                        itemId: 'up_pic',
                        xtype: 'numberfield',
                        decimalPrecision: 5,
                        readOnly: true
                    },
                    {
                        fieldLabel: '对单价',
                        name: 'up_pair',
                        itemId: 'up_pair',
                        xtype: 'numberfield',
                        decimalPrecision: 5,
                        readOnly: true,
                        colspan: 2 
                    },
                    {
                        fieldLabel: '对数&nbsp&nbsp&nbsp',
                        name: 'qty_pair',
                        itemId: 'qty_pair',
                        xtype: 'numberfield',
                        minValue: 0
                    },
                     {
                         fieldLabel: '个数&nbsp&nbsp&nbsp',
                         name: 'qty_pic',
                         itemId: 'qty_pic',
                         xtype: 'numberfield',
                         minValue: 0,
                         readOnly: true,
                         colspan: 1
                     },
                     {
                         xtype: 'label',
                         text: '->',
                         margin: '0 0 0 10',
                         name: 'finish_label',
                         itemId: 'finish_label_id',
                     },
                     {
                         fieldLabel: '基本金额',
                         name: 'amt',
                         itemId: 'amt',
                         xtype: 'numberfield',
                         readOnly: true
                     },
                     {//输入数量 另一数量自动推
                         fieldLabel: '加翻&nbsp&nbsp&nbsp',
                         name: 'inscrease_percent',
                         itemId: 'inscrease_percent',
                         xtype: 'numberfield',
                         value: 0,
                         colspan: 1,
                         readOnly: true,
                         margin: '4 0 3 4'
                     },
                      {
                          xtype: 'label',
                          text: '....',
                          margin: '0 0 0 10',
                          name: 'inscrease_label',
                          itemId: 'inscrease_label_id'
                      },
                     {
                         fieldLabel: '加翻后金额',
                         name: 'amt2',
                         itemId: 'amt2',
                         xtype: 'numberfield',
                         readOnly: true
                     }
                ]
            });

            var win = Ext.create('Ext.window.Window', {
                modal: true,
                title: '添加生产汇报',
                height: 380,
                width: 580,
                layout: 'border',
                items: [
                    me.form, 
                {
                    margin: 5,
                    region: 'center',
                    xtype: 'grid',
                    title: '生产员工',
                    store: me.gridStore,
                    plugins: [ce],
                    columns: [
                        { xtype: 'rownumberer' },
                        {
                            text: '员工', dataIndex: 'worker', width: 100,
                            sortable:false,
                            editor: {
                                xtype: 'MSearch_Salm',
                                displayField: 'sal_no',
                                matchFieldWidth: false,
                                localStoreSortByWorkerDeptNo: me.EditingWQ.get('user_dep_no')
                            },
                            renderer: function (v) {
                                return GlobalVar.rdSalmName(v);
                            }
                        },
                        {
                            text: '分成率', dataIndex: 'share_percent', width: 100,
                            sortable: false,
                            renderer: function (v, m, rec) {
                                return v + '%';
                            }
                        },
                        {
                            text: '基本金额', dataIndex: 'amt', width: 100,
                            sortable: false,
                            renderer: function (v, m, rec) {
                                var worker = rec.get('worker');
                                var amt = me.form.getComponent('amt').getValue();
                                var share_percent = rec.get('share_percent') || 0;

                                if (worker) {
                                    if (share_percent == 0) {
                                        v = 0;
                                    }
                                    else {
                                        v = amt * (share_percent / 100);
                                        v = Ext.util.Format.round(v, 3);
                                    }
                                }

                                if (!v || v == 0) {
                                    return '';
                                }
                                return v;
                            }
                        },
                        {
                            text: '加翻率', dataIndex: 'inscrease_percent', width: 100,
                            sortable: false,
                            renderer: function (v, m, rec) {
                                var pre = me.form.getComponent('inscrease_percent').getValue();
                                return pre + '%';
                            }
                        },
                        {
                            text: '加翻后金额', dataIndex: 'amt2', width: 100,
                            sortable: false,
                            renderer: function (v, m, rec) {
                                var worker = rec.get('worker');
                                var amt = me.form.getComponent('amt').getValue();
                                var share_percent = rec.get('share_percent') || 0;
                                var pre = me.form.getComponent('inscrease_percent').getValue();

                                if (worker) {
                                    if (share_percent == 0) {
                                        v = 0;
                                    }
                                    else {
                                        v = amt * (share_percent / 100) * (1 + (pre == 0 ? 0 : pre / 100));
                                        v = Ext.util.Format.round(v, 3);
                                    }
                                }

                                if (!v || v == 0) {
                                    return '';
                                }
                                return v;
                            }
                        }
                    ],
                    height: 80
                }],
                bbar: [
                    {
                        text: '保存', itemId:'btnSave', handler: function () {
                            var params = me.fnGetFormParams();
                            if (params) {
                                savedCallback(params);
                            }
                        }
                    }, {
                        text: '取消', handler: function () {
                            this.up('window').close();
                        }
                    }
                ]
            });
            me.ListenFormFieldChange(win.getComponent(0), win.getComponent(1));

            me.formGrid = win.getComponent(1);

            if (me.updateWQBClone) {
                me.fnLoadUpdateVars();
            }
            me.win = win;
            me.win.btnSave = me.win.getDockedComponent(0).getComponent('btnSave');
            
            me.opeingFlag = false;
            win.show();
        });
    },

    fnLoadUpdateVars: function () {
        var me = this;

        for (var i = 0; i < me.formGrid.store.getCount() && i < me.updateWQBSharesClone.length; i++) {
            var gridRec = me.formGrid.store.getAt(i);
            gridRec.set('itm', i);
            gridRec.set('worker', me.updateWQBSharesClone[i].get('worker'));
            gridRec.set('share_percent', me.updateWQBSharesClone[i].get('share_percent'));
        }
        me.form.getComponent('qty_pair').setValue(me.updateWQBClone.get('qty_pair'));
        me.form.getComponent('qty_pic').setValue(me.updateWQBClone.get('qty_pic'));


        //触发栏位Change事件 加载运行变量
        me.form.getComponent('wp_no').setValue(me.updateWQBClone.get('wp_no'));
        me.form.getComponent('size_id').setValue(me.updateWQBClone.get('size_id'));

        //加载完后清空.临时变量
        me.updateWQBClone = null;
        me.updateWQBSharesClone = null;
    },

    fnCloseWin: function () {
        var me = this;
        if (me.win) {
            me.win.close();
        }
    },

    WQPrdtWPStore: Ext.create('Ext.data.Store', {
        model: 'Model_Only_PrdtWP',
        data: []
    }),

    WQPrdtWPSelectorStore: Ext.create('Ext.data.Store', {
        model: 'Model_Only_PrdtWP',
        data: []
    }),

    WQPrdtWP_UPStore: Ext.create('Ext.data.Store', {
        model: 'Model_PrdtWP_TFUP',
        data: []
    }),

    WQPrdtWP_UPColorStore: Ext.create('Ext.data.Store', {
        model: 'prdt_up_exception_Model',
        data: []
    }),
    
    WQDetailStore: Ext.create('Ext.data.Store', {
        model: 'WPQtyBody_Model',
        data: []
    }),

    //本页例外Store 
    WQDetailShareStore: Ext.create('Ext.data.Store', {
        model: 'WPQtyBodyShare_Model',
        data: []
    }),

    WQFinishStore: Ext.create('Ext.data.Store', {
        model: 'WQGrid_QtyFinish_Model',
        data: []
    }),

    WQFinishStore_AllSizes: Ext.create('Ext.data.Store', {
        model: 'WQGrid_QtyFinish_Model',
        data: []
    }),

    OnLoadLayoutData : function (callback) {
        var me = this;
        var searchParams = {};
        
        Ext.apply(searchParams, me.EditingWQ.getData());
        searchParams.size_id = me.nowSizeId;
        searchParams.size = me.nowSize;
        
        searchParams.action = 'LoadWQLayoutData';
        searchParams.ISWQB = 'true';
        searchParams.NowUserId = GlobalVar.NowUserId;

        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
            params: searchParams,
            success: function (response) {
               // viewport.getComponent('LeftPanel').setLoading(false, viewport.getComponent('LeftPanel').contentEl);
                var Json = Ext.decode(response.responseText);
                if (Json.result == true) {
                    callback(Json);
                }
                else {
                    me.opeingFlag = false;
                    alert('加载失败' + Json.msg);
                }
            },
            failure: function (form, action) {
                me.opeingFlag = false;
                //viewport.getComponent('LeftPanel').setLoading(false, viewport.getComponent('LeftPanel').contentEl);
                CommMsgShow("异常：", form.responseText, true);
            }
        });
    },
    
    FitStoreFromJson: function (layoutData, flagStopRefreshWPStore) {
        var me = this;
        me.EditingWQ.set('plan_sizes_qty', layoutData.plan_sizes_qty);
        me.EditingWQ.set('plan_size_qty', layoutData.plan_size_qty);
        //alert(EditingWQ.get('plan_sizes_qty') + ' - ' + EditingWQ.get('plan_size_qty'));

        if (!flagStopRefreshWPStore) {
            me.WQPrdtWPStore.removeAll();
            me.WQPrdtWP_SizeControlStore.removeAll();
            me.WQPrdtWP_UPStore.removeAll();
            me.WQPrdtWP_UPColorStore.removeAll();
        }

        //me.WQUserSalmStore.removeAll();
        me.WQDetailStore.removeAll();
        me.WQFinishStore.removeAll();
        me.WQFinishStore_AllSizes.removeAll();

        if (!flagStopRefreshWPStore) {
            me.WQPrdtWPStore.add(layoutData.PrdtWP);
            me.WQPrdtWP_SizeControlStore.add(layoutData.PrdtWP_SIZE);
            me.WQPrdtWP_UPStore.add(layoutData.PrdtWP_UP);
            me.WQPrdtWP_UPColorStore.add(layoutData.PrdtWP_COLOR_UP);
        }
        //me.WQUserSalmStore.add(layoutData.Salm);
        me.WQDetailStore.add(layoutData.WQDetail);
        me.WQFinishStore.add(layoutData.WQFinish);
        me.WQFinishStore_AllSizes.add(layoutData.WQFinish_AllSizes);
    },

    EditWQGridData: {},

    GenerateEditWQGridData: function () {
        var me = this
        me.EditWQGridData = {};
        var headColorId = me.nowColorId;
        for (var i = 0; i < me.WQPrdtWPStore.getCount() ; i++) {
            var rec = me.WQPrdtWPStore.getAt(i);
            var wp_no = rec.get('wp_no');
            var wp_name = rec.get('name');
            var color_different_price = rec.get('color_different_price');


            me.EditWQGridData[wp_no] = {
                wp_no: wp_no,
                wp_name: wp_name,
                cellIndex: i + 3,  //No.1 row_type, No.2 row_value
                up_pic: 0,
                up_pair: 0,
                pic_num: rec.get('pic_num'),
                is_size_control: rec.get('is_size_control'),
                wq_type: rec.get('wq_type') || 'size_qty',
                sizes: [],
                table_sum_qty_pic: 0,
                table_sum_qty_pair: 0,
                sum_qty_pic: 0,
                sum_qty_pair: 0,
                sum_all_qty_pic: 0,
                sum_all_qty_pair: 0,
                state: rec.get('state')        //是否已经停用
            };

            var upRec = me.WQPrdtWP_UPStore.findRecord('wp_no', wp_no);
            if (upRec) {
                //if (!upRec.get('up_pair')) {
                //    alert('注意:<' + wp_name + '>工序没有单价!  请与系统管理员沟通.(可以继续录入,单价后补)');
                //}

                me.EditWQGridData[wp_no]['up_pic'] = upRec.get('up_pic');
                me.EditWQGridData[wp_no]['up_pair'] = upRec.get('up_pair');

                if (color_different_price == true) {
                    ///依颜色区分单价
                    if (headColorId > 0) {
                        me.WQPrdtWP_UPColorStore.findBy(function (qrec) {
                            if (qrec.get('wp_no') == wp_no && qrec.get('color_id') == headColorId) {
                                me.EditWQGridData[wp_no]['up_pic'] = qrec.get('up_pic');
                                me.EditWQGridData[wp_no]['up_pair'] = qrec.get('up_pair');
                                //alert('设特别单价' + wp_name + ':' + qrec.get('up_pair'));
                            }
                        });
                    }
                   
                    me.WQPrdtWP_UPColorStore.findBy(function (qrec) {
                        if (qrec.get('wp_no') == wp_no
                            &&
                            //或指定计件单号
                           qrec.IsContainJX( me.EditingWQ.get('jx_no'))
                        ) {
                            me.EditWQGridData[wp_no]['up_pic'] = qrec.get('up_pic');
                            me.EditWQGridData[wp_no]['up_pair'] = qrec.get('up_pair');
                            //alert(headColorId +'---设指定计件单号 特别单价---' + wp_name);
                        }
                    });
                }
            }
            else {
                alert('注意:<' + wp_name + '>工序没有单价!  请与系统管理员沟通.(可以继续录入,单价后补)');
            }

            if (rec.get('is_size_control') == true) {
                me.WQPrdtWP_SizeControlStore.findBy(function (qrec) {
                    if (qrec.get('wp_no') == wp_no) {
                        me.EditWQGridData[wp_no].sizes.push(qrec.get('size'));
                    }
                });
            }

            // 取消原因, 因为切换单位时,也要重载这个方法. 这时已经有录入数据了
            //var isNewing = EditingWQ.get('wq_id') < 0;
            //if (isNewing == false) {
            var _qty_pic = 0,
                _qty_pair = 0;
            me.WQDetailStore.findBy(function (qrec) { //这里要变为单笔表身
                if (qrec.get('wp_no') == wp_no) {
                    _qty_pic += qrec.get('qty_pic');
                    _qty_pair += qrec.get('qty_pair');
                }
            });

            me.EditWQGridData[wp_no].table_sum_qty_pic = _qty_pic;
            me.EditWQGridData[wp_no].table_sum_qty_pair = _qty_pair;
            //}

            var sumRec = null;
            me.WQFinishStore.findBy(function (qrec) {
                if (qrec.get('wp_no') == wp_no) {
                    sumRec = qrec;
                }
            });
            if (sumRec) {
                me.EditWQGridData[wp_no].sum_qty_pic = sumRec.get('qty_pic');
                me.EditWQGridData[wp_no].sum_qty_pair = sumRec.get('qty_pair');
            }

            //var sumAllRec = WQFinishStore_AllSizes.findRecord('wp_no', wp_no);
            var sumAllRec = null;
            me.WQFinishStore_AllSizes.findBy(function (qrec) {
                if (qrec.get('wp_no') == wp_no) {
                    sumAllRec = qrec;
                }
            });
            if (sumAllRec) {
                me.EditWQGridData[wp_no].sum_all_qty_pic = sumAllRec.get('qty_pic');
                me.EditWQGridData[wp_no].sum_all_qty_pair = sumAllRec.get('qty_pair');
            }
        }
    }
}

