using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using System.Data.Sql;
using System.Data.SqlClient;

using SMS.Model;
using SMS.DBHelper;
using SMS.DAL;

namespace SMS.Bus.Common
{
    public class BusSearchBTN
    {
        private readonly Dal_SearchBTN dal = new Dal_SearchBTN();
        public void update(string pageId, string sqlname, string btnId)
        {
            dal.update(pageId, sqlname, btnId);
        }
        public int isnull(string pageId, string btnId)
        {
            return dal.isnull(pageId, btnId);
        }
        public string getList(string pageId, string btnId)
        {
            return dal.getList(pageId, btnId);
        }
    }
}
