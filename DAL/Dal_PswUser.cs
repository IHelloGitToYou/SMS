using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SMS.Model;

using System.Data;
using System.Data.SqlClient;
using SMS.DBHelper;

namespace SMS.DAL
{
    public class Dal_PswUser
    {

        public DataTable GetUserInfo(string strWhere)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append(" Select * FROM SYSUser ");
            if (strWhere.Trim() != "")
            {
                strSql.Append(" where " + strWhere);
            }

            return SqlHelper.ExecuteSql(strSql.ToString());
        }
    }
}
