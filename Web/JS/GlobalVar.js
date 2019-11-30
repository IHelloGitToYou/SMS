////////// 文件应用在主窗体，用于缓存数据

/// 所有的基础资料代号， 用于检测手工输入时有无输入正确代号。。
///月头第一天，　最后一天
Ext.Ajax.request({
    url: 'ASHX/Common/SunGridHead.ashx?1=1',
    params: {
        action: 'GetServerSetting',
        mode: 'GetServerSetting'
    },
    success: function (response) {
        var json = Ext.JSON.decode(response.responseText);

        //alert(response.responseText);
        GlobalVar.ServerDate = Ext.Date.parse(json.ServerDate, "Y/m/d");
        
        GlobalVar.MouthFirstDay = GlobalVar.StartDD = Ext.Date.getFirstDateOfMonth(GlobalVar.ServerDate);
        GlobalVar.MouthLastDay = GlobalVar.EndDD = Ext.Date.getLastDateOfMonth(GlobalVar.ServerDate);
        var NowMouth = (GlobalVar.ServerDate).getMonth();
        
        //if (GlobalVar.ServerDate.getDate() >= 26) {
        //    GlobalVar.MouthFirstDay.setMonth(NowMouth, 26);
        //    GlobalVar.MouthLastDay.setMonth(NowMouth + 1, 25);
        //}
        //else {
        //    GlobalVar.MouthFirstDay.setMonth(NowMouth - 1, 26);
        //    GlobalVar.MouthLastDay.setMonth(NowMouth, 25);
        //}
        
        GlobalVar.YearFirstDay = Ext.Date.parse(json.ServerDate, "Y/m/d");
        GlobalVar.YearFirstDay.setMonth(0, 1);

        
        GlobalVar.freeze_date = Ext.Date.parse(json.freeze_date, "Y/m/d");;
    }
});


GlobalVar.DataTypeKey = {};

GlobalVar.PrdtStore = new Ext.data.Store({
    model: 'Model_Prdt',
    pageSize: 1000000,
    proxy: {
        type: 'ajax',
        url: 'ASHX/ashx_SunEditor.ashx?action=GET_PRDT',
        reader: {
            type: 'json',
            root: 'items',
            total: 'total'
        }
    }
}); 
 
GlobalVar.CustStore = new Ext.data.Store({
    model: 'Model_Cust',
    pageSize: 1000000,
    proxy: {
        type: 'ajax',
        url: 'ASHX/ashx_SunEditor.ashx?action=GET_Cust' ,
        reader: {
            type: 'json',
            root :'items',
            total:'total'
        }
    }
});
 

GlobalVar.DeptListStore = new Ext.data.Store({
    model: 'Model_Dept',
    pageSize: 1000000,
    proxy: {
        type: 'ajax',
        url: 'ASHX/ashx_SunEditor.ashx?action=GET_Dept',
        reader: {
            type: 'json',
            root: 'items',
            total: 'total'
        }
    }
});
 

GlobalVar.DeptWpListStore = new Ext.data.Store({
    model: 'Model_DeptWp',
    pageSize: 1000000,
    proxy: {
        type: 'ajax',
        url: 'ASHX/DeptWp.ashx?action=GETDATA',
        reader: {
            type: 'json',
            root: 'items',
            total: 'total'
        }
    }
});
 

GlobalVar.SalmStore = new Ext.data.Store({
    model: 'Model_Salm',
    pageSize: 1000000,
    proxy: {
        type: 'ajax',
        url: 'ASHX/ashx_SunEditor.ashx?action=GET_SALM',
        reader: {
            type: 'json',
            root: 'items',
            total: 'total'
        }
    }
});

GlobalVar.SYSUserStore = new Ext.data.Store({
    model: 'Model_SYSUser',
    proxy: {
        type: 'ajax',
        url: 'ASHX/ashx_SunEditor.ashx?action=GET_SYSUser',
        reader: {
            type: 'json'
        }
    }
});

///尺寸表
GlobalVar.SizesStore = new Ext.data.Store({
    model: 'Sizes_Model',
    pageSize: 1000000,
    proxy: {
        type: 'ajax',
        url: 'ASHX/ashx_SizeControl.ashx?action=GetSizes',
        reader: {
            type: 'json',
            root: 'items',
            total: 'total'
        }
    }
});
GlobalVar.SizesStore.loadPage(1);

