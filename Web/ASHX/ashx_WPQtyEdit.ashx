<%@ WebHandler Language="C#" Class="ashx_WPQtyEdit" %>

using System;
using System.Linq;
using System.Web;
using System.Data;
using System.Text;
using SMS.Bus;
using SMS.DBHelper;
using System.Data.SqlClient;
using System.Collections.Generic;

public class ashx_WPQtyEdit : IHttpHandler
{
    Bus_WPQtyBySize bus = new Bus_WPQtyBySize();
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

        // 查询计薪单
        if (action == "SearchWQ".ToUpper())
        {
            Dictionary<string, string> searchModel = new Dictionary<string, string>();
            searchModel["S_jx_dd"] = Request["S_jx_dd"];
            searchModel["E_jx_dd"] = Request["E_jx_dd"];
            searchModel["jx_no"] = Request["jx_no"];
            searchModel["prd_no"] = Request["prd_no"];
            searchModel["wp_dep_no"] = Request["wp_dep_no"];
            searchModel["user_dep_no"] = Request["user_dep_no"];
            searchModel["plan_no"] = Request["plan_no"];
            searchModel["cus_no"] = Request["cus_no"];
            searchModel["TableType"] = Request["TableType"];

            searchModel["query_prd_no"] = Request["query_prd_no"];
            searchModel["IsShareTable"] = bool.Parse(Request["IsShareTable"].ToLower()).ToString().ToLower();


            DataTable dt = bus.SearchHeader(searchModel);
            Response.Write(JsonClass.DataTable2Json(dt));
            Response.End();
        }

        // 查询计薪单(皮奖专用)
        if (action == "SearchWQ_PJ".ToUpper())
        {
            Dictionary<string, string> searchModel = new Dictionary<string, string>();
            searchModel["S_jx_dd"] = Request["S_jx_dd"];
            searchModel["E_jx_dd"] = Request["E_jx_dd"];
            searchModel["jx_no"] = Request["jx_no"];
            searchModel["prd_no"] = Request["prd_no"];
            searchModel["wp_dep_no"] = Request["wp_dep_no"];
            searchModel["user_dep_no"] = Request["user_dep_no"];
            searchModel["plan_no"] = Request["plan_no"];
            searchModel["cus_no"] = Request["cus_no"];
            searchModel["TableType"] = Request["TableType"];

            DataTable dt = bus.SearchHeaderOnPJ(searchModel);

            bool worker_union = false;
            if (!string.IsNullOrEmpty(Request["worker_union"]))
            {
                worker_union = Request["worker_union"].ToLower() == "on";
            }
            List<string> workers = new List<string>();
            if (!string.IsNullOrEmpty(Request["worker1"]))
            {
                workers.Add(Request["worker1"]);
            }
            if (!string.IsNullOrEmpty(Request["worker2"]))
            {
                workers.Add(Request["worker2"]);
            }
            DataTable dt2 = bus.HeaderPJAttachSizeInfo(dt, workers, worker_union);
            Response.Write(JsonClass.DataTable2Json(dt2));
            Response.End();


            Response.End();
        } //Action SearchWQ_PJ 

        //下拉框 
        if (action == "SearchPlanSize".ToUpper())
        {
            string plan_no = Request["plan_no"];
            int page = int.Parse(Request["page"]);
            int limit = int.Parse(Request["limit"]);

            DataTable dt = bus.LoadComboboxPlanSize_Data(plan_no, page, limit);
            Response.Write(JsonClass.DataTable2Json(dt));
            Response.End();
        }

        if (action == "UpdateJXDD".ToUpper())
        {
            int wq_id = int.Parse(Request["wq_id"]);
            DateTime jx_dd = DateTime.Parse(Request["jx_dd"]);
            bool isOk = true;
            string msgStr = "";
            try
            {
                bus.UpdateJxDD(wq_id, jx_dd);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "'}");
            Response.End();
        }


