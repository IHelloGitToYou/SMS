using SMS.DBHelper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;

namespace SMS.DAL
{
    public class Dal_WPQtyBySize
    {
        //WPQty_H2
        //wq_id int identity(1,1),	
        //jx_no[varchar](40) NOT NULL,
        //jx_dd[datetime] not NULL,
        //provider[varchar](40) NULL,
        //cus_no varchar(40) not null,

        //plan_id int not null,
        //plan_no varchar(40) not null,
        //prd_no[varchar](40) NULL,
        //size_id varchar(40) not null,
        //size varchar(10) not null,
        //wp_dep_no[varchar](40) NULL,
        //user_dep_no[varchar](40) NULL,

        //n_man[varchar](40) NULL,
        //n_dd[datetime] NULL,
        //e_man[varchar](40) NULL,
        //e_dd[datetime] NULL,

        //插入  修改   删除
        //查询 
        //加载
        public SqlCommand InsertHeaderCmd(Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = "Insert WPQty_H2(jx_no, jx_dd, provider, cus_no, plan_id, plan_no, prd_no, size_id, size, wp_dep_no, user_dep_no, edit_ut, color_id, cal_inscrease,table_type, n_man, n_dd) ";
            sql += " values(";
            sql += "   '" + model["jx_no"] + "'";
            sql += ",  '" + DateTime.Parse(model["jx_dd"]).Date.ToString() + "'";
            sql += ",  '" + model["provider"] + "'";
            sql += ",  '" + model["cus_no"] + "'";
            sql += ",  " + int.Parse(model["plan_id"]).ToString() + "";
            sql += ",  '" + model["plan_no"] + "'";

            sql += ",  '" + model["prd_no"] + "'";
            sql += ",  '" + int.Parse(model["size_id"]).ToString() + "'";
            sql += ",  '" + model["size"] + "'";
            sql += ",  '" + model["wp_dep_no"] + "'";
            sql += ",  '" + model["user_dep_no"] + "'";
            sql += ",  '" + int.Parse(model["edit_ut"]).ToString() + "'";
            sql += ",  '" + int.Parse(model["color_id"]).ToString() + "'";
            sql += ",  '" + model["cal_inscrease"] + "'";
            sql += ",  '" + model["table_type"] + "'";
            sql += ",  '" + model["n_man"] + "'";
            sql += ",  GetDate()";
            sql += ") select @@identity";  //wq_id

            cmd.CommandText = sql;
            return cmd;
        }


        public SqlCommand DeleteHeaderCmd(int wq_id)
        {
            return new SqlCommand("Delete WPQty_H2 where wq_id= " + wq_id);
        }

        public SqlCommand UpdateHeaderCmd(Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = " Update WPQty_H2 set ";
            sql += " jx_no = '" + model["jx_no"] + "'";
            sql += " ,jx_dd = '" + DateTime.Parse(model["jx_dd"]).Date.ToString() + "'";
            sql += " ,provider = '" + model["provider"] + "'";

            //不允许更改
            //sql += " cus_no = '" + model["cus_no"] + "'";
            //sql += " plan_id = '" + model["plan_id"] + "'";
            //sql += ", plan_no = '" + model["plan_no"] + "'"; 
            //sql += ", prd_no = '" + model["prd_no"] + "'";
            sql += ", size_id = '" + model["size_id"] + "'";
            sql += ", size = '" + model["size"] + "'";
            sql += ", wp_dep_no = '" + model["wp_dep_no"] + "'";
            sql += ", user_dep_no = '" + model["user_dep_no"] + "'";
            sql += ", edit_ut = '" + int.Parse(model["edit_ut"]).ToString() + "'";
            sql += ", color_id = '" + int.Parse(model["color_id"]).ToString() + "'";
            sql += ", cal_inscrease = '" + model["cal_inscrease"] + "'";
            //table_type 不会变更
            sql += ", e_man = '" + model["e_man"] + "'";
            sql += ", e_dd = GETDATE()";
            sql += " where wq_id = " + model["wq_id"];

            cmd.CommandText = sql;
            return cmd;
        }


