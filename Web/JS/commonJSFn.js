 
///////////////扩展JS
     String.prototype.trim=function(){
        return this.replace(/(^\s*)|(\s*$)/g, "");
     }
             
    String.prototype.endWith=function(str){
      if(str==null||str==""||this.length==0||str.length>this.length)
        return false;
      if(this.substring(this.length-str.length)==str)
        return true;
      else
        return false;
      return true;
    }

    String.prototype.startWith=function(str){
      if(str==null||str==""||this.length==0||str.length>this.length)
        return false;
      if(this.substr(0,str.length)==str)
        return true;
      else
        return false;
      return true;
    }

    String.prototype.repeat = function(max)   {
        var ret = this;
        for(var i=0; i<max; ++i){
            ret += this; 
        }
        return ret;   
    }
    
    Array.prototype.distinct = function(){
         var self = this;
         var _a = this.concat().sort();
         _a.sort(function(a,b){
             if(a == b){
                 var n = self.indexOf(a);
                 self.splice(n,1);
             }
         });
         return self;
     };
            //报错，令控件不稳定。
//    Array.prototype.indexOf=function(substr,start){
//	    var ta,rt,d='\0';
//	    if(start!=null){ta=this.slice(start);rt=start;}else{ta=this;rt=0;}
//	    var str=d+ta.join(d)+d,t=str.indexOf(d+substr+d);
//	    if(t==-1)return -1;rt+=str.slice(0,t).replace(/[^\0]/g,'').length;
//	    return rt;
//    }
//    
//    var a = 'abc'.str_out_times(5);
//    alert(a);


    Date.prototype.Format = function(formatStr)   
    {   
        var str = formatStr;   
        var Week = ['日','一','二','三','四','五','六'];  
      
//        str=str.replace(/yyyy|YYYY/,this.getFullYear());   
//        str=str.replace(/yy|YY/,(this.getYear() % 100)>9?(this.getYear() % 100).toString():'0' + (this.getYear() % 100));   
//      
//        str=str.replace(/MM/,this.getMonth()>9?this.getMonth().toString():'0' + this.getMonth());   
//        str=str.replace(/M/g,this.getMonth());   
//      
//        str=str.replace(/w|W/g,Week[this.getDay()]);   
//      
//        str=str.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():'0' + this.getDate());   
//        str=str.replace(/d|D/g,this.getDate());   
//      
//        str=str.replace(/hh|HH/,this.getHours()>9?this.getHours().toString():'0' + this.getHours());   
//        str=str.replace(/h|H/g,this.getHours());   
        str=str.replace(/mm/,this.getMinutes()>9?this.getMinutes().toString():'0' + this.getMinutes());   
        str=str.replace(/m/g,this.getMinutes());   
      
        str=str.replace(/ss|SS/,this.getSeconds()>9?this.getSeconds().toString():'0' + this.getSeconds());   
        str=str.replace(/s|S/g,this.getSeconds());   
        str+= ' :' + this.getMilliseconds(); 
      
        return str;   
    }   
    
///////////////扩展JS 完成
    
///////////////扩展ExtJs

///// 
/////点击TextField控件自动全选内容
Ext.override(Ext.form.field.Text, {
    listeners  : {  
        'focus':function(){  
            this.selectText();  
        }  
    }  
});
Ext.override(Ext.form.field.ComboBox, {
    listeners  : {  
        'focus':function(){  
            this.selectText();
        }
    }
});

Ext.override(Ext.form.field.ComboBox, {
    format:'Y-m-d'
});


Ext.override('Ext.grid.Panel', {
    bodyStyle: {
        background: '#DFE9F6'
        //padding: '0px'
    }
});
// 
//Ext.override('Ext.form.field.Number', {
//    decimalPrecision : 5
//});                


