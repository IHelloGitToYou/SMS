using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using SMS.Model;
using SMS.DAL;

namespace SMS.Bus
{
    public class Bus_PswUserInfo
    {
        private readonly Dal_PswUser dal = new Dal_PswUser();
        
        public int CheckUser(string user_no, string psw, ref string name)
        {
            DataTable dtUser = dal.GetUserInfo(" user_no ='" + user_no + "'");
            if (dtUser.Rows.Count <= 0)
                return -1;

            if(dtUser.Rows[0]["user_no"].ToString() != user_no)
            {
                return -1;
            }

            string state = dtUser.Rows[0]["state"].ToString();
            string pswDb = dtUser.Rows[0]["psw"].ToString();
            name = dtUser.Rows[0]["name"].ToString();

            if (state != "1")
                return -2;

            if (psw != pswDb)
                return 0;

            return 1;

        }
    }
}
