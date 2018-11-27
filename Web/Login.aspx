<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Login.aspx.cs" Inherits="Pages2_CRM_Login" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>永利华公司--人事工资管理系统　用户登录</title>
    <link href="Css2/Login.css" rel="stylesheet" type="text/css" />
    <META http-equiv=Content-Type content="text/html; charset=gb2312">
    <META content="MSHTML 6.00.6000.16674" name=GENERATOR>

</head>

<BODY id=userlogin_body>
<FORM id="FORM1" runat="server">
<div></div>

<div id='user_login'>
<DL>
  <dd id='user_top'>
  <ul>
    <li class='user_top_l'></li>
    <li class='user_top_c'></li>
    <li class='user_top_r'></li></ul>
  <dd id=user_main>
  <ul>
    <li class='user_main_l'></li>
    <li class='user_main_c'>
    <div class='user_main_box'>
    <ul>
      <li class='user_main_text'>用户名： </li>
      <li class='user_main_input'>
          <asp:TextBox class="TxtUserNameCssClass" id="TxtUserName"  runat="server" 
              maxLength="20" name="TxtUserName">
          </asp:TextBox>
      </li></ul>
    <ul>
      <li class='user_main_text'>密 码： </li>
      <li class='user_main_input'>
          <asp:TextBox  class="TxtPasswordCssClass" id="TxtPassword" runat="server" 
              name="TxtPassword" TextMode="Password"></asp:TextBox>
      
      </li></ul>
    <ul>
      <li class='user_main_text'> </li>
      <li class='user_main_input'>
          <asp:Label ID="Label1" runat="server" Text="" ForeColor="Red"></asp:Label>
       </li></ul></div></li>
    <li class='user_main_r'>
        <asp:Button ID="Button1" runat="server" Text="Button" class='IbtnEnterCssClass' name="IbtnEnter" 
        
            style="BORDER-TOP-WIDTH: 0px; BORDER-LEFT-WIDTH: 0px; BORDER-BOTTOM-WIDTH: 0px; BORDER-RIGHT-WIDTH: 0px;background : url(css2/Login/user_botton.gif)" 
            onclick="Button1_Click"/>

      </li></ul>
  <dd id="user_bottom">
  <ul>
    <li class='user_bottom_l'></li>
    <li class='user_bottom_c'><span style="MARGIN-TOP: 40px"> </li>
    <li class='user_bottom_r'></li></ul>
</dd></DL></div><span id='ValrUserName' 
style="DISPLAY: none; COLOR: red"></span><span id='ValrPassword'
style="DISPLAY: none; COLOR: red"></span><span id='ValrValidateCode' 
style="DISPLAY: none; COLOR: red"></span>
<div id=ValidationSummary1 style="DISPLAY: none; COLOR: red"></div>

<div></div>

</FORM></BODY>
</html>