        if (action == "LoadWQLayoutData".ToUpper())
        {
            bool ISWQB = false;
            if (!string.IsNullOrEmpty(Request["ISWQB"]))
            {
                ISWQB = bool.Parse(Request["ISWQB"].ToLower());
            }

            //2019-08-02 增加 按计划单统计视图
            bool IsSumByPlanView = false;
            if(!string.IsNullOrEmpty(Request["IsSumByPlanView"]))
                IsSumByPlanView = bool.Parse(Request["IsSumByPlanView"]);

            int wq_id = int.Parse(Request["wq_id"]);
            bool IsNewing = wq_id < 0;
            string jx_no = Request["jx_no"];

            string prd_no = Request["prd_no"];
            DateTime jx_dd = DateTime.Parse(Request["jx_dd"]).Date;
            string cus_no = Request["cus_no"];
            int plan_id = int.Parse(Request["plan_id"]);
            string plan_no = Request["plan_no"];
            int size_id = int.Parse(Request["size_id"]);
            string size = Request["size"];
            string edit_ut = int.Parse(Request["edit_ut"]).ToString(); //1.对 2.个
                                                                       //string wp_dep_no = Request["wp_dep_no"];
            string user_dep_no = Request["user_dep_no"];
            if (user_dep_no == "000000")
            {
                Response.Write("{success:true,result:false,msg:'员工部门必须选择一个,并且不允许是根'}");
                Response.End();
            }
            // plan_id ,size_id  的plan_no信息有没有冲突, plan_id, 有这个size_id吗?
            Bus_WorkPlan busPlan = new Bus_WorkPlan();
            Bus_Prdt_WP busPrdtWP = new Bus_Prdt_WP();
            Bus_SizeControl busSizeControl = new Bus_SizeControl();
            Bus_Prdt_WPUP busUP = new Bus_Prdt_WPUP();
            Bus_PrdtWpColor busUPColor = new Bus_PrdtWpColor();

            Bus_Salm busSalm = new Bus_Salm();

            //DataTable dtPlanHeader = new DataTable();
            //if(IsNewing == false)
            //    dtPlanHeader = bus.LoadHeader(wq_id);
            double plan_sizes_qty = 0.00;
            double plan_size_qty = 0.00;
            //计件分成,没有SizeId
            if (size_id > 0)
            {
                DataTable dt1 = busPlan.LoadPlan_Sizes(plan_id, size_id);
                if (dt1.Rows.Count <= 0)
                {
                    Response.Write("{success:true,result:false,msg:'计划单不包含尺寸:" + size + ", 请重新选择'}");
                    Response.End();
                }
                plan_size_qty = double.Parse(dt1.Rows[0]["qty"].ToString());
            }

            DataTable dt2 = busPlan.LoadWorkPlanHeader(plan_id);
            if (dt2.Rows[0]["prd_no"].ToString() != prd_no)
            {
                Response.Write("{success:true,result:false,msg:'计划单不是生产货号:" + prd_no + ", 请重新选择'}");
                Response.End();
            }
            plan_sizes_qty = double.Parse(dt2.Rows[0]["sizes_qty"].ToString());

            DataTable dtPrdtWp = busPrdtWP.LoadPrdtWp(prd_no);
            DataTable dtPrdtWp_SizeControl = busSizeControl.GetPrdt_SizeControl(prd_no);
            int up_no = busUP.GetValidUpNo(prd_no, jx_dd, user_dep_no, cus_no);
            if (up_no < 0)
            {
                Response.Write("{success:true,result:false,msg:'没有有效单价!'}");
                Response.End();
            }
            DataTable dtPrdtWp_UP = busUP.LoadWpUP(prd_no, up_no);
            DataTable dtSalm = new DataTable();
            if (ISWQB == false)
            {
                dtSalm = SqlHelper.ExecuteSql(" select user_no, name, out_dd from salm Where dep_no = '" + user_dep_no + "' and GetDate() <= isnull(out_dd,'2999/01/01')  order by sort_itm ");
            }
            DataTable dtWQDetail = new DataTable();
            DataTable dtWQDetailSharePercent = new DataTable();
            DataTable dtWQFinish = new DataTable();
            DataTable dtWQFinish_allSize = new DataTable();
            DataTable dtUserDeptFinish_allSize = new DataTable();


            if (IsNewing == false)
            {
                if(IsSumByPlanView)
                {
                    string wp_dep_no = Request["wp_dep_no"];
                    DateTime? isSumByPlanView_StartDD = null;
                    DateTime? isSumByPlanView_EndDD = null;

                    if (!string.IsNullOrEmpty(Request["IsSumByPlanView_StartDD"]))
                         isSumByPlanView_StartDD = DateTime.Parse(Request["IsSumByPlanView_StartDD"]).Date;
                    if (!string.IsNullOrEmpty(Request["IsSumByPlanView_EndDD"]))
                         isSumByPlanView_EndDD = DateTime.Parse(Request["IsSumByPlanView_EndDD"]).Date;


                    dtWQDetail = bus.LoadBody(plan_no, wp_dep_no, user_dep_no,isSumByPlanView_StartDD ,isSumByPlanView_EndDD);
                }
                else
                    dtWQDetail = bus.LoadBody(wq_id);
                dtWQDetailSharePercent = bus.LoadBody_Share(wq_id);
            }

            //12-6加入颜色单价例外
            DataTable dtColorUP = busUPColor.GetColorPrice(prd_no, up_no);
            //计件分成,没有SizeId
            if (size_id > 0)
            {
                dtWQFinish = bus.GetWQTotal(size_id);
                dtWQFinish_allSize = bus.GetWQTotalOnAllSize(plan_id);
                dtUserDeptFinish_allSize = bus.GetWQTotalOnAllSize(plan_id, user_dep_no);
            }

            StringBuilder strBuilder = new StringBuilder();
            strBuilder.AppendLine("{");
            strBuilder.AppendLine("success:true, result: true");
            strBuilder.AppendLine(" ,plan_sizes_qty: " + plan_sizes_qty + ", plan_size_qty: " + plan_size_qty + " ");
            //strBuilder.AppendLine(" ,PlanHeader:" + JsonClass.DataTable2Json(dtPlanHeader));
            strBuilder.AppendLine(" ,PrdtWP:" + JsonClass.DataTable2Json(dtPrdtWp));
            strBuilder.AppendLine(" ,PrdtWP_SIZE:" + JsonClass.DataTable2Json(dtPrdtWp_SizeControl));
            strBuilder.AppendLine(" ,PrdtWP_UP:" + JsonClass.DataTable2Json(dtPrdtWp_UP));
            strBuilder.AppendLine(" ,PrdtWP_COLOR_UP:" + JsonClass.DataTable2Json(dtColorUP));
            if (ISWQB == false)
            {
                strBuilder.AppendLine(" ,Salm:" + JsonClass.DataTable2Json(dtSalm));
            }
            strBuilder.AppendLine(" ,WQDetail :" + JsonClass.DataTable2Json(dtWQDetail));
            strBuilder.AppendLine(" ,WQDetailShare:" + JsonClass.DataTable2Json(dtWQDetailSharePercent));
            strBuilder.AppendLine(" ,WQFinish:" + JsonClass.DataTable2Json(dtWQFinish));
            strBuilder.AppendLine(" ,WQUserDeptFinish:" + JsonClass.DataTable2Json(dtUserDeptFinish_allSize));
            strBuilder.AppendLine(" ,WQFinish_AllSizes:" + JsonClass.DataTable2Json(dtWQFinish_allSize));

            if (size_id > 0 && IsNewing == false)
            {
                strBuilder.AppendLine(" ,WQFlowCheckList:" + JsonClass.DataTable2Json(Bus_CheckHelper.GetAsk(" jx_no = '" + jx_no + "'")));
            }
            strBuilder.AppendLine(" ,msg:'加载成功' }");

            Response.Write(strBuilder.ToString());
            Response.End();
            //prd_noWp       prd_no
            //SizeControl    prd_no
            //Wp UP          prd_no jx_dd user_dep_no cus_no
            //salm list      user_dep_no 
            //本单录入数据   wq_id
            //allFinishQty   size_id, [qty_pic, qty_pair]
        }



