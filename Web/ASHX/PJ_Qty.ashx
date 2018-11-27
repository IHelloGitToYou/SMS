<%@ WebHandler Language="C#" Class="PJ_Qty" %>

using System;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using SMS.Bus;
using SMS.Bus.Common;
using System.Linq;


using SMS.Model;


public class PJ_Qty : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        var response = context.Response;
        var Request = context.Request;

        Bus_PJ_Qty bus = new Bus_PJ_Qty();
        string action = Request["action"];
        if (string.IsNullOrEmpty(action))
        {
            response.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            response.End();
        }

        action = action.ToUpper();
        if (action == "TableAdd".ToUpper() || action == "TableUpdate".ToUpper())
        {
            // 表头数据
            Model_PJQty_H Hmodel = new Model_PJQty_H();
            //pj_dd,pj_no,plan_id, plan_no,user_dep_no ,size_id ,size, wp_no,  n_man,n_dd,e_man,e_dd
            Hmodel.pj_dd = DateTime.Parse(Request["pj_dd"]);
            Hmodel.pj_no = Request["pj_no"];
            Hmodel.plan_id = int.Parse(Request["plan_id"]);
            Hmodel.plan_no = Request["plan_no"];
            Hmodel.user_dep_no = Request["user_dep_no"];
            Hmodel.wp_dep_no = Request["wp_dep_no"];


            Hmodel.prd_no = Request["prd_no"];
            Hmodel.sal_no = Request["sal_no"];
            Hmodel.e_man = Hmodel.n_man = Request["NowUserId"];
            Hmodel.e_dd = Hmodel.n_dd = DateTime.Now;

            int cnt = int.Parse(Request["body_cnt"]);

            for (int i = 0; i < cnt; ++i)
            {
                // pj_id,sort,itm,material_grade,worker,wp_qty_pair,wp_qty_pic, wl_qty,back_good_qty, back_broken_qty , std_price, std_unit_pre, std_qty
                // price, unit_pre ,qty,amt
                Model_PJQty_B M = new Model_PJQty_B();
                M.pj_no = Hmodel.pj_no;
                M.sort = i;
                M.itm = i;

                M.prd_no = Hmodel.prd_no;
                M.wp_no = Request["wp_no_" + i];
                M.worker = Request["worker_" + i];

                M.material_grade = Request["material_grade_" + i];
                M.wp_qty_pair = decimal.Parse(Request["wp_qty_pair_" + i]);
                M.wp_qty_pic = decimal.Parse(Request["wp_qty_pic_" + i]);
                M.wl_qty = decimal.Parse(Request["wl_qty_" + i]);
                M.back_good_qty = decimal.Parse(Request["back_good_qty_" + i]);
                M.back_broken_qty = decimal.Parse(Request["back_broken_qty_" + i]);
                M.std_price = decimal.Parse(Request["std_price_" + i]);
                M.std_unit_pre = decimal.Parse(Request["std_unit_pre_" + i]);
                M.std_qty = decimal.Parse(Request["std_qty_" + i]);
                M.price = decimal.Parse(Request["price_" + i]);
                M.unit_pre = decimal.Parse(Request["unit_pre_" + i]);
                M.qty = decimal.Parse(Request["qty_" + i]);
                M.amt = decimal.Parse(Request["amt_" + i]);

                M.size_id = int.Parse(Request["size_id_" + i]);
                M.size = Request["size_" + i];

                M.ajust_std_unit = decimal.Parse(Request["ajust_std_unit_" + i]);
                M.is_bad_wl = (Request["is_bad_wl_" + i].ToLower() == "true" ? true : false);

                Hmodel.Body.Add(M);


            }


            bool RunRes = false, getBug = false;
            string BugString = "";

            try
            {

                if (action == "TableUpdate".ToUpper())
                {
                    //检查不能改plan_id
                    ChangedPlanId(Hmodel.pj_no, Hmodel.plan_id);
                    IsPJOverFlow(Hmodel.pj_no, Hmodel);

                    RunRes = bus.TableUpdate(Hmodel);
                }
                else
                {
                    IsPJOverFlow("", Hmodel);
                    RunRes = bus.TableAdd(Hmodel);
                }
            }
            catch (Exception ex)
            {
                getBug = true;
                BugString = Microsoft.JScript.GlobalObject.escape(ex.Message);
            }

            if (getBug == true)
                response.Write("{success:true,result:false, err :true , errmsg:'" + BugString + "'}");
            else
                response.Write("{success:true,result:" + RunRes.ToString().ToLower() + ",msg:''}");

            response.End();
        }

        if (action == "TableDelete".ToUpper())
        {
            bool RunRes = false, getBug = false;
            string BugString = "";

            try
            {
                RunRes = bus.TableDelete(Request["pj_no"]);
            }
            catch (Exception ex)
            {
                getBug = true;
                BugString = ex.Message;
            }

            if (getBug == true)
                response.Write("{success:true,result:false, err :true , errmsg:'" + BugString + "'}");
            else
                response.Write("{success:true,result:" + RunRes.ToString().ToLower() + ",msg:''}");

            response.End();
        }


        if (action == "TableSearch".ToUpper())
        {
            string sqlWhere = Request["SearchConditions"];
            int total = bus.GetRecordCount(sqlWhere);
            DataTable dt = bus.GetListByPage(sqlWhere, "", -1, -1);

            response.Write(JsonClass.DataTable2JsonWithPaging(dt, total));
            response.End();
        }


        if (action == "FetchTableData".ToUpper())
        {
            List<DataTable> Tables = bus.GetTableData(Request["pj_no"]);
            response.Write(JsonClass.DataTable2Json(Tables[0], Tables[1]));
            response.End();
        }


        if (action == "GetDoneWPQty".ToUpper())
        {
            int plan_id = int.Parse(Request["plan_id"]);
            string wp_dep_no = Request["wp_dep_no"];
            string user_dep_no = Request["user_dep_no"];
            DateTime? wp_start_dd = null;
            DateTime? wp_end_dd = null; 

            if (!string.IsNullOrEmpty(Request["wp_start_dd"]))
                wp_start_dd = DateTime.Parse(Request["wp_start_dd"]);
            if (!string.IsNullOrEmpty(Request["wp_end_dd"]))
                wp_end_dd = DateTime.Parse(Request["wp_end_dd"]);

            DataTable dt = bus.GetDoneWPQty(plan_id, wp_dep_no, user_dep_no, wp_start_dd, wp_end_dd);
            response.Write(dt.ToDataTable2Json());
            response.End();
        }
    }

    /// <summary>
    /// 预防报多皮奖
    /// </summary>
    /// <param name="size_id"></param>
    /// <param name="prd_no"></param>
    /// <param name="wp_no"></param>
    public void IsPJOverFlow(string editingPjNo, Model_PJQty_H Hmodel)
    {
        DataTable dtCeil = (new Bus_PJ_Qty()).GetDoneWPQty(Hmodel.plan_id, "", "", null, null);
        foreach (Model_PJQty_B item in Hmodel.Body)
        {
            DataTable dt = (new Bus_PJ_Qty()).GetPJQty(item.size_id, editingPjNo);
            string prd_no = item.prd_no;
            string wp_no = item.wp_no;

            var r1 = dtCeil.Select("size_id = '" + item.size_id + "' and prd_no='" + prd_no + "' and wp_no='" + wp_no + "'");
            var r2 = dt.Select("size_id = '" + item.size_id + "' and prd_no='" + prd_no + "' and wp_no='" + wp_no + "'");

            if (r1.Length == 0)
            {
                throw new Exception("异常,计划单行次对应不上!");
            }

            decimal wpQty = r1.ToList().Sum(o => BusComm.GetDouble(o["done_pair"].ToString()));
            decimal lastPJQty = r2.ToList().Sum(o => BusComm.GetDouble(o["done_pair"].ToString()));

            decimal nowPJQty = Hmodel.Body.Where(o => o.prd_no == prd_no && o.wp_no == wp_no).Sum(o => o.wp_qty_pair);

            if (lastPJQty + nowPJQty > wpQty)
            {
                throw new Exception(r1[0]["wp_name"].ToString() + "皮奖的对数，已超过计件录入数据!(" + lastPJQty.ToString("0.0") + "+" + nowPJQty.ToString("0.0") + ")>" + wpQty.ToString("0.0") + "");
            }
        }

    }

    public void ChangedPlanId(string pj_no, int now_plan_id)
    {
        List<DataTable> Tables = (new Bus_PJ_Qty()).GetTableData(pj_no);
        if (Tables[0].Rows.Count == 0)
        {
            throw new Exception("单据被删除了" + pj_no);
        }
        int lastPlanId = Convert.ToInt32(BusComm.GetDouble(Tables[0].Rows[0]["plan_id"].ToString()));
        if (lastPlanId != now_plan_id)
        {
            throw new Exception("修改单据时,不能修改计划单号");
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