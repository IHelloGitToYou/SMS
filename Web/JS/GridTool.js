var GridTools = {};
/*
Li
日期：2014-3-20
描述：用于列复制功能，　输入控件的config
*/

GridTools.RunDelayFn = function (fn, p_delay) {
    var task = new Ext.util.DelayedTask(fn);
    task.delay(p_delay);
}
GridTools.GetColCopyFnMonitor = function () {
    //console.log(colName);
    return {
        hideTrigger: true,
        cellIndex: 0,
        TVal: 1230,
        enableKeyEvents: true,
        spinDownEnabled: false,
        spinUpEnabled: false,
        //                grid: gridPanel,
        //                ed: gridPanel.cellEditor,
        listeners: {
            specialkey: function (vthis, e, event, eOpts) {
                //                console.log(vthis.picker);
                //                console.log({ isExpanded: vthis.isExpanded, key: e.getKey(), ctrlKey: e.ctrlKey });
                var isDown = e.keyCode == 40 ? true : false,
                    isUp = e.keyCode == 38 ? true : false;

                //外面的Grid的属性
                var _grid = vthis.out_grid,
                    colNum = _grid.headerCt.getHeaderIndex(vthis.coloumn),
                    row = _grid.getSelectionModel().getSelection()[0],
                    rowNum = _grid.store.indexOf(row),
                    code = e.getCharCode(),
                    ce = vthis.ed, //grid.plugins[0],
                    sm = vthis.out_grid.getSelectionModel();

                _grid.pos = { row: rowNum, column: colNum };
                //                console.log(_grid.pos);

                vthis.out_grid.MaxRecIndex = vthis.out_grid.store.getCount();
                vthis.out_grid.MaxColIndex = vthis.out_grid.headerCt.getGridColumns().length;

                var maxRows = vthis.out_grid.MaxRecIndex,
                    maxColumns = vthis.out_grid.MaxColIndex,
                    rowSelected = _grid.pos.row,
                    colSelected = _grid.pos.column;

                var fnWalkLeftRight = function (direction) {
                    //                    console.log(' fnWalkLeftRight record');

                    var view = vthis.out_grid.getView(),
                        record = ce.getActiveRecord(),
                        header = ce.getActiveColumn();

                    //                    console.log(ce.getActiveRecord());
                    //                    console.log(ce.getActiveColumn());

                    var position = view.getPosition(record, header);
                    var lastPos;
                    do {
                        lastPos = position;
                        position = view.walkCells(position, direction, e, false);
                        if (lastPos && lastPos.row === position.row && lastPos.column === position.column) {
                            return;
                        }
                    } while (position && (!ce.startEditByPosition(position)));
                } // fnWalkLeftRight('right'); 

                if ((vthis.isExpanded === true || e.ctrlKey == true) && e.getKey() == 13) {
                    //this.callParent(arguments);
                    //                    console.log('  row  ');
                    //                    console.log(row);
                    vthis.fireEvent('enter');

                    GridTools.RunDelayFn(function () {
                        ce.startEditByPosition(_grid.pos);
                        fnWalkLeftRight('right');
                    }, 100);

                    return true;
                }

                if (vthis.isExpanded === true
                    && e.shiftKey == false
                    && e.ctrlKey == true && (isDown == true || isUp == true)) {
                    return true;
                }

//                // F3键盘，弹出下拉窗体,
//                if (e.keyCode == Ext.EventObject.F3) { //F3{
//                    vthis.expand();
//                    return true;
//                }


                if (e.shiftKey == true && e.ctrlKey == true && (isDown == true || isUp == true)) {


                    //向上填充突然，变，向下填充，要马上反应过来；
                    if (_grid.isDown != isDown)
                        _grid.beginIndex = false;
                    _grid.isDown = isDown;

                    if (_grid.isReady == false)
                        return;

                    var nowRecords = _grid.getSelectionModel().getSelection(),
                            store = _grid.getView().getStore(),
                            text = vthis.getValue(),
                            Cnt = store.getCount(),
                            col = vthis.ed.getActiveColumn();

                    //console.log(nowRecords);
                    if (nowRecords.length > 0) {
                        //那行复制？
                        if (_grid.beginIndex == false)
                            _grid.copyIndex = store.indexOf(nowRecords[0]) + (isDown == true ? 1 : -1);
                        else {
                            if (isDown == true)
                                ++_grid.copyIndex;
                            else
                                --_grid.copyIndex;
                        }
                        _grid.copyIndex = _grid.copyIndex < 0 ? 0 : _grid.copyIndex;
                        _grid.copyIndex = _grid.copyIndex > Cnt ? Cnt : _grid.copyIndex;

                        //if (_grid.beginIndex == false) 
                        _grid.beginIndex = true;

                        //console.log(' Cnt  ' + Cnt + ' _grid.copyIndex ' + _grid.copyIndex);
                        //行次要合理
                        if (_grid.copyIndex >= 0 && _grid.copyIndex < Cnt) {
                            //console.log('   specialkey3 ');
                            var nowRec = store.getAt(_grid.copyIndex);
                            //                                        if (vthis.xtype.toString().indexOf('SunSearch') < 0) {
                            nowRec.beginEdit();
                            nowRec.set(col.dataIndex, text);
                            nowRec.endEdit();
                            nowRec.commit();
                        }
                    }
                }     // if
                else if ((e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 13) { // 上、下箭头

                    e.stopEvent();
                    if (code == 37) {
                        fnWalkLeftRight('left');
                    }
                    else if (code == "39") {
                        fnWalkLeftRight('right');
                    }
                    else if (code == "38") {
                        if (rowSelected > 0) {
                            ce.startEditByPosition({ row: rowSelected - 1, column: colSelected });
                        }
                    }
                    else if (code == "40") {
                        if (rowSelected < (maxRows - 1))
                            ce.startEditByPosition({ row: rowSelected + 1, column: colSelected });
                    }
                    else if (code == "13") {
                        fnWalkLeftRight('right');
                    }

                    GridTools.RunDelayFn(function () {
                        var box = vthis; //e.column.getEditor();
                        if (box) {
                            box.selectText();
                        }
                    }
                    , 200);
                    //return true;
                }
            }
        }
    }
}

GridTools.onGoodLike = function (vgrid, vCellEditor, arrRowCofing) {
   

    var cols = vgrid.headerCt.getGridColumns(),
        colsCnt = cols.length,
        store = vgrid.getView().getStore(),
        ce = vCellEditor || vgrid.findPlugin('cellediting');
    
    //1. 双击空白行,添加新行
    //      删除旧的事件
    if (vgrid.containerclickMonitor)
        vgrid.un('containerclick', vgrid.containerclickMonitor);

    vgrid.containerclickMonitor = function (vthis, e, eOpts) {
        var rowConfig = {},
            confingType = Ext.typeOf(arrRowCofing);
        if (!arrRowCofing)
            return true;

        if (confingType === 'object') {
            rowConfig = arrRowCofing;
        }
        else if (confingType === 'function') {
            rowConfig = arrRowCofing();
        }

        var NR = Ext.create(store.model, (rowConfig || {}));
        store.add(NR);
    }

    vgrid.on('containerclick', vgrid.containerclickMonitor);


    //2. 最后一行自动添加新行
    //      删除旧的事件
    if (vgrid.beforeeditMonitor)
        vgrid.un('beforeedit', vgrid.beforeeditMonitor);

    vgrid.beforeeditMonitor = function (editor, e) {
        if (e.rowIdx == e.record.store.getCount() - 1) {

            if (!arrRowCofing)
                return true;
            var rowConfig = {},
                confingType = Ext.typeOf(arrRowCofing);

            if (confingType === 'object') {
                rowConfig = arrRowCofing;
            }
            else if (confingType === 'function') {
                rowConfig = arrRowCofing();
            }

            //最后一行自动加行
            var NR = Ext.create(e.record.modelName, (rowConfig || {}));
            vgrid.store.add(NR);
        }
    }

    ce.on('beforeedit', vgrid.beforeeditMonitor);


    //3. 箭头移格子
    //console.log('行' + colsCnt);
    for (var i = 0; i < colsCnt; ++i) {
        if (!cols[i].getEditor)
            continue;

        var ed = cols[i].getEditor();
        if (ed) {
            ed.out_grid = vgrid;
            ed.ed = ce;
            ed.coloumn = cols[i];
            ed.column = cols[i];

            //cols[i].setEditor(Ext.Object.merge(ed, GetColCopyFnMonitor()));
            ed.on('specialkey', GridTools.GetColCopyFnMonitor().listeners.specialkey);

            ed.onDownArrow = function () { }
            ed.spinDownEnabled = false;
            ed.spinUpEnabled = false;

            if (ed.xtype === 'textfield')
                ed.onBlur = function () { }

            if (ed.xtype === 'numberfield')
                ed.hideTrigger = true;

            ed.on('change', function (thisbox) {
                thisbox.out_grid.beginIndex = false;
            });

            ed.on('focus', function (thisbox) {
                GridTools.RunDelayFn(function () {
                    var box = thisbox; //e.column.getEditor();
                    if (box)
                        box.selectText();
                },
                100);
            });
        }
    }
}
