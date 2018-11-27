using System;
using System.Data;
using System.Linq;
using System.Configuration;
using System.Web;
//using System.Web.Security;
//using System.Web.UI;
//using System.Web.UI.WebControls;
//using System.Web.UI.WebControls.WebParts;
//using System.Web.UI.HtmlControls;
using System.Text;
using System.Collections;
using System.Reflection;

namespace SMS.Bus
{
    /// <summary> 
    /// JsonClass 的摘要说明 
    /// </summary> 
    public class JsonClass
    {
        public JsonClass()
        {
        }


        #region 销售模块输出JSON格式的数据
       
        /// <summary>
        /// 销售模块输出JSON格式的数据
        /// </summary>
        /// <param name="OrderId">单据ID</param>
        /// <param name="Data">数据</param>
        /// <param name="OrderNo">单据编号</param>
        /// <param name="strMsg">操作结果信息</param>
        /// <param name="isSuc">是否成功，1成功、0失败</param>
        public JsonClass(int OrderId, string Data, string OrderNo, string strMsg, int isSuc)
        {
            this.orderid = OrderId;
            this.data1 = Data;
            this.issuc = isSuc;
            this.msg = strMsg;
            this.orderno = OrderNo;
        }

        int orderid;
        string data1;
        int issuc;
        string msg;
        string orderno;
        public int ID
        {
            get { return orderid; }
            set { this.orderid = value; }
        }
        public string NO
        {
            get { return orderno; }
            set { this.orderno = value; }
        }
        public int Sta1
        {
            get { return issuc; }
            set { this.issuc = value; }
        }
        public string Data1
        {
            get { return data1; }
            set { this.data1 = value; }
        }
        public string Msg
        {
            get { return msg; }
            set { this.msg = value; }
        }


        /// <summary>
        /// 销售模块输出JSON格式的数据
        /// </summary>
        /// <returns></returns>
        public string ToJosnString()
        {
            return "{\"data\":\"" + data1 + "\",\"id\":" + orderid + ",\"sta\":" + issuc + ",\"Msg\":\"" + msg + "\",\"no\":\"" + orderno + "\"}";
        }

        #endregion
        /// <summary>
        /// 附加参数，附加在第一个{后台
        /// </summary>
        /// <param name="BigJson"></param>
        /// <param name="InsertJson"></param>
        /// <returns></returns>
        public static string InsertJsonString(string BigJson, string InsertJson, int Location)
        {
            int InsertL = 0;
            if (Location == 0 || Location == 1)
                InsertL = BigJson.IndexOf("{");
            else
                InsertL = BigJson.IndexOf("{", InsertL + 1);


            if (InsertL < 0)
                return BigJson;

            StringBuilder S = new StringBuilder(BigJson);

            S.Insert(InsertL + 1, InsertJson);
            return S.ToString();
        }

        //手动输出JSON格式的数据 
        public JsonClass(string info, string data, int sta)
        {
            this.info = info;
            this.data = data;
            this.sta = sta;
        }

        string info;
        string data;
        int sta;
        public string Info
        {
            get { return info; }
            set { this.info = value; }
        }
        public string Data
        {
            get { return data; }
            set { this.data = value; }
        }
        public int Sta
        {
            get { return sta; }
            set { this.sta = value; }
        }
        //重写ToString()方法，以便输出格式是标准的JSON格式 
        public override string ToString()
        {
            return "{\"data\":\"" + data + "\",\"info\":\"" + info + "\",\"sta\":" + sta + "}";
        }

        //[ { label: "Choice1", value: "value1" }, ... ]
        public static string DataTable2AutoCompleteJson(DataTable dt, string ValueField, string labelField)
        {
            System.Text.StringBuilder jsonBuilder = new System.Text.StringBuilder();
            jsonBuilder.Append("[");
            if (dt.Rows.Count == 0)
            {
                jsonBuilder.Append("]");
                return jsonBuilder.ToString();
            }
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                jsonBuilder.Append("{");

                jsonBuilder.Append("label:" + "\"" + dt.Rows[i][labelField] + "\"," + "value:" + "\"" + dt.Rows[i][ValueField] + "\"");
                //jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
                jsonBuilder.Append("},");
            }
            jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
            jsonBuilder.Append("]");
            return jsonBuilder.ToString();
        }

