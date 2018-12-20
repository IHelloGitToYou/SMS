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
    public class Dal_Salm
    {
        // <summary>
        /// 是否存在该记录
        /// </summary>
        public bool Exists(string sal_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from salm");
            strSql.Append(" where user_no=@sal_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@sal_no", SqlDbType.VarChar,40)			};
            parameters[0].Value = sal_no;

            return ((int)SqlHelper.ExecuteScalar(strSql.ToString(), parameters)) <= 0 ? false : true;
        }


        /// <summary>
        /// 增加一条数据
        /// </summary>
        public bool Add(Model_Salm model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into salm(");
            strSql.Append("user_no,n_dd,e_man,e_dd,name,dep_no,in_dd,out_dd,type,contact,rem,is_shebao, n_man");
            strSql.Append(") values (");
            strSql.Append("@user_no,@n_dd,@e_man,@e_dd,@name,@dep_no,@in_dd,@out_dd,@type,@contact,@rem,@is_shebao,@n_man");
            strSql.Append(") ");

            SqlParameter[] parameters = {
			            	SqlHelper.MakeParamYao("@user_no", SqlDbType.VarChar, model.user_no ) ,            
                        	SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , model.n_dd ) ,            
                        	SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar, "" ) ,            
                        	SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , DateTime.Now ) ,            
                        	SqlHelper.MakeParamYao("@name", SqlDbType.VarChar, model.name ) ,            
                        	SqlHelper.MakeParamYao("@dep_no", SqlDbType.VarChar, model.dep_no ) ,            
                        	SqlHelper.MakeParamYao("@in_dd", SqlDbType.DateTime , model.in_dd ) ,            
                        	SqlHelper.MakeParamYao("@out_dd", SqlDbType.DateTime , model.out_dd ) ,            
                        	SqlHelper.MakeParamYao("@type", SqlDbType.VarChar, model.type ) ,            
                        	SqlHelper.MakeParamYao("@contact", SqlDbType.VarChar, model.contact ) ,            
                        	SqlHelper.MakeParamYao("@rem", SqlDbType.NText , model.rem ) ,      
                            SqlHelper.MakeParamYao("@is_shebao", SqlDbType.VarChar, model.is_shebao) ,    
                            
                        	SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar, model.n_man )             
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
        public bool Update(Model_Salm  model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("update salm set ");

            strSql.Append(" user_no = @user_no , ");
            // strSql.Append(" n_dd = @n_dd , ");
            strSql.Append(" e_man = @e_man , ");
            strSql.Append(" e_dd = @e_dd , ");
            strSql.Append(" name = @name , ");
            strSql.Append(" dep_no = @dep_no , ");
            strSql.Append(" in_dd = @in_dd , ");
            strSql.Append(" out_dd = @out_dd , ");
            strSql.Append(" type = @type , ");
            strSql.Append(" contact = @contact , ");
            strSql.Append(" is_shebao = @is_shebao , ");

            strSql.Append(" rem = @rem   ");
            // strSql.Append(" n_man = @n_man  ");
            strSql.Append(" where user_no=@user_no  ");

            SqlParameter[] parameters = {
			            SqlHelper.MakeParamYao("@user_no", SqlDbType.VarChar, model.user_no ) ,            
                        //SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , model.n_dd ) ,            
                        SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar, model.e_man ) ,            
                        SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , model.e_dd ) ,            
                        SqlHelper.MakeParamYao("@name", SqlDbType.VarChar, model.name ) ,            
                        SqlHelper.MakeParamYao("@dep_no", SqlDbType.VarChar, model.dep_no ) ,            
                        SqlHelper.MakeParamYao("@in_dd", SqlDbType.DateTime , model.in_dd ) ,            
                        SqlHelper.MakeParamYao("@out_dd", SqlDbType.DateTime , model.out_dd ) ,            
                        SqlHelper.MakeParamYao("@type", SqlDbType.VarChar, model.type ) ,            
                        SqlHelper.MakeParamYao("@contact", SqlDbType.VarChar, model.contact ) ,            
                        SqlHelper.MakeParamYao("@rem", SqlDbType.NText , model.rem ) ,  
                        SqlHelper.MakeParamYao("@is_shebao", SqlDbType.VarChar, model.is_shebao) ,   
                       // SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar, model.n_man )             
              
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
        public bool Delete(string user_no)
        {
            if (true == CheckUsed(user_no))
                throw new Exception(" 后续生产资料已占用，不能删除！！");


            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from salm ");
            strSql.Append(" where user_no=@user_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@user_no", SqlDbType.VarChar,40)			};
            parameters[0].Value = user_no;


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
        public bool CheckUsed(string sal_no)
        {
            if (SqlHelper.ExecuteSql("select sal_no from WPQty_B where sal_no = '" + sal_no + "'").Rows.Count > 0)
            {
                return true;
            }
            if (SqlHelper.ExecuteSql("select sal_no from JSQty_B where sal_no = '" + sal_no + "'").Rows.Count > 0)
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
            strSql.Append("select count(1) FROM salm ");
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
        /// </summary>
        public DataTable GetListByPage(string strWhere  )
        {
            ////StringBuilder strSql = new StringBuilder();
            ////strSql.Append("SELECT * FROM ( ");
            ////strSql.Append(" select * from ( SELECT ROW_NUMBER() OVER (");
            ////if (!string.IsNullOrEmpty(orderby.Trim()))
            ////{
            ////    strSql.Append("order by T." + orderby);
            ////}
            ////else
            ////{
            ////    strSql.Append("order by T.dep_no, T.id");
            ////}
            ////strSql.Append(")AS Row, T.* ,P.name as dep_name from salm T ");

            ////strSql.Append(" left join Dept P  on P.dep_no = T.dep_no ");
            ////strSql.Append("  ) as B ");

            ////if (!string.IsNullOrEmpty(strWhere.Trim()))
            ////{
            ////    strSql.Append(" WHERE " + strWhere);
            ////}
            ////strSql.Append(" ) TT");
            //////　抓取所有
            ////if (startIndex == -1)
            ////    strSql.Append(" ");
            ////else
            ////strSql.AppendFormat(" WHERE TT.Row between {0} and {1}", startIndex, endIndex);
            ////strSql.Append("order by TT.dep_no, TT.id");
            ////return SqlHelper.ExecuteSql(strSql.ToString());

            StringBuilder strSql = new StringBuilder();
            strSql.Append(" select * from ( ");
            strSql.Append(" SELECT ");
                strSql.Append(" T.user_no, ");
                strSql.Append(" convert(varchar(100), T.n_dd, 111) as n_dd,  ");
                strSql.Append(" T.e_man, ");
                strSql.Append(" convert(varchar(100), T.e_dd, 111) as e_dd,  ");
                strSql.Append(" T.name, ");
                strSql.Append(" T.dep_no, ");
                strSql.Append(" convert(varchar(100), T.in_dd, 111) as in_dd,  ");
                strSql.Append(" convert(varchar(100), T.out_dd, 111) as out_dd,  ");
                strSql.Append(" T.type, ");
                strSql.Append(" T.is_shebao, ");
                strSql.Append(" T.contact, T.rem, T.n_man, T.sort_itm,  ");
            strSql.Append(" T.user_no as sal_no, T.name as sal_name ,P.name as dep_name from salm T ");
            strSql.Append("     left join Dept P  on P.dep_no = T.dep_no ");
            strSql.Append("  ) as B ");

            if (!string.IsNullOrEmpty(strWhere.Trim()))
            {
                strSql.Append(" WHERE " + strWhere);
            }
            
            strSql.Append("order by dep_no, sort_itm");
            DataTable dt = SqlHelper.ExecuteSql(strSql.ToString());
            return dt;
            //if (pageLimit == -1)
                
            //else
            //    return SqlHelper.paging(dt, pageLimit, pageIndex);

        }


        public bool UpSortItm(List<string> users  )
        {
            int i = 0;
            List<SqlCommand> cmds = new List<SqlCommand>();

            for(; i <users.Count ;++i){
                cmds.Add(new SqlCommand(" update salm set sort_itm = " + i + " where user_no='" + users[i] + "'"));
            }
            return SqlHelper.ExecuteTransWithCollections(cmds);
        }
    }
}
