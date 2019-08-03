using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using System.Data.SqlClient;
using SMS.DAL;
using SMS.DBHelper;
using SMS.Bus.SYS;
using SMS.Bus.SYS.Material;

namespace SMS.Bus
{
    public class Bus_WPQtyBySize
    {
        Dal_WPQtyBySize Dal;
        public Bus_WPQtyBySize()
        {
            Dal = new Dal_WPQtyBySize();
        }

        public bool ExsistJXNo(string jx_no)
        {
            return SqlHelper.ExecuteSql("select 1 from WPQty_H2 where jx_no = '" + jx_no + "'").Rows.Count > 0;
        }

        public void UpdateJxDD(int wq_id, DateTime newJxDD)
        {
            string sql = "  Update WPQty_H2 SET jx_dd = '"+ newJxDD.ToShortDateString() + "' Where wq_id = " + wq_id;
            string sql2 = " Update WPQty_B2 SET jx_dd = '" + newJxDD.ToShortDateString() + "' Where wq_id = " + wq_id;

            SqlCommand cmd1 = new SqlCommand(sql);
            SqlCommand cmd2= new SqlCommand(sql2);
            List<SqlCommand> cmds = new List<SqlCommand>();
            cmds.Add(cmd1);
            cmds.Add(cmd2);
            SqlHelper.ExecuteTransForList(cmds);
        }

        public bool Save(Dictionary<string, string> Header, List<Dictionary<string, string>> Bodys, ref int refWQ_ID, bool CopyHeaderSizeIdToBody, bool IsShareTable)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();
            int wq_id = int.Parse(Header["wq_id"]);
            refWQ_ID = wq_id;
            bool isNew = wq_id < 0;
            if (isNew)
            {
                try
                {
                    object obj = SqlHelper.ExecuteScalar(Dal.InsertHeaderCmd(Header).CommandText, null);
                    wq_id = int.Parse(obj.ToString());
                    refWQ_ID = wq_id;
                }
                catch(Exception ex)
                {
                    throw new Exception("数据库插入异常!"+ ex.Message.ToString());
                }

                for (int i = 0; i < Bodys.Count; i++)
                {
                    Bodys[i]["wq_id"] = wq_id.ToString();
                    Bodys[i]["itm"] = (i + 1).ToString();
                    if (CopyHeaderSizeIdToBody)
                    {
                        Bodys[i]["size_id"] = int.Parse(Header["size_id"]).ToString();  //12-10冗余
                    }

                    if (IsShareTable)
                    {
                        int newIngWQB_ID = Dal.GetNewBodyId();
                        Cmds.Add(Dal.UpdateBodyWithWqIdAndNotWorkerCmd(newIngWQB_ID, Bodys[i]));
                        Cmds.AddRange(_SyncInsertShare(newIngWQB_ID, Bodys[i]));
                    }
                    else
                    {
                        Cmds.Add(Dal.InsertBodyCmd(Bodys[i]));
                    }
                }
            }
            else
            {
                if (CheckHeader_ChangeAble(wq_id, Header) == false)
                    return false;

                Cmds.Add(Dal.UpdateHeaderCmd(Header));

                Cmds.Add(new SqlCommand(" Delete WPQty_B2_Share where wq_id=" + wq_id + ""));

                Cmds.Add(Dal.DeleteBodyCmd(wq_id, -1));

                for (int i = 0; i < Bodys.Count; i++)
                {
                    Bodys[i]["wq_id"] = wq_id.ToString();
                    Bodys[i]["itm"] = (i + 1).ToString();
                    if (CopyHeaderSizeIdToBody)
                    {
                        Bodys[i]["size_id"] = int.Parse(Header["size_id"]).ToString();  //12-10冗余
                    }

                    if (IsShareTable)
                    {
                        int newIngWQB_ID = Dal.GetNewBodyId();
                        Cmds.AddRange(_SyncInsertShare(newIngWQB_ID, Bodys[i]));
                        Cmds.Add(Dal.UpdateBodyWithWqIdAndNotWorkerCmd(newIngWQB_ID, Bodys[i]));
                    }
                    else
                    {
                        Cmds.Add(Dal.InsertBodyCmd(Bodys[i]));
                    }
                }
            }

            return SqlHelper.ExecuteTransWithCollections(Cmds);
        }

