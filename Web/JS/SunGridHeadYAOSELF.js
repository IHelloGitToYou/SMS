        //*
        /////
        ///  重大修改 
        /// 作者  : 李耀潮
        /// 时间  : 2014-1-6晚
        /// 修改内容：　为增快加载单据的速度。　列的布局作缓存。
        ///             在Js 在MainPage　表头中GlobalVar.js加载当前用户所有列布局   变量　GlobalVar.NowGridColInfoStore
        ////             始后行布局更改都同步在操作缓存中（也直接向后台更新）. 
        //*/
        
        var SunGridLoadMask ;
        Ext.onReady(function(){
            SunGridLoadMask = new Ext.LoadMask(Ext.getBody(), {msg:"加载中，请等等..."});
        });
        
       
        Ext.define('SunGridClass', {
            extend: 'Ext.panel.Panel',
            alias: 'widget.SunGrid',
            layout: 'fit',
            autoScroll: true,
            gridID: 'xxxxx',
            pageID: 'xxxxx',
            columnsCount: 0,
            CompanyCDNO: 'xxxxx',
            NowUserId: GlobalVar.NowUserId,
            SaveMode: '1', // 保存Cols布局模式 1.每变一次直接保存(buffer 3秒)。2.关闭时 才手动触发保存
            IsConfigIng: false,
            NeedSaveLastTime_GridId: false,        // 需要下次打开记录上次的列布局？ 通常用于报表， 调整单也用，　监控数据库中当前的gridId，且加载它
            UpdateJobs: [],
            hideHeaders: false,
            //通知此变量限制只，执行一次
            meRendered: false,
            // 同三秒内的提交，只执行一次 
            ////         用了缓存功能，些功能　作废
            AddUpdateJob: function (fme) {
                if (fme.UpdateJobs.length == 0) {
                    // Common_RunDelayFn(fme.UpdateColumns, 5000, this, fme);
                    var task = new Ext.util.DelayedTask(function () {
                        fme.UpdateColumns(fme);
                    });
                    task.delay(3000);
                }

                fme.UpdateJobs.push(Date());
            },

            UpdateColumns: function (fme) {
                if (fme.UpdateJobs.length > 0) {
                    fme.getAndPostColumnHeadStyle(fme.grid);
                    //清空命令
                    fme.UpdateJobs = [];
                }
            },

            getDefaultColumnsSetting: Ext.emptyFn,

            getColumn: function (c_dataIndex) {
                var me = this;
                if (!me.defaultColumns) {
                    //深复制数组元素，不要保存数组元素的引用
                    //console.log('Copy ok');
                    me.defaultColumns = [];
                    var cols = me.getDefaultColumnsSetting();

                    var ln = cols.length;
                    for (var i = 0; i < ln; ++i) {
                        var col = cols[i];
                        if (col.editor)
                            Ext.Object.merge(col.editor, { selectOnFocus: true });

                        var rec = {
                            text: col.text ? col.text : col.header,
                            name: col.dataIndex,
                            dataIndex: col.dataIndex,
                            hidden: (col.hidden == 'true' || col.hidden == true) ? true : false,
                            width: Number((col.width || 80)),
                            editor: col.editor,
                            renderer: col.renderer,
                            xtype: col.xtype,
                            format: col.format,
                            itemId: col.itemId,
                            sortable: Ext.typeOf(col.sortable) === 'boolean' ? col.sortable : true,
                            summaryType: col.summaryType,
                            summaryRenderer: col.summaryRenderer,
                            filter: col.filter,
                            IsRownumberer: col.IsRownumberer || false, //Ext.typeOf(col.IsRownumberer) === 'boolean' ? col.IsRownumberer : false, 
                            listeners: col.listeners,

                            //查询Grid特有
                            Txtype: col.xtype,
                            tdCls: col.tdCls
                        }
                        me.defaultColumns.push(rec);
                    }
                }

                var ln = me.defaultColumns.length;

                for (var i = 0; i < ln; ++i) {
                    if (me.defaultColumns[i].dataIndex == c_dataIndex) {
                        return me.defaultColumns[i];
                    }
                }
                return null;
            },

            // 返回无被加载的列
            getNoBulidColumn: function () {
                var me = this, resCols = [], itm = 0;

                Ext.Array.each(me.defaultColumns, function (col) {
                    if (!col.had_add) {
                        col.hidden = true;      //新栏位显示
                        if (col.IsRownumberer == true)
                            resCols[itm++] = { header: '序', xtype: 'rownumberer', hidden: false }
                        else
                            resCols[itm++] = col;
                    }
                });

                return resCols;
            },

            //重设Grid
            reconfig: function (p_gridID, p_pageID, p_strSort, p_fnGetDefaultColumnsSetting) {
                this.IsConfigIng = true;
                this.gridID = p_gridID;
                this.pageID = p_pageID;
                this.strSort = p_strSort;
                this.getDefaultColumnsSetting = p_fnGetDefaultColumnsSetting;
                //重设Grid
                this.defaultColumns = undefined;
                this.loadColumnHeadStyle(true, false);
            },


            bulidColumn1: function (result) {

                var me = this, resCol = null;
                if (result.length <= 0)
                    return null;

                var datas = Ext.JSON.decode(result[0].cellSetting);
                if (!datas)
                    return null;
                //保存列数
                var count = me.columnsCount = datas.length, itm = -1,
                     columns = [],
                     HadRownumberer = false,
                     ExsistShowCol = false;

                for (var i = 0; i < count; ++i) {

                    var col = me.getColumn(datas[i].name),
                        colHidden = datas[i].hidden == 'false' ? false : true, //Boolean(),
                        colWidth = Number(datas[i].width);

                    if (!col || (col.had_add && col.had_add == true))
                        continue;

                    if (colHidden === false) {
                        ExsistShowCol = true;
                    }

                    if (col.IsRownumberer == true) {
                        HadRownumberer = true;
                        col.had_add = true;
                        continue;
                    }

                    ++itm;
                    ///数据库内的布局
                    columns[itm] = {
                        text: col.text ? col.text : col.header,
                        name: datas[i].name,
                        dataIndex: col.dataIndex,
                        hidden: colHidden,
                        width: Number((colWidth || col.width)),
                        editor: col.editor, // Ext.Object.merge(col.editor, CommonVar.GetColCopyFnMonitor('', '')) ,
                        xtype: col.xtype,
                        format: col.format,
                        itemId: col.itemId,
                        summaryType: col.summaryType,
                        summaryRenderer: col.summaryRenderer,
                        filter: col.filter,
                        sortable: col.sortable,

                        //查询Grid特有
                        Txtype: col.xtype,
                        tdCls: col.tdCls
                    }

                    if ((col.xtype || '') != 'checkcolumn') {
                        if (col.renderer) {
                            columns[itm].renderer = col.renderer;
                        }
                    }
                    else
                        columns[itm].listeners = col.listeners;

                    //记录已被加载的列
                    col.had_add = true;
                }   //for

                //新增加栏位放在最左边
                Ext.Array.insert(columns, 0, me.getNoBulidColumn());

                if (HadRownumberer == true) {
                    Ext.Array.insert(columns, 0, [{ header: '序', xtype: 'rownumberer', width: 35, hidden: false}]);
                }

                if (ExsistShowCol == false) {
                    columns[0].hidden = false;
                }

                return columns
            },
            fnCreateGrid: function (p_tempArray1) {
                // alert('fnCreateGrid');
                //console.log(p_tempArray1);
                var me = this, editorObj, selModelObj, features;
                if (!me.cellEditing)
                    editorObj = [];
                else
                    editorObj = [me.cellEditing];

                selModelObj = me.selModel ? me.selModel : null;
                features = me.features ? me.features : null;

                //如果不存在则,用默认的
                //console.log(me.getRowClass);
                me.grid = Ext.create('Ext.grid.Panel', {
                    //flex: 1,
                    //invalidateScrollerOnRefresh: false,
                    columnLines: true,
                    rowLines: true,
                    autoScroll: true,
                    store: me.store,
                    columns: p_tempArray1 == null ? me.getDefaultColumnsSetting() : p_tempArray1,
                    style: 'margin:0px',
                    minHeight: (me.myMinHeight >= 0) ? me.myMinHeight : 50,
                    plugins: editorObj,
                    selModel: selModelObj,
                    features: features,
                    itemId: 'gridID',
                    ChangedColumnSort: false,
                    enableColumnMove: Ext.typeOf(me.enableColumnMove) == 'boolean' ? me.enableColumnMove : true,
                    hideHeaders: me.hideHeaders || false,
                    viewConfig: {
                        preserveScrollOnRefresh: true,
                        listeners: {
                            containerdblclick: function () {
                                me.fireEvent('containerdblclick');
                            }
                        },
                        getRowClass: me.getRowClass ? me.getRowClass : function () { return ''; }
                    },
                    //bbar : (me.IsPadding == true && me.bbarCfg) ? Ext.apply(this, me.bbarCfg) : undefined,
                    //selType: 'cellmodel',
                    listeners: {
                        boxready: {
                            fn: function () {
                                //通知此变量限制只，执行一次
                                if (me.meRendered == false) {
                                    //加载完成自定义事件
                                    me.fireEvent('MyRender', me, me.grid);
                                    me.fireEvent('MyRender_OnReal', me, this);

                                    me.meRendered = true;

                                    //滚动条信息,保存
                                    me.grid.getView().getEl().on('scroll', function () {
                                        if (!window.parent)
                                            return false;
                                        var el = me.grid.getView().getEl();
                                        if (el.preventUploadScrollData)
                                            return false;

                                        //console.log('getScroll');
                                        //var scrollData = el.getScroll();
                                        //var pageId = window.parent.tabPanel.getActiveTab().itemId;
                                        //window.parent.tabPanel.getComponent(pageId).fireEvent('sent', 'save_scroll', { gridId: me.grid.getId(), scrollData: scrollData });
                                    },
                                    this,
                                    { buffer: 200 });
                                }
                            },
                            buffer: 0
                        },
                        afterrender: {
                            fn: function () {
                                //                                console.log('start frie afterrender ');
                            },
                            buffer: 0
                        },
                        columnresize: function (ct, column, width, eOpts) {
                            if (me.IsConfigIng == true)
                                return false;
                            me.getAndPostColumnHeadStyle(me.grid);
                        },
                        columnmove: function (ct, column, width, eOpts) {
                            if (me.IsConfigIng == true)
                                return false;

                            me.getAndPostColumnHeadStyle(me.grid);
                        },
                        columnhide: function (ct, column, width, eOpts) {
                            if (me.IsConfigIng == true)
                                return false;

                            //放入提交命令
                            me.getAndPostColumnHeadStyle(me.grid);
                        },
                        columnshow: function (ct, column, width, eOpts) {
                            if (me.IsConfigIng == true)
                                return false;

                            //放入提交命令
                            me.getAndPostColumnHeadStyle(me.grid);
                        },
                        buffer: 3 * 1000,
                        containercontextmenu: {
                            fn: function (vthis, e, eOpts) {
                                e.preventDefault();
                            },
                            buffer: 0
                        },
                        itemcontextmenu: {
                            fn: function (vthis, record, item, index, e, eOpts) {
                                e.preventDefault();
                            },
                            buffer: 0
                        }
                    }
                });
                //End Grid   
                me.add(me.grid);
            },
            //**** 后果记录, 当前布局选项　*//
            updateLastPos: function (specical_GridId) {
                var me = this;
                Ext.Ajax.request({
                    type: 'post',
                    url: me.url,
                    params: {
                        //SearchConditions: ' gridId=\'' + me.gridID + '\' and pageId=\'' + me.pageID + '\'and userId=\'' + me.NowUserId + '\'',
                        mode: 'updateLastPos',
                        gridId: (specical_GridId || me.gridID),
                        pageId: me.pageID,
                        userId: me.NowUserId,
                        SwitchGridId: (me.SwitchGridId || '')
                    },
                    success: function (response) {

                    },
                    failure: function () {

                    }
                });
            },

            //参数 IsReconfig 代表本次加载是重载Grid
            //***** IsReconfig: 本次加载是重载Grid ******///
            //***** IsFirstLoad: 初次加载？　如果是则加载最近一次记录 ******///
            loadColumnHeadStyle: function (IsReconfig, IsFirstLoad) {
                //SunGridLoadMask.show(); SunGridLoadMask.hide();
                var me = this,
                    hadCache = false,
                    NowGridColInfoStore,
                    IsReconfigBool = (IsReconfig || false),
                    NeedSaveLastTime_GridIdBool = (me.NeedSaveLastTime_GridId || false);

                if (window.parent && window.parent.GlobalVar) {
                    hadCache = true;
                    NowGridColInfoStore = window.parent.GlobalVar.NowGridColInfoStore;
                }

                var fnDoLayout = function (p_result, p_tempArray1, p_IsReconfig) {
                    var tempArray1;
                    try {
                        tempArray1 = me.bulidColumn1(p_result);
                    }
                    catch (e) {
                        tempArray1 = null;
                    }
                    finally {
                        //console.log('真实加载信息 ' + me.gridID);
                        if (p_IsReconfig == false) {
                            me.fnCreateGrid(tempArray1);
                            me.IsConfigIng = false;
                        }
                        else {
                            //IsReconfig = true;
                            //console.log({ t: 'reconfigure', grid: me.grid, defCols: tempArray1 == null ? me.getDefaultColumnsSetting() : tempArray1 });
                            if (!me.grid) {
                                me.fnCreateGrid(tempArray1 == null ? me.getDefaultColumnsSetting() : tempArray1);
                                me.IsConfigIng = false;
                                return false;
                            }
                            me.grid.reconfigure(me.grid.getView().getStore(),
                                tempArray1 == null ? me.getDefaultColumnsSetting() : tempArray1
                            );

                            me.IsConfigIng = false;
                        }

                        //                        if (NeedSaveLastTime_GridIdBool === true && IsReconfig === true) {
                        //                            me.updateLastPos();
                        //                        }
                    }
                }


                if (hadCache == false || (me.NeedSaveLastTime_GridId == true && IsFirstLoad == true)) {
                    //console.log('后台加载中');
                    Ext.Ajax.request({
                        type: 'post',
                        url: me.url,
                        params: {
                            mode: 'loadData',
                            gridId: me.gridID,
                            pageId: me.pageID,
                            userId: me.NowUserId,

                            isSwitchGrid: NeedSaveLastTime_GridIdBool,
                            isReconfig: IsReconfigBool,
                            FindLastTime_GridId: (NeedSaveLastTime_GridIdBool == true && IsFirstLoad == true),
                            SwitchGridId: (me.SwitchGridId || '')
                        },
                        success: function (response) {
                            var result = Ext.JSON.decode(response.responseText);

                            if ((me.NeedSaveLastTime_GridId == true && IsFirstLoad == true)) {
                                //console.log('是初始加载，切换');
                                if (result.length > 0) {
                                    me.gridID = result[0].gridId;
                                }

                                var defaultColsFn = me.AllFnDefaultColumns[me.gridID];
                                if (defaultColsFn) {
                                    me.getDefaultColumnsSetting = defaultColsFn;
                                }
                                else {
                                    alert("找不到，对应切换的列布局，本窗体取消加载，以防触发其他错误");
                                    return false;
                                }
                            }

                            fnDoLayout(result, null, IsReconfigBool);
                        }
                    }); //ajax
                    return 0;
                }

                ///1.从缓存中抓列布局
                if (hadCache == true && NowGridColInfoStore) {
                    /// me.NeedSaveLastTime_GridId= true;
                    //找缓存

                    var matchedCellSetting = '';
                    var idx = 0;
                    do {
                        idx = NowGridColInfoStore.find('pageId', me.pageID, idx + 1);
                        if (idx < 0)
                            break;

                        var recTemp = NowGridColInfoStore.getAt(idx);
                        if (recTemp && recTemp.get('gridId') == me.gridID) {
                            matchedCellSetting = recTemp.get('cellSetting');
                            break;
                        }
                    } while (idx > 0)

                    fnDoLayout([{ cellSetting: matchedCellSetting}], null, IsReconfig);
                    //使用缓存时，切换的话，要后台手动更改，当前选项
                    if (NeedSaveLastTime_GridIdBool === true && IsReconfig === true) {
                        me.updateLastPos();
                    }
                }
            },

            //update
            postColumnHeadStyle: function (json) {
                var me = this;
                Ext.Ajax.request({
                    type: 'post',
                    url: me.url,
                    params: {
                        mode: 'update',
                        gridId: me.gridID,
                        pageId: me.pageID,
                        cellSetting: json,
                        userID: GlobalVar.NowUserId
                        //                        strSort: me.strSort
                    },
                    success: function (response) {
                        var result = Ext.JSON.decode(response.responseText);
                        if (result.msg == true) {
                            //alert('保存success');
                        }
                    }
                }); //ajax
            },

            getAndPostColumnHeadStyle: function (grid) {
                var me = this;

                ///
                ////  修改：　同步缓存的数据
                ////  作者:李耀潮　　时间 2014-1-7晚
                var hadCache = false,
                    NowGridColInfoStore;

                if (window.parent && window.parent.GlobalVar) {
                    hadCache = true;
                    NowGridColInfoStore = window.parent.GlobalVar.NowGridColInfoStore;
                }

                if (hadCache == true) {
                    //找缓存
                    var matchedRec = '';
                    var idx = 0;
                    do {
                        idx = NowGridColInfoStore.find('pageId', me.pageID, idx + 1);
                        if (idx < 0)
                            break;

                        var recTemp = NowGridColInfoStore.getAt(idx);
                        if (recTemp && recTemp.get('gridId') == me.gridID) {
                            matchedRec = recTemp;
                            break;
                        }
                    } while (idx > 0)
                }

                //////////// 
                var me = this,
                    newStyle = [];

                var name = '', hidden = '', width = 0.00, text = '';
                var cols = grid.headerCt.getGridColumns();
                var hiddenColCnt = 0;

                for (var i = 0; i < cols.length; i++) {
                    name = cols[i].dataIndex;
                    hidden = cols[i].hidden;
                    //隐藏的列则取它之前的宽度
                    width = cols[i].getWidth();
                    if (hidden === true && width === 0)
                        width = cols[i].oldWidth;
                    width = !width ? 50 : width;
                    hiddenColCnt += width == 50 ? 1 : 0;

                    var text = "{" +
                        "name:\'" + name + "\'" +
                        ", hidden:\'" + hidden + "\'" +
                        ", width:\'" + width + "\'" +
                    "}";

                    newStyle[i] = text;
                }  //FOR 

                if (hiddenColCnt == cols.length) {
                    //alert('隐藏所有栏位不支持，操作取消（ 可能介面渲染出错导致出错，本次取消更新用户个性化设置，请用户不用担心）');
                    return false;
                }

                var json2 = '[';
                for (var j = 0; j < cols.length; j++) {
                    if (j == cols.length - 1)
                        json2 += newStyle[j] + ']';
                    else
                        json2 += newStyle[j] + ',';
                }


                //alert(json2);
                if (hadCache == true) {
                    //更新缓存
                    if (!matchedRec) {
                        var r = Ext.create("SunGrid.Model", {
                            gridId: me.gridID,
                            pageId: me.pageID,
                            userId: GlobalVar.NowUserId,
                            cellSetting: json2
                        });

                        NowGridColInfoStore.add(r);
                    }
                    //更新已有缓存
                    else {
                        matchedRec.set('cellSetting', json2);
                    }
                }
                me.postColumnHeadStyle(json2);
                return true;
            },

            /* 取Grid中Store所有的数据,
                 可以指定其他的Store(P_SignStore) 日期转Y/m/d,  双引号转大写 */
            TakeGridDataToParams: function (P,  P_FieldName_AddPart, P_FieldName_EndPart, P_SignStore, P_fnEachCheck, P_scope) {
                var gridPanel = this,
                    gridStore = P_SignStore || gridPanel.grid.getStore(),      //优先外面选入来的　P_SignStore
                    recFields = [],
                    fieldName = '',
                    P_FieldName_AddPart = P_FieldName_AddPart || '',
                    P_FieldName_EndPart = P_FieldName_EndPart || '';

                var i = 0,
                    cnt = gridStore.getCount(),
                    bodyCntName = P_FieldName_AddPart + 'bodyCnt' + P_FieldName_EndPart;
                P[bodyCntName] = 0;

                for (; i < cnt; ++i) {
                    var rec = gridStore.getAt(i);
                    //console.log(rec);
                    if (i == 0) 
                        recFields = rec.fields;
                    //自我的判断方法,检测每一行数据是否合法，不合法则终止提取方法
                    if (P_fnEachCheck && Ext.typeOf(P_fnEachCheck) == 'function') {
                        if (P_fnEachCheck(rec) == false)
                            return false;
                    }
                    //例子
                    //P['sort_' + P.bodyCnt] = rec.get('sort');
                    //console.log([recFields, rec]);

                    for (var j = 0; j < recFields.items.length; ++j) {
                        var col = recFields.items[j];

                        fieldName = col.name;
                        var type = col.type.type,
                            UserFieldName = P_FieldName_AddPart + fieldName + P_FieldName_EndPart + '_' + P[bodyCntName];
                        if (type == 'date') {
                            var dateValue = Ext.Date.format(rec.get(fieldName), 'Y/m/d');
                            P[UserFieldName] = dateValue;
                        }
                        else if (type == 'string') {
                            var valueStr = rec.get(fieldName) || '';
                            P[UserFieldName] = valueStr;
                            if (valueStr && valueStr.indexOf && valueStr.indexOf('"') >= 0)
                                P[UserFieldName] = valueStr.replace(/["]/g, "“");
                        }
                        else
                            P[UserFieldName] = rec.get(fieldName);
                    }
                    ++P[bodyCntName];
                }
                return P;
            },

            initComponent: function () {
                var me = this;
                this.callParent();

                me.url = '../ASHX/Common/SunGridHead.ashx?1=1';

                me.addEvents('MyRender', 'containerdblclick');
                //me.IsConfigIng = true;
                me.UpdateJobs = [];
                me.loadColumnHeadStyle(false, true);

                //***快速切换接口 ****///
                if (me.NeedSaveLastTime_GridId == true) {
                    if (!me.AllFnDefaultColumns) {
                        alert('找不到，对应切换的列布局，本窗体取消加载，以防触发其他错误');
                    }

                    me.SwitchGridIdFn = function (nowGridId) {
                        if (!me.AllFnDefaultColumns[nowGridId]) {
                            alert('找不到，对应切换的列布局，本窗体取消加载，以防触发其他错误');
                            return false;
                        }

                        me.reconfig(nowGridId, me.pageID, '', me.AllFnDefaultColumns[nowGridId]);
                    }
                }


                //                var delayTask = new Ext.util.DelayedTask(function () {
                //                    me.doLayout();
                //                    me.fireEvent('afterrender');
                //                });

                //                delayTask.delay(900);

            }
        });
   