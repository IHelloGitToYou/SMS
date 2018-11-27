<%@ WebHandler Language="C#" Class="ashx_PrdtWpMaterial" %>

using System;
using System.Web;
using System.Collections.Generic;
using SMS.Model;
using System.Data;
using SMS.Bus;
using SMS.Bus.SYS.Material;

public class ashx_PrdtWpMaterial : IHttpHandler
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
        action = action.ToUpper();

        Bus_PrdtWpMaterial bus = new Bus_PrdtWpMaterial();
        if (action == "Load".ToUpper())
        {
            string prd_no = Request["prd_no"];
            string wp_no = Request["wp_no"];
            string size = Request["size"];

            DataTable dtHead = bus.LoadHead(prd_no, wp_no);

            DataTable dtBodySize =
                    string.IsNullOrEmpty(size) ? bus.LoadBodySize(prd_no, wp_no): bus.LoadBodySize(prd_no, wp_no, size);

            Response.Write("{ Head:" + JsonClass.DataTable2Json(dtHead));
            Response.Write("  ,Body:" + JsonClass.DataTable2Json(dtBodySize));
            Response.Write(" }");
            Response.End();
        }

        if (action == "LoadAllWpForPJTableTip".ToUpper())
        {
            string prd_no = Request["prd_no"];
            string size = Request["size"];

            DataTable dtAllHead = bus.LoadHeadWithWpName(prd_no);
            DataTable dtAllBodySize = bus.LoadBodySize(prd_no, size, 999999999);

            Response.Write("{" +
                "body1:" +  JsonClass.DataTable2Json(dtAllHead) + "," +
                "body2:" +  JsonClass.DataTable2Json(dtAllBodySize) + "" +
                "}");
            Response.End();
        }

        if (action == "GetNeedMaterial".ToUpper())
        {
            List<Bus_PrdtWpMaterial.Work_CalModel> workeJobs = new List<Bus_PrdtWpMaterial.Work_CalModel>();
            int cnt = int.Parse(Request["cnt"]);
            for (int i = 0; i < cnt; i++)
            {
                Bus_PrdtWpMaterial.Work_CalModel item = new Bus_PrdtWpMaterial.Work_CalModel();
                item.prd_no = Request["prd_no_"+ i];
                item.wp_no = Request["wp_no_"+ i];
                item.size = Request["size_"+ i];
                item.qty = decimal.Parse(Request["qty_"+ i]);

                workeJobs.Add(item);
            }

            var materials = bus.GetNeedMaterial(workeJobs);
            Response.Write("[" + string.Join(",", materials) + "]");
            Response.End();
        }
        //New //Update
        if (action == "Save".ToUpper())
        {
            string prd_no = Request["prd_no"];
            string wp_no = Request["wp_no"];

            List<Model_PrdtWpMaterial> list1 = new List<Model_PrdtWpMaterial>();

            int bodyCnt = int.Parse(Request["bodyCnt"]);
            for (int i = 0; i < bodyCnt; i++)
            {
                Model_PrdtWpMaterial head = new Model_PrdtWpMaterial();
                head.wm_id = int.Parse(Request["wm_id_" + i]);
                head.prd_no = Request["prd_no"];
                head.wp_no = Request["wp_no"];
                head.material_id = int.Parse(Request["material_id_" + i]);
                int bodyCnt2 = int.Parse(Request["bodyCnt_" + i]);
                for (int j = 0; j < bodyCnt2; j++)
                {
                    Model_PrdtWpMaterialSize body = new Model_PrdtWpMaterialSize();
                    body.size = Request["size_" + i + "_" + j];
                    body.use_unit = decimal.Parse(Request["use_unit_" + i + "_" + j]);
                    head.BodySizes.Add(body);
                }

                list1.Add(head);
            }

            bool isOk = true;
            string msgStr = "";
            try
            {
                bus.Save(prd_no, wp_no, list1);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            Response.Write("{success:true, result:" + isOk.ToString().ToLower()
                + " ,msg:'" + Microsoft.JScript.GlobalObject.escape(msgStr)
                + "'}");
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