        // Save
        if (action == "Save".ToUpper())
        {
            //WQHeader
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
            bool IsShareTable = bool.Parse(Request["IsShareTable"].ToLower());
            bool IsNewing = wq_id < 0;


            List<Dictionary<string, string>> Bodys = new List<Dictionary<string, string>>();
            int bodyCnt = int.Parse(Request["bodyCnt"]);
            ////////WQBody List  bodyCnt
            Bus_Prdt_WPUP busUP = new Bus_Prdt_WPUP();
            Bus_Prdt_WP busWP = new Bus_Prdt_WP();
            int up_no = busUP.GetValidUpNo(Header["prd_no"], DateTime.Parse(Header["jx_dd"]), Header["user_dep_no"], Header["cus_no"]);
            if (up_no < 0)
            {
                Response.Write("{success:true,result:false,msg:'没有有效单价!'}");
                Response.End();
            }
            Bus_PrdtWpColor busWpColor = new Bus_PrdtWpColor();
            DataTable dtPrdtWp_UP = busUP.LoadWpUP(Header["prd_no"], up_no);
            DataTable dtProdtWp_UP_Color = busWpColor.GetColorPrice(Header["prd_no"], up_no);

            DataTable dtPassedAskPrice = null;
            if (IsNewing == false)
            {
                dtPassedAskPrice = Bus_CheckHelper.GetPassAskPrice(Header["jx_no"]);
            }

            int color_id = int.Parse(Header["color_id"]);
            for (int i = 0; i < bodyCnt; i++)
            {
                var bodyItem = new Dictionary<string, string>();
                bodyItem["wq_id"] = wq_id.ToString();
                bodyItem["jx_dd"] = Header["jx_dd"];

                bodyItem["itm"] = (i + 1).ToString();
                bodyItem["worker"] = Request["worker_" + i];
                if (IsShareTable)
                {
                    bodyItem["worker2"] = Request["worker2_" + i];
                    bodyItem["share_percent1"] = Request["share_percent1_" + i];
                    bodyItem["share_percent2"] = Request["share_percent2_" + i];
                }
                bodyItem["prd_no"] = Header["prd_no"];
                bodyItem["wp_no"] = int.Parse(Request["wp_no_" + i]).ToString();
                bodyItem["qty_pic"] = double.Parse(Request["qty_pic_" + i]).ToString();
                bodyItem["qty_pair"] = double.Parse(Request["qty_pair_" + i]).ToString();
                bodyItem["inscrease_percent"] = "0";    //计件单,,0

                var upList = dtPrdtWp_UP.Select(" wp_no='" + bodyItem["wp_no"] + "'");
                DataRow wpRow = busWP.LoadPrdtWp(bodyItem["prd_no"], int.Parse(bodyItem["wp_no"])).Rows[0];
                if (upList.Length <= 0)
                {
                    string wpName = wpRow["name"].ToString();
                    throw new Exception("异常:工序" + wpName + " 的单价不存在!");
                }

                bodyItem["up_pic"] = double.Parse(upList[0]["up_pic"].ToString()).ToString();
                bodyItem["up_pair"] = double.Parse(upList[0]["up_pair"].ToString()).ToString();

                //依颜色区分单价
                bool useExpUp = wpRow["color_different_price"].ToString().ToLower() ==
                        "true" ? true : false;
                if (useExpUp)
                {
                    if (color_id > 0)
                    {
                        DataRow colorUP = Bus_WPQtyBySize.GetColorExpUP(dtProdtWp_UP_Color, bodyItem["wp_no"], color_id);
                        if (colorUP != null)
                        {
                            bodyItem["up_pic"] = double.Parse(colorUP["up_pic"].ToString()).ToString();
                            bodyItem["up_pair"] = double.Parse(colorUP["up_pair"].ToString()).ToString();
                        }
                    }

                    DataRow jxExpUp = Bus_WPQtyBySize.GetJXNoExpUP(dtProdtWp_UP_Color, bodyItem["wp_no"], Header["jx_no"]);
                    if (jxExpUp != null)
                    {
                        bodyItem["up_pic"] = double.Parse(jxExpUp["up_pic"].ToString()).ToString();
                        bodyItem["up_pair"] = double.Parse(jxExpUp["up_pair"].ToString()).ToString();
                    }
                }

                //通过的审核单价
                if(IsNewing == false)
                {
                    var passAskPrice = dtPassedAskPrice.AsEnumerable().Where(o => o["wp_no"].ToString() == bodyItem["wp_no"]).FirstOrDefault();
                    if(passAskPrice != null)
                    {
                        bodyItem["up_pic"] = decimal.Parse(passAskPrice["ask_up_pic"].ToString()).ToString();
                        bodyItem["up_pair"] = decimal.Parse(passAskPrice["ask_up_pair"].ToString()).ToString();
                    }
                }



                Bodys.Add(bodyItem);
            }

            bool isOk = false;
            string msgStr = "";
            try
            {
                if (IsShareTable)
                {
                    isOk = bus.Save(Header, Bodys, ref wq_id, true, true);
                }
                else
                {
                    isOk = bus.Save(Header, Bodys, ref wq_id, true, false);
                }
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }
            if (isOk == true)
            {
                DataTable nowHeader = bus.LoadHeader(wq_id);
                Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "', WQHeader:" + JsonClass.DataTable2Json(nowHeader) + "}");
            }
            else
            {
                Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "'}");
            }
            Response.End();
            //////wqb_id int identity(1,1),
            //result.WQHeader
        }

        //删除计件单
        if (action == "DeleteWQTable".ToUpper())
        {
            int wq_id = int.Parse(Request["wq_id"]);
            bool isOk = true;
            string msgStr = "";
            try
            {
                bus.Delete(wq_id);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }

            Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "'}");
            Response.End();
        }

        //LoadWQ

        //DeleteWQ
        ///单笔保存表身记录
        ///遇到是新单(wq_id==-1)生成单据
        if (action == "SaveOneWQB".ToUpper())
        {
            Dictionary<string, string> Header = new Dictionary<string, string>();
            int wq_id = -1;
            try
            {
                Header = GetWQHeader(Request);
                Header["size_id"] = (-1).ToString();
                Header["size"] = "";
                Header["color_id"] = (-1).ToString();
                wq_id = int.Parse(Header["wq_id"]);

                if (wq_id > 0)
                {
                    //以防表身日期与表头的不一致。
                    DataTable nowHeader = bus.LoadHeader(wq_id);
                    Header["jx_dd"] = nowHeader.Rows[0]["jx_dd"].ToString();
                }
            }
            catch (Exception ex)
            {
                Response.Write("{success:true,result:false,msg:'" + ex.Message.ToString() + "'}");
                Response.End();
            }

            Bus_Prdt_WPUP busUP = new Bus_Prdt_WPUP();
            Bus_Prdt_WP busWP = new Bus_Prdt_WP();
            int up_no = busUP.GetValidUpNo(Header["prd_no"], DateTime.Parse(Header["jx_dd"]), Header["user_dep_no"], Header["cus_no"]);
            if (up_no < 0)
            {
                Response.Write("{success:true, result:false, msg:'没有有效单价!'}");
                Response.End();
            }

            string prd_no = Header["prd_no"];
            string wp_no = Request["wp_no"];
            int size_id = int.Parse(Request["size_id"]);

            bool IsNewing = wq_id < 0;

            List<Dictionary<string, string>> ShareBodys = new List<Dictionary<string, string>>();
            DataTable dtPrdtWp_UP = busUP.LoadWpUP(prd_no, up_no);
            Dictionary<string, string> WQBodyRow = new Dictionary<string, string>();
            var upList = dtPrdtWp_UP.Select(" wp_no='" + wp_no + "'");
            if (upList.Length <= 0)
            {
                string wpName = busWP.LoadPrdtWp(prd_no, int.Parse(wp_no)).Rows[0]["name"].ToString();
                throw new Exception("异常:工序" + wpName + " 的单价不存在!");
            }
            Bus_PrdtWpColor busWpColor = new Bus_PrdtWpColor();
            DataTable dtProdtWp_UP_Color = busWpColor.GetColorPrice(Header["prd_no"], up_no);
            Bus_WorkPlan busWorkPlan = new Bus_WorkPlan();

            int color_id = busWorkPlan.GetColorId(size_id);

            int wqb_id = int.Parse(Request["wqb_id"]);
            WQBodyRow["wqb_id"] = wqb_id.ToString();
            WQBodyRow["wq_id"] = wq_id.ToString();
            WQBodyRow["size_id"] = Request["size_id"];
            WQBodyRow["jx_dd"] = Header["jx_dd"];
            WQBodyRow["jx_no"] = Header["jx_no"];
            WQBodyRow["itm"] = (-1).ToString();    //临时生成序号
            WQBodyRow["worker"] = "";
            WQBodyRow["prd_no"] = Header["prd_no"];
            WQBodyRow["wp_no"] = Request["wp_no"];

            WQBodyRow["qty_pic"] = decimal.Parse(Request["qty_pic"]).ToString();
            WQBodyRow["qty_pair"] = decimal.Parse(Request["qty_pair"]).ToString();

            DataRow wpRow = busWP.LoadPrdtWp(Header["prd_no"], int.Parse(Request["wp_no"])).Rows[0];
            WQBodyRow["up_pic"] = double.Parse(upList[0]["up_pic"].ToString()).ToString();
            WQBodyRow["up_pair"] = double.Parse(upList[0]["up_pair"].ToString()).ToString();

            bool useExpUp = wpRow["color_different_price"].ToString().ToLower() ==
                    "true" ? true : false;
            if (useExpUp)
            {
                if (color_id > 0)
                {
                    DataRow colorExpUP = Bus_WPQtyBySize.GetColorExpUP(dtProdtWp_UP_Color, Request["wp_no"], color_id);
                    if (colorExpUP != null)
                    {
                        WQBodyRow["up_pic"] = double.Parse(colorExpUP["up_pic"].ToString()).ToString();
                        WQBodyRow["up_pair"] = double.Parse(colorExpUP["up_pair"].ToString()).ToString();
                    }
                }
                //指定计件单号
                DataRow jxExpUp = Bus_WPQtyBySize.GetJXNoExpUP(dtProdtWp_UP_Color, WQBodyRow["wp_no"], Header["jx_no"]);
                if (jxExpUp != null)
                {
                    WQBodyRow["up_pic"] = double.Parse(jxExpUp["up_pic"].ToString()).ToString();
                    WQBodyRow["up_pair"] = double.Parse(jxExpUp["up_pair"].ToString()).ToString();
                }
            }

            WQBodyRow["inscrease_percent"] = decimal.Parse(Request["inscrease_percent"]).ToString();

            int shareBodyCnt = int.Parse(Request["bodyCnt"]);
            for (int i = 0; i < shareBodyCnt; i++)
            {
                var shareItem = new Dictionary<string, string>();
                shareItem["share_id"] = (-1).ToString();     //先删后插入
                shareItem["wq_id"] = wq_id.ToString();
                shareItem["wqb_id"] = wqb_id.ToString();

                shareItem["itm"] = i.ToString();
                shareItem["worker"] = Request["worker_" + i];
                shareItem["share_percent"] = decimal.Parse(Request["share_percent_" + i]).ToString();

                ShareBodys.Add(shareItem);
            }

            bool isOk = true;
            string msgStr = "";
            try
            {
                wq_id = bus.SaveBodyWithShare(Header, WQBodyRow, ShareBodys);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }
            if (isOk == true)
            {
                DataTable nowHeader = bus.LoadHeader(wq_id);
                Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "', WQHeader:" + JsonClass.DataTable2Json(nowHeader) + "}");
            }
            else
            {
                Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "'}");
            }
            Response.End();
        }

        if (action == "Delete".ToUpper())
        {
            int wq_id = int.Parse(Request["wq_id"]);
            bool isOk = true;
            string msgStr = "";
            try
            {
                bus.Delete(wq_id);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }


            if (isOk == true)
            {
                Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "'}");
            }
            else
            {
                Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "'}");
            }
        }

        if (action == "DeleteOneWQB".ToUpper())
        {
            int wq_id = int.Parse(Request["wq_id"]);
            int wqb_id = int.Parse(Request["wqb_id"]);

            bool isOk = true;
            string msgStr = "";
            try
            {
                bus.DeleteOneWQB(wq_id, wqb_id);
            }
            catch (Exception ex)
            {
                isOk = false;
                msgStr = ex.Message;
            }
            if (isOk == true)
            {
                DataTable nowHeader = bus.LoadHeader(wq_id);
                Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "', WQHeader:" + JsonClass.DataTable2Json(nowHeader) + "}");
            }
            else
            {
                Response.Write("{success:true,result:" + isOk.ToString().ToLower() + ",msg:'" + msgStr + "'}");
            }
        }


        if (action == "LoadWQBTable".ToUpper())
        {
            int wq_id = int.Parse(Request["wq_id"]);
            Response.Write(GetWQBTableJson(wq_id));
            Response.End();
        }
    }

    public Dictionary<string, string> GetWQHeader(HttpRequest Request)
    {
        Dictionary<string, string> Header = new Dictionary<string, string>();
        int wq_id = int.Parse(Request["wq_id"]);
        bool IsNewing = wq_id < 0;
        Header["wq_id"] = wq_id.ToString();
        Header["jx_no"] = Request["jx_no"];
        if (IsNewing && bus.ExsistJXNo(Header["jx_no"]))
        {
            throw new Exception("计薪单号已存在!");
        }

        Header["jx_dd"] = DateTime.Parse(Request["jx_dd"]).Date.ToString();
        Header["provider"] = Request["provider"];

        Header["plan_id"] = int.Parse(Request["plan_id"]).ToString();
        Header["plan_no"] = Request["plan_no"];
        Header["cus_no"] = GetPlanCusNo(int.Parse(Header["plan_id"]));
        Header["prd_no"] = Request["prd_no"];
        Header["size_id"] = int.Parse(Request["size_id"]).ToString();
        Header["size"] = Request["size"];
        Header["wp_dep_no"] = Request["wp_dep_no"];
        Header["user_dep_no"] = Request["user_dep_no"];

        Header["edit_ut"] = int.Parse(Request["edit_ut"]).ToString();  // --显示单位 1.对 2.个
        int color_id = -1;
        if (int.Parse(Request["size_id"]) >= 0)
        {
            Bus_WorkPlan busWorkPlan = new Bus_WorkPlan();
            color_id = busWorkPlan.GetColorId(int.Parse(Request["size_id"]));
        }
        Header["color_id"] = color_id.ToString(); //(-1).ToString();//
        Header["cal_inscrease"] = Request["cal_inscrease"].ToLower() == "true" ? "true" : "false";
        Header["table_type"] = Request["TableType"];
        bool isShare = bool.Parse(Request["IsShareTable"].ToLower());
        if (isShare)
        {
            Header["table_type"] = "计件分成非SY";
        }

        Header["n_man"] = NowUserId;
        Header["n_dd"] = DateTime.Now.ToString();
        Header["e_man"] = NowUserId;
        Header["e_dd"] = DateTime.Now.ToString();

        return Header;
    }


    public string GetPlanCusNo(int PlanId)
    {
        Bus_WorkPlan busPlan = new Bus_WorkPlan();
        Dictionary<string, string> dics = new Dictionary<string, string>();
        dics["plan_id"] = PlanId.ToString();
        return busPlan.SearchWorkPlan(dics).Rows[0]["cus_no"].ToString();
    }

    private string GetWQBTableJson(int wq_id)
    {
        List<DataTable> tbs = GetTables(wq_id);
        if (tbs[0].Rows.Count <= 0)
        {
            return "{success:true,result:false, msg:'单号不存在!'}";
        }

        string prd_no = tbs[0].Rows[0]["prd_no"].ToString();
        Bus_Prdt_WP busPrdtWP = new Bus_Prdt_WP();

        StringBuilder str = new StringBuilder();
        str.Append("{success:true,result:true, msg:''");
        str.Append(" ,Header:" + JsonClass.DataTable2Json(tbs[0]));
        str.Append(" ,Body:" + JsonClass.DataTable2Json(AttachSizeForBody(tbs[1])));
        str.Append(" ,BodyShare:" + JsonClass.DataTable2Json(tbs[2]));
        str.Append(" ,PrdtWP:" + JsonClass.DataTable2Json(busPrdtWP.LoadPrdtWp(prd_no)));
        str.Append("}");
        return str.ToString();
    }

    private List<DataTable> GetTables(int wq_id)
    {
        Bus_WPQtyBySize bus = new Bus_WPQtyBySize();
        List<DataTable> tbs = new List<DataTable>();
        tbs.Add(bus.LoadHeader(wq_id));
        tbs.Add(bus.LoadBody(wq_id));
        tbs.Add(bus.LoadBody_Share(wq_id));

        return tbs;
    }

    /// <summary>
    /// 在丝印表身显示 尺寸(颜色)
    /// </summary>
    /// <param name="dtOriginBody"></param>
    /// <returns></returns>
    private DataTable AttachSizeForBody(DataTable dtOriginBody)
    {
        dtOriginBody.Columns.Add("size");
        dtOriginBody.Columns.Add(new DataColumn("color_id"));
        foreach (DataRow item in dtOriginBody.Rows)
        {
            int size_id = int.Parse(item["size_id"].ToString());
            DataRow sizeInfo = GetSizeIdInfo(size_id);
            item["size"] = sizeInfo["size"].ToString();
            item["color_id"] = sizeInfo["color_id"].ToString();
        }
        return dtOriginBody;
    }

    private DataRow GetSizeIdInfo(int size_id)
    {
        Bus_WorkPlan bus = new Bus_WorkPlan();
        var dt = bus.LoadPlan_SizesBySizeId(size_id);
        if (dt.Rows.Count <= 0)
        {
            throw new Exception("计划行不存在!");
        }

        return dt.Rows[0];
    }


    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}