        public static DataTable QueryConvertToTable(IQueryable query)
        {
            DataTable dtList = new DataTable();
            bool isAdd = false;
            PropertyInfo[] objProterties = null;
            foreach (var item in query)
            {
                if (!isAdd)
                {
                    objProterties = item.GetType().GetProperties();
                    foreach (var itemProterty in objProterties)
                    {
                        Type type = null;
                        if (itemProterty.PropertyType != typeof(string) && itemProterty.PropertyType != typeof(int) && itemProterty.PropertyType != typeof(DateTime))
                        {
                            type = typeof(string);
                        }
                        else
                        {
                            type = itemProterty.PropertyType;
                        }
                        dtList.Columns.Add(itemProterty.Name, type);
                    }
                    isAdd = true;
                }
                var row = dtList.NewRow();
                foreach (var pi in objProterties)
                {
                    row[pi.Name] = pi.GetValue(item, null);
                }
                dtList.Rows.Add(row);
            }

            return dtList;
        }

        /// <summary>
        /// DataTable转换为json字符串
        /// </summary>
        /// <param name="dt"></param>
        /// <returns></returns>
        public static string DataTable2JsonWithPaging(DataTable dt, int dt_Rows_Cnt)
        {
            System.Text.StringBuilder jsonBuilder = new System.Text.StringBuilder();
            jsonBuilder.Append("{");
            jsonBuilder.Append("total:" + dt_Rows_Cnt + ",");
            jsonBuilder.Append("items:[");
            if (dt.Rows.Count == 0)
            {
                jsonBuilder.Append("]");    // items
                jsonBuilder.Append("}");    //
                return jsonBuilder.ToString();
            }
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                jsonBuilder.Append("{");
                for (int j = 0; j < dt.Columns.Count; j++)
                {
                    jsonBuilder.Append("");
                    jsonBuilder.Append(dt.Columns[j].ColumnName);
                    jsonBuilder.Append(":\"");
                    try
                    {
                        jsonBuilder.Append(dt.Rows[i][j].ToString().Replace("\r", "\\r").Replace("\n", "\\n").Replace("\v", "\\v").Replace("\b", "\\b").Replace("\f", "\\f").Replace("\\", "/").Replace("\"", "\\\""));
                    }
                    catch
                    {
                        jsonBuilder.Append("");
                    }
                    jsonBuilder.Append("\",");
                }
                jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
                jsonBuilder.Append("},");
            }
            jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
            jsonBuilder.Append("]");

