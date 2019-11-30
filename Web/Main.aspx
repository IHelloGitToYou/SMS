<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Main.aspx.cs" Inherits="Main" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>生产工资统计系统</title> 
    <style type="text/css">
        /*p {
            margin: 5px;
        }
        body {
            text-align: center;
        }*/
    </style>
    <script type="text/javascript">
        var NowUserId = "<%=NowUserId %>";
        var CompanyCDNO = "<%=CompanyCD %>";
        var NowUserName = "<%=NowUserName %>";
        //
        GlobalVar = { NowUserId: NowUserId };
    </script>
    <style type="text/css">
        .x-panel-body-default {
            font-size: 12px;
        }
        .x-grid-row.heightLine .x-grid-td {
            font-size: larger;
            background-color: Red;
        }
        .heightLine .x-grid-td {
            font-size: larger;
            background-color: Blue;
        }
        .x-menu-item {
            text-align: left;
        }

        .calendar {
            background-image:url(js/resources/MyIcon/calendar.gif) !important;
        }
        .冰封 {
            background-image:url(js/resources/MyIcon/icon_depart01.png) !important;
        }

        .msg .x-box-mc {
            font-size:14px;
        }
        #msg-div {
            position:absolute;
            left:50%;
            top:90px;
            width:400px;
            margin-left:-200px;
            z-index:20000;
        }
        #msg-div .msg {
            border-radius: 8px;
            -moz-border-radius: 8px;
            background: #F6F6F6;
            border: 2px solid #ccc;
            margin-top: 2px;
            padding: 10px 15px;
            color: #555;
        }
        #msg-div .msg h3 {
            margin: 0 0 8px;
            font-weight: bold;
            font-size: 15px;
        }
        #msg-div .msg p {
            margin: 0;
        }
    </style>
    <link href="JS/resources/css/ext-all.css" rel="stylesheet" />
    <script src="JS/ext-all.js" type="text/javascript"></script>
    <script src="JS/Setting/DataModel.js?version=9" type="text/javascript"></script>
    <script src="JS/SMSCommonJS.js?version=18" type="text/javascript"></script>
    <script src="JS/GlobalVar.js?version=9" type="text/javascript"></script>
    <script src="JS/新SunEditor.js?version=18" type="text/javascript"></script>
    <script src="JS/Setting/WpConfig.js?version=13" type="text/javascript"></script>
    <script src="JS/Setting/CheckFlowHelper.js"></script>
    <script type="text/javascript">
        //再设一次, 因为GlobalVar.js加载时用到
        GlobalVar.NowUserId = NowUserId;
        GlobalVar.NowUserName = NowUserName;
    </script>


    <script type="text/javascript">
        var TAB_ACTIVE_NOW;
        var TAB_ACTIVE_LAST;
        var openWindow;
        var tabPanel;
        var fnGetTabItem = function (itemId) {
            return tabPanel.getComponent(itemId);
        }

        ///审核任务窗体 , 显示审核列表的Store
        var win_CheckJob, CheckResult_Store;

        var fnRemoveOrderListener = function (itemId, monitor) {
            var item = tabPanel.getComponent(itemId);
            tabPanel.un("SendOrder", monitor);
        }
       
        //新的
        var fn_OpenWin = function (liObj, p_switchOldTable) {
            //打开单据，并把psw_model传入网页内
            var win = {};
            win.IsOldTable = p_switchOldTable;
            win.titleAlign = 'top';
            win.headerPosition = 'top';
            win.margins = 0;
            win.border = false;
            win.padding = 0;

            win.header = { html: '<div style="color:white;" >' + liObj.text + '</div>' };
            win.title2 = liObj.text;
            win.isWinMulti = (liObj.isWinMulti || false);
            win.randomId = '';
            var urlNotParams = (Ext.String.endsWith(liObj.url, 'htm') || Ext.String.endsWith(liObj.url, 'html') || Ext.String.endsWith(liObj.url, 'aspx')) ? true : false;
            var url = liObj.url;

            var urlDC = Math.ceil(Math.random() * 100).toString(); //更改网址不缓存JS与Html
            //每个页面都不缓存JS
            if (urlNotParams == true)
                url += '?version=' + urlDC;
            else
                url += '&version=' + urlDC;

            liObj.params = liObj.params || {};
            //if (win.isWinMulti === false) {
            liObj.itemId = win.itemId = liObj.menu_no;
            liObj.params.isWinMulti = false;

            //}
            //else {
            //    //生成随机ID号
            //    win.randomId = Math.ceil(Math.random() * 100).toString();
            //    liObj.itemId = win.itemId = liObj.menu_no + '_randomId_' + win.randomId;

            //    urlNotParams = (Ext.String.endsWith(url, 'htm') || Ext.String.endsWith(url, 'aspx')) ? true : false;
            //    if (urlNotParams == true)
            //        url += '?isWinMulti=true&randomId=' + win.randomId;
            //    else
            //        url += '&isWinMulti=true&randomId=' + win.randomId;

            //    liObj.params.isWinMulti = true;
            //    liObj.params.randomId = win.randomId;
            //}
            
            win.html = '<iframe id = \'' + liObj.itemId + '\' src="' + url + '" width="100%" height="100%" frameborder=0 ></iframe>';
            if (Ext.typeOf(liObj.closable) == 'undefined') {
                liObj.closable = true;
            }

            if (Ext.typeOf(liObj.resizable) == 'undefined')
                liObj.resizable = true;

            win.closable = liObj.closable;
            win.callback_rendered = false;
            liObj.params.need_assemble = true;
            win.tranParams = liObj.params;

            //  win.scrolls = {};   //保存窗体中各个Grid的滚动条的记录
            //  win.scrollNames = [];
            win.listeners = {
                //打开子页面时要告诉主页面Index.htm  必须吗？
                had_rendered: function (PageReceiver) {
                    win.callback_rendered = true;
                    win.PageReceiver = PageReceiver;
                    //迟0.1秒,才能打开其他窗体.,与传入参数
                    Ext.Function.defer(function () {
                        tabPanel.layoutingUI = false;
                        tabPanel.fireEvent('SendOrder', win.itemId, liObj.params);
                    }, 100);
                }
            }

            win.autoShow = true;
            win.collapsible = true;
            win.floatable = true;
            win.maximizable = liObj.maximizable;
            win.resizable = false;// liObj.resizable;
            win.hideTab = liObj.hideTab;
            win.reorderable = liObj.reorderable === false ? false : true;

            win.focusOnToFront = true;
            win.constrain = true;
            win.width = 800;
            win.height = 600;
            //win.closeAction = 'hide';
            var a = tabPanel.add(win);
            a.maximize(false);
            a.collapse = function (direction, animate) {
                a.hide(tabPanel);
            }
            a.on('beforeclose', function () {
                var p_item = tabPanel.getComponent(win.itemId);
                if (p_item && win.PageReceiver)
                    tabPanel.un("SendOrder", win.PageReceiver);

                tabBar.remove(a.Tab);
                tabPanel.remove(a, true);

                ///* 10-28新增 销毁页面editor的更新通知事件 */
                //var NowPageId = a.itemId;
                ////console.log({ NowPageId: NowPageId, lis: GlobalVar.CacheDataConnBridge[NowPageId] });
                //if (GlobalVar.CacheDataConnBridge && GlobalVar.CacheDataConnBridge[NowPageId] && GlobalVar.CacheDataConnBridge[NowPageId].listeners) {
                //    for (var i = 0; i < GlobalVar.CacheDataConnBridge[NowPageId].listeners.length; ++i) {
                //        GlobalVar.CacheDataConnBridge[NowPageId].listeners[i].destroy();
                //    }
                //    delete GlobalVar.CacheDataConnBridge[NowPageId].listeners;
                //}

                delete a.Tab;
                delete a;
            });

            a.on('letcloseme', function () {
                a.close();
            });
        } //End win.listeners {


        openWindow = function (liObj, switchOldTable) {
            if (!liObj || !liObj.url || liObj.url === '') 
                return false;

            var item = tabPanel.getComponent(liObj.menu_no);
            if (item) {
                tabBar.setActiveTab(item.Tab);
                tabPanel.fireEvent('SendOrder', liObj.menu_no, liObj.params);
                return false;
            }
            else {
                fn_OpenWin(liObj, switchOldTable);
                document.title = liObj.text;
            }
        } // var openWindow

        var SetFreezeDate = function(setDate){
            Ext.Ajax.request({
                url: 'ASHX/Common/SunGridHead.ashx',
                params:{
                    action : 'SetFreezeDate',
                    date:Ext.Date.format(setDate, 'Y/m/d') 
                },
                success: function (response, opts) {
                    GlobalVar.freeze_date = setDate;
                    alert('设置成功');
                },
                failure: function(response, opts) {
                    alert('设置失败');
                }
            });
        }

      
        //结账日期选择器
        var freezeDateMenu = Ext.create('Ext.menu.DatePicker', {
            //value: ,//Ext.Date.parse('2013/01/01', "Y/m/d"),   // || 
            handler: function (dp, date) {

                if (WpConfig.UserDefault[GlobalVar.NowUserId].root != '管理员') {
                    alert('你没有权限设置结账日期!');
                    return;
                }

                Ext.MessageBox.confirm('询问？','确定设置结账日期为' + Ext.Date.format(date, 'Y/m/d') + '吗?',
                    function (btn) {
                        if (btn == 'yes') {
                            SetFreezeDate(date);
                        }
                    }
                );
            }
        });

        Ext.Function.defer(function () {
            freezeDateMenu.picker.setValue(GlobalVar.freeze_date);
        }, 3000);
        

        var freezeDayMenu = Ext.create('Ext.menu.DatePicker', {
            handler: function (dp, date) {
                //alert(123); //Ext.Date.format(date, 'M j, Y')
            }
        });
       
        var menu1_Items = [
             { xtype: 'tbspacer', width: 122 },
             {
                 xtype: 'box',
                 autoEl: { tag: 'img', src: 'JS/resources/MyImages/永利华Logo.png' },
                 width: 150
             },
            { xtype: 'tbspacer', width: 10 }, '-',
             { xtype: 'button', text: '总控界面', height: 35, icon: 'Images/MyIcon/icon_desk.png', handler: function () { tabBar.setActiveTab(0); } }, '-', '-',
            {
                xtype: 'button',
                height: 35,
                text: '基本资料',
                icon: 'JS/resources/MyImages/基础资料.png',
                menu: new Ext.menu.Menu({
                    buttonAlign: 'start',
                    style: 'font-size:20px',
                    bodyStyle: 'font-size:20px',
                    items: [
                        //{ text: '自我学习', url: 'Sys/text.aspx', handler: function () { openWindow(this); } },
                        //{ text: '新下拉框', url: 'Temp/下拉选框.html', handler: function () { openWindow(this); } },
                        { text: '员工部门', url: 'Sys/Dept.html', menu_no: 'Dept', icon: 'JS/resources/MyImages/department.png', handler: function () { openWindow(this); } },
                        { text: '员工资料', url: 'Sys/Salm.html', menu_no: 'Salm', icon: 'JS/resources/MyImages/people.png', handler: function () { openWindow(this); } },
                        '-',
                        { text: '工序部门', url: 'Sys/DeptWp.html', menu_no: 'DeptWp', icon: 'JS/resources/MyImages/department.png', handler: function () { openWindow(this); } },
                        { text: '货品资料', url: 'Sys/Prdt.html', menu_no: 'Prdt', icon: 'JS/resources/MyImages/手套16.png', handler: function () { openWindow(this); } },
                        { text: '客户资料', url: 'Sys/Cust.html', menu_no: 'Cust', icon: 'JS/resources/MyIcon/icon_user.png', handler: function () { openWindow(this); } },
                        '-',
                        { text: '皮奖物料', url: 'Sys/Materimal/Materimal.html', menu_no: 'Material_Prdt', icon: 'JS/resources/MyImages/手套16.png', handler: function () { openWindow(this); } },
                    ]
                }),
                listeners: { click: function (m) { this.menu.expand(); } }
            },
            {
                xtype: 'button',
                text: '系统设置',
                icon: 'JS/resources/MyImages/Setting.png',
                height: 35,
                menu: new Ext.menu.Menu({
                    buttonAlign: 'start',
                    style: 'font-size:20px',
                    bodyStyle: 'font-size:20px',
                    items: [
                        {
                            text: '关账日期',
                            iconCls: 'calendar',
                            menu: freezeDateMenu 
                        },
                         {
                             
                             text: '冰封限制' + WpConfig.freezeDay + '天',
                             iconCls: '冰封',
                             disabled:true
                            // menu: freezeDayMenu
                         },
                        { text: '货品工序', url: 'Sys/Prdt_WP.html', menu_no: 'Prdt_WP', icon: 'JS/resources/MyImages/configuration_settings.png', handler: function () { openWindow(this); } }
                    ]
                }),
                listeners: { click: function (m) { this.menu.expand(); } }
            },
            {
                xtype: 'button',
                text: '工资录入',
                icon: 'JS/resources/MyImages/import_icon.png',
                height: 35,
                menu: new Ext.menu.Menu({
                    items: [
                        { text: '生产计划单', url: 'Sys/WorkPlan.html', menu_no: 'WorkPlan', handler: function () { openWindow(this); } },
                        { text: '计件录入', url: 'Sys/Import_WPQty.html?IsShareTable=false&Version=2', menu_no: 'WPQty', handler: function () { openWindow(this); } },
                        { text: '计件录入(分成)', url: 'Sys/Import_WPQty.html?IsShareTable=true&Version=2', menu_no: 'WPQty_Share', handler: function () { openWindow(this); } },
                        { text: '计件录入(丝印部专用)', url: 'Sys/Import_WPQtyOnShare.html', menu_no: 'WPQtyOnShare', handler: function () { openWindow(this); } },
                        //{ text: '计件录入(XXX皮奖)', url: 'Sys/Import_WPQtyOnMaterial.html', menu_no: 'WPQtyOnMaterial', handler: function () { openWindow(this); } },
                        '-',
                        { text: '计时录入', url: 'Sys/Import_JiTime.html', menu_no: 'Import_JiTime', handler: function () { openWindow(this); } },
                        { text: '皮奖录入', url: 'Sys/Import_PJ.html', menu_no: 'Import_PJ', handler: function () { openWindow(this); } },
                        '-',
                        {
                            text: '调价审核流程设置', handler: function () {
                                CheckFlowHelper.ShowFlowEditWindow('WQ_WPNO');
                            }
                        },
                        { text: '调价申请审核列表', url: 'Sys/Report_CheckFlow.html', menu_no: 'Report_CheckFlow', handler: function () { openWindow(this); } },
                    ]
                }), listeners: { click: function (m) { this.menu.expand(); } }
            },
            {
                xtype: 'button',
                text: '工资报表',
                icon: 'JS/resources/MyImages/Seo-Report-40.png',
                height: 35,
                menu: new Ext.menu.Menu({
                    items: [
                        { text: '每日产能工资', url: 'Sys/Report_每日产能工资.html', menu_no: 'Report_每日产能工资', handler: function () { openWindow(this); } },
                        { text: '工资分析', url: 'Sys/Report_工资分析.html', menu_no: 'Report_工资分析', handler: function () { openWindow(this); } },
                        { text: '每月明细表', url: 'Sys/Report_工资明细表.html', menu_no: 'Report_工资明细表', handler: function () { openWindow(this); } },
                        { text: '每月汇总表', url: 'Sys/Report_工资汇总表.html?version=1', menu_no: 'Report_工资汇总表', handler: function () { openWindow(this); } },
                        { text: '员工计时工资表', url: 'Sys/Report_计时.html', menu_no: 'Report_计时', handler: function () { openWindow(this); } }
                    ]
                }), listeners: { click: function (m) { this.menu.expand(); } }
            },
            {
                xtype: 'button',
                text: '异常检测',
                icon: 'JS/resources/MyImages/Seo-Report-40.png',
                height: 35,
                menu: new Ext.menu.Menu({
                    items: [
                        {
                            text: '检查超数', url: 'Sys/Report_检查超数.html', menu_no: 'Report_检查超数',
                            handler: function () { openWindow(this); }
                        }
                    ]
                }), listeners: { click: function (m) { this.menu.expand(); } }
            },
            '->',
            { icon: 'Images/MyIcon/icon_user.png', height: 35, text: '<%=NowUserName %>', tooltip: '更改密码' },
            {
                text: '安全退出', tooltip: '安全退出', icon: 'Images/MyIcon/icon_close.png ',
                height: 35,
                handler: function () {
                    Ext.MessageBox.confirm('询问', '确认登出吗?', function (btn) {
                        if (btn == 'yes') {
                            //window.open("Login.aspx", "_self");
                            window.close();
                        }
                    });
                }
            }];
            
            Ext.onReady(function () {

                Ext.QuickTips.init();

                Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

                var menu1 = Ext.create('Ext.toolbar.Toolbar', {
                    height: 50,
                    padding: 3,
                    //margins: 2,
                    region: 'north',
                    items: menu1_Items
                });
                //alert('2');
                //var tabBar = Ext.create('Ext.tab.Bar', {
                //    rotation: 0,
                //    listeners: {
                //        change: function (vtabBar, tab, card, eOpts) {
                //            document.title = tab.text + '_' + window.DBInfoName;
                //        }
                //    }
                //});

                tabBar = null;//me.tabBar
                ////////////////////////////////                
                tabPanel = Ext.create('Ext.panel.Panel', {
                    region: 'center', // a center region is ALWAYS required for border layout
                    deferredRender: false,
                    tabPosition: 'bottom',
                    id: 'tabPanel',
                    name: 'tabPanel',
                    style: 'margin:0px',
                    frame: true,
                    frameHeader: true,
                    activeTab: 0,
                    defaultType: 'window',
                    bodyStyle: {
                        background: '#b6b7b7',
                        padding: '0px'
                    },
                    layoutingUI: false,     //加载中标记,只能在False才能切换其他窗体
                    margins: '0 0 0 0',
                    border: false,
                    padding: 0,
                    defaults:{
                        border: false,
                        margins: 0,
                        padding:1
                    },
                    //bbar: tabBar,
                    //plugins: Ext.create('Ext.ux.TabReorderer'),
                    getTabBar: function () { return tabPanel.tabBar; }, //用于Tab拖拉插件
                    items: [],
                    listeners: {
                        boxready: function () {
                            var me = this;
                            me.tabBar = new Ext.tab.Bar(Ext.apply({
                                ui: me.ui,
                                dock: 'bottom',             //me.tabPosition,
                                orientation: 'horizontal',  //: 'vertical',
                                plain: me.plain,
                                cardLayout: me.layout,
                                tabPanel: null
                            }, me.tabBar));

                            me.insertDocked(0, me.tabBar);

                            tabBar = me.tabBar;
                        },
                        beforeadd: function () {
                            if (tabPanel.layoutingUI) {
                                alert('窗体还在努力加载中，请耐心等待');
                                return false;
                            }
                            tabPanel.layoutingUI = true;
                            return true;
                        },
                        add: function (vthis, NewComponent, index, eOpts) {
                            //迟5秒,以防打开窗体,有问题,就不能打开其他窗体..
                            Ext.Function.defer(function () {
                                tabPanel.layoutingUI = false;
                            }, 5000);

                            NewComponent.Tab = Ext.create('Ext.tab.Tab', {
                                itemId: NewComponent.itemId,
                                text: NewComponent.title2,
                                closable: NewComponent.closable,
                                reorderable: NewComponent.reorderable,
                                hidden: NewComponent.hideTab,
                                onCloseClick: function () {
                                    NewComponent.close();
                                }
                            });
                            NewComponent.TabId = NewComponent.Tab.getId();
                            tabBar.add(NewComponent.Tab);

                            Ext.Function.defer(function () {
                                tabBar.setActiveTab(NewComponent.Tab);

                                NewComponent.Tab.on('activate', function (vthis2, eOpts) {
                                    NewComponent.show(vthis);
                                });
                            }, 600);

                            NewComponent.on('focus', function (vthis3, event, eOpts) {
                                tabBar.setActiveTab(vthis3.Tab);
                            });
                        }
                    }
                });


                var menuArray = [];
                menuArray[0] = menu1;

                function showMenu(menu) {
                    var ln = menuArray.length;
                    for (var i = 0; i < ln; ++i) {
                        menuArray[i].setVisible(false);
                    }
                    menu.setVisible(true);
                }


                var viewport = Ext.create('Ext.Viewport', {
                    layout: 'border',
                    style: 'margin:0px',
                    items: [menu1, tabPanel]
                });


                tabPanel.addEvents('SendOrder');


                Ext.define('PSW_Model', {
                    extend: 'Ext.data.Model',
                    fields: [
                        { name: 'k1', type: 'string' },
                        { name: 'k2', type: 'string' },
                        { name: 'k3', type: 'string' },
                        { name: 'k4', type: 'string' },
                        { name: 'k5', type: 'string' },
                        { name: 'k6', type: 'string' },
                        { name: 'k7', type: 'string' },
                        { name: 'k8', type: 'string' },
                        { name: 'k9', type: 'string' },
                        { name: 'k10', type: 'string' },
                        { name: 'k11', type: 'string' },
                        { name: 'k12', type: 'string' }
                    ]
                });

                //switchIsOldTable 旧版不用检测 had_rendered
                tabPanel.openWindow = openWindow;

                var m1 = {text: '流程图', url: 'Sys/流程图.html', menu_no: '流程图', maximizable:false, closable:false, handler: function () { openWindow(this); } };
                openWindow(m1);
                //            tabPanel.getComponent('ModelPicId').removeAll(0);
                //            tabPanel.getComponent('ModelPicId').add();
            });

            //回车键问题
            Ext.EventManager.on(window, 'keydown', function (e, t) {
                if (t.tagName != 'TEXTAREA')
                    if (e.getKey() == e.BACKSPACE && (!/^input$/i.test(t.tagName) || t.disabled || t.readOnly)) {
                        e.stopEvent();
                    }
            });

            CheckFlowHelper.CreateRadio();

    </script>
</head>
<body>
    <form id="MainPageForm" runat="server">
        <div>
        </div>
    </form>
</body>
</html>



<%--            //////////////////////////////////应该无用代码
            var copySwitch = function (table_type) {
                switch (table_type.toString().toUpperCase()) {
                    case 'SO':
                        return M_A2_2;
                        break;
                    case 'PO':
                        return M_B2_3;
                        break;
                    case 'SA':
                        return M_A3_1;
                    case 'SB':
                        return M_A3_2;
                        break;
                    case 'PA':
                        return M_B3_1;
                        break;
                    case 'PB':
                        return M_B3_2;
                        break;
                    default:
                        return null;
                        break;
                }
            }

            var copyM = function (table_type) {
                var M_A2_2 = copySwitch(table_type);

                var obj = {};
                obj.text = M_A2_2.text;
                obj.menu_no = M_A2_2.menu_no;
                obj.url = M_A2_2.url;
                obj.handler = M_A2_2.handler;
                //订单上特有
                obj.os_id = M_A2_2.os_id;

                return obj;
            }--%>