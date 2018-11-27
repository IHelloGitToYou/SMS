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
    public class Dal_Prdt_WP_HFUP
    {

        public int GetMaxId()
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select ISNULL(Max(up_no),1) as up_no from prdt_wp_hfup ");
            return (int)SqlHelper.ExecuteScalar(strSql.ToString(), null);
        }

        public bool Exists(string up_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from prdt_wp_hfup");
            strSql.Append(" where ");
            strSql.Append(" up_no = @up_no  ");
            SqlParameter[] parameters = {
					new SqlParameter("@up_no", SqlDbType.VarChar,40)			};
            parameters[0].Value = up_no;

            return ((int)SqlHelper.ExecuteScalar(strSql.ToString(), parameters)) <= 0 ? false : true;
        }

        /// <summary>
        /// 检查各单价ID 之间有无时间空隙，主要应用于，担心小发钱给员工
        /// </summary>
        /// <param name="prd_no"></param>
        /// <param name="cus_no"></param>
        /// <returns></returns>
        public bool CheckXongXi(string prd_no )
        {
            //bool onlyPrdNo = string.IsNullOrEmpty(cus_no);

            //string sqlWhere = "sselect * from ( " +
            //        "   select isnull(cus_no,'') + prd_no as groupName,up_no, start_dd, end_dd from prdt_wp_hfup " +
            //        " 	    where prd_no ='" + prd_no + "' " +
            //        "   ) as ST " +
            //        " order by groupName,start_dd ";
             
            //DataTable dt = SqlHelper.ExecuteSql(sqlWhere);

            //DateTime SDD = new DateTime(), EDD = new DateTime();

            //foreach (DataRow row in dt.Rows)
            //{
            //    SDD = (DateTime)row["start_dd"];
            //    EDD = (DateTime)row["end_dd"];

            //    SDD
            //}

            return false;
        }

        /// <summary>
        /// 检查同组单价Id里有无重叠的日子，，　用于以防工序单价重了！
        /// </summary>
        /// <param name="prd_no"></param>
        /// <returns></returns>
        public bool CheckChongDie(string prd_no)
        {

            return false;
        }

        /// <summary>
        /// 增加一条数据
        /// </summary>
        public bool Add(Model_Prdt_WP_HFUP model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into prdt_wp_hfup(");
            strSql.Append("start_dd,end_dd,cus_no,prd_no,n_man,n_dd");
            strSql.Append(") values (");
            strSql.Append("@start_dd,@end_dd,@cus_no,@prd_no,@n_man,@n_dd");
            strSql.Append(") ");

            SqlParameter[] parameters = {
                        	SqlHelper.MakeParamYao("@start_dd", SqlDbType.DateTime , model.start_dd ) ,            
                        	SqlHelper.MakeParamYao("@end_dd", SqlDbType.DateTime , model.end_dd ) ,            
                        	SqlHelper.MakeParamYao("@cus_no", SqlDbType.VarChar,-1 , model.cus_no ) ,            
                        	SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar,-1 , model.prd_no ) ,            
                        	SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar,-1 , model.n_man ) ,            
                        	SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , DateTime.Now )             
              
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

        public SqlCommand AddWithoutUp_no(Model_Prdt_WP_HFUP model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into prdt_wp_hfup(");
            strSql.Append("start_dd,end_dd,dep_no,cus_no,prd_no,n_man,n_dd");
            strSql.Append(") values (");
            strSql.Append("@start_dd,@end_dd,@dep_no,@cus_no,@prd_no,@n_man,@n_dd");
            strSql.Append(") ");

            SqlParameter[] parameters = {
                SqlHelper.MakeParamYao("@start_dd", SqlDbType.DateTime , model.start_dd ) ,            
                SqlHelper.MakeParamYao("@end_dd", SqlDbType.DateTime , model.end_dd ) ,    
                SqlHelper.MakeParamYao("@dep_no", SqlDbType.VarChar,-1 , model.dep_no ) ,            
                SqlHelper.MakeParamYao("@cus_no", SqlDbType.VarChar,-1 , model.cus_no ) ,            
                SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar,-1 , model.prd_no ) ,            
                SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar,-1 , model.n_man ) ,            
                SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , DateTime.Now )             
            };

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);
            return cmd;
        }

        public SqlCommand AddCmd(Model_Prdt_WP_HFUP model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into prdt_wp_hfup(");
            strSql.Append("up_no,start_dd,end_dd,dep_no,cus_no,prd_no,n_man,n_dd");
            strSql.Append(") values (");
            strSql.Append("@up_no, @start_dd,@end_dd,@dep_no,@cus_no,@prd_no,@n_man,@n_dd");
            strSql.Append(") ");

            SqlParameter[] parameters = {
			            	SqlHelper.MakeParamYao("@up_no", SqlDbType.Int, model.up_no ) ,  
                        	SqlHelper.MakeParamYao("@start_dd", SqlDbType.Date , model.start_dd ) ,            
                        	SqlHelper.MakeParamYao("@end_dd", SqlDbType.Date , model.end_dd ) ,            
                        	SqlHelper.MakeParamYao("@dep_no", SqlDbType.VarChar,-1 , model.dep_no ) ,            
                            SqlHelper.MakeParamYao("@cus_no", SqlDbType.VarChar,-1 , model.cus_no ) ,     
                        	SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar,-1 , model.prd_no ) ,            
                        	SqlHelper.MakeParamYao("@n_man", SqlDbType.VarChar,-1 , model.n_man ) ,            
                        	SqlHelper.MakeParamYao("@n_dd", SqlDbType.DateTime , DateTime.Now)         
            };
            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);


            return cmd;
        }

        public SqlCommand UpdateUpNoCmd(string new_up_no, string old_up_no)
        {
            SqlCommand cmd = new SqlCommand(" update prdt_wp_hfup set up_no =" + new_up_no + " where up_no = " + old_up_no);
            return cmd;
        }
        /// <summary>
        /// 更新一条数据
        /// </summary>
        public bool Update(Model_Prdt_WP_HFUP model)
        {
            SqlCommand cmd =  UpdateCmd(model);

            return SqlHelper.ExecuteTransWithCommand(cmd);
        }

        

        /// <summary>
        /// 更新一条数据
        /// </summary>
        public SqlCommand UpdateCmd(Model_Prdt_WP_HFUP model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("update prdt_wp_hfup set ");

            strSql.Append(" start_dd = @start_dd , ");
            strSql.Append(" end_dd = @end_dd , ");
            strSql.Append(" dep_no = @dep_no, ");
            strSql.Append(" cus_no = @cus_no , ");
            strSql.Append(" prd_no = @prd_no , ");

            strSql.Append(" e_man = @e_man , ");
            strSql.Append(" e_dd = @e_dd  ");
            strSql.Append(" where up_no=@up_no  ");

            SqlParameter[] parameters = {
			            SqlHelper.MakeParamYao("@up_no", SqlDbType.VarChar,-1 , model.up_no ) ,            
                        SqlHelper.MakeParamYao("@start_dd", SqlDbType.Date , model.start_dd ) ,            
                        SqlHelper.MakeParamYao("@end_dd", SqlDbType.Date , model.end_dd ) ,            
                        SqlHelper.MakeParamYao("@dep_no", SqlDbType.VarChar,-1 , model.dep_no ) ,            
                        SqlHelper.MakeParamYao("@cus_no", SqlDbType.VarChar,-1 , model.cus_no ) ,            
                        SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar,-1 , model.prd_no ) ,            
                            
                        SqlHelper.MakeParamYao("@e_man", SqlDbType.VarChar,-1 , model.e_man ) ,            
                        SqlHelper.MakeParamYao("@e_dd", SqlDbType.DateTime , DateTime.Now )             
              
            };

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);

            return cmd;
        }

        /// <summary>
        /// 执行批处理
        /// </summary>
        /// <param name="cmds"></param>
        /// <returns></returns>
        public bool ExeCmds(List<SqlCommand> cmds)
        {
            return SqlHelper.ExecuteTransWithCollections(cmds);
        }

        /// <summary>
        /// 删除一条数据
        /// </summary>
        public bool Delete(int up_no)
        {

            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from prdt_wp_hfup ");
            strSql.Append(" where up_no=" + up_no + " ");
           
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
        /// 删除一条数据
        /// </summary>
        public SqlCommand DeleteCmd(int up_no)
        {

            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from prdt_wp_hfup ");
            strSql.Append(" where up_no=" + up_no + " ");

            return new SqlCommand(strSql.ToString());
          
        }
        /// <summary>
        /// 获取记录总数
        /// </summary>
        public int GetRecordCount(string strWhere)
        {
            StringBuilder strSql = new StringBuilder();
           
            strSql.Append("     select count(1)  from ( ");
            strSql.Append("         select T.*, C.name as cus_name FROM prdt_wp_hfup T ");
            strSql.Append("             left join cust C on C.cus_no = T.cus_no ");
            strSql.Append("     ) As T2 ");

            if (strWhere.Trim() != "")
            {
                strSql.Append(" where " + strWhere);
            }
             
            object obj = SqlHelper.ExecuteScalar(strSql.ToString() ,null);
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
        public DataTable GetData(string strWhere )
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("SELECT * FROM ( ");
            strSql.Append("SELECT * FROM ( ");
            strSql.Append(" SELECT  ");

            strSql.Append(" T.up_no, T.dep_no, T.cus_no,   ");
            strSql.Append(" convert(varchar(100), T.start_dd, 111) as start_dd, convert(varchar(100), T.end_dd, 111) as end_dd,   ");
            strSql.Append(" T.prd_no,  ");
            strSql.Append(" T.n_man, convert(varchar(100), T.n_dd, 111) as n_dd,   ");
            strSql.Append(" T.e_man, convert(varchar(100), T.e_dd, 111) as e_dd,   ");

            strSql.Append("     C.name as cus_name, D.name as dep_name ");
            strSql.Append(" from prdt_wp_hfup T  ");
            strSql.Append("     left join cust C on C.cus_no = T.cus_no ");
            strSql.Append("     left join dept D on D.dep_no = T.dep_no ");
            strSql.Append(") AS T2  ");

            if (!string.IsNullOrEmpty(strWhere.Trim()))
            {
                strSql.Append(" WHERE " + strWhere);
            }
            strSql.Append(" ) As TT  ");
            
            return SqlHelper.ExecuteSql(strSql.ToString());
        }
        /// <summary>
        /// 分页获取数据列表
        /// </summary>
        public DataTable GetListByPage(string strWhere, string orderby, int startIndex, int endIndex)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("SELECT * FROM ( ");
            strSql.Append("SELECT * FROM ( ");
            strSql.Append("     SELECT ROW_NUMBER() OVER (");
            if (!string.IsNullOrEmpty(orderby.Trim()))
            {
                strSql.Append("order by T." + orderby);
            }
            else
            {
                strSql.Append("order by T.start_dd desc");
            }
            strSql.Append("     )AS Row, ");

            strSql.Append(" T.up_no, T.dep_no, T.cus_no,   ");
            strSql.Append(" convert(varchar(100), T.start_dd, 111) as start_dd, convert(varchar(100), T.end_dd, 111) as end_dd,   ");
            strSql.Append(" T.prd_no,  ");
            strSql.Append(" T.n_man, convert(varchar(100), T.n_dd, 111) as n_dd,   ");
            strSql.Append(" T.e_man, convert(varchar(100), T.e_dd, 111) as e_dd,   ");

            strSql.Append("  C.name as cus_name, D.name as dep_name ");
            strSql.Append(" from prdt_wp_hfup T  ");
            strSql.Append("     left join cust C on C.cus_no = T.cus_no ");
            strSql.Append("     left join dept D on D.dep_no = T.dep_no ");
            strSql.Append(") AS T2  ");

            if (!string.IsNullOrEmpty(strWhere.Trim()))
            {
                strSql.Append(" WHERE " + strWhere);
            }
            strSql.Append(" ) As TT  ");
            strSql.AppendFormat(" WHERE TT.Row between {0} and {1}", startIndex, endIndex);
            return SqlHelper.ExecuteSql(strSql.ToString());
        }

        /// <summary>
        /// 取得当时有效的单价
        /// </summary>
        /// <param name="prd_no"></param>
        /// <returns></returns>
        public List<string> GetValidUps(string prd_no) 
        {
            List<string> res = new List<string>();
            StringBuilder strSql = new StringBuilder();
            strSql.Append(" select ");
            strSql.Append(" prdt_wp_hfup.up_no, prdt_wp_hfup.dep_no, prdt_wp_hfup.cus_no,   ");
            strSql.Append(" convert(varchar(100), prdt_wp_hfup.start_dd, 111) as start_dd, convert(varchar(100), prdt_wp_hfup.end_dd, 111) as end_dd,   ");
            strSql.Append(" prdt_wp_hfup.prd_no,  ");
            strSql.Append(" prdt_wp_hfup.n_man, convert(varchar(100), prdt_wp_hfup.n_dd, 111) as n_dd,   ");
            strSql.Append(" prdt_wp_hfup.e_man, convert(varchar(100), prdt_wp_hfup.e_dd, 111) as e_dd    ");
            strSql.Append(" from prdt_wp_hfup  ");
            strSql.Append(" where prd_no ='" + prd_no + "' and  DATEDIFF(dd, getDate(),start_dd) <= 0   and DATEDIFF(dd, getDate(),end_dd)  >= 0 ");

            DataTable dt = SqlHelper.ExecuteSql(strSql.ToString());
            foreach (DataRow dr in dt.Rows)
            {
                res.Add(dr["up_no"].ToString());
            }
            return res;
        }
    }
}
