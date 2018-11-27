using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using System.Data;
using System.Data.SqlClient;

using System.Collections;
using System.Text.RegularExpressions;
using SMS.Model;
using SMS.DBHelper;
using SMS.DAL;

namespace XBase.Data
{
    public class GetMaxId
    {
        /// <summary>
        /// 网页加载获取数据列表
        /// </summary>
        /// <returns></returns>
        public DataTable getList( )
        {
            StringBuilder sql = new StringBuilder("select  pageId, name,setpageId,setdatestring,number from GetId");
            SqlCommand cmd = new SqlCommand(sql.ToString());
            return SqlHelper.ExecuteSearch(cmd);
        }
        /// <summary>
        ///获取指定表的id生成格式
        /// </summary>
        /// <param name="pageId"></param>
        /// <returns></returns>
        public  DataTable getFormat(string pageId)
        {
            string sql = "select * from GetId where pageId='"+pageId+"'";
            SqlCommand cmd=new SqlCommand (sql);
            return SqlHelper.ExecuteSearch(cmd);
        }
        /// <summary>
        /// 获取指定表中指定格式的最大id
        /// </summary>
        /// <param name="table"></param>
        /// <param name="id"></param>
        /// <param name="number"></param>
        /// <returns></returns>
        public DataTable getIdByTable(string table,string id,string number)
        {
            StringBuilder sql = new StringBuilder("select max(" + id + ") from "+table);
            sql.Append(" where "+id +" like '"+number+"'%");
            SqlCommand cmd = new SqlCommand(sql.ToString());
            return SqlHelper.ExecuteSearch(cmd);
        }
        /// <summary>
        /// 添加网页id(唯一)
        /// </summary>
        /// <param name="pageId"></param>
        /// <param name="setpageId"></param>
        /// <param name="datestring"></param>
        /// <param name="setdatestring"></param>
        /// <param name="number"></param>
        /// <param name="maxnumber"></param>
        /// <returns></returns>
        public bool addId(string pageId,string setpageId,string datestring,string setdatestring,string number,string maxnumber)
        {
            string sql = "insert into GetId(pageId,setpageId,datestring,setdatestring,number,maxnumber) values(";
            sql +="'"+pageId+"',";
            if (!string.IsNullOrEmpty( setpageId))
                sql += "'" + setpageId + "',";
            else
                sql += ",";
            if (!string.IsNullOrEmpty(datestring))
                sql += "'" + datestring + "',";
            else
                sql += ",";
            if (!string.IsNullOrEmpty(setdatestring ))
                sql += "'" + setdatestring + "',";
            else
                sql += ",";
            if (!string.IsNullOrEmpty(number ))
                sql += "'" + number + "',";
            else
                sql += ",";
            if (!string.IsNullOrEmpty(maxnumber))
                sql += "'" + maxnumber + "'";
            sql += ")";
            SqlCommand cmd = new SqlCommand(sql);
            return SqlHelper.ExecuteTransWithCommand(cmd);
        }
        /////// <summary>
        /////// 修改数据(根据网页id)
        /////// </summary>
        /////// <param name="pageId"></param>
        /////// <param name="setpageId"></param>
        /////// <param name="datestring"></param>
        /////// <param name="setdatestring"></param>
        /////// <param name="number"></param>
        /////// <param name="maxid"></param>
        /////// <returns></returns>
        ////public bool update(ID_Format[] models)
        ////{
        ////    ArrayList comms = new ArrayList();
        ////    StringBuilder strSql = new StringBuilder();
        ////    strSql.Append("update GetId set ");
        ////    strSql.Append("setpageId=@setpageId,");
        ////    strSql.Append("setdatestring=@setdatestring,");
        ////    strSql.Append("number=@number");
        ////    strSql.Append(" where pageId=@pageId ");
        ////    foreach (ID_Format model in models)
        ////    {
        ////        SqlParameter[] parameters = {
        ////            SqlHelper.MakeParamYao("@setpageId", SqlDbType.VarChar,50,model.setpageId),
        ////            SqlHelper.MakeParamYao("@setdatestring", SqlDbType.VarChar,50,model.setdatestring),
        ////            SqlHelper.MakeParamYao("@number", SqlDbType.Int,model.number),
        ////            SqlHelper.MakeParamYao("@pageId", SqlDbType.VarChar,2,model.pageId)};
        ////        SqlCommand cmd = new SqlCommand(strSql.ToString());
        ////        cmd.Parameters.AddRange(parameters);
        ////        comms.Add(cmd);
        ////    }
        ////    return SqlHelper.ExecuteTransWithArrayList(comms);
        ////}

