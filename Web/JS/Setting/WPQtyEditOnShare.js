Ext.onReady(function () {
    //计薪表头
    //WPQtyHeader_Model
    var isAdminRoot = WpConfig.UserDefault[GlobalVar.NowUserId].root == '管理员';
    var EditingWQ = null;
    var CalInscrease = true;
    var TableType = '计件分成';

    var OnFormInit = function () {
        EditingWQ = null;
        EditingWQ = Ext.create('WPQtyHeader_Model', {
            wq_id: -1,
            size_id: -1,
            edit_ut: WpConfig.UserDefault[GlobalVar.NowUserId].edit_ut || 1,   //1.对, 2.个
            cal_inscrease: CalInscrease,
            n_man: GlobalVar.NowUserId
        });

        WQForm.getForm().reset();
        SetJXDDMinMax();

        WQForm.setLoading(true);
        fnCommonCreateLastNo('SY', WQForm.getComponent('jx_no'), function () {
            Ext.Function.defer(function () {
                WQForm.setLoading(false);
            }, 800);
        });

        WQGrid.store.removeAll();
        ListenFormJX_DDChange();
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
    var IsLocking = function (p_TableDD) {
        if (EditingWQ.get('wq_id') < 0) {
            return false;
        }

        var TableDate = new Date(Ext.Date.format(p_TableDD || EditingWQ.get('n_dd'), 'Y/m/d'));
        var freezeDate = Ext.Date.add(TableDate, Ext.Date.DAY, (WpConfig.freezeDay - 1));
        var TodayDate = GlobalVar.ServerDate;
       // console.log([Ext.Date.format(TodayDate, 'Y/m/d'), Ext.Date.format(freezeDate, 'Y/m/d'), Ext.Date.format(GlobalVar.freeze_date, 'Y/m/d')]);
      //  alert(Ext.Date.format(TableDate, 'Y/m/d'));
       // alert(Ext.Date.format(GlobalVar.freeze_date, 'Y/m/d'));

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
    
    var OnFormDelete = function () {
        var checkResult = IsLocking();
        if (checkResult != false) {
            if (checkResult == '冰封')
                alert('单据已被冰封!, 想删除请与管理员联系!');
            else
                alert('单据已被结账,不能删除!');
            return;
        }
        alert('删除! 末处理');
    }

    var OnSetReadOnlyOnUpdateing = function (readOnly) {
        WQForm.getComponent('plan_no').setReadOnly(readOnly);
        WQForm.getComponent('wp_dep_no').setReadOnly(readOnly);
        WQForm.getComponent('user_dep_no').setReadOnly(readOnly);
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
    
    //更新计件日期,因为没有整体保存.
    // 当有计件表身时,是不能再更新到表头了.
    var flagJXDD = false;
    var ListenFormJX_DDChange = function () {
        WQForm.getComponent('jx_dd').hasListener('change') && WQForm.getComponent('jx_dd').clearListeners();
        

        WQForm.getComponent('jx_dd').on('change', function (vthis, newValue, oldValue, eOpts) {
            if (IsLayoutingTable == true
                || flagJXDD == true
                || Ext.isDate(newValue) == false) {

                return;
            }

            var checkResult = IsLocking(newValue);
            if (checkResult != false) {
                flagJXDD = true;
                WQForm.getComponent('jx_dd').setValue(oldValue);
                flagJXDD = false;

                if (checkResult == '冰封') {
                    alert('单据已被冰封!, 请与管理员联系修改!');
                }
                else {
                    alert('单据已被结账,不能修改行!');
                }
                return;
            }


            if (EditingWQ.get('wq_id') > 0 && newValue != oldValue && newValue) {
                Ext.MessageBox.confirm('询问', '确定变更单据时间吗？ ', function (btn) {
                    if (btn == 'yes') {

                        commonVar.AjaxRequest(
                            commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
                            {
                                NowUserId: NowUserId,
                                action: 'UpdateJXDD',
                                wq_id: EditingWQ.get('wq_id'),
                                jx_dd: newValue
                            }
                        );
                    } else {
                        flagJXDD = true;
                        WQForm.getComponent('jx_dd').setValue(oldValue);
                        flagJXDD = false;
                    }
                });
            }
        });
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
              //editable :false,
              allowBlank: false
          },
          {
              readOnly: true,
              fieldLabel: '计件单号&nbsp&nbsp',
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
              fieldLabel: '计划单号&nbsp&nbsp',
              name: 'plan_no',
              itemId: 'plan_no',
              //allowBlank: false,
              xtype: 'MSearch_PlanNo',  // 同选 size_id size
              pageSize:100,
              listeners: {
                  select: function (vcombo, records, eOpts) {
                      if (EditingWQ == null || EditingWQ.get('wq_id') > 0) {
                          //alert('');
                          return;
                      }
                      //可以切换,证明切换是有效的,重设加载标记
                      LoadedShareFlag = false;

                      if (records && records.length > 0) {
                          var cbSel = records[0];

                          EditingWQ.set('plan_id', cbSel.get('plan_id'));
                          EditingWQ.set('plan_no', cbSel.get('plan_no'));
                          EditingWQ.set('prd_no', cbSel.get('prd_no'));
                          EditingWQ.set('size_id', -1);
                          EditingWQ.set('size', '');

                          EditingWQ.set('color_id', -1);
                          EditingWQ.set('cal_inscrease', CalInscrease);

                          WQForm.getComponent('prd_no').setValue(cbSel.get('prd_no'));
                          WQForm.getComponent('size').setValue(cbSel.get('size'));


                          FormUpdateRecord();
                      }
                      else {
                          alert('填充其他选择时,出错! 试重选一次!');
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
              hidden: true
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
              xtype: 'fieldcontainer',
              items: [{
                  xtype: 'button',
                  height: 30,
                  text: '新建单据',
                  margin: '0 5 0 5',
                  handler: function () {
                      OnFormInit();
                  }
              }, {
                  xtype: 'button',
                  height: 30,
                  text: '更新布局',
                  margin: '0 5 0 5',
                  hidden:true,
                  handler: function () {
                      FormUpdateRecord();
                      OnWQGridLayout();
                  }
                  }, {
                      xtype: 'button',
                      height: 30,
                      text: '统计视图',
                      margin: '0 5 0 5',
                      handler: function () {
                          PlanViewHelper.ShowWin(
                              WQForm.getComponent('plan_no').getValue(),
                              WQForm.getComponent('wp_dep_no').getValue(),
                              WQForm.getComponent('user_dep_no').getValue());
                      }
                  },{
                    xtype: 'button',
                    height: 30,
                    text: '导出',
                    icon: '../JS/resources/MyImages/ms_excel.png',
                    margin: '0 5 0 5',
                    handler: function () {
                        GlobalVar.ToExcel(WQGrid, '工资分析');
                        //alert('功能末实现');
                    }
                }]
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
              colspan: 1,
              xtype: 'cbUTType',
              name: 'edit_ut',
              itemId: 'edit_ut',
              fieldLabel: '录入单位',
              readOnly: true,
              hidden:true,
              value: WpConfig.UserDefault[GlobalVar.NowUserId].edit_ut || 1
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
                    return false;
                }
            }

            UpdateTableSumAndFinsishRecord(wp_no);
        }
    }
    
    var fnCommitShare = function (insertParams, successCallBack) {
        EditShareWinObj.win.setLoading(true);
        EditShareWinObj.win.btnSave.setDisabled(true);
        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
            params: insertParams,
            success: function (response) {
                var Json = Ext.decode(response.responseText);
                EditShareWinObj.win.btnSave.setDisabled(false);
                EditShareWinObj.win.setLoading(false);
                if (Json.result == true) {
                    EditShareWinObj.fnCloseWin();
                    //更新
                    //EditingWQ = Ext.create('WPQtyHeader_Model', Json.WQHeader[0]);
                    LoadWQBTable(Json.WQHeader[0].wq_id);

                    alert('保存成功');
                    if (successCallBack) {
                        successCallBack();
                    }
                }
                else {
                    alert('保存失败:' + Json.msg);
                }
            },
            failure: function (form, action) {
                EditShareWinObj.win.btnSave.setDisabled(false);
                EditShareWinObj.win.setLoading(false);
                CommMsgShow("异常：", form.responseText, true);
            }
        });
    }
    
    var OnInsertShare = function () {
        var checkResult = IsLocking();
        if (checkResult != false) {
            if (checkResult == '冰封')
                alert('单据已被冰封!, 请与管理员联系添加!');
            else
                alert('单据已被结账,不能添加行!');
            return;
        }
        
        if (EditShareWinObj.opeingFlag == true) {
            return;
        }

        if (EditingWQ == null || !EditingWQ.get('plan_no')) {
            alert('末选择计划单');
            return;
        }
        
        FormUpdateRecord();
        //加载数据后才执行
        EditShareWinObj.nowWQB_ID = -1;
        EditShareWinObj.EditingWQ = EditingWQ;
      

        EditShareWinObj.fnOpenWin(function (paramsObj) {
            //console.log(paramsObj);
            if (EditingWQ.get('wq_id') < 0) {
                EditShareWinObj.win.setLoading(true);
                EditShareWinObj.win.btnSave.setDisabled(true);

                fnCommonCreateLastNo('SY', WQForm.getComponent('jx_no'), function () {
                    paramsObj.jx_no = WQForm.getComponent('jx_no').getValue();

                    fnCommitShare(paramsObj, function () { OnSearchWQ(); });

                });
                return;
            }

            fnCommitShare(paramsObj);
        });
    }

    var OnUpdateShare = function () {
        var checkResult = IsLocking();
        if (checkResult != false) {
            if (checkResult == '冰封') {
                console.log('单据已被冰封!, 请与管理员联系修改!');
                alert('单据已被冰封!, 请与管理员联系修改!');
            }
            else {
                console.log('单据已被结账,不能修改行!');
                alert('单据已被结账,不能修改行!');
            }
            return;
        }

        if (EditShareWinObj.opeingFlag == true) {
            return;
        }

        if (EditingWQ == null || !EditingWQ.get('plan_no')) {
            return;
        }

        if (EditingWQ.get('wq_id') <=0) {
            return;
        }

        var selRows = WQGrid.getSelectionModel().getSelection();
        if (selRows.length <= 0) {
            alert('末选择表身行');
            return;
        }

        FormUpdateRecord();
        //加载数据后才执行
        EditShareWinObj.nowWQB_ID = selRows[0].get('wqb_id');
 
        var originShares = [];
        WPQtyBodyShareStore.findBy(function (qRec) {
            if (qRec.get('wqb_id') == EditShareWinObj.nowWQB_ID) {
                originShares.push(qRec.copy());
            }
        });

        //EditShareWinObj.nowSizeId = selRows[0].get('size_id');
        //EditShareWinObj.nowWpNo = selRows[0].get('wp_no');
       
        EditShareWinObj.updateWQBClone = selRows[0].copy();
        EditShareWinObj.updateWQBSharesClone = originShares;

        EditShareWinObj.EditingWQ = EditingWQ;


        EditShareWinObj.fnOpenWin(function (paramsObj) {
            //console.log(paramsObj);
            fnCommitShare(paramsObj);
        });
    }

    var fnComfirmToDelete = function () {
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

        Ext.MessageBox.confirm('询问', '确定要删除本行吗?', function (btn) {
            if (btn != 'yes')
                return;

            OnDeleteShare();
        });
    }

    var OnDeleteShare = function () {
        var selRows = WQGrid.getSelectionModel().getSelection();

        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
            params: {
                action: 'DeleteOneWQB',
                NowUserId : NowUserId,
                wq_id: selRows[0].get('wq_id'),
                wqb_id: selRows[0].get('wqb_id')
            },
            success: function (response) {
                var Json = Ext.decode(response.responseText);
                if (Json.result == true) {
                    LoadWQBTable(Json.WQHeader[0].wq_id);
                    //alert('成功');
                }
                else {
                    alert('删除失败:' + Json.msg);
                }
            },
            failure: function (form, action) {
                
                CommMsgShow("异常：", form.responseText, true);
            }
        });
    }
    ///整单删除
    var OnDeleteTable = function () {
        
        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
            params: {
                action: 'DeleteWQTable',
                NowUserId: NowUserId,
                wq_id: EditingWQ.get('wq_id')
            },
            success: function (response) {
                var Json = Ext.decode(response.responseText);
                if (Json.result == true) {
                    OnFormInit();

                    OnSearchWQ();
                }
                else {
                    alert('删除失败:' + Json.msg);
                }
            },
            failure: function (form, action) {

                CommMsgShow("异常：", form.responseText, true);
            }
        });
    }


    var WPQtyBodyStore = Ext.create('Ext.data.Store', {
        model: 'WPQtyBody_Model',
        data: []
    });

    var WPQtyBodyShareStore = Ext.create('Ext.data.Store', {
        model: 'WPQtyBodyShare_Model',
        data: []
    });

    var WQPrdtWPStore = Ext.create('Ext.data.Store', {
        model: 'Model_Only_PrdtWP',
        data: []
    });

    ///加载单据中
    IsLayoutingTable = false;
    var LoadWQBTable = function (wq_id) {
        viewport.setLoading(true);

        Ext.Ajax.request({
            type: 'post',
            url: commonVar.urlCDStr + 'ASHX/ashx_WPQtyEdit.ashx',
            params: {
                action: 'LoadWQBTable',
                wq_id: wq_id,
                NowUserId: NowUserId
            },
            success: function (response) {
                
                var Json = Ext.decode(response.responseText);
                IsLayoutingTable = true;

                if (Json.result == true) {
                    //更新
                    Ext.suspendLayouts();    
                    EditingWQ = Ext.create('WPQtyHeader_Model', Json.Header[0]);
                    SetJXDDMinMax();

                    WQForm.loadRecord(EditingWQ);
                    WQForm.getComponent('plan_no').setRawValue(EditingWQ.get('plan_no'));
                    WPQtyBodyStore.removeAll();
                    WPQtyBodyShareStore.removeAll();
                    WQPrdtWPStore.removeAll();

                    WQPrdtWPStore.add(Json.PrdtWP);
                    WPQtyBodyShareStore.add(Json.BodyShare);
                    WPQtyBodyStore.add(Json.Body);
                    
                    
                    Ext.resumeLayouts(true);

                    //有内容就要设 "计划单号" 灰
                    if (EditingWQ.get('wq_id') > 0 && WPQtyBodyStore.getCount() > 0) {
                        OnSetReadOnlyOnUpdateing(true);
                    }
                    else {
                        OnSetReadOnlyOnUpdateing(false);
                    }

                    IsLayoutingTable = false;

                    viewport.setLoading(false);
                }
                else {
                    viewport.setLoading(false);
                    IsLayoutingTable = false;
                    alert('加载失败:' + Json.msg);
                }
            },
            failure: function (form, action) {
                viewport.setLoading(false);
                IsLayoutingTable = false;
                CommMsgShow("异常：", form.responseText, true);
            }
        });
    }

     
    var WQGrid = Ext.create('Ext.grid.Panel', {
        region: 'center',
        enableLocking: true,
        enableColumnMove: false,
        enableColumnHide: false,
        sortableColumns: false,
        columnLines: true,
        rowLines: true,
        layout: 'fit',
        plugins: [],
        store: WPQtyBodyStore,
        columns: [
            { xtype: 'rownumberer' },
            {
                text: '员工', dataIndex: 'workerList', width: 130,
                renderer: function (v, m, rec) {
                    var wqb_id = rec.get('wqb_id');
                    var works = [];
                    WPQtyBodyShareStore.findBy(function (qRec) {
                        if (qRec.get('wqb_id') == wqb_id) {
                            works.push(GlobalVar.rdSalmName(qRec.get('worker')));
                            //console.log(qRec.get('worker'));
                        }
                    });

                    return works.toString();
                }
            },
            {
                text: '工序', dataIndex: 'wp_no', width: 180,
                renderer: function (v, m, rec) {
                    var qRec = WQPrdtWPStore.findRecord('wp_no', v);
                    if (qRec) {
                        return qRec.get('name');
                    }
                    return '';
                }
            },
            {
                header: '尺寸(颜色)', name: 'rdShowSizeAndColor', renderer: function (v, m, rec) {
                    var size = rec.get('size');
                    if (rec.get('color_id') > 0) {
                        return size + '(' + commonVar.RenderColorName(rec.get('color_id')) + ')';
                    }
                    return size;
                }
            },
            { text: '对数', dataIndex: 'qty_pair', width: 100 },
            { text: '个数', dataIndex: 'qty_pic', width: 90 },
            { text: '加翻(%)', dataIndex: 'inscrease_percent', width: 90 },
            { text: '单价(对)', dataIndex: 'up_pair', width: 100 },
            { text: '单价(个)', dataIndex: 'up_pic', width: 100 },
            {
                text: '基本金额', dataIndex: 'amt', width: 100,
                sortable: false,
                renderer: function (v, m, rec) {
                    v =  (rec.get('qty_pair') || 0) * (rec.get('up_pair') || 0);
                    v = Ext.util.Format.round(v, 3);
                    return v;
                }
            },
            {
                text: '加翻率', dataIndex: 'inscrease_percent', width: 80,
                sortable: false,
                renderer: function (v, m, rec) {
                    return (v || 0) + '%';
                }
            },
            {
                text: '加翻后金额', dataIndex: 'amt2', width: 100,
                sortable: false,
                renderer: function (v, m, rec) {
                    var pre = rec.get('inscrease_percent') ;
                    if (pre > 0) {
                        v = (rec.get('qty_pair') || 0) * (rec.get('up_pair') || 0) * (1+( pre / 100));
                    }
                    else {
                        v = (rec.get('qty_pair') || 0) * (rec.get('up_pair') || 0);
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
                    OnInsertShare();
                }
            },
            {
                text: '修改行', icon: '../JS/resources/MyIcon/icon_skill.png', itemId: 'btnEdit', height: 30, width: 80, handler:
                function () {
                    OnUpdateShare();
                }
            },
            '-',
            {
                text: '删除行', icon: '../JS/resources/MyIcon/icon_delete.png', height: 30, width: 80, handler: function () {
                    fnComfirmToDelete();
                }
            },
            '-',
            {
                text: '整单删除', icon: '../JS/resources/MyIcon/icon_delete.png', height: 30, width: 80, handler: function () {
                    if (EditingWQ.get('wq_id') <= 0) {
                        alert("单据未保存不需要删除 ,点击'新建单据'即可!");
                        return;
                    }

                    Ext.MessageBox.confirm('询问', '确定要整单删除吗?', function (btn) {
                        if (btn != 'yes')
                            return;

                        OnDeleteTable();
                    });

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
            boxready: function () {
                this.btnSave = this.getDockedComponent(0).getComponent('btnSave');
                ///console.log(this.btnSave);
            },
            itemcontextmenu: function (vthis, record, item, index, e, eOpts) {
                e.preventDefault();
                var menu = Ext.create('Ext.menu.Menu', {
                    width: 100,
                    margin: '0 0 10 0',
                    items: [{
                        text: '修改行',
                        handler: function () {
                            OnUpdateShare();
                        }
                    }, {
                        text: '删除行',
                        handler: function () {
                            fnComfirmToDelete();
                        }
                    }]
                });

                menu.showAt(e.getXY());
            }
        }
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
        searchParams.action = 'SearchWQ';
        searchParams.NowUserId = GlobalVar.NowUserId;
        searchParams.TableType = TableType;
        searchParams.IsShareTable = IsShareTable;
        SearchGridStore.load({
            params: searchParams
        });
    }

    var SearchPanel = Ext.create('Ext.panel.Panel', {
        region: 'east',
        title: '查询计薪单',
        width: 480,
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
                    xtype: 'MSearch_Dept'
                }, {
                    fieldLabel: '货号',
                    name: 'query_prd_no',
                    itemId: 'query_prd_no',
                    xtype: 'textfield',
                    value: ''
                }, {
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
                    { header: '员工部门', name: 'user_dep_no', dataIndex: 'user_dep_no', renderer: GlobalVar.rdDeptName },
                    { header: '计划单', name: 'plan_no', dataIndex: 'plan_no', width: 100 },
                    { header: '货名', name: 'prd_no', dataIndex: 'prd_no', renderer: GlobalVar.RenderPrdtName }
                    
                ],
                listeners: {
                    itemdblclick: function (gridThis, record, item, index, e, eOpts) {

                        LoadWQBTable(record.get('wq_id'));
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
                fnCommonCreateLastNo('SY', WQForm.getComponent('jx_no'), function () { });
                var me = this;
                var pa = window.parent ? window.parent.Ext.getCmp('tabPanel') : null;
                if (pa) {
                    var thisTabComp = pa.getComponent('WPQtyOnShare');
                    if (thisTabComp) {
                        thisTabComp.had_rendered = true;
                        pa.on('SendOrder', pageMonitor);
                        pa.getComponent('WPQtyOnShare').fireEvent('had_rendered', pageMonitor);

                        PageClose = function () {
                            var pa = window.parent.Ext.getCmp('tabPanel');
                            if (pa) {
                                pa.getComponent('WPQtyOnShare').fireEvent('letcloseme');
                            }
                        }
                    }
                }
            }
        }
    });
});