///////////////扩展ExtJs完成
        var Common_WakingMask;
        
        Ext.onReady(function() {    //要页面存在时，才能执行。
           Common_WakingMask = new Ext.LoadMask(Ext.getBody(), {msg:"计算进行中,请等待一会..."});
        });
      
        //公共方法
        var CommonFilterDataToStr = function(FirstNames, filterData){
            var strWhere = ' 1=1 ';
            var strWhere2 = ' 1=1 '; //包含别名的
            var temp_str = '';
            var data = filterData;
            
            for(i = 0 ; i < data.length ; ++i){
                if(data[i].data.type == 'string'){
                    strWhere += ' and ' + data[i].field + " like '%" + data[i].data.value + "%'";
                    strWhere2 += ' and ' + FirstNames[data[i].field] + " like '%" + data[i].data.value + "%'";
                }
                
                if(data[i].data.type == 'numeric' || data[i].data.type == 'date' ){
                    switch(data[i].data.comparison){
                        case 'lt':
                            temp_str = " >= ";
                        break;
                        case 'gt':
                            temp_str = " <= ";
                        break;
                        case 'eq':
                            temp_str = " = ";
                        break;
                    }
                    strWhere += ' and ' + data[i].field + "  " + temp_str + " '" + data[i].data.value + "'";
                    strWhere2 += ' and ' + FirstNames[data[i].field] + "  " + temp_str + " '" + data[i].data.value + "'";
                }
            }
        
            var resObj = {};
            resObj.strWhere = strWhere;
            resObj.strWhere2 = strWhere2;
            return resObj;
        }
        
        //// 只取四数小点
        function fixAmount(amount){
            var newAmount = parseFloat(amount);
            newAmount = newAmount.toFixed(4);
            
            return newAmount;
        }
        //// 只取二数小点
        function Common_fixAmount2(amount) {
            var newAmount = parseFloat(amount);
            newAmount = newAmount.toFixed(2);

            return newAmount;
        }

        //// 只取小点位
        function Common_fixAmount(amount, diti) {
            var newAmount = parseFloat(amount);
            newAmount = newAmount.toFixed(diti);

            return newAmount;
        }
        
            var getGridHeaderCt = function(tgrid){
                return  tgrid.getView().getHeaderCt();
            };
            
            var getEditor = function(grid,columnDataIndex){
                var GHCt = getGridHeaderCt(grid);
                var colIdx = getGridColumnIndex(GHCt.getGridColumns(), columnDataIndex);
                var column = GHCt.getHeaderAtIndex(colIdx);
                return column.getEditor();               
            }

            //返回当前栏位的在grid的 colIdx
            getGridColumnIndex = function(gridDataColumns,cellName) {
                for( var i=1; i< gridDataColumns.length; ++i){
                   if(gridDataColumns[i].name == cellName) {
                        return i;
                   }
                }
                return -1;
            }
            //返回当前栏位的在grid的 colIdx
            getGridColumnHeader = function(gridDataColumns,cellName) {
                var index = getGridColumnIndex(gridDataColumns,cellName);
                return  gridDataColumns[index];
            }

            var rendererForJl = function(value){
                return value == 0 ? '末指定' : value;
            }
            
                
            var rendererForNum = function(value){
                return value == 0 ? '' : value;
            }
            
            var rendererForCore_Size = function(value){
                
                if(value == 0 || value == 1.0 || value == '1.0' || value ==2.25 || value == '2.25' || value == 3.0 || value == '3.0' || value == 6.0 || value == '6.0')
                    return value == 0 ? '' : value + '寸';
                else
                    return '空值';
            }
            
            var rendererFor_price_ut =  function(value, metaData,record) {
                function getShowUtName(record){
                    var res = '';
                    res += record.get('ut_name') != '' ? '1.' + record.get('ut_name') + ' '    : '' ;
                    res += record.get('ut5_name') != '' ? '5.' + record.get('ut5_name') + ' '    : '' ;
                    res += record.get('ut6_name') != '' ? '6.' + record.get('ut6_name') + ' '    : '';
                    return res
                }
                var tipMsg = getShowUtName(record);
                
                metaData.tdAttr = 'data-qtip="' + tipMsg +  '"';

                switch(value){
                    case '1':
                        return record.get('ut_name');
                    case '5':
                        return record.get('ut5_name'); 
                    case '6':
                        return record.get('ut6_name'); 
                    break;
                }
            }
        
        var rendererFor_jl_mo_ut =  function(value, metaData,record) {
            function getShowUtName(record){
                var res = '';
                res += record.get('ut_name') != '' ? '1.' + record.get('ut_name') + ' '    : '';
                res += record.get('ut4_name') != '' ? '4.' + record.get('ut4_name') + ' '    : '';
                res += record.get('ut5_name') != '' ? '5.' + record.get('ut5_name') + ' '    : '' ;
                res += record.get('ut6_name') != '' ? '6.' + record.get('ut6_name') + ' '    : '';
                return res
            }
            var tipMsg = getShowUtName(record);
            
            metaData.tdAttr = 'data-qtip="' + tipMsg +  '"';
            switch(value){
                case '1':
                    return record.get('ut_name');
                case '4':
                    return record.get('ut4_name');
                case '5':
                    return record.get('ut5_name'); 
                case '6':
                    return record.get('ut6_name');       
                break;
            }
        }
        
        
        Ext.Date.patterns = {
            ISO8601Long:"Y-m-d H:i:s",
            ISO8601Short:"Y-m-d",
            ShortDate: "n/j/Y",
            LongDate: "l, F d, Y",
            FullDateTime: "l, F d, Y g:i:s A",
            MonthDay: "F d",
            ShortTime: "g:i A",
            LongTime: "g:i:s A",
            SortableDateTime: "Y-m-d\\TH:i:s",
            UniversalSortableDateTime: "Y-m-d H:i:sO",
            YearMonth: "F, Y"
        };
        
                
        ///fetchList * 代表所有栏位
        ///参数  nameList 为别名,可为空
        ///return json
        var getGrid_Data =function(grid,fetchList, nameList){
            if(!grid)
                return null;
            
            var store = grid.getView().getStore(),rowCnt = store.length;
            var res = [],resField = [],resNameField =[];
            if(fetchList && fetchList.length >0){
                resField = fetchList.split(',');
            }
            if(nameList && nameList.length >0){
                resNameField = nameList.split(',');
            }
            
            resNameField = (resNameField.length > 0 )?  resNameField : resField ;
            var temp;
            store.each(function(item){
                temp = "";
                for(var i = 0 ;i<resField.length;++i){
                    temp += i == 0 ? "{" : "";
                    
                    temp += resNameField[i] + ":";
                    temp += "\'" + item.get( resField[i] ) + "\'";
                    if(i == resField.length - 1){
                        temp += "}"
                    }
                    else{
                        temp += ",";
                    }
                }
                res.push(Ext.JSON.decode(temp));                
                return res;
            });
            return res;
        }
        
        var P_UTNAME_RECORD = 
            {
                ut2_name    : '',       //保留单位
                ut3_name    : '',       //保留单位2
                ut4_name    : '长度(M)',
                ut5_name    : '平方',
                ut6_name    : '净量(KG）'
            }
            
            
         //标准单位
        var commJsFn_fnUtRenderer = function(value, metaData,record) {
             function getShowUtName(record){
                var res = '';
                if(record.get('prd_no') != 'JL'){
                    res += record.get('ut_name') != '' ? '1.' + record.get('ut_name') + ' ': ''; 
                }
                return res
            }
            var tipMsg = getShowUtName(record);
            
            metaData.tdAttr = 'data-qtip="' + tipMsg +  '"';
            
            switch(value){
                case '1':
                    return record.get('ut_name');
                break;
            }
        }
            
        //定价单位
        var commJsFn_fnUtforPriceRenderer = function(value, metaData,record) {
             function getShowUtName(record){
                var res = '';
                if(record.get('prd_no') == 'JL'){
                    res += '1.卷数';
                    res += '5.' + '平方';
                    res += '6.' + '净量';
                }
                else{
                    res += record.get('ut_name') != '' ? '1.' + record.get('ut_name') + ' '    : '' ;
                }
                return res
            }
            var tipMsg = getShowUtName(record);
            
            metaData.tdAttr = 'data-qtip="' + tipMsg +  '"';
            
            if(record.get('prd_no') == 'JL'){
                switch(value){
                    case '1':
                        return '卷数';
                    case '5':
                        return '平方';
                    case '6':
                        return '净量';
                    break;
                }
            }
            else{
                return record.get('ut_name');
            }
        }
         
 
          
         
           
        //审核人员的角色
        var Common_CheckManTypeRenderer = function(value, metaData,record) {
           switch(value){
                case 'O':
                    return '原审核';
                case 'S':
                    return '会签'; 
                case 'R':
                    return '代理'; 
                break;
                
            } 
        }
         // 正规表达式  
         //Windows\d+  //匹配Windows后面跟1个或更多数字
         //Windows\d{5}  //匹配Windows后面跟5位数字
         