        private List<SqlCommand> _SyncInsertShare(int wqb_id, Dictionary<string, string> Body)
        {
            string worker1 = Body["worker"].ToString();
            string worker2 = Body["worker2"].ToString();
            Dictionary<string, string> res = new Dictionary<string, string>();
            res["wq_id"] = Body["wq_id"];
            res["wqb_id"] = wqb_id.ToString();
            res["itm"] = 1.ToString();
            res["worker"] = worker1;

            Dictionary<string, string> res2 = new Dictionary<string, string>();
            res2["wq_id"] = Body["wq_id"];
            res2["wqb_id"] = wqb_id.ToString();
            res2["itm"] = 2.ToString();
            res2["worker"] = worker2;

            List<SqlCommand> Cmds = new List<SqlCommand>();

            if (string.IsNullOrEmpty(worker2))
            {
                res["share_percent"] = "100";
                Cmds.Add(Dal.InsertBody2_ShareCmd(res));
            }
            else
            {
                decimal percent1 = decimal.Parse(Body["share_percent1"]);
                decimal percent2 = decimal.Parse(Body["share_percent2"]);
                res["share_percent"] = percent1.ToString();
                res2["share_percent"] = percent2.ToString();
                Cmds.Add(Dal.InsertBody2_ShareCmd(res));
                Cmds.Add(Dal.InsertBody2_ShareCmd(res2));
            }
            return Cmds;
        }
         

        /// <summary>
        /// 单笔保存计件行 
        /// </summary>
        /// <param name="Header"></param>
        /// <param name="Body"></param>
        /// <param name="BodyShares"></param>
        /// <returns>wq_id</returns>
        public int SaveBodyWithShare(Dictionary<string, string> Header, Dictionary<string, string> Body, List<Dictionary<string, string>> BodyShares)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();
            int wq_id = int.Parse(Header["wq_id"]);
            bool isNewTable = wq_id < 0;
            if (isNewTable)
            {
                try
                {
                    object obj = SqlHelper.ExecuteScalar(Dal.InsertHeaderCmd(Header).CommandText, null);
                    wq_id = int.Parse(obj.ToString());
                }
                catch(Exception ex)
                {
                    throw new Exception("数据库插入异常!" + ex.Message.ToString());
                }
            }
            else
            {
                CheckHeader_ChangeAble(wq_id, Header);
      
                Cmds.Add(Dal.UpdateHeaderOnWQBCmd(Header));
            }


            int wqb_id = int.Parse(Body["wqb_id"]);
            bool isNewRow = wqb_id < 0;
            if (isNewRow)
            {
                Body["wq_id"] = wq_id.ToString();
                
                //增加最大的Itm
                Body["itm"] = NewWQBItm(wq_id).ToString();

                Body["size_id"] = int.Parse(Body["size_id"]).ToString();  //12-10冗余

                object wqb_idObj = SqlHelper.ExecuteScalar(Dal.InsertBodyCmd(Body).CommandText, null);
                wqb_id = int.Parse(wqb_idObj.ToString());

                for (int i = 0; i < BodyShares.Count; i++)
                {
                    BodyShares[i]["wq_id"] = wq_id.ToString();
                    BodyShares[i]["wqb_id"] = wqb_id.ToString();
                    Cmds.Add(Dal.InsertBody2_ShareCmd(BodyShares[i]));
                }
            }
            else
            {
                ExsistWQB(wq_id, wqb_id);
               

                Cmds.Add(Dal.UpdateBodyCmd(wq_id, wqb_id,  Body));

                Cmds.Add(Dal.DeleteBody2_ShareCmd(wq_id, wqb_id));
                for (int i = 0; i < BodyShares.Count; i++)
                {
                    BodyShares[i]["wq_id"] = wq_id.ToString();
                    BodyShares[i]["wqb_id"] = wqb_id.ToString();
                    Cmds.Add(Dal.InsertBody2_ShareCmd(BodyShares[i]));
                }
            }

