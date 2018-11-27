using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using SMS.Model;
using SMS.DAL;
using SMS.DBHelper;
using System.Data.SqlClient;

namespace SMS.Bus
{
    public class Bus_Prdt_WP
    {
        private readonly Dal_Prdt_WP dal = new Dal_Prdt_WP();
        private readonly Dal_Prdt_WP_HFUP updal = new Dal_Prdt_WP_HFUP();
        public Bus_Prdt_WP()
        {

        }
        public bool Exists(string prd_no)
        {
            return dal.Exists(prd_no);
        }

        public bool UsedWpNo(string prd_no)
        {
            if(SqlHelper.ExecuteSql("select 1 from WPQty_b2 where prd_no = '" + prd_no + "' ").Rows.Count > 0)
                return true;
 
            return false;
        }

        public bool UsedWpNo(string prd_no, string wp_no)
        {
            if (SqlHelper.ExecuteSql("select 1 from WPQty_b2 where prd_no = '" + prd_no + "' and wp_no = '" + wp_no + "' ").Rows.Count > 0)
                return true;

            return false;
         }

        public DataTable LoadPrdtWp(string prd_no) {
            return SqlHelper.ExecuteSql("select * from Prdt_WP where prd_no = '" + prd_no + "'  order by prd_no,itm ");  //and state = '0' 停用的在显示 控制显示否
        }

        public DataTable LoadPrdtWp(string prd_no, int wp_no)
        {
            return SqlHelper.ExecuteSql("select * from Prdt_WP where prd_no = '" + prd_no + "' and wp_no = '" + wp_no + "' order by prd_no,itm ");
        }

        public bool Add(List<Model_Prdt_WP> models)
        {
            return dal.Add(models);
        }

        public bool Update(string prd_no, List<Model_Prdt_WP> models)
        {
            return dal.Update(prd_no, models);
        }

        public bool Delete(string prd_no)
        {
            return dal.Delete(prd_no);
        }

        public bool Delete(string prd_no, string wp_no)
        {
            return dal.Delete(prd_no, wp_no);
        }

        public int GetPrdtWpCount(string prd_no, bool SearchWithUp, List<string> up_nos)
        {
            return dal.GetRecordCount(" prd_no = '" + prd_no + "'", true, up_nos);
        }

        public DataTable GetPrdtWpNos(string prd_no, bool SearchWithUp, List<string> up_nos)
        {
            return dal.GetListByPage(" prd_no = '" + prd_no + "'", "", -1, -1, true, up_nos);
        }

        public int GetRecordCount(string strWhere)
        {
            return dal.GetRecordCount(strWhere, false, null);
        }

        public DataTable GetListByPage(string strWhere, string orderby, int startIndex, int endIndex)
        {
            return dal.GetListByPage(strWhere, orderby, startIndex, endIndex, false, null);
        }


        /// 查找最大的Wp_no码
        public int MaxWpNo(string prd_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select isnull(wp_no, 1) as wp_no from prdt_wp");
            strSql.Append(" where ");
            strSql.Append(" prd_no = '" + prd_no + "' ");

            DataTable dt = SqlHelper.ExecuteSql(strSql.ToString());
            if (dt.Rows.Count <= 0)
                return 1;


            int max = 0;

            for (int i = 0; i < dt.Rows.Count; ++i)
            {
                string numQty = dt.Rows[i]["wp_no"].ToString();
                int a = int.Parse(string.IsNullOrEmpty(numQty) ? "1" : numQty);
                if (max <= a)
                    max = a;
            }


            return max;

        }


        public void SwitchColorDifferentPrice(string prd_no, string wp_no, bool Set)
        {
            dal.SwitchColorDifferentPrice(prd_no, wp_no, Set);
        }

        public void SwitchSaveMaterialAward(string prd_no, string wp_no, bool Set)
        {
            dal.SwitchSaveMaterialAward(prd_no, wp_no, Set);
        }

        public void SwitchSizeControl(string prd_no, string wp_no, bool Set)
        {
            dal.SwitchSizeControl(prd_no, wp_no, Set);
        }
        
    }
}