        public SqlCommand UpdateHeaderOnWQBCmd(Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = " Update WPQty_H2 set ";
              
            sql += "  size_id = '-1'";
            sql += ", size = ''";
            sql += ", wp_dep_no = '" + model["wp_dep_no"] + "'";
            sql += ", user_dep_no = '" + model["user_dep_no"] + "'";
            ///sql += ", edit_ut = '" + int.Parse(model["edit_ut"]).ToString() + "'";
            //sql += ", color_id = '" + int.Parse(model["color_id"]).ToString() + "'";
            sql += ", cal_inscrease = 'true'";
            //table_type 不会变更
            sql += ", e_man = '" + model["e_man"] + "'";
            sql += ", e_dd = GETDATE()";
            sql += " where wq_id = " + model["wq_id"];

            cmd.CommandText = sql;
            return cmd;
        }

        
        //WPQty_B2
        //wqb_id int identity(1,1),
        //wq_id int not null,
        //jx_dd datetime not NULL,
        //itm int not null,
        //worker varchar(40) not null,
        //prd_no varchar(40) not null,
        //wp_no varchar(40) not null,
        //qty_pic int not null default 0,  --只能依'对'录入

        //插入  修改   删除
        //查询 
        //加载
        #region Body操作

        public int GetNewBodyId()
        {
            string sql = "Insert WPQty_B2(wq_id,size_id, jx_dd,itm,worker, prd_no,wp_no,qty_pic,qty_pair) values(-1,-1, '1900-01-01',-1,'','','',-1,-1) select @@identity";
            object obj = SqlHelper.ExecuteScalar(sql);
            return int.Parse(obj.ToString());
        }

        public SqlCommand InsertBodyCmd(Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = "Insert WPQty_B2(wq_id, size_id, jx_dd, itm, worker, prd_no, wp_no, qty_pic, qty_pair, up_pic, up_pair, inscrease_percent)";
            sql += " values(";
            sql += "   " + int.Parse(model["wq_id"]).ToString() + "";
            sql += ",  " + int.Parse(model["size_id"]).ToString() + "";
            sql += ",  '" + DateTime.Parse(model["jx_dd"]).Date.ToString() + "'";
            sql += ",  " + int.Parse(model["itm"]).ToString() + "";
            sql += ",  '" + model["worker"] + "'";
            sql += ",  '" + model["prd_no"] + "'";
            sql += ",  '" + model["wp_no"] + "'";
            sql += ",  " + decimal.Parse(model["qty_pic"]).ToString() + "";
            sql += ",  " + decimal.Parse(model["qty_pair"]).ToString() + "";
            sql += ",  " + decimal.Parse(model["up_pic"]).ToString() + "";
            sql += ",  " + decimal.Parse(model["up_pair"]).ToString() + "";
            sql += ",  " + decimal.Parse(model["inscrease_percent"]).ToString() + "";  

            sql += ") select @@identity";  //wq_id

            cmd.CommandText = sql;
            return cmd;
        }

        public SqlCommand UpdateBodyWithWqIdAndNotWorkerCmd(int wqb_id, Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = "Update WPQty_B2  ";
            sql += " set ";
            sql += " wq_id = " + int.Parse(model["wq_id"]).ToString() + "";
            sql += ", size_id = " + int.Parse(model["size_id"]).ToString() + "";
            sql += ", jx_dd = '" + DateTime.Parse(model["jx_dd"]).Date.ToString() + "'";
            //sql += ", itm =  " + int.Parse(model["itm"]).ToString() + "";
            sql += ", worker = ''";
            sql += ", prd_no = '" + model["prd_no"] + "'";
            sql += ", wp_no ='" + model["wp_no"] + "'";
            sql += ", qty_pic = " + decimal.Parse(model["qty_pic"]).ToString() + "";
            sql += ", qty_pair= " + decimal.Parse(model["qty_pair"]).ToString() + "";
            sql += ", up_pic= " + decimal.Parse(model["up_pic"]).ToString() + "";
            sql += ", up_pair= " + decimal.Parse(model["up_pair"]).ToString() + "";
            sql += ", inscrease_percent= " + decimal.Parse(model["inscrease_percent"]).ToString() + "";
            sql += " where wqb_id =" + wqb_id.ToString();

            cmd.CommandText = sql;
            return cmd;
        }


