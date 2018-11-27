using SMS.Bus.Common;
using SMS.DBHelper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;

namespace SMS.Bus
{
    public class Bus_SizeControl
    {
        public DataTable GetSizes()
        {
            return SqlHelper.ExecuteSql("select * from Sizes  order by sort ");
        }

        public bool ClearPrdtSize(string prd_no) {
            SqlCommand cmd = new SqlCommand("delete PrdtWp_SizeControl where prd_no = '" + prd_no + "'");
            return SqlHelper.ExecuteTransWithCommand(cmd);
        }

        public bool ClearPrdtSize(string prd_no, string wp_no)
        {
            SqlCommand cmd = new SqlCommand("delete PrdtWp_SizeControl where prd_no = '" + prd_no + "' and wp_no = '"+ wp_no + "'");
            return SqlHelper.ExecuteTransWithCommand(cmd);
        }

        public DataTable GetPrdt_SizeControl(string prd_no)
        {
            return SqlHelper.ExecuteSql("select * from PrdtWp_SizeControl where prd_no = '" + prd_no + "' order by prd_no, wp_no");
        }

        public List<string> GetPrdtWP_SizeControl(string prd_no, string wp_no)
        {
            List<string> controls = new List<string>();
            DataTable dt = SqlHelper.ExecuteSql("select * from PrdtWp_SizeControl where prd_no = '" + prd_no + "' and wp_no = '" + wp_no + "' order by prd_no, wp_no");

            return BusComm.TakeDtFieldValues(dt, "size");
        }

        private string GetInsertPrdtWpSizeControlSql(string prd_no, string wp_no, string size)
        {
            return "insert PrdtWp_SizeControl(prd_no, wp_no, size) values('" + prd_no + "', '" + wp_no + "', '" + size + "')";
        }

        public bool SetPrdtWP_SizeControl(string prd_no, string wp_no, List<string> sizeContols)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();
            cmds.Add(new SqlCommand(" delete PrdtWp_SizeControl where prd_no= '" + prd_no + "' and wp_no='" + wp_no + "'"));
            cmds.Add(new SqlCommand(" Update Prdt_Wp set is_size_control = 'true' where prd_no= '" + prd_no + "' and wp_no='" + wp_no + "' "));
            for (int i = 0; i < sizeContols.Count; ++i)
            {
                cmds.Add(new SqlCommand(GetInsertPrdtWpSizeControlSql(prd_no, wp_no, sizeContols[i])));
            }
            return SqlHelper.ExecuteTransForList(cmds.ToArray());
        }
    }
}