        public static string stringRepeat(string instr, int n)
        {
            if (string.IsNullOrEmpty(instr))
                return instr;
            var result = new StringBuilder(instr.Length * n);
            return result.Insert(0, instr, n).ToString();
        }

        private static string FNumber(int num)
        {
            return num < 10 ? 0 + "" + num : num.ToString();
        }
        
        private static string GetSignCharMouth(int mouth, int Len)
        {
            if (Len == 1)
            {
                if (mouth <= 9)
                    return mouth.ToString();
                else if (mouth == 10)
                {
                    return "A";
                }
                else if (mouth == 11)
                {
                    return "B";
                }
                else if (mouth == 12)
                {
                    return "C";
                }
            }

            return FNumber(mouth);
        }

        private static string GetSignDate(string dateFormat)
        {
            DateTime date = DateTime.Now;
            int year = date.Year;
            string month = date.Month.ToString();
            string day = date.Day.ToString();

            string dateSign = "";
            switch (dateFormat)
            {
                case "YYYYMMDD":
                    dateSign = year.ToString() + FNumber(int.Parse(month)) + FNumber(int.Parse(day));
                    break;
                case "YYMMDD":
                    dateSign = year.ToString().Substring(2, 2) + FNumber(int.Parse(month)) + FNumber(int.Parse(day));
                    break;
                case "YYMDD":
                    dateSign = year.ToString().Substring(2, 2) + GetSignCharMouth(int.Parse(month), 1) + FNumber(int.Parse(day));
                    break;
                case "YMDD":
                    dateSign = year.ToString().Substring(3, 1) + GetSignCharMouth(int.Parse(month), 1) + FNumber(int.Parse(day));
                    break;
                case "":
                    dateSign = "";
                    break;
            }

            return dateSign;
        }

        /// <summary>
        /// 取最新单号　＋1 
        /// </summary>
        /// <param name="pageId"></param>
        /// <returns></returns>
        public static string GetLastID(string p_pageId)
        {
            DataTable dt = SqlHelper.ExecuteSql(" select top 1 * from GetId where pageId='" + p_pageId + "' ");

            string pageId = p_pageId;
            string cust_pageId = string.IsNullOrEmpty((string)dt.Rows[0]["setpageId"]) ? pageId : (string)dt.Rows[0]["setpageId"];
            string sql = (string)dt.Rows[0]["sql"];
            string DateSet = (string)dt.Rows[0]["setdatestring"];
            int numLen = (int)dt.Rows[0]["number"];
            string os_no_fieldname = (string)dt.Rows[0]["os_no_fieldname"];

            DateTime date = DateTime.Now;
            int year = date.Year;
            string month = date.Month.ToString();
            string day = date.Day.ToString();

            string dateStr = GetSignDate(DateSet);// string.Empty;
            string sqlWhere = " and " + os_no_fieldname + " like '" + cust_pageId + dateStr + "%'";

            DataTable resDt = SqlHelper.ExecuteSql(sql + sqlWhere);

            Regex reg = new Regex(cust_pageId + dateStr + "\\d{" + numLen.ToString() + "}");
            //取最后一个单号
            int len = (cust_pageId + dateStr).Length;
            int lastNo = 0, temp = 0;
            string tempStr = "";
            for (int i = 0; i < resDt.Rows.Count; ++i)
            {
                if (reg.IsMatch((string)resDt.Rows[i][0]))
                {
                    tempStr = (string)resDt.Rows[i][0];
                    temp = Int32.Parse(tempStr.ToString().Substring(tempStr.ToString().Length - numLen, numLen));
                    if (lastNo < temp)
                    {
                        lastNo = temp;
                    }
                }
            }

            if (lastNo <= 0)
            {
                return cust_pageId + dateStr + stringRepeat("0", numLen - 1) + "1";
            }

            return cust_pageId + dateStr + stringRepeat("0", numLen - (lastNo + 1).ToString().Length) + (lastNo + 1).ToString();
        }