//        //alert(matches[1]);
//        
//        var myRe = /ab*\/g;
//        var str = "abbcdefabh";
            //strFirst    开始字符串
            // numLength  流水号长
      fnCommonCreateLastNo = function(pageId, fieldBox, run_fn){
            Ext.Ajax.request({
                type:'post',
                url:'../ASHX/common/GetLastTableNO.ashx?pageId=' + pageId + '&1=1',
                params: {
                    action:'CreateLastNo'
                },
                success: function(response){
                    var result = Ext.JSON.decode(response.responseText);
                    if(result.result == true){
                        fieldBox.setValue(result.newno);
                        if(run_fn)
                            run_fn();
                    }
                }
            });
            return true;
      }
          
    
     var Common_SetReadOnly_2 = function(isReadOnly,item, isParent){
        if(isParent == true){
            var _boxs = item.query('[M=true]');
            for(var i = 0 ; i < _boxs.length; ++i){
                Common_SetReadOnly_2(isReadOnly, _boxs[i], false);
            }
            return false;
        }
        if(isReadOnly == false){
            item.setReadOnly(false);
            item.setFieldStyle({background:''});
        }
        else{
            item.setReadOnly(true);
            item.setFieldStyle({background:'#E6E6E6'});
        }
    }

    function Common_SetItemReadOnly(item, readOnly) {
         
        item.setReadOnly(readOnly);
        if (readOnly == true)
             item.setFieldStyle({ background: '#E6E6E6' });
         else
             item.setFieldStyle({ background: '' });

         return true;
     }
     
     
        //新建状态要设为readOnly的列表
        var Common_NewIngReadOnlyList = new Array();
        var Common_NewIngDisabledList = [];
        //修改状态要设为readOnly的列表
        var Common_EditIngReadOnlyList = new Array();
        var Common_EditIngDisabledList = [];
        //查看状态要设为readOnly的列表
        var Common_ViewIngReadOnlyList = new Array();
        var Common_ViewIngDisabledList = [];
        
        var Common_FixedDisabledList = [];
        
        function Common_SetReadOnly(objs, T, objsAll_Name){

            var objsAll = Ext.getCmp(objsAll_Name).query(".textfield");
            Ext.Array.each(objsAll, function(item, index, length){
                item.setReadOnly(false);
                item.setFieldStyle({background:''});
            });
            
            Ext.Array.each(objs, function(item, index, length){
                //console.log(item.id);
                item.setReadOnly(T);
                if(T == true)
                    item.setFieldStyle({background:'#E6E6E6'});
                else
                    item.setFieldStyle({background:''});
            });
        }
        
        //删除指定固定项中的控件
        function Common_fnDeleteFixedDisabledUnit( obj){
            
            for(var i = 0 ; i < Common_FixedDisabledList.length; ++i){
                //打出同Id的删除
                Common_FixedDisabledList[i].id == obj.id;
                Common_FixedDisabledList.splice(i,1);
            }         
            return true;  
        }
        
        function Common_SetDisabled(objs){
            
            var objsAll = Ext.ComponentQuery.query("button[SUNBTN=true]");
            Ext.Array.each(objsAll, function(item, index, length){
                item.setDisabled(false);
            });
            
            Ext.Array.each(objs, function(item, index, length){
                item.setDisabled(true);
            });
            
            //固定禁用项
            Ext.Array.each(Common_FixedDisabledList, function(item, index, length){
                item.setDisabled(true);
            });
            
        }
        
        //状态管理
        var This_TableState = 'newBefore';
        var Common_Change_Detail = new Array();
        
        var Common_GetTableState = function(){
            return This_TableState;
        }
        //检测最后一个是不是　'JS设置状态'　newValue ＝＝ 现状态
        var Common_TableInfoIsChanged = function(){
            if( !Common_Change_Detail)
                return false;
                
            return Common_Change_Detail[Common_Change_Detail.length -1].newValue != Common_GetTableState() ? true :false;
        }
        
        
        var Common_TableSateMonitor = function(field , newValue, oldValue, eOpts){
            var o = new Object();
            if(field && field.getId){
                o.field = field.getId();
            }
            o.field = field;
            
            o.newValue = newValue;
            o.oldValue = oldValue;
            //记录更改明细
            Common_Change_Detail.push(o);
        }
        
        function Common_SetTableState_Monitor(obj,fn){
            Common_Change_Detail = new Array();
            var AllFields = obj.query(".textfield");
            Ext.Array.each(AllFields, function(item, index, length){
                //console.log(item.id);
                 item.on('change', fn);
            });
            AllFields = obj.query(".panel");
            Ext.Array.each(AllFields, function(item, index, length){
                //console.log(item.id);
                 item.on('change', fn);
            });
            
            AllFields = obj.query(".SunSearchWin");
            Ext.Array.each(AllFields, function(item, index, length){
                 item.on('change', fn);
                 
                 //console.log(item.id);
            });
        }
        
 
////    


    var CommMsgShow = function (title, msg, FixedRead) {
        var _Msg = Ext.Msg.show({
            title: title,
            msg: msg,
            minWidth: 200,
            modal: true,
            icon: Ext.Msg.INFO,
            buttons: Ext.Msg.OK
        });

        FixedRead = (FixedRead || false);
        if (FixedRead === false)
            Common_RunDelayFn(function () { _Msg.close(); }, 1500);
    };


    var CommMsgBox = Ext.create('Ext.window.MessageBox', {
        buttonText: {
            yes: '同意Y',
            no: '不同意N'
        }
    });
    /**
     * Extjs消息提示框
     * MsgTip.msg('消息标题', '消息内容');//不自动隐藏
     * MsgTip.msg('消息标题', '消息内容',true);//默认5秒后自动隐藏
     * MsgTip.msg('消息标题', '消息内容',true,10);//10秒后自动隐藏
     */
        var _st = window.setTimeout;
            window.setTimeout = function(fRef, mDelay) {
            if(typeof fRef == 'function'){
            var argu = Array.prototype.slice.call(arguments,2);
            var f = (function(){ fRef.apply(null, argu); });
            return _st(f, mDelay);
            }
            return _st(fRef,mDelay);
            }                          
    MsgTip = function(){
        var msgCt;
        function createBox(t, s){
            return ['<div class="msg">',
                    '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
                    '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc" style="font-size=12px;"><h3>', t, '</h3>', s, '</div></div></div>',
                    '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
                    '</div>'].join('');
        }
        return {
            
            msg : function(title, message,autoHide,pauseTime){
                if(!msgCt){
                    msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div22',style:'position:absolute;top:10px;width:300px;margin:0 auto;z-index:20000;'}, true);
                }
                msgCt.alignTo(document, 't-t');
                //给消息框右下角增加一个关闭按钮
                message+='<br><span style="text-align:right;font-size:12px; width:100%;">' +
                  '<font color="blank"><u style="cursor:hand;" onclick="MsgTip.hide(this);">关闭</u></font></span>'
                var m = Ext.DomHelper.append(msgCt, {html:createBox(title, message)}, true);
                m.slideIn('t');
                if(!Ext.isEmpty(autoHide) && autoHide==true){
                     if(Ext.isEmpty(pauseTime)){
                        pauseTime=5;
                     }
                    m.slideIn('tr').ghost("tr", { delay: 1000 * pauseTime, remove: true});
                }
            },
            hide:function(v){
             var msg=Ext.get(v.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement);
             msg.ghost("tr", {remove:true});
            }
        };
    }();
    
   var CommProcessBarWin = Ext.create('Ext.window.Window', {
        title: '信息提示',
        closeAction :'hide',
        height: 30,
        width: 50,
        layout: 'fit',
        items: {  
            itemId: 'Common_Progressbar_ItemId' ,
            id: 'Common_Progressbar_ItemId' ,
            xtype:'progressbar',
            width: 40,
            text:'Initializing...'
        }
    });

    
    var CommProcessBarShow = function() {
        CommProcessBarWin.show();
    };
    
    var CommProcessBarHide = function() {
        CommProcessBarWin.close();
        CommProcessBarWin.getComponent('Common_Progressbar_ItemId').updateProgress(0 ,'');
    };
    
    var CommProcessBarProcessValue = function(title, progressValue) {
        CommProcessBarWin.getComponent('Common_Progressbar_ItemId').updateProgress(progressValue ,title);
    }
    

 
 
    
    var Common_GetGridSelectIndex = function(p_Grid){
        var tstore = p_Grid.getView().getStore();
        var selectRecord = p_Grid.getSelectionModel().getSelection()[0];
        if(selectRecord < 0)
            return -1;
        return tstore.indexOf(selectRecord);
    }
    
    var Common_RunDelayFn = function(fn, p_delay){
        var task = new Ext.util.DelayedTask( fn);
        task.delay(p_delay);
    }
    
    
    //////////自动全选下级
    var Common_ExpandAndSelectedSub = function(node, checked){
        //node.expand();  
        node.checked = checked;  
        node.eachChild(function (child) {  
            child.set('checked', checked);
            Common_ExpandAndSelectedSub(child, checked);  
        });  
    }
    //////// 得到当前选择的项 '次'
    var Common_GetNowSelectIndex = function(pgrid){
        var tstore = pgrid.getView().getStore();
        var selectRecord = pgrid.getSelectionModel().getSelection()[0];
        return tstore.indexOf(selectRecord);
    }
    
    var Common_CreateWindow = function(p_form, p_title){
          return  new Ext.window.Window({
            closeAction:'hide',
            constrain:true,
            //width  :400,
            autoWidth : true,
            autoHeight : true,
            title: p_title, //'日程管理',
            layout : 'fit',
            items:[ p_form ],
            listeners:{}
        });
    }
    
    // XType : SunWin
    Ext.define('Common.SunWin',{
        extend:'Ext.window.Window',   
        xtype : 'SunWin',
        
        closeAction:'hide',
        constrain:true,
        height  :400,
        width  :600,
        autoWidth : true,
        autoHeight : true,
        // title: p_title, //'日程管理',
        layout : 'fit',
        //items:[ p_form ],
        initComponent: function(){
            var Fme = this;
            
            Ext.apply(this, {
            
            });
            this.callParent();
        }
    });


    ///////////////////
    /////　标准　工具表
    //////////   1.新建时，触发btnnew 事件
    //////////   2.速查时，触发btnfind 事件
    //////////   3.删除时，触发btndelete 事件
    //////////   4.保存时，触发btnsave 事件
    //////////   5.关闭时，触发btnclose 事件
    Ext.define('ToolBarFormat', {
        extend: 'Ext.toolbar.Toolbar',
        xtype: 'ToolBarFormat',
        btnNewTitle: '新增',
        btnFindTitle: '速查',
        btnDeleteTitle: '删除',
        btnSaveTitle:'保存',
        btnFindHidden: false,

        fnAfterrender: function() {
            this.btnnew = this.getComponent('btnnew');
            this.btnfind = this.getComponent('btnfind');
            this.btndelete = this.getComponent('btndelete');
            this.btnsave = this.getComponent('btnsave');
            this.btnclose = this.getComponent('btnclose');
        },
        initComponent: function() {
            var Fme = this;

            Ext.apply(this, {
                items: ['-', {
                    text: this.btnNewTitle,
                    width: 60,
                    height: 32,
                    style: {
                        borderColor: 'black'
                    },
                    itemId: 'btnnew',
                    handler: function() {
                        Fme.fireEvent('btnnew');
                    }

                }, '-', {
                    text: this.btnFindTitle,
                    width: 60,
                    height: 32,
                    style: {
                        borderColor: 'black'
                    },
                    itemId: 'btnfind',
                    hidden : this.btnFindHidden,
                    handler: function() {
                        Fme.fireEvent('btnfind');
                    }
                }, '-', {
                    text: this.btnDeleteTitle,
                    width: 60,
                    height: 32,
                    style: {
                        borderColor: 'black'
                    },
                    itemId: 'btndelete',
                    handler: function() {
                        Fme.fireEvent('btndelete');
                    }
                }, '-', {
                    text: this.btnSaveTitle,
                    width: 60,
                    height: 32,
                    style: {
                        borderColor: 'black'
                    },
                    itemId: 'btnsave',
                    handler: function() {
                        Fme.fireEvent('btnsave');
                    }
                }, '-', {
                    text: '关闭',
                    width: 60,
                    height: 32,
                    style: {
                        borderColor: 'black'
                    },
                    itemId: 'btnclose',
                    handler: function() {
                        Fme.fireEvent('btnclose');
                    }
                }]

                    //onTriggerClick : this.thisTriggerClick
                });
                this.callParent();
            },
            resetDisabled: function() {
                if (!this.btnnew)
                    this.fnAfterrender();

                this.btnnew.setDisabled(false);
                this.btnfind.setDisabled(false);
                this.btndelete.setDisabled(false);
                this.btnsave.setDisabled(false);
                this.btnclose.setDisabled(false);
            },
            setDisabled: function(strBtnLists, disabledValue) {

                this.resetDisabled();
                var btnItemIds = strBtnLists.toString().split(',');
                for (var i = 0; i < btnItemIds.length; ++i) {

                    if (btnItemIds[i] && btnItemIds[i] != '') {
                        this.getComponent(btnItemIds[i]).setDisabled(disabledValue);
                    }
                }
            }
        });
        
        
