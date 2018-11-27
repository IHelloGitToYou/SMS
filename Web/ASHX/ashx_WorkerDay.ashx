<%@ WebHandler Language="C#" Class="ashx_WorkerDay" %>
using System;
using System.Web;
using System.Collections.Generic;
using SMS.Bus;

public class ashx_WorkerDay : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
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

        if (action == "SaveExp".ToUpper())
        {
            Bus_WorkerDay bus = new Bus_WorkerDay();

            int wd_id = int.Parse(Request["wd_id"]);
            Dictionary<string, string> dayExp = new Dictionary<string, string>();
            dayExp["wd_id"] = wd_id.ToString();
            dayExp["work_date"] = DateTime.Parse(Request["work_date"]).ToShortDateString();
            dayExp["worker"] = Request["worker"];
            dayExp["day_qty"] = double.Parse(Request["day_qty"]).ToString();

            bool isOk = true;
            string errMsg = "";
            try
            {
                if (wd_id < 0)
                {
                    bus.InsertExp(dayExp);
                }
                else
                {
                    bus.ModifyExp(dayExp);
                }
            }
            catch (Exception ex)
            {
                errMsg = ex.Message.ToString();
            }
            Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + errMsg + "'}");
            Response.End();
        }

        if (action == "GetMonthData".ToUpper())
        {
            DateTime S_jx_dd = DateTime.Parse(Request["S_jx_dd"]).Date;
            DateTime E_jx_dd = DateTime.Parse(Request["E_jx_dd"]).Date;

            string user_dep_no = Request["user_dep_no"];
            string worker = Request["worker"];
            Bus_WorkerDay bus = new Bus_WorkerDay();
            var monthDay = bus.MonthData(S_jx_dd, E_jx_dd, user_dep_no, worker);

            Response.Write("{");
            Response.Write("calendar:" + JsonClass.DataTable2Json(monthDay[0]));
            Response.Write(",calendar_exp:" + JsonClass.DataTable2Json(monthDay[1]));
            Response.Write("}");
            Response.End();
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