        public static string GetLastID(string p_pageId, string shdownList)
        {
            DataTable dt = SqlHelper.ExecuteSql(" select top 1 * from GetId where pageId='" + p_pageId + "' ");

            string pageId = p_pageId;
            string cust_pageId = string.IsNullOrEmpty((string)dt.Rows[0]["setpageId"]) ? pageId : (string)dt.Rows[0]["setpageId"];
            string sql = (string)dt.Rows[0]["sql"];
            string DateSet = (string)dt.Rows[0]["setdatestring"];
            int numLen = (int)dt.Rows[0]["number"];
            string os_no_fieldname = (string)dt.Rows[0]["os_no_fieldname"];

            DateTime date = DateTime.Now;
            int year = date.Year;
            string month = date.Month.ToString();
            string day = date.Day.ToString();

            string dateStr = string.Empty;
            switch (DateSet)
            {
                case "YYYYMMDD":
                    dateStr = year.ToString() + month + day;
                    break;
                case "YYMMDD":
                    dateStr = (year / 100).ToString().Substring(2, 2) + month + day;
                    break;
            }

            string sqlWhere = " and " + os_no_fieldname + " like '" + cust_pageId + dateStr + "%'";

            DataTable resDt = SqlHelper.ExecuteSql(sql + sqlWhere);

            if (!string.IsNullOrEmpty(shdownList))
            {
                string[] list = shdownList.Split(',');
                for (int i = 0; i < list.Length; ++i)
                {
                    DataRow dr = resDt.NewRow();
                    dr[""+ os_no_fieldname + ""] = list[i];
                    resDt.Rows.Add(dr);
                }
            }

            Regex reg = new Regex(cust_pageId + dateStr + "\\d{" + numLen.ToString() + "}");
            //取最后一个单号
            int len = (cust_pageId + dateStr).Length;
            int lastNo = 0, temp = 0;
            string tempStr = "";
            for (int i = 0; i < resDt.Rows.Count; ++i)
            {
                if (reg.IsMatch((string)resDt.Rows[i][0]))
                {
                    tempStr = (string)resDt.Rows[i][0];
                    temp = Int32.Parse(tempStr.ToString().Substring(tempStr.ToString().Length - numLen, numLen));
                    if (lastNo < temp)
                    {
                        lastNo = temp;
                    }
                }
            }

            if (lastNo <= 0)
            {
                return cust_pageId + dateStr + stringRepeat("0", numLen - 1) + "1";
            }

            return cust_pageId + dateStr + stringRepeat("0", numLen - (lastNo+1).ToString().Length) + (lastNo + 1).ToString();
        }

        /// <summary>
        /// 生成余料的　最新流水号
        /// </summary>
        /// <param name="jl_fjl_no"></param>
        /// <returns></returns>
        public static string GetNewJLNum(string jl_fjl_no, string shdownList)
        {
            DataTable resDt = SqlHelper.ExecuteSql("select jl_no from jlinfo where jl_fjl_no='" + jl_fjl_no + "' and jl_no like '" + jl_fjl_no + "%' ");
            if (!string.IsNullOrEmpty(shdownList))
            {
                string[] list = shdownList.Split(',');
                for (int i = 0; i < list.Length; ++i)
                {
                    DataRow dr =  resDt.NewRow();
                    dr["jl_no"] = list[i];
                    resDt.Rows.Add(dr);
                }

            }

            int numLen = 3;

            Regex reg = new Regex(jl_fjl_no + "_" + "\\d{" + numLen.ToString() + "}");
            //取最后一个单号
            int len = (jl_fjl_no).Length;
            int lastNo = 0, temp = 0;
            string tempStr = "";
            for (int i = 0; i < resDt.Rows.Count; ++i)
            {
                tempStr = (string)resDt.Rows[i][0];

                if (reg.IsMatch( tempStr ))
                {
                    temp = Int32.Parse(tempStr.ToString().Substring(tempStr.ToString().Length - numLen, numLen));
                    if (lastNo < temp)
                    {
                        lastNo = temp;
                    }
                }
            }

            if (lastNo <= 0)
            {
                return jl_fjl_no + "_" + stringRepeat("0", numLen - 1) + "1";
            }

            return jl_fjl_no + "_" + stringRepeat("0", numLen - (lastNo+1).ToString().Length ) + (lastNo + 1).ToString();
        }

    }
}