GlobalVar.ColorsStore = new Ext.data.Store({
    model: 'Color_Model',
    pageSize: 1000000,
    proxy: {
        type: 'ajax',
        url: 'ASHX/ashx_SunEditor.ashx?action=Load_Colors',
        reader: {
            type: 'json',
            root: 'items',
            total: 'total'
        }
    }
});
GlobalVar.ColorsStore.loadPage(1);

GlobalVar.MaterialStore = new Ext.data.Store({
    model: 'Material_Model',
    pageSize: 1000000,
    proxy: {
        type: 'ajax',
        url: 'ASHX/Material/ashx_Material.ashx?action=Load',
        reader: {
            type: 'json'
        }
    }
});

GlobalVar.RefreshData = function (Ref_Type) {

    //**单独更新**//
    if (Ref_Type) {
        Ref_Type = Ref_Type.toUpperCase();

        if (Ref_Type === 'CUST') {
            GlobalVar.CustStore.loadPage(1);
            GlobalVar.CustStore.TempResultIndex = {};
        }

        if (Ref_Type === 'PRDT') {
            GlobalVar.PrdtStore.load();
            GlobalVar.PrdtStore.TempResultIndex = {};
        }

        if (Ref_Type === 'DEPT') {
            GlobalVar.DeptListStore.loadPage(1);
            GlobalVar.DeptListStore.TempResultIndex = {};
        }

        if (Ref_Type === 'DEPTWP') {
            GlobalVar.DeptWpListStore.loadPage(1,{ params: {
                sqlWhere: ' 1 = 1'
            } });
            GlobalVar.DeptWpListStore.TempResultIndex = {};
        }

        if (Ref_Type === 'SALM') {
            GlobalVar.SalmStore.loadPage(1);
            GlobalVar.SalmStore.TempResultIndex = {};
        }
        if (Ref_Type === 'MATERIAL') {
            GlobalVar.MaterialStore.load();
            GlobalVar.MaterialStore.TempResultIndex = {};
        }
        return true;
    }

    GlobalVar.CustStore.loadPage(1);
    GlobalVar.PrdtStore.load();
    GlobalVar.DeptListStore.loadPage(1);
    GlobalVar.SalmStore.loadPage(1);
    GlobalVar.DeptWpListStore.loadPage(1,{ 
        params: {
            sqlWhere: ' 1 = 1'
        }
    });
    GlobalVar.MaterialStore.load();
    GlobalVar.SYSUserStore.load();

    //运算结果表,节省运算次数
    GlobalVar.CustStore.TempResultIndex = {};
    GlobalVar.PrdtStore.TempResultIndex = {};
    GlobalVar.DeptListStore.TempResultIndex = {};
    GlobalVar.SalmStore.TempResultIndex = {};
    GlobalVar.DeptWpListStore.TempResultIndex = {};
    GlobalVar.MaterialStore.TempResultIndex = {};
    GlobalVar.SYSUserStore.TempResultIndex = {};
}
GlobalVar.RefreshData();



GlobalVar.CheckValid = function (store, fieldName, value) {
    if (value != '') {
        var R = store.findRecord(fieldName, value);
        if (null == R) {
            CommMsgShow('警告', '不存在该代号！！' + String(value));
            return null;
        }
        else
            return R;
    }
}

