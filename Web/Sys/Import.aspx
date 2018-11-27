<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Import.aspx.cs" Inherits="TestExtJs" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Excel数据录入</title>
    <script type="text/javascript">
        var NowUserId = 'admin';
    </script>
    <link href="../JS/resources/css/ext-all.css" rel="stylesheet" type="text/css" />
    <script src="../JS/ext-all.js" type="text/javascript"></script>
    <script src="../JS/Setting/DataModel.js?version=9"></script>

    
    <script src="../JS/SMSCommonJS.js?version=20" type="text/javascript"></script>
    <script src="../JS/commonJSFn.js?version=18" type="text/javascript"></script>
    
    <script src="../JS/SunGridHeadYAOSELF.js?version=2" type="text/javascript"></script>
    
    <script src="../JS/Setting/Cust_Setting.js" type="text/javascript"></script>
    <script src="../JS/Setting/Prdt_Setting.js" type="text/javascript"></script>
    <script src="../JS/Setting/Salm_Setting.js" type="text/javascript"></script>

    <script src="../JS/Setting/SearchSySBox.js" type="text/javascript"></script>
    
    <script type="text/javascript">

        Ext.onReady(function () {


//           var txt1 = Ext.create('Ext.form.field.Text', {
//                // private
//                initEvents: function () {
//                    var me = this,
//                        el = me.inputEl;

//                    me.callParent();
//                    if (me.selectOnFocus || me.emptyText) {
//                        me.mon(el, 'mousedown', me.onMouseDown, me);
//                    }
//                    if (me.maskRe || (me.vtype && me.disableKeyFilter !== true && (me.maskRe = Ext.form.field.VTypes[me.vtype + 'Mask']))) {
//                        me.mon(el, 'keypress', me.filterKeys, me);
//                    }

//                    if (me.enableKeyEvents) {
//                        me.mon(el, {
//                            scope: me,
//                            keyup: me.onKeyUp,
//                            keydown: me.onKeyDown,
//                            keypress: me.onKeyPress
//                        });
//                    }

//                    //alert('ABC');
//                }
//            });


//            Ext.create('Ext.data.Store', {
//                storeId: 'simpsonsStore',
//                fields: ['name', 'email', 'phone'],
//                data: { 'items': [
//        { 'name': 'Lisa', "email": "lisa@simpsons.com", "phone": "555-111-1224" },
//        { 'name': 'Bart', "email": "bart@simpsons.com", "phone": "555-222-1234" },
//        { 'name': 'Homer', "email": "home@simpsons.com", "phone": "555-222-1244" },
//        { 'name': 'Marge', "email": "marge@simpsons.com", "phone": "555-222-1254" }
//    ]
//                },
//                proxy: {
//                    type: 'memory',
//                    reader: {
//                        type: 'json',
//                        root: 'items'
//                    }
//                }
//            });


//            Ext.create('Ext.grid.Panel', {
//                title: 'Simpsons',
//                store: Ext.data.StoreManager.lookup('simpsonsStore'),
//                columns: [
//                    { text: 'Name', dataIndex: 'name', width: 150, autoSizeColumn: true },
//                    { text: 'Email', dataIndex: 'email', width: 150, autoSizeColumn: true, minWidth: 150, editor: {} },
//                    { text: 'Phone', dataIndex: 'phone', width: 150 }
//                ],
//                viewConfig: {
//                    listeners: {
//                        refresh: function (dataview) {
//                            Ext.each(dataview.panel.columns, function (column) {
//                                if (column.autoSizeColumn === true)
//                                    column.autoSize();
//                            })
//                        }
//                    }
//                },
//                width: 450,
//                renderTo: Ext.getBody()
//            });

//            Ext.create('Ext.form.Panel', {
//                title: 'Contact Info',
//                width: 300,
//                bodyPadding: 10,
//                renderTo: Ext.getBody(),
//                items: [{
//                    xtype: 'textfield',
//                    name: 'name',
//                    fieldLabel: 'Name',
//                    allowBlank: false  // requires a non-empty value
//                }, {
//                    xtype: 'textfield',
//                    name: 'email',
//                    fieldLabel: 'Email Address',
//                    vtype: 'email'  // requires value to be a valid email address format
//                },
//                txt1
//                ]
//            });

            //            Ext.create('CbGrid_Cust.class', { renderTo: Ext.getBody() });
            //            Ext.create('CbGrid_Prdt.class', { renderTo: Ext.getBody() });
            //            Ext.create('CbGrid_Salm.class', { renderTo: Ext.getBody() });
            //            Ext.create('CbGrid_Dept.class', { renderTo: Ext.getBody() });
            //            Ext.create('CbGrid_MFSO.class', { renderTo: Ext.getBody() });



            //        
            //        
            //		TF_POS_VAR.PrdtEditorConfig ={
            //			xtype: 'SunSearchWin_Prdt',
            //			isInGridTable:true,
            //			dataIndex : 'prd_no',
            //			displayField :'prd_no',
            //			displayFieldForTableStore :'prd_no',
            //			thisFn :  function(record){
            //				var me = this,
            //				    Rdata = record.data;
            //			    cPanel.grid.suspendLayouts();
            //			    
            //				TNowObj.record.set('prd_name' , Rdata.name);
            //				
            //				TNowObj.record.set('prd_no', Rdata.prd_no);
            //				//单位
            //				TNowObj.record.set('ut_name' , Rdata.up );
            //				TNowObj.record.set('ut1_name' , Rdata.up1 );
            //				TNowObj.record.set('ut1',Rdata.up1);
            //				TNowObj.record.set('wh_no',Rdata.wh);
            //				TNowObj.record.set('wh_name',Rdata.wh_name);
            //				TNowObj.record.set('prd_spc',Rdata.spc);
            //				
            //				//手动监控grid的变动
            //				Common_TableSateMonitor('prd_no', record.get(me.valueField), '旧值', null);
            //				TNowObj.record.commit();
            //				cPanel.grid.resumeLayouts();	
            //				
            //				
            //			},
            //			listeners:{
            //				subItemclick: function(rec){
            //					if(rec.get('itm') != '-1')
            //						this.thisFn(rec);
            //				},
            //				fetchBack : function(records){
            //					this.thisFn(records[0]);
            //				} ,
            //				select : function(combo, records, eOpts ){
            //				    this.thisFn(records[0]);
            //				   // console.log('selected');
            //				}
            //				,
            //				focus :function(){
            //				     // this.setRawValue(TNowObj.record.get('prd_no'));
            //				},
            //				blur :{
            //				    buffer : 0,   //会先触发cellEditor edit事件
            //				    fn:function(){
            //				                
            //				        var value = this.getRawValue();
            //				        
            //                        var PRec =  TF_POS_VAR.GlobalVar.PrdtCheckValid(value );
            //                        
            //				        if( TF_POS_VAR.GlobalVar && null == PRec ){
            //				            cellEditing.suspendEvents(false );
            //				            TNowObj.record.set('prd_no', '');
            //				            TNowObj.record.set('prd_name', '');
            //				            this.setRawValue('');
            //				            
            //				            cellEditing.startEdit(TNowObj.record, TNowObj.colIdx );
            //				            
            //				            cellEditing.resumeEvents( );
            //				            return false;
            //				        }
            //				        else{
            //				            this.thisFn(PRec);
            //				        }
            //				        
            //				    }
            //				 
            //				}
            //			}
            //		}




            ///// 所有的部门代号， 用于检测手工输入时有无输入不存在代号。。
            //GlobalVar.DeptStore = popSearchConfig.dsDeptInfo();
            //GlobalVar.CustStore = popSearchConfig.dsCustInfo(1);
            //GlobalVar.SalmStore = popSearchConfig.dsEmployeeInfo();
            //GlobalVar.PrdtStore = popSearchConfig.dsprd(1);
            //GlobalVar.JlCzSpcStore = popSearchConfig.dsGridJlSpc();
            //GlobalVar.JlCzSpcStore = popSearchConfig.dsGridJlSpc();

            //GlobalVar.Wh_NoStore = popSearchConfig.ds_GridWh(); 


            //GlobalVar.DeptStore.load({url:'../Handler2/Inv/DeptInfo.ashx?mode=popsearch&action=SEARCHWIN', params :{SearchConditions:'1=1'} });
            //GlobalVar.CustStore.load({url:'../Handler2/SystemManager/CustInfo.ashx?action=loaddata&CompanyCD=' + CompanyCDNO + '&UserID=' + NowUserId , params :{SearchConditions:'1=1'} });      
            //GlobalVar.SalmStore.load({url:'../Handler2/SystemManager/EmployeeInfo.ashx?action=loaddata&CompanyCD=' + CompanyCDNO +'&UserID=' + NowUserId , params :{SearchConditions:'1=1'} });
            //GlobalVar.PrdtStore.load({url:'../Handler2/SystemManager/Prdt.ashx?mode=loaddata&CompanyCD=' + CompanyCDNO , params :{SearchConditions:'1=1'} });                           
            //GlobalVar.JlCzSpcStore.load({url:'../Handler2/SystemManager/Wspcset.ashx?mode=loaddata&CompanyCD=' + CompanyCDNO, params :{SearchConditions:'1=1'}  });
            //GlobalVar.Wh_NoStore.load({url:'../Handler2/SystemManager/StorageInfo.ashx?action=SEARCHWIN&CompanyCD=' + CompanyCDNO +'&UserID=' + NowUserId, params :{SearchConditions:'1=1'}  });


            //GlobalVar.CheckValid  = function(store, fieldName, value){
            //    if(value != ''){       
            //        var R = store.findRecord(fieldName, value) ;
            //        if ( null == R){
            //            CommMsgShow('警告', '不存在该代号！！' + String( value));
            //            return null;
            //        }
            //        else
            //            return R
            //    }    
            //}


            //GlobalVar.JlCzSpcCheckValid = function( value){
            //   return GlobalVar.CheckValid(GlobalVar.JlCzSpcStore, 'cz_spc', value);
            //}

            //GlobalVar.PrdtCheckValid  = function( value){
            //  return GlobalVar.CheckValid(GlobalVar.PrdtStore, 'prd_no', value);  
            //}

            //GlobalVar.JlDeptCheckValid  = function( value){
            //   return GlobalVar.CheckValid(GlobalVar.DeptStore, 'dep_no', value);
            //}


            //GlobalVar.Wh_NoCheckValid  = function( value){
            //   return GlobalVar.CheckValid(GlobalVar.Wh_NoStore, 'wh_no', value);
            //}
            // 
            //  
            //                    //事件
            //                    me.mon(this, 'focus', function(Base, eOpts){ 
            //                         
            //                        if(false == me.isInGridTable){
            //                            me.setReadOnly(false);
            //                            Base.setRawValue(  me.hiddenRealValue.getValue() );
            //                        }
            //                        else{
            //                            //  me.setValue(Base.hiddenRealValue.getValue());
            //                        }
            //                    }, me, {buffer :1});
            //                    
            //                    me.mon(this, 'blur', function(Base, eOpts){
            //                        
            //                        me.suspendEvents(false);
            //                        if( !me.getRawValue() || me.getRawValue() == ''){
            //                            me.fnSetValue('', '');    
            //                        }
            //                                                
            //                        if(false == me.isInGridTable){
            //                            me.setRawValue(me.hiddenRawValueT.getValue());
            //                            me.setReadOnly(true);
            //                        }
            //                        else{
            //                            //  me.setValue(me.hiddenRawValueT.getValue());
            //                        }
            //                        
            //                        me.resumeEvents( ) ;
            //                    }, me, {buffer :1});
            //                    
            //                    
            //                    me.mon(this, 'change', function(a, newValue ,oldValue ,d){
            //                        //  console.log('change :' + me.getRawValue());
            //                       
            //                        //  this.fireEvent('MYchange', a , this.hiddenRealValue.getValue() );
            //                    }, me, {buffer :150});
            //                    
            //                  
            //                    
            //                    
            //                    me.mon(this, 'select', function(combo, records, eOpts ){
            //                              
            //                         if( false == me.isInGridTable){
            //                             combo.hiddenRawValueT.setValue(records[0].get(me.displayField));
            //                             combo.hiddenRealValue.setValue(records[0].get(me.valueField));
            //                             me.inputEl.blur(); 
            //                         }
            //                         else{
            //                            //me.fireEvent('subItemSelect', records[0]);    //在Grid里不解决事件，除非在定义Editor里监听才成效
            //                            //me.inputEl.blur();
            ////                            combo.hiddenRawValueT.setValue(records[0].get(me.displayField));
            ////                            combo.hiddenRealValue.setValue(records[0].get(me.valueField));
            //                         } 
            //                    });
            //                    

        });
    </script>
     
    <style type="text/css">
        .style1
        {
            width: 197px;
            height: 52px;
        }
        .style2
        {
            width: 1075px;
            height: 318px;
        }
    </style>
     
