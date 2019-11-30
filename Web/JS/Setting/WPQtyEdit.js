Ext.onReady(function () {
    var FME = this;
    //计薪表头
    //WPQtyHeader_Model
    var isAdminRoot = WpConfig.UserDefault[GlobalVar.NowUserId].root == '管理员';
    var 有超数权限 = WpConfig.UserDefault[GlobalVar.NowUserId].开户超数权限 == true;
    var EditingWQ = null;
    var OnFormInit = function () {
        EditingWQ = null;
        EditingWQ = Ext.create('WPQtyHeader_Model', {
            wq_id: -1,
            edit_ut: WpConfig.UserDefault[GlobalVar.NowUserId].edit_ut || 1,   //1.对, 2.个
            cal_inscrease: false,
            n_man: GlobalVar.NowUserId
        });

        WQForm.getForm().reset();
        SetJXDDMinMax();
        WQForm.setLoading(true);
        fnCommonCreateLastNo('JX', WQForm.getComponent('jx_no'), function () {
            Ext.Function.defer(function () {
                WQForm.setLoading(false);
            }, 800); 
        });

        OnSetReadOnlyOnUpdateing(false);
    }
    var TableType = '计件';
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

    var ClearWQBody = function () {
        WQGrid.store.removeAll();
    }

    var OnFormSave = function () {
        if (EditingWQ == null) { alert('无法保存, 因为末新建单据!'); }

        var checkResult = IsLocking();
        if (checkResult != false) {
            if (checkResult == '冰封') {
                alert('单据已被冰封!, 想修改请与管理员联系!');
            }
            else {
                alert('单据已被结账,不能修改!');
            }

            WQGrid.setLoading(false);
            WQGrid.btnSave.setDisabled(false);

            return;
        }

        var saveParams = { action: 'Save', TableType: TableType, IsShareTable:IsShareTable,  NowUserId: GlobalVar.NowUserId };
        FormUpdateRecord();
        Ext.apply(saveParams, EditingWQ.getData());
        
        //以防全为0,有特殊情况全部为0,清空了单据表身的数量
        var hadQtyCount = 0;
        var BodyCnt = 0;
        WQDetailStore.each(function (rec) {
            if (rec.get('qty_pic') != 0) {
                rec.fields.each(function (field) {
                    var itemName = field.name;
                    if (itemName != 'id'
                        && itemName != 'wq_id'
                        && itemName != 'prd_no'
                        && itemName != 'jx_no') {

                        saveParams[itemName + '_' + BodyCnt] = rec.get(itemName);
                    }
                });
                ++BodyCnt;
            }

            if (rec.get('qty_pair') > 0) {
                ++hadQtyCount;
            }
        });

        if (BodyCnt == 0) {
            WQGrid.setLoading(false);
            WQGrid.btnSave.setDisabled(false);
            alert('数量全部为0,不允许保存!');
            return;
        }

        if (BodyCnt > 0 && hadQtyCount == 0) {
            WQGrid.setLoading(false);
            WQGrid.btnSave.setDisabled(false);
            alert('异常数量全部为0! 请重新打开单据,重新维护一次!');
            return;
        }

        saveParams['bodyCnt'] = BodyCnt;

        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
            params: saveParams,
            success: function (response) {
                WQGrid.setLoading(false);
                WQGrid.btnSave.setDisabled(false);
                try{
                    var Json = Ext.decode(response.responseText);
                    if (Json.result == true)
                    {
                        //更新
                        EditingWQ = Ext.create('WPQtyHeader_Model', Json.WQHeader[0]);
                        OnWQGridLayout();
                        OnSearchWQ();
                        WQGrid.setLoading(false);
                        WQGrid.btnSave.setDisabled(false);
                        alert('保存成功');
                    }
                    else {
                        alert('保存失败:' + Json.msg);
                    }
                }
                catch(e){
                    alert(response.responseText);
                }
            },
            failure: function (form, action) {
                WQGrid.setLoading(false);
                WQGrid.btnSave.setDisabled(false);
                CommMsgShow("异常：", form.responseText, true);
            }
        });
    }

    var OnFormDelete = function () {
        var checkResult = IsLocking();
        if (checkResult != false) {
            if (checkResult == '冰封')
                alert('单据已被冰封!, 想删除请与管理员联系!');
            else
                alert('单据已被结账,不能删除!');
            return;
        }
        var wq_id = EditingWQ.get('wq_id');
        if (wq_id > 0) {
            Ext.MessageBox.confirm('询问', '确定删除单据吗?', function (btn) {
                if (btn == 'yes') {
                    Ext.Ajax.request({
                        url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
                        params: {
                            action: 'DeleteWQTable',
                            wq_id: wq_id,
                            NowUserId: NowUserId
                        },
                        success: function (response) {
                            var json = Ext.decode(response.responseText);
                            if (json.result == true) {
                                OnFormInit();
                                ClearWQBody();
                                OnSearchWQ();
                            }
                            else {
                                alert('删除失败:' + json.msg);
                            }
                        },
                        failtrue: function () {
                            alert('删除失败,出现异常!');
                        }
                    });
                }
            }, this);
        }
        else {
            Ext.MessageBox.confirm('询问', '放弃保存吗?', function (btn) {
                if (btn == 'yes') {
                    OnFormInit();
                }
            });
        }

    }

    var OnSetReadOnlyOnUpdateing = function (readOnly) {
        WQForm.getComponent('plan_no').setReadOnly(readOnly);
        //WQForm.getComponent('prd_no').setReadOnly(readOnly);
        //WQForm.getComponent('size').setReadOnly(readOnly);
    }

    var SetJXDDMinMax = function () {

        var tDate = GlobalVar.ServerDate;
        if (EditingWQ == null || EditingWQ.get('wq_id') < 0) {
            tDate = GlobalVar.ServerDate;
        }
        else {
            tDate = EditingWQ.get('n_dd');
        }

        var minValue = Ext.Date.add(tDate, Ext.Date.DAY, -1 * (WpConfig.freezeDay - 1));
        var maxValue = tDate;

        WQForm.getComponent('jx_dd').setMinValue(minValue);
        WQForm.getComponent('jx_dd').setMaxValue(maxValue);
    }

    var fnBeforeGenarateExcel =function (dom_table, dom_thead, dom_tbody) {

        var top_tr = document.createElement('tr');

        var dom_td = document.createElement('td');
        dom_td.appendChild(document.createTextNode('单号'));

        dom_td2 = document.createElement('td');
        dom_td2.colSpan = 2;
        dom_td2.appendChild(document.createTextNode(WQForm.getComponent('plan_no').getValue()));


        var dom_td3 = document.createElement('td');
        dom_td3.appendChild(document.createTextNode('货号'));

        dom_td3_val = document.createElement('td');
        dom_td3_val.colSpan = 2;
        dom_td3_val.appendChild(document.createTextNode(WQForm.getComponent('prd_no').getValue()));

        var dom_td4 = document.createElement('td');
        dom_td4.appendChild(document.createTextNode('客户'));

        dom_td4_val = document.createElement('td');
        dom_td4_val.colSpan = 2;
        dom_td4_val.appendChild(document.createTextNode(''));


        var dom_td5 = document.createElement('td');
        dom_td5.appendChild(document.createTextNode('总单数量'));

        dom_td5_val = document.createElement('td');
        dom_td5_val.colSpan = 2;
        dom_td5_val.appendChild(document.createTextNode(''));

        var dom_td6 = document.createElement('td');
        dom_td6.appendChild(document.createTextNode('本组数量'));

        dom_td6_val = document.createElement('td');
        dom_td6_val.colSpan = 2;
        dom_td6_val.appendChild(document.createTextNode(''));


        var dom_td7 = document.createElement('td');
        dom_td7.appendChild(document.createTextNode('日期:'));

        dom_td7_val = document.createElement('td');
        dom_td7_val.colSpan = 2;

        var date = Ext.Date.format(WQForm.getComponent('jx_dd').getValue(), 'Y-m-d');
        dom_td7_val.appendChild(document.createTextNode(date));


        top_tr.appendChild(dom_td); top_tr.appendChild(dom_td2);
        top_tr.appendChild(dom_td3); top_tr.appendChild(dom_td3_val);
        top_tr.appendChild(dom_td4); top_tr.appendChild(dom_td4_val);
        top_tr.appendChild(dom_td5); top_tr.appendChild(dom_td5_val);
        top_tr.appendChild(dom_td6); top_tr.appendChild(dom_td6_val);
        top_tr.appendChild(dom_td7); top_tr.appendChild(dom_td7_val);

        dom_thead.appendChild(top_tr);

        //
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
            margin: '2 0 2 5',
            labelAlign: 'right'
        },
        items: [
          {
              fieldLabel: '计薪日&nbsp&nbsp&nbsp',
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
              fieldLabel: '计薪号&nbsp&nbsp&nbsp',
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
              colspan:1
            },
            {
                xtype: 'button',
                height: 26,
                width: 80,
                text: '统计视图',
                margin: '2 2 5 5',
                handler: function () {
                    PlanViewHelper.ShowWin(

                        WQForm.getComponent('plan_no').getValue(),
                        WQForm.getComponent('wp_dep_no').getValue(),
                        WQForm.getComponent('user_dep_no').getValue(),
                        function (PlanViewHelper2, record) {
                            PlanViewHelper.IsSumByPlanView = true;
                            WQGrid.btnSave.setDisabled(true);
                            WQGrid.btnDelete.setDisabled(true);
                            //随机找出一个计件单 
                            //上下文 是WpQtyEdit.js
                            WQGrid.setDisabled(true);
                            //以防 事件触发
                            SwitchUTIng = true;
                            EditingWQ = Ext.create('WPQtyHeader_Model', record.getData());
                            SetJXDDMinMax();

                            WQForm.getForm().loadRecord(EditingWQ);
                            WQForm.getComponent('plan_no').setRawValue(EditingWQ.get('plan_no'));
                            SwitchUTIng = false;

                            OnWQGridLayout();
                        },
                        function () {
                            //console.log("normal" + WQGrid.getId() + "--" + Ext.getCmp(WQGrid.getId() + '-normal').getId());
                            var sheetName = '';
                            if (PlanViewHelper.IsSumByPlanView)
                                sheetName += '统计-';
                            else
                                sheetName += '明细-';

                            sheetName += WQForm.getComponent('plan_no').getValue()
                                + '-' + WQForm.getComponent('user_dep_no').getValue()
                                + '-' + WQForm.getComponent('wp_dep_no').getValue();

                            GlobalVar.ToExcel(WQGrid, sheetName, window, {
                                normalGrid: Ext.getCmp(WQGrid.getId() + '-normal'),
                                lockGrid: Ext.getCmp(WQGrid.getId() + '-locked')
                            }, fnBeforeGenarateExcel );
                        },
                        FME
                    );
                }
            },
          {
              fieldLabel: '计划单&nbsp&nbsp&nbsp',
              name: 'plan_no',
              itemId: 'plan_no',
              //allowBlank: false,
              xtype: 'MSearch_PlanSize',  // 同选 size_id size
              pageSize: 100,
              listeners: {
                  select: function (vcombo, records, eOpts) {
                      if (EditingWQ != null) {
                          if (records && records.length > 0) {
                              var cbSel = records[0];
                             
                              EditingWQ.set('plan_id', cbSel.get('plan_id'));
                              EditingWQ.set('plan_no', cbSel.get('plan_no'));

                              Ext.Function.defer(function () {
                                  WQForm.getComponent('plan_no').setRawValue(cbSel.get('plan_no'));
                              }, 190);
                              
                              EditingWQ.set('size_id', cbSel.get('size_id'));
                              EditingWQ.set('size', cbSel.get('size'));
                              EditingWQ.set('prd_no', cbSel.get('prd_no'));
                              EditingWQ.set('color_id', cbSel.get('color_id'));
                              EditingWQ.set('cal_inscrease', false);

                              WQForm.getComponent('prd_no').setValue(cbSel.get('prd_no'));
                              WQForm.getComponent('size').setValue(cbSel.get('size'));
                               
                              EditingWQ.setShowSizeAndColor();//奇怪更新不成功,总是空字符~~~
                              WQForm.getComponent('showSizeAndColor').setValue(EditingWQ.get('showSizeAndColor'));
                          }
                          else {
                              alert('填充其他选择时,出错! 试重选一次!');
                          }
                      }
                  }
              }
          },
          {
              fieldLabel: '货品代号*',
              name: 'prd_no',
              itemId: 'prd_no',
              xtype: 'MSearch_Prdt',
              allowBlank: false,
              readOnly: true
          },
          {
              fieldLabel: '尺&nbsp&nbsp&nbsp&nbsp&nbsp寸*',
              name: 'size',
              itemId: 'size',
              xtype: 'MSearch_Size',
              allowBlank: false,
              readOnly: true,
              hidden:true
          },
          {
              fieldLabel: '尺寸与颜色*',
              name: 'showSizeAndColor',
              itemId: 'showSizeAndColor',
              xtype: 'textfield',
              readOnly: true
          },
          {
              xtype: 'fieldcontainer',
              items: [{
                  xtype: 'button',
                  height : 30,
                  text: '新建单据',
                  margin: '0 5 0 5',
                  handler: function () {
                      PlanViewHelper.IsSumByPlanView = false;
                      WQGrid.btnSave.setDisabled(false);
                      WQGrid.btnDelete.setDisabled(false);

                      OnFormInit();
                      WQGridLayoutStore.removeAll();
                      WQGrid.setDisabled(true);
                  }
              },{
                  xtype: 'button',
                  height : 30,
                  text: '更新布局',
                  margin: '0 5 0 5',
                  handler: function () {
                      FormUpdateRecord();
                      OnWQGridLayout();

                      //WQGrid.setDisabled(false);
                  }
                  }]
          },
          {
              fieldLabel: '工序部门',
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
          },
          {
              //// { value: 1, "name": "对" },
              ////{ value: 2, "name": "个" },
              colspan :1,
              xtype: 'cbUTType',
              name: 'edit_ut',
              itemId: 'edit_ut',
              editable :false,
              fieldLabel: '录入单位',
              value: WpConfig.UserDefault[GlobalVar.NowUserId].edit_ut || 1,
              listeners: {
                  change: function () {
                      if (EditingWQ != null) {
                          if (EditingWQ.get('edit_ut') == this.getValue())
                              return true;

                          EditingWQ.set('edit_ut', this.getValue());

                          OnSwitchEditUt(this.getValue());
                      }
                  }
              }
          },
          {
              colspan :1,
              xtype: 'cbLayoutFinishQty',
              name: 'layout_finish',
              itemId: 'layout_finish',
              fieldLabel: '完工显示',
              value: Ext.util.Cookies.get('layout_finish') || 'FINISH-PLAN',
              listeners: {
                  change: function (vthis, value, eOpts ) {
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
        listeners: { afterrender: function () { OnFormInit(); WQGrid.setDisabled(true);  } }
    });
    
    //计薪Grid
    //WPQtyBody_Model
    // 工序列表
    // 单价列表
    // 总完成量列表   已修改的单,这包含了本单的量.. = all_qty-单加载时完成量+ 本单录入量
    // 本单完成量列表
    // 员工 + 工序数量
    // 

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


    var WQUserSalmStore = Ext.create('Ext.data.Store', {
        model: 'Model_Salm',
        data: []
    });

    var WQDetailStore = Ext.create('Ext.data.Store', {
        model: 'WPQtyBody_Model',
        data: []
    });

    var WQDetailStoreShare = Ext.create('Ext.data.Store', {
        model: 'WPQtyBodyShare_Model',
        data: []
    });

    var WQFinishStore = Ext.create('Ext.data.Store', {
        model: 'WQGrid_QtyFinish_Model',
        data: []
    });

    var WQFinishStore_AllSizes = Ext.create('Ext.data.Store', {
        model: 'WQGrid_QtyFinish_Model',
        data: []
    });

    var WQUserDeptFinishStore_AllSizes = Ext.create('Ext.data.Store', {
        model: 'WQGrid_QtyFinish_Model',
        data: []
    });

    var WQGridLayoutStore = Ext.create('Ext.data.Store', {
        model: 'WQGrid_Layout_Model',
        data: []
    });

    var OnLoadLayoutData = function (callback) {
        if (EditingWQ.get('wq_id') < 0)
            OnSetReadOnlyOnUpdateing(false);
        else
            OnSetReadOnlyOnUpdateing(true);

        


        var searchParams = {};
        Ext.apply(searchParams, EditingWQ.getData());
        searchParams.action = 'LoadWQLayoutData';
        searchParams.NowUserId = GlobalVar.NowUserId;
        ////2019-08-02 增加 按计划单统计视图
        if (PlanViewHelper.IsSumByPlanView == true) {
            searchParams.IsSumByPlanView = true;
            searchParams.IsSumByPlanView_StartDD = PlanViewHelper.startdd.getValue();
            searchParams.IsSumByPlanView_EndDD =PlanViewHelper.enddd.getValue();
        }

        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
            params: searchParams,
            success: function (response) {
                viewport.getComponent('LeftPanel').setLoading(false, viewport.getComponent('LeftPanel').contentEl);
                var Json = Ext.decode(response.responseText);
                if (Json.result == true)
                    callback(Json);
                else {
                    alert('加载失败' + Json.msg);
                }
            },
            failure: function (form, action) {
                viewport.getComponent('LeftPanel').setLoading(false, viewport.getComponent('LeftPanel').contentEl);
                CommMsgShow("异常：", form.responseText, true);
            }
        });
    }

    //var sample = {
    //cellIndex: i+3,  //No.1 rownumber No2. row_type, No3 row_value
    //up_pic: 0,
    //up_pair :0,
    //pic_num: rec.get('pic_num'),
    //is_size_control: rec.get('is_size_control'),
    //wq_type: rec.get('wq_type'),
    //sizes:[],
    //table_sum_qty_pic:0,
    //table_sum_qty_pair:0,
    //sum_qty_pic: 0,
    //sum_qty_pair: 0,
    //sum_all_qty_pic: 0,
    //sum_all_qty_pair: 0
    //}
    var EditWQGridData = {}
    var FitStoreFromJson = function (layoutData) {
        //strBuilder.AppendLine(" ,PrdtWP:" + JsonClass.DataTable2Json(dtPrdtWp));
        //strBuilder.AppendLine(" ,PrdtWP_SIZE:" + JsonClass.DataTable2Json(dtPrdtWp_SizeControl));
        //strBuilder.AppendLine(" ,PrdtWP_UP:" + JsonClass.DataTable2Json(dtPrdtWp_UP));
        //strBuilder.AppendLine(" ,PrdtWP_COLOR_UP:" + JsonClass.DataTable2Json(dtColorUP));
        //strBuilder.AppendLine(" ,Salm:" + JsonClass.DataTable2Json(dtSalm));
        //strBuilder.AppendLine(" ,WQDetail :" + JsonClass.DataTable2Json(dtWQDetail));
        //strBuilder.AppendLine(" ,WQFinish:" + JsonClass.DataTable2Json(dtWQFinish));

        EditingWQ.set('plan_sizes_qty', layoutData.plan_sizes_qty);
        EditingWQ.set('plan_size_qty', layoutData.plan_size_qty);
        //alert(EditingWQ.get('plan_sizes_qty') + ' - ' + EditingWQ.get('plan_size_qty'));

        WQPrdtWPStore.removeAll();
        WQPrdtWP_SizeControlStore.removeAll();
        WQPrdtWP_UPStore.removeAll();
        WQPrdtWP_UPColorStore.removeAll();
        WQUserSalmStore.removeAll();
        WQDetailStore.removeAll();
        WQDetailStoreShare.removeAll();
        WQFinishStore.removeAll();
        WQFinishStore_AllSizes.removeAll();
        WQUserDeptFinishStore_AllSizes.removeAll();

        WQGridLayoutStore.removeAll();
        JXCheckStore.removeAll();

        WQPrdtWPStore.add(layoutData.PrdtWP);
        WQPrdtWP_SizeControlStore.add(layoutData.PrdtWP_SIZE);
        WQPrdtWP_UPStore.add(layoutData.PrdtWP_UP);
        WQPrdtWP_UPColorStore.add(layoutData.PrdtWP_COLOR_UP);
        WQUserSalmStore.add(layoutData.Salm);
        WQDetailStore.add(layoutData.WQDetail);
        WQDetailStoreShare.add(layoutData.WQDetailShare);
        
        WQFinishStore.add(layoutData.WQFinish);
        WQFinishStore_AllSizes.add(layoutData.WQFinish_AllSizes);
        WQUserDeptFinishStore_AllSizes.add(layoutData.WQUserDeptFinish);

        if (EditingWQ.get('wq_id') > 0 ) {
            JXCheckStore.add(layoutData.WQFlowCheckList);
        }

        GenerateEditWQGridData();
    }

    var GenerateEditWQGridData = function () {
       
        //方式二
        EditWQGridData = {};
        var headColorId = EditingWQ.get('color_id');
        for (var i = 0; i < WQPrdtWPStore.getCount() ; i++) {
            var rec = WQPrdtWPStore.getAt(i);
            var wp_no = rec.get('wp_no');

            // console.log({ wp_no: wp_no, typee: typeof (wp_no) });
            var wp_name = rec.get('name');
            var color_different_price = rec.get('color_different_price');

            EditWQGridData[wp_no] = {
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
                sum_user_dept_all_qty_pic: 0,
                sum_user_dept_all_qty_pair: 0,
                sum_all_qty_pic: 0,
                sum_all_qty_pair: 0,
                state : rec.get('state')        //是否已经停用
            };

            var upRec = WQPrdtWP_UPStore.findRecord('wp_no', wp_no);
            if (upRec) {
                //if (!upRec.get('up_pair')) {
                //    alert('注意:<' + wp_name + '>工序没有单价!  请与系统管理员沟通.(可以继续录入,单价后补)');
                //}

                EditWQGridData[wp_no]['up_pic'] = upRec.get('up_pic');
                EditWQGridData[wp_no]['up_pair'] = upRec.get('up_pair');

                if(color_different_price == true){
                    ///依颜色区分单价
                    if (headColorId > 0 ) {
                        WQPrdtWP_UPColorStore.findBy(function (qrec) {
                            if (qrec.get('wp_no') == wp_no 
                                &&
                                //指定颜色
                                (qrec.get('color_id') && qrec.get('color_id') == headColorId)
                            ) {
                                EditWQGridData[wp_no]['up_pic'] = qrec.get('up_pic');
                                EditWQGridData[wp_no]['up_pair'] = qrec.get('up_pair');
                                // alert(headColorId +'---设颜色特别单价---' + wp_name);
                            }
                        });
                    }

                    WQPrdtWP_UPColorStore.findBy(function (qrec) {
                        if (qrec.get('wp_no') == wp_no 
                            &&
                            //或指定计件单号
                            qrec.IsContainJX(WQForm.getComponent('jx_no').getValue())
                        ) {
                            EditWQGridData[wp_no]['up_pic'] = qrec.get('up_pic');
                            EditWQGridData[wp_no]['up_pair'] = qrec.get('up_pair');
                            //alert(headColorId +'---设指定计件单号 特别单价---' + wp_name);
                        }
                    });
                }
            }
            else {
                alert('注意:<' + wp_name + '>工序没有单价!  请与系统管理员沟通.(可以继续录入,单价后补)');
            }

            if (rec.get('is_size_control') == true) {
                WQPrdtWP_SizeControlStore.findBy(function (qrec) {
                    if (qrec.get('wp_no') == wp_no) {
                        EditWQGridData[wp_no].sizes.push(qrec.get('size'));
                    }
                });
            }
            
            // 取消原因, 因为切换单位时,也要重载这个方法. 这时已经有录入数据了
            //var isNewing = EditingWQ.get('wq_id') < 0;
            //if (isNewing == false) {
            var _qty_pic = 0,
                _qty_pair = 0;
            WQDetailStore.findBy(function (qrec) {
                if (qrec.get('wp_no') == wp_no) {
                    _qty_pic += qrec.get('qty_pic');
                    _qty_pair += qrec.get('qty_pair');
                }
            });

            EditWQGridData[wp_no].table_sum_qty_pic = _qty_pic;
            EditWQGridData[wp_no].table_sum_qty_pair = _qty_pair;
            //}

            //var sumRec = WQFinishStore.findRecord('wp_no', wp_no);
            //if (wp_no == '4' || wp_no == 4) {
            //    console.log({ wp_no: wp_no, sumRec: sumRec, findResult: WQFinishStore.find('wp_no', wp_no) });
            //} // 十分奇怪,为何会找出错误的? 使用FindBy代替吧
            var sumRec = null;
            WQFinishStore.findBy(function (qrec) {
                if (qrec.get('wp_no') == wp_no) {
                    sumRec = qrec;
                }
            });
            if (sumRec) {
                EditWQGridData[wp_no].sum_qty_pic = sumRec.get('qty_pic');
                EditWQGridData[wp_no].sum_qty_pair = sumRec.get('qty_pair');
            }

            //var sumAllRec = WQFinishStore_AllSizes.findRecord('wp_no', wp_no);
            var sumAllRec = null;
            WQFinishStore_AllSizes.findBy(function (qrec) {
                if (qrec.get('wp_no') == wp_no) {
                    sumAllRec = qrec;
                }
            });
            if (sumAllRec) {
                EditWQGridData[wp_no].sum_all_qty_pic = sumAllRec.get('qty_pic');
                EditWQGridData[wp_no].sum_all_qty_pair = sumAllRec.get('qty_pair');
            }

            var sumAllRec2 = null;
            WQUserDeptFinishStore_AllSizes.findBy(function (qrec) {
                if (qrec.get('wp_no') == wp_no) {
                    sumAllRec2 = qrec;
                }
            });
            if (sumAllRec2) {
                EditWQGridData[wp_no].sum_user_dept_all_qty_pic = sumAllRec2.get('qty_pic');
                EditWQGridData[wp_no].sum_user_dept_all_qty_pair = sumAllRec2.get('qty_pair');
            }

            
        }
    }

    
    var RowTypeIndex = {
        UP: 1,
        PIC_PAIR: 2,
        ALL2_QTY: 3,
        ALL_QTY: 4,
        TABLE_SUM_QTY: 5,
        UserDeptALL_QTY: 6,
        SALM: 7
    }

    var RowValueRenderer = function (v, m, rec) {
        var type = rec.get('row_type'),
            value = rec.get('row_value'),
            edit_ut = EditingWQ.get('edit_ut'),
            layoutFinish = WQForm.getComponent('layout_finish').getValue();

        if (type == 'UP') {
            return edit_ut == 1 ? '单价-对' : '单价-个';
        }
        if (type == 'PIC_PAIR') {
            return '个数/对';
        }
        if (type == 'ALL_QTY') {
            if (layoutFinish == 'FINISH') {
                return '尺寸完成';
            }
            else if (layoutFinish == 'PLAN') {
                return '尺寸量';
            }
            else
                return '尺寸->尺寸完成';
        }
        if (type == 'ALL2_QTY') {
            if (layoutFinish == 'FINISH') {
                return '总完成量';
            }
            else if (layoutFinish == 'PLAN') {
                return '总单量';
            }
            else
                return '总单->总完成';
        }
        if (type == 'TABLE_SUM_QTY') {
            return '本单完成量';
        }
        if (type == 'UserDeptALL_QTY') {
            return '员工部门完成';
        } 
        if (type == 'SALM') {
            return GlobalVar.rdSalmName(v);
        }
    }

    var RowEditorRenderer = function (v, m, rec, rowIndex, colIndex, store, view) {
        if (!m)
            m = {};

        if (PlanViewHelper.IsSumByPlanView == true) {
            m.tdAttr = 'style="font-weight:bold"';
        }

        var type = rec.get('row_type');
         //用了LockColumn 要用这个才准 -normal Grid
        var field = view.getHeaderAtIndex(colIndex).dataIndex;


        //console.log([field, dataIndex]);
        if (type == 'SALM' || type == 'ALL_QTY' || type == 'ALL2_QTY' || type == 'TABLE_SUM_QTY' || type == 'UserDeptALL_QTY') {
            //完成量必须显示 
            if (type == 'ALL_QTY' || type == 'ALL2_QTY') {
                if (field.indexOf("wp_") == 0) {
                    var wp_no = field.substr('wp_'.length, 10);

                    if (type == 'ALL_QTY') {
                        return LayoutFinishQtyHtml_ALL_QTY(m, wp_no, v);
                    }
                    else if (type == 'ALL2_QTY') {
                        return LayoutFinishQtyHtml_ALL2_QTY(m, wp_no, v);
                    }
                }
            }


            if (!v || v == 0) {
                //m.tdAttr = '';
                return '';
            }
            //var _numberFormat = EditingWQ.get('edit_ut') == 1 ? '0.00' : '0.0';
            //return Ext.util.Format.number(v, _numberFormat);
            return v;
        }
        else if (type == 'UP') {
            //审核中:黄色, 审核同意:绿色, 审核不同意:红色.
            if (field.indexOf("wp_") == 0) {
                var wp_no = field.substr('wp_'.length, 10);

                return LayoutUPColumnColor(wp_no, v, m);
            }
        }
        else
            return v;
    }

    ////生成完成量的显示Html//
    //  1.末完成    不设样式
    //  2.刚好完成  设绿色
    //  3.超录      设红色
    // 注意 依工序数量限制方式  控制绿,红色
    //{ value: 'FINISH', "name": "1.完成量" },
    //{ value: 'PLAN', "name": "2.计划量" },
    //{ value: 'FINISH-PLAN', "name": "3.完成量->计划量" }
    var LayoutFinishQtyHtml_ALL_QTY = function (tdMate, wp_no, qty) {
        if (!tdMate)
            tdMate = {};
        var layoutFinish = WQForm.getComponent('layout_finish').getValue();
        
        var qtyA_finish = 0.00, qtyA_plan = 0.00;
        //计算尺寸计划量,与完工量
        if (EditingWQ.get('edit_ut') == 1)
            qtyA_plan = EditingWQ.get('plan_size_qty');
        else
            qtyA_plan = EditWQGridData[wp_no].pic_num * EditingWQ.get('plan_size_qty');

        qtyA_finish = qty;
        if (layoutFinish == 'FINISH') {
            qtyContent = qtyA_finish;
        }
        else if (layoutFinish == 'PLAN') {
            qtyContent = qtyA_plan;
        }
        else {
            qtyContent = qtyA_finish + '->' + qtyA_plan;
        }

        // console.log([layoutFinish, wp_no, qtyA_plan, qtyA_finish, qtyContent]);
        ///按尺寸控制时,才在尺寸完成行显示,颜色
        if (EditWQGridData[wp_no].wq_type == 'size_qty') {
            tdMate.tdAttr = LayoutFinishColor(qtyA_plan, qtyA_finish);
        }
        else {
            tdMate.tdAttr = '';
        }
        return qtyContent;
    }

    var LayoutFinishQtyHtml_ALL2_QTY = function (tdMate, wp_no, qty) {
        if (!tdMate)
            tdMate = {};

        var layoutFinish = WQForm.getComponent('layout_finish').getValue();
        var qtyA_finish = 0.00, qtyA_plan = 0.00;
        //计算尺寸计划量,与完工量
        if (EditingWQ.get('edit_ut') == 1)
            qtyA_plan = EditingWQ.get('plan_sizes_qty');
        else
            qtyA_plan = EditWQGridData[wp_no].pic_num * EditingWQ.get('plan_sizes_qty')

        qtyA_finish = qty;

        if (layoutFinish == 'FINISH') {
            qtyContent = qtyA_finish;
        }
        else if (layoutFinish == 'PLAN') {
            qtyContent = qtyA_plan;
        }
        else {
            qtyContent = qtyA_finish + '->' + qtyA_plan;
        }

        tdMate.tdAttr = LayoutFinishColor(qtyA_plan, qtyA_finish);
        return qtyContent;
    }

    var LayoutFinishColor = function (plan_qty, finish_qty, qtyContent) {
        var partStyle1 = "";
        if (PlanViewHelper.IsSumByPlanView == true) {
            partStyle1 = 'font-weight:bold;';
        }

        if (finish_qty > plan_qty)
            return 'style=" background-color:Red;color:Black;' + partStyle1 + '"';
        else if (finish_qty == plan_qty)
            return 'style=" background-color:Green;' + partStyle1 + '"';
        else
            return 'style="'+partStyle1+'"';
    }
     

    var LayoutUPColumnColor = function (wp_no, v, meta) {
        var partStyle1 = "";
        if (PlanViewHelper.IsSumByPlanView == true) {
            partStyle1 = 'font-weight:bold;';
        }

        var had = false;
        var resContent = v;
        var edit_ut = EditingWQ.get('edit_ut');
        var NowEditUt = EditingWQ.get('edit_ut');
        JXCheckStore.findBy(function (qRec) {
            if (qRec.get('wp_no') == wp_no) {
                if (qRec.get('check_state') == 0) {
                    meta.tdAttr = 'style=" background-color: Yellow ;color :Black;' + partStyle1 + '"';
                    resContent = v + '申->' + qRec.get(edit_ut == 1 ? 'ask_up_pair' : 'ask_up_pic');
                }
                else if (qRec.get('check_state') == 1) {
                    meta.tdAttr = 'style=" background-color: Green ;color :Black;' + partStyle1 + '"';
                    resContent = '已调->' + qRec.get(edit_ut == 1 ? 'ask_up_pair' : 'ask_up_pic');
                }
                else if (qRec.get('check_state') == 2) {
                    meta.tdAttr = 'style=" background-color: Red ;color: Black ;' + partStyle1 + '"';
                    resContent = '驳回->' + v;
                }
                had = true;
            }
        });

        if (had == false) {
            meta.tdAttr = 'style="' + partStyle1 + '"';
        }

        return resContent + '(' + (edit_ut == 1 ? '对' : '个') + ')';
    }



    var GetColumnWidth = function (text) {
        //var headerText = column.text;
        if (text.length <= 4)
            return 90;
        else
            return 130;
    }

    //var salmple = {
    //    workers:['A3', 'A8', 'A4-A5'],  A4-A5代表是二个人分工的
    //    worker_share:[[100], [100], [50,50] ]
    //    worker_share_sal:[['A3'], ['A8'], ['A4','A5'] ]
    //    A3: [{ wp_no: 2, qty_pic:2, qty_pair:1, record_id:1}, { wp_no: 2, qty_pic:2, qty_pair:1,record_id:2 }],
    //    A8: [{ wp_no: 2, qty_pic:2, qty_pair:1 , record_id:3}]
    //    A4-A5: [{ wp_no: 2, qty_pic: 2, qty_pair: 1, record_id: 3 }]
    //};
    //单据数量明细 转换为员工计件列表 如上图Salmple
    var FetchWQDetailToWorkerList = function () {

        var userColl = {
            workers: [],
            worker_share: [],
            worker_share_sal:[],
            loadeds: []
        };
        
        for (var i = 0; i < WQDetailStore.getCount(); ++i) {
            var rec = WQDetailStore.getAt(i);
            var wqb_id = rec.get('wqb_id');
            var worker = rec.get('worker');
            var worker2 = '';
            
            if (IsShareTable) {
                var _shares = _GetSharePercentOnWQDetailStoreShare(wqb_id);
                if (_shares.length == 1) {
                    worker = _shares[0].sal_no;
                    rec.set('worker', worker);
                }
                else if (_shares.length == 2) {
                    worker = _shares[0].sal_no;
                    worker2 = _shares[1].sal_no;

                    rec.set('worker', worker);
                    rec.set('worker2', worker2);
                }
            }
            else {
                userColl.worker_share_sal.push([worker]);
            }


            var jsonKey = worker;
            if (worker2) {
                jsonKey = worker + '-' + worker2;
            }

            if (!userColl[jsonKey]) {
                userColl[jsonKey] = [];
                userColl.workers.push(jsonKey);

                if (IsShareTable == false) {
                    userColl.worker_share.push([100]);
                }
                else {
                    var _shares2 = _GetSharePercentOnWQDetailStoreShare(wqb_id);
                    if (!worker2) {

                        userColl.worker_share.push([100]);
                        var worker_B = _shares2[0].sal_no;
                        userColl.worker_share_sal.push([worker_B]);
                    }
                    else {
                        var worker_B = _shares2[0].sal_no;
                        var worker_B2 = _shares2[1].sal_no;
                        userColl.worker_share_sal.push([worker_B, worker_B2]);

                        var arrShares = [];
                        for (var ix = 0; ix < _shares2.length; ix++) {
                            arrShares.push(_shares2[ix].share_percent);
                        }

                        if (_shares2.length == 2) {
                            rec.set('share_percent1', _shares2[0].share_percent);
                            rec.set('share_percent2', _shares2[1].share_percent);
                            userColl.worker_share.push(arrShares);
                        }
                        else {
                            alert('为了防止意外行数超出程序控制范围内. 如果见到这个提示框,证明程序异常,请联系吖耀');
                            arrShares.push([50, 50]);
                            rec.set('share_percent1', 50);
                            rec.set('share_percent2', 50);
                        }
                    }
                }
            }

            userColl[jsonKey].push({
                wp_no: rec.get('wp_no'),
                qty_pic: rec.get('qty_pic'),
                qty_pair: rec.get('qty_pair'),
                record_id: rec.getId()
            });
        }
        //console.log({userColl:userColl});
        return userColl;
    }
    
    //加载单据时,计算员工行的分成: 取WQDetailStoreShare的第一笔
    // return [{sal_no :'A4',share_percent:60 }, {sal_no :'A5',share_percent:40 }] 
    var _GetSharePercentOnWQDetailStoreShare = function (wqb_id) {
        var res = [];
        WQDetailStoreShare.findBy(function (qRec) {
            if (qRec.get('wqb_id') == wqb_id) {
                res.push({ sal_no: qRec.get('worker'), share_percent: qRec.get('share_percent') });
            }
        });
        return res;
    }

    //切换分成比率,设置行的share_percent1,share_percent2
    var OnSelectChangeOfSharePercent = function (cbRecords, gridEditingRecord) {
        //alert(Ext.typeOf(records));
        var worker1 = gridEditingRecord.get('row_value');
        var worker2 = gridEditingRecord.get('worker2');

        if (cbRecords.length <= 0) {
            gridEditingRecord.beginEdit();
            gridEditingRecord.set('share_percent1', 100);
            gridEditingRecord.set('share_percent2', 0);
            gridEditingRecord.endEdit();
            ReplaceWQDetailSharePecent(worker1, worker2, 100, 0);
        }
        else {
            var cbRec = cbRecords[0];
            //console.log(cbRec.get('percent1'), cbRec);
            gridEditingRecord.beginEdit();
            gridEditingRecord.set('share_percent1', cbRec.get('percent1'));
            gridEditingRecord.set('share_percent2', cbRec.get('percent2'));
            gridEditingRecord.endEdit();

            ReplaceWQDetailSharePecent(worker1, worker2, cbRec.get('percent1'), cbRec.get('percent2'));
        }
    }
    

    var OnReconfigureLayoutGrid = function () {
        var _fields = [{ name: 'row_type', type: 'string' },
            { name: 'row_value', type: 'string' },
            { name: 'is_salm_out', type: 'bool', defaultValue: false },

            { name: 'worker2', type: 'string' },  //副手
            { name: 'editor_share_percent', type: 'string' },
            { name: 'share_percent1', type: 'number', defaultValue:100 },
            { name: 'share_percent2', type: 'number', defaultValue: 0 }
        ];

        var _coumns = [
            { xtype: 'rownumberer', locked: true },
            { text: '类型', dataIndex: 'row_type', hidden: true, locked: true },
            { text: '-', dataIndex: 'row_value', renderer: RowValueRenderer, locked: true }
        ];
        //分成输入介面
        if (IsShareTable == true) {
            _coumns.push({
                text: '副手', dataIndex: 'worker2', locked: true, editor: {
                    xtype: 'MSearch_Salm',
                    matchFieldWidth: false,
                    allowBlank: true,
                    forceSelection: false
                },
                renderer: GlobalVar.rdSalmName
            });

            
            _coumns.push({
                text: '分成', dataIndex: 'editor_share_percent', locked: true,
                width:70,
                editor: {
                    xtype: 'cbSharePecents',
                    allowBlank: true,
                    forceSelection: true,
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'value',
                    value: 0,
                    listeners: {
                        select: function (combo, records, eOpts) {
                            var sels = WQGrid.getSelectionModel().getSelection();
                            if (sels.length <= 0) {
                                alert('选中行为空!');
                                return;
                            }

                            var sel = sels[0];
                            Ext.Function.defer(function () {
                                OnSelectChangeOfSharePercent(records, sel);
                            }, 100);
                           
                           
                        }
                    }
                },
                renderer: function (v, m, v_rec) {
                    //alert(v_rec.get('share_percent1'));
                    if (v_rec.get('share_percent1') != 100)
                        return v_rec.get('share_percent1') + '/' + v_rec.get('share_percent2');

                    return '';
                }
            });
        }
        
        var isNew = EditingWQ.get('wq_id') < 0;

        for (var i = 0; i < WQPrdtWPStore.getCount(); ++i) {
            var rec = WQPrdtWPStore.getAt(i),
                __wp_no = rec.get('wp_no');

            //已经停用工序 
            // 1.在新建时隐藏, 
            // 2.加载原单是, 无计件数据就隐藏
            if (rec.get('state') == '1') {
                if (isNew) {
                    continue;
                }
                else {
                    //没有这工序的输入. 可以放心过滤掉.
                    if (EditWQGridData[__wp_no].table_sum_qty_pic <= 0 && EditWQGridData[__wp_no].table_sum_qty_pair <= 0)
                        continue;
                }
            }

            if (EditingWQ.get('wp_dep_no') != '000000'){
                //工序部门, 指定工序
                var _WpDepNo = rec.get('dep_no');
                if (_WpDepNo != EditingWQ.get('wp_dep_no')) {
                    if (isNew) {
                        continue;
                    }
                    else {
                        //   检测原因: 可能有些工序换了工序部门,但之前有输入的
                        // 没有这工序的输入. 可以放心过滤掉.
                        if (EditWQGridData[__wp_no].table_sum_qty_pic <= 0 && EditWQGridData[__wp_no].table_sum_qty_pair <= 0)
                            continue;
                    }
                }
            }
            
           
            var fieldName = 'wp_' + __wp_no;
            _fields.push({ name: fieldName, type: 'string' });
            _coumns.push({
                text: rec.get('name'),
                dataIndex: fieldName,
                width: GetColumnWidth(rec.get('name')),
                sortable: false,
                editor: {
                    enableKeyEvents: true,
                    selectOnFocus :true,
                    xtype: 'numberfield',
                    minValue:0.00,
                    decimalPrecision: EditingWQ.get('edit_ut') == 1 ? 2 : 2,
                    listeners: {
                        focus: function (field) {
                            Ext.defer(function () {
                                field.selectText();
                            }, 1);
                        }
                    }
                },
                renderer: RowEditorRenderer
            });
        }

        Ext.define("WQGrid_Layout_Model", {
            extend: 'Ext.data.Model',
            fields: _fields
        });

        WQGridLayoutStore = Ext.create('Ext.data.Store', {
            model: 'WQGrid_Layout_Model',
            data: []
        });

        WQGrid.reconfigure(WQGridLayoutStore, _coumns);


        var lockedGrid = Ext.getCmp(WQGrid.getId() + '-normal');
        //键盘方向键
        var lockCE = lockedGrid.findPlugin('cellediting'); //WQGridCellEditing
        Ext.create('Star_Core_GoodGrid').onGoodLike(lockedGrid, lockCE, false);

        if (lockedGrid.hasListener('cellcontextmenu') == false) {
            
            //单价行右击 调价申请
            lockedGrid.on('cellcontextmenu', function (vthis, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                e.preventDefault();
                var dataIndex = lockedGrid.headerCt.getHeaderAtIndex(cellIndex).dataIndex;

                if (RowTypeIndex.UP == (rowIndex +1) && EditingWQ.get('wq_id') >= 0) {
                    var wp_no = dataIndex.substr('wp_'.length, 10);
                    WQGrid.AskUPPriceMenu.now_wp_no = wp_no.toString();

                    WQGrid.AskUPPriceMenu.showAt(e.getXY());
                }
            });
        }

    }


    var OnLayoutContent = function () {
        WQGrid.setLoading(true);
        var NowEditUt = EditingWQ.get('edit_ut'); 
        //1.单价列表  UP
        //2.个/对 列表 PIC_PAIR
        //3.尺寸完成量 ALL_QTY
        //3_2.尺寸完成量 ALL2_QTY
        //4.本单总量 TABLE_SUM_QTY
        //5.员工 1,2,3..... SALM 
        var rec1Data = { row_type: 'UP', row_value: '' };
        var rec2Data = { row_type: 'PIC_PAIR', row_value: '' };
        var rec3Data = { row_type: 'ALL_QTY', row_value: '' };
        var rec3_2Data = { row_type: 'ALL2_QTY', row_value: '' };
        var rec4Data = { row_type: 'TABLE_SUM_QTY', row_value: '' };
        var rec4_2Data = { row_type: 'UserDeptALL_QTY', row_value: '' };


        for (var i = 0; i < WQPrdtWPStore.getCount() ; ++i) {
            var rec = WQPrdtWPStore.getAt(i);
            var wp_no = rec.get('wp_no');
            var field = 'wp_' + rec.get('wp_no');
            
            rec1Data[field] = NowEditUt == 1 ? EditWQGridData[wp_no].up_pair: EditWQGridData[wp_no].up_pic;
            rec2Data[field] = EditWQGridData[wp_no].pic_num + '个&nbsp/&nbsp' + '对';
            rec3Data[field] = NowEditUt == 1 ? EditWQGridData[wp_no].sum_qty_pair : EditWQGridData[wp_no].sum_qty_pic;
            rec3_2Data[field] = NowEditUt == 1 ? EditWQGridData[wp_no].sum_all_qty_pair : EditWQGridData[wp_no].sum_all_qty_pic;
            rec4Data[field] = NowEditUt == 1 ? EditWQGridData[wp_no].table_sum_qty_pair : EditWQGridData[wp_no].table_sum_qty_pic;
            rec4_2Data[field] = NowEditUt == 1 ? EditWQGridData[wp_no].sum_user_dept_all_qty_pair : EditWQGridData[wp_no].sum_user_dept_all_qty_pic;
        }

        var rec1 = Ext.create('WQGrid_Layout_Model', rec1Data);
        var rec2 = Ext.create('WQGrid_Layout_Model', rec2Data);
        var rec3 = Ext.create('WQGrid_Layout_Model', rec3Data);
        var rec3_2 = Ext.create('WQGrid_Layout_Model', rec3_2Data);
        var rec4 = Ext.create('WQGrid_Layout_Model', rec4Data);
        var rec4_2 = Ext.create('WQGrid_Layout_Model', rec4_2Data);

        //Ext.suspendLayouts();  Ext.resumeLayouts();
        WQGridLayoutStore.removeAll();
        WQGridLayoutStore.add(rec1, rec2, rec3_2, rec3, rec4, rec4_2);

        var workerWQList = {};
        //if (EditingWQ.get('wq_id') > 0) { //去掉原因, 支持本单刷新..
        workerWQList = FetchWQDetailToWorkerList();
        //}
        if (IsShareTable == false) {
            AddSalmRecordOnNotShare(workerWQList);
        }
        else {
            AddSalmRecordOnShare(workerWQList);
        }
        
        WQGrid.setLoading(false);
    }

    var AddSalmRecordOnNotShare = function (workerWQList) {
        var NowEditUt = EditingWQ.get('edit_ut');
        //加载生产部门现在的员工
        for (var i = 0; i < WQUserSalmStore.getCount() ; i++) {
            var salmRec = WQUserSalmStore.getAt(i);
            var sal_no = salmRec.get('user_no');
            var rec5Data = { row_type: 'SALM', row_value: sal_no, share_percent1: 100, share_percent2: 0 };

            if (workerWQList[sal_no] && workerWQList[sal_no].length > 0) {
                for (var j = 0; j < workerWQList[sal_no].length; j++) {
                    var field = 'wp_' + workerWQList[sal_no][j]['wp_no'];

                    rec5Data[field] = NowEditUt == 1 ? workerWQList[sal_no][j]['qty_pair'] : workerWQList[sal_no][j]['qty_pic'];
                }
                workerWQList.loadeds.push(sal_no);
            }

            var rec5 = Ext.create('WQGrid_Layout_Model', rec5Data);
            WQGridLayoutStore.add(rec5);

            ReplaceWQDetailSharePecent(rec5Data.row_value, '', 100, 0);
        }

        //可能有部份员工没有加载到,  1.换了部门 2.离职的
        for (var i = 0; i < workerWQList.workers.length; i++) {
            var _worker = workerWQList.workers[i];
            //未加载的员工行
            if (workerWQList.loadeds.indexOf(_worker) < 0) {
                var rec5_2Data = { row_type: 'SALM', row_value: _worker, is_salm_out: true, share_percent1: 100, share_percent2:0 };
                //可能会是员工组合
                var _workerList = _worker.split('-');
                if (_workerList.length == 2) {
                    rec5_2Data['row_value'] = _workerList[0];
                    rec5_2Data['worker2'] = _workerList[1];

                    var sp = workerWQList.worker_share[i];
                    rec5_2Data['share_percent1'] = sp[0];
                    rec5_2Data['share_percent2'] = sp[1];
                    
                }

                if (workerWQList[_worker] && workerWQList[_worker].length > 0) {
                    for (var j = 0; j < workerWQList[_worker].length; j++) {
                        var field = 'wp_' + workerWQList[_worker][j]['wp_no'];
                        rec5_2Data[field] = NowEditUt == 1 ? workerWQList[_worker][j]['qty_pair'] : workerWQList[_worker][j]['qty_pic'];
                    }
                    workerWQList.loadeds.push(_worker);
                }
                //console.log({ _worker: _worker, rec5_2Data: rec5_2Data });
                var rec5_2 = Ext.create('WQGrid_Layout_Model', rec5_2Data);
                WQGridLayoutStore.add(rec5_2);

                ReplaceWQDetailSharePecent(rec5_2Data.row_value, rec5_2Data.worker2, rec5_2Data.share_percent1, rec5_2Data.share_percent2);
            }
        }
    }

    var AddSalmRecordOnShare = function (workerWQList) {
        //按部门的 员工分成组合.Json来加载
        var NowEditUt = EditingWQ.get('edit_ut');
        var user_dep_no = WQForm.getComponent('user_dep_no').getValue();
        var salm组合Store = WpConfig.GetDepSalmSharePercent组合(user_dep_no);
        var __fn123 = function () {
            if (salm组合Store.getCount() <= 0) {
                AddSalmRecordOnNotShare(workerWQList);
            }
            else {
                for (var ix = 0; ix < salm组合Store.getCount() ; ix++) {
                    var shareRec = salm组合Store.getAt(ix);
                    var 员工1 = shareRec.get('员工1');
                    var 员工2 = shareRec.get('员工2');
                    var 比率1 = shareRec.get('比率1');
                    var 比率2 = shareRec.get('比率2');
                    var rec5Data = { row_type: 'SALM', row_value: 员工1, worker2: 员工2, share_percent1: 比率1, share_percent2: 比率2 };
                    var jsonKey = 员工1;
                    if (员工2) {
                        jsonKey = 员工1 + '-' + 员工2;
                    }
                    //console.log('加载' + jsonKey);

                    if (workerWQList[jsonKey] && workerWQList[jsonKey].length > 0) {
                        var index1 = workerWQList.workers.indexOf(jsonKey);
                        if (index1 < 0) {
                            alert('程序异常请联系吖耀!');
                        }
                        var sharePercents = workerWQList.worker_share[index1];
                        rec5Data.share_percent1 = sharePercents[0];
                        if (员工2) {
                            rec5Data.share_percent2 = sharePercents[1];
                        }

                        for (var j = 0; j < workerWQList[jsonKey].length; j++) {
                            var field = 'wp_' + workerWQList[jsonKey][j]['wp_no'];

                            rec5Data[field] = NowEditUt == 1 ? workerWQList[jsonKey][j]['qty_pair'] : workerWQList[jsonKey][j]['qty_pic'];
                        }
                        workerWQList.loadeds.push(jsonKey);
                    }

                    var rec5 = Ext.create('WQGrid_Layout_Model', rec5Data);
                    WQGridLayoutStore.add(rec5);

                    ReplaceWQDetailSharePecent(员工1, 员工2, rec5Data.share_percent1, rec5Data.share_percent2);
                }

                //没被加载的数量
                for (var iy = 0; iy < workerWQList.workers.length; iy++) {
                    var jsonKey = workerWQList.workers[iy];

                    if (workerWQList.loadeds.indexOf(jsonKey) < 0) {
                        //console.log('补加载' + jsonKey);
                        
                        var sharePercents = workerWQList.worker_share[iy],
                            shareWorkers = workerWQList.worker_share_sal[iy];

                        var rec5_2Data = {
                            row_type: 'SALM',
                            row_value: shareWorkers[0],
                            worker2: shareWorkers.length == 2 ? shareWorkers[1] : '',
                            share_percent1: sharePercents[0],
                            share_percent2: sharePercents.length == 2 ? sharePercents[1] : '',
                        };

                        for (var jy = 0; jy < workerWQList[jsonKey].length; jy++) {
                            var field = 'wp_' + workerWQList[jsonKey][jy]['wp_no'];
                            rec5_2Data[field] = NowEditUt == 1 ? workerWQList[jsonKey][jy]['qty_pair'] : workerWQList[jsonKey][jy]['qty_pic'];
                        }

                        workerWQList.loadeds.push(jsonKey);
                        var rec5_2 = Ext.create('WQGrid_Layout_Model', rec5_2Data);
                        WQGridLayoutStore.add(rec5_2);

                        ReplaceWQDetailSharePecent(rec5_2Data.row_value, rec5_2Data.员工worker2, rec5_2Data.share_percent1, rec5_2Data.share_percent2);
                    }
                }
            }
        }

        salm组合Store.load({
            scope: this,
            callback: function () {
                __fn123();
            }
        });
        
    }


    var SwitchUTIng = false;
    
    //切换显示的单位
    var OnSwitchEditUt = function () {
        //这里有Bug
        //console.log([WQGrid.plugins, WQGrid.findPlugin('cellediting')]);
        //WQGrid.findPlugin('cellediting').completeEdit();

        SwitchUTIng = true;
        ////GenerateEditWQGridData(); 为何有时 no function toString????
        ////console.log( EditWQGridData);
        ////alert('EditWQGridData');
        OnLayoutContent();
        UpdateTableSumAndFinsishRecord();
        SwitchUTIng = false;
    }

    var OnWQGridLayout = function () {
        if (!EditingWQ.get('size_id')) {
            alert('请先选择好计划单与尺寸');
            return false;
        }
        WQGrid.setLoading(true);
        OnLoadLayoutData(function (json) {
            FitStoreFromJson(json);
            
            OnReconfigureLayoutGrid();
            
            OnLayoutContent();
            
            WQGrid.setDisabled(false);
        });
    }

    var OnWQGridBeforeEdit = function (editor, e) {
        //数量(尺寸限制) ||   副手 || 分成率                                                                    
        if (e.record.get('row_type') == 'SALM' ){
            if (e.field.indexOf("wp_") == 0) {
                
                var now_wp_no = e.field.substr('wp_'.length, 10);
                //尺寸限制
                if (EditWQGridData[now_wp_no].is_size_control == true) {
                    if (EditWQGridData[now_wp_no].sizes.indexOf(EditingWQ.get('size')) < 0) {
                        return false;
                    }
                }

                return true;
            }
            else if (e.field == 'worker2' || e.field == 'editor_share_percent') {
                return true;
            }
        }


        return false;
    }

    var CancelUpdateA = false;

    //求本单的工序完成量
    var SumDetailWpQty = function (SignWpNo) {
        var _qty_pic = 0,
            _qty_pair = 0;
        WQDetailStore.findBy(function (_wd_rec) {
            if (_wd_rec.get('wp_no') == SignWpNo) {
                _qty_pic += _wd_rec.get('qty_pic') || 0;
                _qty_pair += _wd_rec.get('qty_pair') || 0;
            }
        });

        return [_qty_pic, _qty_pair];
    }

    ///更新完成量
    var UpdateTableSumAndFinsishRecord = function (SignWpNo) {
        if (CancelUpdateA == true) {
            return;
        }

        var isNewing = EditingWQ.get('wq_id') < 0,
            edit_ut = EditingWQ.get('edit_ut'),
            rec1 = WQGridLayoutStore.getAt(RowTypeIndex.TABLE_SUM_QTY-1),
            rec2 = WQGridLayoutStore.getAt(RowTypeIndex.ALL_QTY - 1),
            rec3 = WQGridLayoutStore.getAt(RowTypeIndex.ALL2_QTY - 1),
            rec4 = WQGridLayoutStore.getAt(RowTypeIndex.UserDeptALL_QTY - 1);
        rec1.beginEdit();
        rec2.beginEdit();
        rec3.beginEdit();
        rec4.beginEdit();
        for (var i = 0; i < WQPrdtWPStore.getCount() ; i++) {
            var rec = WQPrdtWPStore.getAt(i);
            var wp_no = rec.get('wp_no').toString();
            var field = 'wp_' + rec.get('wp_no');
            //指定要更新的WpNo
            if (SignWpNo && wp_no != SignWpNo)
                continue;
           
            var _qty_pic = 0,
                _qty_pair = 0;
            var _SumQty = SumDetailWpQty(wp_no);

            _qty_pic = _SumQty[0];
            _qty_pair = _SumQty[1];

            var qty_this = edit_ut == 1 ? _qty_pair : _qty_pic;
            var orignFinishQty = 0;
            var orignFinish_AllQty = 0;
            if (isNewing) {
                orignFinishQty = edit_ut == 1 ? (EditWQGridData[wp_no].sum_qty_pair || 0) : (EditWQGridData[wp_no].sum_qty_pic || 0);
                orignFinish_AllQty = edit_ut == 1 ? (EditWQGridData[wp_no].sum_all_qty_pair || 0) : (EditWQGridData[wp_no].sum_all_qty_pic || 0);
                orignUserDeptFinish_AllQty = edit_ut == 1 ? (EditWQGridData[wp_no].sum_user_dept_all_qty_pair || 0) : (EditWQGridData[wp_no].sum_user_dept_all_qty_pic || 0);
            }
            else{
                //修改单据,已完成包含本单的量.. 所以要减少加载时的原工序完成量
                orignFinishQty = edit_ut == 1 ?
                    ((EditWQGridData[wp_no].sum_qty_pair || 0) - (EditWQGridData[wp_no].table_sum_qty_pair || 0)) :
                    ((EditWQGridData[wp_no].sum_qty_pic || 0) - (EditWQGridData[wp_no].table_sum_qty_pic || 0));

                orignFinish_AllQty = edit_ut == 1 ?
                    ((EditWQGridData[wp_no].sum_all_qty_pair || 0) - (EditWQGridData[wp_no].table_sum_qty_pair || 0)) :
                    ((EditWQGridData[wp_no].sum_all_qty_pic || 0) - (EditWQGridData[wp_no].table_sum_qty_pic || 0));

                orignUserDeptFinish_AllQty = edit_ut == 1 ?
                    ((EditWQGridData[wp_no].sum_user_dept_all_qty_pair || 0) - (EditWQGridData[wp_no].table_sum_qty_pair || 0)) :
                    ((EditWQGridData[wp_no].sum_user_dept_all_qty_pic || 0) - (EditWQGridData[wp_no].table_sum_qty_pic || 0));
            }
            
            rec1.set(field, qty_this);
            rec2.set(field, orignFinishQty + qty_this);
            rec3.set(field, orignFinish_AllQty + qty_this);
            rec4.set(field, orignUserDeptFinish_AllQty + qty_this);
            
            rec1.commit();
            rec2.commit();
            rec3.commit();
            rec4.commit();
            rec1.endEdit();
            rec2.endEdit();
            rec3.endEdit();
            rec4.endEdit();
        }
    }

    //是否高于,最高上限对数,返回高于的对数 100, 输了102对, 返回2
    var MoreThanCeliQtyPair = function (wp_no, eValue, editingWQDetailRecord) {
        var isNewing = EditingWQ.get('wq_id') < 0,
            edit_ut = EditingWQ.get('edit_ut');

        var orignFinishQty = 0;
        var orignFinish_AllQty = 0;
        if (isNewing) {
            orignFinishQty =  EditWQGridData[wp_no].sum_qty_pair || 0;
            orignFinish_AllQty =  EditWQGridData[wp_no].sum_all_qty_pair || 0;
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

        //alert(orignFinishQty + ' / ' + orignFinish_AllQty + '] - ' + _qty_pair + ' - ' + eValue + ' - [' + EditingWQ.get('plan_size_qty') + '/' + EditingWQ.get('plan_sizes_qty'));
        //alert((orignFinish_AllQty + _qty_pair) + ' 3333 ' + EditingWQ.get('plan_sizes_qty'));

        _qty_pair += eValue;
        //alert((orignFinish_AllQty + _qty_pair) + ' 555 ' + EditingWQ.get('plan_sizes_qty'));
        //var thisSumQtys = SumDetailWpQty(wp_no);
        if ((orignFinish_AllQty + _qty_pair) > EditingWQ.get('plan_sizes_qty')) {
            
            alert('工序对数, 超过计划单的总的对数!(' + EditingWQ.get('plan_sizes_qty') + ')');
            return false;
        }
        ///在限制尺寸数量提前下
        //console.log({ orignFinishQty: orignFinishQty, _qty_pair: _qty_pair, plan_size_qty: EditingWQ.get('plan_size_qty') });
        if (EditWQGridData[wp_no].wq_type == 'size_qty' && (orignFinishQty + _qty_pair) > EditingWQ.get('plan_size_qty')) {
            alert('工序对数, 超过计划单计划尺寸对数!(' + EditingWQ.get('plan_size_qty') + ')');
            return false;
        }

        return true;
    }

    var ReplaceWQDetailWorker2 = function (worker1, originalWorker2, nowWorker2) {
        WQDetailStore.each(function (_rec) {
            if (_rec.get('worker') == worker1 && _rec.get('worker2') == originalWorker2) {
                _rec.set('worker2', nowWorker2);
            }
        });
    }

    var ReplaceWQDetailSharePecent = function (worker1, worker2, share_percent1, share_percent2) {
        WQDetailStore.each(function (_rec) {
            if (_rec.get('worker') == worker1 && _rec.get('worker2') == worker2) {
                _rec.set('share_percent1', share_percent1);
                _rec.set('share_percent2', share_percent2);
            }
        });
    }

    var OnWQGridEdit = function (editor, e) {
        //保持 WQDetailStore 与 实时编辑一致. 用于直接提交参数
        if (SwitchUTIng == false && e.record.get('row_type') == 'SALM' && e.field.indexOf("wp_") == 0) {
            //因model 是用 string,非数量类型,所以要"" null转换一下为0
            e.originalValue = e.originalValue || 0;
            e.value = e.value || 0;
            
            if (e.originalValue == e.value )
                return;
            
            var wp_no = e.field.substr('wp_'.length, 10),
                sal_no = e.record.get('row_value'),
                worker2 = e.record.get('worker2'),
                edit_ut = EditingWQ.get('edit_ut');

            var hadRecord = false;
            var wqDetailRecord = null,
                wqOldQtyPic = 0.00,
                wqOldQtyPair = 0.00;

            WQDetailStore.each(function (_rec) {
                if (_rec.get('worker') == sal_no
                        && _rec.get('worker2') == worker2
                        && _rec.get('wp_no') == wp_no){

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
                if (IsShareTable) {
                    wqDetailRecord.set('worker2', worker2);
                    wqDetailRecord.set('share_percent1', e.record.get('share_percent1'));
                    wqDetailRecord.set('share_percent2', e.record.get('share_percent2'));
                }
                //console.log('ADD_');
            }


            ////判断是否超录 
            if (e.AbortOverQtyPairCheck != true) {
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
                    if (isAdminRoot == true) {
                        alert("数量已超录, 但管理员有权限处理,但也请好好控制!");
                    }
                    else if (有超数权限 == true) {
                        alert("数量已超录, 但你有权限超录,但也请好好控制!");
                    }
                    else {
                        e.record.set(e.field, e.originalValue || 0);
                        wqDetailRecord.set('qty_pic', wqOldQtyPic);
                        wqDetailRecord.set('qty_pair', wqOldQtyPair);
                    }
                }
            }

            if (e.AbortUpdateFinishInfo != true) {
                UpdateTableSumAndFinsishRecord(wp_no);
            }
        }
        
        //切换副员时,控制不能有相同的员工组合.
        if (SwitchUTIng == false && e.record.get('row_type') == 'SALM' && e.field == 'worker2') {
            var worker1 = e.record.get('row_value');
            var originalWorker2 = e.originalValue;
            var nowWorker2 = e.value;

            if (_IsExistedWorkerPartnetCount(worker1, nowWorker2) > 1) {
                e.record.set('worker2', originalWorker2);
                alert('已存在相同的员工组合!');
                return;
            }

            //替换原有的伙伴组合
            ReplaceWQDetailWorker2(worker1, originalWorker2, e.value);

            if (e.record.get('worker2')) {
                //如果第一次选副员工,没有设置分成比率的,自动设第一默认的分成
                if (e.record.get('share_percent2') == 0) {
                    var wpSSet = WpConfig.GetShareSetting()[0];
                    e.record.set('share_percent1', wpSSet.percent1);
                    e.record.set('share_percent2', wpSSet.percent2);
                    ReplaceWQDetailSharePecent(worker1, nowWorker2, wpSSet.percent1, wpSSet.percent2);
                }
            }
            else {
                e.record.set('share_percent1',100);
                e.record.set('share_percent2', 0);
                ReplaceWQDetailSharePecent(worker1, nowWorker2, 100, 0);
            }
        }
    }
    
    var OnPasteColumn = function (pasteDataIndex) {
        if (!WQGrid.CopyIngjx_no || !WQGrid.CopyColumn) {
            alert('你还没有复制列!');
            return;
        }

        if (WQGrid.CopyIngjx_no != EditingWQ.get('jx_no')) {
            alert('复制列是其他计薪单!');
            return;
        }

        if (WQGrid.CopyColumn.dataIndex == pasteDataIndex) {
            alert('复制不能与粘贴行相同!');
            return;
        }

        OnClearColumn(pasteDataIndex);
        //CancelUpdateA = true;
        var cnt = WQGridLayoutStore.getCount();
        for (var i = 0; i < cnt; i++) {
            var _rec = WQGridLayoutStore.getAt(i);
            if (_rec.get('row_type') == 'SALM') {
                var val = Number(_rec.get(WQGrid.CopyColumn.dataIndex));
                var oldValue = Number(_rec.get(pasteDataIndex));
                if (oldValue == val) {
                    continue;
                }
                
                _rec.set(pasteDataIndex, val);
                OnWQGridEdit(null, { record: _rec, field: pasteDataIndex, originalValue: oldValue, value: val, AbortUpdateFinishInfo: true });
            }
        }

        var wp_no = pasteDataIndex.substr('wp_'.length, 10)
        UpdateTableSumAndFinsishRecord(wp_no);
        //CancelUpdateA = false;
        //var wp_no = WQGrid.CopyColumn.dataIndex.substr('wp_'.length, 10);
        //UpdateTableSumAndFinsishRecord(wp_no);

        //var PasteIng = false;   //复制单价列时&& PasteIng == false
        //PasteIng = true;
        //PasteIng = truef
    }

    var OnClearColumn = function (pasteDataIndex) {
        for (var i = 0; i < WQGridLayoutStore.getCount() ; i++) {
            var _rec = WQGridLayoutStore.getAt(i);
            if (_rec.get('row_type') == 'SALM') {
                var val = 0.00;
                var oldValue = Number(_rec.get(pasteDataIndex));
                if (oldValue == val) {
                    continue;
                }

                _rec.set(pasteDataIndex, val);
                OnWQGridEdit(null, { record: _rec, field: pasteDataIndex, originalValue: oldValue, value: val, AbortUpdateFinishInfo: true, AbortOverQtyPairCheck: true });
            }
        }
    }

    var WQGridCellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: OnWQGridBeforeEdit,
            edit: OnWQGridEdit
        }
    });

    var WQGrid = Ext.create('Ext.grid.Panel', {
        region: 'center',
        enableLocking: true,
        enableColumnMove: false,
        enableColumnHide: false,
        sortableColumns: false,
        columnLines: true,
        rowLines:true,
        layout: 'fit',
        lockedGridConfig : 'normal',
        viewConfig :{
            getRowClass: function (rec, rowIndex, rowParams, store) {
                if (rec.get('is_salm_out') == true) {
                    return  'salm_out';
                }
                else if (rec.get('row_type') == 'UP') {
                    return 'yellowRow';
                }
                else if (rec.get('row_type') == 'PIC_PAIR') {
                    return 'yellowRow';
                }
                else if (rec.get('row_type') == 'ALL_QTY') {
                    return 'disabled_column';
                }
                else if (rec.get('row_type') == 'TABLE_SUM_QTY') {
                    return 'disabled_column';
                }
            }
        },
       
        plugins: [
           WQGridCellEditing
        ],
        store: WQGridLayoutStore,
        columns: [
            { text: '列类型', dataIndex: 'type' }
        ],
        selType: 'cellmodel',
        bbar: [
            {
                text: '保&nbsp&nbsp&nbsp&nbsp存', icon: '../JS/resources/MyIcon/icon_save.png', itemId:'btnSave', height: 30, width: 80, handler:
                  function () {
                      
                      WQGrid.btnSave.setDisabled(true);
                      
                      WQGrid.setLoading(true);
                      if (EditingWQ.get('wq_id') < 0) {

                          fnCommonCreateLastNo('JX', WQForm.getComponent('jx_no'), function () { OnFormSave(); });
                          return;
                      }

                      OnFormSave();
                  }
            },
            '-',
            { text: '删&nbsp&nbsp&nbsp&nbsp除', icon: '../JS/resources/MyIcon/icon_delete.png', itemId: 'btnDelete', height: 30, width: 80, handler: OnFormDelete },
            {
                text: '添加行',  height: 30, width: 80, hidden: !IsShareTable, handler: function () {
                    fnShowDialogToNewSalmRecord();
                }
            },
            {
                text: '查询面板',
                icon: '../JS/resources/MyIcon/search.png',
                height: 30, width: 90,
                handler: function () {
                    SearchPanel.expand();
                }
            },
            {
                xtype: 'button',
                height: 30,
                text: '导&nbsp&nbsp出',
                icon: '../JS/resources/MyImages/ms_excel.png',
                margin: '0 5 0 5',
                handler: function () {

                    console.log("normal" + WQGrid.getId() + "--" + Ext.getCmp(WQGrid.getId() + '-normal').getId());
                    var sheetName = '';
                    if (PlanViewHelper.IsSumByPlanView)
                        sheetName += '统计-';
                    else
                        sheetName += '明细-';

                    sheetName +=  WQForm.getComponent('plan_no').getValue()
                                    + '-' + WQForm.getComponent('user_dep_no').getValue()
                                    + '-' + WQForm.getComponent('wp_dep_no').getValue();

                    GlobalVar.ToExcel(WQGrid, sheetName, window, {
                        normalGrid: Ext.getCmp(WQGrid.getId() + '-normal'),
                        lockGrid: Ext.getCmp(WQGrid.getId() + '-locked')
                    }, fnBeforeGenarateExcel);


                }
            }
        ],
        listeners: {
            boxready: function () {
                this.btnSave = this.getDockedComponent(0).getComponent('btnSave');
                this.btnDelete = this.getDockedComponent(0).getComponent('btnDelete');
                
                ///console.log(this.btnSave);
                if (IsShareTable == true && !WQGrid.containerMenu) {
                    WQGrid.containerMenu = Ext.create('Ext.menu.Menu', {
                        width: 100,
                        margin: '0 0 10 0',
                        floating: true,
                        items: [{
                            text: '新建员工行',
                            handler: function () {
                                fnShowDialogToNewSalmRecord();
                            }
                        }]
                    });
                }

                if (!WQGrid.AskUPPriceMenu) {
                    WQGrid.AskUPPriceMenu = Ext.create('Ext.menu.Menu', {
                        now_wp_no : '',
                        width: 100,
                        margin: '0 0 10 0',
                        floating: true,
                        items: [{
                            text: '调价申请',
                            handler: function () {
                                WQGrid.InitAskUPPriceWindow();
                            }
                        }]
                    });
                }
            },
            headercontextmenu: function( ct, column, e, t, eOpts ){
                e.preventDefault();
                if (!WQGrid.headerMenu) {
                    WQGrid.CopyIngWQ = '';
                    WQGrid.CopyColumn = column;

                    WQGrid.headerMenu = Ext.create('Ext.menu.Menu', {
                        width: 100,
                        margin: '0 0 10 0',
                        items: [{
                            text: '复制列',
                            handler: function () {
                                WQGrid.CopyIngjx_no = EditingWQ.get('jx_no');
                                WQGrid.CopyColumn = WQGrid.headerMenu.FocusIngColumn;
                                //alert(WQGrid.CopyIngjx_no + ' ' + WQGrid.CopyColumn.dataIndex);
                            }
                        }, {
                            text: '粘贴列',
                            handler: function () {
                                
                                OnPasteColumn(WQGrid.headerMenu.FocusIngColumn.dataIndex);
                            }
                        }, {
                            text: '清空列',
                            handler: function () {
                                OnClearColumn(WQGrid.headerMenu.FocusIngColumn.dataIndex);
                            }
                        }]
                    });
                }

                WQGrid.headerMenu.FocusIngColumn = column;
                WQGrid.headerMenu.showAt(e.getXY());
            },
            itemcontextmenu: function (vthis, record, item, index, e, eOpts) {//itemcontextmenu( this, record, item, index, e, eOpts )
                e.preventDefault();
                if (IsShareTable == true && !WQGrid.containerMenu) {
                    WQGrid.containerMenu.showAt(e.getXY());
                }
            },
            containercontextmenu: function (vthis, e, eOpts) {
                e.preventDefault();
            }
        }
    });

    

    // pic_pair  PIC_PAIR 个对数
    //up_pic  decimal(18, 6),   --原工序单价(个),
    //up_pair   decimal(18, 6), --原工序单价(对),
    //ask_reason  varchar(500), --申请原因
    //ask_up_pic  decimal(18, 6),   --申请单价(个),
    //ask_up_pair   decimal(18, 6), --申请单价(对),

    WQGrid.InitAskUPPriceWindow = function () {
        var win = Ext.create('Ext.window.Window', {
            closeAction: 'hide',
            title: '调价申请',
            //height: 200,
            //width: 400,
            layout: 'fit',
            items: WQGrid.AskUPPriceFrom,
            listeners: {
                show: function () {
                    var ask_id = WQGrid.AskUPPriceFrom.getForm().getValues().ask_id;
                    if (ask_id == -1) {
                        WQGrid.AskUPPriceFrom.queryById('ask_reason').focus(false, true);
                    }
                }
            }
        });

        WQGrid.AskUPPriceFrom.win = win;
        SetAskFromValues(WQGrid.AskUPPriceMenu.now_wp_no);
        win.show();

        ///已提交的审核,不能按 "提交申请"
        var btnTaskCheck = WQGrid.AskUPPriceFrom.queryById('btnTaskCheck');

        var ask_id = WQGrid.AskUPPriceFrom.getForm().getValues().ask_id;
        var boxPic = WQGrid.AskUPPriceFrom.queryById('ask_up_pic');
        var boxPair = WQGrid.AskUPPriceFrom.queryById('ask_up_pair');
        var boxReason = WQGrid.AskUPPriceFrom.queryById('ask_reason');
        var enable = ask_id == -1;
        
        btnTaskCheck.setDisabled(!enable);
        boxPic.setReadOnly(!enable);
        boxPair.setReadOnly(!enable);
        boxReason.setReadOnly(!enable);
    }

    //[check_state] [varchar](2) NULL,
    //[check_man] [varchar](40) NULL,
    //check_msg   varchar(500)  --审核员留言
    WQGrid.AskUPPriceFrom = Ext.create('Ext.form.Panel', {
        win: null,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
        items: [
            {
                xtype: 'panel',
                region: 'north',
                layout: 'anchor',
                margin: 5,
                defaults:{
                    margin: 3,
                    labelAlign:'right'
                },
                items: [
                    {
                        readOnly: true,
                        fieldLabel: '审核状态',
                        name: 'check_state',
                        itemId: 'check_state',
                        xtype: 'checkStatusComboBox',
                        anchor: '50%'
                    },
                    {
                        readOnly: true,
                        fieldLabel: '当前审核人',
                        xtype: 'MSearch_Salm',
                        name: 'check_man',
                        itemId: 'check_man',
                        colspan: 2,
                        anchor: '50%'
                    },
                    {
                        readOnly: true,
                        xtype:'textareafield',
                        fieldLabel: '审核员留言',
                        name: 'check_msg',
                        itemId: 'check_msg',
                        height : 50,
                        anchor: '88%'
                    }
                ]
            },
            {
                xtype: 'panel',
                region : 'center',
                layout: {
                    type: 'table',
                    columns: 2
                },
                items: [{
                    xtype: 'fieldset',
                    title: '原始信息',
                    defaultType: 'textfield',
                    layout: 'anchor',
                    margin: 5,
                    defaults: {
                        anchor: '100%',
                        hideEmptyLabel: false,
                        decimalPrecision: 6,
                        spinUpEnabled: false,
                        spinDownEnabled: false
                    },
                    items: [{
                        hidden: true,
                        fieldLabel: '货号',
                        name: 'prd_no',
                        itemId: 'prd_no',
                        readOnly: true,
                        allowBlank: false,
                        colspan: 2
                    },{
                        hidden: true,
                        fieldLabel: '工序号',
                        name: 'wp_no',
                        itemId: 'wp_no',
                        readOnly: true,
                        allowBlank: false,
                        colspan: 2
                    }, {
                        readOnly: true,
                        fieldLabel: '工序',
                        name: 'wp_name',
                        itemId: 'wp_name',
                        readOnly: true,
                        allowBlank: false,
                        colspan: 2
                    },
                    {
                        fieldLabel: '个数(对)',
                        name: 'pic_pair',
                        itemId: 'pic_pair',
                        xtype: 'numberfield',
                        readOnly: true,
                        allowBlank: false
                    }, {
                        fieldLabel: '原单价(个)',
                        name: 'up_pic',
                        itemId: 'up_pic',
                        xtype: 'numberfield',
                        readOnly: true,
                        minValue: 0,
                        allowBlank: false
                    },
                    {
                        fieldLabel: '原单价(对)',
                        name: 'up_pair',
                        itemId: 'up_pair',
                        xtype: 'numberfield',
                        minValue: 0,
                        readOnly: true,
                        allowBlank: false
                    }]
                },
                {
                    xtype: 'fieldset',
                    title: '调价信息',
                    defaultType: 'textfield',
                    layout: 'anchor',
                    margin: '0 5 0 0',
                    defaults: {
                        anchor: '100%',
                        hideEmptyLabel: false,
                        decimalPrecision: 6,
                        keyNavEnabled: false
                    },
                    items: [{
                        hidden: true,
                        fieldLabel: 'ask_id',
                        name: 'ask_id',
                        itemId: 'ask_id',
                        readOnly: true
                    },{
                        fieldLabel: '申请日期',
                        name: 'n_dd',
                        itemId: 'n_dd',
                        xtype: 'datefield',
                        format: 'Y/m/d',
                        readOnly: true,
                        colspan: 2
                    },
                        {
                            fieldLabel: '申请原因',
                            name: 'ask_reason',
                            itemId: 'ask_reason',
                            allowBlank: false,
                            colspan: 2
                        },
                        {
                            fieldLabel: '申请单价(个)',
                            name: 'ask_up_pic',
                            itemId: 'ask_up_pic',
                            xtype: 'numberfield',
                            minValue: 0,
                            allowBlank: false,
                            anchor: '50%',
                            listeners: {
                                change: function (vthis, newValue, oldValue, eOpts) {
                                    if (!vthis._InChanging && vthis.isValid() == true) {
                                        _UpdateAsk_up_pic(vthis.name);
                                    }
                                }
                            }
                        },
                        {
                            fieldLabel: '申请单价(对)',
                            name: 'ask_up_pair',
                            itemId: 'ask_up_pair',
                            xtype: 'numberfield',
                            minValue: 0,
                            allowBlank: false,
                            anchor: '50%',
                            
                            listeners: {
                                change: function (vthis, newValue, oldValue, eOpts) {
                                    if (!vthis._InChanging && vthis.isValid() == true) {
                                        _UpdateAsk_up_pic(vthis.name);
                                    }
                                }
                            }
                        }]
                }]
            }
        ],
        buttons: [{
            text: '提交申请',
            itemId:'btnTaskCheck',
            handler: function () {
                if (WQGrid.AskUPPriceFrom.getForm().isValid()) {
                    var formValue2s = WQGrid.AskUPPriceFrom.getForm().getValues();
                    formValue2s.action = 'Ask';

                    formValue2s.check_no = 'WQ_WPNO';
                    formValue2s.jx_no = WQForm.getComponent('jx_no').getValue();

                    var cbFn = function (respondText) {
                        WQGrid.AskUPPriceFrom.win.close();
                        _AfterCheckUpdateWQGridUPRow();
                    }

                    CheckFlowHelper.AskPost(formValue2s, cbFn, WQGrid);
                }
            }
        }, {
            text: '关闭',
            handler: function () {
                WQGrid.AskUPPriceFrom.win.close();
            }
        }]
    });

  
    //WQFlowCheckList
    var JXCheckStore = Ext.create('Ext.data.Store', {
        model: 'Model_AskPrice',
        data: []
    });

    var _FindWPCheck = function (wp_no) {
        var rec = null;
        JXCheckStore.findBy(function (qRec) {
            if (qRec.get('wp_no') == wp_no) {
                rec = qRec;
            }
        });

        return rec;
    }

    //审核完成更新JXCheckStore,再渲染单价行颜色 
    var _AfterCheckUpdateWQGridUPRow = function () {
        var jx_no = WQForm.getComponent('jx_no').getValue();
        CheckFlowHelper.GetAskListByJX(jx_no, function (text) {
            var json = Ext.JSON.decode(text);
            JXCheckStore.removeAll();
            JXCheckStore.add(json);

            //var wp_no = WQGrid.AskUPPriceFrom.getForm().getValues().wp_no;
            //alert(wp_no);
            //var fieldName = 'wp_' + wp_no;
            var upRec = WQGridLayoutStore.getAt(RowTypeIndex.UP -1);
            upRec.beginEdit();
            //upRec.set(fieldName, upRec.get(fieldName)+ ' ');
            upRec.endEdit();
            upRec.commit();

        }, WQGrid);
    }

    var _UpdateAsk_up_pic = function (changeField) {
        var values = WQGrid.AskUPPriceFrom.getForm().getValues();
        var boxPic = WQGrid.AskUPPriceFrom.queryById('ask_up_pic');
        var boxPair = WQGrid.AskUPPriceFrom.queryById('ask_up_pair');

        if (changeField == 'ask_up_pair') {
            boxPic._InChanging = true;
            boxPic.setValue(values.ask_up_pair / values.pic_pair);
            boxPic._InChanging = false;
        }
        else if (changeField == 'ask_up_pic') {
            boxPair._InChanging = true;
            boxPair.setValue(values.ask_up_pic * values.pic_pair);
            boxPair._InChanging = false;
        }
    }

    
    var SetAskFromValues = function (WpNo) {
        //console.log(EditWQGridData);_
        var checkRec = _FindWPCheck(WpNo);
        var isFirstAsk = checkRec == null;

        //加载审核记录.
        var values = null;
        if (isFirstAsk) {
            values = {
                ask_id : -1,
                n_dd: GlobalVar.ServerDate,
                prd_no: EditingWQ.get('prd_no'),
                wp_no: EditWQGridData[WpNo].wp_no,
                wp_name: EditWQGridData[WpNo].wp_name,
                pic_pair: EditWQGridData[WpNo].pic_num, 
                up_pair: EditWQGridData[WpNo].up_pair,
                up_pic: EditWQGridData[WpNo].up_pic,
                check_state: -1,
                check_man: '',
                check_msg: '',
                ask_up_pic: '',
                ask_up_pair:''
            };
        }
        else {
            values = {
                ask_id: checkRec.get('ask_id'),
                n_dd: checkRec.get('n_dd'),
                prd_no: EditingWQ.get('prd_no'),
                wp_no: checkRec.get('wp_no'),
                wp_name: checkRec.get('wp_name'),
                pic_pair: EditWQGridData[WpNo].pic_num,
                up_pair: checkRec.get('up_pair'),
                up_pic: checkRec.get('up_pic'),
                check_state: checkRec.get('check_state'),
                check_man: checkRec.get('check_man'),
                check_msg: checkRec.get('check_msg'),
                ask_up_pair: checkRec.get('ask_up_pair'),
                ask_up_pic: checkRec.get('ask_up_pic'),
                ask_reason:''
            };
        }

        WQGrid.AskUPPriceFrom.getForm().setValues(values);
        
    }



    ///存在相同的员工组合行吗?
    var _IsExistedWorkerPartnet = function (worker1, worker2) {
       
        for (var i = 0; i < WQGridLayoutStore.getCount(); i++) {
            var rec = WQGridLayoutStore.getAt(i);
            if (rec.get('row_type') == 'SALM') {
                if (rec.get('row_value') == worker1 && rec.get('worker2') == (worker2 || '')) {
                    return true;
                }
            }
        }

        return false;
    }

    var _IsExistedWorkerPartnetCount = function (worker1, worker2) {
        var cnt = 0
        for (var i = 0; i < WQGridLayoutStore.getCount() ; i++) {
            var rec = WQGridLayoutStore.getAt(i);
            if (rec.get('row_type') == 'SALM') {
                if (rec.get('row_value') == worker1 && rec.get('worker2') == (worker2 || '')) {
                    ++cnt;
                }
            }
        }

        return cnt;
    }

    //弹窗 新建员工行
    var fnShowDialogToNewSalmRecord = function () {
        var win123 = Ext.create('Ext.window.Window', {
            title: '新行配置',
            height: 160,
            width: 400,
            defaults: {
                margin:5
            },
            items: [{
                fieldLabel: '主手员工',
                name: 'worker1',
                itemId: 'worker1',
                xtype: 'MSearch_Salm',
                matchFieldWidth: false,
                value: '',
                localStoreSortByWorkerDeptNo: WQForm.getComponent('user_dep_no').getValue(),
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
                localStoreSortByWorkerDeptNo: WQForm.getComponent('user_dep_no').getValue()
            }],
            bbar: [
                {
                    xtype: 'button', text: '确定', handler: function () {
                        var worker1 = win123.getComponent('worker1').getValue();
                        var worker2 = win123.getComponent('worker2').getValue();

                        if (!worker1) {
                            alert('主手必填');
                            return;
                        }
                        //组合是否存在!
                        if (_IsExistedWorkerPartnet(worker1, worker2) == true) {
                            alert('已存在相同的员工行!');
                            return;
                        }

                        var rec5Data = { row_type: 'SALM', row_value: worker1, worker2: worker2 };
                        var rec5 = Ext.create('WQGrid_Layout_Model', rec5Data);
                        
                        WQGridLayoutStore.insert(WQGridLayoutStore.getCount(), [rec5]);
                        Ext.Function.defer(function () {
                            WQGrid.getSelectionModel().select(WQGridLayoutStore.getCount()-1)
                        }, 1000);

                        win123.close();
                    }
                }
            ]
        }).show();
    }

    //工具按钮
    //新建
    //删除
    //保存
    //查询 -> 展开 查询Grid

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
        searchParams.action = 'SearchWQ';
        searchParams.NowUserId = GlobalVar.NowUserId;
        searchParams.TableType = TableType;
        searchParams.IsShareTable = IsShareTable;  //是否分成页面
        SearchGridStore.load({
            params: searchParams
        });
    }

    var SearchPanel = Ext.create('Ext.panel.Panel', {
        region: 'east',
        title: '查询计薪单',
        width : 480,
        collapsed: true,
        layout: 'border',
        collapsible :true,
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
                    xtype: 'textfield',
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
                    value: WpConfig.UserDefault[GlobalVar.NowUserId].user_dep_no || '000000'
                }, {
                    fieldLabel: '货号',
                    name: 'query_prd_no',
                    itemId: 'query_prd_no',
                    xtype: 'textfield',
                    value: ''
                }, {
                    margin: '0 0 0 90',
                    text: '查&nbsp&nbsp&nbsp&nbsp询',
                    xtype: 'button',
                    height: 30,
                    width : 80,
                    handler: OnSearchWQ
                }]
            },
            {
                region: 'center',
                xtype: 'grid',
                store: SearchGridStore,
                columns: [
                    { header: '计薪日', name: 'jx_dd', dataIndex: 'jx_dd', xtype: 'datecolumn', format: 'm-d', width: 60 },
                    { header: '计薪单', name: 'jx_no', dataIndex: 'jx_no', width: 90 },
                    { header: '部门', name: 'user_dep_no', dataIndex: 'user_dep_no', renderer: GlobalVar.rdDeptName, width: 70 },
                    { header: '计划单', name: 'plan_no', dataIndex: 'plan_no', width: 90 },
                    { header: '货名', name: 'prd_no', dataIndex: 'prd_no', renderer: GlobalVar.RenderPrdtName, width: 100 },
                    { header: '尺寸(颜色)', name: 'showSizeAndColor', dataIndex: 'showSizeAndColor', width: 65 }
                ],
                listeners: {
                    itemdblclick: function (gridThis, record, item, index, e, eOpts) {
                        WQGrid.setDisabled(true);
                        if (PlanViewHelper.IsSumByPlanView == true) {
                            OnFormInit();
                            PlanViewHelper.IsSumByPlanView = false;
                            WQGrid.btnSave.setDisabled(false);
                            WQGrid.btnDelete.setDisabled(false);
                        }
                        //以防 事件触发
                        SwitchUTIng = true;
                        EditingWQ = Ext.create('WPQtyHeader_Model', record.getData());
                        SetJXDDMinMax();

                        WQForm.getForm().loadRecord(EditingWQ);
                        WQForm.getComponent('plan_no').setRawValue(EditingWQ.get('plan_no'));
                        SwitchUTIng = false;

                        OnWQGridLayout();
                        //OnSetReadOnlyOnUpdateing(true);
                    }
                }
            }],
        listeners: {
            afterrender: function () {
                OnSearchWQ();
            }
        }
    });


    var TimeRunner = new Ext.util.TaskRunner();
    var TimeRunnerTask = TimeRunner.start({
        run: function () {
            //本张单有提交过,才定时刷新
            if (EditingWQ.get('wq_id') > 0 && WQGridLayoutStore.getCount() > 0 && JXCheckStore.getCount() > 0) {
                _AfterCheckUpdateWQGridUPRow();
            }
        },
        interval: 15000
    });

    var pageMonitor = function (receiverUrl, e) {
        if (receiverUrl != 'WPQty')
            return;
        if (e.action == 'startEdit') {
            OnFormInit();

            EditingWQ.set('jx_dd', e.jx_dd);
            EditingWQ.set('wp_dep_no', e.wp_dep_no);
            EditingWQ.set('user_dep_no', e.user_dep_no);
            EditingWQ.set('provider', WpConfig.UserDefault[GlobalVar.NowUserId].user_no || '');



            var cbSelectReocrd = Ext.create('WorkPlan_Sizes_Model', { plan_no: e.plan_no, plan_id: e.plan_id, size_id: e.size_id, size: e.size, prd_no: e.prd_no });
            WQForm.getComponent('plan_no').fireEvent('select', WQForm.getComponent('plan_no'), [cbSelectReocrd]);
            WQForm.getComponent('plan_no').displayTplData = [cbSelectReocrd.data];
            WQForm.getComponent('plan_no').setRawValue(e.plan_no);

 
            WQForm.getComponent('wp_dep_no').setValue(e.wp_dep_no);
            WQForm.getComponent('user_dep_no').setValue(e.user_dep_no);
            
            EditingWQ.set('edit_ut', WpConfig.UserDefault[GlobalVar.NowUserId].edit_ut || 1);
            WQForm.getComponent('edit_ut').setValue(WpConfig.UserDefault[GlobalVar.NowUserId].edit_ut || 1);
            OnWQGridLayout();
        }
    }

    viewport = Ext.create('Ext.Viewport', {
        layout: 'border',
        items: [
            {
                region: 'center',
                xtype: 'panel',
                itemId: 'LeftPanel',
                layout: 'border',
                items: [WQForm, WQGrid]
            },
            SearchPanel
        ],
        listeners: {
            afterrender: function (comp, eOpts) {
                fnCommonCreateLastNo('JX', WQForm.getComponent('jx_no'), function () {});
                var me = this;
                var pa = window.parent ? window.parent.Ext.getCmp('tabPanel') : null;
                if (pa) {
                    var thisTabComp = pa.getComponent(TableMenuNo);
                    if (thisTabComp) {
                        thisTabComp.had_rendered = true;
                        pa.on('SendOrder', pageMonitor);
                        thisTabComp.fireEvent('had_rendered', pageMonitor);

                        PageClose = function () {
                            var pa = window.parent.Ext.getCmp('tabPanel');
                            if (pa) {
                                thisTabComp.fireEvent('letcloseme');
                            }
                        }
                    }
                }
            }
        }
    });
});