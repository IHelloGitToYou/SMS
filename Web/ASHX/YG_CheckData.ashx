<%@ WebHandler Language="C#" Class="YG_CheckData" %>

using System;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using SMS.DBHelper.Utility;
using SMS.Bus;

public class YG_CheckData : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        var response = context.Response;
        var Request = context.Request;
        response.ContentType = "text/plain";
        string action = Request["action"];
        //Random rd = new Random();

        if (string.IsNullOrEmpty(action))
        {
            response.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            response.End();
        }
        action = action.ToUpper();


        DateTime S_deliver_dd = DateTime.Parse(Request["S_deliver_dd"]).Date;
        DateTime E_deliver_dd = DateTime.Parse(Request["E_deliver_dd"]).Date;

        string plan_no = Request["plan_no"];
        string wp_dep_no = Request["wp_dep_no"];

        if (action == "DoCheck".ToUpper())
        {
            DataTable dt = Bus_CheckData.GetDayMoney_InH2(S_deliver_dd, E_deliver_dd, plan_no, wp_dep_no);
            response.Write(JsonClass.DataTable2Json(dt));
            response.End();
        }

    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }


}