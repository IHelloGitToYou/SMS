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
    public class Dal_MFSO
    {
        #region 表头
        /// <summary>
        /// 是否存在该记录
        /// </summary>
        public bool Exists(string so_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select 1 from MF_SO");
            strSql.Append(" where so_no='"+ so_no + "' ");

            return SqlHelper.ExecuteSql(strSql.ToString()).Rows.Count >= 1 ? true : false;
        }

        public bool Exists(string so_no, string so_itm)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("select count(1) from TF_SO");
            strSql.Append(" where so_no='" + so_no + "' and itm =" + so_itm + " ");

            return SqlHelper.ExecuteSql(strSql.ToString()).Rows.Count >= 1 ? true : false;
        }


        /// <summary>
        /// 增加一条数据
        /// </summary>
        public SqlCommand Add(Model_MFSO model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into MF_SO(");
            strSql.Append("so_no,cus_no,so_dd,order_dd,finish,focus_finish,n_man,n_dd)");
            strSql.Append(" values (");
            strSql.Append("@so_no,@cus_no,@so_dd,@order_dd,@finish,@focus_finish,@n_man,@n_dd)");
            SqlParameter[] parameters = {
					new SqlParameter("@so_no", SqlDbType.VarChar,40),
					new SqlParameter("@cus_no", SqlDbType.VarChar,40),
					new SqlParameter("@so_dd", SqlDbType.DateTime),
					new SqlParameter("@order_dd", SqlDbType.DateTime),
					new SqlParameter("@finish", SqlDbType.VarChar,2),
					new SqlParameter("@focus_finish", SqlDbType.VarChar,2),
					new SqlParameter("@n_man", SqlDbType.VarChar,40),
					new SqlParameter("@n_dd", SqlDbType.DateTime) };

            parameters[0].Value = model.so_no;
            parameters[1].Value = model.cus_no;
            parameters[2].Value = model.so_dd;
            parameters[3].Value = model.order_dd;
            parameters[4].Value = model.finish;
            parameters[5].Value = model.focus_finish;
            parameters[6].Value = model.n_man;
            parameters[7].Value = DateTime.Now;


            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);

            return cmd;
            //int rows = SqlHelper.ExecuteNonQuery(new SqlCommand(strSql.ToString()), parameters);
            //if (rows > 0)
            //{
            //    return true;
            //}
            //else
            //{
            //    return false;
            //}
        }

        /// <summary>
        /// 更新一条数据
        /// </summary>
        public SqlCommand Update(Model_MFSO model)
        {

            
            StringBuilder strSql = new StringBuilder();
            strSql.Append("update MF_SO set ");
            strSql.Append("cus_no=@cus_no,");
            strSql.Append("so_dd=@so_dd,");
            strSql.Append("order_dd=@order_dd,");
            strSql.Append("finish=@finish,");
            strSql.Append("focus_finish=@focus_finish,");
             
            strSql.Append("e_man=@e_man,");
            strSql.Append("e_dd=@e_dd");
            strSql.Append(" where so_no=@so_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@cus_no", SqlDbType.VarChar,40),
					new SqlParameter("@so_dd", SqlDbType.DateTime),
					new SqlParameter("@order_dd", SqlDbType.DateTime),
					new SqlParameter("@finish", SqlDbType.VarChar,2),
					new SqlParameter("@focus_finish", SqlDbType.VarChar,2),
					 
					new SqlParameter("@e_man", SqlDbType.VarChar,40),
					new SqlParameter("@e_dd", SqlDbType.DateTime),
					new SqlParameter("@so_no", SqlDbType.VarChar,40)};
            parameters[0].Value = model.cus_no;
            parameters[1].Value = model.so_dd;
            parameters[2].Value = model.order_dd;
            parameters[3].Value = model.finish;
            parameters[4].Value = model.focus_finish;
        
            parameters[5].Value = model.e_man;
            parameters[6].Value = DateTime.Now;
            parameters[7].Value = model.so_no;


            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);

            return cmd;
            //int rows = SqlHelper.ExecuteNonQuery(new SqlCommand(strSql.ToString()), parameters);
            //if (rows > 0)
            //{
            //    return true;
            //}
            //else
            //{
            //    return false;
            //}
        }

        /// <summary>
        /// 删除单据
        /// </summary>
        /// <param name="so_no"></param>
        /// <returns></returns>
        public SqlCommand Delete(string so_no)
        {
            DataTable Dt = BodyGetList(" so_no = '" + so_no + "'");
            bool used = false;

            if(Dt.Rows.Count > 0)
                foreach (DataRow row in Dt.Rows)
                {
                    used = CheckRowUsed(row["so_no"].ToString(), Int32.Parse(row["itm"].ToString()));
                    if (used == true)
                        new Exception("不能删除这一行（“" + row["itm"].ToString()  + "”），因为后续工序数量已使用过了！");
                }
            else
                new Exception("Bug本单不存在，不需要删除！！！！");

            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from MF_SO ");
            strSql.Append(" where so_no=@so_no ");
            SqlParameter[] parameters = {
					new SqlParameter("@so_no", SqlDbType.VarChar,40)			};
            parameters[0].Value = so_no;

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);

            return cmd;
            //int rows = SqlHelper.ExecuteNonQuery(new SqlCommand(strSql.ToString()), parameters);
            //if (rows > 0)
            //{
            //    return true;
            //}
            //else
            //{
            //    return false;
            //}
        }

        /// <summary>
        /// 检查本单的货品有无，做过工序数量记录？
        /// </summary>
        /// <param name="so_no"></param>
        /// <param name="itm"></param>
        /// <returns></returns>
        public bool CheckRowUsed(string so_no, int itm)
        {
            string CheckSql = " select count(1) from WPQty_H " +
                "   where so_no='" + so_no + "' and so_itm = " + itm + "";

             return ((Int32)SqlHelper.ExecuteScalar(CheckSql, null)) > 0 ? true : false;
        }
        
        /// <summary>
        /// 分页获取数据列表
        /// </summary>
        public DataTable GetList(string strWhere, string orderby)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("SELECT * FROM ( ");
            strSql.Append("     select  ");
            strSql.Append("         C.name as cus_name,  ");
            strSql.Append("         case  when( MF_SO.focus_finish = 'Y' or MF_SO.finish = 'Y') then 'Y' else 'N' end as is_finish, ");
            //////  strSql.Append("         MF_SO.*  ");
            strSql.Append("         MF_SO.so_no, MF_SO.cus_no, convert(varchar(100), MF_SO.so_dd, 111) as so_dd, ");
            strSql.Append("         convert(varchar(100), MF_SO.order_dd, 111) as order_dd, MF_SO.finish, MF_SO.focus_finish,  ");
            strSql.Append("         MF_SO.n_man, convert(varchar(100), MF_SO.n_dd, 111) as n_dd,  ");
            strSql.Append("         MF_SO.e_man, convert(varchar(100), MF_SO.e_dd, 111) as e_dd   ");
            strSql.Append("     FROM MF_SO ");
            strSql.Append("     LEFT JOIN CUST C ON C.cus_no = MF_SO.cus_no  ");
            strSql.Append(" ) TT");
            
            if (!string.IsNullOrEmpty(strWhere.Trim()))
            {
                strSql.Append(" WHERE " + strWhere);
            }

             if (!string.IsNullOrEmpty(orderby.Trim()))
            {
                strSql.Append("  order by " + orderby + " ");
            }
            else
            {
                strSql.Append("order by so_dd desc");
            }

            
            return SqlHelper.ExecuteSql(strSql.ToString());
        }

        /////// <summary>
        /////// 获取记录总数
        /////// </summary>
        ////public int GetRecordCount(string strWhere, string orderby)
        ////{
        ////    StringBuilder strSql = new StringBuilder();
        ////    strSql.Append("SELECT count(1) FROM ( ");
        ////    strSql.Append(" select * from ( SELECT 
        ////    strSql.Append(   C.name as cus_name, case  when(MF_SO.focus_finish = 'Y' or MF_SO.finish = 'Y') then 'Y' ");
        ////    strSql.Append(" else 'N' end as is_finish, MF_SO.*  ");
        ////    strSql.Append("FROM MF_SO ");
        ////    strSql.Append(" LEFT JOIN CUST C ON C.cus_no = MF_SO.cus_no ) as T2 ");

        ////    if (!string.IsNullOrEmpty(strWhere.Trim()))
        ////    {
        ////        strSql.Append(" WHERE " + strWhere);
        ////    }
        ////    strSql.Append(" ) TT");

        ////    object obj = SqlHelper.ExecuteScalar(strSql.ToString());
        ////    if (obj == null)
        ////    {
        ////        return 0;
        ////    }
        ////    else
        ////    {
        ////        return Convert.ToInt32(obj);
        ////    }
        ////}

        /// <summary>
        /// 获得数据列表
        /// </summary>
        public DataTable HeadGetList(string strWhere)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append(" select * from ( ");
            strSql.Append("select C.name as cus_name, ");
            strSql.Append("    MF_SO.so_no, MF_SO.cus_no, convert(varchar(100), MF_SO.so_dd, 111) as so_dd,  ");
            strSql.Append("    convert(varchar(100), MF_SO.order_dd, 111) as order_dd, MF_SO.finish, MF_SO.focus_finish, MF_SO.n_man,  ");
            strSql.Append("    convert(varchar(100), MF_SO.n_dd, 111) as n_dd,  ");
            strSql.Append("    MF_SO.e_man,  ");
            strSql.Append("    convert(varchar(100), MF_SO.e_dd, 111) as e_dd   ");
            strSql.Append("    ,case  when(MF_SO.focus_finish = 'Y' or MF_SO.finish = 'Y') then 'Y' ");
            strSql.Append("         else 'N' end as is_finish  ");
            strSql.Append(" FROM MF_SO ");

            strSql.Append("  LEFT JOIN CUST C ON C.cus_no = MF_SO.cus_no  ");
            strSql.Append("  ) AS T ");

            if (strWhere.Trim() != "")
            {
                strSql.Append(" where " + strWhere);
            }
            return SqlHelper.ExecuteSql(strSql.ToString());
        }


        #endregion 表头



        #region 表身
        /// <summary>
        /// 增加一条数据
        /// </summary>
        public SqlCommand BodyAdd(Model_TFSO model)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("insert into TF_SO(");
            strSql.Append("so_no,itm,prd_no,qty,qty_finish,rem)");
            strSql.Append(" values (");
            strSql.Append("@so_no,@itm,@prd_no,@qty,@qty_finish,@rem)");
            SqlParameter[] parameters = {
					new SqlParameter("@so_no", SqlDbType.VarChar,40),
					new SqlParameter("@itm", SqlDbType.Int,4),
					new SqlParameter("@prd_no", SqlDbType.VarChar,40),
					new SqlParameter("@qty", SqlDbType.Decimal,9),
					new SqlParameter("@qty_finish", SqlDbType.Decimal,9),
					new SqlParameter("@rem", SqlDbType.NText)};
            parameters[0].Value = model.so_no;
            parameters[1].Value = model.itm;
            parameters[2].Value = model.prd_no;
            parameters[3].Value = model.qty;
            parameters[4].Value = 0;
            parameters[5].Value = model.rem;

            SqlCommand cmd = new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);

            return cmd;
        }
        ///// <summary>
        ///// 更新一条数据
        ///// </summary>
        //public SqlCommand BodyUpdate(Model_TFSO model)
        //{
        //    StringBuilder strSql = new StringBuilder();
        //    strSql.Append("update TF_SO set ");
        //    strSql.Append("prd_no=@prd_no,");
        //    strSql.Append("qty=@qty,");
        //    strSql.Append("qty_finish=@qty_finish,");
        //    strSql.Append("rem=@rem");
        //    strSql.Append(" where so_no=@so_no and itm=@itm ");
        //    SqlParameter[] parameters = {
        //            new SqlParameter("@prd_no", SqlDbType.VarChar,40),
        //            new SqlParameter("@qty", SqlDbType.Decimal,9),
        //            new SqlParameter("@qty_finish", SqlDbType.Decimal,9),
        //            new SqlParameter("@rem", SqlDbType.NText),
        //            new SqlParameter("@so_no", SqlDbType.VarChar,20),
        //            new SqlParameter("@itm", SqlDbType.Int,4)};
        //    parameters[0].Value = model.prd_no;
        //    parameters[1].Value = model.qty;
        //    parameters[2].Value = model.qty_finish;
        //    parameters[3].Value = model.rem;
        //    parameters[4].Value = model.so_no;
        //    parameters[5].Value = model.itm;

        //    SqlCommand cmd = new SqlCommand(strSql.ToString());
        //    cmd.Parameters.AddRange(parameters);

        //    return cmd;
        //}

        /// 删除一条数据
        /// </summary>
        public SqlCommand BodyDelete(string so_no)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("delete from TF_SO ");
            strSql.Append(" where so_no=@so_no  ");
            SqlParameter[] parameters = {
					new SqlParameter("@so_no", SqlDbType.VarChar,40) 
					 	};
            parameters[0].Value = so_no;

            SqlCommand cmd =new SqlCommand(strSql.ToString());
            cmd.Parameters.AddRange(parameters);

            return cmd;
        }


        /// <summary>
        /// 　14.11.9 增加标志：有无后续计时数据录入？
        /// </summary>
        /// <param name="strWhere"></param>
        /// <returns></returns>
        public DataTable BodyGetList(string strWhere)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.AppendLine("select P.name as prd_name, so_no,itm, itm as old_itm, TF_SO.prd_no,qty,qty_finish,TF_SO.rem, ");
            strSql.AppendLine("  (select count(1) from WPQty_H where WPQty_H.so_no=TF_SO.so_no and WPQty_H.so_itm =TF_SO.itm)  as jx_cnt  ");
            strSql.AppendLine(" FROM TF_SO ");

            strSql.AppendLine("  LEFT JOIN PRDT P ON P.prd_no = TF_SO.prd_no  ");

            if (strWhere.Trim() != "")
            {
                strSql.AppendLine(" where " + strWhere);
            }
            return SqlHelper.ExecuteSql(strSql.ToString());
        }

        #endregion 表身

        private SqlCommand UpdateWpQtySoItm(string so_no, int OldItm, int NewItm)
        {
            string sqlStr = "update WPQty_H set so_itm = " + NewItm + " where so_no = '" + so_no + "' and so_itm =" + OldItm;

            return new SqlCommand(sqlStr);
        }


        public bool TableAdd(Model_MFSO model, List<Model_TFSO> TModels)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();

            cmds.Add(Add(model));
            foreach(Model_TFSO m in TModels)
            {
                cmds.Add( BodyAdd(m));
            }

            return SqlHelper.ExecuteTransWithCollections(cmds);
        }

        public bool TableUpdate(Model_MFSO model, List<Model_TFSO> TModels)
        {
            List<SqlCommand> cmds = new List<SqlCommand>();
            cmds.Add(Update(model));

            cmds.Add(BodyDelete(model.so_no));

            foreach(Model_TFSO m in TModels)
            {
                //更新行次！
                if (m.itm != m.olditm)
                {
                    cmds.Add( UpdateWpQtySoItm(m.so_no, m.olditm, m.itm));
                }

                cmds.Add( BodyAdd(m));
            }

            return SqlHelper.ExecuteTransWithCollections(cmds);
        }

        public bool TableDelete(string so_no)
        {
          
            List<SqlCommand> cmds = new List<SqlCommand>();
            cmds.Add(Delete(so_no));
            cmds.Add(BodyDelete(so_no));

            return SqlHelper.ExecuteTransWithCollections(cmds);
        }


        /// <summary>
        /// 检测是否使用过
        /// </summary>
        /// <returns></returns>
        public bool CheckUsed(string so_no)
        {
            if (SqlHelper.ExecuteSql("select so_no from WPQty_H where so_no = '" + so_no + "'").Rows.Count > 0)
            {
                return true;
            }

            return false;
        }


        public bool CheckUsed(string so_no, string prd_no)
        {
            if (SqlHelper.ExecuteSql("select so_no from WPQty_H where so_no = '" + so_no + "' and prd_no = '" + prd_no + "'").Rows.Count > 0)
            {
                return true;
            }

            return false;
        }



        /// <summary>
        /// 分页获取数据列表
        /// </summary>
        public DataTable GetMF_WithTF(string strWhere, string orderby, int startIndex, int endIndex)
        {
            StringBuilder strSql = new StringBuilder();
            strSql.Append("SELECT * FROM ( ");
            strSql.Append(" select * from ( SELECT ROW_NUMBER() OVER (");
            if (!string.IsNullOrEmpty(orderby.Trim()))
            {
                strSql.Append("order by MF_SO." + orderby + " desc");
            }
            else
            {
                strSql.Append("order by MF_SO.so_dd desc");
            }
            strSql.Append(")AS Row,  C.name as cus_name, case  when(MF_SO.focus_finish = 'Y' or MF_SO.finish = 'Y') then 'Y' ");
            strSql.Append(" else 'N' end as is_finish, ");
            strSql.Append("    MF_SO.so_no, MF_SO.cus_no, convert(varchar(100), MF_SO.so_dd, 111) as so_dd,  ");
            strSql.Append("    convert(varchar(100), MF_SO.order_dd, 111) as order_dd, MF_SO.finish, MF_SO.focus_finish, MF_SO.n_man,  ");
            strSql.Append("    convert(varchar(100), MF_SO.n_dd, 111) as n_dd,  ");
            strSql.Append("    MF_SO.e_man,  ");
            strSql.Append("    convert(varchar(100), MF_SO.e_dd, 111) as e_dd   ");
            strSql.Append("        ,TF.itm, TF.prd_no  FROM MF_SO ");
            strSql.Append(" LEFT JOIN CUST C ON C.cus_no = MF_SO.cus_no LEFT JOIN TF_SO TF on TF.so_no = MF_SO.so_no   ) AS T2 ");

            if (!string.IsNullOrEmpty(strWhere.Trim()))
            {
                strSql.Append(" WHERE " + strWhere);
            }
            strSql.Append(" ) TT");

            if (startIndex >= 0)
                strSql.AppendFormat(" WHERE T.Row between {0} and {1}", startIndex, endIndex);


            return SqlHelper.ExecuteSql(strSql.ToString());
        }

         
    }
}
