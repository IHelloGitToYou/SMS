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
    public class Dal_Prdt_WP
    {
        public bool Exists(string prd_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from prdt_wp");
            strSql.Append(" where ");
            strSql.Append(" prd_no = @prd_no    ");
          
            SqlParameter[] parameters = {
					new SqlParameter("@prd_no", SqlDbType.VarChar,40)
				 		};
            parameters[0].Value = prd_no;

            return ((int)SqlHelper.ExecuteScalar(strSql.ToString(), parameters)) <= 0 ? false : true;
        }


        /// <summary>
        /// 新建工序单价的表身
        /// </summary>
        /// <param name="hfModels"></param>
        /// <param name="tfModels"></param>
        /// <returns></returns>
        public bool AddWPUP(Model_Prdt_WP_HFUP hfModel, List<Model_Prdt_WP_TFUP> tfModels)
        {
            //Dal_Prdt_WP_HFUP dalHF = new Dal_Prdt_WP_HFUP();
            Dal_Prdt_WP_TFUP dalTF = new Dal_Prdt_WP_TFUP();

            List<SqlCommand> Cmds = new List<SqlCommand>();

            //Cmds.Add(dalHF.AddCmd(hfModel));
            foreach(Model_Prdt_WP_TFUP model in tfModels)
                Cmds.Add(dalTF.AddCmd(model));

            return SqlHelper.ExecuteTransWithCollections(Cmds);
        }

        public DataTable GetWPHFUP( string prd_no)
        {
            Dal_Prdt_WP_HFUP dalHF = new Dal_Prdt_WP_HFUP();
            return dalHF.GetListByPage(" prd_no = '" + prd_no + "'", "cus_no, start_dd", -1,-1);
        }


        /// <summary>
        /// 增加一条数据
        /// </summary>
        public SqlCommand AddCmd(Model_Prdt_WP model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into prdt_wp(");
            strSql.Append("prd_no,itm,wp_no,dep_no,name,pic_num,is_cutwp,is_pswp, is_size_control, wq_type, color_different_price, save_material_award, state");
            strSql.Append(") values (");
            strSql.Append("@prd_no,@itm,@wp_no,@dep_no,@name,@pic_num,@is_cutwp,@is_pswp, @is_size_control,@wq_type, @color_different_price, @save_material_award, @state");
            strSql.Append(") ");

            SqlParameter[] parameters = {
			    SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar,-1 , model.prd_no ) ,            
                SqlHelper.MakeParamYao("@itm", SqlDbType.Int,4 , model.itm ) ,            
                SqlHelper.MakeParamYao("@wp_no", SqlDbType.VarChar,-1 , model.wp_no ) ,            
                SqlHelper.MakeParamYao("@dep_no", SqlDbType.VarChar,-1 , model.dep_no ) ,            
                SqlHelper.MakeParamYao("@name", SqlDbType.VarChar,-1 , model.name ) ,            
                SqlHelper.MakeParamYao("@pic_num", SqlDbType.Int,4 , model.pic_num ) ,            
                SqlHelper.MakeParamYao("@is_cutwp", SqlDbType.VarChar,-1 , model.is_cutwp ) ,            
                SqlHelper.MakeParamYao("@is_pswp", SqlDbType.VarChar,-1 , model.is_pswp ) ,
                SqlHelper.MakeParamYao("@is_size_control", SqlDbType.VarChar,-1 , model.is_size_control),
                SqlHelper.MakeParamYao("@wq_type", SqlDbType.VarChar,-1 , model.wq_type),
                SqlHelper.MakeParamYao("@color_different_price", SqlDbType.VarChar, 5 , (model.color_different_price ? "true" : "false")),
                SqlHelper.MakeParamYao("@save_material_award", SqlDbType.VarChar, 5 , (model.save_material_award ? "true" : "false")),
                
                SqlHelper.MakeParamYao("@state", SqlDbType.VarChar,-1 , model.state )             
            };
            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);
            return cmd;
        }


        public bool Add(List<Model_Prdt_WP> models)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();
            foreach (Model_Prdt_WP m in models)
            {
                cmds.Add( AddCmd(m));
            }

            return SqlHelper.ExecuteTransWithCollections(cmds);
        }

        public List<SqlCommand> AddWPs_Cmd(List<Model_Prdt_WP> models)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();
            foreach (Model_Prdt_WP m in models)
            {
                cmds.Add(AddCmd(m));
            }

            return cmds;
        }

        public bool Update( string prd_no ,List<Model_Prdt_WP> models)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();
            cmds.Add( DeleteCmd(prd_no) );
            foreach (Model_Prdt_WP m in models)
            {
                cmds.Add(AddCmd(m));
            }
            return SqlHelper.ExecuteTransWithCollections(cmds);

        }
        ///// <summary>
        ///// 更新一条数据
        ///// </summary>
        //public SqlCommand UpdateCmd(Model_Prdt_WP model)
        //{
        //    StringBuilder strSql = new StringBuilder();
        //    strSql.Append("update prdt_wp set ");

        //    strSql.Append(" prd_no = @prd_no , ");
        //    strSql.Append(" itm = @itm , ");
        //    strSql.Append(" wp_no = @wp_no , ");
        //    strSql.Append(" dep_no = @dep_no , ");
        //    strSql.Append(" name = @name , ");
        //    strSql.Append(" pic_num = @pic_num , ");
        //    strSql.Append(" is_cutwp = @is_cutwp , ");
        //    strSql.Append(" wq_type = @wq_type , ");
        //    strSql.Append(" state = @state  ");
        //    strSql.Append(" where prd_no=@prd_no and wp_no=@wp_no  ");

        //    SqlParameter[] parameters = {
			     //       SqlHelper.MakeParamYao("@prd_no", SqlDbType.VarChar,-1 , model.prd_no ) ,            
        //                SqlHelper.MakeParamYao("@itm", SqlDbType.Int,4 , model.itm ) ,            
        //                SqlHelper.MakeParamYao("@wp_no", SqlDbType.VarChar,-1 , model.wp_no ) ,            
        //                SqlHelper.MakeParamYao("@dep_no", SqlDbType.VarChar,-1 , model.dep_no ) ,            
        //                SqlHelper.MakeParamYao("@name", SqlDbType.VarChar,-1 , model.name ) ,            
        //                SqlHelper.MakeParamYao("@pic_num", SqlDbType.Int,4 , model.pic_num ) ,            
        //                SqlHelper.MakeParamYao("@is_cutwp", SqlDbType.VarChar,-1 , model.is_cutwp ) ,
        //                SqlHelper.MakeParamYao("@wq_type", SqlDbType.VarChar,-1 , model.wq_type ) ,
        //                SqlHelper.MakeParamYao("@state", SqlDbType.VarChar,-1 , model.state )             
              
        //    };
        //    SqlCommand cmd = new SqlCommand(strSql.ToString());

        //    cmd.Parameters.AddRange(parameters);
        //    return cmd;
        //}


        /// <summary>
        /// 删除某一工序
        /// </summary>
        public bool Delete(string prd_no, string wp_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from prdt_wp ");
            strSql.Append(" where prd_no=@prd_no and wp_no=@wp_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@prd_no", SqlDbType.VarChar,40),
					new SqlParameter("@wp_no", SqlDbType.VarChar,40)			};
            parameters[0].Value = prd_no;
            parameters[1].Value = wp_no;


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
        /// 删除某一工序
        /// </summary>
        public bool Delete(string prd_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from prdt_wp ");
            strSql.Append(" where prd_no=@prd_no ");
            SqlParameter[] parameters = {
                    new SqlParameter("@prd_no", SqlDbType.VarChar,40)
                         };
            parameters[0].Value = prd_no;
            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);

            return SqlHelper.ExecuteTransWithCommand(cmd);
        }


        public SqlCommand DeleteCmd(string prd_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from prdt_wp ");
            strSql.Append(" where prd_no=@prd_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@prd_no", SqlDbType.VarChar,40) 
					 	};
            parameters[0].Value = prd_no;

            SqlCommand cmd = new SqlCommand(strSql.ToString());

            cmd.Parameters.AddRange(parameters);
            return cmd;
        }


        /// <summary>
        /// 获取记录总数
        /// </summary>
        public int GetRecordCount(string strWhere, bool SearchWithUp, List<string> up_nos)
        {
            StringBuilder strSql = new StringBuilder();

            strSql.Append("  select count(1) FROM ( ");
               
	        strSql.Append("      select * FROM (     ");
		    strSql.Append("          select T.*,P.name as prd_name, D.name as dep_name ");

            int idx = 0;
            if (SearchWithUp == true)
            {
                foreach (string no in up_nos)
                {
                   
                    strSql.Append(" ,up" + idx + ".up_pic as up_pic" + no +", up" + idx + ".up_pair as up_pair" + no );
                
                    ++idx;
                }
            }
		    strSql.Append("             from prdt_wp T ");
		    strSql.Append("          left join prdt P on P.prd_no = T.prd_no     ");   
		    strSql.Append("          left join deptWp D on D.dep_no = T.dep_no    ");

            if (SearchWithUp == true)
            {
                idx = 0;
                foreach (string no in up_nos)
                {
                    strSql.Append(" left join prdt_wp_tfup up" + idx + " on up" + idx + ".up_no = " + no);
                    ++idx;
                }
            }
	        strSql.Append("      ) As TT ");

            if (strWhere.Trim() != "")
            {
                strSql.Append("  where " + strWhere);
            }

            strSql.Append("  ) AS T   ");           

            object obj = SqlHelper.ExecuteScalar(strSql.ToString());
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
        public DataTable GetListByPage(string strWhere, string orderby, int startIndex, int endIndex, bool SearchWithUp, List<string> up_nos)
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
                strSql.Append("order by T.itm ");
            }
            strSql.Append(")AS Row, T.*,P.name as prd_name, D.name as dep_name  ");
            int idx = 0;
            if (SearchWithUp == true)
            {
                foreach (string no in up_nos)
                {
                    strSql.Append(" ,up" + idx + ".up_pic as up_pic" + no +", up" + idx + ".up_pair as up_pair" + no );
                    ++idx;
                }
            }
            strSql.Append(" from prdt_wp T ");
            strSql.Append(" left join prdt P  ");
            strSql.Append("     on P.prd_no = T.prd_no  ");
            strSql.Append(" left join deptWp D  ");
            strSql.Append("     on D.dep_no = T.dep_no ");
            if (SearchWithUp == true)
            {
                idx = 0;
                foreach (string no in up_nos)
                {
                    strSql.Append(" left join prdt_wp_tfup up" + idx + " on up" + idx + ".up_no = " + no + " and " + "up" + idx + ".wp_no = T.wp_no");
                    ++idx;
                }
            }

            strSql.Append(" ) AS T  ");


            if (!string.IsNullOrEmpty(strWhere.Trim()))
            {
                strSql.Append("  WHERE " + strWhere);
            }

            strSql.Append(" ");

            if (startIndex >= 0)
                strSql.AppendFormat(" WHERE T.Row between {0} and {1}", startIndex, endIndex);

            return SqlHelper.ExecuteSql(strSql.ToString());
        }


        public void SwitchColorDifferentPrice(string prd_no, string wp_no, bool Set)
        {
            string sql = "Update prdt_wp set color_different_price = '{2}' where prd_no='{0}' and wp_no='{1}'";
            SqlCommand Cmd = new SqlCommand();
            Cmd.CommandText = string.Format(sql, prd_no, wp_no, (Set ? "true" : "false"));
            SqlHelper.ExecuteNonQuery(Cmd);
        }

        public void SwitchSaveMaterialAward(string prd_no, string wp_no, bool Set)
        {
            string sql = "Update prdt_wp set save_material_award = '{2}' where prd_no='{0}' and wp_no='{1}'";
            SqlCommand Cmd = new SqlCommand();
            Cmd.CommandText = string.Format(sql, prd_no, wp_no, (Set ? "true" : "false"));
            SqlHelper.ExecuteNonQuery(Cmd);
        }

        public void SwitchSizeControl(string prd_no, string wp_no, bool Set)
        {
            string sql = "Update prdt_wp set is_size_control = '{2}' where prd_no='{0}' and wp_no='{1}'";
            SqlCommand Cmd = new SqlCommand();
            Cmd.CommandText = string.Format(sql, prd_no, wp_no, (Set ? "true" : "false"));
            SqlHelper.ExecuteNonQuery(Cmd);
        }
        
    }
}
