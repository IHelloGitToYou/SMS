var SCom = {};
var commonVar = {};
GlobalVar = (window.parent && window.parent.GlobalVar) ? window.parent.GlobalVar : null;

if (GlobalVar)
    NowUserId = GlobalVar.NowUserId;

commonVar.GetUrlDeep = function (URL) {
    var page_Deep = 0,
        index_1 = URL.indexOf('/Sys'),
        leftStr = URL.substr(index_1 + '/Sys'.length, URL.length - (index_1 + '/Sys'.length));

    for (var i = 0; i < leftStr.length; ++i) {
        if (leftStr[i] == '/')
            ++page_Deep;
    }

    return page_Deep;
}
commonVar.urlDeep = commonVar.GetUrlDeep(document.URL);
commonVar.urlCDStr = Ext.String.repeat('../', commonVar.urlDeep);
urlCDStr = commonVar.urlCDStr;

commonVar.RenderInt = function (v, mete, rec) {
    if (v == 0)
        return '';
    else
        return Ext.util.Format.number(v, '0');
}

commonVar.ConvertBool = function (value) {
    if (value == 'T' || value == true || value == 'true' || value == 'True')
        return true;
    else
        return false;
}
Ext.define('SCom.cbSalmType', {
    extend : 'Ext.form.ComboBox',
    xtype : 'cbSalmType',
    fieldLabel: '',
    store: Ext.create('Ext.data.Store', {
        fields: ['value', 'name'],
        data : [
            { "value": "1", "name": "1.半成品" },
            { "value": "2", "name": "2.上肠拼身" },
            { "value": "3", "name": "3.专车" },
            { "value": "4", "name": "4.上AB面" },
            { "value": "5", "name": "5.杂工" }
        ]
    }),
    queryMode: 'local',
    displayField: 'name',
    valueField: 'value',
    value : ''
});

Ext.define('SCom.cbUTType', {
    extend: 'Ext.form.ComboBox',
    xtype: 'cbUTType',
    fieldLabel: '',
    store: Ext.create('Ext.data.Store', {
        fields: [{ name:'value', type: 'int'} , 'name'],
        data: [
            { value: 1, "name": "对" },
            { value: 2, "name": "个" },
        ]
    }),
    queryMode: 'local',
    displayField: 'name',
    valueField: 'value',
    value: 1
});

Ext.define('SCom.cbWQType', {
    extend: 'Ext.form.ComboBox',
    xtype: 'cbWQType',
    fieldLabel: '',
    store: Ext.create('Ext.data.Store', {
        fields: [{ name: 'value', type: 'string' }, 'name'],
        data: [
            { value: 'size_qty',     "name": "单尺寸量" },
            { value: 'all_size_qty', "name": "总--尺寸量" }
        ]
    }),
    queryMode: 'local',
    displayField: 'name',
    valueField: 'value',
    value: 'size_qty'
});


Ext.define('SCom.cbLayoutFinishQty', {
    extend: 'Ext.form.ComboBox',
    xtype: 'cbLayoutFinishQty',
    fieldLabel: '',
    store: Ext.create('Ext.data.Store', {
        fields: [{ name: 'value', type: 'string' }, 'name'],
        data: [
            { value: 'FINISH', "name": "1.完成量" },
            { value: 'PLAN', "name": "2.计划量" },
            { value: 'FINISH-PLAN', "name": "3.完成量->计划量" }
        ]
    }),
    queryMode: 'local',
    displayField: 'name',
    valueField: 'value',
    value: 'FINISH'
});



// renderer 工资水平分类
SCom.rdSalmType = function (v, m, rec) {
    switch (v) {
        case '1':
            return '1.半成品';
            break;
        case '2':
            return '2.上肠拼身';
            break;
        case '3':
            return '3.专车';
            break;
        case '4':
            return '4.上AB面';
            break;
        case '5':
            return '5.杂工';
            break;
    }
    return '';
}
//工资类型
SCom.rdClcType = function (v, m, rec) {
    switch (v) {
        case '1':
            return '车位剪线';
            break;
        case '2':
            return '杂工车位';
            break;
        case '3':
            return '';
            break;
    }
    return '';
}

SCom.rdUTType = function (v, m, rec) {
    switch (v) {
        case 1:
        case '1':
            return '对';
            break;
        case 2:
        case '2':
            return '个';
            break;
    }
    return '';
}

