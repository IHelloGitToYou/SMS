<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ExtJS.aspx.cs" Inherits="Sys_ExtJS" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>员工工资明细表</title>
    <script type="text/javascript">
    
        var viewport;
        var Grid;
        var FormPanel;

        var sPanel, cPanel, nPanel;

        var PAGE_Locaction = "Sys/Page_YGGZReport.aspx";
        var PageClose;
            
    </script>
    <%--<link href="../JS/resources/ext-theme-neptune/ext-theme-neptune-all-debug.css" rel="stylesheet"
        type="text/css" />--%>
    <link href="../JS/resources/css/ext-all.css" rel="stylesheet" type="text/css" />
    <link href="../JS/ux/grid/css/MultiGrouping.css" rel="stylesheet" type="text/css" />
    <style type="text/css">
        .disabledRow .x-grid-cell
        {
            background-color: Gray;
            color: White;
        }
        .child-row .x-grid-cell
        {
            background-color: #ffe2e2;
            color: #900;
        }
        
        .adult-row .x-grid-cell
        {
            background-color: #e2ffe2;
            color: #090;
        }
    </style>
    <script src="../JS/ext-all.js" type="text/javascript"></script>
    <script src="../JS/SMSCommonJS.js?version=20" type="text/javascript"></script>
    <script src="../JS/commonJSFn.js?version=18" type="text/javascript"></script>
    <script src="../JS/SunGridHeadYAOSELF.js?version=2" type="text/javascript"></script>
    <script src="../JS/Setting/Cust_Setting.js" type="text/javascript"></script>
    <script src="../JS/Setting/Prdt_Setting.js" type="text/javascript"></script>
    <script src="../JS/Setting/Salm_Setting.js" type="text/javascript"></script>
    <script src="../JS/Setting/SearchSySBox.js" type="text/javascript"></script>
    <script src="../JS/ux/grid/feature/MultiGrouping.js" type="text/javascript"></script>
    <script src="../JS/ux/grid/feature/MultiGroupingSummaryMy.js" type="text/javascript"></script>
    <link href="../JS/ux/grid/css/MultiGrouping.css" rel="stylesheet" type="text/css" />
    <script language="javascript">

        Ext.onReady(function () {
            var YGGZ_Set = {};
            YGGZ_Set.Model = Ext.define('YGGZ_Model', {
                extend: 'Ext.data.Model',
                fields: [
                    { name: 'jx_no', type: 'string' },
                    { name: 'jx_dd', type: 'date' },
                    { name: 'sal_no', type: 'string' },
                    { name: 'sal_name', type: 'string' },
                    { name: 'dep_no', type: 'string' },
                    { name: 'dep_name', type: 'string' },

                    { name: 'so_no', type: 'string' },
                    { name: 'so_itm', type: 'string' },
                    { name: 'prd_no', type: 'string' },
                    { name: 'prd_name', type: 'string' },
                    { name: 'wp_no', type: 'string' },
                    { name: 'wp_name', type: 'string' },
                    { name: 'qty', type: 'string' },
                    { name: 'up_pair', type: 'number' },
                    { name: 'up_pic', type: 'number' },
                    { name: 'up_pair_list', type: 'string' },
                    { name: 'amt', type: 'number' }
                ]
            });

            // Store          
            YGGZ_Set.GetStore = function () {
                return Ext.create('Ext.data.Store', {
                    model: YGGZ_Set.Model,
                    autoLoad: false,
//                    groupField: ['dep_no,sal_no'],

//                    sorters: [
//                    {
//                        property: 'jx_dd',
//                        direction: 'ASC'
//                    }
//                    ],
                    proxy: {
                        type: 'ajax',
                        url: '../ASHX/YGGZ.ashx',
                        reader: {
                            type: 'json'
                            //                root: 'items',
                            //                totalProperty: 'total'
                        }
                    }
                })
            };

            var GridStore = YGGZ_Set.GetStore();

            //GridStore.load({ params :{ action: 'GetData' ,sqlWhere :' 1= 1' , GetType : 'A'}   });

            var cPanel = Ext.create('Ext.grid.Panel', {
                height: 400,

                renderTo: Ext.getBody(),
                store: GridStore,

                features: [{
                    //groupHeaderTpl: 'Subject: {name}',

                    //ftype: 'groupingsummary'
                    ftype: 'multigroupingsummarymy'
                }],
                columns: [
                    { header: '计薪日期', name: 'jx_dd', dataIndex: 'jx_dd', xtype: 'datecolumn', format: 'Y-m-d' },
                    { header: '数据来源单', name: 'jx_no', dataIndex: 'jx_no' },
                    { header: '员工号', name: 'sal_no', dataIndex: 'sal_no', hidden: true },
                    { header: '员工', name: 'sal_name', dataIndex: 'sal_name' },

                    { header: '部门号', name: 'dep_no', dataIndex: 'dep_no', hidden: true },
                    { header: '部门', name: 'dep_name', dataIndex: 'dep_name' },


                    { header: '数量', name: 'qty', dataIndex: 'qty', renderer: function (v, m, rec) { return v + '对' } },
                    { header: '单价', name: 'up_pair', dataIndex: 'up_pair', renderer: function (v, m, rec) { return v + '元 对' } },
                    { header: '单价(个)', name: 'up_pic', dataIndex: 'up_pic', renderer: function (v, m, rec) { return v + '元' }, hidden: true },
                    { header: '单价组成', name: 'up_pair_list', dataIndex: 'up_pair_list', hidden: true },
                    { header: '金额', name: 'amt', dataIndex: 'amt', renderer: function (v, m, rec) { return v + '元' },
                        summaryType: 'sum',
                        summaryRenderer: function (value) {
                            return '小计' + Common_fixAmount2(value) + '&nbsp元';
                        }
                    }
                ],
                listeners: {
                    afterrender: function () {
                        GridStore.load({
                            params: { action: 'GetData', sqlWhere: ' 1= 1', GetType: 'A' },
                            callback: function () {
                                alert('A');
                                GridStore.group(['dep_no','sal_no']);
                                alert('A 22');
                            }
                        });


                    }
                }
            });


        });

    
    </script>
</head>
<body>
    <form id="form1" runat="server">
    <div>
    </div>
    </form>
</body>
</html>