        public SqlCommand UpdateBodyCmd(int wq_id, int wqb_id,  Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = "Update WPQty_B2  ";
            sql += " set " ;
            sql += " size_id = " + int.Parse(model["size_id"]).ToString() + "";
            sql += ", jx_dd = '" + DateTime.Parse(model["jx_dd"]).Date.ToString() + "'";
            //sql += ", itm =  " + int.Parse(model["itm"]).ToString() + "";
            sql += ", worker = '" + model["worker"] + "'";
            sql += ", prd_no = '" + model["prd_no"] + "'";
            sql += ", wp_no ='" + model["wp_no"] + "'";
            sql += ", qty_pic = " + decimal.Parse(model["qty_pic"]).ToString() + "";
            sql += ", qty_pair= " + decimal.Parse(model["qty_pair"]).ToString() + "";
            sql += ", up_pic= " + decimal.Parse(model["up_pic"]).ToString() + "";
            sql += ", up_pair= " + decimal.Parse(model["up_pair"]).ToString() + "";
            sql += ", inscrease_percent= " + decimal.Parse(model["inscrease_percent"]).ToString() + "";
            sql += " where wq_id = " + wq_id.ToString() 
                + " and wqb_id =" + wqb_id.ToString();

            cmd.CommandText = sql;
            return cmd;
        }
        public SqlCommand DeleteBodyCmd(int wq_id, int wqb_id)
        {
            if (wqb_id < 0)
                return new SqlCommand("Delete WPQty_B2 where wq_id= " + wq_id);
            else
                return new SqlCommand("Delete WPQty_B2 where wq_id= " + wq_id + " and wqb_id =" + wqb_id);
        }
        

        public SqlCommand InsertBody2_ShareCmd(Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = "Insert WPQty_B2_Share(wq_id, wqb_id, itm, worker, share_percent)";
            sql += " values(";
            sql += "   " + int.Parse(model["wq_id"]).ToString() + "";
            sql += ",   " + int.Parse(model["wqb_id"]).ToString() + "";
            sql += ",  " + int.Parse(model["itm"]).ToString() + "";
            sql += ",  '" + model["worker"] + "'";
            sql += ",  " + decimal.Parse(model["share_percent"]).ToString() + "";
            sql += ") select @@identity";  //share_id

            cmd.CommandText = sql;
            return cmd;
        }

        public SqlCommand DeleteBody2_ShareCmd(int wq_id, int wqb_id)
        {
            return new SqlCommand("Delete WPQty_B2_Share where wq_id= " + wq_id + " and wqb_id =" + wqb_id);
        }
        #endregion
        //public SqlCommand UpdateBodyCmd(int wq_id, Dictionary<string, string> model)
        //{
        //    SqlCommand cmd = new SqlCommand();
        //    string sql = " Update WPQty_B2 set ";
        //    sql += " jx_dd = '" + DateTime.Parse(model["jx_dd"]).Date.ToString() + "'";
        //    sql += ", itm = " + int.Parse(model["itm"]) + "";
        //    sql += ",  worker = '" + model["worker"] + "'";
        //    sql += ",  prd_no = '" + model["prd_no"] + "'";
        //    sql += ",  wp_no = '" + model["wp_no"] + "'";
        //    sql += ",  qty_pic = '" + int.Parse(model["qty_pic"]).ToString() + "'"; 
        //    sql += " where wq_id = " + wq_id + " and wqb_id = " + model["wqb_id"];
        //    cmd.CommandText = sql;
        //    return cmd;
        //}