GlobalVar.GetRecord = function (getType, searchNo, caseSensitive) {
    //
    getType = getType.toUpperCase();
    if (Ext.typeOf(searchNo) == 'undefined')
        return null;

    ////if (getType === 'COLOR') {
    ////    console.log(arguments);
    ////    alert(Ext.typeOf(searchNo));
    ////}

    if (Ext.typeOf(searchNo) == 'number') {
        searchNo = searchNo.toString();
    }

    var store,
        searchField = '',
        i = 0,
        cnt = 0,
        caseSensitive = (caseSensitive || false);

    if (getType === 'PRDT') {
        store = GlobalVar.PrdtStore; //.findRecord('prd_no', searchNo, 0, false);
        searchField = 'prd_no';
    }
    else if (getType === 'CUST') {
        store = GlobalVar.CustStore;
        searchField = 'cus_no';
    }
    else if (getType === 'DEPT') {
        store = GlobalVar.DeptListStore;
        searchField = 'dep_no';
    }
    else if (getType === 'DEPTWP') {
        store = GlobalVar.DeptWpListStore;
        searchField = 'dep_no';
    }
    else if (getType === 'SALM') {
        store = GlobalVar.SalmStore;
        searchField = 'user_no';
    }
    else if (getType === 'SYSUSER') {
        store = GlobalVar.SYSUserStore;
        searchField = 'user_no';
    }
    else if (getType === 'COLOR') {
        store = GlobalVar.ColorsStore;
        searchField = 'color_id';
    }
    else if (getType === 'MATERIAL') {
        store = GlobalVar.MaterialStore;
        searchField = 'material_id';
    }
    else {
        return null;
    }

    cnt = store.getCount();
    if (!store.TempResultIndex)
        store.TempResultIndex = {};

    //在之前匹配过, 节省运算
    if (Ext.typeOf(store.TempResultIndex[searchNo]) != 'undefined') {
        i = store.TempResultIndex[searchNo];
        return store.getAt(i);
    }

    var value = '',
        upperSearchNo = searchNo.toUpperCase();
    for (i = 0; i < cnt; ++i) {
        value = store.getAt(i).get(searchField); //console.log({ v: value, searchNo: searchNo });
        if(value != null){
            value = value.toString();
        }
        if (caseSensitive) {
            if (value === searchNo) {
                store.TempResultIndex[value] = i;
                return store.getAt(i);
            }
            else {
                //查找到匹配前需记忆,不要下次查时再跑一次!!! 2015-07-25 09:39耀
                store.TempResultIndex[value] = i;
            }
        }
        else if (value.toUpperCase() === upperSearchNo) {
            return store.getAt(i);
        }
    }
    
    return null;
}

GlobalVar.rdDeptName = function (dep_no) {
    var rec = GlobalVar.GetRecord('DEPT', dep_no, true);
    if (!rec)
        return '';
    return rec.get('name');
}

GlobalVar.rdDeptWPName = function (dep_no) {
    var rec = GlobalVar.GetRecord('DEPTWP', dep_no, true);
    if (!rec)
        return '';
    return rec.get('name');
}


GlobalVar.rdCustName = function (cus_no) {
    var rec = GlobalVar.GetRecord('CUST', cus_no, true);
    if (!rec)
        return '';
    return rec.get('name');
}


GlobalVar.rdPrdtName = function (prd_no) {
    var rec = GlobalVar.GetRecord('PRDT', prd_no, true);
    if (!rec)
        return '';
    return rec.get('name');
}


GlobalVar.rdSalmName = function (sal_no) {
    var rec = GlobalVar.GetRecord('SALM', sal_no, true);
    if (!rec)
        return '';
    return rec.get('name');
}

GlobalVar.rdSYSUserName = function (user_no) {
    var rec = GlobalVar.GetRecord('SYSUSER', user_no, true);
    if (!rec)
        return '';
    return rec.get('name');
}

GlobalVar.rdMaterialPrdtNo = function (material_id) {
    var rec = GlobalVar.GetRecord('MATERIAL', material_id, true);
    if (!rec)
        return '';
    return rec.get('prd_no');
}

GlobalVar.rdMaterialName = function (material_id) {
    var rec = GlobalVar.GetRecord('MATERIAL', material_id, true);
    if (!rec)
        return '';
    return rec.get('name');
}

GlobalVar.rdMaterialPrice = function (material_id) {
    var rec = GlobalVar.GetRecord('MATERIAL', material_id, true);
    if (!rec)
        return 0;
    return rec.get('price');
}


//// 
//// 得到当前用户所有的列布局信息
///  作者 李耀潮 时间 2014-1-6晚
GlobalVar.NowGridColInfoStore = Ext.create('Ext.data.Store',{
    model: 'SunGrid.Model',
    proxy: {
        type: 'ajax',
        url: 'ASHX/Common/SunGridHead.ashx?1=1',  

        reader:{ 
            type:'json'
        }
    },
    autoLoad: false
}); 

GlobalVar.NowGridColInfoStore.load({
    params: {
        mode: 'loaddata',
        isReconfig: false,
        NeedSaveLastTime_GridId: false,
        SearchConditions: 'userId=\'' + GlobalVar.NowUserId + '\'',
        userId: GlobalVar.NowUserId
    }
});

