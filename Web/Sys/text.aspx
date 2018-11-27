<%@ Page Language="C#" AutoEventWireup="true" CodeFile="text.aspx.cs" Inherits="Sys_text" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>abc</title>   
    <script type="text/javascript">
  
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


    <script src="../JS/Setting/MF_SOSetting.js" type="text/javascript"></script>
    <script src="../JS/SMSCommonJS.js?version=20" type="text/javascript"></script>
    <script src="../JS/SunEditor.js" type="text/javascript"></script>
   
    <script type="text/javascript">
    //javascipt // json
        Ext.Loader.setConfig({
            enabled: true
        });
       // Ext.Loader.setPath('Ext.ux', '../JS/ux');
        Ext.require([
            '*'
           
        ]);
        
        Ext.QuickTips.init();

        Ext.onReady(function () {
            var HeadPanel = Ext.create('Ext.form.Panel', {
                renderTo: Ext.getBody(),
                region: 'north',
                layout: {
                    type: 'table',
                    columns: 3
                },
                url: '../ASHX/Wp_Qty.ashx',
                defaults: {
                    width: 250,
                    labelWidth: 100,
                    xtype: 'textfield',
                    margin: '2 0 2 5'
                },
                items: [{
                    fieldLabel: '订单代号*',
                    name: 'so_no',
                    itemId: 'so_no',
                    allowBlank: false,
                    xtype: 'SunEditor_MF_SO',
                    listeners: {
                        change: function (vthis, newValue, oldValue, eOpts) {
                        }
                    }
                }, {
                    xtype: 'button',
                    text: 'Click me',
                    
                    handler: function () {
                        alert(HeadPanel.getComponent('so_no').getRawValue());
                    }
                }
                
            ]
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
