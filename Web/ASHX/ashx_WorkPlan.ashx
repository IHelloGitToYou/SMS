<%@ WebHandler Language="C#" Class="ashx_WorkPlan" %>

using System;
using System.Web;
using System.Text;
using SMS.Bus;
using System.Data;
using SMS.Bus.Common;
using System.Collections.Generic;
public class ashx_WorkPlan : IHttpHandler
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
        string NowUserId = Request["NowUserId"];
        if (string.IsNullOrEmpty(NowUserId))
        {
            Response.Write("{success:true,result:false,errmsg:'NowUserId参数末指定'}");
            Response.End();
        }

        action = action.ToUpper();
        Bus_WorkPlan Bus = new Bus_WorkPlan();

        if (action == "Save".ToUpper())
        {
            // public bool Save(Dictionary<string, string> Header, List<Dictionary<string, string>> Sizes, List<Dictionary<string, string>> DeptWps)
            Dictionary<string, string> PlanHeader = new Dictionary<string, string>();
            List<Dictionary<string, string>> Sizes = new List<Dictionary<string, string>>();
            List<Dictionary<string, string>> DeptWps = new List<Dictionary<string, string>>();

            int PlanId = int.Parse(Request["plan_id"]);
            PlanHeader["plan_id"] = PlanId.ToString();
            PlanHeader["cus_no"] = Request["cus_no"];
            PlanHeader["plan_no"] = Request["plan_no"];
            PlanHeader["prd_no"] = Request["prd_no"];
            PlanHeader["sizes_qty"] = Request["sizes_qty"].ToString();// ;
            PlanHeader["deliver_dd"] = DateTime.Parse(Request["deliver_dd"]).ToString();
            PlanHeader["deadline"] = DateTime.Parse(Request["deadline"]).ToString();
            PlanHeader["rem"] = Request["rem"];
            PlanHeader["n_man"] = NowUserId;
            PlanHeader["e_man"] = NowUserId;

            if (PlanId < 0 && Bus.ExsistPlanNo(PlanHeader["plan_no"]))
            {
                Response.Write("{success:true,result:false,msg:'计划单号已存在!'}");
                Response.End();
            }


            int SizeCount = int.Parse(Request["SizeCount"]);
            for (int i = 0; i < SizeCount; i++)
            {
                Dictionary<string, string> SizeItem = new Dictionary<string, string>();
                SizeItem["size_id"] = Request["size_id_b_" + i];
                SizeItem["plan_id"] = PlanId.ToString();
                SizeItem["plan_no"] = PlanHeader["plan_no"];
                SizeItem["itm"] = i.ToString();

                SizeItem["size"] = Request["size_b_" + i];
                if (string.IsNullOrEmpty(Request["color_id_b_" + i]))
                {
                    SizeItem["color_id"] = "-1";
                }
                else
                {
                    SizeItem["color_id"] = int.Parse(Request["color_id_b_" + i]).ToString();
                }

                SizeItem["qty"] = Request["qty_b_" + i];
                SizeItem["other1"] = Request["other1_b_" + i];
                SizeItem["other2"] = Request["other2_b_" + i];
                SizeItem["other3"] = Request["other3_b_" + i];
                SizeItem["other4"] = Request["other4_b_" + i];
                SizeItem["other5"] = Request["other5_b_" + i];

                Sizes.Add(SizeItem);
            }

            int DeptCount = int.Parse(Request["DeptCount"]);
            for (int i = 0; i < DeptCount; i++)
            {
                Dictionary<string, string> DeptItem = new Dictionary<string, string>();
                DeptItem["dept_id"] = Request["dept_id_c_" + i];
                DeptItem["plan_id"] = PlanId.ToString();
                DeptItem["wp_dep_no"] = Request["wp_dep_no_c_" + i];
                DeptItem["deliver_dd"] = DateTime.Parse(Request["deliver_dd_c_" + i]).ToString();
                DeptItem["deadline"] = DateTime.Parse(Request["deadline_c_" + i]).ToString();
                DeptItem["day_qty"] = int.Parse(Request["day_qty_c_" + i]).ToString();
                DeptItem["day_qty_ut"] = int.Parse(Request["day_qty_ut_c_" + i]).ToString();
                DeptItem["use_man"] = int.Parse(Request["use_man_c_" + i]).ToString();
                DeptItem["other1"] = Request["other1_c_" + i];
                DeptItem["other2"] = Request["other2_c_" + i];
                DeptItem["other3"] = Request["other3_c_" + i];
                DeptItem["other4"] = Request["other4_c_" + i];
                DeptItem["other5"] = Request["other5_c_" + i];

                DeptWps.Add(DeptItem);
            }

            bool isOk = false;
            string msgStr = "";

            try
            {
                isOk = Bus.Save(PlanHeader, Sizes, DeptWps, ref PlanId);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ", plan_id: " + PlanId.ToString() + ",msg:'" + msgStr + "'}");
            Response.End();
        }


        if (action == "LoadWorkPlan".ToUpper())
        {
            int planId = int.Parse(Request["plan_id"]);
            DataTable Header = Bus.LoadWorkPlanHeader(planId);
            DataTable Sizes = Bus.LoadPlan_Sizes(planId);
            DataTable Depts = Bus.LoadPlan_DeptWP(planId);

            StringBuilder strBuilder = new StringBuilder();
            strBuilder.AppendLine("{");
            strBuilder.AppendLine("header:" + JsonClass.DataTable2Json(Header));
            strBuilder.AppendLine(",sizes:" + JsonClass.DataTable2Json(Sizes));
            strBuilder.AppendLine(",depts:" + JsonClass.DataTable2Json(Depts));
            strBuilder.AppendLine("}");

            Response.Write(strBuilder.ToString());
            Response.End();
        }

        if (action == "SearchWorkPlan".ToUpper())
        {
            Dictionary<string, string> searchModel = new Dictionary<string, string>();

            searchModel["S_deliver_dd"] = Request["S_deliver_dd"];
            searchModel["E_deliver_dd"] = Request["E_deliver_dd"];
            searchModel["plan_no"] = Request["plan_no"];
            searchModel["prd_no"] = Request["prd_no"];
            searchModel["cus_no"] = Request["cus_no"];

            DataTable dt = Bus.SearchWorkPlan(searchModel);
            Response.Write(JsonClass.DataTable2Json(dt));
            Response.End();
        }


        if (action == "DeletePlan".ToUpper())
        {
            int plan_id = int.Parse(Request["plan_id"]);

            bool isOk = false;
            string msgStr = "";

            try
            {
                Bus.DeletePlan(plan_id);
                isOk = true;
            }
            catch (Exception ex)
            {
                msgStr = ex.Message;
            }

            Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "'}");
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


//id int identity(1,1) not null,
//cus_no varchar(40) not null,
//plan_no varchar(40) not null,
//prd_no varchar(40) not null,
//sizes_qty numeric(18,2) not null,
//deliver_dd datetime not null,
//deadline datetime not null,
//is_done varchar(5) DEFAULT 'false',
//rem  varchar(200) ,
//[n_man] [varchar](40) NULL,
//[n_dd] [datetime] NULL,
//[e_man] [varchar](40) NULL,
//[e_dd] [datetime] NULL,

