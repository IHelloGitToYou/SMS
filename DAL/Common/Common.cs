using SMS.DBHelper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;

namespace SMS.DAL
{
    public static class Common
    {
        /// <summary>
        /// 去除字符数组中重复的字符串
        /// </summary>
        /// <param name="T"></param>
        /// <returns></returns>
        public static List<string> DistinctList(List<string> T)
        {
            IEnumerable<string> Arr = T.Distinct();
            List<string> T2 = new List<string>();
            foreach (string str in Arr)
            {
                T2.Add(str);
            }
            return T2;
        }

        /// <summary>
        /// 各个字符串,,增加单引号,在左右...用于, SQL In 拼接参数
        /// </summary>
        /// <param name="listArr"></param>
        /// <returns></returns>
        public static string ListToSqlWhereIn(List<string> listArr)
        {
            StringBuilder _res = new StringBuilder();
            int i = 0;
            for (i = 0; i < listArr.Count; ++i)
            {
                if (listArr.Count - 1 == i)
                    _res.Append("'" + listArr[i] + "'");
                else
                    _res.Append("'" + listArr[i] + "'" + ",");
            }

            return _res.ToString();
        }

        /// <summary>
        /// 各个字符串,,增加单引号,在左右...用于, SQL In 拼接参数
        /// </summary>
        /// <param name="listArr"></param>
        /// <returns></returns>
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


        public static string ListToString(List<string> field_nos)
        {
            return ListToString(field_nos, "");
        }

        public static string ListToString(List<object> field_nosObj)
        {
            List<string> strList = new List<string>();
            int i = 0;
            for (i = 0; i < field_nosObj.Count; ++i)
            {
                var obj = field_nosObj[i];
                if (obj != null && obj != DBNull.Value)
                    strList.Add(obj.ToString());
                else
                    strList.Add("");
            }

            return ListToString(strList, "");
        }

        public static string ListToString(List<string> field_nos, string itemPreFix)
        {
            StringBuilder _res = new StringBuilder();
            int i = 0;
            for (i = 0; i < field_nos.Count; ++i)
            {
                if (field_nos.Count - 1 == i)
                    _res.Append(itemPreFix + field_nos[i]);
                else
                    _res.Append(itemPreFix + field_nos[i] + ",");
            }

            return _res.ToString();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="field_nos"></param>
        /// <param name="itemPreFix"></param>
        /// <param name="Speartor">分隔符号 ， or and</param>
        /// <returns></returns>
        public static string ListToString(List<string> field_nos, string itemPreFix, string Speartor)
        {
            StringBuilder _res = new StringBuilder();
            int i = 0;
            for (i = 0; i < field_nos.Count; ++i)
            {
                if (field_nos.Count - 1 == i)
                    _res.Append(itemPreFix + field_nos[i]);
                else
                    _res.Append(itemPreFix + field_nos[i] + Speartor);
            }

            return _res.ToString();
        }

        /// <summary>
        /// 字符串分组,　分组时把空白的内容删除掉
        /// </summary>
        /// <param name="Lists"></param>
        /// <param name="separator"></param>
        /// <returns></returns>
        public static List<string> StringToList(string Lists, string separator)
        {
            List<string> res = new List<string>();
            if (separator == ",")
                res = Lists.Trim().Split(new char[1] { ',' }).ToList();
            if (separator == "/")
                res = Lists.Trim().Split(new char[1] { '/' }).ToList();
            if (separator == "~")
                res = Lists.Trim().Split(new char[1] { '~' }).ToList();
            if (separator == ";")
                res = Lists.Trim().Split(new char[1] { ';' }).ToList();

            if (res.IndexOf("") < 0)
                return res;
            else
            {
                List<string> res2 = new List<string>();
                for (int i = 0; i < res.Count; ++i)
                {
                    if (!string.IsNullOrEmpty(res[i]))
                        res2.Add(res[i]);

                }
                return res2;
            }
        }

        public static DataTable SearchDB(this string sql)
        {
            return SqlHelper.ExecuteSql(sql);
        }
    }
}
