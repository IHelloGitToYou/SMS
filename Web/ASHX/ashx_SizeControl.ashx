<%@ WebHandler Language="C#" Class="ashx_SizeControl" %>

using System;
using System.Web;
using System.Data;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SMS.Bus;

public class ashx_SizeControl : IHttpHandler {

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        var Responser = context.Response;
        var Request = context.Request;


        string action = Request["action"];
        if (string.IsNullOrEmpty(action))
        {
            Responser.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            Responser.End();
        }
        //　大写
        action = action.ToUpper();

        Bus_SizeControl bus = new Bus_SizeControl();

        if (action == "GetSizes".ToUpper())
        {
            DataTable dt = bus.GetSizes();
            Responser.Write(JsonClass.DataTable2JsonWithPaging(dt, dt.Rows.Count));
            Responser.End();
        }
        string prd_no = Request["prd_no"];
        string wp_no = Request["wp_no"];
        if (action == "GetPrdt_SizeControl".ToUpper())
        {
            DataTable dt = bus.GetPrdt_SizeControl(prd_no);
            Responser.Write(JsonClass.DataTable2Json(dt));
            Responser.End();
        }

        if (action == "GetPrdtWP_SizeControl".ToUpper())
        {
            List<string> sels = bus.GetPrdtWP_SizeControl(prd_no, wp_no);
            Responser.Write(string.Join(",", sels));
            Responser.End();
        }

        if (action == "SetPrdtWP_SizeControl".ToUpper())
        {
            string sizes = Request["sizes"];
            List<string> arr = new List<string>();
            if (!string.IsNullOrEmpty(sizes))
            {
                arr = sizes.Split(new char[] { ',' }).ToList<string>();
            }

            bool isOk = true;
            string msgStr = "";
            try
            {
                bus.SetPrdtWP_SizeControl(prd_no, wp_no, arr);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + Microsoft.JScript.GlobalObject.escape(msgStr) + "'}");
            Responser.End();
        }
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}