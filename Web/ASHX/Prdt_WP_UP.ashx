<%@ WebHandler Language="C#" Class="Prdt_WP_UP" %>

using System;
using System.Web;
using System.Data;
using System.Collections.Generic;
using System.Text;
using SMS.Model;
using SMS.Bus;
public class Prdt_WP_UP : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
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

        Bus_Prdt_WPUP bus = new Bus_Prdt_WPUP();
        //表头Model
        List<Model_Prdt_WP_HFUP> models = new List<Model_Prdt_WP_HFUP>();
        List<Model_Prdt_WP_HFUP> CheckModels = new List<Model_Prdt_WP_HFUP>();

        if (action == "SaveHFUp".ToUpper())
        {
            int i = 0,
                BodyCnt = int.Parse(Request["Cnt"]);

            for (; i < BodyCnt; ++i)
            {
                Model_Prdt_WP_HFUP m = new Model_Prdt_WP_HFUP();
                m.ActionType = Request["ActionType_" + i];
                if (m.ActionType == "-3" && m.up_no == -1)
                {
                    continue;
                }

                m.up_no = int.Parse(Request["up_no_" + i]);
                m.start_dd = DateTime.Parse(Request["start_dd_" + i]);
                m.end_dd = DateTime.Parse(Request["end_dd_" + i]);
                m.dep_no = Request["dep_no_" + i];
                m.cus_no = Request["cus_no_" + i];
                m.prd_no = Request["prd_no"];
                m.n_man = m.e_man = Request["n_man_" + i];
                if (string.IsNullOrEmpty(m.dep_no))
                {
                    m.dep_no = "000000";
                }

                if (m.ActionType != "-3")
                    CheckModels.Add(m);

                models.Add(m);
            }

            int CheckResult = bus.CheckHF(CheckModels);
            if (CheckResult < 0 && CheckResult == -1 )
            {
                Responser.Write( "同类单价之间的时间起止段，不能重叠");
                Responser.End();
            }

            bool isOk = false, isCatchErr = false;
            Exception e = new Exception();
            try
            {
                //更新货号的计件单单价..(结帐前)
                isOk = bus.SaveHF(models);

                Bus_WPQtyBySize busWPQty = new Bus_WPQtyBySize();
                List<string> allWps = new List<string>();
                List<string> errWps = new List<string>();
                busWPQty.UpdateWpPrice(Request["prd_no"], ref allWps, ref errWps);
                //Responser.Write("{success:true,result:" + isOk.ToString().ToLower()
                //    + ",isNew:" + isNew.ToString().ToLower()
                //    + ",msg:'', allWps:[" + SMS.Bus.Common.BusComm.ListToSqlWhereIn(allWps.ToArray()) + "]"
                //    + ",errWps:[" + SMS.Bus.Common.BusComm.ListToSqlWhereIn(errWps.ToArray()) + "]"
                //    + "}");
                //Responser.End();
            }
            catch( Exception ex)
            {
                isCatchErr = true;
                e = ex;
            }

            if (isCatchErr == true)
            {

                Responser.Write(e.Message);
            }
            else
            {
                Responser.Write(isOk.ToString().ToLower());
            }
            Responser.End();
        }

        if (action == "GetData".ToUpper())
        {
            string sqlWhere = string.IsNullOrEmpty(Request["sqlWhere"]) ? "" : Request["sqlWhere"];

            int start = Convert.ToInt32(Request["start"]);
            int total = bus.GetRecordCount(sqlWhere);
            int limit = Convert.ToInt32(Request["limit"]);
            DataTable dt = bus.GetData(sqlWhere);
            Responser.Write(JsonClass.DataTable2JsonWithPaging(dt, total));
            Responser.End();
        }

        if (action == "GetPrdtUpOnDate".ToUpper())
        {
            Bus_Prdt_WPUP busUP = new Bus_Prdt_WPUP();
            Bus_PrdtWpColor busUPColor = new Bus_PrdtWpColor();
            Bus_SizeControl busSizeControl = new Bus_SizeControl();

            string prd_no = Request["prd_no"];
            DateTime jx_dd = DateTime.Parse(Request["jx_dd"]);
            string user_dep_no= Request["user_dep_no"];
            string cus_no = Request["cus_no"];
            if (string.IsNullOrEmpty(cus_no))
            {
                if (string.IsNullOrEmpty(Request["plan_id"]))
                {
                    int plan_id = int.Parse(Request["plan_id"]);
                    Bus_WorkPlan busWorkPlan = new Bus_WorkPlan();
                    DataTable dt = busWorkPlan.LoadWorkPlanHeader(plan_id);
                    if(dt.Rows.Count <= 0)
                    {
                        Responser.Write("{success:true,result:false,msg:'所属计划单不存在!'}");
                        Responser.End();
                    }

                    cus_no = dt.Rows[0]["cus_no"].ToString();
                }
            }
            int up_no = busUP.GetValidUpNo(prd_no, jx_dd, user_dep_no, cus_no);
            if (up_no < 0)
            {
                Responser.Write("{success:true,result:false,msg:'没有有效单价!'}");
                Responser.End();
            }

            DataTable dtPrdtWp_UP = busUP.LoadWpUP(prd_no, up_no);
            DataTable dtColorUP = busUPColor.GetColorPrice(prd_no, up_no);
            DataTable dtPrdtWp_SizeControl = busSizeControl.GetPrdt_SizeControl(prd_no);
            StringBuilder strBuilder = new StringBuilder();
            strBuilder.AppendLine(" {   success:true, result:true, msg:'',");
            strBuilder.AppendLine("     PrdtWP_UP:" + JsonClass.DataTable2Json(dtPrdtWp_UP));
            strBuilder.AppendLine("     ,PrdtWP_COLOR_UP:" + JsonClass.DataTable2Json(dtColorUP));
            strBuilder.AppendLine("     ,PrdtWP_SIZE:" + JsonClass.DataTable2Json(dtPrdtWp_SizeControl));
            strBuilder.AppendLine(" } ");
            Responser.Write(strBuilder.ToString());
            Responser.End();
        }
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}