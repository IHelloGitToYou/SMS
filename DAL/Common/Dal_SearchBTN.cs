using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using System.Data.Sql;
using System.Data.SqlClient;

using SMS.Model;
using SMS.DBHelper;
namespace SMS.DAL
{
    public class Dal_SearchBTN
    {
        private void add(string pageId, string sqlname, string btnId)
        {
            string sb = "insert into SearchTable(pageId,sqlName,btnId) values('" + pageId + "','" + sqlname + "'";
            if (!string.IsNullOrEmpty(btnId))
                sb += ",'" + btnId + "')";
            else
                sb += ",'')";
            SqlCommand cmd = new SqlCommand(sb);
            SqlHelper.ExecuteTransWithCommand(cmd);
        }
        private void delete(string pageId, string btnId)
        {
            SqlHelper.ExecuteNonQuery(new SqlCommand("delete SearchTable where pageId='" + pageId + "'" + " and btnId='" + btnId + "'"), null);
        }
        public void update(string pageId, string sqlname, string btnId)
        {
            delete(pageId, btnId);
            add(pageId, sqlname, btnId);
        }

        public int isnull(string pageId, string btnId)
        {
            string sb = "select count(1) from SearchTable where pageId='" + pageId + "'";
            if (!string.IsNullOrEmpty(btnId))
                sb += " and btnId='" + btnId + "'";
            SqlCommand cmd = new SqlCommand(sb);
            return int.Parse(SqlHelper.ExecuteSearch(cmd).Rows[0][0].ToString());
        }
        public string getList(string pageId, string btnId)
        {
            var obj = SqlHelper.ExecuteScalar("select sqlName from SearchTable where pageId= '" + pageId + "'" + " and btnId = '" + btnId + "'");
            return obj == null ? "" : obj.ToString();
        }
    }
}
