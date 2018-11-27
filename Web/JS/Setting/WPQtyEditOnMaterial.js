



Ext.onReady(function () {
    Ext.tip.QuickTipManager.init();
    //计薪表头
    //WPQtyHeader_Model
    var isAdminRoot = WpConfig.UserDefault[GlobalVar.NowUserId].root == '管理员';
    var EditingWQ = null;
    var CalInscrease = false;
    var TableType = '计件皮奖';

    var OnFormInit = function () {
        EditingWQ = null;
        WQForm.getForm().reset();
        EditingWQ = Ext.create('WPQtyHeader_Model', {
            wq_id: -1,
            size_id: -1,
            edit_ut: WpConfig.UserDefault[GlobalVar.NowUserId].edit_ut || 1,   //1.对, 2.个
            cal_inscrease: CalInscrease,
            n_man: GlobalVar.NowUserId
        });

        WQForm.setLoading(true);
        fnCommonCreateLastNo('PJ', WQForm.getComponent('jx_no'), function () {
            Ext.Function.defer(function () {
                WQForm.setLoading(false);
            }, 800);
        });

        WQGrid.store.removeAll();
        WQMaterialGrid.store.removeAll();
        OnSetReadOnlyOnUpdateing(false);
    }
    
    var FormUpdateRecord = function () {
        EditingWQ.set('jx_dd', WQForm.getComponent('jx_dd').getValue());
        EditingWQ.set('jx_no', WQForm.getComponent('jx_no').getValue());
        EditingWQ.set('wp_dep_no', WQForm.getComponent('wp_dep_no').getValue());
        EditingWQ.set('user_dep_no', WQForm.getComponent('user_dep_no').getValue());
        EditingWQ.set('provider', WQForm.getComponent('provider').getValue());
    }

    ///普通员工,不能改冰封, 结账的单据
    // 管理员,  不能改结账的单据,但可以改冰封期内的
    var IsLocking = function () {
        if (EditingWQ.get('wq_id') < 0) {
            return false;
        }

        var TableDate = new Date(Ext.Date.format(EditingWQ.get('n_dd'), 'Y/m/d'));
        var freezeDate = Ext.Date.add(TableDate, Ext.Date.DAY, (WpConfig.freezeDay - 1));
        var TodayDate = GlobalVar.ServerDate;
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

    var OnSetReadOnlyOnUpdateing = function (readOnly) {
        
        WQForm.getComponent('wp_dep_no').setReadOnly(readOnly);
        WQForm.getComponent('user_dep_no').setReadOnly(readOnly);
    }
    
    var WQForm = Ext.create('Ext.form.Panel', {
        region: 'north',
        layout: {
            type: 'table',
            columns: 4
        },
        url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
        defaults: {
            width: 230,
            labelWidth: 100,
            xtype: 'textfield',
            margin: '5 0',
            labelAlign: 'right'
        },
        items: [
          {
              fieldLabel: '计&nbsp薪&nbsp日&nbsp&nbsp',
              name: 'jx_dd',
              itemId: 'jx_dd',
              xtype: 'datefield',
              format: 'Y/m/d',
              minValue: Ext.Date.add(GlobalVar.ServerDate, Ext.Date.DAY, -1 * (WpConfig.freezeDay - 1)),
              maxValue: GlobalVar.ServerDate,
              value: GlobalVar.ServerDate,
              allowBlank: false
          },
          {
              readOnly: true,
              fieldLabel: '计&nbsp薪&nbsp号&nbsp&nbsp',
              name: 'jx_no',
              itemId: 'jx_no',
              allowBlank: false
          },
          {
              fieldLabel: '录入人员',
              name: 'provider',
              itemId: 'provider',
              xtype: 'MSearch_Salm',
              value: WpConfig.UserDefault[GlobalVar.NowUserId].user_no,
              allowBlank: false,
              colspan: 2
          },
             {
                 fieldLabel: '员工部门*',
                 name: 'user_dep_no',
                 itemId: 'user_dep_no',
                 xtype: 'MSearch_Dept',
                 matchFieldWidth:false,
                 border: 5,
                 value: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000',
                 allowBlank: false,
                 listeners: {
                     change: function (cb, newValue, oldValue, eOpts) {
                         WQForm.getComponent('worker1').fnSortLocalStoreByWorkerDeptNo(newValue);
                         WQForm.getComponent('worker2').fnSortLocalStoreByWorkerDeptNo(newValue);
                     }
                 }
             },
            {
                fieldLabel: '主手员工',
                name: 'worker1',
                itemId: 'worker1',
                xtype: 'MSearch_Salm',
                matchFieldWidth: false,
                value: '',
                localStoreSortByWorkerDeptNo: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000',
                allowBlank: false
            },
            {
                fieldLabel: '副手员工',
                name: 'worker2',
                itemId: 'worker2',
                xtype: 'MSearch_Salm',
                matchFieldWidth: false,
                value: '',
                allowBlank: true,
                localStoreSortByWorkerDeptNo: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000',
                colspan: 2
            },
           
              {
                  fieldLabel: '工序部门&nbsp&nbsp',
                  name: 'wp_dep_no',
                  itemId: 'wp_dep_no',
                  xtype: 'MSearch_DeptWP',
                  value: WpConfig.UserDefault[GlobalVar.NowUserId].wp_dep_no || '000000',
                  allowBlank: false
              },{
                  xtype: 'button',
                  height: 30,
                  width:80,
                  text: '新建单据',
                  margin: '0 5 0 5',
                  handler: function () {
                      OnFormInit();
                  }
               },
                {
                    xtype: 'label',
                    text: '皮奖主力分成100%',
                    margin: '0 0 0 -10'
                },
              {
                  xtype: 'cbPJNormalAmtShareType',
                  item: 'PJNormalAmtShareType',
                  itemId: 'PJNormalAmtShareType',
                  fieldLabel: '工资分成',
                  hidden:false
              },
               
          {
              //// { value: 1, "name": "对" },
              ////{ value: 2, "name": "个" },
              colspan: 1,
              xtype: 'cbUTType',
              name: 'edit_ut',
              itemId: 'edit_ut',
              fieldLabel: '录入单位',
              readOnly: true,
              hidden:true,
              value: 1
          },
          {
              colspan: 1,
              xtype: 'cbLayoutFinishQty',
              name: 'layout_finish',
              itemId: 'layout_finish',
              fieldLabel: '完工显示',
              hidden: true,
              value: Ext.util.Cookies.get('layout_finish') || 'FINISH-PLAN',
              listeners: {
                  change: function (vthis, value, eOpts) {
                      var layoutFinish = vthis.getValue() || 'FINISH-PLAN';
                      Ext.util.Cookies.set('layout_finish', layoutFinish, new Date('2099-01-01'));
                      WQGrid.store.getAt(RowTypeIndex.ALL_QTY).set('row_type', '');
                      WQGrid.store.getAt(RowTypeIndex.ALL_QTY).set('row_type', 'ALL_QTY');

                      WQGrid.store.getAt(RowTypeIndex.ALL2_QTY).set('row_type', '');
                      WQGrid.store.getAt(RowTypeIndex.ALL2_QTY).set('row_type', 'ALL2_QTY');
                  }
              }
          }
        ],
        listeners: { afterrender: function () { OnFormInit(); } }
    });

   //选2个人才显示分成
    WQForm.getComponent('worker2').on('change', function (cb, newValue, oldValue, eOpts) {
        
        if (newValue) {
            WQForm.getComponent('PJNormalAmtShareType').setVisible(true);
        }
        else {
            WQForm.getComponent('PJNormalAmtShareType').setVisible(false);
        }
    });
    Ext.Function.defer(function () {
        WQForm.getComponent('PJNormalAmtShareType').setVisible(false);
    }, 300);


    var SwitchUTIng = false;
     
     
    //是否高于,最高上限对数,返回高于的对数 100, 输了102对, 返回2
    var MoreThanCeliQtyPair = function (wp_no, eValue, editingWQDetailRecord) {
        var isNewing = EditingWQ.get('wq_id') < 0,
            edit_ut = EditingWQ.get('edit_ut');

        var orignFinishQty = 0;
        var orignFinish_AllQty = 0;
        if (isNewing) {
            orignFinishQty = EditWQGridData[wp_no].sum_qty_pair || 0;
            orignFinish_AllQty = EditWQGridData[wp_no].sum_all_qty_pair || 0;
        }
        else {
            //修改单据,已完成包含本单的量.. 所以要减少加载时的原工序完成量
            orignFinishQty = (EditWQGridData[wp_no].sum_qty_pair || 0) - (EditWQGridData[wp_no].table_sum_qty_pair || 0);
            orignFinish_AllQty = (EditWQGridData[wp_no].sum_all_qty_pair || 0) - (EditWQGridData[wp_no].table_sum_qty_pair || 0);
        }

        var _qty_pair = 0;
        WQDetailStore.findBy(function (_wd_rec) {
            //去掉自己原来的数
            if (_wd_rec != editingWQDetailRecord) {
                if (_wd_rec.get('wp_no') == wp_no) {
                    _qty_pair += _wd_rec.get('qty_pair') || 0;
                }
            }
        });

        _qty_pair += eValue;

        //var thisSumQtys = SumDetailWpQty(wp_no);
        if ((orignFinish_AllQty + _qty_pair) > EditingWQ.get('plan_sizes_qty')) {
            alert('工序对数, 超过总计划单的总对数!(' + EditingWQ.get('plan_sizes_qty') + ')');
            return false;
        }
        ///在限制尺寸数量提前下
        //console.log({ orignFinishQty: orignFinishQty, _qty_pair: _qty_pair, plan_size_qty: EditingWQ.get('plan_size_qty') });
        if (EditWQGridData[wp_no].wq_type == 'size_qty' && (orignFinishQty + _qty_pair) > EditingWQ.get('plan_size_qty')) {
            alert('工序对数, 超过尺寸计划单的对数!(' + EditingWQ.get('plan_size_qty') + ')');
            return false;
        }

        return true;
    }

    var OnWQGridEdit = function (editor, e) {
        //保持 WQDetailStore 与 实时编辑一致. 用于直接提交参数
        if (SwitchUTIng == false && e.record.get('row_type') == 'SALM' && e.field.indexOf("wp_") == 0) {
            //因model 是用 string,非数量类型,所以要"" null转换一下为0
            e.originalValue = e.originalValue || 0;
            e.value = e.value || 0;

            if (e.originalValue == e.value)
                return;

            var wp_no = e.field.substr('wp_'.length, 10),
                sal_no = e.record.get('row_value'),
                edit_ut = EditingWQ.get('edit_ut');


            var hadRecord = false;
            var wqDetailRecord = null,
                wqOldQtyPic = 0.00,
                wqOldQtyPair = 0.00;

            WQDetailStore.each(function (_rec) {
                if (_rec.get('worker') == sal_no && _rec.get('wp_no') == wp_no) {
                    hadRecord = true;
                    wqDetailRecord = _rec;
                    wqOldQtyPic = _rec.get('qty_pic');
                    wqOldQtyPair = _rec.get('qty_pair');
                    //对,填充 个数
                    if (edit_ut == 1) {
                        _rec.set('qty_pic', e.value * EditWQGridData[wp_no].pic_num);
                        _rec.set('qty_pair', e.value);
                    }
                    else {
                        _rec.set('qty_pic', e.value);
                        _rec.set('qty_pair', e.value / EditWQGridData[wp_no].pic_num);
                    }
                }
            });

            if (hadRecord == false) {
                var _qty_pic = 0,
                    _qty_pair = 0.00;

                wqOldQtyPic = 0;
                wqOldQtyPair = 0;
                if (edit_ut == 1) {
                    _qty_pic = e.value * EditWQGridData[wp_no].pic_num;
                    _qty_pair = e.value;
                }
                else {
                    _qty_pic = e.value;
                    _qty_pair = e.value / EditWQGridData[wp_no].pic_num;
                }

                var insertRecords = WQDetailStore.add({
                    wqb_id: -1,
                    wq_id: EditingWQ.get('wq_id'),
                    worker: sal_no,
                    prd_no: EditingWQ.get('prd_no'),
                    wp_no: wp_no,
                    qty_pic: _qty_pic,
                    qty_pair: _qty_pair
                });

                wqDetailRecord = insertRecords[0];
                //console.log('ADD_');
            }

            //////
            //if (e.originalValue < e.value) {
            //判断是否超录 
            var _A_qty_pair = 0;
            if (edit_ut == 1) {
                _A_qty_pair = e.value;
            }
            else {
                _A_qty_pair = e.value / EditWQGridData[wp_no].pic_num;
            }

            var flag = MoreThanCeliQtyPair(wp_no, _A_qty_pair, wqDetailRecord);
            if (flag == false) {
                ///管理员可以超录,,但有可能是用于处理超录.(因为初使用时,有部份单是红色的,但一改系统又提醒超了,变回原值)
                if (isAdminRoot == false) {
                    e.record.set(e.field, e.originalValue || 0);
                    wqDetailRecord.set('qty_pic', wqOldQtyPic);
                    wqDetailRecord.set('qty_pair', wqOldQtyPair);
                    return false;
                }
                else {
                    alert("数量已超录!(但管理员有权限,请按实际录入,并注意帐号密码安全!)");
                }
            }

            UpdateTableSumAndFinsishRecord(wp_no);
        }
    }
     
    var WPQtyBodyStore = Ext.create('Ext.data.Store', {
        model: 'WPQtyBody_Material_Model',
        data: []
    });

    var WQPrdtWPStore = Ext.create('Ext.data.Store', {
        model: 'Model_Only_PrdtWP',
        data: []
    });

    var WQPrdtWP_SizeControlStore = Ext.create('Ext.data.Store', {
        model: 'PrdtWp_SizeControl_Model',
        data: []
    });

    var WQPrdtWP_UPStore = Ext.create('Ext.data.Store', {
        model: 'Model_PrdtWP_TFUP',
        data: []
    });
    
    var WQPrdtWP_UPColorStore = Ext.create('Ext.data.Store', {
        model: 'prdt_up_exception_Model',
        data: []
    });

    var WPQtyBodyMaterialStore = Ext.create('Ext.data.Store', {
        model: 'WPQtyMaterial_Model',
        data: []
    }); 
    
    var WPEditorStore = Ext.create('Ext.data.Store', {
        model: 'Model_Only_PrdtWP',
        data: []
    });


    var LastWpEditorLoadSqlWhere = '';
    ///加载货号的工序 内容
    var UpdateWpEditorStore = function (WQGridRecord) {
        //查询工序参数
        var sqlWhere = ' prd_no = \''+ WQGridRecord.get('prd_no')+'\'';
        var dep_no = WQForm.getComponent('wp_dep_no').getValue() ;
        if(dep_no != '000000'){
            sqlWhere += ' and dep_no = \'' +dep_no + '\' ';
        }
        //已加载过??
        if(LastWpEditorLoadSqlWhere == sqlWhere){
            return;
        }
        LastWpEditorLoadSqlWhere = sqlWhere; 

        WPEditorStore.removeAll();
        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/Prdt_WP.ashx',
            params: {
                action: 'GETDATA',
                sqlWhere: sqlWhere
            },
            success: function (response) {
                var Json = Ext.decode(response.responseText);
                WPEditorStore.add(Json.items);
            },
            failure: function (form, action) {
                CommMsgShow("加载工序列表异常!", '', true);
            }
        });
    }

    var UpdateRecordUPing = false;
    var UpdateWQGridRecordUP = function (WQGridRecord, requestCallBack) {
        UpdateRecordUPing = true;
        var vthis = this;
        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/Prdt_WP_UP.ashx',
            params: {
                action: 'GetPrdtUpOnDate',
                prd_no: WQGridRecord.get('prd_no'),
                jx_dd: WQForm.getComponent('jx_dd').getValue(),
                user_dep_no: WQForm.getComponent('user_dep_no').getValue(),
                cus_no: '',
                plan_id: WQGridRecord.get('plan_id')
            },
            success: function (response) {
                
                var Json = Ext.decode(response.responseText);
                if(Json.result == true){
                    WQPrdtWP_UPStore.removeAll();
                    WQPrdtWP_UPColorStore.removeAll();
                    WQPrdtWP_SizeControlStore.removeAll();

                    WQPrdtWP_UPStore.add(Json.PrdtWP_UP);
                    WQPrdtWP_UPColorStore.add(Json.PrdtWP_COLOR_UP);
                    WQPrdtWP_SizeControlStore.add(Json.PrdtWP_SIZE);

                    Ext.callback(function(){
                        requestCallBack();
                    }, vthis);

                    UpdateRecordUPing = false;
                }
                else{
                    alert('加载单价出错' + Json.msg);
                }
            },
            failure: function (form, action) {
                CommMsgShow("加载工序列表异常!", '', true);
            }
        });
    }

    var findPrdtWpUP = function (color_different_price, headColorId, wp_no) {
        var res = { up_pic: 0.00, up_pair: 0.00 };

        var upRec = WQPrdtWP_UPStore.findRecord('wp_no', wp_no);

        if (upRec) {
            res.up_pic = upRec.get('up_pic');
            res.up_pair = upRec.get('up_pair');
            if (color_different_price == true) {
                ///依颜色区分单价
                if (headColorId > 0) {
                    WQPrdtWP_UPColorStore.findBy(function (qrec) {
                        if (qrec.get('wp_no') == wp_no
                            &&
                            //指定颜色
                            (qrec.get('color_id') && qrec.get('color_id') == headColorId)
                        ) {
                            res.up_pic = qrec.get('up_pic');
                            res.up_pair = qrec.get('up_pair');
                        }
                    });
                }

                WQPrdtWP_UPColorStore.findBy(function (qrec) {
                    if (qrec.get('wp_no') == wp_no
                        &&
                        //或指定计件单号
                        qrec.IsContainJX(WQForm.getComponent('jx_no').getValue())
                    ) {
                        res.up_pic = qrec.get('up_pic');
                        res.up_pair = qrec.get('up_pair');
                    }
                });
            }
        }
        else {
            return null;
        }
        
        return res;
    }

    var WQGrid = Ext.create('Ext.grid.Panel', {
        region: 'center',
        enableLocking: false,
        enableColumnHide: false,
        columnLines: true,
        rowLines: true,
        plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1,
                listeners:{
                    edit: function (editor, e, eOpts) {
                        if(e.value == e.originalValue){
                            return;
                        }
                        
                        if (e.field == 'qty_pair') {
                            UpdateMaterialGrid();
                        }

                        if (e.field == 'wp_no') {
                            //console.log(arguments);
                            UpdateMaterialGrid();

                            var wp_noArr = Ext.isArray(e.value) ? e.value : [e.value];//.split(','); 
                            ////抓单价
                            UpdateWQGridRecordUP(e.record, function () {
                                var totalUpPair = 0.00;
                                var totalUpPic = 0.00;

                                for (var i = 0; i < wp_noArr.length; i++) {
                                    var wp_no = wp_noArr[i];
                                    var qRec = WPEditorStore.findRecord('wp_no', wp_no);// records[i];
                                    if (!qRec) {
                                        alert('查找单价信息出错!');
                                    }
                                    var upData = findPrdtWpUP(
                                        qRec.get('color_different_price'),
                                        e.record.get('color_id'),
                                        wp_no//wpNoList[i]
                                    );

                                    if (upData == null) {
                                        totalUpPair = 0.00;
                                        totalUpPic = 0.00;
                                        alert('注意:<' + qRec.get('name') + '>工序没有单价!  请与系统管理员沟通.(可以继续录入,单价后补)');
                                        break;
                                    }

                                    totalUpPair += upData.up_pair;
                                    totalUpPic += upData.up_pic;

                                }

                                e.record.set('up_pair', Ext.util.Format.round(totalUpPair, 5) );
                                e.record.set('up_pic', Ext.util.Format.round(totalUpPic, 5));
                            });
                        }
                    }
                }
            })
        ],
        store: WPQtyBodyStore,
        columns: [
             { xtype: 'rownumberer' },
             {
                 text: '计划单', name: 'size_id', dataIndex: 'size_id', width: 100,
                 editor:{
                     xtype: 'MSearch_PlanSize',
                     pageSize : 25,
                     listeners: {
                         select: function (combo, records, eOpts) {
                            
                             var sels = WQGrid.getSelectionModel().getSelection();
                             if (sels.length <= 0) {
                                 alert('没有选中当前行!');
                                 return;
                             }
                             //console.log('selectSize_Id', records[0].get('size_id'));
                             if (records.length > 0) {
                                 sels[0].set('plan_id', records[0].get('plan_id'));
                                 sels[0].set('plan_no', records[0].get('plan_no'));
                                 sels[0].set('prd_no', records[0].get('prd_no'));
                                 sels[0].set('size', records[0].get('size'));
                                 sels[0].set('color_id', records[0].get('color_id'));
                                 sels[0].set('size_id', records[0].get('size_id'));

                                 if (UpdateRecordUPing == false) {
                                     UpdateWpEditorStore(sels[0]);
                                 }
                                 else {
                                     Ext.Function.defer(function(){
                                         UpdateWpEditorStore(sels[0]);
                                     }, 1000);
                                 }
                             }
                             else {
                                 sels[0].set('plan_id', -1);
                                 sels[0].set('plan_no', '');
                                 sels[0].set('prd_no','');
                                 sels[0].set('size', '');
                                 sels[0].set('color_id', -1);
                                 sels[0].set('size_id', -1);
                                 
                             }
                         }
                     },
                     buffer:500
                 },
                 renderer: function (v, m, rec) {
                     return rec.get('plan_no');
                 }
             },
            {
                text: '货号', dataIndex: 'prd_no', width: 90,
                renderer: function (v, m, rec) {
                    return GlobalVar.rdPrdtName(v);
                }
            },
            {
                text: '尺寸', dataIndex: 'size', width: 90,
                renderer: function (v, m, rec) {
                    return v;
                }
            },
            {
                text: '工序列表', dataIndex: 'wp_no', width: 180,
                editor:{
                    xtype: 'multicombobox',
                    store: WPEditorStore,
                    //forceSelection: true,
                    multiSelect: true,
                    editable: false,
                    queryMode: 'local',
                    valueField: 'wp_no',
                    displayField: 'name',
                    listeners: {
                        select: function (combo, records, eOpts) {
                           // console.log(' select wp_no');
                            var sels = WQGrid.getSelectionModel().getSelection();
                            if(sels.length <=0){
                                return;
                            }

                            var wpNameList = [],
                                wpNoList = [];
                            if (records.length > 0) {
                                //设工序名称
                                for (var i = 0; i < records.length; i++) {
                                    wpNoList.push(records[i].get('wp_no'));
                                    wpNameList.push(records[i].get('name'));
                                }
                                sels[0].set('wp_name', wpNameList.join(', '));
                            }
                            else {
                                sels[0].set('wp_no', '');
                                sels[0].set('wp_name', '');
                            }
                        },
                        delay: 500
                    }
                },
                renderer: function (v, m, rec) {
                    return rec.get('wp_name');
                }
            },
            {
                text: '对数', dataIndex: 'qty_pair', width: 100,
                editor:{
                    xtype:'numberfield'
                },
                renderer: function (v, m, rec) {
                    if (!v) {
                        return '';
                    }
                    return v;
                }
            },
            {
                text: '个数', dataIndex: 'qty_pic', width: 90, hidden: true,
                renderer: function (v, m, rec) {
                    if (!v) {
                        return '';
                    }
                    return v;
                }
            },
            {
                text: '单价(对)', dataIndex: 'up_pair', width: 100,
                renderer: function (v, m, rec) {
                    if (!v) {
                        return '';
                    }
                    return v;
                }
            },
            {
                text: '单价(个)', dataIndex: 'up_pic', width: 100, hidden: true,
                renderer: function (v, m, rec) {
                    if (!v) {
                        return '';
                    }
                    return v;
                }
            },
            {
                text: '基本金额', dataIndex: 'amt', width: 100,
                sortable: false,
                renderer: function (v, m, rec) {
                    v = (rec.get('qty_pair') || 0) * (rec.get('up_pair') || 0);
                    if (!v) {
                        return '';
                    }
                    v = Ext.util.Format.round(v, 3);
                    return v;
                }
            }
        ],
        selType: 'rowmodel',
        bbar: [
            {
                text: '添加行', icon: '../JS/resources/MyIcon/icon_save.png', itemId: 'btnInsert', height: 30, width: 80, handler:
                function () {
                    WPQtyBodyStore.add(Ext.create('WPQtyBody_Material_Model', { plan_id: -1 }));
                }
            },
            '-',
            {
                text: '删除行', icon: '../JS/resources/MyIcon/icon_delete.png', height: 30, width: 80, handler: function () {
                    var checkResult = IsLocking();
                    if (checkResult != false) {
                        if (checkResult == '冰封')
                            alert('单据已被冰封!, 想删除请与管理员联系!');
                        else
                            alert('单据已被结账,不能删除行!');
                        return;
                    }

                    var selRows = WQGrid.getSelectionModel().getSelection();
                    if (selRows.length <= 0) {
                        alert('末选择表身行');
                        return;
                    }

                    Ext.MessageBox.confirm('询问', '确定删除这一行吗? ', function (btn) {
                        if (btn == 'yes') {
                            WPQtyBodyStore.remove(selRows[0]);

                            Ext.Function.defer(function () {
                                UpdateMaterialGrid();
                            }, 300);
                            
                        }
                    });
                }
            },
            {
                text: '保存', icon: '../JS/resources/MyIcon/icon_save.png',
                itemId: 'btnSave',
                height: 30, width: 80,
                handler:
                function () {
                    OnFormSave();
                }
            },
            {
                text: '查询面板',
                icon: '../JS/resources/MyIcon/search.png',
                height: 30, width: 90,
                handler: function () {
                    SearchPanel.expand();
                }
            }
        ],
        listeners: {
            afterrender: function () {
                this.btnSave = this.getDockedComponent(1).getComponent('btnSave');
                //console.log(this.btnSave, this.getDockedComponent(1));
            },
            itemcontextmenu: function (vthis, record, item, index, e, eOpts) {
                e.preventDefault();
            },
            itemclick: function (view, record, item, index, e, eOpts) {
                //显示单耗Tip
                (function () {
                    var op = {};
                    op.action = 'LoadAllWpForPJTableTip';
                    op.prd_no = record.get('prd_no');
                    //op.wp_no = record.get('wp_no');
                    op.size = record.get('size');
                    Ext.Ajax.request({
                        type: 'post',
                        url: commonVar.urlCDStr + 'ASHX/Material/ashx_PrdtWpMaterial.ashx',
                        params: op,
                        success: function (response) {
                            var Json = Ext.decode(response.responseText);

                            //生成提示Tip内容
                            var rowIndex = record.internalId;
                            var rowId = view.getId() + '-record-' + rowIndex;

                            Ext.tip.QuickTipManager.register({
                                target: rowId,       // 'qqqqqqqqqq', //abc.getId(),//'quickTipContainer',
                                title: '工序单耗清单',
                                text: LayoutTipContentForMaterialUnit(Json, op.size),
                                width: 350,
                                dismissDelay: 10000  // Hide after 10 seconds hover
                            });

                            Ext.Function.defer(function () {
                                Ext.tip.QuickTipManager.tip.show();
                            }, 1000);
                        },
                        failure: function (form, action) {
                            CommMsgShow("加载标准用料异常!", '', true);
                        }
                    });
                })();
            },
            selectionchange: function (selModel, selected, eOpts) {
                if (selected.length > 0) {
                    if (UpdateRecordUPing == false) {
                        UpdateWpEditorStore(selected[0]);
                    }
                    else {
                        Ext.Function.defer(function () {
                            UpdateWpEditorStore(selected[0]);
                        }, 1000);
                    }
                }
            }
        }
    });
   
    ///提示内容生成
    var LayoutTipContentForMaterialUnit = function (Json, Size) {
        if (Json.body1.length <= 0) {
            return "没有定义物料单耗";
        }
        //wp_no, material_id(wm_id), size, use_unit
        var htmlContent = '';
        
        htmlContent += '<table width = "350">';
        htmlContent += '<tr><th width="150">工序</th><th width="100">使用物料</th><th  width="100">单耗(' + Size + ')</th></tr>';

        var __fnFindBody2UseUnit = function (p_wm_id) {
            for (var i = 0; i < Json.body2.length; i++) {
                if (Json.body2[i].wm_id == p_wm_id) {
                    return Json.body2[i].use_unit;
                }
            }

            return 0;
        }

        var caledWpNos = {};
        for (var i = 0; i < Json.body1.length; i++) {
            //找工序的物料
            var wp_no = Json.body1[i]['wp_no'];
            if (caledWpNos[wp_no]) {
                continue;
            }
            caledWpNos[wp_no] = true;
            for (var j = 0; j < Json.body1.length; j++) {
                var bodyItem = Json.body1[j];
                if (wp_no == bodyItem.wp_no) {
                    var wm_id = bodyItem.wm_id;
                    htmlContent += '<tr><td  width="100">' + bodyItem.wp_name + '</td><td>' + GlobalVar.rdMaterialName(bodyItem.material_id) + '</td><td>' + __fnFindBody2UseUnit(wm_id) + '</td></tr>';
                }
            }
        } 

        htmlContent += '</table>';
        return htmlContent;//Json.body1.length + '-' + Json.body2.length;
    }

    ///参数justTaskThisRec: 指定提交行在单选一行时,只列示该行的单耗信息
    var GetWorkeMaterailSearchParams = function (justTaskThisRec) {
        var op = {
            action: 'GetNeedMaterial',
            cnt: 0
        };
        for (var i = 0; i < WPQtyBodyStore.getCount() ; i++) {
           
            var rec = WPQtyBodyStore.getAt(i);
            if (justTaskThisRec && rec != justTaskThisRec) {
                continue;
            }
            var plan_id = rec.get('plan_id'),
                size_id = rec.get('size_id'),
                prd_no = rec.get('prd_no'),
                wp_no = rec.get('wp_no'),
                size = rec.get('size'),
                qty_pair = rec.get('qty_pair');
            
            if (plan_id <= 0 || !wp_no) {
                continue;
            }

            var wp_noArr = wp_no.split(',');
            for (var j = 0; j < wp_noArr.length; j++) {
                op['prd_no_' + op.cnt] = prd_no;
                op['wp_no_' + op.cnt] = wp_noArr[j];
                op['size_' + op.cnt] = size;
                op['qty_' + op.cnt] = qty_pair;
                ++op.cnt;
            }
        }
        return op;
    }

   // 用后台数据更新皮奖表.. 注意保意用户的领,退量
    var UpdateMaterialGridCallBack = function (DataJson) {
        ///保留用户录入的皮奖Grid数据
        var oldQtys = {};
        WPQtyBodyMaterialStore.each(function (qRec) {
            oldQtys[qRec.get('material_id')] = {
                wl_qty : qRec.get('wl_qty'),
                rl_qty: qRec.get('rl_qty'),
                use_qty: qRec.get('use_qty')
            };
        });

        WPQtyBodyMaterialStore.removeAll();
        WPQtyBodyMaterialStore.add(DataJson);

        WPQtyBodyMaterialStore.each(function (qRec) {
            var material_id = qRec.get('material_id');

            if (oldQtys[material_id]) {
                qRec.set('wl_qty', oldQtys[material_id].wl_qty);
                qRec.set('rl_qty', oldQtys[material_id].rl_qty);
                qRec.set('use_qty', oldQtys[material_id].use_qty);

                var num = qRec.get('plan_qty') - oldQtys[material_id].use_qty
                num = Ext.util.Format.round(num, 4);

                qRec.set('qty', num);
                qRec.commit();
            }
        });
    }
    //更新皮奖表
    var UpdateMaterialGrid = function () {
        var op = GetWorkeMaterailSearchParams();
        if (op.cnt <= 0) {
            return;
        }
        
        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/Material/ashx_PrdtWpMaterial.ashx',
            params: op,
            success: function (response) {
                var Json = Ext.decode(response.responseText);
                UpdateMaterialGridCallBack(Json);
            },
            failure: function (form, action) {
                CommMsgShow("加载标准用料异常!", '', true);
            }
        });
    }
    
    var WQMaterialGrid = Ext.create('Ext.grid.Panel', {
        region: 'south',
        enableLocking: false,
        enableColumnMove: false,
        enableColumnHide: false,
        columnLines: true,
        rowLines: true,
        selType: 'rowmodel',
        height:160,
        plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1,
                listeners: {
                    edit: function (editor, e, eOpts) {
                        if (e.value == e.originalValue) {
                            return;
                        }

                        if (e.field == 'wl_qty' || e.field == 'rl_qty') {
                            var num1 = Ext.util.Format.round(e.record.get('wl_qty') - e.record.get('rl_qty'), 6);
                            e.record.set('use_qty', num1);

                            if (e.record.get('use_qty') < 0) {
                                alert("退料量不能大领料量!");
                                return;
                            }
                        }

                        //有计划量才奖
                        if (e.record.get('plan_qty') > 0 && e.record.get('use_qty') > 0) {
                            var num2 = Ext.util.Format.round(e.record.get('plan_qty') - e.record.get('use_qty'), 6);
                            e.record.set('qty', num2);
                        }
                        else {
                            e.record.set('qty', 0);
                        }
                    }
                }
            })
        ],
        store: WPQtyBodyMaterialStore,
        columns: [
            { xtype: 'rownumberer' },
            {
                text: '皮奖物料', dataIndex: 'material_id', width: 100,
                renderer: function (v, m, rec) {
                    return GlobalVar.rdMaterialName(v);
                }
            },
            {
                text: '计划用量', dataIndex: 'plan_qty',
                width:90,
                tdCls: 'disabled_column',
                renderer: function (v, m, rec) {
                    if (v == 0) {
                        return '';
                    }
                    return v;
                }
            },
            {
                text: '皮奖数量', dataIndex: 'qty', tdCls: 'disabled_column',
                width: 90,
                renderer: function (v, m, rec) {
                    if (v == 0) {
                        return '';
                    }
                    return v;
                }
            },
            {
                text: '单价', dataIndex: 'price',
                width: 90,
                tdCls: 'disabled_column',
                renderer: function (v, m, rec) {
                     
                    return GlobalVar.rdMaterialPrice(rec.get('material_id'));
                }
            },
            {
                text: '皮奖金额',
                tdCls: 'disabled_column',
                renderer: function (v, m, rec) {
                    if (rec.get('plan_qty') <= 0) {
                        return '';
                    }

                    var num = rec.get('qty') * GlobalVar.rdMaterialPrice(rec.get('material_id'));
                    num = Ext.util.Format.round(num, 4);
                    return num;
                }
            },
            {
                text: '领料量', dataIndex: 'wl_qty',
                width: 100,
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 4
                },
                renderer: function (v, m, rec) {
                    if (v == 0) {
                        return '';
                    }
                    return v;
                }
            },
            {
                text: '退料量', dataIndex: 'rl_qty',
                width: 100,
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 4
                },
                renderer: function (v, m, rec) {
                    if (v == 0) {
                        return '';
                    }
                    return v;
                }
            },
            {
                text: '实际领量', dataIndex: 'use_qty', tdCls: 'disabled_column',
                width: 100,
                renderer: function (v, m, rec) {
                    if (v == 0) {
                        return '';
                    }

                    return v;
                }
            }
        ]
    });

    //查询 , 计薪范围段  计薪单号 计划单号, 员工部门  
    //查询Grid
    var SearchGridStore = Ext.create('Ext.data.Store', {
        model: 'WPQtyHeader_Model',
        proxy: {
            type: 'ajax',
            url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
            reader: {
                type: 'json'
                //root: 'items'
            }
        }
    });

    var OnSearchWQ = function () {
        var searchParams = SearchPanel.getComponent('SearchFormId').getValues();
        searchParams.action = 'SearchWQ_PJ';
        searchParams.NowUserId = GlobalVar.NowUserId;
        searchParams.TableType = TableType;
        SearchGridStore.load({
            params: searchParams
        });
    }

    var SearchPanel = Ext.create('Ext.panel.Panel', {
        region: 'east',
        title: '查询计薪单',
        width: 420,
        collapsed: true,
        layout: 'border',
        collapsible: true,
        items: [
            {
                region: 'north',
                xtype: 'form',
                itemId: 'SearchFormId',
                defaults: {
                    labelAlign: 'right',
                    width: 170,
                    labelWidth: 60
                },
                layout: {
                    type: 'table',
                    columns: 2
                },
                items: [{
                    fieldLabel: '计薪日',
                    name: 'S_jx_dd',
                    itemId: 'S_jx_dd',
                    xtype: 'datefield',
                    format: 'Y/m/d',
                    value: GlobalVar.MouthFirstDay
                }, {
                    fieldLabel: '~&nbsp&nbsp至&nbsp&nbsp',
                    name: 'E_jx_dd',
                    itemId: 'E_jx_dd',
                    xtype: 'datefield',
                    format: 'Y/m/d',
                    value: GlobalVar.MouthLastDay
                }, {
                    fieldLabel: '计薪单',
                    name: 'jx_no',
                    itemId: 'jx_no',
                    xtype: 'textfield'
                }, {
                    fieldLabel: '计划单',
                    name: 'plan_no',
                    itemId: 'plan_no',
                    xtype: 'textfield'
                },
                {
                    fieldLabel: '员工部门',
                    name: 'user_dep_no',
                    itemId: 'user_dep_no',
                    xtype: 'MSearch_Dept',
                    value: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000',
                    listeners: {
                        change: function (cb, newValue, oldValue, eOpts) {
                            SearchPanel.getComponent('SearchFormId').getComponent('worker1').fnSortLocalStoreByWorkerDeptNo(newValue);
                            SearchPanel.getComponent('SearchFormId').getComponent('worker2').fnSortLocalStoreByWorkerDeptNo(newValue);
                        }
                    }
                }, {
                    fieldLabel: '员工并集',
                    name: 'worker_union',
                    itemId: 'worker_union',
                    xtype: 'checkbox',
                    value: false,
                    margin:'0 0 0 10'
                }, {
                    fieldLabel: '员工1',
                    name: 'worker1',
                    itemId: 'worker1',
                    xtype: 'MSearch_Salm',
                    matchFieldWidth:false,
                    localStoreSortByWorkerDeptNo: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000'
                }, {
                    fieldLabel: '员工2',
                    name: 'worker2',
                    itemId: 'worker2',
                    xtype: 'MSearch_Salm',
                    matchFieldWidth: false,
                    localStoreSortByWorkerDeptNo: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000'
                },  {
                    margin: '0 0 0 10',
                    text: '查&nbsp&nbsp&nbsp&nbsp询',
                    xtype: 'button',
                    height: 30,
                    width: 80,
                    handler: OnSearchWQ
                }]
            },
            {
                region: 'center',
                xtype: 'grid',
                store: SearchGridStore,
                columns: [
                    { header: '计薪日', name: 'jx_dd', dataIndex: 'jx_dd', xtype: 'datecolumn', format: 'm-d', width: 60 },
                    { header: '计薪单', name: 'jx_no', dataIndex: 'jx_no', width: 100 },
                    { header: '计划单', name: 'plan_no', dataIndex: 'plan_no', width: 100 },
                    { header: '员工部门', name: 'user_dep_no', dataIndex: 'user_dep_no', renderer: GlobalVar.rdDeptName },
                    {
                        header: '生产员工', name: 'n_man', dataIndex: 'n_man', width: 120 ,
                        renderer: function (v, m, rec) {
                            var workerArr = v.split(',');
                            var workerNames = [];
                            for (var i = 0; i < workerArr.length; i++) {
                                workerNames.push(GlobalVar.rdSalmName(workerArr[i]));
                            }
                            return workerNames.toString();
                        }
                    },
                    { header: '货名', name: 'prd_no', dataIndex: 'prd_no' }
                    //{ header: '尺寸(颜色)', name: 'showSizeAndColor', dataIndex: 'showSizeAndColor' }
                ],
                listeners: {
                    itemdblclick: function (gridThis, record, item, index, e, eOpts) {

                        LoadWQTable(record.get('wq_id'));
                    }
                }
            }],
        listeners: {
            afterrender: function () {
                OnSearchWQ();
            }
        }
    });

    var pageMonitor = function (receiverUrl, e) {
        if (receiverUrl != 'WPQtyOnShare')
            return;
    }

    viewport = Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [
            {
                region: 'center',
                xtype: 'panel',
                itemId: 'LeftPanel',
                layout: 'border',
                items: [
                    WQForm,
                    {
                        region:'center',
                        xtype: 'panel',
                        layout: 'border',
                        items: [WQGrid, WQMaterialGrid]
                    }
                ]
            },
            SearchPanel
        ],
        listeners: {
            afterrender: function (comp, eOpts) {
                fnCommonCreateLastNo('PJ', WQForm.getComponent('jx_no'), function () { });
                var me = this;
                var pa = window.parent ? window.parent.Ext.getCmp('tabPanel') : null;
                if (pa) {
                    var thisTabComp = pa.getComponent('WPQtyOnMaterial');
                    if (thisTabComp) {
                        thisTabComp.had_rendered = true;
                        pa.on('SendOrder', pageMonitor);
                        thisTabComp.fireEvent('had_rendered', pageMonitor);

                        PageClose = function () {
                            if (pa) {
                                thisTabComp.fireEvent('letcloseme');
                            }
                        }
                    }
                }
            }
        }
    });


    var OnFormSave = function () {
        FormUpdateRecord();
        if (WQForm.isValid() == false) {
            alert('计件单表头,输入异常..注意标记红色的提示!');
            return;
        }
        var saveParams = EditingWQ.getData();
        saveParams.NowUserId = NowUserId;
        saveParams.action = 'Save';
        saveParams.worker1 = WQForm.getComponent('worker1').getValue();
        saveParams.worker2 = WQForm.getComponent('worker2').getValue();
        saveParams.ShareMaterialPercent1 = 100;
        saveParams.ShareMaterialPercent2 = 0;
        
        saveParams.SharePercent1 = 100;
        saveParams.SharePercent2 = 0;

        if (saveParams.worker2) {
            var sType = WQForm.getComponent('PJNormalAmtShareType').getValue();
            //{ value: '1', "name": "主手50%,副手50%" },
            //{ value: '2', "name": "主手60%,副手40%" }
            if (sType == '1') {
                saveParams.SharePercent1 = 50;
                saveParams.SharePercent2 = 50;
            }
            else if (sType == '1') {
                saveParams.SharePercent1 = 60;
                saveParams.SharePercent2 = 40;
            }
        }

        //.store;
        var BodyCnt = 0;
        WQGrid.store.each(function (rec) {
            console.log(rec, rec.get('size_id'), rec.get('qty_pair'));
            if (rec.get('size_id') > 0 && rec.get('qty_pair') != 0) {
                rec.fields.each(function (field) {
                    if (field.name == 'size_id'
                        || field.name == 'itm'
                        || field.name == 'qty_pair'
                        || field.name == 'qty_pic'
                        || field.name == 'wp_no') {

                        saveParams[field.name + '_' + BodyCnt] = rec.get(field.name);
                    }
                });

                ++BodyCnt;
            }
        });
        saveParams['bodyCnt'] = BodyCnt;

        if (BodyCnt <= 0) {
            alert('表身没有数据!');
            return;
        }


        var Body2Cnt = 0;
        var materialGotBug = false;

        WQMaterialGrid.store.each(function (rec) {
            if (rec.get('use_qty') < 0 ) {
                alert('实际领料量不能为负!');
                materialGotBug = true;
                return false;
            }
            if (rec.get('material_id') > 0) {
                rec.fields.each(function (field) {
                    saveParams[field.name + '_m_' + Body2Cnt] = rec.get(field.name);
                });
                ++Body2Cnt;
            }
        });

        if (materialGotBug == true) {
            return;
        }

        saveParams['body2Cnt'] = Body2Cnt;

        WQGrid.btnSave.setDisabled(true);
        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/Material/ashx_WPQtyMaterialEdit.ashx',
            params: saveParams,
            success: function (response) {
                WQGrid.setLoading(false);
                WQGrid.btnSave.setDisabled(false);

                var Json = Ext.decode(response.responseText);
                if (Json.result == true) {
                    OnSearchWQ();
                    //重加载单据
                    LoadWQTable(Json.wq_id);
                    alert('保存成功');
                }
                else {
                    alert('保存失败:' + Json.msg);
                }
            },
            failure: function (form, action) {
                WQGrid.setLoading(false);
                WQGrid.btnSave.setDisabled(false);
                CommMsgShow("异常：", form.responseText, true);
            }
        });
        //WQGrid, WQMaterialGrid
    }

    var LoadWQTable = function (wq_id) {
        WQForm.setLoading(true);
        WQGrid.setLoading(true);
        WQMaterialGrid.setLoading(true);

        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/Material/ashx_WPQtyMaterialEdit.ashx',
            params: {
                action: 'LoadTable',
                wq_id: wq_id,
                NowUserId: NowUserId
            },
            success: function (response) {
                WQForm.setLoading(false);
                WQGrid.setLoading(false);
                WQMaterialGrid.setLoading(false);

                var Json = Ext.decode(response.responseText);
                if (Json.result == true) {
                    //更新
                    Ext.suspendLayouts();

                    LayoutTableData(Json);
                    
                    
                    Ext.resumeLayouts(true);
                    OnSetReadOnlyOnUpdateing(true);
                }
                else {
                    alert('加载失败:' + Json.msg);
                }
            },
            failure: function (form, action) {
                WQForm.setLoading(false);
                WQGrid.setLoading(false);
                WQMaterialGrid.setLoading(false);
                CommMsgShow("异常：", form.responseText, true);
            }
        });
    }


    var LayoutTableData = function (Json) {
        EditingWQ = Ext.create('WPQtyHeader_Model', Json.Header[0]);
        WQForm.loadRecord(EditingWQ);
        //WQForm.getComponent('plan_no').setRawValue('');

        WQGrid.store.removeAll();
        WQMaterialGrid.store.removeAll();

        WQGrid.store.add(Json.Body);
        WQMaterialGrid.store.add(Json.BodyMaterial);

        WQForm.getComponent('worker1').setValue(Json.worker1);
        WQForm.getComponent('worker2').setValue(Json.worker2);


        if (!Json.worker2) {
            WQForm.getComponent('PJNormalAmtShareType').setVisible(false);
        }
        else {
          
            WQForm.getComponent('PJNormalAmtShareType').setVisible(true);
            var perIndex = WpConfig.GetShareTypeIndexInWpConfig(Json.SharePercent1);
            if (perIndex != -1) {
                WQForm.getComponent('PJNormalAmtShareType').setValue(perIndex.toString());
            }
            else {
                var sList = WpConfig.GetShareSetting();
                var newPIndex = (sList.length + 1);
                var per1 = Json.SharePercent1;
                var per2 = 100 - per1;
                var newStoreRec = { value: newPIndex.toString(), "name": "主" + per1 + "%,副" + per2 + "%" };

                WQForm.getComponent('PJNormalAmtShareType').store.add(newStoreRec);
                Ext.Function.defer(function () {
                    WQForm.getComponent('PJNormalAmtShareType').setValue(newPIndex.toString());
                }, 500);
            }
        }
    }
});