SCom.rdWQType = function (v, m, rec) {
    switch (v) {
        case '':
        case 'size_qty':
            return '单尺寸量';
            break;
        case 'all_size_qty':
            return '总--尺寸量';
            break;
    }
    return '';
}
//过滤特殊字符
SCom.stripString = function(s) {
    var pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）&;—|{}【】‘；：”“'。，、？]")

    var rs = "";
    for (var i = 0; i < s.length; i++) {
        rs = rs + s.substr(i, 1).replace(pattern, '');
    }

    var pattern2 = new RegExp("[　]", 'g');
    rs = rs.replace(pattern2, function(m) {
        return ' ';
    });

    return rs;
} 

Ext.define('SCom.cbPrdtState', {
    extend: 'Ext.form.ComboBox',
    xtype: 'cbPrdtState',
    fieldLabel: '',
    store: Ext.create('Ext.data.Store', {
        fields: ['value', 'name'],
        data: [
            { "value": "0", "name": "正常" },
            { "value": "1", "name": "停用" }
        ]
    }),
    queryMode: 'local',
    displayField: 'name',
    valueField: 'value',
    value: '0'
});

// renderer
SCom.rdPrdtState = function (v, m, rec) {
    switch (v) {
        case '0':
            return '正常';
        case '1':
            return '停用';
        default:
            return '';
    }
    return '';
}

///取节点下层Record
commonVar.GetSubHierarchicalRecord = function (lookUpStore, parentIdField, idField, loopParentId) {
    var arr = [];
    lookUpStore.findBy(function (qRec) {
        if (qRec.get(parentIdField) == loopParentId) {
            arr.push(qRec);

            var hadSub = false;
            lookUpStore.findBy(function (q2Rec) {
                if (qRec.get(idField) == q2Rec.get(parentIdField)) {
                    hadSub = true;
                }
            });

            if (hadSub) {
                var arr2 = commonVar.GetHeriaRecord(lookUpStore, parentIdField, idField, loopParentId, qRec.get(idField));
                for (var i = 0; i < arr2.length; i++) {
                    arr.push(arr2[i]);
                }
            }
        }
    });

    return arr;
}

//**货品名称
commonVar.RenderPrdtName = function (v, m, rec) {
    v = String(v || '');
    if (!v)
        return '';
    if (GlobalVar) {
        rec2 = GlobalVar.GetRecord('PRDT', v, true);
        if (rec2)
            return rec2.get('name');
        else
            return v || '';
    }

    return v || '';
}

commonVar.RenderColorName = function (v, m, rec) {
    v = String(v || '');
    if (!v || v == '-1' || v == '0') {
        return '';
    }

    if (GlobalVar) {
        var rec2 = GlobalVar.GetRecord('COLOR', v.toString(), true);
        //console.log({ rec2: rec2, v:v });
        if (rec2) {
            return rec2.get('color');
        }
        else {
            return v || '';
        }
    }

    return v || '';
}

// 复制
var TConfig = {};
TConfig.GetDeptWithPeopleStore = function() {
    return Ext.create('Ext.data.TreeStore', {
        model: 'Model_TreeDept',
        folderSort: true,
        proxy: {
            type: 'ajax',
            url: '../../Handler2/TCRM/ashx_CrmDept.ashx?action=fetch_data_with_people',
            reader: {
                type: 'json'
            }
        },
        root: {
            text: '根节点',
            expanded: true
        }
    });
}

////　递归展开所有下层节点，并全选、后全选
TConfig.ExpandAndSelectedSub = function(node, checked) {
    node.expand();
    node.checked = checked;
    node.eachChild(function(child) {
        child.set('checked', checked);
        TConfig.ExpandAndSelectedSub(child, checked);
    });
}

Ext.EventManager.on(window, 'keydown', function (e, t) {
    if (t.tagName != 'TEXTAREA') {
        if (e.getKey() == e.BACKSPACE && (!/^input$/i.test(t.tagName) || t.disabled || t.readOnly)) {
            e.stopEvent();
        }
    }
});


commonVar.AjaxRequest = function (postUrl, postParams, fnSucessCallBack) {
    Ext.Ajax.request({
        url: postUrl,
        params: postParams,
        success: function (response) {
            var json = Ext.decode(response.responseText);
            if (json.result) {
                if (Ext.isFunction(fnSucessCallBack)) {
                    fnSucessCallBack(json);
                }
            }
            else {
                alert(json.msg);
            }
        },
        failure: function (response, opts) {
            alert('提交失败状态 ' + response.status);
        }
    });
}

