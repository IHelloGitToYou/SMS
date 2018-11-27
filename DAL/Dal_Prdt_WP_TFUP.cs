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
    public class Dal_Prdt_WP_TFUP
    {
        /// <summary>
        /// 增加一条数据
        /// </summary>
        public bool Add(Model_Prdt_WP_TFUP model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into prdt_wp_tfup(");
            strSql.Append("prd_no,wp_no,up_pic,up_pair");
            strSql.Append(") values (");
            strSql.Append(",@prd_no,@wp_no,@up_pic,@up_pair");
            strSql.Append(") ");

            SqlParameter[] parameters = {  
                        	SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar,-1 , model.prd_no ) ,            
                        	SqlHelper.MakeParamYao("@wp_no", SqlDbType.VarChar,-1 , model.wp_no ) ,            
                        	SqlHelper.MakeParamYao("@up_pic", SqlDbType.Decimal , model.up_pic ) ,            
                        	SqlHelper.MakeParamYao("@up_pair", SqlDbType.Decimal , model.up_pair )             
              
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

        public SqlCommand AddCmd(Model_Prdt_WP_TFUP model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into prdt_wp_tfup(");
            strSql.Append("up_no,prd_no,wp_no,up_pic,up_pair ");
            strSql.Append(") values (");
            strSql.Append(" @up_no,@prd_no,@wp_no,@up_pic,@up_pair");
            strSql.Append(") ");

            SqlParameter[] parameters = {  
                            SqlHelper.MakeParamYao("@up_no", SqlDbType.Int , model.up_no ) ,           
                        	SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar,-1 , model.prd_no ) ,            
                        	SqlHelper.MakeParamYao("@wp_no", SqlDbType.VarChar,-1 , model.wp_no ) ,            
                        	SqlHelper.MakeParamYao("@up_pic", SqlDbType.Decimal , model.up_pic ) ,            
                        	SqlHelper.MakeParamYao("@up_pair", SqlDbType.Decimal , model.up_pair )             
              
            };
            SqlCommand cmd =  new SqlCommand(strSql.ToString());
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
        /// 更新一条数据
        /// </summary>
        public bool Update(Model_Prdt_WP_TFUP model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("update prdt_wp_tfup set ");

            strSql.Append(" prd_no = @prd_no , ");
            strSql.Append(" wp_no = @wp_no , ");
            strSql.Append(" up_pic = @up_pic , ");
            strSql.Append(" up_pair = @up_pair  ");
            strSql.Append(" where up_no=@up_no  ");

            SqlParameter[] parameters = {
			            SqlHelper.MakeParamYao("@up_no", SqlDbType.Int,-1 , model.up_no ) ,            
                        SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar,-1 , model.prd_no ) ,            
                        SqlHelper.MakeParamYao("@wp_no", SqlDbType.VarChar,-1 , model.wp_no ) ,            
                        SqlHelper.MakeParamYao("@up_pic", SqlDbType.Decimal , model.up_pic ) ,            
                        SqlHelper.MakeParamYao("@up_pair", SqlDbType.Decimal , model.up_pair )             
              
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
        public bool Delete(int up_no)
        {

            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from prdt_wp_tfup ");
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

        public SqlCommand DeleteCmd(int up_no)
        {

            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from prdt_wp_tfup ");
            strSql.Append(" where up_no=" + up_no + " ");

            return new SqlCommand(strSql.ToString());
        }
    }
}