//////////////////////////////////////////////////////////////////////////////



  
////*****  通过单号,单类,打开单据窗体 **///
 
GlobalVar.monitorOpenTable = function (vgrid, monitorOpenTableCols) {
    if (!monitorOpenTableCols || Ext.typeOf(monitorOpenTableCols) != 'array')
        return false;

    if (monitorOpenTableCols.length <= 0)
        return false;
    //删除旧的事件
    if (vgrid.oldCellClickMonitor2) {
        vgrid.un('celldblclick', vgrid.oldCellClickMonitor2);
    }

    vgrid.monitorOpenTableCols = monitorOpenTableCols;

    vgrid.oldCellClickMonitor2 = function (grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
        var i = 0,
            cnt = vgrid.monitorOpenTableCols.length;
        for (; i < cnt; ++i) {
            var dataIndex = vgrid.headerCt.getHeaderAtIndex(cellIndex).dataIndex,
                zr_no = vgrid.monitorOpenTableCols[i].zr_no,
                zr_id = vgrid.monitorOpenTableCols[i].zr_id;

            if (zr_no === dataIndex) {
                ///打开单据号码
                if (window.parent && window.parent.GlobalVar) {
                    window.parent.GlobalVar.TableNoOpen(record.get(zr_id), record.get(zr_no));
                }

                break;
            }
        }
    }
    vgrid.on('celldblclick', vgrid.oldCellClickMonitor2);

    var i = 0,
        cnt = vgrid.monitorOpenTableCols.length;
    for (; i < cnt; ++i) {
        var zr_no = vgrid.monitorOpenTableCols[i].zr_no,
            zr_id = vgrid.monitorOpenTableCols[i].zr_id,
            zr_col = vgrid.down('[dataIndex=' + zr_no + ']');

        if (!zr_col)
            continue;

        var osEditor = zr_col.getEditor();
        if (osEditor) {

            osEditor.monitorZrNo = zr_no;
            osEditor.monitorZrId = zr_id;
            osEditor.on('boxready', function (box) {
                //删除旧的事件
                if (box.dblFn)
                    box.getEl().un(box.dblFn);

                box.dblFn = function () {
                    var sels = vgrid.getSelectionModel().getSelection(),
                        selRow;
                    if (sels.length <= 0)
                        return true;

                    selRow = sels[0];
                    if (window.parent && window.parent.GlobalVar) {
                        window.parent.GlobalVar.TableNoOpen(selRow.get(osEditor.monitorZrId), selRow.get(osEditor.monitorZrNo));
                    }
                }


                box.getEl().on('dblclick', box.dblFn);
            });
        }
    }


}


// 传入窗体的命令: {action: 'openTable', table_id: table_id, table_no: table_no}
GlobalVar.TableNoOpen = function (table_id, table_no, openAddParams) {
    var fnOpenWindow;
    if (window.parent && window.parent.openWindow)
        fnOpenWindow = window.parent.openWindow;

    if (!fnOpenWindow) {
        alert('打开单击出错:原因单据不在主介面之下');
        return false;
    }

    fnOpenWindow({
        text: GlobalVar.TableIdRenderer(table_id),
        url: GlobalVar.TableNoUrl(table_id), 
        menu_no: '',
        params: { action: 'openTable', table_id: table_id, table_no: table_no}
    });
}


GlobalVar.DblClickOpenTable = function (view, record) {
    var table_type = record.get('table_type'),
        tabke_text = GlobalVar.TableIdRenderer(table_type),
        tabke_url = GlobalVar.TableNoUrl(table_type);

    var openWinObj = {
        table_type: table_type,
        text: tabke_text,
        menu_no: 'C1_1', //随便一下权限先,
        url: tabke_url
    };

    openWinObj.params = {
        action: 'openTable',
        table_type: table_type,
        table_no: record.get('table_no')
    };

    openWindow(openWinObj);
}