        #region 加载
        public DataTable LoadBody(int wq_id)
        {
            string sql = " Select * from WPQty_B2 where 1=1 ";
            sql += " and wq_id=" + wq_id;
            sql += " order by wq_id, worker ";
            return SqlHelper.ExecuteSql(sql);
        }
 

        public DataTable LoadBody_Share(int wq_id)
        {
            string sql = " Select * from WPQty_B2_Share where 1=1 ";
            sql += " and wq_id=" + wq_id;
            sql += " order by wq_id,wqb_id, itm ";
            return SqlHelper.ExecuteSql(sql);
        }


        /// <summary>
        /// 计划单下每个尺寸的完成数量(区分尺寸)
        /// </summary>
        /// <param name="size_id"></param>
        /// <returns></returns>
        public DataTable GetWQTotal(int size_id)
        {
            //size_id, [qty_pic, qty_pair]
            string sql = "select ";
            sql += " B.prd_no, ";
            sql += " B.wp_no, ";
            sql += " sum(isnull(B.qty_pic, 0.00)) as qty_pic, ";
            sql += " sum(isnull(B.qty_pair, 0.00)) as qty_pair ";
            sql += " from WPQty_B2 B ";
            //sql += " inner join WPQty_H2 H on H.wq_id = B.wq_id ";
            sql += " where B.size_id = "+ size_id + ""; 
            sql += " group by B.prd_no, B.wp_no";

            return SqlHelper.ExecuteSql(sql);
        }

        /// <summary>
        /// 计划单的各尺寸的总完成数量(合并尺寸)
        /// </summary>
        /// <param name="plan_id"></param>
        /// <returns></returns>
        public DataTable GetWQTotalOnAllSize(int plan_id)
        {
            //size_id, [qty_pic, qty_pair]
            string sql = "select ";
            sql += " B.prd_no, ";
            sql += " B.wp_no, ";
            sql += " sum(isnull(B.qty_pic, 0.00)) as qty_pic, ";
            sql += " sum(isnull(B.qty_pair, 0.00)) as qty_pair ";
            sql += " from WPQty_B2 B ";
            sql += " inner join WPQty_H2 H on H.wq_id = B.wq_id ";
            sql += " where H.plan_id = " + plan_id + "";
            sql += " group by B.prd_no, B.wp_no";

            return SqlHelper.ExecuteSql(sql);
        }