            SqlHelper.ExecuteTransWithCollections(Cmds);
            return wq_id;
        }


        /// <summary>
        /// 附加上基本工序分成比例
        /// </summary>
        /// <param name="wq_id"></param>
        /// <param name="dtBody"></param>
        /// <param name="worker1"></param>
        /// <param name="worker2"></param>
        /// <param name="percent1"></param>
        /// <param name="percent2"></param>
        /// <returns></returns>
        public List<SqlCommand> AttachWQBodyShare(int wq_id, DataTable dtBody, string worker1, string worker2, decimal percent1, decimal percent2)
        {
            if (string.IsNullOrEmpty(worker1))
            {
                throw new Exception("主手没有设置!");
            }

            if (!string.IsNullOrEmpty(worker2))
            {
                if ((percent1 + percent2) != 100)
                {
                    throw new Exception("工序基本工资,分成比例和不等于100");
                }
            }
            
            List<SqlCommand> Cmds = new List<SqlCommand>();
            Cmds.Add(new SqlCommand(" Delete WPQty_B2_Share where wq_id=" + wq_id));

            List<Dictionary<string, string>> allRes = new List<Dictionary<string, string>>();
            foreach (DataRow row in dtBody.Rows)
            {
                Dictionary<string, string> res = new Dictionary<string, string>();
                res["wq_id"] = wq_id.ToString();
                res["wqb_id"] = int.Parse(row["wqb_id"].ToString()).ToString();
                res["itm"] = 1.ToString();
                res["worker"] = worker1;
                res["share_percent"] = percent1.ToString();
                Cmds.Add(Dal.InsertBody2_ShareCmd(res));

                if (!string.IsNullOrEmpty(worker2))
                {
                    Dictionary<string, string> res2 = new Dictionary<string, string>();
                    res2["wq_id"] = wq_id.ToString();
                    res2["wqb_id"] = int.Parse(row["wqb_id"].ToString()).ToString();
                    res2["itm"] = 2.ToString();
                    res2["worker"] = worker2;
                    res2["share_percent"] = percent2.ToString();
                    Cmds.Add(Dal.InsertBody2_ShareCmd(res2));
                }
            }

            return Cmds;
        }
        

        public bool CheckHeader_ChangeAble(int wq_id, Dictionary<string, string> Header)
        {
            DataTable dtHeader = LoadHeader(wq_id);
            if (dtHeader.Rows.Count <= 0)
            {
                throw new Exception("异常,单据已被删除!");
            }
            //不允许更改
            //sql += " cus_no = '" + model["cus_no"] + "'";
            //sql += " plan_id = '" + model["plan_id"] + "'";
            //sql += ", plan_no = '" + model["plan_no"] + "'"; 
            //sql += ", prd_no = '" + model["prd_no"] + "'";
            
            //这个栏位从plan_no带出来, 检查plan_no单就可以了
            //if(dtHeader.Rows[0]["cus_no"].ToString() != Header["cus_no"]) {
            //    throw new Exception("不允许修改客户!");
            //}
            if (dtHeader.Rows[0]["plan_id"].ToString() != Header["plan_id"])
            {
                throw new Exception("不允许修改计划单计划号!");
            }
            if (dtHeader.Rows[0]["size_id"].ToString() != Header["size_id"])
            {
                throw new Exception("不允许修改计划单计划尺寸!");
            }
            //if (dtHeader.Rows[0]["plan_no"].ToString() != Header["plan_no"])
            //{
            //    throw new Exception("不允许修改计划单的计划号!");
            //}
            if (dtHeader.Rows[0]["prd_no"].ToString() != Header["prd_no"])
            {
                throw new Exception("不允许修改计薪货号!");
            }

            return true;
        }

        public void ExsistWQB(int wq_id, int wqb_id)
        {
            DataTable dt = LoadBody(wq_id);
            if(dt.Rows.Count <= 0)
            {
                throw new Exception("计件单不存在~不能更新! 请联系吖潮");
            }

            var rows = dt.Rows.Cast<DataRow>().Where(o => int.Parse(o["wqb_id"].ToString()) == wqb_id).ToList();
            if(rows.Count() <= 0)
            {
                throw new Exception("计件行不存在~不能更新! 请联系吖潮");
            }

            if(wq_id != int.Parse(rows[0]["wq_id"].ToString())){
                throw new Exception("计件单与行信息对不上! 不能更新! 请联系吖潮");
            }
        }

        public int NewWQBItm(int wq_id)
        {
            DataTable dt = LoadBody(wq_id);
            if (dt.Rows.Count <= 0)
            {
                return 0;
            }

            return dt.Rows.Cast<DataRow>().Max(o => int.Parse(o["itm"].ToString())) + 1;
        }


        /// <summary>
        /// 更新计件的单价, 在工序单价修改时调用,
        ///   注意:不更新结账日期前的单价
        /// </summary>
        /// <param name="prd_no"></param>
        /// <param name="errWps">返回更新不成功的计件单号</param>
        /// <returns></returns>
        public void UpdateWpPrice(string prd_no, ref List<string> allWps, ref List<string> errWps)
        {
            Bus_SysVar busSysVar = new Bus_SysVar();
            //结账前的单不更新
            DateTime FreezeDate = busSysVar.GetFreezeDate();
            DataTable dtWP = (new Bus_Prdt_WP()).GetPrdtWpNos(prd_no, false, new List<string>());

            Dictionary<string, string> searchWpParams = new Dictionary<string, string>();
            searchWpParams["S_jx_dd"] = FreezeDate.ToShortDateString();
            searchWpParams["prd_no"] = prd_no;

            DataTable NeedUpdateWPTables = SearchHeader(searchWpParams);
            //所有审核通过的调价申请,优化级最高
            DataTable dtPassedAskPrice = Bus_CheckHelper.GetPassAskPrice("");

            Bus_Prdt_WPUP busUP = new Bus_Prdt_WPUP();
            Bus_WorkPlan busWorkPlan = new Bus_WorkPlan();
            Dictionary<string, DataTable> LoadedUp = new Dictionary<string, DataTable>();
            for (int i = 0; i < NeedUpdateWPTables.Rows.Count; i++)
            {
                var WpHeader = NeedUpdateWPTables.Rows[i];
                DateTime jx_dd = DateTime.Parse(WpHeader["jx_dd"].ToString());
                int wq_id = int.Parse(WpHeader["wq_id"].ToString());
                string jx_no = WpHeader["jx_no"].ToString();
                string plan_no = WpHeader["plan_no"].ToString();
                string user_dep_no = WpHeader["user_dep_no"].ToString();
                string cus_no = WpHeader["cus_no"].ToString();
                int edit_ut = int.Parse(WpHeader["edit_ut"].ToString());

                //确定单价组
                int up_no = busUP.GetValidUpNo(prd_no, jx_dd, user_dep_no, cus_no);
                allWps.Add(jx_no);
                if (up_no < 0)
                {
                    errWps.Add(jx_no);
                    continue;
                }

                //缓存单价表,防多次重复读取
                DataTable dtPrdtWp_UP = null;
                if (LoadedUp.ContainsKey(up_no.ToString()) == true)
                    dtPrdtWp_UP = LoadedUp[up_no.ToString()];
                else {
                    dtPrdtWp_UP = busUP.LoadWpUP(prd_no, up_no);
                    LoadedUp.Add(up_no.ToString(), dtPrdtWp_UP);
                }

                Bus_PrdtWpColor busWpColor = new Bus_PrdtWpColor();
                DataTable dtPrdtWp_UP_Color = busWpColor.GetColorPrice(prd_no, up_no);
                //加载原计件单内容,一一更新
                //dtPrdtWp_UP
                List<SqlCommand> Cmds = new List<SqlCommand>();
                DataTable dtBody = LoadBody(wq_id);
                for (int j = 0; j < dtBody.Rows.Count; j++)
                {
                    int wqb_id = int.Parse(dtBody.Rows[j]["wqb_id"].ToString());
                    int size_id = int.Parse(dtBody.Rows[j]["size_id"].ToString());
                    string wp_no = dtBody.Rows[j]["wp_no"].ToString();

                    var wpList = dtWP.Select(" wp_no='" + wp_no + "'");
                    //更新改变了的单价(个,对)
                    var upList = dtPrdtWp_UP.Select(" wp_no='" + wp_no + "'");
                    if (upList.Length <= 0 || wpList.Length <= 0)
                    {
                        errWps.Add(plan_no);
                        continue;
                    }

                    #region 颜色-单价
                    double new_up_pic = double.Parse(upList[0]["up_pic"].ToString());
                    double new_up_pair = double.Parse(upList[0]["up_pair"].ToString());
                    bool color_different_price = (wpList[0]["color_different_price"].ToString().ToLower() == "true" ? true : false);
                    if (color_different_price)
                    {
                        List<double> nowPriceUps = GetPriceUPs(wp_no, jx_no, busWorkPlan.GetColorId(size_id), upList[0], dtPrdtWp_UP_Color);
                        new_up_pic = nowPriceUps[0];  // double.Parse(upList[0]["up_pic"].ToString());
                        new_up_pair = nowPriceUps[1]; // double.Parse(upList[0]["up_pair"].ToString());
                    }
                    #endregion

                    #region 审核通过的调价-单价
                    var passAskPrice = dtPassedAskPrice.AsEnumerable()
                        .Where(o => o["jx_no"].ToString() == jx_no && o["prd_no"].ToString() == prd_no && o["wp_no"].ToString() == wp_no)
                        .FirstOrDefault();

                    if (passAskPrice != null)
                    {
                        new_up_pic = double.Parse(passAskPrice["ask_up_pic"].ToString());
                        new_up_pair = double.Parse(passAskPrice["ask_up_pair"].ToString());
                    }
                    #endregion

                    double origin_up_pic = double.Parse(dtBody.Rows[j]["up_pic"].ToString());
                    double origin_up_pair = double.Parse(dtBody.Rows[j]["up_pair"].ToString());
                    if (new_up_pic != origin_up_pic || new_up_pair != origin_up_pair)
                    {
                        Cmds.Add(new SqlCommand(" Update WPQty_B2 set up_pic = " + new_up_pic + ", up_pair=" + new_up_pair 
                            + " where wq_id=" + wq_id + " and wqb_id=" + wqb_id));
                    }

                    double origin_qty_pic = double.Parse(dtBody.Rows[j]["qty_pic"].ToString());
                    double origin_qty_pair = double.Parse(dtBody.Rows[j]["qty_pair"].ToString());


                    //更新计件表的数量
                    // edit_ut 工序pic_num
                    double newPicQty = 0.00;
                    double newPairQty = 0.00;
                    double newPicNum = double.Parse(wpList[0]["pic_num"].ToString());
                    ////1.对, 2.个
                    if (edit_ut == 1)
                    {
                        newPairQty = origin_qty_pair;

                        newPicQty = newPairQty * newPicNum;
                    }
                    else if (edit_ut == 2)
                    {
                        newPicQty = origin_qty_pic;

                        newPairQty = newPicQty / newPicNum;
                    }

                    if (newPicQty != origin_qty_pic || newPairQty != origin_qty_pair)
                    {
                        Cmds.Add(new SqlCommand(" Update WPQty_B2 set qty_pic = " + newPicQty + ", qty_pair=" + newPairQty
                            + " where wq_id=" + wq_id + " and wqb_id=" + wqb_id));
                    }
                }
                SqlHelper.ExecuteTransWithCollections(Cmds);
            }
            return;
        }


        /// <summary>
        /// 取几个因素下合适的单价
        /// 优化顺序以高到低
        ///    1 指定计件单件的例外
        ///    2 指定颜色的例外
        ///    3 原来单价
        /// </summary>
        /// <param name="wp_no"></param>
        /// <param name="jx_no"></param>
        /// <param name="color_id"></param>
        /// <param name="drOriginalPrdtUt"></param>
        /// <param name="dtPrdtUP_Exp"></param>
        /// <returns></returns>
        private List<double> GetPriceUPs(string wp_no, string jx_no, int color_id, DataRow drOriginalPrdtUt, DataTable dtPrdtUP_Exp)
        {
            double up_pic = double.Parse(drOriginalPrdtUt["up_pic"].ToString());
            double up_pair = double.Parse(drOriginalPrdtUt["up_pair"].ToString());
            
            if (color_id > 0)
            {
                DataRow colorUP = GetColorExpUP(dtPrdtUP_Exp, wp_no, color_id);
                if (colorUP != null)
                {
                    up_pic = double.Parse(colorUP["up_pic"].ToString());
                    up_pair = double.Parse(colorUP["up_pair"].ToString());
                }
            }

            DataRow jxExpUp = GetJXNoExpUP(dtPrdtUP_Exp, wp_no, jx_no);
            if (jxExpUp != null)
            {
                up_pic = double.Parse(jxExpUp["up_pic"].ToString());
                up_pair = double.Parse(jxExpUp["up_pair"].ToString());
            }
            return new List<double>() { up_pic, up_pair};
        }

        public static DataRow GetColorExpUP(DataTable dtProdtWp_UP_Color, string wp_no, int color_id)
        {
            DataRow colorUPs = null;
            if (color_id >= 0 && dtProdtWp_UP_Color.Rows.Count > 0)
            {
                List<DataRow> colorUpRows = dtProdtWp_UP_Color.Rows.Cast<DataRow>()
                            .Where(r => r["wp_no"].ToString() == wp_no
                                && int.Parse(r["color_id"].ToString()) == color_id).ToList();

                if (colorUpRows.Count >= 2)
                {
                    throw new Exception("异常:颜色例外单价有多条!");
                }
                if (colorUpRows.Count == 1)
                {
                    colorUPs = colorUpRows[0];
                }
            }
            return colorUPs;
        }

        public static DataRow GetJXNoExpUP(DataTable dtProdtWp_UP_Color, string wp_no, string jx_no)
        {
            DataRow colorUPs = null;
            if (!string.IsNullOrEmpty(jx_no) && dtProdtWp_UP_Color.Rows.Count > 0)
            {
                List<DataRow> colorUpRows = dtProdtWp_UP_Color.Rows.Cast<DataRow>()
                            .Where(r => r["wp_no"].ToString() == wp_no
                                && (r["sign_in_jx_nos"].ToString().Split(',').ToList().IndexOf(jx_no) >= 0)).ToList();

                if (colorUpRows.Count >= 2)
                {
                    throw new Exception("异常:指定单号" + jx_no + "的例外单价有多条!");
                }
                if (colorUpRows.Count == 1)
                {
                    colorUPs = colorUpRows[0];
                }
            }

            return colorUPs;
        }


        #region 删除

        public void Delete(int wq_id)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();
            Cmds.Add(new SqlCommand(string.Format(" Delete WPQty_H2_ShareMaterial where wq_id = {0}", wq_id)));
            Cmds.Add(new SqlCommand(string.Format(" Delete WPQty_B2_Share where wq_id = {0}", wq_id)));
            Cmds.Add(new SqlCommand(string.Format(" Delete WPQty_B2       where wq_id = {0} ", wq_id)));
            Cmds.Add(new SqlCommand(string.Format(" Delete WPQty_H2       where wq_id = {0} ", wq_id)));
            SqlHelper.ExecuteTransWithCollections(Cmds);
        }

        public void DeleteOneWQB(int wq_id, int wqb_id)
        {
            List<SqlCommand> Cmds = new List<SqlCommand>();
            Cmds.Add(new SqlCommand(string.Format(" Delete WPQty_B2_Share where wq_id = {0} and wqb_id={1}", wq_id, wqb_id)));
            Cmds.Add(new SqlCommand(string.Format(" Delete WPQty_B2       where wq_id = {0} and wqb_id={1}", wq_id, wqb_id)));
            SqlHelper.ExecuteTransWithCollections(Cmds);
        }


        #endregion


        #region 加载数据

        public static DataRow GetHeaderByJX(string jx_no)
        {
            var dt = SqlHelper.ExecuteSql("select * from WPQty_H2 where jx_no = '" + jx_no + "'");
            if (dt.Rows.Count > 0)
                return dt.Rows[0];
            else
                return null;
        }

        public DataTable SearchHeader(Dictionary<string, string> searchModel)
        {
            return Dal.SearchHeader(searchModel);
        }

        /// <summary>
        /// 皮奖单的查询
        /// </summary>
        /// <returns></returns>
        public DataTable SearchHeaderOnPJ(Dictionary<string, string> searchModel)
        {
            return Dal.SearchHeaderOnPJ(searchModel);  
        }

        //
        /// <summary>
        /// 皮奖表身没有计划行信息. 本方法补上该信息.
        /// </summary>
        /// <param name="searchModel"></param>
        /// <returns></returns>
        public DataTable HeaderPJAttachSizeInfo(DataTable dtHeaderPJ, List<string> SearchWorkers, bool Worker交集)
        {
            DataTable dtClone = dtHeaderPJ.Clone();

            Bus_WpQtyMaterial busWShareMaterail = new Bus_WpQtyMaterial();
            for (int i = 0; i < dtHeaderPJ.Rows.Count; i++)
            {
                var row = dtHeaderPJ.Rows[i];
                int wq_id = int.Parse(row["wq_id"].ToString());

                List<string> workers = busWShareMaterail.GetWQWorker(wq_id);
                if(SearchWorkers.Count > 0)
                {
                    if (Worker交集 == false)
                    {
                        if(workers.Intersect(SearchWorkers).Count() <= 0)
                        {
                            continue;
                        }
                    }
                    else
                    {
                        if (workers.Except(SearchWorkers).Count() > 0)
                        {
                            continue;
                        }
                    }
                }

                DataTable dtBody = LoadBody(wq_id);
                List<int> size_ids = dtBody.AsEnumerable().Select(o => int.Parse(o["size_id"].ToString())).Distinct().ToList();
                List<string> planNos = new List<string>();
                string prd_no = string.Join(",", dtBody.AsEnumerable().Select(o => o["prd_no"].ToString()).Distinct().ToList());
                Bus_WorkPlan busWorkPlan = new Bus_WorkPlan();
                for (int j = 0; j < size_ids.Count; j++)
                {
                    planNos.Add( busWorkPlan.LoadPlan_SizesBySizeId(size_ids[j]).Rows[0]["plan_no"].ToString());
                }
                
                string plan_no = string.Join(",", planNos.Distinct());

                row["n_man"] = string.Join(",", workers);
                row["plan_no"] = plan_no;
                row["prd_no"] = prd_no;

                dtClone.Rows.Add(row.ItemArray);
            }

            return dtClone;
        }

        public DataTable LoadHeader(int wq_id)
        {
            Dictionary<string, string> searchModel = new Dictionary<string, string>();
            searchModel["wq_id"] = wq_id.ToString();

            return Dal.SearchHeader(searchModel);
        }

        public DataTable LoadBody(int wq_id)
        {
            return Dal.LoadBody(wq_id);
        }

        public DataTable LoadBody(string plan_no, string wp_dep_no, string user_dep_no, DateTime? isSumByPlanView_StartDD, DateTime? isSumByPlanView_EndDD)
        {
            return Dal.LoadBody(plan_no, wp_dep_no, user_dep_no, isSumByPlanView_StartDD, isSumByPlanView_EndDD);
        }

        public DataTable LoadBody_Share(int wq_id)
        {
            return Dal.LoadBody_Share(wq_id);
        }

        public DataTable LoadComboboxPlanSize_Data(string planOrPrdt, int page, int pageSize)
        {
            //SELECT w2.n, w1.* FROM ARTICLE w1,
            //    (SELECT TOP 1030 row_number() OVER(ORDER BY YEAR DESC, ID DESC) n, ID FROM ARTICLE)
            
            //w2 WHERE w1.ID = w2.ID AND w2.n > 1000 ORDER BY w2.n ASC

            string sql = "Select {0} row_number() OVER(order by deliver_dd desc, S.plan_no, S.itm) as rownum, S.*, convert(varchar(100), H.deliver_dd, 111) as deliver_dd, H.prd_no from WorkPlan_Sizes S ";
            sql += " INNER JOIN WorkPlan H ON S.plan_id = H.plan_id ";
            if(string.IsNullOrEmpty(planOrPrdt.Trim()))
                sql += " where 1=1";
            else
                sql += " where (S.plan_no like '%" + planOrPrdt.Trim() + "%') or (H.prd_no like '%" + planOrPrdt.Trim() + "%')";
            sql += " order by deliver_dd desc, S.plan_no, S.itm ";

            int s = (page - 1) * pageSize;
            int e = s + pageSize;
            string sqlPaging = string.Format(" select * from (" + string.Format(sql, "Top " + e) + ") as T Where T.rownum >= {0} and T.rownum<={1}", s, e);

            return SqlHelper.ExecuteSql(sqlPaging);
        }

        public DataTable GetWQTotal(int size_id)
        {
            return Dal.GetWQTotal(size_id);
        }

        public DataTable GetWQTotalOnAllSize(int plan_id)
        {
            return Dal.GetWQTotalOnAllSize(plan_id);
        }


        public DataTable GetWQTotalOnAllSize(int plan_id, string user_dep_no)
        {
            //size_id, [qty_pic, qty_pair]
            string sql = "select ";
            sql += " B.prd_no, ";
            sql += " B.wp_no, ";
            sql += " sum(isnull(B.qty_pic, 0.00)) as qty_pic, ";
            sql += " sum(isnull(B.qty_pair, 0.00)) as qty_pair ";
            sql += " from WPQty_B2 B ";
            sql += " inner join WPQty_H2 H on H.wq_id = B.wq_id ";
            sql += " where H.plan_id = " + plan_id + " and H.user_dep_no = '" + user_dep_no + "'";
            sql += " group by B.prd_no, B.wp_no";

            return SqlHelper.ExecuteSql(sql);
        }

        #endregion


    }
}
