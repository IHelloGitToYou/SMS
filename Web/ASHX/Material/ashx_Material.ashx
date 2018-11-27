<%@ WebHandler Language="C#" Class="ashx_Material" %>

using System;
using System.Web;
using System.Collections.Generic;
using SMS.Model;
using System.Data;
using SMS.Bus;
using SMS.Bus.SYS.Material;


public class ashx_Material : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "text/plain";
        var Response = context.Response;
        var Request = context.Request;

        string action = Request["action"];
        if (string.IsNullOrEmpty(action))
        {
            Response.Write("{success:true,result:false,errmsg:'action参数末指定'}");
            Response.End();
        }
        action = action.ToUpper();

        Bus_Material bus = new Bus_Material();
        if (action == "Load".ToUpper())
        {
            string prd_no = Request["prd_no"];
            string name = Request["name"];

            DataTable dt = bus.Load(prd_no, name);
            Response.Write(JsonClass.DataTable2Json(dt));
            Response.End();
        }

        //New //Update
        if (action == "Save".ToUpper())
        {
            Model_Material model = new Model_Material();
            model.material_id = int.Parse(Request["material_id"]);
            model.prd_no = Request["prd_no"];
            model.name = Request["name"];
            model.price = decimal.Parse(Request["price"]);

            bool isOk = true;
            string msgStr = "";
            try
            {
                bool isNew = model.material_id < 0;
                if (isNew)
                {
                    model.material_id = bus.Add(model);
                }
                else
                {
                    bus.Update(model);
                }
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            Response.Write("{success:true, result:" + isOk.ToString().ToLower()
                + ", material_id: " + model.material_id
                + " ,msg:'" + Microsoft.JScript.GlobalObject.escape(msgStr)
                + "'}");
            Response.End();
        }

        //Delete
        if (action == "Delete".ToUpper())
        {
            int material_id = int.Parse(Request["material_id"]);
            bool isOk = true;
            string msgStr = "";
            try
            {
                bus.Delete(material_id);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + Microsoft.JScript.GlobalObject.escape(msgStr) + "'}");
            Response.End();
        }
    }

    public bool IsReusable {
        get {
            return false;
        }
    }
}