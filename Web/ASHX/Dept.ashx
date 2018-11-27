<%@ WebHandler Language="C#" Class="Dept" %>

using System;
using System.Web;
using System.Data;
using SMS.Bus;
using SMS.Model;
using SMS.Bus.Common;

public class Dept : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        var response = context.Response;
        var Request = context.Request;
        Model_Dept model = new Model_Dept();
        response.ContentType = "text/plain";

        string action = Request["action"];
        if (string.IsNullOrEmpty(action))
        {
            response.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            response.End();
        }
        
        action = action.ToLower();
        //显示CRM的物料结构,
        /// 用于Tree中显示
        if (action == "fetch_data")
        {
            Bus_Dept bus = new Bus_Dept();
            DataTable dt = bus.GetAllData();
            string str = bus.TranDTToTreeJson(dt, "000000", true);
            response.Write(str);
            response.End();
        }

        if (action == "GETDATA".ToLower())
        {
            Bus_Dept bus = new Bus_Dept();
            
            string sqlWhere = Request["sqlWhere"];
            int total = bus.GetRecordCount(sqlWhere);
            
            int page_index = Convert.ToInt32(Request["page"]);
            int limit = Convert.ToInt32(Request["limit"]);

            DataTable dt = bus.GetListByPage(sqlWhere, "");
            DataTable PageDt = BusComm.paging(dt, limit, page_index);
            response.Write(JsonClass.DataTable2JsonWithPaging(PageDt, dt.Rows.Count));
            response.End();

            response.Write(JsonClass.DataTable2JsonWithPaging(dt, total));
            response.End();
        }
        
        //
        //// 显示部门 + 员工的树式菜单 
        //if (action == "fetch_data_with_people".ToLower())
        //{
        //    Bus_Dept bus = new Bus_Dept();
        //    DataTable DepDt = bus.GetAllData();
        //    // 各部门节点，下查询有否部门员工
        //    string str = bus.TranDTToTreeJsonWith_People(DepDt, "TOP", "");
        //    response.Write(str);
        //    response.End();
        //}

        if (action == "fetch_data2")
        {
            Bus_Dept bus = new Bus_Dept();
            DataTable dt = bus.GetData(" and dep_no <> 'TOP' ");
            response.Write(JsonClass.DataTable2Json(dt));
            response.End();
        }

        if (action == "add")
        {
            Bus_Dept bus = new Bus_Dept();
            model.dep_no = context.Request["depno"];
            model.up_dep_no = context.Request["up_dep_no"];
            model.name = context.Request["name"];
            
            bool have = bus.Exists(model.dep_no );
            if ( false == have)
            {
                
                //model.up_dep_no = model.dep_no;
                bus.Add(model);
                
                context.Response.Write("{success : true, result:true,msg:''}");
                context.Response.End();
            }
            else
            {
                context.Response.Write("{success : true, result:false, msg:'出错 部门代号被占用，新建操作取消'}");
            }
        }
        if (action == "update")
        {
            Bus_Dept bus = new Bus_Dept();
            model.name = context.Request["name"];
            model.dep_no = context.Request["depno"];
            bus.Update(model);
            context.Response.Write("{success : true, result:true,msg:''}");
        }


        if (action == "delete")
        {
            Bus_Dept bus = new Bus_Dept();
            
            string dep_no = context.Request["dep_no"];
            bool isOk = false;
            string msgStr = "";
            try
            {
                isOk = bus.Delete(dep_no);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            context.Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + Microsoft.JScript.GlobalObject.escape(msgStr) + "'}");
            context.Response.End();
 
        }
        
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}