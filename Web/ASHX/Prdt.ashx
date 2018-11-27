<%@ WebHandler Language="C#" Class="Prdt" %>

using System;
using System.Web;
using System.Data;

using SMS.Model;
using SMS.Bus;
using SMS.Bus.Common;

public class Prdt : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        var Responser = context.Response;
        var Request = context.Request;
        //代号	prd_no
        //名称	name
        //简称	snm
        //规格	spc
        //英文名称	eng_name
        //状态	state
        //备注	rem
        //创建人员	n_man
        //创建时间	n_dd
        //修改人员	e_man
        //修改时间	e_dd

        string action = Request["action"];
        if (string.IsNullOrEmpty(action))
        {
            Responser.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            Responser.End();
        }
        //　大写
        action = action.ToUpper();

        Bus_Prdt bus = new Bus_Prdt();
        Model_Prdt model = new Model_Prdt();

        if (action == "UPDATE" || action == "NEW")
        {
            model.prd_no = Request["prd_no"].Trim();
            model.name = Request["name"];
            model.snm = Request["snm"];
            model.spc = Request["spc"];
            model.eng_name = Request["eng_name"];
            model.state = Request["state"];
            model.rem = Request["rem"];

            model.n_man = model.e_man = Request["n_man"];
            model.n_dd = DateTime.Now;
            model.e_dd = DateTime.Now;

            bool isOk = true;

            if (action == "NEW")
            {
                if (bus.Exists(model.prd_no) == true)
                {
                    Responser.Write("{success:true,result:false, msg:'货号已存在!'}");
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

            int page_index = Convert.ToInt32(Request["page"]);
            int limit = Convert.ToInt32(Request["limit"]);

            DataTable dt = bus.GetListByPage(sqlWhere, "prd_no");
            DataTable PageDt = BusComm.paging(dt, limit, page_index);
            Responser.Write(JsonClass.DataTable2JsonWithPaging(PageDt, dt.Rows.Count));
            Responser.End();
        }

        if (action == "DELETE")
        {
            string prd_no = Request["prd_no"];
            bool isOk = false;

            string msgStr = "";
            try
            {
                isOk = bus.Delete(prd_no);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            context.Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + Microsoft.JScript.GlobalObject.escape(msgStr) + "'}");
            context.Response.End();

            Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:''}");
            Responser.End();
        }

        Responser.End();
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}