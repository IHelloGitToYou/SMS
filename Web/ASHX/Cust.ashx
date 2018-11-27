<%@ WebHandler Language="C#" Class="Cust" %>

using System;
using System.Web;
using System.Data;

using SMS.Model;
using SMS.Bus;
using SMS.Bus.Common;

public class Cust : IHttpHandler {
    
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

        Bus_Cust bus = new Bus_Cust();
        Model_Cust model = new Model_Cust();
        
        if(action == "UPDATE" || action == "NEW")
        {
            model.cus_no = Request["cus_no"];
            model.name = Request["name"];
            model.snm = Request["snm"];
            model.state = Request["state"];
            
            model.n_man = model.e_man = Request["n_man"];
            model.n_dd = DateTime.Now;
            model.e_dd = DateTime.Now;

            bool isOk = true;
            
            if (action == "NEW")
            {
                if (bus.Exists(model.cus_no) == true)
                {
                    Responser.Write("{success:true,result:false, msg:'代号已存在！！！'}");
                    Responser.End();
                }
                
                isOk = bus.Add(model);
                Responser.Write("{success:true,result:" + isOk.ToString().ToLower()  + ",msg:''}");
            }
            else
            {
                isOk = bus.Update(model);
                Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:''}");
            }
            Responser.End();
        }
        
        if(action == "GETDATA")
        {
            string sqlWhere = Request["sqlWhere"];
            DataTable dt = bus.GetListByPage(sqlWhere, "");
            DataTable PageDt = BusComm.paging(dt, 10000000, 1);
            Responser.Write(JsonClass.DataTable2JsonWithPaging(PageDt, dt.Rows.Count));
            Responser.End();
        }

        if (action == "DELETE")
        {
            string cus_no = Request["cus_no"];
            bool isOk = false;
            string msgStr = "";
            try
            {
                isOk = bus.Delete(cus_no);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            Responser.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + Microsoft.JScript.GlobalObject.escape( msgStr) + "'}");
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