        public DataTable SearchHeader(Dictionary<string, string> searchModel)
        {
            string TableType = "";
            if (searchModel.ContainsKey("TableType"))
            {
                TableType = searchModel["TableType"];
            }

            string sql = " Select ";
            sql += " table_type,  ";
            sql += " wq_id, jx_no,  ";
            sql += " convert(varchar(100), jx_dd, 111) as jx_dd,  ";
            sql += " provider, cus_no, plan_id, plan_no, prd_no, size_id, size, wp_dep_no, user_dep_no, edit_ut,  ";
            sql += " color_id, cal_inscrease,  ";
            sql += " convert(varchar(100), n_dd, 111) as n_dd, e_man,  ";
            sql += " convert(varchar(100), e_dd, 111) as e_dd ";
            sql += " from WPQty_H2 where 1=1 ";

            //计件分成非SY, 计件, 计件分成
            if (!string.IsNullOrEmpty(TableType))
            {
                if (TableType == "计件")
                {
                    if (searchModel.ContainsKey("IsShareTable") && !string.IsNullOrEmpty(searchModel["IsShareTable"]))
                    {
                        bool isShare = bool.Parse(searchModel["IsShareTable"].ToLower());
                        if (isShare)
                        {
                            sql += " and table_type = '计件分成非SY'";
                        }
                        else
                        {
                            sql += " and table_type = '计件' ";
                        }
                    }
                    else
                    {
                        sql += " and table_type = '计件' ";
                    }
                }
                else if (TableType == "计件分成")
                {
                    sql += " and table_type = '计件分成' ";
                }
            }

            if (searchModel.ContainsKey("wq_id") && !string.IsNullOrEmpty(searchModel["wq_id"]))
            {
                int wq_id = int.Parse(searchModel["wq_id"]);
                sql += " and wq_id = " + wq_id;
            }

            if (HideDataForCheck.HideDate.HasValue == true)
            {
                sql += " and jx_dd >= '" + HideDataForCheck.HideDate.Value + "'";
            }

            //计薪单号, 计薪范围段 计划单号, 员工部门
            if (searchModel.ContainsKey("jx_no") && !string.IsNullOrEmpty(searchModel["jx_no"]))
            {
                sql += " and jx_no like '%" + searchModel["jx_no"].Trim() + "%'";
            }
            if (searchModel.ContainsKey("S_jx_dd") && searchModel["S_jx_dd"] != null && searchModel["S_jx_dd"].Length > 0)
            {
                sql += " and jx_dd >= '" + DateTime.Parse(searchModel["S_jx_dd"]) + "'";
            }
            if (searchModel.ContainsKey("E_jx_dd") && searchModel["E_jx_dd"] != null && searchModel["E_jx_dd"].Length > 0)
            {
                sql += " and jx_dd <= '" + DateTime.Parse(searchModel["E_jx_dd"]) + "'";
            }

            if (searchModel.ContainsKey("wp_dep_no") && !string.IsNullOrEmpty(searchModel["wp_dep_no"]))
            {
                sql += " and wp_dep_no like '%" + searchModel["wp_dep_no"].Trim() + "%'";
            }

            if (searchModel.ContainsKey("user_dep_no") && !string.IsNullOrEmpty(searchModel["user_dep_no"]))
            {
                var subs = (new Dal_Dept()).GetSubDepts(searchModel["user_dep_no"].Trim());
                sql += " and user_dep_no in (" + ListToSqlWhereIn(subs.ToArray()) + ")";
                //sql += " and user_dep_no = '" + searchModel["user_dep_no"].Trim() + "'";
            }

            if (searchModel.ContainsKey("plan_no") && !string.IsNullOrEmpty(searchModel["plan_no"]))
            {
                sql += " and plan_no like '%" + searchModel["plan_no"].Trim() + "%'";
            }
            if (searchModel.ContainsKey("cus_no") && !string.IsNullOrEmpty(searchModel["cus_no"]))
            {
                sql += " and cus_no = '" + searchModel["cus_no"].Trim() + "'";
            }
            if (searchModel.ContainsKey("prd_no") && !string.IsNullOrEmpty(searchModel["prd_no"]))
            {
                sql += " and prd_no = '" + searchModel["prd_no"].Trim() + "'";
            }
            if (searchModel.ContainsKey("query_prd_no") && !string.IsNullOrEmpty(searchModel["query_prd_no"]))
            {
                sql += " and prd_no like '%" + searchModel["query_prd_no"].Trim() + "%'";
            }

            sql += " Order by jx_dd desc, jx_no desc";
            return SqlHelper.ExecuteSql(sql);
        }

        

