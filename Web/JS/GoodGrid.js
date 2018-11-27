
/*
Li
日期：2014-3-20
日期：2015-1-08 升级：鼠标位置控制,最左、最右才移格
描述：用于列复制功能，　输入控件的config

 事件:增加自动行时 before_addautorow ,  NR, me.arrRowCofing
*/

////GridTools.AddCharPosMonitor = function (vthis) {
////    if (!vthis.ok) {
////        var focusEl = vthis.getFocusEl();
////        Ext.fly(focusEl).on('keyup', function () {
////            var VBox = this,
////            VBoxId = VBox.getId();
////            ///console.log(getCaretPos(VBoxId));
////        });
////        vthis.ok = true;
////    }
////}

Ext.define('Star_Core_GoodGrid', {
    xtype: 'Core_GoodGrid',
    grid: null,
    GetColCopyFnMonitor: function (GoodGridObj) {
        var me = GoodGridObj;
        return {
            hideTrigger: true,
            enableKeyEvents: true,
            spinDownEnabled: false,
            spinUpEnabled: false,
            listeners: {
                specialkey: function (obj, e) {
                    var code = e.getCharCode(),
                        pos = me.view.getSelectionModel().getCurrentPosition(),
                        ce = me.ce;
                     
                    var maxRows = (me.store.getCount() || 50);
                    var maxColumns = (me.columnCount || 40);
                    var rowSelected = pos.row;
                    var colSelected = pos.column;
                    ce.grid = me.grid;
                     
                    if (code == "37") {
                        if (colSelected >= 1) {
                            ce.startEditByPosition({ row: rowSelected, column: colSelected - 1 });
                            //Grid.taskSelectText.delay(10);
                            //Grid.GridNormal.CurrentColumn = colSelected - 1;
                        }
                    }
                    else if (code == "39") {
                        if (colSelected < (maxColumns - 1)) {
                            ce.startEditByPosition({ row: rowSelected, column: colSelected + 1 });
                            //ce.startEditByPosition({ row: rowSelected, column: colSelected + 1 });
                            //Grid.taskSelectText.delay(10);
                            //Grid.GridNormal.CurrentColumn = colSelected + 1;
                        }
                    }
                    else if (code == "38") {
                        if (rowSelected > 0) {
                            ce.startEditByPosition({ row: rowSelected - 1, column: colSelected });
                            //Grid.taskSelectText.delay(10);
                        }
                    }
                    else if (code == "40") {
                        
                        if (rowSelected < (maxRows - 1)) {
                            
                            ce.startEditByPosition({ row: rowSelected + 1, column: colSelected });
                            //Grid.taskSelectText.delay(10);
                        }
                    }
                    else if (code == "13") {
                        if (rowSelected < (maxRows - 1)) {
                            //Common_RunDelayFn(function () {
                            ce.startEditByPosition({ row: rowSelected + 1, column: colSelected });
                            //Grid.taskSelectText.delay(10);
                            //}, 150);
                        }
                    }
                }
            }
        } // return 
    },
    setCaretTo: function (id, pos) {
        var me = this;
        var obj = document.getElementById(id);
        if (obj.createTextRange) {
            var range = obj.createTextRange();
            range.move("character", pos);
            range.select();
        } else if (obj.selectionStart) {
            obj.focus();
            obj.setSelectionRange(pos, pos);
        }
    },
    getCaretPos: function (id) {
        var me = this;
        var el = document.getElementById(id);
        var rng, ii = -1;
        if (typeof el.selectionStart == "number") {
            ii = el.selectionStart;
        } else if (document.selection && el.createTextRange) {
            rng = document.selection.createRange();
            rng.collapse(true);
            rng.moveStart("character", -el.value.length);
            ii = rng.text.length;
        }
        return ii;
    },
  
   
    onGoodLike: function (vgrid, CE, arrRowCofing) {

        var me = this;
        var cols = vgrid.headerCt.getGridColumns(),
            colsCnt = cols.length,
            store = vgrid.getView().getStore(),
            ce = CE || vgrid.findPlugin('cellediting');
        //console.log({ ce: ce });

        me.grid = vgrid;
        me.view = vgrid.getView();
        me.ce = ce;
        me.store = store;
        me.columnCount = colsCnt;
        if (ce) {
            //记录最近的编辑位置
            ce.on('edit', function (editor, vve, eOpts) {
                ce.lastEditRecord = vve.record;
                ce.lastEditColumn = vve.column;
            });

            //箭头移格子
            ce.onSpecialkeyEvent = me.GetColCopyFnMonitor(me).listeners.specialkey;
            for (var i = 0; i < colsCnt; ++i) {
                if (!cols[i].getEditor)
                    continue;

                var ed = cols[i].getEditor();
                if (ed) {
                    ed.out_grid = vgrid;
                    ed.cellediting = ce;
                    ed.coloumn = cols[i];
                    ed.column = cols[i];

                    ed.on('specialkey', ce.onSpecialkeyEvent, ed, { buffer: 50 });

                    ed.enableKeyEvents = true;
                    ed.onDownArrow = function () { }
                    ed.spinDownEnabled = false;
                    ed.spinUpEnabled = false;

                    //  if (ed.xtype === 'textfield')
                    //      ed.onBlur = function () { }
                    if (ed.xtype === 'numberfield')
                        ed.hideTrigger = true;
                }
            }
        }
    } //onGoodLike
});
