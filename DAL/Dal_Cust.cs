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
    public class Dal_Cust
    {
        // <summary>
        /// 是否存在该记录
        /// </summary>
        public bool Exists(string cus_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from cust");
            strSql.Append(" where ");
            strSql.Append(" cus_no = @cus_no  ");
            SqlParameter[] parameters = {
					new SqlParameter("@cus_no", SqlDbType.VarChar,40)			};
            parameters[0].Value = cus_no;

            return ((int)SqlHelper.ExecuteScalar(strSql.ToString(), parameters)) <= 0 ? false : true;
        }

        /// <summary>
        /// 增加一条数据
        /// </summary>
        public bool Add(Model_Cust model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into cust(");
            strSql.Append("cus_no,name,snm,state,n_man,n_dd,e_man,e_dd");
            strSql.Append(") values (");
            strSql.Append("@cus_no,@name,@snm,@state,@n_man,@n_dd,@e_man,@e_dd");
            strSql.Append(") ");

            SqlParameter[] parameters = {
			            	SqlHelper.MakeParamYao("@cus_no", SqlDbType.VarChar,-1 , model.cus_no ) ,            
                        	SqlHelper.MakeParamYao("@name", SqlDbType.VarChar,-1 , model.name ) ,            
                        	SqlHelper.MakeParamYao("@snm", SqlDbType.VarChar,-1 , model.snm ) ,            
                        	SqlHelper.MakeParamYao("@state", SqlDbType.VarChar,-1 , model.state ) ,            
                        	SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar,-1 , model.n_man ) ,            
                        	SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , model.n_dd ) ,            
                        	SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar,-1 , model.e_man ) ,            
                        	SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , model.e_dd )             
              
            };
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
        public bool Update(Model_Cust model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("update cust set ");

            strSql.Append(" cus_no = @cus_no , ");
            strSql.Append(" name = @name , ");
            strSql.Append(" snm = @snm , ");
            strSql.Append(" state = @state , ");
            strSql.Append(" n_man = @n_man , ");
            strSql.Append(" n_dd = @n_dd , ");
            strSql.Append(" e_man = @e_man , ");
            strSql.Append(" e_dd = @e_dd  ");
            strSql.Append(" where cus_no=@cus_no  ");

            SqlParameter[] parameters = {
			            SqlHelper.MakeParamYao("@cus_no", SqlDbType.VarChar,-1 , model.cus_no ) ,            
                        SqlHelper.MakeParamYao("@name", SqlDbType.VarChar,-1 , model.name ) ,            
                        SqlHelper.MakeParamYao("@snm", SqlDbType.VarChar,-1 , model.snm ) ,            
                        SqlHelper.MakeParamYao("@state", SqlDbType.VarChar,-1 , model.state ) ,            
                        SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar,-1 , model.n_man ) ,            
                        SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , model.n_dd ) ,            
                        SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar,-1 , model.e_man ) ,            
                        SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , model.e_dd )             
              
            };
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
        public bool Delete(string cus_no)
        {
            /// 检查存在，客户的订单？
            /// 
            if (true == CheckUsed(cus_no))
                throw new Exception(" 后续资料已占用，不能删除！！");


            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from cust ");
            strSql.Append(" where cus_no=@cus_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@cus_no", SqlDbType.VarChar,40)			};
            parameters[0].Value = cus_no;


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
        /// 检测是否使用过
        /// </summary>
        /// <returns></returns>
        public bool CheckUsed(string cus_no)
        {
            if (SqlHelper.ExecuteSql("select cus_no from MF_SO where cus_no = '" + cus_no + "'").Rows.Count > 0)
            {
                return true;
            }
            

            return false;
        } 

        /// <summary>
        /// 获取记录总数
        /// </summary>
        public int GetRecordCount(string strWhere)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) FROM Cust ");
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
        public DataTable GetListByPage(string strWhere, string orderby)
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
                strSql.Append("order by T.cus_no desc");
            }
            strSql.Append(")AS Row, T.cus_no, T.name, T.snm, T.state, ");
            strSql.Append("T.n_man, convert(varchar(100), T.n_dd, 111) as n_dd, "); 
	        strSql.Append("T.e_man, convert(varchar(100), T.e_dd, 111) as e_dd, T.name as cus_name from Cust T ");
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

    }
}
