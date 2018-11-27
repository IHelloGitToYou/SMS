PrdtWpMaterialScope = (function(){
    var me = this;
    var ashxUrl = commonVar.urlCDStr + 'ASHX/Material/ashx_PrdtWpMaterial.ashx';


    var fnLoadPrdtWpMaterial = function () {
        Ext.Ajax.request({
            url: ashxUrl,
            params: {
                action: 'Load',
                prd_no: me.PRD_NO,
                wp_no: me.WP_NO
            },
            success: function (response) {
                var json = Ext.JSON.decode(response.responseText);
                if (json) {
                    fnFillDataByJson(json);

                    Ext.Function.defer(function () {
                        if (me.GridStore.getCount() > 0) {
                            me.Grid.getSelectionModel().select(me.GridStore.getAt(0));
                        }
                    }, 1000);
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

    var fnFillDataByJson =function (responseJson) {
        var me = this;
        me.GridStore.removeAll();

        for (var i = 0; i < responseJson.Head.length; i++) {
            var headRec = Ext.create("PrdtWpMaterial_Model", {
                wm_id: responseJson.Head[i].wm_id,
                prd_no: responseJson.Head[i].prd_no,
                wp_no: responseJson.Head[i].wp_no,
                material_id: responseJson.Head[i].material_id,
                BodySizes: Ext.create('Ext.data.Store', {model: 'PrdtWpMaterialSize_Model',data: []})
            });

            me.GridStore.add(headRec);

            
            var allBodySizes = responseJson.Body;
            for (var j = 0; j < allBodySizes.length; j++) {
                var sizeData = allBodySizes[j]
                if (headRec.get('wm_id').toString() == sizeData.wm_id ) {
                    headRec.BodySizes.add(
                        Ext.create('PrdtWpMaterialSize_Model', {
                            wms_id: sizeData.wms_id,
                            wm_id: sizeData.wm_id,
                            size: sizeData.size,
                            use_unit: sizeData.use_unit,
                        })
                    );
                }
            }
        }
    };
    //{ name: 'wm_id', type: 'int' },
    //{ name: 'prd_no', type: 'string' },
    //{ name: 'wp_no', type: 'string' },
    //{ name: 'material_id', type: 'int' }
    //Grid Column(prd_no, name, price

    var layoutGridUI = function(){
        //1.Form 单列Grid 
        me.GridStore = Ext.create('Ext.data.Store', {
            model: 'PrdtWpMaterial_Model',
            proxy: {
                type: 'ajax',
                url: 'ashxUrl',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            },
            autoLoad: false,
            listeners: {
                add: function (store, recs, index, eOpts) {
                    if (recs.length > 0) {
                        
                        recs[0].BodySizes = Ext.create('Ext.data.Store', {
                            model: 'PrdtWpMaterialSize_Model',
                            data: []
                        });
                    }
                }
            }
        });

        for (var i = 0; i < 1; i++) {
            var newHeadRec = Ext.create('PrdtWpMaterial_Model', {});
            me.GridStore.add(newHeadRec);
        }

        me.Grid = Ext.create('Ext.grid.Panel', {
            title: '皮奖物料',
            columnWidth: 0.6,
            height: 400,
            store: me.GridStore,
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            modal: true,
            constrain:true,
            columns: [
                { xtype: 'rownumberer' },
                //{ text: '物料号码', dataIndex: 'prd_no', width: 100 },
                {
                    text: '工序', dataIndex: 'wp_name', width: 120,
                    renderer: function () {
                        return me.WP_NAME;
                    }
                },
                {
                    text: '物料号', dataIndex: 'material_id', width: 100,
                    editor: {
                        xtype: 'MSearch_Material',
                        displayField: 'prd_no',
                        matchFieldWidth:false
                    },
                    renderer: function (v, m, rec) {
                        return GlobalVar.rdMaterialPrdtNo(v);
                    }
                },
                {
                    text: '物料名', dataIndex: 'material_id', width: 100,
                    renderer: function (v, m, rec) {
                        return GlobalVar.rdMaterialName(v);
                    }
                }
            ],
            listeners: {
                containerdblclick: function (vthis, e, eOpts) {
                    //var newHeadRec = Ext.create('PrdtWpMaterial_Model', {});
                    //me.GridStore.add(newHeadRec);
                },
                select: function (vthis, record, index, eOpts) {
                    if (vthis.lastSelectRecord == record) {
                        return;
                    }
                    if (vthis.lastSelectRecord) {
                        fnSetBackBodySizesOnEditingForm(vthis.lastSelectRecord);
                    }
                    vthis.lastSelectRecord = record;
                    fnSetBodySizesToForm(record, me.form);
                }
            },
            bbar: [
                {
                    text: '增加一行',
                    handler: function () {
                        if (me.GridStore.getCount() > 0) {
                            alert('只能选择一种物料!');
                            return;
                        }

                        var newHeadRec = Ext.create('PrdtWpMaterial_Model', {});
                        me.GridStore.add(newHeadRec);
                    }
                },
                {
                    text: '删除一行',
                    handler: function () {
                        var sels = me.Grid.getSelectionModel().getSelection();
                        if (sels.length <= 0) {
                            alert('未有选择要删除的行!');
                            return;
                        }

                        Ext.MessageBox.confirm('询问', '确定删除选定行吗? ', function (btn) {
                            if (btn == 'yes') {
                                me.GridStore.remove(sels[0]);

                                Ext.Function.defer(function () {
                                    if (me.GridStore.getCount() > 0) {
                                        me.Grid.getSelectionModel().select([me.GridStore.getAt(0)]);
                                    }
                                    else {
                                        //如果没有其他行,清空右边的Size单耗Form
                                        var emptyFormModel = Ext.create('TempFormModel_Model');
                                        me.form.loadRecord(emptyFormModel);
                                    }
                                }, 1000);

                            }
                        });
                    }
                }
            ]
        });
    }
     
     
    //加载Size单耗到Form
    var fnSetBodySizesToForm = function (headRec, form) {
        var me = this;
        var tempFormModel = Ext.create('TempFormModel_Model');
        for (var i = 0; i <  headRec.BodySizes.getCount(); i++) { 
            var rec = headRec.BodySizes.getAt(i);
            var sizeFieldName = rec.get('size');
            var sizeUseUnit = rec.get('use_unit');
            tempFormModel.set(sizeFieldName, sizeUseUnit);
        }
        form.loadRecord(tempFormModel);
    };

    var fnSetBackBodySizesOnEditingForm = function (headRec) {

        for (var i = 0; i < me.FormModelItems.length; i++) {
            var sizeFieldName = me.FormModelItems[i].name;
            var firstChar = sizeFieldName[0];
            var sizeUseUnit = 0;
            if (Ext.isNumeric(firstChar)) {
                sizeUseUnit = me.form2.getComponent(sizeFieldName).getValue();
            }
            else {
                sizeUseUnit = me.form1.getComponent(sizeFieldName).getValue();
            }

            var storeRec = null;
            headRec.BodySizes.findBy(function (_qRec) {
                if (_qRec.get('size') == sizeFieldName) {
                    storeRec = _qRec;
                }
            });

            if (storeRec == null) {
                //Insert
                headRec.BodySizes.add(Ext.create('PrdtWpMaterialSize_Model', {
                    size: sizeFieldName,
                    use_unit: sizeUseUnit
                }));
            }
            else {
                storeRec.set('use_unit', sizeUseUnit);
            }
        }
    };


    var IsSaving = false;
    //保存
    var fnSave = function () {
        //console.log('fnSave');
        if (IsSaving) {
            return;
        }
        IsSaving = true;

        var op = {
            action: 'Save',
            prd_no: me.PRD_NO,
            wp_no: me.WP_NO,
            bodyCnt: 0
        };

        var selectedMaterials = {};

        for (var i = 0; i < me.GridStore.getCount() ; i++) {
            var headRec = me.GridStore.getAt(i);
            if (!headRec.get('material_id')) {
                continue;
            }

            op['wm_id_' + i] = headRec.get('wm_id');
            if (selectedMaterials[headRec.get('material_id')]) {
                IsSaving = false;
                alert('物料重复选择!');
                return;
            }


            selectedMaterials[headRec.get('material_id')] = true;
            op['material_id_' + i] = headRec.get('material_id');
            op['bodyCnt_' + i] = 0;

            for (var j = 0; j < headRec.BodySizes.getCount() ; j++) {
                var rec = headRec.BodySizes.getAt(j);
                op['size_'     + i + '_'+ j] = rec.get('size');
                op['use_unit_' + i + '_' + j] = rec.get('use_unit') || 0;

                ++op['bodyCnt_' + i];
            }

            ++op['bodyCnt'];
        }

        Ext.Ajax.request({
            url: ashxUrl,
            params: op,
            success: function (response) {
                IsSaving = false;
                var json = Ext.JSON.decode(response.responseText);
                if (json.result == true) {
                    alert("保存成功!");
                }
                else {
                    alert("操作失败:" + unescape(json.msg));
                }
            },
            failure: function (form, action) {
                IsSaving = false;
                CommMsgShow("异常：", form.responseText, true);
            }
        });
        
    };

    var fnStart = function (prd_no, wp_no, wp_name) {
        //console.log('fnStart');
        me.PRD_NO = prd_no;
        me.WP_NO = wp_no;
        me.WP_NAME = wp_name;
        

        layoutGridUI();

        fnLoadPrdtWpMaterial();

        //2.Size Form
        // 求出Size信息 
        me.FormSizeItems = [];
        me.FormDigitSizeItems = [];

        me.FormModelItems = [];
        for (var i = 0; i < GlobalVar.SizesStore.getCount() ; i++) {
            var rec = GlobalVar.SizesStore.getAt(i);
             
            me.FormModelItems.push({ name: rec.get('size'), type: 'number' });

            //数量尺寸,分开别一个子Form
            var firstChar = rec.get('size')[0];
            if (Ext.isNumeric(firstChar)) {
                me.FormDigitSizeItems.push({
                    xtype: 'numberfield',
                    fieldLabel: rec.get('size'),
                    labelAlign: 'right',
                    decimalPrecision: 6,
                    name: rec.get('size'),
                    itemId: rec.get('size')
                });
            }
            else {

                me.FormSizeItems.push({
                    xtype: 'numberfield',
                    fieldLabel: rec.get('size'),
                    labelAlign: 'right',
                    decimalPrecision: 6,
                    name: rec.get('size'),
                    itemId: rec.get('size')
                });
                
            }
        }

        Ext.define("TempFormModel_Model", {
            extend: 'Ext.data.Model',
            fields: me.FormModelItems
        });

        var PopupShowWindow = Ext.create('Ext.window.Window', {
            title: '尺寸对应-标准单耗',
            closeAction: 'close',
            height: 520,
            width: 800,
            layout: 'column',
            items: [
                me.Grid,
                {
                    xtype: 'form',
                    itemId: 'form',
                    autoScroll: true,
                    columnWidth: 0.4,
                    layout: 'column',
                    margin:5,
                    //layout: {
                    //    type: 'table',
                    //    columns: 2
                    //},
                    items: [{
                        xtype: 'form',
                        itemId: 'formId1',
                        bodyPadding: 5,
                        margin: 5,
                        border:false,
                        align:'Top',
                        defaults: {
                            labelAlign: 'right',
                            labelWidth: 50,
                            width: 130,
                            mouseWheelEnabled: false,
                            hideTrigger: true,
                            keyNavEnabled:false
                        },
                        layout: {
                            type: 'vbox'
                        },
                        items: me.FormSizeItems
                    },
                    {
                        xtype: 'form',
                        itemId: 'formId2',
                        bodyPadding: 5,
                        border: false,
                        margin:5,
                        align: 'Top',
                        defaults: {
                            labelAlign: 'right',
                            labelWidth: 50,
                            width: 130,
                            mouseWheelEnabled: false,
                            hideTrigger: true,
                            keyNavEnabled: false
                        },
                        layout: {
                            type: 'vbox'
                        },
                        items: me.FormDigitSizeItems
                    }]
                }
            ],
            buttons: [{
                xtype: 'button',
                text: '保存',
                handler: function () {
                    var lastRec = me.Grid.getSelectionModel().lastSelectRecord;
                    if (lastRec) {
                        fnSetBackBodySizesOnEditingForm(lastRec);
                    }

                    fnSave();
                }
            }],
            listeners: {
                afterrender: function () {
                    me.form = this.getComponent('form');
                    me.form1 = me.form.getComponent('formId1');
                    me.form2 = me.form.getComponent('formId2');
                }
            }
        });

        PopupShowWindow.show();

    };
    return {
        fnStart : fnStart
    }
})();
