<%@ WebHandler Language="C#" Class="YG_DayMoney" %>

using System;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using SMS.DBHelper.Utility;
using SMS.Bus;

public class YG_DayMoney : IHttpHandler
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
        Bus_YGGZ bus = new Bus_YGGZ();

        int limit = int.Parse(Request["limit"]); // start?
        int page = int.Parse(Request["page"]);

        DateTime S_jx_dd = DateTime.Parse(Request["S_jx_dd"]).Date;
        DateTime E_jx_dd = DateTime.Parse(Request["E_jx_dd"]).Date;

        string worker_dep_no = Request["worker_dep_no"];
        string worker = Request["worker"];
        string plan_no = Request["plan_no"];
        string prd_no = Request["prd_no"];

        bool onlySum = false;
        bool needJSSum = false;
        bool onlyWPDetail = false;
        if (string.IsNullOrEmpty(Request["onlySum"]) == false)
        {
            onlySum = bool.Parse(Request["onlySum"].ToLower());
        }
        if (string.IsNullOrEmpty(Request["needJSSum"]) == false)
        {
            needJSSum = bool.Parse(Request["needJSSum"].ToLower());
        }
        if (string.IsNullOrEmpty(Request["onlyWPDetail"]) == false)
        {
            onlyWPDetail = bool.Parse(Request["onlyWPDetail"].ToLower());
        }

        if (action == "Search".ToUpper())
        {
            DataTable dt = bus.GetDayMoney_InH2(S_jx_dd, E_jx_dd, onlySum, worker_dep_no, worker, plan_no:plan_no, prd_no:prd_no);
            int total = dt.Rows.Count;

            DataTable Rdt = SunCommon_DataTablePaging.paging(dt, limit, page);
            response.Write(JsonClass.DataTable2JsonWithPaging(Rdt, total));
            response.End();
        }

        if (action == "SearcInSumView".ToUpper())
        {
            //GetSumDayMoney_InH2
            DataTable dt = bus.GetNewAnanlyz (S_jx_dd, E_jx_dd, worker_dep_no, worker);
            int total = dt.Rows.Count;

            DataTable Rdt = SunCommon_DataTablePaging.paging(dt, limit, page);
            response.Write(JsonClass.DataTable2JsonWithPaging(Rdt, total));
            response.End();
        }


        if (action == "DateRangeView".ToUpper())
        {
            DataTable dt = bus.GetDateRangeView(S_jx_dd, E_jx_dd,
                                onlySum, worker_dep_no, worker,
                                plan_no: plan_no, prd_no: prd_no,
                                needJSSum: needJSSum, onlyWPDetail: onlyWPDetail);

            int total = dt.Rows.Count;

            DataTable Rdt = SunCommon_DataTablePaging.paging(dt, limit, page);
            response.Write(JsonClass.DataTable2JsonWithPaging(Rdt, total));
            response.End();
        }

        if (action == "DateRangeCompressView".ToUpper())
        {
            bool onlySheBaoA = false;
            if (!string.IsNullOrEmpty(Request["onlySheBao"]))
            {
                onlySheBaoA = Request["onlySheBao"].ToLower() == "true" ;
            }
            //bool compress = bool.Parse(Request["compress"].ToLower());
            DataTable dt = bus.GetDateRangeCompressView(S_jx_dd, E_jx_dd, onlySum,
                worker_dep_no, worker, plan_no: plan_no,
                prd_no: prd_no, onlySheBao: onlySheBaoA
                );
            int total = dt.Rows.Count;

            DataTable Rdt = SunCommon_DataTablePaging.paging(dt, limit, page);
            response.Write(JsonClass.DataTable2JsonWithPaging(Rdt, total));
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