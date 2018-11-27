<%@ WebHandler Language="C#" Class="CheckHelper" %>

using System;
using System.Web;
using SMS.Bus;
using SMS.Model;
using System.Linq;
using System.Data;
using System.Collections.Generic;
public class CheckHelper : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        var Response = context.Response;
        var Request = context.Request;
        // ashx_WPQtyEdit s = new ashx_WPQtyEdit();
        string action = Request["action"];
        if (string.IsNullOrEmpty(action))
        {
            Response.Write("{success:true,result:false,msg:'action参数末指定'}");
            Response.End();
        }
        if (string.IsNullOrEmpty(Request["NowUserId"]))
        {
            Response.Write("{success:true,result:false,msg:'NowUserId参数末指定'}");
            Response.End();
        }
        string NowUserId = Request["NowUserId"];
        action = action.ToUpper();


        if (action == "GetFlow".ToUpper())
        {
            string check_no = Request["check_no"];

            var dt = Bus_CheckHelper.GetFlow(check_no);
            Response.Write(JsonClass.DataTable2Json(dt));
            Response.End();
        }

        if (action == "ResetFlow".ToUpper())
        {
            string check_no = Request["check_no"];
            string mans = Request["check_man"];
            List<string> checkManList = mans.Split(',').ToList();

            bool result = false;
            string msg = "";
            try
            {
                Bus_CheckHelper.ResetFlow(check_no, checkManList);
                result = true;
            }
            catch(Exception ex)
            {
                msg = ex.Message;
            }
            Response.Write(GenerateResponseJson(result, msg));
            Response.End();
        }

        //Ask
        if (action == "ASK")
        {
            bool result = false;
            string msg = "";
            try
            {
                DoTakeAsk();
                result = true;
            }
            catch (Exception ex)
            {
                msg = ex.Message.ToString();
            }

            Response.Write("{sucess:true, result:" + result.ToString().ToLower() + ", msg:'" + msg + "'}");
            Response.End();
        }


        if (action.StartsWith("GetAsk".ToUpper()))
        {
            string jx_no = Request["jx_no"];
            string check_man = Request["check_man"];
            string check_state = Request["check_state"];
            bool only_working = Request["only_working"] == "T";
            string sqlWhere = " 1 = 1 ";
            if (action == "GetAskByJX".ToUpper())
            {
                sqlWhere += " and jx_no = '" + jx_no + "'";
            }
            else if (action == "GetAskByCheckMan".ToUpper())
            {
                sqlWhere += " and check_man = '" + check_man + "' ";
            }
            if (only_working == true)
            {
                sqlWhere += " and check_state = '0' ";
            }

            if (string.IsNullOrEmpty(check_state) == false)
            {
                sqlWhere += " and check_state = '" + check_state + "' ";
            }

            var dt = Bus_CheckHelper.GetAsk(sqlWhere);
            Response.Write(JsonClass.DataTable2Json(dt));
            Response.End();
            //GetAskByJX  jx_no
            //GetAskByCheckMan check_man
            //GetAskAll 
        }

        if (action == "RunCheck".ToUpper())
        {
            int ask_id = int.Parse(Request["ask_id"]);
            int check_itm = int.Parse(Request["check_itm"]);
            string check_man = Request["check_man"];
            string check_msg = Request["check_msg"];
            bool check_result = Request["check_result"].ToUpper() == "T";
            var checkRow = Bus_CheckHelper.GetAskById(ask_id);
            if (checkRow == null)
            {
                Response.Write(GenerateResponseJson(false, " 审核Id行不存在!"));
                Response.End();
            }

            var dtFlow = Bus_CheckHelper.GetFlow(checkRow["check_no"].ToString());
            bool isEndFlowPoint = false;
            var focus = dtFlow.AsEnumerable()
                    .Where(o => o["check_itm"].ToString() == check_itm.ToString())
                    .FirstOrDefault();
            int focusIndex = dtFlow.Rows.IndexOf(focus);
            isEndFlowPoint = focusIndex == dtFlow.Rows.Count - 1;

            check_msg = checkRow["check_msg"].ToString() + GetSortDateString() + check_man + ":" + check_msg + ";";
            int check_state = 0;
            //同意
            if (check_result)
            {
                if (isEndFlowPoint)
                {
                    check_state = 1;
                    check_man = "";
                }
                else
                {
                    ++check_itm;
                    check_man = dtFlow.Rows[focusIndex + 1]["check_man"].ToString();
                }
            }
            else
            {
                //不同意
                check_state = 2;
                check_itm = 0;
                check_man = "";
            }

            Model_AskPrice model = new Model_AskPrice();
            model.ask_id = ask_id;
            model.check_state = check_state.ToString();
            model.check_man = check_man;
            model.check_itm = check_itm;
            model.check_msg = check_msg;

            bool result = false;
            try
            {
                Bus_CheckHelper.UpdateAskOnRunCheck(model);
                //终审通过了,更新单价
                if(check_state == 1)
                {
                    Bus_CheckHelper.SetPriceByPassAskPrice(ask_id);
                }
                result = true;
            }
            catch
            {

            }

            Response.Write(GenerateResponseJson(result, result ? "审核成功!" : "审核失败!"));
            Response.End();
        }

        //'RunCheck',
        //ask_id: ask_id,
        //check_itm: check_itm,
        //check_man: check_man,

        //Response.Write(JsonClass.DataTable2Json(dt));
    }

    private string GetSortDateString()
    {
        return DateTime.Now.ToString("M-d H:m");
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
    public string GenerateResponseJson(bool result, string msg)
    {
        return "{sucess:true, result:" + result.ToString().ToLower() + ", msg:'" + msg + "'}";
    }

    private void DoTakeAsk()
    {
        HttpContext context = HttpContext.Current;

        Model_AskPrice model = new Model_AskPrice();
        int ask_id = int.Parse(context.Request["ask_id"]);
        model.n_man = context.Request["NowUserId"];
        model.n_dd = DateTime.Now;

        model.check_no = context.Request["check_no"];
        model.jx_no = context.Request["jx_no"];
        model.prd_no = context.Request["prd_no"];
        model.wp_no = context.Request["wp_no"];
        model.ask_reason = context.Request["ask_reason"];
        model.up_pic = decimal.Parse(context.Request["up_pic"]);
        model.up_pair = decimal.Parse(context.Request["up_pair"]);
        model.ask_up_pic = decimal.Parse(context.Request["ask_up_pic"]);
        model.ask_up_pair = decimal.Parse(context.Request["ask_up_pair"]);

        Bus_CheckHelper.InsertAsk(model);
    }
}
 