            jsonBuilder.Append("}");
            return jsonBuilder.ToString();
        }

      
        /// <summary>
        /// DataTable转换为json字符串
        /// </summary>
        /// <param name="dt"></param>
        /// <returns></returns>
        public static string DataTable2Json(DataTable dt)
        {
            System.Text.StringBuilder jsonBuilder = new System.Text.StringBuilder();
            jsonBuilder.Append("[");
            if (dt.Rows.Count == 0)
            {
                jsonBuilder.Append("]");
                return jsonBuilder.ToString();
            }
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                jsonBuilder.Append("{");
                for (int j = 0; j < dt.Columns.Count; j++)
                {
                    //jsonBuilder.Append("\"");
                    jsonBuilder.Append(dt.Columns[j].ColumnName);
                    jsonBuilder.Append(":\""); // \"
                    try
                    {
                        jsonBuilder.Append(dt.Rows[i][j].ToString().Replace("\r", "\\r").Replace("\n", "\\n").Replace("\v", "\\v").Replace("\b", "\\b").Replace("\f", "\\f").Replace("\\", "/").Replace("\"", "\\\""));
                    }
                    catch
                    {
                        jsonBuilder.Append("");
                    }
                    jsonBuilder.Append("\",");
                }
                jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
                jsonBuilder.Append("},");
            }
            jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
            jsonBuilder.Append("]");
            return jsonBuilder.ToString();
        }

        /// <summary>
        /// DataTable转换为json字符串
        /// </summary>
        /// <param name="dt"></param>
        /// <returns></returns>
        public static string DataTable2Json(DataTable dt, DataTable bodydt)
        {
            System.Text.StringBuilder jsonBuilder = new System.Text.StringBuilder();
            jsonBuilder.Append("[");
            if (dt.Rows.Count == 0)
            {
                jsonBuilder.Append("]");
                return jsonBuilder.ToString();
            }
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                jsonBuilder.Append("{");
                for (int j = 0; j < dt.Columns.Count; j++)
                {
                    //jsonBuilder.Append("\"");
                    jsonBuilder.Append(dt.Columns[j].ColumnName);
                    jsonBuilder.Append(":\"");
                    try
                    {
                        jsonBuilder.Append(dt.Rows[i][j].ToString().Replace("\r", "\\r").Replace("\n", "\\n").Replace("\v", "\\v").Replace("\b", "\\b").Replace("\f", "\\f").Replace("\\", "/").Replace("\"", "\\\""));
                    }
                    catch
                    {
                        jsonBuilder.Append("");
                    }
                    jsonBuilder.Append("\",");
                }
                //jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
                jsonBuilder.Append("BodyData:" + DataTable2Json(bodydt));
                jsonBuilder.Append("},");
            }
            jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
            jsonBuilder.Append("]");
            return jsonBuilder.ToString();
        }

        ///// <summary>
        ///// DataTable转换为json字符串
        ///// </summary>
        ///// <param name="dt"></param>
        ///// <returns></returns>
        //public static string DataTable2Json(DataTable dt, DataTable bodydt, DataTable bodydt1)
        //{
        //    System.Text.StringBuilder jsonBuilder = new System.Text.StringBuilder();
        //    jsonBuilder.Append("[");
        //    if (dt.Rows.Count == 0)
        //    {
        //        jsonBuilder.Append("]");
        //        return jsonBuilder.ToString();
        //    }
        //    for (int i = 0; i < dt.Rows.Count; i++)
        //    {
        //        jsonBuilder.Append("{");
        //        for (int j = 0; j < dt.Columns.Count; j++)
        //        {
        //            //jsonBuilder.Append("");
        //            jsonBuilder.Append(dt.Columns[j].ColumnName);
        //            jsonBuilder.Append(":\"");
        //            try
        //            {
        //                jsonBuilder.Append(dt.Rows[i][j].ToString().Replace("\r", "\\r").Replace("\n", "\\n").Replace("\v", "\\v").Replace("\b", "\\b").Replace("\f", "\\f").Replace("\\", "/").Replace("\"", "\\\""));
        //            }
        //            catch
        //            {
        //                jsonBuilder.Append("");
        //            }
        //            jsonBuilder.Append("\",");
        //        }
        //        //jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
        //        jsonBuilder.Append("BodyData:" + DataTable2Json(bodydt));
        //        jsonBuilder.Append(",BodyData1:" + DataTable2Json(bodydt1));
        //        jsonBuilder.Append("},");
        //    }
        //    jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
        //    jsonBuilder.Append("]");
        //    return jsonBuilder.ToString();
        //}

        //public static string DataTable2Json(DataTable dt, DataTable bodydt, DataTable bodydt1, DataTable bodydt2)
        //{
        //    System.Text.StringBuilder jsonBuilder = new System.Text.StringBuilder();
        //    jsonBuilder.Append("[");
        //    if (dt.Rows.Count == 0)
        //    {
        //        jsonBuilder.Append("]");
        //        return jsonBuilder.ToString();
        //    }
        //    for (int i = 0; i < dt.Rows.Count; i++)
        //    {
        //        jsonBuilder.Append("{");
        //        for (int j = 0; j < dt.Columns.Count; j++)
        //        {
        //            //jsonBuilder.Append("");
        //            jsonBuilder.Append(dt.Columns[j].ColumnName);
        //            jsonBuilder.Append(":\"");
        //            try
        //            {
        //                jsonBuilder.Append(dt.Rows[i][j].ToString().Replace("\r", "\\r").Replace("\n", "\\n").Replace("\v", "\\v").Replace("\b", "\\b").Replace("\f", "\\f").Replace("\\", "/").Replace("\"", "\\\""));
        //            }
        //            catch
        //            {
        //                jsonBuilder.Append("");
        //            }
        //            jsonBuilder.Append("\",");
        //        }
        //        //jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
        //        jsonBuilder.Append("BodyData:" + DataTable2Json(bodydt));
        //        jsonBuilder.Append(",BodyData1:" + DataTable2Json(bodydt1));
        //        jsonBuilder.Append(",BodyData2:" + DataTable2Json(bodydt2));
        //        jsonBuilder.Append("},");
        //    }
        //    jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
        //    jsonBuilder.Append("]");
        //    return jsonBuilder.ToString();
        //}
        public static string ConvertTextToHtml(string chr)
        {
            if (chr == null)
                return "";
            chr = chr.Replace("\n", "<Enter>");
            return (chr);
        }

        public static string FormatDataTableToJson(DataTable dt, int TotalCount)
        {
            StringBuilder sb = new StringBuilder();

            sb.Append("{totalCount:'" + TotalCount.ToString() + "',data:");
            sb.Append(DataTable2Json(dt));
            sb.Append("}");

            return sb.ToString();
        }

        ///*包含格式化日期参数*/
        //public static string DataTableToJson(DataTable dt, int TotalCount)
        //{
        //    System.Text.StringBuilder jsonBuilder = new System.Text.StringBuilder();


        //    jsonBuilder.Append("{totalCount:'" + TotalCount.ToString() + "',data:");
        //    #region 构造datatable json
        //    jsonBuilder.Append("[");
        //    if (dt.Rows.Count == 0)
        //    {
        //        jsonBuilder.Append("]");
        //    }

        //    for (int i = 0; i < dt.Rows.Count; i++)
        //    {
        //        jsonBuilder.Append("{");
        //        for (int j = 0; j < dt.Columns.Count; j++)
        //        {
        //            //jsonBuilder.Append("\"");
        //            jsonBuilder.Append(dt.Columns[j].ColumnName);
        //            jsonBuilder.Append(":\"");
        //            try
        //            {
        //                /*根据datatable列的数据格式 来格式化字符*/
        //                string tmp = string.Empty;
        //                if (dt.Columns[j].DataType.ToString() == "System.Int16" || dt.Columns[j].DataType.ToString() == "System.Int32" || dt.Columns[j].DataType.ToString() == "System.Int64")
        //                    tmp = dt.Rows[i][j].ToString();
        //                else if (dt.Columns[j].DataType.ToString() == "System.Decimal")
        //                    tmp = dt.Rows[i][j].ToString();
        //                else if (dt.Columns[j].DataType.ToString() == "System.DateTime")
        //                {
        //                    if (dt.Rows[i][j] != null && dt.Rows[i][j].ToString() != "")
        //                    {
        //                        tmp = (Convert.ToDateTime(dt.Rows[i][j].ToString())).ToString("yyyy-MM-dd");
        //                    }
        //                }
        //                else
        //                    tmp = dt.Rows[i][j].ToString();
        //                jsonBuilder.Append(GetSafeJSONString(tmp));//.Replace("\"","\\\""));
        //            }
        //            catch
        //            {
        //                jsonBuilder.Append("");
        //            }
        //            jsonBuilder.Append("\",");
        //        }
        //        jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
        //        jsonBuilder.Append("},");
        //    }
        //    jsonBuilder.Remove(jsonBuilder.Length - 1, 1);
        //    jsonBuilder.Append("]");


        //    #endregion
        //    jsonBuilder.Append("}");

        //    return jsonBuilder.ToString();
        //}


        private static System.Text.RegularExpressions.Regex safeJSON = new System.Text.RegularExpressions.Regex("[\\n\\r]");
        protected static string GetSafeJSONString(string input)
        {
            string output = input.Replace("\"", "\\\"");
            output = safeJSON.Replace(output, "<br>");

            return output;

        }
    } 
}