//导出到Excel的方法 1.gridToHtml 
GlobalVar.gridToHtml= function (gridObj, fnRendererScore, GridLockAndNomarls, fnBeforeGenarateExcel) {
    var T = gridObj.getView().getHeaderCt != null ? gridObj.getView().getHeaderCt() : gridObj.getView().headerCt;

    var cmObj = T,
        cols = GlobalVar.GetVisiableColumns(cmObj.getGridColumns()),
        TopCols = GlobalVar.GetVisiableColumns(T.getGridColumns());
    var storeObj = gridObj.getStore();
    var dom_room, dom_table, dom_thead, dom_tr, dom_td, dom_tbody, dom_txt;
    dom_room = document.createElement('div');
    dom_table = document.createElement('table');
    dom_thead = document.createElement('thead');
    dom_tbody = document.createElement('tbody');
    dom_trA = document.createElement('tr');
    dom_trB = document.createElement('tr');

    if (fnBeforeGenarateExcel)
        fnBeforeGenarateExcel(dom_table, dom_thead, dom_tbody);


    var hadGroupCol = true,
        AddedGroupColIds = {},
        dataIndexBelongGridView = {};
    //查是不是一个分组Grid 
    for (var i = 0; i < TopCols.length; ++i) {
        var colObj = TopCols[i];
        if (colObj.checked == false)
            continue;
        if (colObj.ownerCt && colObj.ownerCt.isGroupHeader == true) {
            hadGroupCol = true;
            break;
        }
    }

    for (var i = 0; i < TopCols.length; ++i) {
        var colObj = TopCols[i],
        colText = colObj.text == "&#160;" ? '' : (colObj.text || '');

        if (colObj.hidden == true)
            continue;
        if (hadGroupCol == true) {
            var isGroupHeader = (colObj.ownerCt && colObj.ownerCt.isGroupHeader == true);
            if (isGroupHeader === true) {
                if (!AddedGroupColIds[colObj.ownerCt.id]) {
                    var subLn = colObj.ownerCt.items.items.length,
                        headerText = colObj.ownerCt.text,
                        align = colObj.ownerCt.align,
                        subWidths = 0;

                    for (var z = 0; z < subLn; ++z)
                        subWidths += colObj.ownerCt.items.items[z].width;

                    var dom_tdA = document.createElement('td');
                    dom_tdA.noWrap = true;
                    dom_tdA.colSpan = subLn;
                    dom_tdA.width = subWidths;
                    dom_tdA.align = align;

                    dom_txtA = document.createTextNode(headerText || '');
                    dom_tdA.appendChild(dom_txtA);
                    dom_trA.appendChild(dom_tdA);   //加分组td  
                    // console.log(dom_tdA); 
                    AddedGroupColIds[colObj.ownerCt.id] = colObj.ownerCt;
                }

                var dom_tdB = document.createElement('td');
                dom_tdB.noWrap = true;
                dom_tdB.width = colObj.width;
                dom_tdB.align = colObj.align;
                var dom_txtB = document.createTextNode(colText);
                dom_tdB.appendChild(dom_txtB);
                dom_trB.appendChild(dom_tdB); //加分组td 

            }
            else {
                var dom_tdA = document.createElement('td');
                dom_tdA.noWrap = true;
                dom_tdA.rowSpan = 2;
                dom_tdA.width = colObj.width;
                dom_tdA.align = colObj.align;

                dom_txtA = document.createTextNode(colText);
                dom_tdA.appendChild(dom_txtA);
                dom_trA.appendChild(dom_tdA);   //加分组td  
            }
        } //End if (hadGroupCol == true)
        else {
            var dom_tdA = document.createElement('td');
            dom_tdA.noWrap = true;
            dom_tdA.width = colObj.width;
            dom_tdA.align = colObj.align;

            dom_txtA = document.createTextNode(colText.replace('&nbsp', ' '));
            dom_tdA.appendChild(dom_txtA);
            dom_trA.appendChild(dom_tdA);   //加分组td  
        }
    }

    dom_thead.appendChild(dom_trA);
    if (hadGroupCol == true)
        dom_thead.appendChild(dom_trB);
    //查列元素数组中,列的位置
    var fnTempFindCol_Index = function (fields, dataIndex) {
        for (var p = 0; p < fields.items.length; ++p) {
           
            if (fields.items[i].name == dataIndex)
                return p;
        }

        return -1;
    }

    var ModelFieldsObjs = {};
    try {

        var storeCnt = storeObj.getCount();
        for (i = 0; i < storeCnt; i++) {
            dom_tr = document.createElement('tr');
            var rec = storeObj.getAt(i);
            var recNodeOf_TR= gridObj.getView().getNode(i);
             
            for (var j = 0; j < cols.length; j++) {
                var txt = '',
                dataIndex = cols[j].dataIndex,
                value = rec.get(dataIndex);
                isRownumberer = cols[j].xtype == 'rownumberer' ? true : false;
                valType = Ext.typeOf(value);

                //在第一行时　保存列的引用
                if (i === 0) {
                    var colIdx = fnTempFindCol_Index(rec.fields, dataIndex);
                    if (colIdx > 0)
                        ModelFieldsObjs[dataIndex] = rec.fields[colIdx];
                    /// ModelFieldsObjs[dataIndex] = rec.fields.get(dataIndex); //5.00不支持
                }
                dom_td = document.createElement('td');
                //dom_td.setAttribute('style', 'word-wrap:break-word;');
                //dom_td.width = 80;

                if (isRownumberer === true) {
                    txt = i + 1;
                }
                else if(cols[j].xtype == 'checkcolumn')
                    txt = value ? 'T' : '';
                else if (cols[j].renderer) {
                    try {
                        var tdMate = recNodeOf_TR.children[j];
                        var gridView = null;
                        if (!dataIndexBelongGridView[dataIndex]) {
                            gridView = GlobalVar.GetRealGridView(GridLockAndNomarls, gridObj, dataIndex);
                            dataIndexBelongGridView[dataIndex] = gridView;

                            //console.log(dataIndex + " " + gridView.getGridColumns().length);
                        }
                        else {
                            gridView = dataIndexBelongGridView[dataIndex];
                        }

                       var realColumnIndex = GlobalVar.GetRealGridViewColumnIndex(gridView, dataIndex)

                        txt = Ext.callback(cols[j].renderer, fnRendererScore,
                            [
                                value,
                                tdMate,
                                rec,
                                i,
                                realColumnIndex,   //cols[j].getIndex() 
                                storeObj,
                                dataIndexBelongGridView[dataIndex]
                            ]);

                        //txt = cols[j].renderer(value, tdMate, 
                        //    rec, i, cols[j].getIndex(),
                        //    storeObj, gridObj.getView());
                    }
                    catch (ex) {
                        console.log(ex);
                        txt = value;
                    }
                }
                else {
                    if (valType == 'boolean')
                        txt = value ? 'T' : '';
                    else
                        txt = value;
                }

                var MType = '';
                //console.log(ModelFieldsObjs);
                if (isRownumberer === false)
                    MType = ModelFieldsObjs[dataIndex] && ModelFieldsObjs[dataIndex].type.type;
                else
                    MType = 'float';
                //console.log(MType) //数字列右对齐
                if (MType == 'number' || MType == 'int' || MType == 'float') {
                    dom_td.setAttribute('align', 'right');
                    if (txt == 0)
                        txt = '';
                }
                txt = txt || '';

                dom_txt = document.createTextNode(
                    GlobalVar.ReplaceEmptyHtmlContent(txt.toString()));

                dom_td.appendChild(dom_txt);
                dom_tr.appendChild(dom_td);
            }

            dom_tbody.appendChild(dom_tr);
        } //for
    }
    catch (e) {
        alert(e.toString());
    }

    dom_table.appendChild(dom_thead);
    dom_table.appendChild(dom_tbody);
    dom_room.appendChild(dom_table);
    return dom_room;
}