commonVar.AjaxGetData = function (postUrl, postParams, fnSucessCallBack) {
    Ext.Ajax.request({
        url: postUrl,
        params: postParams,
        success: function (response) {
            var json = Ext.decode(response.responseText);
            if (Ext.isArray(json) || Ext.typeOf(json.total) != 'undefined') {
                if (Ext.isFunction(fnSucessCallBack)) {
                    fnSucessCallBack(json);
                }
            }
            else {
                alert(response.responseText);
            }
        },
        failure: function (response, opts) {
            alert('提交失败状态 ' + response.status);
        }
    });
}

//Ext.define('Ext.Toast', {
//    extend: 'Ext.Component',
//    alias: 'widget.toast',
//    initComponent: function () {
//        var me = this;
//        var msgCt;
//        function createBox(t, s) {
//            return [
//					'<div class="msg">',
//					'<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
//					'<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc" style="font-size:13px"><h3>',
//					t,
//					'</h3>',
//					s,
//					'</div></div></div>',
//					'<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
//					'</div>'].join('');
//        }


//        /**
//		 * 信息提示
//		 * @member Ext.ux.Toast
//		 * @param {String}
//		 *            title 标题
//		 * @param {String}
//		 *            format 内容
//		 * ＠param {autoHide} 
//		 * 			  autoHide 是否自动隐藏
//		 * ＠param {pauseTime}
//		 * 			  pauseTime 信息停留时间 
//		 */
//        me.msg = function (title, message, autoHide, pauseTime) {
//            if (!msgCt) {
//                msgCt = Ext.DomHelper.insertFirst(document.body, {
//                    id: 'msg-div',
//                    style: 'position:absolute;top:10px;width:250px;margin:0 auto;z-index:20000;'
//                }, true);
//            }

//            // //给消息框右下角增加一个关闭按钮
//            // message+='<br><span style="text-align:right;font-size:12px;
//            // width:100%;">' +
//            // '<font color="blank"><a style="cursor:hand;"
//            // onclick="Ext.example.hide(this);">关闭</a></font></span>'

//            var s = Ext.String.format.apply(String, Array.prototype.slice.call(
//							arguments, 1));
//            var m = Ext.DomHelper.append(msgCt, {
//                html: createBox(title, s)
//            }, true);
//            msgCt.alignTo(document, 't-t');

//            m.slideIn('t');

//            if (!Ext.isEmpty(autoHide) && autoHide == true) {
//                if (Ext.isEmpty(pauseTime)) {
//                    pauseTime = 1000;
//                }

//                console.log('pauseTime==>' + pauseTime);

//                // 在extjs4中m.pause(t)方法已经被标记为  <strong style="font-size: 0.7em; border-top-left-radius: 2px; border-top-right-radius: 2px; border-bottom-right-radius: 2px; border-bottom-left-radius: 2px; margin-left: 5px; padding: 0px 3px; color: white; background-color: #aa0000; font-family: HelveticaNeue, helvetica, arial, clean, sans-serif; line-height: 19px; white-space: normal;" class="deprecated signature">DEPRECATED</strong>
//                m.ghost("t", {
//                    delay: pauseTime,
//                    remove: true
//                });
//            }
//        }

//        me.callParent();

//        return me;

//    },
//    /**
//	 * 隐藏提示框
//	 * @param {} v
//	 */
//    hide: function (v) {
//        var msg = Ext
//				.get(v.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement);
//        msg.ghost("t", {
//            remove: true
//        });
//    }
//}, function () {
//    Ext.Toast = new this();
//});
Ext.toast = function () {
    var msgCt;
    function createBox(t, s) {
        return '<div class="msg"><h3>' + t + '</h3><p>' + s + '</p></div>';
    }
    return {
        msg: function (title, format, hideDealy) {
            if (!msgCt) {
                msgCt = Ext.DomHelper.insertFirst(document.body, { id: 'msg-div' }, true);
            }
            var s = Ext.String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            var m = Ext.DomHelper.append(msgCt, createBox(title, s), true);
            m.hide();
            m.slideIn('t').ghost("t", { delay: hideDealy, remove: true });
        },

        init: function () {
            if (!msgCt) {
                msgCt = Ext.DomHelper.insertFirst(document.body, { id: 'msg-div' }, true);
            }
        }
    };
}();

//提示框
commonVar.Alert = function (title, html, width, align, hideDealy) {

    Ext.toast.msg(title, html, hideDealy);
    console.log(title);
    //Ext.create('Ext.Toast', {

    //}).msg(title, html, true, hideDealy);

    //Ext.toast({
    //    alwaysOnTop: true,
    //    html: html,
    //    title: title,
    //    width: width || 200,
    //    align: align || 'tr',
    //    autoCloseDelay: hideDealy || 6 * 1000
    //});
}