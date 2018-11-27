<%@ WebHandler Language="C#" Class="ashx_WPQtyMaterialEdit" %>

using System;
using System.Linq;
using System.Linq.Expressions;
using System.Collections.Generic;
using System.Web;
using System.Data;
using System.Text;
using SMS.Model;
using SMS.Bus;
using SMS.Bus.SYS.Material;
using SMS.DBHelper;
using System.Data.SqlClient;

public class ashx_WPQtyMaterialEdit : IHttpHandler
{
    Bus_WpQtyMaterial bus = new Bus_WpQtyMaterial();
    Bus_WPQtyBySize busWQ = new Bus_WPQtyBySize();
    Bus_Prdt_WP busWP = new Bus_Prdt_WP();
    Bus_PrdtWpColor busWpColor = new Bus_PrdtWpColor();

    string NowUserId = "";
    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        var Response = context.Response;
        var Request = context.Request;
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
        NowUserId = Request["NowUserId"];
        action = action.ToUpper();

        if (action == "Save".ToUpper())
        {
            Dictionary<string, string> Header = new Dictionary<string, string>();
            try
            {
                Header = GetWQHeader(Request);
            }
            catch (Exception ex)
            {
                Response.Write("{success:true,result:false,msg:'" + ex.Message.ToString() + "'}");
                Response.End();
            }

            int wq_id = int.Parse(Header["wq_id"]);
            bool IsNewing = wq_id < 0;
            int bodyCnt = int.Parse(Request["bodyCnt"]);

            List<Dictionary<string, string>> Bodys = new List<Dictionary<string, string>>();
            List<int> SetedSizeIds = new List<int>();
            for (int i = 0; i < bodyCnt; i++)
            {
                List<string> wpList = Request["wp_no_" + i].Split(new char[] { ',' }).ToList();
                int size_id = int.Parse(Request["size_id_" + i]);
                //加载SizeId信息
                DataRow sizeIdInfo = null;
                try
                {
                    sizeIdInfo = GetSizeIdInfo(size_id);
                }
                catch (Exception ex)
                {
                    Response.Write("{success:true,result:false,msg:'" + ex.Message.ToString() + "'}");
                    Response.End();
                }
                //防止SizeId相同. 
                if (SetedSizeIds.IndexOf(size_id) >= 0)
                {
                    Response.Write("{success:true,result:false,msg:'请合并相同的计划行"
                        + sizeIdInfo["plan_no"].ToString()
                        + "(" + sizeIdInfo["size"].ToString() + ")'}");
                    Response.End();
                }
                SetedSizeIds.Add(size_id);

                int plan_id = int.Parse(sizeIdInfo["plan_id"].ToString());
                var planInfo = GetPlanHeader(plan_id);
                string cus_no = planInfo["cus_no"].ToString();
                int color_id = int.Parse(sizeIdInfo["color_id"].ToString());

                for (int j = 0; j < wpList.Count; j++)
                {
                    string wp_no = wpList[j];
                    var bodyItem = new Dictionary<string, string>();
                    bodyItem["size_id"] = size_id.ToString();
                    bodyItem["wq_id"] = wq_id.ToString();
                    bodyItem["jx_dd"] = Header["jx_dd"];
                    bodyItem["itm"] = (i + 1).ToString();
                    bodyItem["worker"] = Request["worker_" + i];
                    bodyItem["prd_no"] = planInfo["prd_no"].ToString();
                    bodyItem["wp_no"] = int.Parse(wp_no).ToString();
                    bodyItem["qty_pic"] = double.Parse(Request["qty_pic_" + i]).ToString();
                    bodyItem["qty_pair"] = double.Parse(Request["qty_pair_" + i]).ToString();
                    bodyItem["inscrease_percent"] = "0";

                    Bus_Prdt_WPUP busUP = new Bus_Prdt_WPUP();
                    Bus_Prdt_WP busWP = new Bus_Prdt_WP();

                    int up_no = busUP.GetValidUpNo(bodyItem["prd_no"], DateTime.Parse(Header["jx_dd"]), Header["user_dep_no"], cus_no);
                    if (up_no < 0)
                    {
                        Response.Write("{success:true,result:false,msg:'没有有效单价!'}");
                        Response.End();
                    }

                    DataTable dtPrdtWp_UP = busUP.LoadWpUP(bodyItem["prd_no"], up_no);
                    var upList = dtPrdtWp_UP.Select(" wp_no='" + wp_no + "'");
                    DataRow wpRow = busWP.LoadPrdtWp(bodyItem["prd_no"], int.Parse(wp_no)).Rows[0];
                    if (upList.Length <= 0)
                    {
                        string wpName = wpRow["name"].ToString();
                        throw new Exception("异常:工序" + wpName + " 的单价不存在!");
                    }
                    bodyItem["up_pic"] = double.Parse(upList[0]["up_pic"].ToString()).ToString();
                    bodyItem["up_pair"] = double.Parse(upList[0]["up_pair"].ToString()).ToString();

                    //特殊单价
                    bool useExpUp = wpRow["color_different_price"].ToString().ToLower() ==
                            "true" ? true : false;
                    if (useExpUp)
                    {
                        DataTable dtProdtWp_UP_Color = busWpColor.GetColorPrice(bodyItem["prd_no"], up_no);
                        if (color_id > 0)
                        {
                            DataRow colorUP = Bus_WPQtyBySize.GetColorExpUP(dtProdtWp_UP_Color, wp_no, color_id);
                            if (colorUP != null)
                            {
                                bodyItem["up_pic"] = double.Parse(colorUP["up_pic"].ToString()).ToString();
                                bodyItem["up_pair"] = double.Parse(colorUP["up_pair"].ToString()).ToString();
                            }
                        }

                        DataRow jxExpUp = Bus_WPQtyBySize.GetJXNoExpUP(dtProdtWp_UP_Color, wp_no, Header["jx_no"]);
                        if (jxExpUp != null)
                        {
                            bodyItem["up_pic"] = double.Parse(jxExpUp["up_pic"].ToString()).ToString();
                            bodyItem["up_pair"] = double.Parse(jxExpUp["up_pair"].ToString()).ToString();
                        }
                    }
                    Bodys.Add(bodyItem);
                }// for 
            } // for

            //皮奖物料Grid
            List<Model_WPQtyMaterial> WQMaterialRows = new List<Model_WPQtyMaterial>();
            int Body2Cnt = int.Parse(Request["Body2Cnt"]);
            for (int i = 0; i < Body2Cnt; i++)
            {

                Model_WPQtyMaterial m = new Model_WPQtyMaterial();
                m.wq_id = -1;// Header[""]
                m.material_id = int.Parse(Request["material_id_m_" + i]);
                m.plan_qty = int.Parse(Request["plan_qty_m_" + i]);
                m.wl_qty = int.Parse(Request["wl_qty_m_" + i]);
                m.rl_qty = int.Parse(Request["rl_qty_m_" + i]);
                m.use_qty = int.Parse(Request["use_qty_m_" + i]);
                m.qty = int.Parse(Request["qty_m_" + i]);
                m.price = Bus_Material.GetPrice(m.material_id); //; int.Parse(Request["price_m_" + i]);

                WQMaterialRows.Add(m);
            }

            bool isOk = false;
            string msgStr = "";
            try
            {
                wq_id = DoSave(Header, Request, Bodys, WQMaterialRows);
                isOk = true;
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }
            Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "', wq_id:" + wq_id + "}");
            Response.End();
        }/// Action Save


        if (action == "LoadTable".ToUpper())
        {
            int wq_id = int.Parse(Request["wq_id"]);
            DataTable dtBody = GetBodyWithAttachVar(wq_id); ;
            if (dtBody == null)
            {
                Response.Write("{success:true,result:false,msg:'异常计划行不存在,请联系吖潮!'}");
                Response.End();
            }

            DataTable dtCompressSameSizeId = CompressSameBySizeId(dtBody);
            DataTable dtBodyShare = busWQ.LoadBody_Share(wq_id);

            List<string> workers = bus.GetWQWorker(wq_id);
            List<decimal> normalShares = bus.GetWQNormalSharePercent(wq_id, dtBodyShare, workers);

            Response.Write("{success:true,result:true,msg:'' ");
            Response.Write("   ,Header:" + JsonClass.DataTable2Json(busWQ.LoadHeader(wq_id)));
            Response.Write("   ,Body:" + JsonClass.DataTable2Json(dtCompressSameSizeId));

            Response.Write("   ,BodyMaterial:" + JsonClass.DataTable2Json(bus.LoadMaterial(wq_id)));
            Response.Write("   ,BodyShare:" + JsonClass.DataTable2Json(dtBodyShare));
            Response.Write("   ,BodyShareMaterial:" + JsonClass.DataTable2Json(bus.LoadShareMaterial(wq_id)));
            Response.Write("   ,worker1:'" + (workers.Count >= 1 ? workers[0] : "") + "'");
            Response.Write("   ,worker2:'" + (workers.Count >= 2 ? workers[1] : "") + "'");
            Response.Write("   ,SharePercent1:" + normalShares[0] + "");
            Response.Write("   ,SharePercent2:" + normalShares[1] + "");
            Response.Write("   ,ShareMaterialPercent1:100");
            Response.Write("   ,ShareMaterialPercent2:0");

            Response.Write("} ");
            Response.End();
        }//Action LoadTable

    }

    public Dictionary<string, string> GetWQHeader(HttpRequest Request)
    {
        Dictionary<string, string> Header = new Dictionary<string, string>();
        int wq_id = int.Parse(Request["wq_id"]);
        bool IsNewing = wq_id < 0;
        Header["wq_id"] = wq_id.ToString();
        Header["jx_no"] = Request["jx_no"];
        if (IsNewing && busWQ.ExsistJXNo(Header["jx_no"]))
        {
            throw new Exception("计薪单号已存在!");
        }

        Header["jx_dd"] = DateTime.Parse(Request["jx_dd"]).Date.ToString();
        Header["provider"] = Request["provider"];

        Header["plan_id"] = "-1";
        Header["plan_no"] = "";
        Header["cus_no"] = "";
        Header["prd_no"] = "";
        Header["size_id"] = "-1";
        Header["size"] = "";
        Header["wp_dep_no"] = Request["wp_dep_no"];
        Header["user_dep_no"] = Request["user_dep_no"];

        Header["edit_ut"] = int.Parse(Request["edit_ut"]).ToString();  // --显示单位 1.对 2.个
        Header["color_id"] = (-1).ToString(); //(-1).ToString();//
        Header["cal_inscrease"] = "false";
        Header["table_type"] = "计件皮奖";


        Header["n_man"] = NowUserId;
        Header["n_dd"] = DateTime.Now.ToString();
        Header["e_man"] = NowUserId;
        Header["e_dd"] = DateTime.Now.ToString();

        return Header;
    }

    DataRow GetSizeIdInfo(int size_id)
    {
        Bus_WorkPlan bus = new Bus_WorkPlan();
        var dt = bus.LoadPlan_SizesBySizeId(size_id);
        if (dt.Rows.Count <= 0)
        {
            throw new Exception("计划行不存在!");
        }

        return dt.Rows[0];
    }

    public DataRow GetPlanHeader(int PlanId)
    {
        Bus_WorkPlan busPlan = new Bus_WorkPlan();
        return busPlan.LoadWorkPlanHeader(PlanId).Rows[0];
    }

    public string GetPlanCusNo(int PlanId)
    {
        Bus_WorkPlan busPlan = new Bus_WorkPlan();
        return busPlan.LoadWorkPlanHeader(PlanId).Rows[0]["cus_no"].ToString();
    }


    /// <summary>
    /// 加载Body时,带虚拟栏位
    /// </summary>
    /// <returns></returns>
    private DataTable GetBodyWithAttachVar(int wq_id)
    {
        DataTable dtBody = busWQ.LoadBody(wq_id);
        dtBody.Columns.Add(new DataColumn("plan_id"));
        dtBody.Columns.Add(new DataColumn("plan_no"));
        dtBody.Columns.Add(new DataColumn("color_id"));
        dtBody.Columns.Add(new DataColumn("size"));
        dtBody.Columns.Add(new DataColumn("wp_name"));

        foreach (DataRow row in dtBody.Rows)
        {
            int sizeId = int.Parse(row["size_id"].ToString());
            DataRow drSizeInfo = GetSizeIdInfo(sizeId);
            if (drSizeInfo == null)
            {
                return null;
            }
            int plan_id = int.Parse(drSizeInfo["plan_id"].ToString());
            var planInfo = GetPlanHeader(plan_id);

            row["plan_id"] = drSizeInfo["plan_id"];

            row["plan_no"] = planInfo["plan_no"];
            row["color_id"] = drSizeInfo["color_id"];
            row["size"] = drSizeInfo["size"];
            DataRow wpRow = busWP.LoadPrdtWp(row["prd_no"].ToString(), int.Parse(row["wp_no"].ToString())).Rows[0];
            row["wp_name"] = wpRow["name"].ToString();

            //{ name: 'plan_id', type: 'int', defaultValue: -1 },
            //{ name: 'paln_no', type: 'string' },
            //{ name: 'color_id', type: 'int', defaultValue: -1 },
            //{ name: 'size', type: 'string' },
            //{ name: 'wp_name', type: 'string' } 
        }

        return dtBody;
    }


    DataTable CompressSameBySizeId(DataTable bodyWithAttachVar)
    {
        DataTable dtClone = bodyWithAttachVar.Clone();
        dtClone.Clear();
        bodyWithAttachVar.DefaultView.Sort = "wqb_id";
        DataTable dtSort = bodyWithAttachVar.DefaultView.ToTable();

        List<int> AllSizeIds = dtSort.AsEnumerable().Select(o => int.Parse(o["size_id"].ToString())).Distinct().ToList();
        for (int i = 0; i < AllSizeIds.Count; i++)
        {
            var recs = dtSort.AsEnumerable().Where(o => o["size_id"].ToString() == AllSizeIds[i].ToString()).ToList();
            dtClone.Rows.Add(recs[0].ItemArray);
            var ingRow = dtClone.Rows[dtClone.Rows.Count - 1];

            ingRow["wp_no"] = string.Join(",", recs.Select(o => o["wp_no"].ToString()));
            ingRow["wp_name"] = string.Join(", ", recs.Select(o => o["wp_name"].ToString()));
        }

        return dtClone;
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }


    private int DoSave(Dictionary<string, string> Header, HttpRequest request, List<Dictionary<string, string>> WQBodyRows, List<Model_WPQtyMaterial> WQMaterialRows)
    {
        int wq_id = int.Parse(Header["wq_id"]);
        bool isNew = wq_id <= 0;
        try
        {
            busWQ.Save(Header, WQBodyRows, ref wq_id, false, false);
        }
        catch (Exception ex)
        {
            if (isNew)
            {
                busWQ.Delete(wq_id);
            }
            throw ex;
        }


        DataTable dtBody = busWQ.LoadBody(wq_id);
        try
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();
            foreach (Model_WPQtyMaterial material in WQMaterialRows)
            {
                material.wq_id = wq_id;
                if (isNew == false)
                {
                    Cmds.Add(bus.DeleteMaterialCmd(wq_id));
                }
                Cmds.Add(bus.InsertMaterialCmd(material));
            }

            //补充分成信息,,基本 与 物料
            var cmd1s = busWQ.AttachWQBodyShare(
                   wq_id, dtBody,
                   request["worker1"], request["worker2"],
                   decimal.Parse(request["SharePercent1"]), decimal.Parse(request["SharePercent2"]));

            Cmds.AddRange(cmd1s);

            var cmd2s = bus.InsertShareMaterialCmds(wq_id,
                request["worker1"], request["worker2"],
                decimal.Parse(request["ShareMaterialPercent1"]), decimal.Parse(request["ShareMaterialPercent2"]));

            Cmds.AddRange(cmd2s);
            SqlHelper.ExecuteTransForList(Cmds);
        }
        catch (Exception ex)
        {
            if (isNew)
            {
                busWQ.Delete(wq_id);
            }
            throw ex;
        }
        return wq_id;
    }
}