</head>
<body>
    <form id="form1" runat="server">
    <div>
    
        <asp:FileUpload ID="FileUpload1" runat="server" Width="435px" 
            BorderStyle="Dotted" Height="30px" />
        <br />
        Excel文件 ： 把Excel表内的表名（即sheet1）改为“工序单价&quot;,来引导系统导入<br />
        导入过程程序会把导入的操作结果，反馈在本行的最右边单元格上。<br />
        如发现系统部份数据末导入成功，请分隔出来按实际情况再处理。<br />
        <br />
        导入程序规则：<br />
&nbsp;&nbsp; 0. 只允许在服务器上操作！！！！！初次导入&quot;耀&quot;来协助你.<br />
&nbsp;&nbsp; 1.已经存在计件系统的货品资料，不支持导入（即不覆盖，不更新。）&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 
        <br />
&nbsp;&nbsp; 2.数据要准确，部门代号要是正确的。<br />
&nbsp;&nbsp; 3.工序列表中间不能有隔空。如果存在隔空一个单元格系统，会取消本行的操作<br />
&nbsp;&nbsp; 4.特殊情况为输入方便，数据行&quot;对转个&quot;，与 &quot;是剪线&quot; 可以隔空，为空会当是 2 与 N<br />
&nbsp;&nbsp; 5.数据的表名必须为&quot;工序单价&quot; 如图<img alt="" class="style1" src="../捕获.PNG" /><br />
&nbsp;&nbsp;
        <br />
&nbsp;&nbsp; 6.导入前设置，标出最大行，标出最大列 （注意图中有 CellEnd 与 RowEnd 结果标记）<img alt="" 
            class="style2" longdesc="注意图中有 CellEnd 与 RowEnd 结果标记" src="../捕获2.PNG" /></div>
    <asp:Button ID="Button1" runat="server" Height="44px" onclick="Button1_Click" 
        Text="开始导入" Width="106px" />
    <asp:Label ID="Label1" runat="server" Text="结果："></asp:Label>
    </form>
</body>
</html>
