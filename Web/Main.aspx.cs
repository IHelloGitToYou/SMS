using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
//using System.Xml.Linq;
//using XBase.Common;

//using XBase.Business.TCRM;

public partial class Main : System.Web.UI.Page
{
    private string _nowUserId;
    private string _CompanyCD = "";
    private string _nowUserName = "";

    public string NowUserId
    {
        get { return _nowUserId; }
        set { _nowUserId = value; }
    }

    public string NowUserName
    {
        get { return _nowUserName; }
        set { _nowUserName = value; }
    }
    
    public string CompanyCD
    {
        set { _CompanyCD = value; }
        get { return _CompanyCD; }
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        string UserId = Request["user_no"];
        CompanyCD = "C1002";
        //NowUserId = "aman";// "yangyang";
        if (Session["user_no"] != null 　)
        {
            if (Session["user_no"] != null)
            {
                NowUserId = Session["user_no"].ToString();
                NowUserName = Session["user_name"].ToString();
            }
           　
            //XgLoger.NowUserId = "";
            //XgLoger.NowUserName = "";
            Session["user_no"] = null;
            Session["user_name"] = null;
        }
        else
        {
            //Response.Write("<script type=text/javascript>alert('请先登录！');</script>");
            Response.Redirect("Login.aspx", true);
            NowUserId = "";
            NowUserName = "违法用户";
        }


    }
}
