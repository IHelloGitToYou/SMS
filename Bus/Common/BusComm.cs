using System;
using System.Data;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SMS.Bus.Common
{
    public class BusComm
    {
        public static decimal GetDouble(string strNum)
        {
            if (string.IsNullOrEmpty(strNum))
                return 0;
            decimal res = 0;
            decimal.TryParse(strNum, out res);

            return res;
        }

        public static DataTable paging(DataTable Source_Dt, int page_limit, int page_index)
        {
            if (page_index < 1)
                page_index = 1;

            var query =
                from jl in Source_Dt.AsEnumerable()
                select jl;

            var page2Data = query.Skip(page_limit * (page_index - 1)).Take(page_limit);

            DataTable dt_res = Source_Dt.Clone();
            dt_res.Clear();
            dt_res.TableName = Source_Dt.Rows.Count.ToString(); //表身　放总行数

            DataRow[] drs = page2Data.ToArray();
            foreach (DataRow dr in drs)
            {
                dt_res.Rows.Add(dr.ItemArray);
            }
            return dt_res;
        }


        public static List<string> TakeDtFieldValues(DataTable dt, string fieldName)
        {
            List<string> res = new List<string>();
            int cnt = dt.Rows.Count;
            int i = 0;
            for (; i < cnt; ++i)
            {
                res.Add(dt.Rows[i][fieldName].ToString());
            }
            return res;
        }


        public static DateTime? GetDate(object date)
        {
            if (date == null || date == DBNull.Value || (date != null && (date.ToString().ToLower() == "null" || date.ToString() == "")))
            {
                return null;
            }
            else
                return DateTime.Parse(date.ToString()).Date;
        }
        public static string ListToSqlWhereIn(List<string> listArr)
        {
            return ListToSqlWhereIn(listArr.ToArray());
        }

        public static string ListToSqlWhereIn(string[] listArr)
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
