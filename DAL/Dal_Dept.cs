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
    public class Dal_Dept
    {
        public Dal_Dept()
        { }

        public DataTable GetAllData()
        {
            return SqlHelper.ExecuteSql(" select * from Dept");
        }

        public DataTable GetData(string Add_SqlWhere)
        {
            return SqlHelper.ExecuteSql(" select * from Dept where 1=1 " + Add_SqlWhere);
        }
        /// <summary>
        /// 查看对应部门数量
        /// </summary>
        /// <param name="up_no"></param>
        /// <returns></returns>
        public int GetCount(string up_no)
        {
            DataTable dt = SqlHelper.ExecuteSql("select * from Dept where up_dep_no='" + up_no + "'");
            return dt.Rows.Count;
        }

        ///// <summary>
        ///// 是否存在该记录
        ///// </summary>
        //public bool Exists(string dep_no)
        //{
        //    StringBuilder strSql = new StringBuilder();
        //    strSql.Append("select count(1) from Dept");
        //    strSql.Append(" where dep_no='" + dep_no + "' ");
        //    return ((int)SqlHelper.ExecuteScalar(strSql.ToString(), null)) > 0 ? true : false;
        //}

        // <summary>
        /// 是否存在该记录
        /// </summary>
        public bool Exists(string dep_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from Dept");
            strSql.Append(" where dep_no = '" + dep_no + "' ");

            return ((int)SqlHelper.ExecuteScalar(strSql.ToString(), null)) <= 0 ? false : true;
        }
 


        public bool HadSub(string dep_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from Dept");
            strSql.Append(" where up_dep_no='" + dep_no + "' ");
            return ((int)SqlHelper.ExecuteScalar(strSql.ToString(), null)) > 0 ? true : false;
        }


        /// <summary>
        /// 增加一条数据
        /// </summary>
        public bool Add(Model_Dept model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into Dept(");
            strSql.Append("dep_no,name,up_dep_no)");
            strSql.Append(" values (");
            strSql.Append("@dep_no,@name,@up_dep_no)");
            SqlParameter[] parameters = {
					new SqlParameter("@dep_no", SqlDbType.VarChar,40),
					new SqlParameter("@name", SqlDbType.VarChar,200),
					new SqlParameter("@up_dep_no", SqlDbType.VarChar,40)};
            parameters[0].Value = model.dep_no;
            parameters[1].Value = model.name;
            parameters[2].Value = model.up_dep_no;

            int rows = SqlHelper.ExecuteNonQuery(new SqlCommand(strSql.ToString()), parameters);
            if (rows > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        /// <summary>
        /// 更新一条数据
        /// </summary>
        public bool Update(Model_Dept model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("update Dept set ");
            strSql.Append("name=@name");
            strSql.Append(" where dep_no=@dep_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@name", SqlDbType.VarChar,200),
					new SqlParameter("@dep_no", SqlDbType.VarChar,40)};
            parameters[0].Value = model.name;
            parameters[1].Value = model.dep_no;

            int rows = SqlHelper.ExecuteNonQuery(new SqlCommand(strSql.ToString()), parameters);
            if (rows > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// 删除一条数据
        /// </summary>
        public bool Delete(string dep_no)
        {
            if (true == HadSub(dep_no))
                throw new Exception(" 有下级，不能直接删除，先删除下级！！");

            if (true == CheckUsed(dep_no))
                throw new Exception(" 后续资料已占用，不能删除！！");

            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from Dept ");
            strSql.Append(" where dep_no='" + dep_no + "' ");

            int rows = SqlHelper.ExecuteNonQuery(new SqlCommand(strSql.ToString()), null);
            if (rows > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        /// <summary>
        /// 获取记录总数
        /// </summary>
        public int GetRecordCount(string strWhere)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) FROM Dept ");
            if (strWhere.Trim() != "")
            {
                strSql.Append(" where " + strWhere);
            }
            object obj = SqlHelper.ExecuteScalar(strSql.ToString(), null);
            if (obj == null)
            {
                return 0;
            }
            else
            {
                return Convert.ToInt32(obj);
            }
        }
        /// <summary>
        /// 分页获取数据列表
        /// <param name="startIndex" >  -1抓取所有
        /// </summary>
        public DataTable GetListByPage(string strWhere, string orderby )
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("SELECT * FROM ( ");
            strSql.Append(" SELECT ROW_NUMBER() OVER (");
            if (!string.IsNullOrEmpty(orderby.Trim()))
            {
                strSql.Append("order by T." + orderby);
            }
            else
            {
                strSql.Append("order by T.dep_no desc");
            }
            strSql.Append(")AS Row, T.* , T.name as dep_name from Dept T ");
            if (!string.IsNullOrEmpty(strWhere.Trim()))
            {
                strSql.Append(" WHERE " + strWhere);
            }
            strSql.Append(" ) TT");


            DataTable dt = SqlHelper.ExecuteSql(strSql.ToString());
            return dt;
            //if (pageLimit == -1)
            //    return dt;
            //else
            //    return SqlHelper.paging(dt, pageLimit, pageIndex);

             
        }


        /// <summary>
        /// 检测是否使用过
        /// </summary>
        /// <returns></returns>
        public bool CheckUsed(string dep_no)
        {
            if (SqlHelper.ExecuteSql("select wp_dep_no from WPQty_H where wp_dep_no = '" + dep_no + "'").Rows.Count > 0)
            {
                return true;
            }
            if (SqlHelper.ExecuteSql("select dep_no from prdt_wp where dep_no = '" + dep_no + "'").Rows.Count > 0)
            {
                return true;
            }
            if (SqlHelper.ExecuteSql("select dep_no from salm where dep_no = '" + dep_no + "'").Rows.Count > 0)
            {
                return true;
            }
             
            return false;
        }


        public DataRow GetDeptInfo(string dep_no)
        {
            var dt = SqlHelper.ExecuteSql(" select * from Dept where dep_no = '" + dep_no + "'");
            if(dt.Rows.Count <= 0)
            {
                return null;
            }

            return dt.Rows[0];
        }

        /// <summary>
        /// 取自己下级节点列表
        /// </summary>
        /// <param name="dep_no"></param>
        /// <returns></returns>
        public List<string> GetSubDepts(string dep_no)
        {
            List<string> res = new List<string>();
            DataRow RootRow = GetDeptInfo(dep_no);
            if (RootRow == null)
            {
                res.Add(dep_no);
                return res;
            }

            string down_road = RootRow["down_road"].ToString().Trim();
            var arrList =  down_road.Split(new char[1] { ',' }).ToList();
            arrList.Add(dep_no);
            return arrList;
        }
    }
}
 
