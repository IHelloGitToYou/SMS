<%@ WebHandler Language="C#" Class="ashx_SunEditor" %>

using System;
using System.Web;
using System.Data;
using SMS.Model;
using SMS.Bus;
using SMS.Bus.Common;


public class ashx_SunEditor : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        var Response = context.Response;
        var Request = context.Request;

        string action = Request["action"];
        if (string.IsNullOrEmpty(action))
        {
            Response.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            Response.End();
        }
        action = action.ToUpper();

        int page_index = 1;
        int limit = 10000;
        if(!string.IsNullOrEmpty(Request["page"])){
            page_index = Convert.ToInt32(Request["page"]);
        }

        if(!string.IsNullOrEmpty(Request["page"])){
            limit = Convert.ToInt32(Request["limit"]);
        }

        if (action == "GET_PRDT")
        {
            Bus_Prdt bus = new Bus_Prdt();
            bool isSunEditor = false;
            if (!string.IsNullOrEmpty(Request["isSunEditor"]))
                isSunEditor = bool.Parse(Request["isSunEditor"]);
            string sqlWhere = "1=1";

            if (!string.IsNullOrEmpty(Request["sqlWhere"]))
                sqlWhere += " and " + Request["sqlWhere"];

            if (isSunEditor == true)
                sqlWhere += " and " +  Request["prd_no"];
            else
                if (!string.IsNullOrEmpty(Request["prd_no"]))
                sqlWhere += " and " + string.Format(" prd_no like '%{0}%' or name like '%{0}%' or snm like '%{0}%' or spc like '%{0}%' ", Request["prd_no"]);

            DataTable dt = bus.GetListByPage(sqlWhere, "prd_no");
            DataTable PageDt = BusComm.paging(dt, limit, page_index);
            Response.Write(JsonClass.DataTable2JsonWithPaging(PageDt, dt.Rows.Count));
            Response.End();
        }

        if (action == "GET_Dept".ToUpper())
        {
            Bus_Dept bus = new Bus_Dept();
            string sqlWhere = "1=1";

            if (!string.IsNullOrEmpty(Request["dep_no"]))
                sqlWhere = string.Format(" dep_no like '%{0}%' or dep_name like '%{0}%' ", Request["prd_no"]);

            DataTable dt = bus.GetListByPage(sqlWhere, "dep_no");
            DataTable PageDt = BusComm.paging(dt, limit, page_index);
            Response.Write(JsonClass.DataTable2JsonWithPaging(PageDt, dt.Rows.Count));
            Response.End();
        }

        if (action == "GET_Salm".ToUpper())
        {
            Bus_Salm bus = new Bus_Salm();
            string sqlWhere = "1=1";

            if (!string.IsNullOrEmpty(Request["sal_no"]))
                sqlWhere = string.Format(" sal_no like '%{0}%' or sal_name like '%{0}%' ", Request["sal_no"]);

            DataTable dt = bus.GetListByPage(sqlWhere);
            DataTable PageDt = BusComm.paging(dt, limit, page_index);
            Response.Write(JsonClass.DataTable2JsonWithPaging(PageDt, dt.Rows.Count));
            Response.End();
        }

        if (action == "GET_SYSUser".ToUpper())
        {
            Bus_Salm bus = new Bus_Salm();

            DataTable dt = bus.GetSYSUser();
            Response.Write(JsonClass.DataTable2Json(dt));
            Response.End();
        }

        
        if (action == "GET_Cust".ToUpper())
        {
            Bus_Cust bus = new Bus_Cust();
            string sqlWhere = " 1=1 ";

            if(!string.IsNullOrEmpty(Request["sqlWhere"]))
                sqlWhere += " and " + Request["sqlWhere"];

            if (!string.IsNullOrEmpty(Request["cus_no"]))
                sqlWhere += string.Format(" and cus_no like '%{0}%' or cus_name like '%{0}%' ", Request["cus_no"]);

            DataTable dt = bus.GetListByPage(sqlWhere, "");
            DataTable PageDt = BusComm.paging(dt, limit, page_index);
            Response.Write(JsonClass.DataTable2JsonWithPaging(PageDt, dt.Rows.Count));
            Response.End();
        }

        if (action == "Load_Colors".ToUpper())
        {
            Bus_PrdtWpColor busColor = new Bus_PrdtWpColor();
            DataTable dt = busColor.GetAllColors();
            Response.Write(JsonClass.DataTable2JsonWithPaging(dt, dt.Rows.Count));
            Response.End();
        }

        Response.End();
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}