///////////////////////////////////////////////查询单号窗体
//查询store 通用 自动加 mode=SearchHearderNO 所以要在url的ashx加这个指定处理
GetGridDsWithPageZize = function(postUrl,model, pageSize){
    return  new Ext.data.Store({
        pageSize: pageSize ? pageSize : 200,
        model: model,
        proxy: {
            type: 'ajax',
            url : postUrl.toString().toUpperCase().lastIndexOf(".ASHX") != (postUrl.length - 5) ? postUrl + '&mode=SearchHearderNO' : postUrl + '?mode=SearchHearderNO',
            reader:{ 
                type:'json',
                root: 'items',
                totalProperty :'total'
            }
        },
        listeners:{
            beforeload:function(store){
                store.proxy.extraParams = {SearchConditions : store.SearchConditions, limit :pageSize};
            }
            }
    });  
}




        Ext.define('columnSearchClass',{
            extend:'Ext.panel.Panel',
            alias:'widget.columnSearch',  
            isSearchLike: true,
            myXtype:'xxxx',
            myDataIndex:'xxxx',
            myHeader:'xxxxx',
            // Txtype:'datefield',
            //isFix:true,           必须显示的
            //isForm_To:true        从 至 ?
            margin:'2',
            boxFromValue : '',
            boxToValue  : '',
            initComponent:function(){
                this.callParent();
            },
            items:[
//                    {xtype:'textfield',fieldLabel:'XXX',labelAlign:'right'},
//                    {xtype:'textfield',fieldLabel:'至',labelAlign:'right'}
            ],
            hideBox_to:function(){
                this.getComponent('toObj').hide();
            },
            getHideBox_toVisible : function(){
                return this.getComponent('toObj').isVisible();
            },
            showBox_to:function(){
                this.getComponent('toObj').show();
            },
            setValue : function(value1, value2){
                var me = this;
                me.boxFromValue = value1;
                me.boxToValue = value2;
                if(me.had_render){
                    me.getComponent('formObj').setValue( value1);
                    me.getComponent('toObj').setValue( value2);
                }
            },
            getValue : function(){
                var me = this;
                var obj = {};
                obj.dataIndex = me.myDataIndex;
                obj.isForm_To = me.isForm_To;
                obj.sqlDataIndex = me.sqlDataIndex;
                obj.myXtype     = me.myXtype;
//                    obj.from_xtype = me.getComponent('formObj').getXtype();
//                    obj.to_xtype = me.getComponent('toObj').getXtype();
                
                obj.toValueBoxVisible = me.getComponent('toObj').isVisible();
                obj.formValueBoxVisible = me.getComponent('formObj').isVisible();
                
                switch(me.myXtype){
                    case 'datefield':
                        obj.formValue = me.getComponent('formObj') ? me.getComponent('formObj').getSubmitValue() : '';
                        //alert(obj.formValue);
                        obj.toValue = me.getComponent('toObj') ? me.getComponent('toObj').getSubmitValue() : '';
                    break;
                    case 'textfield':
                    default:
                        obj.formValue = me.getComponent('formObj') ? me.getComponent('formObj').getValue() : '';
                        obj.toValue = me.getComponent('toObj') ? me.getComponent('toObj').getValue() : '';
                    break;
                }
                
                return obj;
            },
            listeners:{
                afterrender:function(com,obj){
                        var me = this;
                        var componentA, componentB
                        switch(me.myXtype){
                            case 'datefield':
                                componentA = new Ext.form.field.Date({
                                        itemId:'formObj',
                                        submitFormat:   'Y-m-d',
                                        format      :   'Y-m-d',
                                        fieldLabel  :   me.myHeader,
                                        labelAlign  :   'left',
                                        labelWidth: 35,
                                        anchor: '100%' ,
                                        name          :   me.myDataIndex + '_form'
                                 });
                                componentA.setValue(me.boxFromValue);
                                
                                componentB = new Ext.form.field.Date({
                                    itemId      :   'toObj',
                                    submitFormat:   'Y-m-d',
                                    format      :   'Y-m-d',
                                    fieldLabel  :   '至',
                                    labelAlign  :   'left',
                                    labelWidth: 35,
                                    anchor: '100%' ,
                                    name        :   me.myDataIndex + '_to'
                                });
                                componentB.setValue(me.boxToValue);
                            break;
                            case 'textfield' :
                            default:
                                componentA = new Ext.form.field.Text({
                                    itemId:'formObj',
                                    fieldLabel  :   me.myHeader,
                                    labelAlign :'   left',
                                    labelWidth: 35,
                                    anchor: '100%' ,
                                    name        :   me.myDataIndex + '_form'
                                });
                                componentA.setValue(me.boxFromValue);
                                
                                componentB = new Ext.form.field.Text({
                                    itemId:'toObj',
                                    fieldLabel  :   '至',
                                    labelAlign  :   'left',
                                    labelWidth: 35,
                                    anchor: '100%' ,
                                    name        :   me.myDataIndex + '_to'
                                });       
                                componentB.setValue(me.boxToValue);                         
                            break;
                        }
                        //隐藏第二个栏位
                        if(me.isSearchLike && me.isSearchLike == true)
                            componentB.hidden = true;
                        if(me.isForm_To && me.isForm_To == true) 
                            componentB.hidden = false;
                            
                        me.add([componentA,componentB]);
                        me.had_render = true;
                }
            }
        });
        Ext.define('MySunSearchNoWin', {
            extend: 'Ext.button.Button',
            alias: 'widget.SunSearchNoWin',
            //新建时要自定义指定
            setGridStore: Ext.emptyFn,
            setGridColumns: Ext.emptyFn,
            //                postUrl,
            //                model,
            defaultSearchCondition: '',
            queryParam: 'SearchConditions',
            closeWin: function () {
                var me = this;
                me.viewport.close();
            },
            FirstOpen: true,
            toString: function dogToString() { //开始
                return 'yyyy';
            },
            //加载搜索栏位
            loadSearchColumn: function () {

                var me = this;
                var westPanel = me.viewport.getComponent('west');
                var isSearchLike = westPanel.getDockedItems()[1].getComponent('isSearchLike').isPressed;
                var centerGrid = me.viewport.getComponent('center').getComponent('centerGrid');
                var colCount = centerGrid.headerCt.getColumnCount();

                westPanel.removeAll();
                colItems = centerGrid.headerCt.getGridColumns();
                var xtype = '';
                for (var i = 0; i < colCount; ++i) {
                    //固定显示优先与隐藏
                    if (!colItems[i].isFix && (colItems[i].hidden == true) || ((colItems[i].isFix && colItems[i].isFix == false) && colItems[i].hidden == true)) {
                        continue;
                    }

                    //判断是否是时间控件　通过Grid column  自定义属性　　Txtype ,01-11问?为何不直接用xtype?答: 因为column里的column有保留
                    if (colItems[i].Txtype && colItems[i].Txtype == 'datefield')
                        xtype = 'datefield'
                    else
                        xtype = 'textfield'

                    var T1 = new columnSearchClass({
                        myXtype: xtype,
                        myDataIndex: colItems[i].dataIndex,
                        myHeader: colItems[i].text,
                        isSearchLike: isSearchLike,
                        isForm_To: colItems[i].isForm_To,
                        sqlDataIndex: colItems[i].sqlDataIndex
                    });

                    westPanel.add(T1);
                }
            },
            loadStore: function (sqlWhere) {
                var me = this;
                if (!me.centerGrid) {
                    me.centerGrid = me.viewport.getComponent('center').getComponent('centerGrid');
                    me.centerGridStore = me.centerGrid.getView().getStore();
                }

                if (sqlWhere) {

                    var cparams = {};
                     
                    cparams[me.queryParam] = sqlWhere;

                    me.centerGridStore.load({ params: cparams });
                }
            },
            updatePostUrl: function (newValue) {
                var me = this;

                me.centerGrid = me.viewport.getComponent('center').getComponent('centerGrid');
                me.centerGridStore = me.centerGrid.getView().getStore();
                me.centerGridStore.proxy.url = newValue;
            },
            iniShowWin: function (Fme) {
                var me = this;
                me.viewport = Ext.create('widget.window', {
                    title: '查询窗体',
                    icon: '../JS/resources/MyIcon/search.png',
                    itemId: 'showWin',
                    //id: 'border-example',
                    layout: 'border',
                    closeAction: 'hide',
                    //bodyStyle: 'padding: 5px;',
                    constrain: true,
                    height: 400,
                    width: me.myWinWidth ? me.myWinWidth : 600,
                    //bodyPadding:5,
                    items: [
                                    new Ext.toolbar.Toolbar({
                                        region: 'north',
                                        items: [
                                            {
                                                xtype: 'splitbutton',
                                                text: '设置',
                                                menu: new Ext.menu.Menu({
                                                    items: [
                                                        { text: '默认查询方式', handler: function () { alert("设默认查询条件"); } },
                                                        { text: '刷新', handler: function () { alert("刷新sotre"); } }
                                                    ]
                                                })
                                            }, '->',
                                            {
                                                xtype: 'textfield',
                                                labelAlign: 'right',
                                                name: '',
                                                fieldLabel: '过滤',
                                                emptyText: 'enter search term'
                                            }
                                        ]
                                    }), {
                                        region: 'west',
                                        itemId: 'west',
                                        xtype: 'panel',
                                        split: true,
                                        width: 200,
                                        minWidth: 175,
                                        maxWidth: 400,
                                        collapsible: true,
                                        animCollapse: true,
                                        title: '条件',
                                        iconCls: 'nav',
                                        items: [{
                                        }],
                                        buttons: [
                                            {
                                                itemId: 'isSearchLike',
                                                name: 'isSearchLike',
                                                text: '模糊查询',
                                                isPressed: true,
                                                handler: function () {
                                                    var westPanel = me.viewport.getComponent('west');
                                                    //alert(westPanel.items.getCount());
                                                    this.isPressed = !this.isPressed;
                                                    for (var i = 0; i < westPanel.items.getCount(); ++i) {
                                                        if (this.isPressed)
                                                            westPanel.items.getAt(i).hideBox_to();
                                                        else
                                                            westPanel.items.getAt(i).showBox_to();
                                                    }
                                                },
                                                listeners: {
                                                    //                                                    blur:function(){
                                                    //                                                         this.btnEl.addCls('x-btn-over x-btn-pressed');         //  不起效？？？ 
                                                    //                                                         alert(this.btnEl.addCls);
                                                    //                                                    }
                                                }
                                            },
                                            {
                                                text: '查询Go',
                                                handler: function () {
                                                    //后台查询　更新store
                                                    var westPanel = me.viewport.getComponent('west');
                                                    var isSearchLike = westPanel.getDockedItems()[1].getComponent('isSearchLike').isPressed;
                                                    //alert(isSearchLike);
                                                    var values = [];
                                                    var searchWhere = ' 1 = 1 ';
                                                    if (Fme.defaultSearchCondition) {
                                                        searchWhere += ' and ' + Fme.defaultSearchCondition;
                                                    }

                                                    var dateIndex = '';
                                                    for (var i = 0; i < westPanel.items.getCount(); ++i) {
                                                        values[i] = westPanel.items.getAt(i).getValue();
                                                        // 优先 sqlDataIndex 查询列名
                                                        dateIndex = values[i].sqlDataIndex && values[i].sqlDataIndex != '' ?
                                                            values[i].sqlDataIndex : values[i].dataIndex;

                                                        if (!values[i].formValue && values[i].toValue == '')
                                                            continue;

                                                        //二个控件都存在则用>= <=
                                                        if (values[i].myXtype == 'datefield' || values[i].toValueBoxVisible == true) {
                                                            if (values[i].formValueBoxVisible == true && values[i].formValue && values[i].formValue != '')
                                                                searchWhere += ' and ' + dateIndex + " >= '" + values[i].formValue + "' ";
                                                            if (values[i].toValueBoxVisible == true && values[i].toValue && values[i].toValue != '')
                                                                searchWhere += ' and ' + dateIndex + " <= '" + values[i].toValue + "' ";
                                                        }
                                                        else {
                                                            if (values[i].formValueBoxVisible == true && values[i].formValue && values[i].formValue != '')
                                                                searchWhere += ' and ' + dateIndex + " like '%" + values[i].formValue + "%' ";
                                                        }

                                                    }
                                                    //alert( ' searchWhere ' + searchWhere);
                                                    me.loadStore(searchWhere);
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        itemId: 'center',
                                        region: 'center',
                                        xtype: 'panel',
                                        //autoScroll:true,
                                        layout: 'fit',
                                        xtype: 'panel',
                                        autoScroll: true,
                                        items: [
                                                {
                                                    itemId: 'centerGrid',
                                                    margins: '0 0 0 0',
                                                    autoScroll: true,
                                                    xtype: 'grid',
                                                    anchor: '100%',
                                                    multiSelect: me.multiSelect ? me.multiSelect : false,
                                                    store: GetGridDsWithPageZize(me.postUrl, me.model),
                                                    columns: me.setGridColumns(),
                                                    listeners: {
                                                        afterrender: function (thisComponent, eOpts) {
                                                            //
                                                            me.centerGrid = me.viewport.getComponent('center').getComponent('centerGrid');
                                                            me.centerGridStore = me.centerGrid.getView().getStore();
                                                            //加载所有的
                                                            me.loadSearchColumn();
                                                        },
                                                        columnhide: function (ct, column, eOpts) {
                                                            me.loadSearchColumn();
                                                        },
                                                        columnshow: function (ct, column, eOpts) {
                                                            me.loadSearchColumn();
                                                        },
                                                        columnmove: function (ct, column, eOpts) {
                                                            me.loadSearchColumn();
                                                        },
                                                        itemdblclick: function (View, record, item, index, e, eOpts) {
                                                            //双击关闭　返回加载单据内容
                                                            //传值后,开始赋值给外面的Grid
                                                            me.fireEvent('subItemclick', record);
                                                            me.viewport.close();
                                                        }
                                                    }
                                                }
                                        ],
                                        buttons: [
                                            {
                                                text: '选取',
                                                handler: function () {
                                                    if (!me.CenterGrid)
                                                        me.CenterGrid = me.viewport.getComponent('center').getComponent('centerGrid');
                                                    //选取
                                                    var records = me.CenterGrid.getSelectionModel().getSelection();
                                                    me.fireEvent('fetchBack', records);
                                                    me.closeWin();
                                                }
                                            },
                                            { text: '取消', handler: function () { me.closeWin(); } }
                                        ]
                                    }
                                ]
                });
                //me.viewport.show();
                return me.viewport;
            },
            initComponent: function () {
                var me = this;
                this.addEvents('subItemclick', 'fetchBack');        //grid控件内的事件
                me.iniShowWin(me);
                this.callParent();
            },
            constructor: function () {
                var me = this;
                this.callParent(arguments);
            },
            handler: function () {
                var me = this
                if (me.FirstOpen == true) {
                    me.FirstOpen = false;
                    me.loadStore('1 = 1');
                }

                //me.viewport.show();
                if (me.viewport.isVisible() == false) {
                    me.viewport.show();
                    me.viewport.focus();        //以防点击　弹出窗体　系统自动跳回column设blur
                }
                else
                    me.viewport.close();
            },
            getSubmitValue: function () {
                return this.processRawValue(this.realValue);
            }
        });     // Ext.define

///////////////////////////////////////////////查询单号窗体 结束    

        Ext.define('Model_CB_KeyName', {
             extend: 'Ext.data.Model',
             fields: [
                 {name: 'value', type: 'string'},
                 {name: 'name',  type: 'string'}
             ]
        });

        Ext.define('SearchBoxClass',{
            extend:'Ext.panel.Panel',
            alias:'widget.columnSearch_B',  
            isSearchLike: true,
            myXtype:'textfield',
            myText:'栏位名',
            mySqlName:'数据库别名',
            myBoxType :'A',         //A 起止类型  B like 字符 C 下拉类
            myNeedSeparate : false, //本栏位　需要独立发送到后台的？？　（只适用于：B 模糊查询类型）
            initComponent:function(){
                this.callParent();
            } ,
            items:[
//                    { labelWidth: 100,xtype:this.myXtype,fieldLabel:'XXX',labelAlign:'right'},
//                    { labelWidth: 20,xtype:this.myXtype ,fieldLabel:'~~',labelAlign:'left'}
            ],
            getSqlStr : function(){
                
                var me = this,res ='',
                    sqlName = me.mySqlName,
                    needSeparate = me.myNeedSeparate,
                    boxValue, box1Value,
                    boxValueS,box1ValueS;
                    //alert(me.myBoxType);
                    
                if(me.myBoxType == 'A'){                   
                    boxValue = me.getComponent(0).getComponent('formObj').getValue();
                    box1Value = me.getComponent(0).getComponent('toObj').getValue();
                    
                    if(me.myXtype == 'datefield'){
                        boxValueS = boxValue ? Ext.Date.format(boxValue, Ext.Date.patterns.ISO8601Short) : null;
                        box1ValueS = box1Value ? Ext.Date.format(box1Value, Ext.Date.patterns.ISO8601Short) : null;
                    }
                    else if(me.myXtype == 'numberfield'){
                        if(boxValue==0)
                            boxValueS = '0';
                        else
                            boxValueS = boxValue;
                        
                        if(box1Value==0) 
                            box1ValueS = '0';
                        else                            
                            box1ValueS = box1Value;
                    }
                    else{
                        boxValueS = boxValue;
                        box1ValueS = box1Value;
                    }
                    
                    res +=  (boxValueS && boxValueS != '') ? ' and ' + sqlName + ' >= \'' + boxValueS + '\'' : '';
                    res +=  (box1ValueS && box1ValueS != '') ? ' and ' + sqlName + ' <= \'' + box1ValueS + '\'' : '';
                }
                
                var isLikeSpe = '%';
                
                if(me.myBoxType == 'B'){
                    
                    boxValue = me.getComponent(0).getComponent('isLikeObj').getValue();
                    box1Value = me.getComponent(0).getComponent('valueObj').getValue();
                    
                    if(me.myXtype == 'datefield'){
                        box1ValueS = box1Value ? Ext.Date.format(box1Value, Ext.Date.patterns.ISO8601Short) : null;
                    }
                    else if(me.myXtype == 'numberfield'){
                        if(boxValue==0)
                            boxValueS = '0';
                        else
                            boxValueS = boxValue;
                        
                        if(box1Value==0) 
                            box1ValueS = '0';
                        else
                            box1ValueS = box1Value;
                    }
                    else{
                        box1ValueS = box1Value;
                    }
                    
                    //console.log(boxValue + '  ' + '   ' + box1Value + ' ' + box1ValueS);
                    if(boxValue == 'like'){
                        res += (box1ValueS && box1ValueS != '') ? ' and ' + sqlName + ' like \'%' + box1ValueS + '%\'' : '' ;
                    }
                    else if(boxValue == 'nolike') {
                        res += (box1ValueS &&  box1ValueS != '') ? ' and ' + sqlName + ' = \'' + box1ValueS + '\''  : '';
                    }
                    else if(boxValue == 'begin_match') {
                        res += (box1ValueS &&  box1ValueS != '') ? ' and ' + sqlName + ' like \'' + box1ValueS + '%\''  : '';
                    }
                    else if(boxValue == 'end_match') {
                        res += (box1ValueS &&  box1ValueS != '') ? ' and ' + sqlName + ' like \'%' + box1ValueS + '\''  : '';
                    }
                    
                    
                    // 模糊查询类型，　独立返回后台
                    if(needSeparate == true){
                        return {name : sqlName, value:  box1ValueS};
                    }
                }
                
                return res;
            },
            getBox : function(objName){
                return this.getComponent(0).getComponent(objName);
            },
            clearBox:function(){
                var me = this;
                if(me.myBoxType == 'A'){
                    me.getComponent(0).getComponent('formObj').setValue('');
                    me.getComponent(0).getComponent('toObj').setValue('');
                }
                if(me.myBoxType == 'B'){
                    me.getComponent(0).getComponent('isLikeObj').setValue('like');
                    me.getComponent(0).getComponent('valueObj').setValue('');
                }
                return true;
            },
            listeners:{
                afterrender:function(com,obj){
                    var me = this;
                    me.remove(0);
                    if(me.myBoxType == 'A'){
                        me.add(Ext.apply(
                            {
                                border:0,
                                layout:'column',
                                defaults: {
                                        style:'margins: 0px 0px 0px 0px'
                                },
                                items:[
                                    { itemId  :'formObj', labelWidth: 100, xtype:me.myXtype, fieldLabel : me.myText, labelAlign:'right',format:'Y-m-d'},
                                    { itemId  :'toObj', labelWidth: 20,  xtype:me.myXtype, fieldLabel:'~~', labelAlign:'left',format:'Y-m-d'}
                                ]
                            }
                        ));   
                    } 
                    if(me.myBoxType == 'B'){
                    
                        var states = Ext.create('Ext.data.Store', {
                            fields: ['abbr', 'name'],
                            data : [
                                {"abbr":"like", "name":"模糊"},
                                {"abbr":"nolike", "name":"准确"},
                                {"abbr":'begin_match', "name":"头包含"},
                                {"abbr":'end_match', "name":"结尾包含"}
                            ]
                        });
                        

                        var state2 = Ext.create('Ext.data.Store', {
                            model: 'Model_CB_KeyName',
                            data : []
                        });

                        // Create the combo box, attached to the states data store
                        var cm_box = Ext.create('Ext.form.ComboBox', {
                            store: states,
                            queryMode: 'local',
                            displayField: 'name',
                            valueField: 'abbr'
                        });
                        me.add(Ext.apply(
                            {
                                border:0,
                                layout:'column',
                                defaults: {
                                        style:'margin-bottom: 0px'
                                },
                                items:[
                                    { itemId  :'isLikeObj', labelWidth: 100, xtype:'combo', fieldLabel : me.myText, labelAlign:'right',
                                            store: states,queryMode: 'local',  displayField: 'name', valueField: 'abbr',value:'like'
                                    },
                                    { itemId  :'valueObj',  labelWidth: 20,  xtype:me.myXtype, queryMode : 'local', fieldLabel:' ', labelAlign:'left',format:'Y-m-d', store : state2, valueField : 'value', displayField :'name'}
                                ]
                            }
                        ));
                    }                
                }
            }
        });
        
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////SunSearchWin_B
        Ext.define('Search_B_model',{
            extend: 'Ext.data.Model',
            fields: [
               {name:'itemId',type:'string'},
               {name:'is_selected',type:'string'},
               {name:'sqlname',type:'string'},
               {name:'boxtype',type:'string'},
               {name:'text',type:'string'},
               {name:'xtype',type:'string'},
               {name:'needSeparate', type:'bool'}
            ]
        });
        
        Ext.define('MySunSearchWin_B', {
            extend:'Ext.button.Button',
            alias:'widget.SunSearchWin_B',
            //SourceStore:
            IsSelectedChange : false,
            cellColoumns : [],
            pageId:'页面id',
            btnId:'控件id',
            fnGetColumnEditor : function(c_name){
                return this.formPanel.getComponent(c_name);
            },
            lazyJobs: {},
            lazyJobsName : [],
            fnAddLazyJobs : function(action_type, c_name, paras){
                
                var me = this;
                //打开时自动加上Combo数据项
                if(action_type == 'add_cb_data'){       //paras 是数组
                    
                    if(this.lazyJobsName.indexOf(c_name, 0) < 0)
                        this.lazyJobsName[this.lazyJobsName.length] = c_name ;
                    
                    this.lazyJobs[c_name] = function(){
                        
                        var _box = me.fnGetColumnEditor(c_name);
                        if(_box){
                            var _cb_store = _box.getBox('valueObj').getStore();
                            _cb_store.removeAll();
                            
                            for(var i = 0 ; i < paras.length; ++i)
                                _cb_store.add( Ext.create('Model_CB_KeyName',{'value': paras[i], 'name': paras[i]}) );
                        }
                    }
                }
            },
            fnDoLazyJobs : function(){
                var me = this;
                var fn = function(){
                    for(var i = 0 ; i < me.lazyJobsName.length; ++i){
                        me.lazyJobs[me.lazyJobsName[i]]();
                        console.log(me.lazyJobsName[i]);
                    }
                        
                    me.lazyJobsName = [];
                }
                fn();
               // Common_RunDelayFn(fn, 800);
            },
            fnShowSearchCol: function(){ //显示　打Y的查询控件
                var me = this;
                if(me.IsSelectedChange == false)
                    return false;
                
                me.formPanel.removeAll();
                var cnt = me.SourceStore.getCount();
                
                for(var i=0; i< cnt; ++i){
                    var rec =  me.SourceStore.getAt(i);
                    if(rec.get('is_selected') == 'Y'){
                    
                        var SearchBox = new SearchBoxClass({
                            itemId  : rec.get('itemId'),
                            myXtype : rec.get('xtype'),
                            myText  : rec.get('text'),
                            myBoxType   : rec.get('boxtype'),
                            mySqlName   : rec.get('sqlname'),
                            myNeedSeparate : rec.get('needSeparate')
                        });
                        
                        me.formPanel.add(SearchBox);
                    }
                } // for
                
                //加载新项，设回末变更状态
                me.IsSelectedChange = false;
            },
            fnGetSelectedCols_StrList : function(){
                var me = this, res = '';
                
                var cnt = me.SourceStore.getCount();
                for(var i=0; i< cnt; i++){
                    var rec =  me.SourceStore.getAt(i);
                    if(rec.get('is_selected') == 'Y'){
                        res += rec.get('sqlname') + ','
                    }
                }
                return res;
            },
            
            handler:function(){
                var me = this;
                me.viewport.show();
                me.fnDoLazyJobs();
            },
            iniShowWin:function( isReady ){
                var me = this;
                if(me.isReady == true){
                     me.viewport.show();
                     return false;
                }
                
                var itm = 0, itm1 = 0;
                var mySourceCellCols = [], item = [];
                //加载所有原项
                for(var i=0; i< me.cellColoumns.length; i++){
                    var col = me.cellColoumns[i];
                    
                    mySourceCellCols[itm++] = {
                        itemId      : col.name,
                        is_selected : (col.hidden && col.hidden == true) ? 'N' :'Y',
                        sqlname :col.mySqlName ? col.mySqlName : '末定义栏位名',
                        boxtype :col.myBoxType ? col.myBoxType : 'A',
                        text : col.myText ? col.myText :col.text,
                        xtype : col.myXtype ? col.myXtype : 'textfield',
                        needSeparate : (col.myNeedSeparate && col.myNeedSeparate== true) ? true : false,
                        hidden : (me.hidden  || false)
                    }
                }

                me.SourceStore = Ext.create('Ext.data.ArrayStore', {
                    model:'Search_B_model',
                    proxy:{
                        type:'memory',
                        data: mySourceCellCols,
                        reader:{
                            type:'json'
                        }
                    },
                    autoLoad: true
                });
                
                me.formPanel = Ext.create('Ext.form.Panel',{ 
                    itemId :'SearchBoxPanel',
                    title:'速查',
                    items:[],
                    listeners:{}
                });
                
                me.gridPanel = Ext.create('Ext.grid.Panel', { 
                        plugins: [
                            Ext.create('Ext.grid.plugin.CellEditing', {
                                clicksToEdit: 1,
                                listeners:{
                                    edit : function(editor, e) {
                                        if(e.originalValue == e.value)
                                            return false;
                                        
                                        me.IsSelectedChange = true;
                                        e.record.commit();
                                    }
                                }
                            })
                        ],
                        store　:　me.SourceStore,
                        title:'条件选区',
                        columns: [
                            {header:'选择', dataIndex:'is_selected',name:'is_selected', 
                                editor:{ 
                                    xtype: 'combobox',
                                    triggerAction:'all',
                                    valueField:'abbr',
                                    displayField:'text',
                                    minLength:1,
                                    editable  : false,
                                    store:new Ext.data.Store({
                                        fields:['abbr','text'],
                                        data:[
                                            {abbr:'N',text:'N'},
                                            {abbr:'Y',text:'Y'}
                                        ]
                                    })
                                }
                            },
                            {header:'字段名称',dataIndex:'text',name:'text'},
                            {header:'字段类型',dataIndex:'xtype',name:'xtype'},
                            {header:'字段值',dataIndex:'sqlname',name:'sqlname'},
                            {header:'查询类型',dataIndex:'boxtype',name:'boxtype'}
                        ]
                });

                
                me.viewport = Ext.create('Ext.window.Window', {
                    title:'查询窗体',
                    itemId:'showWin',
                    constrain: true,
                    icon:'../JS/resources/MyIcon/search.png',
                    closeAction:'hide',
                    width:500,
                    
                    items:[
                        {
                            xtype:'tabpanel',
                            activeTab: 0,
                            items: [
                                me.formPanel, me.gridPanel
                            ],
                            listeners:{
                                tabchange:function(tabPanel,newCard,oldCard,eOpts){
                                    //tabPanel.setActive(newCard);
                                    if(newCard.itemId == 'SearchBoxPanel' ){
                                        me.fnShowSearchCol();
                                    } 
                                }
                            }
                        }
                    ],
                    buttons:[
                        {   
                            itemId:'btn', text:'查询', 
                                handler:function(){
                                    
                                    var resObj = me.getSqlStr();
                                    //直接转换成{} 对象
                                    var Params = {};
                                    Params.SearchConditions = resObj[0];
                                    for(var i=1; i < resObj.length; ++i){
                                        Params[resObj[i].name] = resObj[i].value;
                                    }
                                    me.fireEvent('searchClickEvent', resObj[0],　resObj, Params);
                                }
                        },
                        {   
                            itemId:'btn1',text:'清空条件', 
                                handler:function(){
                                    me.clearBox();
                                }
                        }
                    ],
                    listeners:{
                        hide:function(Component,eOpts){
                            //窗体隐藏时，保存选中的数据
                            Ext.Ajax.request({
                                    type:'post',
                                    url:'../ASHX/common/SearchBTN.ashx?mode=update',
                                    params: {
                                        sqlname : me.fnGetSelectedCols_StrList(),
                                        pageId:me.pageId,
                                        btnId:me.btnId
                                    },
                                    success: function(response){
                                    }
                            });
                        }, //hide
                        
                        afterrender:function(Component,eOpts){
                            if(me.isReady == true)
                                return false;
                                
                            //加载已选项相应的 is_selected值
                            Ext.Ajax.request({
                                type:'post',
                                url:'../ASHX/common/SearchBTN.ashx',
                                params: {
                                    pageId　:　me.pageId,
                                    btnId　:　me.btnId,
                                    mode    : 'load'
                                },
                                success: function(response){
                                    var value = response.responseText;
//                                    if(value == '')
//                                        return ;
                                    var selected_Data = value.split(',');
                                    //如果有自定义的排布，就把默认显示的控件，不显示
                                    var _cnt = me.SourceStore.getCount();
                                    if(selected_Data.length > 0){
                                        for(var i=0; i< _cnt; ++i){
                                            me.SourceStore.getAt(i).set('is_selected', 'N');
                                        }
                                    }
                                        
                                    var record, index;
                                    for(var i=0; i< selected_Data.length - 1; ++i)
                                    {
                                        var rec_temp = me.SourceStore.findRecord('sqlname', selected_Data[i]);
                                        if(rec_temp){
                                            rec_temp.set('is_selected', 'Y');
                                        }
                                    } 
                                    
                                    //显示找Y　查询控件
                                    me.IsSelectedChange = true;
                                    me.fnShowSearchCol();
                                }
                            }); // request
                        }
                     }
                });
                
                
                if(isReady == true){
                    this.viewport.doLayout();
                    this.formPanel.doLayout();
                    this.viewport.fireEvent('afterrender');
                    this.rendered = true;
                    this.isReady = true;
                }
                
            },
            // 返回一个数组，
            ////  第一个元素是查询字符串　
            ////　其余是独立返回后台值的字段（needSeparate: true）
            getSqlStr:function(){
                var me =this;
                var resObj = [];
                resObj[0] = '1=1';
//                for(var i = 0; i< me.formPanel.items.getCount() ; ++i){
//                    var valueObj = me.formPanel.items.getAt(i).getValue();
//                    var box_To_Visible = me.formPanel.items.getAt(i).getHideBox_toVisible();
//                    
//                    // 优先 sqlDataIndex 查询列名
//                    var dateIndex = (valueObj.sqlDataIndex && valueObj.sqlDataIndex != '') ?  valueObj.sqlDataIndex : valueObj.dataIndex;
                    
//                    //like 查询
//                    if(valueObj.form_type == 'combo'){
//                        if(valueObj.formValue == '0')
//                            res += dateIndex + " like '%" + valueObj.toValue + "%'";
//                        else
//                            res += dateIndex + " = '" + valueObj.toValue + "'";
//                    }
//                    else{
//                        if(valueObj.formValue)
//                            res += dateIndex + " >= '" + valueObj.formValue + "'";
//                            
//                        if(valueObj.toValue)
//                            res += dateIndex + " <= '" + valueObj.toValue + "'";
//                    }                                        
//                  }
                
                var lcnt = me.formPanel.items.length;
                for(var i = 0 ; i < lcnt ; ++i){
                    var T = me.formPanel.items.getAt(i).getSqlStr();
                    if(typeof(T) != 'object'){
                        resObj[0] += T;
                    }
                    else{
                        resObj.push(T);
                    }
                }
                
                return resObj;
            },
            clearBox:function(){
                var me =this;
                var lcnt = me.formPanel.items.length;
                for(var i = 0 ; i < lcnt ; ++i){
                    me.formPanel.items.getAt(i).clearBox();
                }
            },   
            initComponent: function() {
                var me = this;
                me.addEvents('searchClickEvent');
                me.iniShowWin();
                this.callParent();
            }
        });

