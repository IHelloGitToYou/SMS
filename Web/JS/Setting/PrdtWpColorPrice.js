ColorScope = {};

ColorScope.fnAskWhichUPReadyToSet = function () {
        var signUPWin = Ext.create('Ext.window.Window', {
            title: '请选择要设置的单价ID(' + ColorScope.WP_RECORD.get('name') + ')',
            height: 200,
            width: 400,
            layout: 'fit',
            items: [{
                xtype: 'radiogroup',
                itemId: 'radiogroupId',
                fieldLabel: '单价ID',
                columns: 2,
                vertical: true,
                items: ColorScope.getRadioSelectorUpItems()
            }],
            bbar: [{
                text: '下一步',
                handler: function () {
                    var whichUPNo = signUPWin.getComponent('radiogroupId').getValue().rb;
                    
                    ColorScope.UP_NO = whichUPNo;
                    ColorScope.fnOpenColorSetPriceWin(whichUPNo);

                    signUPWin.close();
                }
            }]
        });

        signUPWin.show();
    }

ColorScope.getRadioSelectorUpItems = function () {
    var up_nos = GetShowingUpNos();
    var arr = [];
    for (var i = 0; i < up_nos.length; i++) {
        arr.push({
            boxLabel: up_nos[i],
            name: 'rb',
            inputValue: up_nos[i],
            checked: i == 0
        });
    }
    return arr;
}

ColorScope.doStart = function(rowIndex) {
        //alert(gridPanel.grid.getSelectionModel().getSelection().length + ' - ' + rowIndex);
        var isAdminRoot = WpConfig.UserDefault[GlobalVar.NowUserId].root == '管理员';
        if (isAdminRoot == false) {
            alert('你没有权限!');
            return;
        }
        if (GetShowingUpNos().length <= 0) {
            alert('当前没有显示单价组!');
            return;
        }

        ColorScope.WP_RECORD = gridPanel.store.getAt(rowIndex);
        
        ColorScope.fnAskWhichUPReadyToSet();
}


ColorScope.createStore = function (p_prd_no, p_wp_no, p_up_no) {
    var newStore = new Ext.data.Store({
        model: 'prdt_up_exception_Model',
        pageSize: 1000000,
        proxy: {
            type: 'ajax',
            url: '../ASHX/ashx_PrdtWpColor.ashx',
            reader: {
                type: 'json',
                root: 'items',
                total: 'total'
            }
        }
    });

    newStore.load({
        params:{
            action :'LoadColorPrice',
            prd_no: p_prd_no,
            wp_no: p_wp_no,
            up_no: p_up_no
        }
    });
    return newStore;
}

ColorScope.doSave = function (gridStore, fnCallBack) {
    var op = {
        action: 'SaveColorPrice',
        prd_no: ColorScope.WP_RECORD.get('prd_no'),
        wp_no: ColorScope.WP_RECORD.get('wp_no'),
        up_no: ColorScope.UP_NO
    };

    var tempObj = {};
    for (var i = 0; i < gridStore.getCount(); i++) {
        var color_id = gridStore.getAt(i).get('color_id');
        var sign_in_jx_nos = gridStore.getAt(i).get('sign_in_jx_nos');

        if (color_id <= 0 && !sign_in_jx_nos) {
            continue;
        }
        if (color_id > 0 && tempObj[color_id] === true) {
            alert('颜色重复了');
            return false;
        }

        if (color_id > 0) {
            tempObj[color_id] = true;
        }
    }

    GlobalVar.TranStoreToJson(op, gridStore, function (checkIngRec) {
        if (checkIngRec.get('color_id') <= 0 && !checkIngRec.get('sign_in_jx_nos')) {
            return false;
        }
        if (checkIngRec.get('up_pic') == 0 || checkIngRec.get('up_pair') == 0) {
            return false;
        }
        return true;
    });

    Ext.Ajax.request({
        url: '../ASHX/ashx_PrdtWpColor.ashx',
        params: op,
        success: function (response) {
            var json = Ext.JSON.decode(response.responseText);
            if (json.result == false) {
                alert(json.msg);
                return;
            }
            else {
                fnCallBack(json);
                alert('保存成功!');
            }
        },
        failtrue: function () {
            CommMsgShow('异常', 'xxx', true);
        }
    });
}

