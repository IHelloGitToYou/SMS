using SMS.DBHelper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;

namespace SMS.DAL
{
    public class Dal_WorkPaln
    {
        #region WorkPlan操作
        //id int identity(1,1) not null,

        //WorkPlan 新,删除 
        //更新
        //加载 列表 
        public SqlCommand InsertWorkPlanCmd(Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = "Insert WorkPlan(cus_no, plan_no, prd_no, sizes_qty, deliver_dd, deadline, is_done,rem, n_man, n_dd) ";
            sql += " values(";
            sql += "   '" + model["cus_no"] + "'";
            sql += ",  '" + model["plan_no"] + "'";
            sql += ",  '" + model["prd_no"] + "'";
            sql += ",  '" + double.Parse(model["sizes_qty"]) + "'";
            sql += ",  '" + DateTime.Parse(model["deliver_dd"]).Date + "'"; 
            sql += ",  '" + DateTime.Parse(model["deadline"]).Date + "'";
            sql += ",  'false'";
            sql += ",  '" + model["rem"] + "'";
            sql += ",  '" + model["n_man"] + "'";
            sql += ",  GETDATE()";
            sql += ") select @@identity";

            cmd.CommandText = sql;
            return cmd;
        }

        public SqlCommand DeleteWorkPlanCmd(int plan_id)
        {
            return new SqlCommand("Delete WorkPlan where plan_id= " + plan_id);
        }

        public SqlCommand UpdateWorkPlanCmd(Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = " Update WorkPlan set ";
            sql += " cus_no = '" + model["cus_no"] + "'";
            sql += ", prd_no = '" + model["prd_no"] + "'";
            sql += ", plan_no = '" + model["plan_no"] + "'";
            sql += ", sizes_qty = '" + model["sizes_qty"] + "'";
            sql += ", deliver_dd = '" + model["deliver_dd"] + "'"; 
            sql += ", deadline = '" + model["deadline"] + "'";
            //sql += ", is_done = '" + model["is_done"] + "'";
            sql += ", rem = '" + model["rem"] + "'";
            sql += ", e_man = '" + model["e_man"] + "'";
            sql += ", e_dd = GETDATE()";
            sql += " where plan_id = " + model["plan_id"];
            cmd.CommandText = sql;
            return cmd;
        }

        public SqlCommand UpdateWorkPlan_IsDoneCmd(int plan_id, bool isDone)
        {
            return new SqlCommand("Update WorkPlan set is_done = '" + (isDone ? "true" : "false") + "' where plan_id= " + plan_id);
        }

