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
    public class Bus_YGPJGZ
    {
        private readonly Dal_YGPJGZ dal = new Dal_YGPJGZ();
        public DataTable GetReportData(string JSStrWhere, string GZStrWhere)
        {
            return dal.GetReportData(JSStrWhere, GZStrWhere);
        }
    }
}