//设置颜色单价窗体
ColorScope.fnOpenColorSetPriceWin = function (whichUPNo) {
    var SettingWin = Ext.create('Ext.window.Window', {
        title: '设置工序(' + ColorScope.WP_RECORD.get('name') + ')颜色或指定单单价',
        height: 300,
        width: 500,
        layout: 'fit',
        items: {
            xtype: 'grid',
            selType: 'rowmodel',
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners: {
                        beforeedit: function (editor, e, eOpts) {
                            if (e.record.get('except_id') >= 0 && e.field == 'color_id') {
                                return false;
                            }
                        },
                        edit: function (editor, e) {

                            if (e.field.indexOf('up', 0) >= 0) {
                                //依更新单价,推另一个单价
                                if (e.field.indexOf('up_pic', 0) >= 0)
                                    e.record.set('up_pair', 1.00 * ColorScope.WP_RECORD.get('pic_num') * e.value);
                                else
                                    e.record.set('up_pic', 1.00 * e.value / ColorScope.WP_RECORD.get('pic_num'));
                            }

                        }
                    }
                })
            ],
            store: ColorScope.createStore(
                ColorScope.WP_RECORD.get('prd_no'),
                ColorScope.WP_RECORD.get('wp_no'),
                whichUPNo
            ),
            columns: [
             { header: '序号', dataIndex: 'except_id', width: 55 },
             { header: '单价编号', name: 'up_no', dataIndex: 'up_no', width: 80 },
             {
                 header: '颜色', name: 'color_id', dataIndex: 'color_id',
                 editor:{
                     xtype:'MSearch_Color'
                 },
                 renderer:commonVar.RenderColorName,
                 width: 80
             },
             {
                 header: '计件单号(逗号区分)', name: 'sign_in_jx_nos', dataIndex: 'sign_in_jx_nos',
                 editor:{},
                 //renderer:commonVar.RenderColorName,
                 width: 160
             },
             
             {
                 header: '个单价', name: 'up_pic', dataIndex: 'up_pic',
                 editor: {
                     xtype: 'numberfield', hideTrigger: true, decimalPrecision: 5,
                     spinDownEnabled: false,
                     spinUpEnabled: false,
                     onDownArrow: function () { }
                 },
                 renderer: rendererForNum,
                 width: 80
             },
            {
                header: '对单价', name: 'up_pair', dataIndex: 'up_pair',
                editor: {
                    xtype: 'numberfield', hideTrigger: true, decimalPrecision: 5,
                    spinDownEnabled: false,
                    spinUpEnabled: false,
                    onDownArrow: function () { }
                },
                renderer: rendererForNum,
                width: 80
            }]
        },
        bbar: [{
            text: '添加一行',
            icon: '../JS/resources/MyImages/clycle_add.png',
            handler: function () {
                var grid = SettingWin.getComponent(0);
                grid.findPlugin('cellediting').completeEdit();
                var newRec=  grid.store.add({ up_no: whichUPNo, except_id: -1 });
                //grid.findPlugin('cellediting').startEdit(newRec, 2);
            }
        },
        {
            text: '删除一行',
            icon: '../JS/resources/MyImages/Delete.png',
            handler: function () {
                var grid = SettingWin.getComponent(0);
                grid.findPlugin('cellediting').completeEdit();
                var sels = grid.getSelectionModel().getSelection();
                if (sels.length <= 0) {
                    return;
                }
                //alert(sels[0].get('color_id'));
                //alert(Ext.typeOf(sels[0].get('color_id')));
                Ext.MessageBox.confirm('询问',
                    '确定删除本笔单价例外吗?',
                    function (btn) {
                        if (btn == 'yes') {
                            grid.store.remove(sels[0]);
                        }
                    },
                    SettingWin
                );
            }
        },
        {
            text: '保存例外',
            icon: '../JS/resources/MyImages/Delete.png',
            handler: function () {
                var isAdminRoot = WpConfig.UserDefault[GlobalVar.NowUserId].root == '管理员';
                if (isAdminRoot == false) {
                    alert('你没有权限修改例外单价!');
                    return;
                }

                var grid = SettingWin.getComponent(0);
                grid.findPlugin('cellediting').completeEdit();

                ColorScope.doSave(grid.store, function (json) {
                    
                    if (json.result == true) {
                        grid.store.load({
                            params: {
                                action: 'LoadColorPrice',
                                prd_no: ColorScope.WP_RECORD.get('prd_no'),
                                wp_no: ColorScope.WP_RECORD.get('wp_no'),
                                up_no: ColorScope.UP_NO
                            }
                        });
                    }
                });
            }
        }]
    });

    SettingWin.show();
}