        public DataTable SearchWorkPlan(Dictionary<string, string> searchModel, int rowTopCount = 100)
        {
            string sql = " ";
            sql += " Select Top " + rowTopCount;
            sql += "    plan_id, cus_no, plan_no, prd_no, sizes_qty, ";
            sql += "    convert(varchar(100), deliver_dd, 111) as deliver_dd, ";
            sql += "    convert(varchar(100), deadline, 111) as deadline, is_done, rem, n_man,  ";
            sql += "    convert(varchar(100), n_dd, 111) as n_dd, e_man,  ";
            sql += "    convert(varchar(100), e_dd, 111) as e_dd ";
            sql += " from WorkPlan  ";
            sql += " where 1=1 ";

            if (searchModel.ContainsKey("plan_id") && !string.IsNullOrEmpty(searchModel["plan_id"]))
            {
                int planId = int.Parse(searchModel["plan_id"]);
                sql += " and plan_id = " + planId;
            }

            if (searchModel.ContainsKey("S_deliver_dd") && searchModel["S_deliver_dd"] != null && searchModel["S_deliver_dd"].Length > 0)
            {
                sql += " and deliver_dd >= '" + DateTime.Parse(searchModel["S_deliver_dd"]) + "'";
            }
            if (searchModel.ContainsKey("E_deliver_dd") && searchModel["E_deliver_dd"] != null && searchModel["E_deliver_dd"].Length > 0)
            {
                sql += " and deliver_dd <= '" + DateTime.Parse(searchModel["E_deliver_dd"]) + "'";
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
            sql += " order by plan_id desc ";
            return SqlHelper.ExecuteSql(sql);
        }
        #endregion


        #region WorkPlan_Sizes操作
        //   id int identity(1,1),		
        //plan_id int not null,
        // plan_no
        //    int not null,
        //    varchar(10) not null,
        // numeric(18,2) not null DEFAULT 0,
        // varchar(5) DEFAULT 'false',
        // varchar(200),
        //other2 varchar(200),
        //other3 varchar(200),
        //other4 varchar(200),
        //other5 varchar(200),
        //WorkPlan_Sizes  新,删除 
        //更新
        //加载
        public SqlCommand InsertWorkPlan_SizesCmd(Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = "Insert WorkPlan_Sizes(plan_id, plan_no, itm, size, color_id, qty, is_done, other1, other2, other3, other4, other5) ";
            sql += " values(";
            sql += "   " + model["plan_id"] + "";
            sql += ",  '" + model["plan_no"] + "'";
            sql += ",  " + int.Parse(model["itm"]) + "";
            sql += ",  '" + model["size"] + "'";
            sql += ",  " + (string.IsNullOrEmpty(model["color_id"]) ? "NULL" : model["color_id"]);
            sql += ",  '" + double.Parse(model["qty"]) + "'";
            sql += ",  'false'";
            sql += ",  '" + model["other1"] + "'";
            sql += ",  '" + model["other2"] + "'";
            sql += ",  '" + model["other3"] + "'";
            sql += ",  '" + model["other4"] + "'";
            sql += ",  '" + model["other5"] + "'";
            sql += ") select @@identity";
    
            cmd.CommandText = sql;
            return cmd;
        }

        public SqlCommand DeleteWorkPlan_SizesCmd(int plan_id, int size_id)
        {
            if(size_id < 0)
                return new SqlCommand("Delete WorkPlan_Sizes where plan_id= " + plan_id);
            else
                return new SqlCommand("Delete WorkPlan_Sizes where plan_id= " + plan_id + " and size_id =" + size_id);
        }

        public SqlCommand UpdateWork_SizesPlanCmd(int plan_id,  Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = " Update WorkPlan_Sizes set ";
            sql += "  plan_no = '" + model["plan_no"] + "'";
            sql += ",  itm = " + int.Parse(model["itm"]) + "";
            sql += ", size = '" + model["size"] + "'";
            sql += ", color_id = " + (string.IsNullOrEmpty(model["color_id"]) ? "NULL" : model["color_id"]);
            sql += ", qty = " + double.Parse(model["qty"]) + "";
            //sql += ", deadline = '" + DateTime.Parse(model["deadline"]).Date + "'";
            //sql += ", is_done = '" + model["is_done"] + "'";
            sql += ", other1 = '" + model["other1"] + "'";
            sql += ", other2 = '" + model["other2"] + "'";
            sql += ", other3 = '" + model["other3"] + "'";
            sql += ", other4 = '" + model["other4"] + "'";
            sql += ", other5 = '" + model["other5"] + "'";

            sql += " where plan_id = " + plan_id + " and size_id = " + model["size_id"];
            cmd.CommandText = sql;
            return cmd;
        }

        public SqlCommand UpdateWorkPlanSizes_IsDoneCmd(int plan_id, int size_id, bool isDone)
        {
            return new SqlCommand("Update WorkPlan_Sizes set is_done = '" + (isDone ? "true" : "false") + "' where plan_id=" + plan_id + " and size_id =" + size_id);
        }

        public DataTable LoadPlan_Sizes(int plan_id)
        {
            string sql = " Select * from  WorkPlan_Sizes where 1=1 ";
            sql += " and plan_id=" + plan_id;
            sql += " order by plan_id, itm ";
            return SqlHelper.ExecuteSql(sql);
        }

        public DataTable LoadPlan_SizesBySizeId(int size_id)
        {
            string sql = " Select * from  WorkPlan_Sizes where 1=1 ";
            sql += " and size_id=" + size_id;
            sql += " order by plan_id, itm ";
            return SqlHelper.ExecuteSql(sql);
        }
        


        public DataTable LoadPlan_Sizes(int plan_id, int size_id)
        {
            string sql = " Select * from  WorkPlan_Sizes where 1=1 ";
            sql += " and plan_id=" + plan_id + " and size_id = " + size_id;
            sql += " order by plan_id, itm ";
            return SqlHelper.ExecuteSql(sql);
        }
        #endregion



        #region WorkPlan_DeptWP操作

        ////       id int identity(1,1),		
        ////plan_id int not null,
        ////   wp_dep_no varchar(40) not null,
        /// deliver_dd
        ////deadline datetime not null,
        ////day_qty numeric(18,2) not null DEFAULT 0,
        ////use_man numeric(18,0) not null DEFAULT 0,
        ////other1 varchar(200),
        ////other2 varchar(200),
        ////other3 varchar(200),
        ////other4 varchar(200),
        ////other5 varchar(200),
        //WorkPlan_DeptWP   新,删除 
        //更新
        //加载

        public SqlCommand InsertWorkPlan_DeptWPCmd(Dictionary<string, string> model)
        {
            string sql = "Insert WorkPlan_DeptWP(plan_id,  wp_dep_no, deliver_dd, deadline, day_qty, day_qty_ut, use_man, other1, other2,other3, other4, other5) ";
            sql += " values(";
            sql += "   '" + model["plan_id"] + "'";
           // sql += ",  '" + model["plan_no"] + "'";
            sql += ",  '" + model["wp_dep_no"] + "'";
            sql += ",  '" + DateTime.Parse(model["deliver_dd"]).Date + "'";
            sql += ",  '" + DateTime.Parse(model["deadline"]).Date + "'";
            sql += ",  '" + double.Parse(model["day_qty"]) + "'";
            sql += ",  '" + int.Parse(model["day_qty_ut"]).ToString() + "'"; 
            sql += ",  '" + model["use_man"] + "'";
            sql += ",  '" + model["other1"] + "'";
            sql += ",  '" + model["other2"] + "'";
            sql += ",  '" + model["other3"] + "'";
            sql += ",  '" + model["other4"] + "'";
            sql += ",  '" + model["other5"] + "'";
            sql += ") select @@identity";

            SqlCommand cmd = new SqlCommand();
            cmd.CommandText = sql;
            return cmd;
        }

        public SqlCommand DeleteWorkPlan_DeptWPCmd(int plan_id, int dept_id)
        {
            if (dept_id < 0)
                return new SqlCommand("Delete WorkPlan_DeptWP where plan_id= " + plan_id);
            else
                return new SqlCommand("Delete WorkPlan_DeptWP where plan_id= " + plan_id + " and dept_id =" + dept_id);
        }

        public SqlCommand UpdateWork_DeptWPCmd(int plan_id, Dictionary<string, string> model)
        {
            SqlCommand cmd = new SqlCommand();
            string sql = " Update WorkPlan_DeptWP set ";
            sql += "  wp_dep_no = '" + model["wp_dep_no"] + "'";
            sql += ", deliver_dd = '" + DateTime.Parse(model["deliver_dd"]).Date + "'";
            sql += ", deadline = '" + DateTime.Parse(model["deadline"]).Date + "'";
            sql += ", day_qty = '" + double.Parse(model["day_qty"]) + "'";
            sql += ", day_qty_ut = '" + int.Parse( model["day_qty_ut"]).ToString() + "'";
            sql += ", use_man = '" + model["use_man"] + "'";

            sql += ", other1 = '" + model["other1"] + "'";
            sql += ", other2 = '" + model["other2"] + "'";
            sql += ", other3 = '" + model["other3"] + "'";
            sql += ", other4 = '" + model["other4"] + "'";
            sql += ", other5 = '" + model["other5"] + "'";

            sql += " where plan_id = " + plan_id + " and dept_id = " + model["dept_id"];
            cmd.CommandText = sql;
            return cmd;
        }

        
        public DataTable LoadPlan_DeptWP(int plan_id)
        {
            string sql = " Select dept_id, plan_id, wp_dep_no , day_qty, day_qty_ut, use_man, other1 ,other2, other3, other4, other5, ";
            sql += "    convert(varchar(100), deliver_dd, 111) as deliver_dd, ";
            sql += "    convert(varchar(100), deadline, 111) as deadline ";
            sql += " from  WorkPlan_DeptWP where 1=1 ";
            sql += " and plan_id=" + plan_id;
            sql += " order by dept_id ";
            return SqlHelper.ExecuteSql(sql);
        }

        #endregion
    }
}
