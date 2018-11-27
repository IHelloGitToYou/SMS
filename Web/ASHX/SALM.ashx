<%@ WebHandler Language="C#" Class="SALM" %>

using System;
using System.Web;
using System.Data;
using System.Collections;
using System.Collections.Generic;
using SMS.Model;
using SMS.Bus;
using SMS.Bus.Common;

public class SALM : IHttpHandler {

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


        Bus_Salm bus = new Bus_Salm();
        Model_Salm model = new Model_Salm();

        if (action == "UPDATE" || action == "NEW")
        {
            model.user_no = Request["user_no"];
            model.name = Request["name"];
            model.dep_no = Request["dep_no"];
            if (string.IsNullOrEmpty(Request["in_dd"]))
                model.in_dd = null;
            else
                model.in_dd = DateTime.Parse( Request["in_dd"]);

            if (string.IsNullOrEmpty(Request["out_dd"]))
                model.out_dd = null;
            else
                model.out_dd = DateTime.Parse(Request["out_dd"]);


            model.type = Request["type"];
            model.contact = Request["contact"];
            model.rem = Request["rem"];

            if (!string.IsNullOrEmpty(Request["is_shebao"]))
            {
                string a = Request["is_shebao"].ToLower();
                model.is_shebao =  (a == "on" || a == "true") ? "true" : "false";
            }
            else
            {
                model.is_shebao = "false";
            }

            model.n_man = model.e_man = Request["n_man"];
            model.n_dd = DateTime.Now;
            model.e_dd = DateTime.Now;


            bool isOk = true;

            if (action == "NEW")
            {
                if (bus.Exists(model.user_no) == true)
                {
                    Responser.Write("{success:true,result:false, msg:'员工代号已存在！！！'}");
                    Responser.End();
                }

                isOk = bus.Add(model);
                Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:''}");
            }
            else
            {
                isOk = bus.Update(model);
                Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:''}");
            }
            Responser.End();
        }

        if (action == "GETDATA")
        {
            string sqlWhere = Request["sqlWhere"];
            bool IsShowOut = bool.Parse(Request["IsShowOut"].ToLower());
            if (IsShowOut == false)
            {
                sqlWhere += string.IsNullOrEmpty(sqlWhere) ? " isnull(out_dd,'2999-01-01') > getdate()" : " and isnull(out_dd,'2999-01-01') > getdate()";
            }

            DataTable dt = bus.GetListByPage(sqlWhere);
            DataTable PageDt = BusComm.paging(dt, limit, page_index);
            Responser.Write(JsonClass.DataTable2JsonWithPaging(PageDt, dt.Rows.Count));
            Responser.End();
        }

        ////if (action == "SunEditor_Search".ToUpper())
        ////{
        ////    bool multiParams = string.IsNullOrEmpty(Request["multiParams"]) ? false : bool.Parse(Request["multiParams"]);            
        ////    DataTable dt = new DataTable();
        ////    string user_no = Request["user_no"];
        ////    if (multiParams == true)
        ////    {
        ////        dt = bus.GetListByPage(Request["user_no"], limit, page_index);
        ////    }
        ////    else
        ////    {
        ////        dt = bus.GetListByPage(" user_no like \'%" + user_no + "%\' or name like \'%" + user_no + "%\' ", limit, page_index);
        ////    }

        ////    Responser.Write(JsonClass.DataTable2Json(dt));
        ////    Responser.End();
        ////}

        if (action == "DELETE")
        {
            string user_no = Request["user_no"];
            bool isOk = false;

            string msgStr = "";
            try
            {
                isOk = bus.Delete(user_no);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            context.Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + Microsoft.JScript.GlobalObject.escape(msgStr) + "'}");
            context.Response.End();
        }

        var Response= context.Response;

        if (action == "UpdateSort".ToUpper())
        {
            string msgStr = "";

            int itm = 0 ,
                i = 0,
                cnt = int.Parse(Request["cnt"]);

            List<string> users = new List<string>();

            for (; i < cnt; ++i)
            {
                users.Add(Request["s" + i]);
            }
            bool isOk = bus.UpSortItm(users);

            context.Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:''}");
            context.Response.End();
        }

        Responser.End();
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}