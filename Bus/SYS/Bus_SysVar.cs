using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;


using SMS.Model;
using SMS.DAL;
using SMS.DBHelper;
using System.Data.SqlClient;

namespace SMS.Bus.SYS
{
    public class Bus_SysVar
    {
        public DataTable GetData() {
            return SqlHelper.ExecuteSql(" select * from FreezeConfig");
        }

        public DateTime GetFreezeDate()
        {
           return  DateTime.Parse(GetData().Rows[0]["freeze_date"].ToString()).Date;
        }
        public bool UpdateFreeze_date(DateTime date)
        {
            SqlCommand cmd = new SqlCommand(" Update FreezeConfig set freeze_date = '" + date + "'");
            return SqlHelper.ExecuteTransWithCommand(cmd);
        }
    }
}
