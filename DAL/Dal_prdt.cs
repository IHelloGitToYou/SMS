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
    public class Dal_prdt
    {
        // <summary>
        /// 是否存在该记录
        /// </summary>
        public bool Exists(string prd_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from prdt");
            strSql.Append(" where prd_no=@prd_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@prd_no", SqlDbType.VarChar,40)			};
            parameters[0].Value = prd_no;

            return ((int)SqlHelper.ExecuteScalar(strSql.ToString(), parameters)) <= 0 ? false : true;
        }

        
        /// <summary>
        /// 增加一条数据
        /// </summary>
        public bool Add(Model_Prdt model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into prdt(");
            strSql.Append("prd_no,name,snm,spc,eng_name,state,rem,n_man,n_dd,e_man,e_dd)");
            strSql.Append(" values (");
            strSql.Append("@prd_no,@name,@snm,@spc,@eng_name,@state,@rem,@n_man,@n_dd,@e_man,@e_dd)");

            SqlParameter[] parameters ={
			        SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar , model.prd_no ) ,            
                    SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar , model.e_man ) ,            
                    SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , model.e_dd ) ,            
                    SqlHelper.MakeParamYao("@name", SqlDbType.VarChar , model.name ) ,            
                    SqlHelper.MakeParamYao("@snm", SqlDbType.VarChar , model.snm ) ,            
                    SqlHelper.MakeParamYao("@spc", SqlDbType.VarChar , model.spc ) ,            
                    SqlHelper.MakeParamYao("@eng_name", SqlDbType.VarChar , model.eng_name ) ,            
                    SqlHelper.MakeParamYao("@state", SqlDbType.VarChar , model.state ) ,            
                    SqlHelper.MakeParamYao("@rem", SqlDbType.NText , model.rem ) ,            
                    SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar , model.n_man ) ,            
                    SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , model.n_dd )    
            };
 
            int rows = SqlHelper.ExecuteNonQuery(new SqlCommand(strSql.ToString()) ,parameters);
            if (rows > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public SqlCommand AddCmd(Model_Prdt model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into prdt(");
            strSql.Append("prd_no,name,snm,spc,eng_name,state,rem,n_man,n_dd,e_man,e_dd)");
            strSql.Append(" values (");
            strSql.Append("@prd_no,@name,@snm,@spc,@eng_name,@state,@rem,@n_man,@n_dd,@e_man,@e_dd)");

            SqlParameter[] parameters ={
			        SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar , model.prd_no ) ,            
                    SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar , model.e_man ) ,            
                    SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , model.e_dd ) ,            
                    SqlHelper.MakeParamYao("@name", SqlDbType.VarChar , model.name ) ,            
                    SqlHelper.MakeParamYao("@snm", SqlDbType.VarChar , model.snm ) ,            
                    SqlHelper.MakeParamYao("@spc", SqlDbType.VarChar , model.spc ) ,            
                    SqlHelper.MakeParamYao("@eng_name", SqlDbType.VarChar , model.eng_name ) ,            
                    SqlHelper.MakeParamYao("@state", SqlDbType.VarChar , model.state ) ,            
                    SqlHelper.MakeParamYao("@rem", SqlDbType.NText , model.rem ) ,            
                    SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar , model.n_man ) ,            
                    SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , model.n_dd )    
            };

            SqlCommand cm = new SqlCommand(strSql.ToString());
            cm.Parameters.AddRange( parameters);

            return cm;
        }


        /// <summary>
        /// 更新一条数据
        /// </summary>
        public bool Update(Model_Prdt model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("update prdt set ");

            strSql.Append(" e_man = @e_man , ");
            strSql.Append(" e_dd = @e_dd , ");
            strSql.Append(" name = @name , ");
            strSql.Append(" snm = @snm , ");
            strSql.Append(" spc = @spc , ");
            strSql.Append(" eng_name = @eng_name , ");
            strSql.Append(" state = @state , ");
            strSql.Append(" rem = @rem   ");
            //strSql.Append(" n_man = @n_man , ");
            //strSql.Append(" n_dd = @n_dd  ");
            strSql.Append(" where prd_no=@prd_no  ");

            SqlParameter[] parameters = {
		            SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar , model.prd_no ) ,            
                    SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar , model.e_man ) ,            
                    SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , model.e_dd ) ,            
                    SqlHelper.MakeParamYao("@name", SqlDbType.VarChar , model.name ) ,            
                    SqlHelper.MakeParamYao("@snm", SqlDbType.VarChar , model.snm ) ,            
                    SqlHelper.MakeParamYao("@spc", SqlDbType.VarChar , model.spc ) ,            
                    SqlHelper.MakeParamYao("@eng_name", SqlDbType.VarChar , model.eng_name ) ,            
                    SqlHelper.MakeParamYao("@state", SqlDbType.VarChar , model.state ) ,            
                    SqlHelper.MakeParamYao("@rem", SqlDbType.NText , model.rem ) ,            
                    //SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar , model.n_man ) ,            
                    //SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , model.n_dd )             
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
        public bool Delete(string prd_no)
        {
            if (true == CheckUsed(prd_no))
                throw new Exception(" 后续资料已占用，不能删除！！");

            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from prdt ");
            strSql.Append(" where prd_no=@prd_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@prd_no", SqlDbType.VarChar,40)			};
            parameters[0].Value = prd_no;

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
        public bool CheckUsed(string prd_no)
        {
            if (SqlHelper.ExecuteSql("select prd_no from TF_SO where prd_no = '" + prd_no + "'").Rows.Count > 0)
            {
                return true;
            }
            if (SqlHelper.ExecuteSql("select prd_no from WPQty_H where prd_no = '" + prd_no + "'").Rows.Count > 0)
            {
                return true;
            }
            if (SqlHelper.ExecuteSql("select prd_no from prdt_wp_hfup where prd_no = '" + prd_no + "'").Rows.Count > 0)
            {
                return true;
            }
            if (SqlHelper.ExecuteSql("select prd_no from WPQty_H where prd_no = '" + prd_no + "'").Rows.Count > 0)
            {
                return true;
            }
            return false;
        } 

        
        

        /// <summary>
        /// 分页获取数据列表
        /// </summary>
        public DataTable GetListByPage(string strWhere, string orderby)
        {
            ////StringBuilder strSql = new StringBuilder();
            ////strSql.Append("SELECT * FROM ( ");
            ////strSql.Append(" SELECT ROW_NUMBER() OVER (");
            ////if (!string.IsNullOrEmpty(orderby.Trim()))
            ////{
            ////    strSql.Append("order by T." + orderby);
            ////}
            ////else
            ////{
            ////    strSql.Append("order by T.Prd_No desc");
            ////}
            ////strSql.Append(")AS Row, ");
            ////strSql.Append(" (select Count(1) from prdt_wp a where a.prd_no = T.prd_no) as has_wp, ");
            ////strSql.Append(" (select Count(1) from prdt_wp_hfup b where b.prd_no = T.prd_no  and  DATEDIFF(dd, getDate(),b.start_dd) <= 0   and DATEDIFF(dd, getDate(),b.end_dd)  >= 0 ) as has_wpup, ");
            ////strSql.Append("  T.*  from Prdt T ");
            ////if (!string.IsNullOrEmpty(strWhere.Trim()))
            ////{
            ////    strSql.Append(" WHERE " + strWhere);
            ////}
            ////strSql.Append(" ) TT");

            //////　抓取所有
            ////if (startIndex == -1)
            ////    strSql.Append(" ");
            ////else
            ////    strSql.AppendFormat(" WHERE TT.Row between {0} and {1}", startIndex, endIndex);

            StringBuilder strSql = new StringBuilder();
            strSql.Append("SELECT * FROM ( ");
            strSql.Append(" SELECT ROW_NUMBER() OVER (");
            if (!string.IsNullOrEmpty(orderby.Trim()))
            {
                strSql.Append("order by T." + orderby);
            }
            else
            {
                strSql.Append("order by T.Prd_No desc");
            }
            strSql.Append(")AS Row, ");
            strSql.Append(" (select Count(1) from prdt_wp a where a.prd_no = T.prd_no) as has_wp, ");
            strSql.Append(" (select Count(1) from prdt_wp_hfup b where b.prd_no = T.prd_no  and  DATEDIFF(dd, getDate(),b.start_dd) <= 0   and DATEDIFF(dd, getDate(),b.end_dd)  >= 0 ) as has_wpup, ");

            strSql.Append("  T.prd_no, T.name, T.snm, T.spc, T.eng_name, T.state, T.rem, ");
            strSql.Append("  T.n_man, convert(varchar(100), T.n_dd, 111) as n_dd,  ");
            strSql.Append("  T.e_man, convert(varchar(100), T.e_dd, 111) as e_dd,   ");

            strSql.Append("  T.name as prd_name from Prdt T ");
            if (!string.IsNullOrEmpty(strWhere.Trim()))
            {
                strSql.Append(" WHERE " + strWhere);
            }
            strSql.Append(" ) TT");

            
            DataTable dt = SqlHelper.ExecuteSql(strSql.ToString());
            return dt; 
            //if (pageLimit < 0)
            //    return dt;
            //else
            //    return SqlHelper.paging(dt, pageLimit, pageIndex);
        }


        /// <summary>
        /// 获取记录总数
        /// </summary>
        public int GetRecordCountWithMFSO(string strWhere)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from ( select " ); 
            strSql.Append("  T.prd_no, T.name, T.snm, T.spc, T.eng_name, T.state, T.rem, ");
            strSql.Append("  T.n_man, convert(varchar(100), T.n_dd, 111) as n_dd,  ");
            strSql.Append("  T.e_man, convert(varchar(100), T.e_dd, 111) as e_dd,   ");
            strSql.Append("  TF.so_no FROM Prdt T ");
            strSql.Append(" LEFT JOIN TF_SO  TF on TF.prd_no = T.prd_no ) AS T2   ");

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


        //查询 货品在那些订单中有呢？
        public DataTable GetListByPageWithMFSO(string strWhere, string orderby, int startIndex, int endIndex)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("SELECT * FROM ( ");
            strSql.Append(" select  distinct prd_no,name,snm,spc from ( SELECT ROW_NUMBER() OVER (");
            if (!string.IsNullOrEmpty(orderby.Trim()))
            {
                strSql.Append("order by T." + orderby);
            }
            else
            {
                strSql.Append("order by T.Prd_No desc");
            }
            strSql.Append(")AS Row,");
            strSql.Append("  T.prd_no, T.name, T.snm, T.spc, T.eng_name, T.state, T.rem, ");
            strSql.Append("  T.n_man, convert(varchar(100), T.n_dd, 111) as n_dd,  ");
            strSql.Append("  T.e_man, convert(varchar(100), T.e_dd, 111) as e_dd,   ");
            strSql.Append("  TF.so_no, TF.itm as so_itm  from Prdt T ");
            strSql.Append(" LEFT JOIN TF_SO  TF on TF.prd_no = T.prd_no ) AS T2   ");


            if (!string.IsNullOrEmpty(strWhere.Trim()))
            {
                strSql.Append(" WHERE " + strWhere);
            }
            strSql.Append(" ) TT");

            //　抓取所有
            if (startIndex == -1)
                strSql.Append(" ");
            else
                strSql.AppendFormat(" WHERE TT.Row between {0} and {1}", startIndex, endIndex);

            return SqlHelper.ExecuteSql(strSql.ToString());
        }

    }
}
