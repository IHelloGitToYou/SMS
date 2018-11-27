<%@ WebHandler Language="C#" Class="ashx_PrdtWpColor" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Data;
using SMS.Bus;
using System.Data;

public class ashx_PrdtWpColor : IHttpHandler
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
        Bus_PrdtWpColor bus = new Bus_PrdtWpColor();
        int page_index = 1;
        int limit = 10000;
        if (!string.IsNullOrEmpty(Request["page"]))
        {
            page_index = Convert.ToInt32(Request["page"]);
        }

        if (!string.IsNullOrEmpty(Request["page"]))
        {
            limit = Convert.ToInt32(Request["limit"]);
        }

        string prd_no = Request["prd_no"];
        string wp_no = Request["wp_no"];
        if (action == "LoadColorPrice".ToUpper())
        {
            int up_no = int.Parse(Request["up_no"]);

            DataTable dt = bus.GetColorPrice(prd_no, wp_no, up_no);
            Response.Write(JsonClass.DataTable2Json(dt));
            Response.End();
        }

        if (action == "SaveColorPrice".ToUpper())
        {
            int up_no = int.Parse(Request["up_no"]);

            List<Dictionary<string, string>> list = new List<Dictionary<string, string>>();
            int bodyCnt = int.Parse(Request["bodyCnt"]);
            for (int i = 0; i < bodyCnt; i++)
            {
                Dictionary<string, string> row = new Dictionary<string, string>();
                //except_id, up_no, prd_no, wp_no, up_pic, up_pair, color_id
                row["except_id"] = int.Parse(Request["except_id_" + i]).ToString();
                row["up_pic"] = double.Parse(Request["up_pic_" + i]).ToString();
                row["up_pair"] = double.Parse(Request["up_pair_" + i]).ToString();
                row["color_id"] = int.Parse(Request["color_id_" + i]).ToString();
                row["sign_in_jx_nos"] = Request["sign_in_jx_nos_" + i].ToString().Trim().Replace(" ", "");

                list.Add(row);
            }

            bool isOK = bus.Save(prd_no, wp_no, up_no, list);
            if (isOK == false)
            {
                Response.Write("{success:true,result:false,msg:''}");
                Response.End();
            }
            else
            {
                Response.Write("{success:true,result:true,msg:''}");
                Response.End();
            }
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