//GridLockAndNomarls= {
//    normalGrid: Ext.getCmp(WQGrid.getId() + '-normal'),
//    lockGrid: Ext.getCmp(WQGrid.getId() + '-locked')
//}
GlobalVar.GetRealGridView = function (GridLockAndNomarls, MainGrid, dataIndex) {
    if (!GridLockAndNomarls)
        return MainGrid.getView();

    if (GridLockAndNomarls.lockGrid && GridLockAndNomarls.normalGrid) {
        var get = false;
        Ext.Array.each(GridLockAndNomarls.lockGrid.getView().getGridColumns(), function (column, index) {
            if (column.dataIndex == dataIndex) {
                get = true;
                return;
            }
        });

        if (get)
            return GridLockAndNomarls.lockGrid.getView();

        Ext.Array.each(GridLockAndNomarls.normalGrid.getView().getGridColumns(), function (column, index) {
            if (column.dataIndex == dataIndex) {
                get = true;
                return;
            }
        });

        if (get)
            return GridLockAndNomarls.normalGrid.getView();

        console.log('导出异常找不到Excel视图！' + dataIndex);

        return null;

    }
}


GlobalVar.GetRealGridViewColumnIndex = function(RealGridView, dataIndex){
    var inx = -1;
    Ext.Array.each(RealGridView.getGridColumns(), function (column, index) {
        if (column.dataIndex == dataIndex) {
            inx = index;
            return;
        }
    });

    return inx;
}

