<%@ WebHandler Language="C#" Class="JSQty" %>

using System;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using SMS.Bus;
using SMS.Model;


public class JSQty : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        var response = context.Response;
        var Request = context.Request;

        Bus_JSQty bus = new Bus_JSQty();
        string action = Request["action"];
        if (string.IsNullOrEmpty(action))
        {
            response.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            response.End();
        }
        Bus_Salm busSalm = new Bus_Salm();
        action = action.ToUpper();
        if (action == "TableAdd".ToUpper() || action == "TableUpdate".ToUpper()) // 
        {
            // 表头数据
            Model_JSQty_H Hmodel = new Model_JSQty_H();
            List<Model_JSQty_B> BModels = new List<Model_JSQty_B>();
            //计时单号	js_no	varchar(40)
            //计薪日期	js_dd	datetime
            //数据责任员	sal_no	varchar(40)
            //备注	rem	ntext
            //创建人员	n_man	varchar(40)
            //创建时间	n_dd	datetime
            //修改人员	e_man	varchar(40)
            //修改时间	e_dd	datetime

            Hmodel.js_no = Request["js_no"];
            Hmodel.js_dd = DateTime.Parse( Request["js_dd"]);
            Hmodel.sal_no = Request["sal_no"];
            Hmodel.rem = Request["rem"];

            Hmodel.n_man = Request["NowUserId"];
            Hmodel.n_man = Request["NowUserId"];
            Hmodel.n_dd = Hmodel.n_dd = DateTime.Now;

            int cnt = int.Parse(Request["body_cnt"]);
            for (int i = 0; i < cnt; ++i)
            {
                Model_JSQty_B M = new Model_JSQty_B();
                //计时单号	js_no	varchar(40)
                //项次	itm	int
                //员工代号	sal_no	varchar(40)
                //小时	qty	decimal(18, 4)
                //时薪	up	decimal(18, 4)
                //金额	amt	decimal(18, 4)
                //纳入附加	is_add	varchar(2)
                //工作内容	rem	varchar(800)
                M.js_no = Hmodel.js_no;
                M.itm = i;
                M.sal_no = Request["sal_no_" + i];

                M.qty = decimal.Parse( Request["qty_" + i]);
                M.up = decimal.Parse( Request["up_" + i]);
                M.amt = decimal.Parse( Request["amt_" + i]);
                bool isaddValue = bool.Parse(Request["is_add_" + i]);
                M.is_add = isaddValue == true ? "Y" : "N";
                M.rem = Request["rem_" + i];

                if (busSalm.Exists(M.sal_no) == false)
                {
                    response.Write("{success:true,result:false, err :true , errmsg:'员工代码不存在'}");
                    response.End();
                }
                BModels.Add(M);
            }


            bool RunRes = false, getBug = false;
            string BugString = "";

            try
            {
                if (action == "TableUpdate".ToUpper())
                    RunRes = bus.TableUpdate(Hmodel, BModels);
                else
                    RunRes = bus.TableAdd(Hmodel, BModels);
            }
            catch (Exception ex)
            {
                getBug = true;
                BugString = Microsoft.JScript.GlobalObject.escape( ex.Message);
            }

            if(getBug == true)
                response.Write("{success:true,result:false, err :true , errmsg:'" + BugString + "'}");
            else
                response.Write("{success:true,result:" + RunRes.ToString().ToLower() + ",msg:''}");

            response.End();
        }

        if (action == "TableDelete".ToUpper ())
        {
            bool RunRes = false, getBug = false;
            string BugString = "";

            try
            {
                RunRes = bus.TableDelete(Request["js_no"]);
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
            List<DataTable> Tables = bus.GetTableData(Request["so_no"]);

            response.Write(JsonClass.DataTable2Json(Tables[0], Tables[1]));
            response.End();
        }

    }



    public bool IsReusable {
        get {
            return false;
        }
    }

}