        public DataTable SearchHeaderOnPJ(Dictionary<string, string> searchModel)
        {
            string sql = " Select ";
            sql += " table_type,  ";
            sql += " wq_id, jx_no,  ";
            sql += " convert(varchar(100), jx_dd, 111) as jx_dd,  ";
            sql += " provider, cus_no, plan_id, plan_no, prd_no, size_id, '' as size, wp_dep_no, user_dep_no, edit_ut,  ";
            sql += " color_id, cal_inscrease,  ";
            sql += " convert(varchar(100), n_dd, 111) as n_dd, e_man,  ";
            sql += " convert(varchar(100), e_dd, 111) as e_dd, n_man ";
            sql += " from WPQty_H2 where 1=1 ";


            sql += " and table_type = '计件皮奖' ";

            ////计薪单号, 计薪范围段 计划单号, 员工部门
            if (searchModel.ContainsKey("jx_no") && !string.IsNullOrEmpty(searchModel["jx_no"]))
            {
                sql += " and jx_no like '%" + searchModel["jx_no"].Trim() + "%'";
            }
            if (searchModel.ContainsKey("S_jx_dd") && searchModel["S_jx_dd"] != null && searchModel["S_jx_dd"].Length > 0)
            {
                sql += " and jx_dd >= '" + DateTime.Parse(searchModel["S_jx_dd"]) + "'";
            }
            if (searchModel.ContainsKey("E_jx_dd") && searchModel["E_jx_dd"] != null && searchModel["E_jx_dd"].Length > 0)
            {
                sql += " and jx_dd <= '" + DateTime.Parse(searchModel["E_jx_dd"]) + "'";
            }


            if (searchModel.ContainsKey("wp_dep_no") && !string.IsNullOrEmpty(searchModel["wp_dep_no"]))
            {
                sql += " and wp_dep_no like '%" + searchModel["wp_dep_no"].Trim() + "%'";
            }

            if (searchModel.ContainsKey("user_dep_no") && !string.IsNullOrEmpty(searchModel["user_dep_no"]))
            {
                sql += " and user_dep_no like '%" + searchModel["user_dep_no"].Trim() + "%'";
            }

            if (searchModel.ContainsKey("plan_no") && !string.IsNullOrEmpty(searchModel["plan_no"]))
            {
                //找出表身包含plan_no 的size_id s
                //size_id 使用在那些wq_id单据上?
                string sPlanSql = " select wq_id from WPQty_B2 where size_id in(SELECT size_id FROM WorkPlan_Sizes where plan_no like '%" + searchModel["plan_no"].Trim() + "%')";
                sql += " and wq_id in (" + sPlanSql + ")";
            }
            if (searchModel.ContainsKey("cus_no") && !string.IsNullOrEmpty(searchModel["cus_no"]))
            {
                string findCusWhere = "select wq_id from WPQty_H2 where plan_id in(SELECT plan_id FROM WorkPlan where cus_no like '%" + searchModel["cus_no"].Trim() + "%')";
                sql += " and wq_id in(" + findCusWhere + ")";
            }

            if (searchModel.ContainsKey("prd_no") && !string.IsNullOrEmpty(searchModel["prd_no"]))
            {
                string whereSub = " select wq_id from WPQty_B2 where prd_no = '" + searchModel["prd_no"].Trim() + "'";
                if (searchModel.ContainsKey("wp_no") && !string.IsNullOrEmpty(searchModel["wp_no"]))
                {
                    whereSub += " and wp_no = '" + searchModel["wp_no"] + "'";
                }
                sql += " and wq_id in( " + whereSub + " )";

            }


            return SqlHelper.ExecuteSql(sql);
        }



        #endregion


        private static string ListToSqlWhereIn(string[] listArr)
        {
            StringBuilder _res = new StringBuilder();
            int i = 0;
            for (i = 0; i < listArr.Length; ++i)
            {
                if (string.IsNullOrEmpty(listArr[i]))
                    continue;

                if (listArr.Length - 1 == i)
                    _res.Append("'" + listArr[i] + "'");
                else
                    _res.Append("'" + listArr[i] + "'" + ",");
            }

            //以防最后一个逗号
            if (_res.ToString().EndsWith(","))
                return _res.Remove(_res.Length - 1, 1).ToString();
            else
                return _res.ToString();
        }
    }
}