GlobalVar.GetVisiableColumns = function (Columns) {
    var array = [];
    Ext.Array.each(Columns, function (column, index) {
        if (!column.hidden) {
            array.push(column);
        }
    });

    return array;
}
//有固定列的表格，需要这参数 ，因RenderCell中View是错误的。GridLockAndNomarls= {
//    normalGrid: Ext.getCmp(WQGrid.getId() + '-normal'),
//    lockGrid: Ext.getCmp(WQGrid.getId() + '-locked')
//}
GlobalVar.ToExcel = function (ExtGrid, sheetName, fnRendererScore, GridLockAndNomarls, fnBeforeGenarateExcel) {
    var me = this;
    var tableToExcel = (function () {
        var uri = 'data:application/vnd.ms-excel;base64,',
        template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
        base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); },
        format = function (s, c) {
            return s.replace(/{(\w+)}/g,
            function (m, p) { return c[p]; })
        }

        return function (innerHTML, name) {
            var ctx = { worksheet: name || 'Worksheet', table: innerHTML }
            var ExcelExportData = uri + base64(format(template, ctx));
            window.location.href = ExcelExportData
        }
    })();

    var gridHtml = GlobalVar.gridToHtml(ExtGrid, fnRendererScore, GridLockAndNomarls, fnBeforeGenarateExcel);
    //document.getElementById('divHide').innerHTML = gridHtml.innerHTML;
    //console.log(gridHtml.innerHTML);
    tableToExcel(gridHtml.innerHTML, sheetName || 'sheet1');

    gridHtml = '';
    delete gridHtml;
}


GlobalVar.ReplaceEmptyHtmlContent = function (txt) {
    txt = txt || '';
    while (txt.search("&nbsp") >= 0) {
        txt = txt.toString().replace("&nbsp", " ", "gi");
    }

    return txt;
}

///Store数据成Json
GlobalVar.TranStoreToJson = function (targerJson, gridStore, fnCheckRecord, P_FieldName_AddPart, P_FieldName_EndPart) {
    var recFields = [],
        fieldName = '',
        P_FieldName_AddPart = P_FieldName_AddPart || '',
        P_FieldName_EndPart = P_FieldName_EndPart || '';
    var i = 0,
        cnt = gridStore.getCount(),
        bodyCntName = P_FieldName_AddPart + 'bodyCnt' + P_FieldName_EndPart;
    targerJson[bodyCntName] = 0;

    for (; i < cnt; ++i) {
        var rec = gridStore.getAt(i);
        //console.log(rec);
        if (i == 0) 
            recFields = rec.fields;
        //自我的判断方法,检测每一行数据是否合法，不合法则终止提取方法
        if (fnCheckRecord && Ext.typeOf(fnCheckRecord) == 'function') {
            if (fnCheckRecord(rec) === false) {
                return false;
            }
        }
        //例子
        //P['sort_' + P.bodyCnt] = rec.get('sort');
        //console.log([recFields, rec]);
        for (var j = 0; j < recFields.items.length; ++j) {
            var col = recFields.items[j];

            fieldName = col.name;
            var type = col.type.type,
                UserFieldName = P_FieldName_AddPart + fieldName + P_FieldName_EndPart + '_' + targerJson[bodyCntName];


            if (type == 'date') {
                var dateValue = Ext.Date.format(rec.get(fieldName), 'Y/m/d');
                targerJson[UserFieldName] = dateValue;
            }
            else if (type == 'string') {
                var valueStr = rec.get(fieldName) || '';
                targerJson[UserFieldName] = valueStr;
                //处理特殊字符 ",成全角符 ,会影响Json结构
                if (valueStr && valueStr.indexOf && valueStr.indexOf('"') >= 0) {
                    targerJson[UserFieldName] = valueStr.replace(/["]/g, "“");
                }
            }
            else
                targerJson[UserFieldName] = rec.get(fieldName);
        }
        ++targerJson[bodyCntName];
    }
    return targerJson;
}