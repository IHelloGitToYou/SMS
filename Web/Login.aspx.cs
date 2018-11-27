using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
//using XBase.Business.TCRM;
using System.Data;
using System.Net;
using SMS.Bus;
using SMS.Model;

public partial class Pages2_CRM_Login : System.Web.UI.Page
{
    private bool isDebug = false;
    protected void Page_Load(object sender, EventArgs e)
    {
        //DoTest();

        TxtUserName.Focus();
        if (isDebug)
            IsDebugEnv();
    }

    private void DoTest()
    {
        //Model_AskPrice model_AskPrice = new Model_AskPrice();
        //var type = model_AskPrice.GetType();
        //var ps = type.GetProperties();
        //var p2 = type.GetMembers();
        //var p3 = type.GetMethods();
        //var p4 = type.GetFields();


        //var o = Activator.CreateInstance<Model_AskPrice>();
        //var pi1 = type.GetProperty("ask_id");
        //pi1.SetValue(o, 09, null);
        //var pi2 = type.GetProperty("check_man");
        //pi2.SetValue(o, "张杰", null);


        //System.Reflection.MethodInfo mInfo = type.GetMethod("showUMan");
        //var mResult = mInfo.Invoke(o, null);


    }


    public void IsDebugEnv() {
        TxtUserName.Text = "admin";
        TxtPassword.Text = "admin";
    }
    //Bus_CRMPeople bus = new Bus_CRMPeople();
   
    protected void Button1_Click(object sender, EventArgs e)
    {
        string LoginUserNo = TxtUserName.Text;
        string LoginUserPasswd = isDebug? "admin" : TxtPassword.Text;

        if (string.IsNullOrEmpty(LoginUserNo))
        {
            Label1.Text = "帐号不能为空！";
            return;
            //帐号不能为空

        }
        if (string.IsNullOrEmpty(LoginUserPasswd))
        {
            Label1.Text = "密码不能为空！";
            //密码不能为空
            return;
        }
        
        Bus_PswUserInfo busPsw = new Bus_PswUserInfo();
        string refLoginUserName = "";
        int checkRes = busPsw.CheckUser(LoginUserNo, LoginUserPasswd, ref refLoginUserName);
        if (checkRes > 0)
        {
            Label1.Text = "登录成功！";
            Session["user_no"] = LoginUserNo;
            Session["user_name"] = refLoginUserName;

            Response.Redirect("Main.aspx?dc="+DateTime.Now.Ticks, true);
            return;
        }
        else
        {
            switch(checkRes){
                case -1:
                    Label1.Text = "该账户不存在！";
                    break;
                case -2:
                    Label1.Text = "该账户停用了！";
                    break;
                case 0:
                    Label1.Text = "密码错误！";
                    break;
            }

            return;
        }
     
        //Label1.Text = "该账户不存在,或者密码错误！";
        //没有该帐号
         



        ////DataTable dt = bus.GetAllData(" user_no = '" + LoginUserName + "'");
        ////if (dt.Rows.Count <= 0)
        ////{
        ////    Label1.Text = "该账户不存在！";
        ////    //没有该帐号
        ////    return;
        ////}
        ////else if(dt.Rows.Count == 1 ) //&& dt.Rows[0]["psw"].ToString() == LoginUserPasswd)/// 
        ////{
        ////    Label1.Text = "登录成功！";
        ////    Session["user_no"] = dt.Rows[0]["user_no"].ToString();
        ////    Session["user_name"] = dt.Rows[0]["name"].ToString();
        ////    //Page.ClientScript.RegisterStartupScript(GetType(), "", "<script language=javascript>window.location.href='MainPage.aspx'</script>");
        ////    Response.Redirect("CrmMainPage.aspx", true);
        ////}
        ////else
        ////{
        ////    Label1.Text = "账户密码错误！";
        ////}
    }
}
