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
    public class SunGridHeadDBHelper
    {
        public SunGridHeadDBHelper() { }

        #region  Method
        /// <summary>
        /// 是否存在该记录
        /// </summary>
        public static bool Exists(string gridId, string pageId, string userId)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from SunGridHead");
            strSql.Append(" where gridId=@gridId and pageId=@pageId and userId=@userId ");
            SqlParameter[] parameters = {
					new SqlParameter("@gridId", SqlDbType.VarChar,40),
					new SqlParameter("@pageId", SqlDbType.VarChar,40),
					new SqlParameter("@userId", SqlDbType.VarChar,40)};
            parameters[0].Value = gridId;
            parameters[1].Value = pageId;
            parameters[2].Value = userId;

            return ((Int32)SqlHelper.ExecuteScalar(strSql.ToString(), parameters)) > 0 ? true : false;
        }


        /// <summary>
        /// 增加一条数据
        /// </summary>
        public static bool Add(SunGridHeadModel model)
        {
            //先删除后增加
            Delete(model.gridId, model.pageId, model.userId);
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into SunGridHead(");
            strSql.Append("gridId,pageId,cellSetting,userId)");
            strSql.Append(" values (");
            strSql.Append("@gridId,@pageId,@cellSetting,@userId)");
            SqlParameter[] parameters = {
					MakeParamYao("@gridId", SqlDbType.VarChar,40,model.gridId),
					MakeParamYao("@pageId", SqlDbType.VarChar,40,model.pageId),
					MakeParamYao("@cellSetting", SqlDbType.VarChar,model.cellSetting),
                    MakeParamYao("@userId", SqlDbType.VarChar,40,model.userId)};

            SqlCommand comm = new SqlCommand(strSql.ToString());
            comm.Parameters.AddRange(parameters);
            SqlHelper.ExecuteTransWithCommand(comm);

            //,记录最新选择的GridId在 SunGridHead_2

            string sql2 = " delete SunGridHead_2 where pageId = '" + model.pageId + "' and userId='" + model.userId + "'   " +
                "insert SunGridHead_2 values('" + model.pageId + "', '" + model.gridId + "', '" + model.strSort + "' ,'" + model.userId + "')";
            SqlHelper.ExecuteNonQuery(new SqlCommand(sql2), null);

            return true;
        }
        /// <summary>
        /// 更新一条数据,记录最新选择的GridId在 SunGridHead_2
        /// </summary>
        public static bool Update(SunGridHeadModel model)
        {
            bool res = false;
            res = Add(model);
            return res;
        }



        public static SqlParameter MakeParamYao(string ParamName, SqlDbType DbType, Int32 Size, object Value)
        {
            SqlParameter param;
            if (Value == null)
            {
                param = new SqlParameter(ParamName, DBNull.Value);
                return param;
            }

            if (Size > 0)
                param = new SqlParameter(ParamName, DbType, Size);
            else
                param = new SqlParameter(ParamName, DbType);

            param.Value = Value;
            return param;
        }
        public static SqlParameter MakeParamYao(string ParamName, SqlDbType DbType, object Value)
        {
            SqlParameter param;
            if (Value == null)
            {
                param = new SqlParameter(ParamName, DBNull.Value);
                return param;
            }
            param = new SqlParameter(ParamName, DbType);
            param.Value = Value;
            return param;
        }


        /// <summary>
        /// 删除一条数据
        /// </summary>
        public static bool Delete(string gridId, string pageId, string userId)
        {

            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from SunGridHead ");
            strSql.Append(" where gridId='" + gridId + "' and pageId='" + pageId + "' and userId='" + userId + "' ");

            SqlHelper.ExecuteNonQuery(new SqlCommand(strSql.ToString()));
            return true;
        }

        ///先查询PageId 有无默认的gridId,有则取默认值，否则用参数gridId
        public static DataTable GetSort(string p_pageId, string p_gridId, string p_uesrId)
        {
            string sql1 = " select A.gridId,A.pageId,A.cellSetting,A.userId, " +
             "    isnull(B.nowGridId,'') as nowGridId, isnull(B.nowStrSort,'') as nowStrSort from SunGridHead_2 B " +
             " left join SunGridHead A " +
             "    on A.pageId= B.pageId and A.userId  = B.userId  " +
             " where B.pageId='" + p_pageId + "' and A.userId = '" + p_uesrId + "'";

            DataTable dt1 = SqlHelper.ExecuteSearch(new SqlCommand(sql1));
            if (dt1.Rows.Count >= 1)
                return dt1;

            string sql2 =
             " select A.gridId,A.pageId,A.cellSetting,A.userId, " +
             "    isnull(B.nowGridId,'') as nowGridId, isnull(B.nowStrSort,'') as nowStrSort  " +
             "  FROM SunGridHead A  " +
             " left join SunGridHead_2 B   " +
             "    on A.pageId= B.pageId and A.userId  = B.userId   " +
             " where A.gridId='" + p_gridId + "' and A.pageId='" + p_pageId + "' and A.userId = '" + p_uesrId + "'";

            return SqlHelper.ExecuteSearch(new SqlCommand(sql2));
        }

        /// <summary>
        /// 获得数据列表
        /// </summary>
        public static DataTable GetList(string strWhere)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append(" select gridId,pageId,cellSetting,userId ");
            strSql.Append(" FROM SunGridHead ");
            if (strWhere.Trim() != "")
            {
                strSql.Append(" where " + strWhere);
            }
            SqlCommand comm = new SqlCommand(strSql.ToString());
            return SqlHelper.ExecuteSearch(comm);
        }

        /// <summary>
        /// 获得前几行数据
        /// </summary>
        public static DataTable GetList(int Top, string strWhere, string filedOrder)
        {
            //StringBuilder strSql = new StringBuilder();
            //strSql.Append("select ");
            //if (Top > 0)
            //{
            //    strSql.Append(" top " + Top.ToString());
            //}
            //strSql.Append(" gridId,pageId,cellSetting,userId ");
            //strSql.Append(" FROM SunGridHead ");
            //if (strWhere.Trim() != "")
            //{
            //    strSql.Append(" where " + strWhere);
            //}
            //strSql.Append(" order by " + filedOrder);
            //SqlCommand comm = new SqlCommand(strSql.ToString());
            //return SqlHelper.ExecuteSearch(comm);
            return new DataTable();
        }

        /*
        /// <summary>
        /// 分页获取数据列表
        /// </summary>
        public DataTable GetList(int PageSize,int PageIndex,string strWhere)
        {
            SqlParameter[] parameters = {
                    new SqlParameter("@tblName", SqlDbType.VarChar, 255),
                    new SqlParameter("@fldName", SqlDbType.VarChar, 255),
                    new SqlParameter("@PageSize", SqlDbType.Int),
                    new SqlParameter("@PageIndex", SqlDbType.Int),
                    new SqlParameter("@IsReCount", SqlDbType.Bit),
                    new SqlParameter("@OrderType", SqlDbType.Bit),
                    new SqlParameter("@strWhere", SqlDbType.VarChar,1000),
                    };
            parameters[0].Value = "SunGridHead";
            parameters[1].Value = "gridId";
            parameters[2].Value = PageSize;
            parameters[3].Value = PageIndex;
            parameters[4].Value = 0;
            parameters[5].Value = 0;
            parameters[6].Value = strWhere;	
            return DbHelperSQL.RunProcedure("UP_GetRecordByPage",parameters,"ds");
        }*/

        #endregion  Method
    }
}
